import json
import urllib.request
import urllib.parse
import urllib.error

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Refresh-Token',
}

def get_access_token(refresh_token: str) -> str:
    """Обменивает refresh token на access token через Keycloak БКС"""
    url = 'https://be.broker.ru/trade-api-keycloak/realms/tradeapi/protocol/openid-connect/token'
    data = urllib.parse.urlencode({
        'client_id': 'trade-api-read',
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }).encode('utf-8')

    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')

    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode('utf-8'))
    
    return result['access_token']


def get_bcs_portfolio(access_token: str) -> dict:
    """Получает портфель из БКС API"""
    url = 'https://be.broker.ru/trade-api-bff-portfolio/api/v1/portfolio'
    req = urllib.request.Request(url, method='GET')
    req.add_header('Authorization', f'Bearer {access_token}')

    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode('utf-8'))


def transform_portfolio(raw: dict) -> dict:
    """Преобразует ответ БКС API в формат приложения"""
    positions = []
    total_value = 0.0

    items = raw if isinstance(raw, list) else raw.get('positions', raw.get('items', raw.get('data', [])))

    for item in items:
        ticker = item.get('ticker') or item.get('symbol') or item.get('isin') or ''
        name = item.get('name') or item.get('shortName') or item.get('instrumentName') or ticker
        shares = float(item.get('quantity') or item.get('qty') or item.get('balance') or 0)
        avg_price = float(item.get('avgPrice') or item.get('averagePrice') or item.get('costPrice') or 0)
        current_price = float(item.get('currentPrice') or item.get('lastPrice') or item.get('price') or 0)
        value = float(item.get('value') or item.get('marketValue') or (shares * current_price) or 0)
        change_pct = float(item.get('yield') or item.get('pnlPercent') or item.get('changePercent') or 0)
        asset_type = item.get('type') or item.get('instrumentType') or 'stock'

        if asset_type.lower() in ('bond', 'облигация', 'bonds'):
            asset_type = 'bond'
        else:
            asset_type = 'stock'

        total_value += value
        positions.append({
            'ticker': ticker,
            'name': name,
            'shares': shares,
            'avgPrice': avg_price,
            'currentPrice': current_price,
            'value': value,
            'changePercent': change_pct,
            'dividendYield': 0,
            'type': asset_type,
        })

    positions = [p for p in positions if p['shares'] > 0]
    positions.sort(key=lambda x: x['value'], reverse=True)

    return {
        'totalValue': total_value,
        'dailyChange': 0,
        'dailyChangePercent': 0,
        'monthlyDividends': 0,
        'yearlyDividends': 0,
        'positions': positions,
        'dividends': [],
        'rawResponse': raw,
    }


def handler(event: dict, context) -> dict:
    """
    Получает портфель из БКС Брокер по refresh токену пользователя.
    Сначала обменивает refresh token на access token, затем запрашивает портфель.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers', {}) or {}
    body_str = event.get('body') or '{}'
    try:
        body = json.loads(body_str)
    except Exception:
        body = {}

    refresh_token = (
        headers.get('x-refresh-token') or
        body.get('refreshToken') or
        body.get('refresh_token') or
        (event.get('queryStringParameters') or {}).get('refreshToken', '')
    )

    if not refresh_token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Не передан refresh token'}),
        }

    try:
        access_token = get_access_token(refresh_token)
        print(f'[bcs-portfolio] got access_token ok')
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except Exception:
            error_body = str(e)
        print(f'[bcs-portfolio] keycloak HTTPError {e.code}: {error_body}')
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Неверный или истёкший refresh token', 'detail': error_body}),
        }
    except Exception as e:
        print(f'[bcs-portfolio] keycloak Exception: {e}')
        return {
            'statusCode': 502,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': f'Ошибка при получении токена: {e}'}),
        }

    try:
        raw_portfolio = get_bcs_portfolio(access_token)
        print(f'[bcs-portfolio] got portfolio ok, keys={list(raw_portfolio.keys()) if isinstance(raw_portfolio, dict) else type(raw_portfolio)}')
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except Exception:
            error_body = str(e)
        print(f'[bcs-portfolio] portfolio HTTPError {e.code}: {error_body}')
        return {
            'statusCode': 502,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Ошибка получения портфеля из БКС', 'detail': error_body}),
        }
    except Exception as e:
        print(f'[bcs-portfolio] portfolio Exception: {e}')
        return {
            'statusCode': 502,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': f'Ошибка при запросе портфеля: {e}'}),
        }

    portfolio = transform_portfolio(raw_portfolio)

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
        'body': json.dumps({'portfolio': portfolio}),
    }