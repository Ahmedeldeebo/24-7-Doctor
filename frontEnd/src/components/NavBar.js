import React, { useState } from "react";
import { AppBar, makeStyles, Toolbar, Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  logoLg: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  logoSm: {
    display: "block",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  }
}));

const NavBar = () => {
  const classes = useStyles();

  return (
    <AppBar>
      <Toolbar>
        <Typography variant="h6" className={classes.logoLg}>
          Doctor Online
        </Typography>
        <Typography variant="h6" className={classes.logoSm}>
          Doctor
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
