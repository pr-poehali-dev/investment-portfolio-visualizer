import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const BCS_API_URL = 'https://functions.poehali.dev/7d241d89-1faa-4c1a-8359-7cd0c1866374';

interface BcsConnectProps {
  onSuccess: (rawPortfolio: unknown) => void;
}

const BcsConnect = ({ onSuccess }: BcsConnectProps) => {
  const [refreshToken, setRefreshToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    const token = refreshToken.trim();
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(BCS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      });

      const data = await response.json();

      if (response.ok && data.portfolio !== undefined) {
        localStorage.setItem('bcsRefreshToken', token);
        onSuccess(data.portfolio);
        toast({
          title: 'Портфель загружен',
          description: 'Данные из БКС успешно получены',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка подключения',
          description: data.error || 'Проверьте правильность токена',
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
    <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <Icon name="Link" size={16} className="text-white" />
          </div>
          Подключить БКС Брокер
        </CardTitle>
        <CardDescription>
          Загрузите реальные данные вашего портфеля напрямую из БКС
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bcs-token">Refresh Token из БКС</Label>
          <Textarea
            id="bcs-token"
            placeholder="Вставьте ваш refresh token..."
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            rows={3}
            className="font-mono text-xs resize-none bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700"
        >
          <Icon name={showHint ? 'ChevronUp' : 'ChevronDown'} size={14} />
          Как получить токен?
        </button>

        {showHint && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 space-y-1.5">
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
              <li>Войдите в <strong>be.broker.ru</strong></li>
              <li>Откройте инструменты разработчика <strong>F12</strong></li>
              <li>Перейдите во вкладку <strong>Application → Local Storage</strong></li>
              <li>Найдите ключ <code className="bg-blue-100 px-1 rounded">refresh_token</code></li>
              <li>Скопируйте значение и вставьте выше</li>
            </ol>
          </div>
        )}

        <Button
          onClick={handleConnect}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
          disabled={loading || !refreshToken.trim()}
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Загружаем портфель...
            </>
          ) : (
            <>
              <Icon name="Download" size={16} className="mr-2" />
              Загрузить портфель из БКС
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BcsConnect;
