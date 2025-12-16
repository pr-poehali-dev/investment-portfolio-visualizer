import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      await fetch('https://functions.poehali.dev/4e1a1633-f163-4ca1-aae7-606612396d25?action=logout', {
        method: 'POST',
        headers: {
          'X-Auth-Token': token || '',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!',
    });
    
    navigate('/login');
  };
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              InvestTracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Icon name="Bell" size={18} />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Settings" size={18} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
                  <Icon name="User" size={18} className="mr-2" />
                  {user?.name || 'Профиль'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <Icon name="User" size={16} className="mr-2" />
                  Мой профиль
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настройки
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;