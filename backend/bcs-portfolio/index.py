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


def transform_portfolio(raw) -> dict:
    """Преобразует ответ БКС API (список позиций) в формат приложения"""
    positions = []
    total_value = 0.0

    items = raw if isinstance(raw, list) else raw.get('positions', raw.get('items', raw.get('data', [])))

    for item in items:
        upper_type = item.get('upperType', '')
        # Пропускаем денежные позиции
        if upper_type == 'CURRENCY':
            continue

        ticker = item.get('ticker') or item.get('symbol') or ''
        name = item.get('displayName') or item.get('name') or ticker
        shares = float(item.get('quantity') or 0)
        avg_price = float(item.get('balancePrice') or item.get('avgPrice') or 0)
        current_price = float(item.get('currentPrice') or 0)
        value = float(item.get('currentValueRub') or item.get('currentValue') or (shares * current_price) or 0)
        change_pct = float(item.get('unrealizedPercentPL') or item.get('dailyPercentPL') or 0)

        instrument_type = item.get('instrumentType', '').upper()
        if instrument_type in ('BOND', 'BONDS'):
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
    Принимает refreshToken или accessToken.
    Если передан accessToken — использует его напрямую.
    Если только refreshToken — обменивает на accessToken и возвращает его клиенту вместе с портфелем.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body_str = event.get('body') or '{}'
    try:
        body = json.loads(body_str)
    except Exception:
        body = {}

    access_token = body.get('accessToken', '').strip()
    refresh_token = body.get('refreshToken', '').strip()
    new_access_token = None

    if not access_token and not refresh_token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
            'body': json.dumps({'error': 'Не передан токен'}),
        }

    if not access_token:
        try:
            access_token = get_access_token(refresh_token)
            new_access_token = access_token
            print('[bcs-portfolio] got access_token ok')
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
        if isinstance(raw_portfolio, list) and raw_portfolio:
            print(f'[bcs-portfolio] portfolio is list, first item keys: {list(raw_portfolio[0].keys())}')
            print(f'[bcs-portfolio] first item: {raw_portfolio[0]}')
        elif isinstance(raw_portfolio, dict):
            print(f'[bcs-portfolio] portfolio is dict, keys: {list(raw_portfolio.keys())}')
            items = raw_portfolio.get('positions') or raw_portfolio.get('items') or raw_portfolio.get('data') or []
            if items:
                print(f'[bcs-portfolio] first item keys: {list(items[0].keys())}')
                print(f'[bcs-portfolio] first item: {items[0]}')
        print(f'[bcs-portfolio] got portfolio ok')
    except urllib.error.HTTPError as e:
        try:
            error_body = e.read().decode('utf-8')
        except Exception:
            error_body = str(e)
        print(f'[bcs-portfolio] portfolio HTTPError {e.code}: {error_body}')
        # access token протух — сообщаем клиенту чтобы переобменял
        if e.code == 401:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
                'body': json.dumps({'error': 'access_token_expired'}),
            }
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
    result = {'portfolio': portfolio}
    if new_access_token:
        result['accessToken'] = new_access_token

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', **CORS_HEADERS},
        'body': json.dumps(result),
    }