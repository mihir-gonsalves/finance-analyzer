import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

export default function Header() {
  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Center - App name */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Finance Analyzer
          </Typography>
        </Box>

        {/* Right side - User icon */}
        <IconButton 
          size="large" 
          edge="end" 
          color="inherit"
          onClick={() => {
            // TODO: Add user settings functionality
            console.log("User settings clicked");
          }}
          sx={{ position: 'absolute', right: 16 }}
        >
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}