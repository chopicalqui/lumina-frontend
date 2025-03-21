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

import KeyIcon from "@mui/icons-material/Key";
import PublicIcon from "@mui/icons-material/Public";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { ScopeEnum } from "../utils/globals";
import { ROUTE_SETTINGS } from "../utils/hooks/react-router/common";

export interface NavigationBase {
  readonly title: string;
}

export interface NavigationPageItem extends NavigationBase {
  scope: ScopeEnum;
  routerPath: string;
  componentPath: string;
  icon: JSX.Element;
  children?: [any];
}

export interface NavigationHeader extends NavigationBase {
  readonly children?: NavigationPageItem[];
}

/**
 * Define the navigation items for the application.
 */
export const NAVIGATION: NavigationHeader[] = [
  {
    title: "Main Items",
  },
  {
    title: "Settings",
    children: [
      {
        title: "Accounts",
        routerPath: `${ROUTE_SETTINGS}/accounts`,
        componentPath: "Account.tsx",
        icon: <DashboardIcon />,
        scope: ScopeEnum.PageAccount,
      },
      {
        title: "Access Tokens",
        routerPath: `${ROUTE_SETTINGS}/access-tokens`,
        componentPath: "AccessToken.tsx",
        icon: <KeyIcon />,
        scope: ScopeEnum.PageAccessToken,
      },
      {
        title: "Countries",
        routerPath: `${ROUTE_SETTINGS}/countries`,
        componentPath: "Country.tsx",
        icon: <PublicIcon />,
        scope: ScopeEnum.PageCountry,
      },
    ],
  },
];
