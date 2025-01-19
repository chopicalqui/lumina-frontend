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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */
import React from "react";
import { useMutation } from "./useMutation";
import { axiosPost } from "../../axios";
import { queryKeyAccountMe, URL_RENEW } from "../../../models/account/common";
import { queryClient } from "../../consts";

/**
 * Hook that allows renewing the session.
 */
export const useRenewMutation = () =>
  useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosPost(URL_RENEW, data),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: queryKeyAccountMe }),
      }),
      []
    )
  );
