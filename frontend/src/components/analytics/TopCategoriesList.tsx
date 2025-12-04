// frontend/src/components/analytics/TopCategoriesList.tsx
import { Box, List, ListItem, ListItemText, Typography, Divider, useTheme, LinearProgress } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { formatCurrency } from "../../utils/analyticsUtils";
import { commonStyles, layoutStyles } from "../../styles";
import { HEIGHTS, SPACING, BORDER_RADIUS } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

export interface SpendCategoryData {
  name: string;
  value: number;
}

interface TopCategoriesListProps {
  categories: SpendCategoryData[];
  totalSpent: number;
}

// ========================
// CONSTANTS
// ========================

const CATEGORY_INDICATOR = {
  SIZE: 12,
  MARGIN_RIGHT: 1.5,
  BORDER_RADIUS: '50%',
} as const;

const PROGRESS_BAR_CONFIG = {
  MIN_WIDTH: '45px',
  DECIMAL_PLACES: 1,
} as const;

// ========================
// SUB-COMPONENTS
// ========================

function EmptyState() {
  return (
    <Box sx={{ ...commonStyles.emptyState.container, height: `${HEIGHTS.categoryList}px` }}>
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

interface CategoryRowProps {
  name: string;
  value: number;
  color: string;
}

function CategoryRow({ name, value, color }: CategoryRowProps) {
  return (
    <Box sx={layoutStyles.analytics.categoryRow}>
      {/* Color Indicator */}
      <Box
        sx={{
          width: CATEGORY_INDICATOR.SIZE,
          height: CATEGORY_INDICATOR.SIZE,
          borderRadius: CATEGORY_INDICATOR.BORDER_RADIUS,
          bgcolor: color,
          mr: CATEGORY_INDICATOR.MARGIN_RIGHT,
          flexShrink: 0,
        }}
      />

      {/* Category Name */}
      <ListItemText
        primary={name}
        primaryTypographyProps={{
          fontWeight: 600,
          variant: 'body1',
          noWrap: true,
          sx: { flex: 1 },
        }}
      />

      {/* Amount */}
      <Typography variant="h6" sx={commonStyles.typography.valueNeutral}>
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
}

interface ProgressRowProps {
  percentage: number;
  color: string;
}

function ProgressRow({ percentage, color }: ProgressRowProps) {
  return (
    <Box sx={layoutStyles.analytics.progressRow}>
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          ...commonStyles.progress.bar,
          flex: 1,
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: BORDER_RADIUS.sm,
          },
        }}
      />

      {/* Percentage Label */}
      <Typography
        variant="body2"
        sx={{
          ...commonStyles.typography.label,
          minWidth: PROGRESS_BAR_CONFIG.MIN_WIDTH,
          textAlign: 'right',
        }}
      >
        {percentage.toFixed(PROGRESS_BAR_CONFIG.DECIMAL_PLACES)}%
      </Typography>
    </Box>
  );
}

interface CategoryListItemProps {
  category: SpendCategoryData;
  totalSpent: number;
  color: string;
  showDivider: boolean;
}

function CategoryListItem({ category, totalSpent, color, showDivider }: CategoryListItemProps) {
  const percentage = (category.value / totalSpent) * 100;

  return (
    <Box>
      <ListItem disableGutters sx={commonStyles.listItem.default}>
        <CategoryRow name={category.name} value={category.value} color={color} />
        <ProgressRow percentage={percentage} color={color} />
      </ListItem>

      {showDivider && <Divider sx={{ mx: SPACING.sm }} />}
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function TopCategoriesList({ categories, totalSpent }: TopCategoriesListProps) {
  const theme = useTheme();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  if (categories.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box sx={layoutStyles.dataDisplay.scrollable}>
      <List disablePadding>
        {categories.map((category, index) => (
          <CategoryListItem
            key={`${category.name}-${index}`}
            category={category}
            totalSpent={totalSpent}
            color={COLORS[index % COLORS.length]}
            showDivider={index < categories.length - 1}
          />
        ))}
      </List>
    </Box>
  );
}
