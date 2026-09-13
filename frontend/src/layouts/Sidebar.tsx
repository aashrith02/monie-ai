import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Monies-AI
        </Typography>
      </Box>

      <Divider />

      {/* Main navigation */}
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItemButton
          component={NavLink}
          to="/"
          sx={navItemStyle}
        >
          <ListItemIcon>
            <DashboardOutlinedIcon />
          </ListItemIcon>

          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="#"
          sx={navItemStyle}
        >
          <ListItemIcon>
            <ReceiptLongOutlinedIcon />
          </ListItemIcon>

          <ListItemText primary="Expenses" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="#"
          sx={navItemStyle}
        >
          <ListItemIcon>
            <MenuBookOutlinedIcon />
          </ListItemIcon>

          <ListItemText primary="Journal" />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="#"
          sx={navItemStyle}
        >
          <ListItemIcon>
            <AutoAwesomeOutlinedIcon />
          </ListItemIcon>

          <ListItemText primary="Insights" />
        </ListItemButton>
      </List>

      {/* Bottom navigation */}
      <Box sx={{ mt: "auto" }}>
        <Divider />

        <List sx={{ px: 1.5, py: 2 }}>
          <ListItemButton
            component={NavLink}
            to="#"
            sx={navItemStyle}
          >
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>

            <ListItemText primary="Settings" />
          </ListItemButton>

          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutOutlinedIcon />
            </ListItemIcon>

            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

const navItemStyle = {
  borderRadius: 2,
  mb: 0.5,

  "&.active": {
    backgroundColor: "action.selected",
    fontWeight: 600,
  },
};