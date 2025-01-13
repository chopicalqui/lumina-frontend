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

import React, { Suspense } from "react";
import { Navigate } from "@toolpad/core/AppProvider";
import { Account } from "../models/account/account";
import { ScopeEnum } from "../utils/globals";
import LoadingIndicator from "../components/feedback/LoadingIndicator";
import { Alert, Paper } from "@mui/material";
import { PageEnum } from "./NavigationItems";
import { StatusMessage } from "../models/common";

/*
 * This helper function lazy loads components.
 * see also: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
 */
// LazyLoad helper for normal pages
const LazyLoad = (module: string) => {
  const Component = React.lazy(() => import(`../pages/${module}.tsx`));
  return (
    <Suspense fallback={<LoadingIndicator open={true} />}>
      <Component />
    </Suspense>
  );
};

/**
 * Arguments for the PageContent component.
 */
interface PageContentOptions {
  pathname: string;
  me?: Account;
  isError?: boolean;
  statusMessage?: StatusMessage;
  navigate: Navigate;
}

/**
 * This component is responsible for rendering the correct page content based on the current pathname.
 */
const PageContent = React.memo(
  ({ pathname, me, isError, statusMessage }: PageContentOptions) => {
    let componentName: string | undefined = undefined;

    // Obtain the right component.
    if (
      pathname === `/${PageEnum.accounts}` &&
      me?.hasReadAccess(ScopeEnum.PageAccount) === true
    ) {
      componentName = "Account";
    } else if (
      pathname === `/${PageEnum.access_tokens}` &&
      me?.hasReadAccess(ScopeEnum.PageAccessToken) === true
    ) {
      componentName = "AccessToken";
    }

    // Lazy load and memorize the component.
    const component = React.useMemo(
      () => componentName && LazyLoad(componentName),
      [componentName]
    );

    if (!me && isError && statusMessage) {
      return (
        <Alert severity={statusMessage.severity}>{statusMessage.message}</Alert>
      );
    }

    return (
      <>
        <Paper
          sx={{ mt: 3, ml: 2, mr: 2, mb: 2, p: 1, height: "100%" }}
          square={false}
        >
          {component}
        </Paper>
      </>
    );
  }
);

export default PageContent;
