// frontend/src/components/analytics/TopCategoriesList.tsx - list of top spending categories with amounts
import { Box, List, ListItem, ListItemText, Typography, Divider, useTheme, LinearProgress } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";

export interface SpendCategoryData {
  name: string;
  value: number;
}

interface TopCategoriesListProps {
  categories: SpendCategoryData[];
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
        <CategoryIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
        <Typography color="text.secondary" variant="body1" fontWeight="500">
          No spending data available
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Start categorizing transactions to see analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '553px', overflow: 'auto' }}>
      <List disablePadding>
        {categories.map((category, index) => {
          const percentage = (category.value / totalSpent) * 100;
          const color = COLORS[index % COLORS.length];

          return (
            <Box key={`${category.name}-${index}`}>
              <ListItem
                disableGutters
                sx={{
                  py: 2.5,
                  px: 1,
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }
                }}
              >
                {/* Top Row: Dot, Name, Amount */}
                <Box display="flex" alignItems="center" mb={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: color,
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      variant: 'body1',
                      noWrap: true,
                      sx: { flex: 1 }
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color="text.primary"
                  >
                    {formatCurrency(category.value)}
                  </Typography>
                </Box>

                {/* Bottom Row: Progress Bar */}
                <Box display="flex" alignItems="center" gap={1.5} sx={{ pl: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: color,
                        borderRadius: 4,
                      }
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="500"
                    sx={{ minWidth: '45px', textAlign: 'right' }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </ListItem>

              {index < categories.length - 1 && (
                <Divider sx={{ mx: 1 }} />
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
