import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  changePercent: number;
  dividendYield: number;
  type: string;
}

interface Dividend {
  date: string;
  ticker: string;
  amount: number;
  type: string;
}

interface PortfolioTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  portfolio: {
    totalValue: number;
    positions: Position[];
    dividends: Dividend[];
  };
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

const PortfolioTabs = ({ activeTab, setActiveTab, portfolio, formatCurrency, formatPercent }: PortfolioTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
      <TabsList className="grid w-full grid-cols-7 mb-6 h-auto p-1 bg-white shadow-sm">
        <TabsTrigger value="home" className="flex items-center gap-2">
          <Icon name="Home" size={16} />
          <span className="hidden md:inline">Главная</span>
        </TabsTrigger>
        <TabsTrigger value="portfolio" className="flex items-center gap-2">
          <Icon name="Briefcase" size={16} />
          <span className="hidden md:inline">Портфель</span>
        </TabsTrigger>
        <TabsTrigger value="import" className="flex items-center gap-2">
          <Icon name="Upload" size={16} />
          <span className="hidden md:inline">Импорт</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <Icon name="BarChart3" size={16} />
          <span className="hidden md:inline">Аналитика</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Icon name="Clock" size={16} />
          <span className="hidden md:inline">История</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <Icon name="User" size={16} />
          <span className="hidden md:inline">Профиль</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Icon name="Settings" size={16} />
          <span className="hidden md:inline">Настройки</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={20} />
              Добро пожаловать в InvestTracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Быстрый старт</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 hover-lift cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="Upload" size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Импортируйте портфель</p>
                      <p className="text-sm text-muted-foreground">Загрузите брокерский отчет из БКС</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 hover-lift cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="BarChart3" size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Анализируйте данные</p>
                      <p className="text-sm text-muted-foreground">Отслеживайте дивиденды и доходность</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 hover-lift cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="Bell" size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Получайте уведомления</p>
                      <p className="text-sm text-muted-foreground">О дивидендах и изменениях цен</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Последние события</h3>
                <div className="space-y-3">
                  {portfolio.dividends.slice(0, 3).map((div, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover-lift">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${div.type === 'dividend' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="font-medium text-sm">{div.ticker}</p>
                          <p className="text-xs text-muted-foreground">{div.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{formatCurrency(div.amount)}</p>
                        <p className="text-xs text-muted-foreground">{div.type === 'dividend' ? 'Дивиденд' : 'Купон'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon name="Briefcase" size={20} />
                Мой портфель
              </span>
              <Button size="sm" variant="outline">
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.positions.map((position, idx) => (
                <div key={idx} className="p-4 rounded-xl border bg-gradient-to-r from-white to-gray-50 hover-lift">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                        position.type === 'stock' ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-cyan-500'
                      } flex items-center justify-center`}>
                        <Icon name={position.type === 'stock' ? 'TrendingUp' : 'FileText'} size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{position.ticker}</p>
                        <p className="text-sm text-muted-foreground">{position.name}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={position.changePercent > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {formatPercent(position.changePercent)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Количество</p>
                      <p className="font-semibold">{position.shares} шт</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Средняя цена</p>
                      <p className="font-semibold">{formatCurrency(position.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Текущая цена</p>
                      <p className="font-semibold">{formatCurrency(position.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Доходность</p>
                      <p className="font-semibold text-purple-600">{position.dividendYield}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Стоимость</p>
                      <p className="font-bold text-lg">{formatCurrency(position.value)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="import" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} />
              Импорт брокерского отчета
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-500 transition-colors cursor-pointer hover-lift">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Icon name="Upload" size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Загрузите отчет из БКС</h3>
              <p className="text-muted-foreground mb-4">Перетащите файл сюда или нажмите для выбора</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                Выбрать файл
              </Button>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex gap-3">
                <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Поддерживаемые форматы</p>
                  <p className="text-blue-700">XML, XLS, XLSX - брокерские отчеты БКС</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Coins" size={20} />
                Дивиденды и купоны
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.dividends.map((div, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover-lift">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        div.type === 'dividend' ? 'bg-green-100' : 'bg-blue-100'
                      } flex items-center justify-center`}>
                        <Icon name={div.type === 'dividend' ? 'Coins' : 'Receipt'} size={20} className={
                          div.type === 'dividend' ? 'text-green-600' : 'text-blue-600'
                        } />
                      </div>
                      <div>
                        <p className="font-semibold">{div.ticker}</p>
                        <p className="text-xs text-muted-foreground">{div.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{formatCurrency(div.amount)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {div.type === 'dividend' ? 'Дивиденд' : 'Купон'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="PieChart" size={20} />
                Распределение активов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.positions.slice(0, 5).map((position, idx) => {
                  const percentage = (position.value / portfolio.totalValue) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{position.ticker}</span>
                        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all" style={{width: `${percentage}%`}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Clock" size={20} />
              История операций
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="Clock" size={32} className="text-gray-400" />
              </div>
              <p className="text-muted-foreground">История операций появится после импорта отчета</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="profile" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="User" size={20} />
              Профиль пользователя
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                И
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Инвестор</h3>
                <p className="text-muted-foreground">investor@example.com</p>
                <Button size="sm" variant="outline" className="mt-3">
                  Редактировать профиль
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Дата регистрации</p>
                <p className="font-semibold">15 января 2024</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Статус</p>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">Premium</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Настройки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Уведомления</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Дивиденды и купоны</p>
                    <p className="text-sm text-muted-foreground">Уведомления о выплатах</p>
                  </div>
                  <Button size="sm" variant="outline">Включено</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Изменение цен</p>
                    <p className="text-sm text-muted-foreground">При изменении более 5%</p>
                  </div>
                  <Button size="sm" variant="outline">Включено</Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Безопасность</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Key" size={16} className="mr-2" />
                  Сменить пароль
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Shield" size={16} className="mr-2" />
                  Двухфакторная аутентификация
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioTabs;
