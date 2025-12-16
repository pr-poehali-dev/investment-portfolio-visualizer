import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def verify_user(token: str) -> int:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id 
                FROM users u
                JOIN sessions s ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            user = cur.fetchone()
            return user['id'] if user else None
    finally:
        conn.close()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес: Управление портфелем пользователя - получение и сохранение активов
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с данными портфеля или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('x-auth-token', '')
    user_id = verify_user(token)
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Необходима авторизация'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        return get_portfolio(user_id)
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        return add_position(user_id, body_data)
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }

def get_portfolio(user_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                    ticker, name, shares, avg_price, current_price, asset_type,
                    (shares * current_price) as value,
                    ((current_price - avg_price) / avg_price * 100) as change_percent
                FROM portfolios 
                WHERE user_id = %s
                ORDER BY value DESC
                """,
                (user_id,)
            )
            positions = cur.fetchall()
            
            cur.execute(
                """
                SELECT ticker, amount, payment_date as date, dividend_type as type
                FROM dividends 
                WHERE user_id = %s
                ORDER BY payment_date DESC
                LIMIT 20
                """,
                (user_id,)
            )
            dividends = cur.fetchall()
            
            total_value = sum(float(p['value']) for p in positions)
            
            monthly_dividends = 0
            for div in dividends:
                if isinstance(div['date'], str):
                    div_date = datetime.strptime(div['date'], '%Y-%m-%d')
                else:
                    div_date = div['date']
                
                if (datetime.now() - div_date).days <= 30:
                    monthly_dividends += float(div['amount'])
            
            result_positions = []
            for p in positions:
                result_positions.append({
                    'ticker': p['ticker'],
                    'name': p['name'],
                    'shares': p['shares'],
                    'avgPrice': float(p['avg_price']),
                    'currentPrice': float(p['current_price']),
                    'value': float(p['value']),
                    'changePercent': float(p['change_percent']),
                    'dividendYield': 0,
                    'type': p['asset_type']
                })
            
            result_dividends = []
            for d in dividends:
                date_str = d['date'].strftime('%Y-%m-%d') if hasattr(d['date'], 'strftime') else str(d['date'])
                result_dividends.append({
                    'date': date_str,
                    'ticker': d['ticker'],
                    'amount': float(d['amount']),
                    'type': d['type']
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'totalValue': total_value,
                    'dailyChange': 0,
                    'dailyChangePercent': 0,
                    'monthlyDividends': monthly_dividends,
                    'yearlyDividends': monthly_dividends * 12,
                    'positions': result_positions,
                    'dividends': result_dividends
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def add_position(user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO portfolios 
                (user_id, ticker, name, shares, avg_price, current_price, asset_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (user_id, ticker) DO UPDATE
                SET shares = portfolios.shares + EXCLUDED.shares,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (
                    user_id,
                    data['ticker'],
                    data['name'],
                    data['shares'],
                    data['avgPrice'],
                    data['currentPrice'],
                    data['type']
                )
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Позиция добавлена'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
