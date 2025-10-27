// frontend/src/components/analytics/TopCategoriesList.tsx - list of top spending categories with amounts
import { Box, List, ListItem, ListItemText, Typography, Divider, useTheme, LinearProgress } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import { commonStyles, layoutStyles } from "../../styles";


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
      <Box sx={{ ...commonStyles.emptyState.container, height: '520px' }}>
        <CategoryIcon sx={commonStyles.emptyState.icon} />
        <Typography sx={commonStyles.emptyState.title} variant="body1">
          No spending data available
        </Typography>
        <Typography sx={commonStyles.emptyState.description}>
          Start categorizing transactions to see analytics
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={layoutStyles.dataDisplay.scrollable}>
      <List disablePadding>
        {categories.map((category, index) => {
          const percentage = (category.value / totalSpent) * 100;
          const color = COLORS[index % COLORS.length];

          return (
            <Box key={`${category.name}-${index}`}>
              <ListItem
                disableGutters
                sx={commonStyles.listItem.default}
              >
                {/* Category row */}
                <Box sx={layoutStyles.analytics.categoryRow}>
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
                    sx={commonStyles.typography.valueNeutral}
                  >
                    {formatCurrency(category.value)}
                  </Typography>
                </Box>

                {/* Progress row */}
                <Box sx={layoutStyles.analytics.progressRow}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                      ...(commonStyles.progress.bar ?? {}), // handles “possibly null”
                      flex: 1,
                      '& .MuiLinearProgress-bar': {
                        ...((commonStyles.progress.bar as Record<string, unknown>)['& .MuiLinearProgress-bar'] as object),
                        bgcolor: color,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      ...commonStyles.typography.label,
                      minWidth: '45px',
                      textAlign: 'right'
                    }}
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
