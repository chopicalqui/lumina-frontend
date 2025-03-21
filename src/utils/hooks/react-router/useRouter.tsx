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
import { Account } from "../../../models/account/account";
import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import {
  NAVIGATION,
  NavigationPageItem,
} from "../../../layout/NavigationItems";
import RootLayout from "../../../layout/containers/RootLayout";
import { ErrorPage, LazyLoad } from "../../../layout/core/common";
import { ROUTE_SETTINGS } from "./common";

/**
 * This hook returns the navigation items for the current user.
 */
export const useRouter = (account?: Account) => {
  const children: RouteObject[] = React.useMemo(
    () =>
      NAVIGATION.flatMap((item) => item.children ?? [])
        .filter((item) => account?.hasReadAccess(item.scope) ?? false)
        .map((item) => {
          const result = item as NavigationPageItem;
          return {
            path: result.routerPath,
            errorElement: <ErrorPage />,
            children: [
              {
                index: true,
                element: LazyLoad(
                  result.componentPath.replace(".tsx", "").replace(".ts", "")
                ),
              },
              ...(result.children ?? []),
            ],
          };
        }),
    [account]
  );
  const root = React.useMemo(
    () => [
      {
        path: "/",
        element: <RootLayout />,
        errorElement: <Navigate to="/" replace={true} />,
        // TODO: This might lead to an infinite loop.
        children: [
          {
            index: true,
            element: (
              <Navigate to={`${ROUTE_SETTINGS}/accounts`} replace={true} />
            ),
          },
          ...children,
        ],
      },
    ],
    [children]
  );

  return account && children.length > 0 ? createBrowserRouter(root) : undefined;
};
