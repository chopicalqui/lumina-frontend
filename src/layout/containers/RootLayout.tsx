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
// Check the following link for more details on the AppBar component:
// https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu

import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryMe } from "../../models/account/account";
import SideBar from "./SideBar";
import { useMutation } from "../../utils/hooks/tanstack/useMutation";
import { axiosPut } from "../../utils/axios";
import {
  queryKeyAccountMe,
  URL_USERS_ME_TOGGLE_MENU,
} from "../../models/account/common";
import { invalidateQueryKeys } from "../../utils/consts";
import HeaderBar from "./HeaderBar";
import { WebSocketAlert } from "../../components/feedback/WebSocketAlert";
import { ScopeEnum } from "../../utils/globals";
import { StatusMessage } from "../../models/common";
import AlertSnackbar from "../../components/feedback/AlertSnackbar";

const ERROR_MESSAGES = {
  "5157ba8a-848e-4907-a7f7-07e9f9385e77": "Connection to IdP failed.",
  "1e46be48-5696-4103-83a2-4f31fd6770f1": "Identity provider not found.",
  "5f1a9d3a-e95e-4976-9ed8-2308a9b0a2fd": "Authentication failed.",
  "78fac82f-0f11-458b-aa8a-2e9eecabe819":
    "An unknown error occurred during authentication.",
};

const STATUS_MESSAGES = Object.entries(ERROR_MESSAGES).reduce(
  (acc, [key, value]) => {
    acc[`#${key}`] = new StatusMessage({
      severity: "error",
      message: value,
      status: 500,
    });
    return acc;
  },
  {} as Record<string, StatusMessage>
);

const RootLayout = () => {
  // Obtain user information
  const location = useLocation();
  const meQuery = useQueryMe();
  const account = meQuery.data;
  const loggedIn = account !== undefined;

  const errorMessage = React.useMemo(
    () => (location.hash ? STATUS_MESSAGES[location.hash] : undefined),
    [location.hash]
  );

  /**
   * Mutation to toggle the sidebar
   */
  const mutationToggleMenu = useMutation<undefined>(
    React.useMemo(
      () => ({
        mutationFn: async (id: string) =>
          axiosPut(URL_USERS_ME_TOGGLE_MENU, { id }),
        onSuccess: () => invalidateQueryKeys(queryKeyAccountMe),
      }),
      []
    )
  );

  const toggleDrawer = React.useCallback(() => {
    mutationToggleMenu.mutate(undefined);
  }, [mutationToggleMenu]);

  const content = React.useMemo(
    () =>
      loggedIn && (
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "97.5vh",
            width: "100%",
          }}
        >
          <Toolbar />
          <Container
            maxWidth={false}
            sx={{ p: 3, height: "calc(100% - 60px)" }}
          >
            <Outlet />
          </Container>
        </Box>
      ),
    [loggedIn]
  );

  return (
    <Box sx={{ display: "flex" }}>
      {account?.hasReadAccess(ScopeEnum.WebSockets) === true && (
        <WebSocketAlert isAuthenticated={meQuery.isSuccess} />
      )}
      {errorMessage && <AlertSnackbar context={errorMessage} />}
      <HeaderBar account={meQuery.data!} toggleDrawer={toggleDrawer} />
      {loggedIn && (
        <SideBar
          open={account?.sidebarCollapsed === false}
          toggleDrawer={toggleDrawer}
        />
      )}
      {content}
    </Box>
  );
};

export default RootLayout;
