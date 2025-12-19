"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Target
} from 'lucide-react';

interface AnalyticsData {
  currentMonthSales: {
    total: number;
    count: number;
  };
  lastMonthSales: {
    total: number;
    count: number;
  };
  dailySalesReports: Array<{
    date: Date;
    totalSales: number;
    totalTransactions: number;
    cashSales: number;
    cardSales: number;
    insuranceSales: number;
    totalTax: number;
    totalDiscount: number;
    netSales: number;
  }>;
  topMedicines: Array<{
    medicineId: number;
    _sum: { quantity: number | null; total: number | null };
    _count: number;
    medicine?: {
      id: number;
      name: string;
      price: number;
      category: { name: string } | null;
    };
  }>;
  paymentMethodStats: Array<{
    paymentMethod: string;
    _sum: { total: number | null };
    _count: number;
  }>;
  monthlySales: any[];
  customerStats: {
    _count: number;
    _avg: { totalSpent: number | null; loyaltyPoints: number | null };
  };
  employeeStats: Array<{
    employeeId: number | null;
    _sum: { total: number | null };
    _count: number;
    employee?: {
      id: number;
      firstName: string;
      lastName: string;
      user: { name: string | null };
    };
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Calculate growth percentages
  const salesGrowth = data.lastMonthSales.total > 0 
    ? ((data.currentMonthSales.total - data.lastMonthSales.total) / data.lastMonthSales.total) * 100
    : 0;

  const transactionGrowth = data.lastMonthSales.count > 0
    ? ((data.currentMonthSales.count - data.lastMonthSales.count) / data.lastMonthSales.count) * 100
    : 0;

  const avgTransactionValue = data.currentMonthSales.count > 0
    ? data.currentMonthSales.total / data.currentMonthSales.count
    : 0;

  const lastMonthAvgTransaction = data.lastMonthSales.count > 0
    ? data.lastMonthSales.total / data.lastMonthSales.count
    : 0;

  const avgTransactionGrowth = lastMonthAvgTransaction > 0
    ? ((avgTransactionValue - lastMonthAvgTransaction) / lastMonthAvgTransaction) * 100
    : 0;

  // Get recent sales data for trend
  const recentSales = data.dailySalesReports.slice(-7); // Last 7 days

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your pharmacy's performance and trends</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.currentMonthSales.total)}
              </p>
              <div className="flex items-center mt-2">
                {salesGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  salesGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercent(salesGrowth)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.currentMonthSales.count.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {transactionGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  transactionGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercent(transactionGrowth)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Average Transaction Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgTransactionValue)}
              </p>
              <div className="flex items-center mt-2">
                {avgTransactionGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  avgTransactionGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatPercent(avgTransactionGrowth)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.customerStats._count.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Spend: {formatCurrency(data.customerStats._avg.totalSpent || 0)}
                </span>
              </div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Sales Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Sales Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320} minHeight={320}>
              <AreaChart data={data.dailySalesReports.slice(-14).map(day => ({
                date: formatDate(day.date),
                sales: day.totalSales,
                transactions: day.totalTransactions,
                cash: day.cashSales,
                card: day.cardSales,
                insurance: day.insuranceSales
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: any, name?: string) => [
                    name === 'transactions' ? value : formatCurrency(value),
                    name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
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
                  dataKey="sales"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
            <PieChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320} minHeight={320}>
              <RechartsPieChart>
                <Pie
                  data={data.paymentMethodStats.map((method, index) => ({
                    name: method.paymentMethod,
                    value: method._sum.total || 0,
                    count: method._count,
                    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index % 4]
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.paymentMethodStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name?: string, props?: any) => [
                    formatCurrency(value),
                    `${props?.payload?.name || name} (${props?.payload?.count || 0} transactions)`
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({((entry.payload.value / data.paymentMethodStats.reduce((sum, m) => sum + (m._sum.total || 0), 0)) * 100).toFixed(1)}%)
                    </span>
                  )}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Medicines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Medicines</h3>
          <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topMedicines.slice(0, 10).map((item, index) => (
                <TableRow key={item.medicineId}>
                  <TableCell>
                    <div className="flex items-center">
                      {index < 3 && (
                        <Award className={`w-4 h-4 mr-2 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          'text-orange-600'
                        }`} />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        #{index + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.medicine?.name || 'Unknown Medicine'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.medicine?.category && (
                      <Badge variant="outline">
                        {item.medicine.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item._sum.quantity?.toLocaleString() || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item._sum.total || 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.medicine?.price || 0)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Employee Performance */}
      {data.employeeStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Performance (This Month)</h3>
            <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.employeeStats.slice(0, 6).map((employee, index) => (
              <div key={employee.employeeId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {employee.employee ? 
                      `${employee.employee.firstName} ${employee.employee.lastName}` : 
                      'Unknown Employee'
                    }
                  </div>
                  <Badge variant="outline">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sales:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(employee._sum.total || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {employee._count}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Avg Sale:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(employee._count > 0 ? (employee._sum.total || 0) / employee._count : 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Sales Trend</h3>
          <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="space-y-3">
          {data.monthlySales.slice(-6).map((month, index) => {
            const maxSales = Math.max(...data.monthlySales.map(m => Number(m.total_sales)));
            const width = maxSales > 0 ? (Number(month.total_sales) / maxSales) * 100 : 0;
            const monthName = new Date(Number(month.year), Number(month.month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            return (
              <div key={`${month.year}-${month.month}`} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
                  {monthName}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${Math.max(width, 5)}%` }}
                  >
                    <span className="text-sm text-white font-medium">
                      {formatCurrency(Number(month.total_sales))}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                  {Number(month.transaction_count).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}