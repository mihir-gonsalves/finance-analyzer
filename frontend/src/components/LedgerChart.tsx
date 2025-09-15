// components/LedgerChart.tsx
import { Card, CardContent, Typography, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

import { useTransactions } from "../hooks/useTransactions";

export default function LedgerChart() {  
  const { data: transactions = [] } = useTransactions();

  // Process data for running balance chart
  // Create a copy of the array before sorting to avoid mutating the read-only array
  const chartData = [...transactions]
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
    .reduce((acc: any[], transaction, index) => {
      const previousBalance = index === 0 ? 0 : acc[acc.length - 1]?.balance || 0;
      const newBalance = previousBalance + transaction.amount;
      
      acc.push({
        date: transaction.date,
        balance: newBalance,
        amount: transaction.amount,
        description: transaction.description,
        formattedDate: new Date(transaction.date || '').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
      
      return acc;
    }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 3,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {new Date(data.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {data.description}
          </Typography>
          <Typography variant="body2" sx={{ color: data.amount >= 0 ? 'success.main' : 'error.main' }}>
            Transaction: {data.amount >= 0 ? '+' : ''}{formatCurrency(data.amount)}
          </Typography>
          <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
            Balance: {formatCurrency(data.balance)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Balance Over Time
          </Typography>
          <Box textAlign="center" py={8}>
            <Typography color="text.secondary">
              No transaction data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = chartData[chartData.length - 1]?.balance || 0;
  const isPositive = currentBalance >= 0;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2">
            Account Balance Over Time
          </Typography>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Current Balance
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
            >
              {formatCurrency(currentBalance)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0.05}/>
                </linearGradient>
                <pattern id="dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#1976d2" fillOpacity="0.1"/>
                </pattern>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              
              <YAxis 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#1976d2"
                strokeWidth={3}
                fill="url(#balanceGradient)"
              />
              
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#1976d2" 
                strokeWidth={3}
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {chartData.length} transactions • 
            {chartData.length > 0 && (
              <> From {new Date(chartData[0].date).toLocaleDateString()} to {new Date(chartData[chartData.length - 1].date).toLocaleDateString()}</>
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}