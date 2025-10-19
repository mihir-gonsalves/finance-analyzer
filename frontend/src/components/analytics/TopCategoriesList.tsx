// frontend/src/components/analytics/TopCategoriesList.tsx
import { Box, List, ListItem, ListItemText, Typography, Divider, useTheme } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import type { CategoryData } from "../../hooks/useSpendingAnalytics";

interface TopCategoriesListProps {
  categories: CategoryData[];
  totalSpent: number;
}

export function TopCategoriesList({ categories, totalSpent }: TopCategoriesListProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  if (categories.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ height: '520px' }}
      >
        <CategoryIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
        <Typography color="text.secondary" variant="body2">
          No categories available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '563px', overflow: 'auto' }}>
      <List disablePadding>
        {categories.map((category, index) => (
          <Box key={category.name} sx={{ pl: 0.5, width: '97.5%' }}>
            <ListItem disableGutters sx={{ py: 2 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '100%',
                  bgcolor: COLORS[index % COLORS.length],
                  mr: 2,
                  flexShrink: 0,
                }}
              />
              <ListItemText
                primary={category.name}
                secondary={`${((category.value / totalSpent) * 100).toFixed(1)}% of total spending`}
                primaryTypographyProps={{
                  fontWeight: 600,
                  variant: 'body1'
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary'
                }}
              />
              <Typography
                variant="h6"
                fontWeight="700"
                color="text.primary"
              >
                {formatCurrency(category.value)}
              </Typography>
            </ListItem>
            {index < categories.length - 1 && (
              <Divider />
            )}
          </Box>
        ))}
      </List>
    </Box>
  );
}