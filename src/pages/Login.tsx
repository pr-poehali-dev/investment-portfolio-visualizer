import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const action = isLogin ? 'login' : 'register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(
        `https://functions.poehali.dev/4e1a1633-f163-4ca1-aae7-606612396d25?action=${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: isLogin ? 'Вход выполнен' : 'Регистрация успешна',
          description: `Добро пожаловать, ${data.user.name}!`,
        });

        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
        });
      }
    } catch (error) {
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
            <CardTitle>{isLogin ? 'Вход в систему' : 'Регистрация'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Войдите в свой аккаунт для доступа к портфелю' 
                : 'Создайте аккаунт для начала работы'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Минимум 6 символов
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={16} className="mr-2" />
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              >
                {isLogin 
                  ? 'Нет аккаунта? Зарегистрируйтесь' 
                  : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ваши данные защищены и не передаются третьим лицам
        </p>
      </div>
    </div>
  );
};

export default Login;
