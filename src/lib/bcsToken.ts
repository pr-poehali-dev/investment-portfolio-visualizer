const REFRESH_KEY = 'bcsRefreshToken';
const ACCESS_KEY = 'bcsAccessToken';
const ACCESS_EXPIRES_KEY = 'bcsAccessTokenExpiresAt';
const BCS_API_URL = 'https://functions.poehali.dev/7d241d89-1faa-4c1a-8359-7cd0c1866374';

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY) || '';
export const setRefreshToken = (t: string) => localStorage.setItem(REFRESH_KEY, t);
export const clearBcsTokens = () => {
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_KEY);
};

const getStoredAccessToken = (): string => {
  const token = localStorage.getItem(ACCESS_KEY);
  const expiresAt = Number(localStorage.getItem(ACCESS_EXPIRES_KEY) || 0);
  if (token && Date.now() < expiresAt) return token;
  return '';
};

const storeAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_KEY, token);
  localStorage.setItem(ACCESS_EXPIRES_KEY, String(Date.now() + 23 * 60 * 60 * 1000));
};

export const fetchBcsPortfolio = async (): Promise<unknown> => {
  const accessToken = getStoredAccessToken();
  const refreshToken = getRefreshToken();

  if (!refreshToken) throw new Error('no_refresh_token');

  const body = accessToken
    ? { accessToken }
    : { refreshToken };

  const response = await fetch(BCS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // access token протух — обменяем refresh и повторим
  if (response.status === 401 && data.error === 'access_token_expired' && !('refreshToken' in body)) {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
    return fetchBcsPortfolio();
  }

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка загрузки портфеля');
  }

  if (data.accessToken) {
    storeAccessToken(data.accessToken);
  }

  return data.portfolio;
};