import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import PortfolioTabs from '@/components/PortfolioTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Portfolio {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  monthlyDividends: number;
  yearlyDividends: number;
  positions: Array<{
    ticker: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    changePercent: number;
    dividendYield: number;
    type: string;
  }>;
  dividends: Array<{
    date: string;
    ticker: string;
    amount: number;
    type: string;
  }>;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/6df5f7f8-9676-496b-acad-da6e7fe578ff', {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка портфеля...</p>
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center animate-fade-in shadow-xl">
            <CardHeader>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Icon name="Briefcase" size={40} className="text-white" />
              </div>
              <CardTitle className="text-3xl">Ваш портфель пуст</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Начните отслеживать свои инвестиции, загрузив брокерский отчет
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center mb-3">
                    <Icon name="Upload" size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Загрузите отчет</h3>
                  <p className="text-sm text-muted-foreground">
                    Импортируйте данные из БКС
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                    <Icon name="BarChart3" size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Анализируйте</h3>
                  <p className="text-sm text-muted-foreground">
                    Отслеживайте доходность
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center mb-3">
                    <Icon name="TrendingUp" size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Принимайте решения</h3>
                  <p className="text-sm text-muted-foreground">
                    На основе данных
                  </p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
                onClick={() => setActiveTab('import')}
              >
                <Icon name="Upload" size={20} className="mr-2" />
                Импортировать портфель
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <DashboardStats 
          portfolio={portfolio} 
          formatCurrency={formatCurrency} 
          formatPercent={formatPercent} 
        />

        <PortfolioTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          portfolio={portfolio}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
        />
      </div>
    </div>
  );
};

export default Index;
