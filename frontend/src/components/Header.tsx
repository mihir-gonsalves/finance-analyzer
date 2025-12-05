// frontend/src/components/Header.tsx
import { AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery, useTheme } from "@mui/material";
import { AccountCircle, SavedSearchRounded } from "@mui/icons-material";
import { commonStyles, layoutStyles } from "../styles";

const HEADER_STYLES = {
  appBar: {
    bgcolor: '#ffffff',
    borderBottom: '1px solid',
    borderColor: 'grey.200',
    color: 'text.primary',
  },

  toolbar: {
    py: 1.5,
    px: { xs: 2, sm: 3 },
  },

  logo: {
    color: 'primary.main',
    fontSize: { sm: 36 },
  },

  title: {
    fontWeight: 700,
    color: 'primary.main',
  },

  logoContainer: {
    gap: 1.5,
  },
} as const;

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUserClick = () => {
    console.log("User settings clicked");
  };

  return (
    <AppBar position="static" elevation={0} sx={HEADER_STYLES.appBar}>
      <Toolbar sx={{ ...layoutStyles.flex.rowBetween, ...HEADER_STYLES.toolbar }}>
        {/* Logo & Brand */}
        <Box sx={{ ...layoutStyles.flex.row, ...HEADER_STYLES.logoContainer }}>
          <SavedSearchRounded sx={HEADER_STYLES.logo} />
          {!isMobile && (
            <Typography variant="h6" sx={HEADER_STYLES.title}>
              Spend Analyzer
            </Typography>
          )}
        </Box>

        {/* User Controls */}
        <Box sx={layoutStyles.flex.row}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleUserClick}
            sx={commonStyles.button.icon}
          >
            <AccountCircle sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
