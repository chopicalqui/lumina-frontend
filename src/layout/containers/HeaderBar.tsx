/**
 * This file is part of Lumina.
 *
 * Lumina is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Lumina is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Lumina. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React from "react";
import {
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Portal,
  ButtonBase,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";
import { drawerWidth } from "./SideBar";
import {
  URL_LOGIN,
  URL_LOGOUT,
  URL_FULL_ACCOUNTS_ME_AVATAR,
} from "../../models/account/common.ts";
import { APP_NAME } from "../../utils/consts";
import NotificationsList from "../../components/data/comment/NotificationsList";
import { Account } from "../../models/account/account";
import { useUserProfileDialog } from "../../utils/hooks/mui/useUserProfileDialog";
import UserProfileDialog from "../components/UserProfileDialog";
import { axiosPost } from "../../utils/axios";
import { useMutation } from "../../utils/hooks/tanstack/useMutation";

interface HeaderBarOptions {
  account?: Account;
  toggleDrawer: () => void;
}

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})((props: { open: boolean }) => {
  const theme = useTheme();
  return React.useMemo(
    () => ({
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      ...(props.open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }),
    }),
    [props.open, theme]
  );
});

const menuId = "primary-search-account-menu";

const HeaderBar = React.memo(({ account, toggleDrawer }: HeaderBarOptions) => {
  const loggedIn = account !== undefined;
  const open = account?.sidebarCollapsed === false;
  const userProfileContext = useUserProfileDialog();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isMenuOpen = Boolean(anchorEl);
  const mutateLogout = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async () => axiosPost(URL_LOGOUT),
        onSettled: () => window.location.replace("/"),
      }),
      []
    )
  );

  const handleProfileMenuOpen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const closeProfileDialog = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = React.useCallback(() => {
    mutateLogout.mutate(undefined);
  }, [mutateLogout]);

  const openProfileDialogHandler = React.useCallback(() => {
    closeProfileDialog();
    userProfileContext.handleOpen();
  }, [userProfileContext, closeProfileDialog]);

  const renderMenu = React.useMemo(
    () => (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={closeProfileDialog}
      >
        <MenuItem onClick={openProfileDialogHandler}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Sign out</MenuItem>
      </Menu>
    ),
    [
      anchorEl,
      isMenuOpen,
      closeProfileDialog,
      openProfileDialogHandler,
      handleLogout,
    ]
  );

  const profileComponent = React.useMemo(
    () =>
      loggedIn ? (
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <NotificationsList isAuthenticated={loggedIn} />
          <ButtonBase
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar
              alt={account?.name ?? "User Profile"}
              src={account?.hasAvatar ? URL_FULL_ACCOUNTS_ME_AVATAR : undefined}
            />
          </ButtonBase>
        </Box>
      ) : (
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Button
            variant="contained"
            startIcon={<FingerprintIcon />}
            onClick={() => window.location.replace(URL_LOGIN)}
          >
            Log In
          </Button>
        </Box>
      ),
    [loggedIn, account, handleProfileMenuOpen]
  );

  return (
    <>
      {userProfileContext.open && (
        <Portal container={document.body}>
          <UserProfileDialog context={userProfileContext} />
        </Portal>
      )}
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
          {loggedIn && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Avatar
            alt="Guardian logo"
            sx={{ width: 70, height: 70, ml: 1, mr: 1 }}
            src="/logo-plain.jpeg"
          />
          <Typography
            component="h1"
            variant="h5"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {APP_NAME.toLocaleUpperCase()}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {profileComponent}
          {renderMenu}
        </Toolbar>
      </AppBar>
    </>
  );
});

export default HeaderBar;
