import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          marginLeft: "240px",
          minHeight: "100vh",
          p: 4,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}