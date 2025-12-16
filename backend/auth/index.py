import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес: Регистрация и авторизация пользователей
    Args: event - dict с httpMethod, body, headers
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с данными пользователя или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if path == 'register':
            return register_user(body_data)
        elif path == 'login':
            return login_user(body_data)
        elif path == 'logout':
            token = event.get('headers', {}).get('x-auth-token', '')
            return logout_user(token)
    
    if method == 'GET' and path == 'verify':
        token = event.get('headers', {}).get('x-auth-token', '')
        return verify_token(token)
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }

def register_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    
    if not email or not password or not name:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Все поля обязательны'}),
            'isBase64Encoded': False
        }
    
    if len(password) < 6:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Email уже зарегистрирован'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            cur.execute(
                "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, email, name, created_at",
                (email, password_hash, name)
            )
            user = cur.fetchone()
            
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name']
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def login_user(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Email и пароль обязательны'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            password_hash = hash_password(password)
            cur.execute(
                "SELECT id, email, name FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name']
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def verify_token(token: str) -> Dict[str, Any]:
    if not token:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.email, u.name 
                FROM users u
                JOIN sessions s ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Токен недействителен'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name']
                    }
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def logout_user(token: str) -> Dict[str, Any]:
    if not token:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Токен не предоставлен'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Выход выполнен успешно'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()
