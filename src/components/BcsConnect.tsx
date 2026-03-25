import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { setRefreshToken, fetchBcsPortfolio } from '@/lib/bcsToken';

interface BcsConnectProps {
  onSuccess: (rawPortfolio: unknown) => void;
}

const BcsConnect = ({ onSuccess }: BcsConnectProps) => {
  const [refreshToken, setRefreshTokenState] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    const token = refreshToken.trim();
    if (!token) return;

    setLoading(true);
    try {
      setRefreshToken(token);
      const portfolio = await fetchBcsPortfolio();
      onSuccess(portfolio);
      toast({
        title: 'Портфель загружен',
        description: 'Данные из БКС успешно получены',
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Проверьте правильность токена';
      toast({
        variant: 'destructive',
        title: 'Ошибка подключения',
        description: msg,
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
            onChange={(e) => setRefreshTokenState(e.target.value)}
            rows={3}
            className="font-mono text-xs resize-none bg-white"
          />
        </div>



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