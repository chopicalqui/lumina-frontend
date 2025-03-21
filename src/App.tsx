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
import { RouterProvider } from "react-router-dom";
import { Alert, CssBaseline, ThemeProvider } from "@mui/material";
import { getTheme } from "./layout/core/theme";
import { SessionManager } from "./layout/core/SessionManager";
import { useQueryMe } from "./models/account/account";
import { useRouter } from "./utils/hooks/react-router/useRouter";
import LoadingIndicator from "./components/feedback/LoadingIndicator";

export default function App() {
  const me = useQueryMe();
  const account = me?.data;
  const router = useRouter(account);
  const theme = React.useMemo(
    () => getTheme(account?.lightMode ? "light" : "dark"),
    [account]
  );
  let component: JSX.Element | undefined;

  if (me.isLoading) {
    component = <LoadingIndicator open={true} />;
  } else if (me.isError) {
    component = (
      <Alert
        severity="error"
        sx={{ position: "absolute", top: "0", width: "100%" }}
      >
        An error occurred.
      </Alert>
    );
  } else if (!router) {
    component = (
      <Alert
        severity="error"
        sx={{ position: "absolute", top: "0", width: "100%" }}
      >
        You do not have any access.
      </Alert>
    );
  } else {
    component = <RouterProvider router={router} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionManager account={account} />
      {component}
    </ThemeProvider>
  );
}
