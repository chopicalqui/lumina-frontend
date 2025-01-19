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

import Axios from "axios";
import { QueryClient, QueryCache } from "@tanstack/react-query";

export enum MuiLicenseType {
  Community = 10,
  Pro = 20,
  Premium = 30,
}

interface Env {
  VITE_MUIX_LICENSE_KEY: string;
  VITE_COPYRIGHT_URL: string;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  MUI_LICENSE_TYPE: MuiLicenseType;
}

export const env = {
  ...import.meta.env,
  MUI_LICENSE_TYPE: MuiLicenseType.Community,
} as Env;

export const COPYRIGHT_URL = "Copyright (C) Chopicalqui";
export const APP_NAME = "Lumina";
export const ORG_NAME = "Lumina Inc.";
export const ORG_URL = "https://lumina.com";
export const ORG_LOGO = "/logo.svg";
export const API_PATH_PREFIX = "/api";
export const CSRF_TOKEN_HEADER = "X-Token";
export const ADAPTER_LOCALE = "en-gb";
// Amount of seconds of inactivity before the session is invalidated. This value should match the session timeout
// configured in the backend (see environment variable OAUTH2_ACCESS_TOKEN_EXPIRE_MINUTES).
export const SESSION_TIMEOUT = 840;
// Amount of seconds before the session expires that a warning is shown.
export const SESSION_TIMEOUT_WARNING = 4 * 60;
// The session expiration warning is shown SESSION_TIMEOUT - SESSION_TIMEOUT_WARNING - SESSION_TIMEOUT_BUFFER
// seconds of inactivity.
export const SESSION_TIMEOUT_BUFFER = 20;

if (SESSION_TIMEOUT < SESSION_TIMEOUT_WARNING) {
  throw new Error(
    "SESSION_TIMEOUT must be greater than SESSION_TIMEOUT_WARNING"
  );
}

export const axiosClient = Axios.create({
  baseURL: API_PATH_PREFIX,
});

export const SHOW_MAX_TABLE_COLUMN_ITEMS = 2;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // TODO: Implement redirect to login.
    // https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose
    onError: (err, query) => console.log(err, query),
  }),
});
