import { useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import PortfolioTabs from '@/components/PortfolioTabs';

const mockPortfolio = {
  totalValue: 2847650,
  dailyChange: 34250,
  dailyChangePercent: 1.22,
  monthlyDividends: 18500,
  yearlyDividends: 215000,
  positions: [
    {
      ticker: 'SBER',
      name: 'Сбербанк',
      shares: 500,
      avgPrice: 285.50,
      currentPrice: 312.40,
      value: 156200,
      changePercent: 9.42,
      dividendYield: 7.2,
      type: 'stock',
    },
    {
      ticker: 'GAZP',
      name: 'Газпром',
      shares: 1200,
      avgPrice: 168.30,
      currentPrice: 175.80,
      value: 210960,
      changePercent: 4.46,
      dividendYield: 12.5,
      type: 'stock',
    },
    {
      ticker: 'LKOH',
      name: 'Лукойл',
      shares: 150,
      avgPrice: 6420.00,
      currentPrice: 6850.00,
      value: 1027500,
      changePercent: 6.70,
      dividendYield: 8.9,
      type: 'stock',
    },
    {
      ticker: 'YNDX',
      name: 'Яндекс',
      shares: 200,
      avgPrice: 2850.00,
      currentPrice: 3125.00,
      value: 625000,
      changePercent: 9.65,
      dividendYield: 0,
      type: 'stock',
    },
    {
      ticker: 'RU000A0JXW16',
      name: 'ОФЗ 26238',
      shares: 50,
      avgPrice: 980.50,
      currentPrice: 995.60,
      value: 49780,
      changePercent: 1.54,
      dividendYield: 11.2,
      type: 'bond',
    },
  ],
  dividends: [
    { date: '2024-12-15', ticker: 'SBER', amount: 8500, type: 'dividend' },
    { date: '2024-12-10', ticker: 'GAZP', amount: 15000, type: 'dividend' },
    { date: '2024-11-28', ticker: 'RU000A0JXW16', amount: 5500, type: 'coupon' },
    { date: '2024-11-15', ticker: 'LKOH', amount: 13350, type: 'dividend' },
  ],
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('portfolio');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <DashboardStats 
          portfolio={mockPortfolio} 
          formatCurrency={formatCurrency} 
          formatPercent={formatPercent} 
        />

        <PortfolioTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          portfolio={mockPortfolio}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
        />
      </div>
    </div>
  );
};

export default Index;
