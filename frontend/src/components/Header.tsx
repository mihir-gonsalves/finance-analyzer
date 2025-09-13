import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

export default function Header() {
  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - App name */}
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Finance Analyzer
        </Typography>

        {/* Center - Current page */}
        <Typography variant="h6" component="div" sx={{ color: 'text.secondary' }}>
          Dashboard
        </Typography>

        {/* Right side - User icon */}
        <IconButton 
          size="large" 
          edge="end" 
          color="inherit"
          onClick={() => {
            // TODO: Add user settings functionality
            console.log("User settings clicked");
          }}
        >
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}