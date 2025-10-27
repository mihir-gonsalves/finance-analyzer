// frontend/src/styles/layouts.ts - Layout and grid system styles
import type { SxProps, Theme } from '@mui/material';


export const layoutStyles = {
  // Flex layouts
  flex: {
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
  },

  // Grid layouts
  grid: {
    auto: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 2,
    } as SxProps<Theme>,

    twoColumn: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,

    threeColumn: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,

    fourColumn: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,
  },

  // Dashboard specific layouts
  dashboard: {
    main: {
      minHeight: '100vh',
      bgcolor: 'background.default',
    } as SxProps<Theme>,

    container: {
      maxWidth: 'xl',
      mt: { xs: 2, md: 3 },
      mb: 2.5,
      px: { xs: 2, sm: 3 },
    } as SxProps<Theme>,

    sidebar: {
      width: { xs: '100%', md: 280 },
      flexShrink: 0,
    } as SxProps<Theme>,

    content: {
      flex: 1,
      minWidth: 0,
    } as SxProps<Theme>,
  },

  // Card layouts
  cardLayout: {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2,
    } as SxProps<Theme>,

    body: {
      flex: 1,
      overflow: 'hidden',
    } as SxProps<Theme>,

    footer: {
      borderTop: '1px solid',
      borderColor: 'grey.200',
      background: 'grey.50',
      p: 2,
      mx: -2,
      mb: -2.8,
    } as SxProps<Theme>,

    fullHeight: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    } as SxProps<Theme>,
  },

  // Filter panel specific
  filterPanel: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    } as SxProps<Theme>,

    row: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,

    actions: {
      display: 'flex',
      gap: 2,
      justifyContent: 'flex-end',
    } as SxProps<Theme>,
  },

  // Data display
  dataDisplay: {
    table: {
      height: 569,
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
      height: 560,
    } as SxProps<Theme>,

    scrollable: {
      height: '553px',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'grey.300',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'grey.400',
      },
    } as SxProps<Theme>,
  },

  // Analytics specific
  analytics: {
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      px: 1,
    } as SxProps<Theme>,

    categoryRow: {
      display: 'flex',
      alignItems: 'center',
      mb: 1.5,
    } as SxProps<Theme>,

    progressRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      pl: 3,
    } as SxProps<Theme>,
  },

  // Dialog layouts
  dialogLayout: {
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      mt: 2.5,
    } as SxProps<Theme>,

    formRow: {
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 2,
    } as SxProps<Theme>,

    actions: {
      display: 'flex',
      gap: 1,
      justifyContent: 'flex-end',
      pt: 2,
    } as SxProps<Theme>,
  },

  // Spacing utilities
  spacing: {
    sectionGap: { xs: 2, md: 3 },
    itemGap: 2,
    compactGap: 1,
  },
};


// Responsive breakpoint helpers
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};


// Common spacing values
export const spacing = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 6,
};


// Z-index levels
export const zIndex = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};
