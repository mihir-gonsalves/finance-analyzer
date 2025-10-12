// frontend/src/components/Header.tsx
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { AccountCircle, TrendingUp } from "@mui/icons-material";

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleUserClick = () => {
    // TODO: Add user settings functionality
    console.log("User settings clicked");
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        color: 'text.primary'
      }}
    >
      <Toolbar 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: { xs: 1, sm: 1.5 }
        }}
      >
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp 
            sx={{ 
              color: 'primary.main', 
              fontSize: { xs: 24, sm: 28 } 
            }} 
          />
          {!isMobile && (
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '-0.025em'
              }}
            >
              Finance Analyzer
            </Typography>
          )}
        </Box>

        {/* Center - App name (mobile only) */}
        {isMobile && (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              letterSpacing: '-0.025em',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            Finance Analyzer
          </Typography>
        )}

        {/* Right side - User controls */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleUserClick}
            sx={{ 
              border: '1px solid',
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
          >
            <AccountCircle sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}