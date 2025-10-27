// frontend/src/components/Header.tsx - app header with title and navigation
import { AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery, useTheme } from "@mui/material";
import { AccountCircle, SavedSearch } from "@mui/icons-material";
import { commonStyles, layoutStyles } from "../styles";


export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUserClick = () => {
    console.log("User settings clicked");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        color: 'text.primary'
      }}
    >
      <Toolbar
        sx={{
          ...layoutStyles.flex.rowBetween,
          py: { sm: 1.5 }
        }}
      >
        {/* Logo/Brand */}
        <Box sx={{ ...layoutStyles.flex.row, gap: 1.5 }}>
          <SavedSearch
            sx={{
              color: 'primary.main',
              fontSize: { sm: 36 }
            }}
          />
          {!isMobile && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              Spend Analyzer
            </Typography>
          )}
        </Box>

        {/* User controls */}
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
