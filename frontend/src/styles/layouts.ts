// frontend/src/styles/layouts.ts - Layout and grid system styles
import type { SxProps, Theme } from '@mui/material';
import { HEIGHTS, SPACING, BORDER_RADIUS } from './constants';

/**
 * Flex Layout Patterns
 */
const flexLayouts = {
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  } as SxProps<Theme>,

  rowBetween: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as SxProps<Theme>,

  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  } as SxProps<Theme>,

  column: {
    display: 'flex',
    flexDirection: 'column',
  } as SxProps<Theme>,

  columnCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } as SxProps<Theme>,

  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
  } as SxProps<Theme>,
};

/**
 * Grid Layout Patterns
 */
const gridLayouts = {
  auto: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: SPACING.md,
  } as SxProps<Theme>,

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,

  threeColumn: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,

  fourColumn: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,
};

/**
 * Dashboard Layout
 */
const dashboardLayout = {
  main: {
    minHeight: '100vh',
    bgcolor: 'background.default',
  } as SxProps<Theme>,

  container: {
    maxWidth: 'xl',
    mt: { xs: SPACING.md, md: SPACING.lg },
    mb: 2.5,
    px: { xs: SPACING.md, sm: SPACING.lg },
  } as SxProps<Theme>,

  sidebar: {
    width: { xs: '100%', md: 280 },
    flexShrink: 0,
  } as SxProps<Theme>,

  content: {
    flex: 1,
    minWidth: 0,
  } as SxProps<Theme>,
};

/**
 * Card Layout Patterns
 */
const cardLayout = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: SPACING.md,
  } as SxProps<Theme>,

  body: {
    flex: 1,
    overflow: 'hidden',
  } as SxProps<Theme>,

  footer: {
    borderTop: '1px solid',
    borderColor: 'grey.200',
    background: 'grey.50',
    p: SPACING.md,
    mx: -2,
    mb: -2.8,
  } as SxProps<Theme>,

  fullHeight: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  } as SxProps<Theme>,
};

/**
 * Filter Panel Layout
 */
const filterPanelLayout = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.lg,
  } as SxProps<Theme>,

  row: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,

  actions: {
    display: 'flex',
    gap: SPACING.md,
    justifyContent: 'flex-end',
  } as SxProps<Theme>,
};

/**
 * Data Display Layout
 */
const dataDisplayLayout = {
  table: {
    height: HEIGHTS.dataGrid,
    backgroundColor: '#ffffff',
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'action.hover',
    },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
    },
  } as SxProps<Theme>,

  chartContainer: {
    position: 'relative',
    height: HEIGHTS.chartContainer,
  } as SxProps<Theme>,

  scrollable: {
    mt: 1.22,
    height: `${HEIGHTS.categoryList}px`,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'grey.300',
      borderRadius: BORDER_RADIUS.sm,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: 'grey.400',
    },
  } as SxProps<Theme>,
};

/**
 * Analytics Layout Patterns
 */
const analyticsLayout = {
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: SPACING.sm,
  } as SxProps<Theme>,

  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    mb: 2.15,
  } as SxProps<Theme>,

  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    pl: SPACING.lg,
  } as SxProps<Theme>,
};

/**
 * Dialog Layout Patterns
 */
const dialogLayout = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.md,
    mt: 2.5,
  } as SxProps<Theme>,

  formRow: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
    gap: SPACING.md,
  } as SxProps<Theme>,

  actions: {
    display: 'flex',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    pt: SPACING.md,
  } as SxProps<Theme>,
};

/**
 * Export consolidated layout styles
 */
export const layoutStyles = {
  flex: flexLayouts,
  grid: gridLayouts,
  dashboard: dashboardLayout,
  cardLayout,
  filterPanel: filterPanelLayout,
  dataDisplay: dataDisplayLayout,
  analytics: analyticsLayout,
  dialogLayout,
  
  // Legacy spacing export
  spacing: {
    sectionGap: { xs: SPACING.md, md: SPACING.lg },
    itemGap: SPACING.md,
    compactGap: SPACING.sm,
  },
};
