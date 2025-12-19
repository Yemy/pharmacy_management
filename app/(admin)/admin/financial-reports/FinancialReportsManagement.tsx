"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  FileText,
  Calculator
} from 'lucide-react';

interface FinancialData {
  monthlyRevenue: any;
  yearlyRevenue: any;
  expenseData: any;
  profitLossData: any;
  cashFlowData: any[];
  taxData: any;
}

interface FinancialReportsManagementProps {
  data: FinancialData;
  currentUser: any;
}

export default function FinancialReportsManagement({ data }: FinancialReportsManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [selectedReport, setSelectedReport] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Calculate key metrics
  const totalRevenue = data.yearlyRevenue._sum.total || 0;
  const totalExpenses = data.expenseData._sum.total || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const totalTax = data.taxData._sum.tax || 0;

  // Prepare chart data
  const monthlyData = data.monthlyRevenue.map((item: any) => ({
    month: new Date(Number(item.year), Number(item.month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    revenue: Number(item.revenue) || 0,
    transactions: Number(item.transactions) || 0,
    avgTransaction: Number(item.avg_transaction) || 0,
    tax: Number(item.tax_collected) || 0
  }));

  const profitLossChartData = data.profitLossData.map((item: any) => ({
    month: formatDate(item.month),
    revenue: Number(item.revenue) || 0,
    expenses: Number(item.expenses) || 0,
    profit: Number(item.profit) || 0
  }));

  const cashFlowData = data.cashFlowData.map((item: any) => ({
    method: item.paymentMethod,
    amount: Number(item._sum.total) || 0,
    count: item._count
  }));

  const exportReport = (reportType: string) => {
    // In a real implementation, this would generate and download a PDF/Excel report
    console.log(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-8">
      {/* Report Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Financial Overview</SelectItem>
              <SelectItem value="profit-loss">Profit & Loss</SelectItem>
              <SelectItem value="cash-flow">Cash Flow</SelectItem>
              <SelectItem value="tax-report">Tax Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <FileText className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  YTD
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalExpenses)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Purchases
                </span>
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <Calculator className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(netProfit)}
              </p>
              <div className="flex items-center mt-2">
                {netProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercent(profitMargin)}
                </span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Tax Collected */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tax Collected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalTax)}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  YTD
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height={320} minHeight={320}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any, name?: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? 'Revenue' : (name || '')
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow by Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cash Flow by Payment Method</h3>
              <PieChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height={320} minHeight={320}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="method" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [formatCurrency(value), '']} />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'profit-loss' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit & Loss Statement</h3>
            <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height={384} minHeight={384}>
              <LineChart data={profitLossChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any, name?: string) => [
                  formatCurrency(value),
                  name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
                ]} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Financial Summary</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-900 dark:text-white">Revenue</div>
            <div className="text-right font-medium text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                100%
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-gray-600 dark:text-gray-400">Less: Cost of Goods Sold</div>
            <div className="text-right text-gray-600 dark:text-gray-400">{formatCurrency(totalExpenses)}</div>
            <div className="text-right">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium text-gray-900 dark:text-white">Gross Profit</div>
            <div className="text-right font-medium text-gray-900 dark:text-white">{formatCurrency(netProfit)}</div>
            <div className="text-right">
              <Badge className={netProfit >= 0 ? 
                "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }>
                {formatPercent(profitMargin)}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 py-3">
            <div className="text-gray-600 dark:text-gray-400">Tax Collected</div>
            <div className="text-right text-gray-600 dark:text-gray-400">{formatCurrency(totalTax)}</div>
            <div className="text-right">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                {totalRevenue > 0 ? ((totalTax / totalRevenue) * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}