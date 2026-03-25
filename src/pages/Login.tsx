import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [refreshToken, setRefreshToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('bcsRefreshToken')) {
      navigate('/', { replace: true });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = refreshToken.trim();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/7d241d89-1faa-4c1a-8359-7cd0c1866374',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: token }),
        }
      );

      const data = await response.json();

      if (response.ok && data.positions !== undefined) {
        localStorage.setItem('bcsRefreshToken', token);
        window.dispatchEvent(new Event('storage'));
        navigate('/', { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка авторизации',
          description: data.error || 'Неверный или истёкший токен',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 mb-4">
            <Icon name="TrendingUp" size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            InvestTracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Ваш персональный трекер инвестиций
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Key" size={20} />
              Подключение БКС
            </CardTitle>
            <CardDescription>
              Введите refresh token из личного кабинета БКС Брокер для загрузки портфеля
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Refresh Token</Label>
                <Textarea
                  id="token"
                  placeholder="Вставьте ваш refresh token из БКС..."
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  required
                  rows={4}
                  className="font-mono text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 space-y-1">
                <p className="font-semibold flex items-center gap-2">
                  <Icon name="Info" size={14} />
                  Как получить токен?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
                  <li>Войдите в личный кабинет be.broker.ru</li>
                  <li>Откройте инструменты разработчика (F12)</li>
                  <li>Перейдите в Application → Local Storage</li>
                  <li>Найдите ключ <code className="bg-blue-100 px-1 rounded">refresh_token</code> и скопируйте значение</li>
                </ol>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                disabled={loading || !refreshToken.trim()}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Проверяем токен...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Войти и загрузить портфель
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Токен используется только для чтения данных и нигде не сохраняется
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
