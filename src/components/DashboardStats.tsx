import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DashboardStatsProps {
  portfolio: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    monthlyDividends: number;
    yearlyDividends: number;
    positions: Array<{ type: string }>;
  };
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

const DashboardStats = ({ portfolio, formatCurrency, formatPercent }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <Card className="hover-lift border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Icon name="Wallet" size={16} />
            Общая стоимость
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Icon name="TrendingUp" size={12} className="mr-1" />
              {formatPercent(portfolio.dailyChangePercent)}
            </Badge>
            <span className="text-sm text-green-600">+{formatCurrency(portfolio.dailyChange)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Icon name="PieChart" size={16} />
            Позиций в портфеле
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{portfolio.positions.length}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {portfolio.positions.filter(p => p.type === 'stock').length} акций
            </Badge>
            <Badge variant="outline" className="text-xs">
              {portfolio.positions.filter(p => p.type === 'bond').length} облигаций
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Icon name="Coins" size={16} />
            Дивиденды за месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(portfolio.monthlyDividends)}</div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all" style={{width: '65%'}} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">65% от годового плана</p>
        </CardContent>
      </Card>

      <Card className="hover-lift border-l-4 border-l-pink-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Icon name="Calendar" size={16} />
            Прогноз на год
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(portfolio.yearlyDividends)}</div>
          <p className="text-sm text-muted-foreground mt-2">Ожидаемый доход</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
