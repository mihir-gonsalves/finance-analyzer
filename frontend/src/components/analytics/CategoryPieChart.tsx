// frontend/src/components/analytics/CategoryPieChart.tsx - pie chart showing spending by category/cost center
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Box, Typography, useTheme } from "@mui/material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { SpendCategoryData } from "../../hooks/useSpendingAnalytics";


interface CategoryPieChartProps {
  data: SpendCategoryData[];
  totalSpent: number;
}


export function CategoryPieChart({ data, totalSpent }: CategoryPieChartProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);

      return (
        <Box
          sx={{
            bgcolor: '#ffffff',
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="body2" fontWeight="600" gutterBottom>
            {data.payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(data.value)} ({percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box position="relative" height="100%" width="100%">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} // ignore this - may come up as an error but it works perfectly
            cx="50%"
            cy="50%"
            innerRadius={90}
            outerRadius={140}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        sx={{
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h4"
          color="primary.main"
          sx={{ letterSpacing: '-0.02em' }}
        >
          {formatCurrency(totalSpent)}
        </Typography>
        <Typography color="text.secondary" fontWeight="600">
          Total Spent
        </Typography>
      </Box>
    </Box>
  );
}
