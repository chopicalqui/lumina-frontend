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
  useQuery as useQueryTanstack,
  UseQueryOptions,
  UseQueryResult as UseQueryResultTanstack,
  QueryKey,
} from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getStatusMessage } from "./useMutation";
import { StatusMessage } from "../../../models/common";
import { ScopeEnum } from "../../globals";
import { GridRowId } from "@mui/x-data-grid";
import { MetaInfoType } from "../../../components/inputs/controlFactoryUtils";

export interface ChildQueryOptions {
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
  // The query key of the current DataGrid.
  rowId?: GridRowId;
}

export interface UseQueryType<T> extends UseQueryOptions<T>, ChildQueryOptions {
  // The URL used by the queryFn function.
  url: string;
  // Object containing the query parameters.
  params?: T;
  // If false, it disables this query from automatically running.
  enabled?: boolean;
  // If set to true, the query will not perform any type of refetch except on mount events.
  disableAutoRefresh?: boolean;
}

export interface UseQueryDataGridType<T> extends UseQueryType<T> {
  metaInfo?: MetaInfoType[];
}

interface IUseQueryResult {
  url: string;
  queryKey: QueryKey;
  // TODO: statusMessage should be removed and information should always be populated directly by error in error.response.data
  statusMessage: StatusMessage | undefined;
}
interface IUseQueryMetaInfo extends ChildQueryOptions {
  metaInfo: MetaInfoType[];
}
export type UseQueryResult<T> = IUseQueryResult &
  UseQueryResultTanstack<T, AxiosError<StatusMessage>>;
export type UseQueryForDataGridResult<T> = UseQueryResult<T> &
  IUseQueryMetaInfo;

// This custom hook can be used to issue a GET request to the server.
export const useQuery = <T>({
  url,
  scope,
  staleTime,
  gcTime,
  refetchInterval,
  refetchOnWindowFocus,
  refetchOnMount,
  refetchOnReconnect,
  metaInfo,
  queryKey,
  disableAutoRefresh,
  ...options
}: UseQueryDataGridType<T>): UseQueryForDataGridResult<T> => {
  let statusMessage: StatusMessage | undefined = undefined;
  const refreshOptions = React.useMemo(
    () => ({
      staleTime: disableAutoRefresh ? Infinity : (staleTime ?? 0),
      gcTime: disableAutoRefresh ? Infinity : gcTime,
      refetchInterval: disableAutoRefresh ? false : refetchInterval,
      refetchOnWindowFocus: disableAutoRefresh
        ? false
        : (refetchOnWindowFocus ?? "always"),
      refetchOnMount: disableAutoRefresh ? false : (refetchOnMount ?? "always"),
      refetchOnReconnect: disableAutoRefresh
        ? false
        : (refetchOnReconnect ?? true),
    }),
    [
      disableAutoRefresh,
      staleTime,
      gcTime,
      refetchInterval,
      refetchOnWindowFocus,
      refetchOnMount,
      refetchOnReconnect,
    ]
  );

  const query = useQueryTanstack({
    ...options,
    ...refreshOptions,
    queryKey: queryKey,
    enabled: options.enabled ?? true,
    retry: React.useCallback((failureCount: number, error: Error) => {
      // Abort retries if the error status code is 401
      if (
        axios.isAxiosError(error) &&
        [401, 500].includes(error.response?.status ?? 0)
      ) {
        return false; // Do not retry
      }
      return failureCount < 3; // Retry up to 3 times for other errors
    }, []),
  }) as UseQueryResultTanstack<T, AxiosError<StatusMessage>>;

  statusMessage = React.useMemo(
    () =>
      getStatusMessage(
        query.isError,
        query.isSuccess,
        query.data,
        query.error as AxiosError<StatusMessage>
      ),
    [query.isError, query.isSuccess, query.data, query.error]
  );

  return React.useMemo(
    () => ({
      ...query,
      url,
      scope,
      queryKey: queryKey,
      statusMessage,
      metaInfo: metaInfo ?? [],
    }),
    [url, query, scope, metaInfo, statusMessage, queryKey]
  );
};
