import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/4e1a1633-f163-4ca1-aae7-606612396d25';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}?action=forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        if (data.reset_token) {
          setResetToken(data.reset_token);
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Проверьте почту</CardTitle>
            <CardDescription>
              Если email <strong>{email}</strong> зарегистрирован, вы получите ссылку для сброса пароля.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resetToken && (
              <div className="rounded-md bg-muted p-4 text-sm">
                <p className="font-medium mb-2">Ссылка для сброса пароля:</p>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="text-primary underline break-all"
                >
                  Сбросить пароль
                </Link>
              </div>
            )}
            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Вернуться ко входу
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Сброс пароля</CardTitle>
          <CardDescription>
            Введите email — мы пришлём ссылку для создания нового пароля.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить ссылку'}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                Вернуться ко входу
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
