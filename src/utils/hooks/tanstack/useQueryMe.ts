/**
 * This file is part of Guardian.
 *
 * Guardian is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Guardian is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Guardian. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import {
  URL_ACCOUNTS_ME,
  queryKeyAccountMe,
} from "../../../models/account/common";
import { Account } from "../../../models/account/account";
import { useLuminaQuery } from "./useQuery";
import { AxiosError } from "axios";
import { StatusMessage } from "../../../models/common";

// This custom hook can be used to access the information of the currently logged in user.
export const useQueryMe = () =>
  useLuminaQuery<Account, AxiosError<StatusMessage, any>, Account>({
    queryKey: queryKeyAccountMe,
    path: URL_ACCOUNTS_ME,
    staleTime: 1000 * 60 * 25, // 25 minutes
    retry: 0,
  });
