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
import { axiosClient } from "../../consts.ts";
import {
  useQuery as useQueryTanstack,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { handleError } from "./useMutation";
import { StatusMessage } from "../../../models/common";

interface UseQueryType<Q, R> extends UseQueryOptions {
  // The path of the REST API endpoint.
  path: string;
  // Object containing the query parameters.
  params?: Q;
  // Conversion method to convert the response data to the desired format.
  convertFn?: (data: any[]) => R;
  // If false, it disables this query from automatically running.
  enabled?: boolean;
}
export interface UseLuminaQueryResult<T, Error> {
  query: UseQueryResult<T, Error>;
  statusMessage: StatusMessage | undefined;
}

// This custom hook can be used to issue a GET request to the server.
export const useLuminaQuery = <T, Q = AxiosError<StatusMessage>, R = T>(
  props: UseQueryType<Q, R>
): UseLuminaQueryResult<T, Error> => {
  let statusMessage: StatusMessage | undefined = undefined;
  const { path, queryKey, params, ...options } = props;
  const query = useQueryTanstack({
    ...options,
    queryKey: queryKey,
    enabled: options.enabled ?? true,

    queryFn: React.useCallback(() => {
      // console.debug(`Query: ${URL_USERS_ME}`);
      return axiosClient
        .get(path, {
          /*signal: signal*/
          params,
        })
        .then((response) => response.data);
    }, [path, params]),
  }) as UseQueryResult<T, Error>;

  statusMessage = handleError(
    query.isError,
    query.error as AxiosError<StatusMessage>
  );

  return React.useMemo(() => {
    return {
      query,
      statusMessage,
    };
  }, [query, statusMessage]);
};
