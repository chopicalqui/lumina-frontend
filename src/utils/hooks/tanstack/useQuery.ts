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
import { AxiosError } from "axios";
import { getStatusMessage } from "./useMutation";
import { StatusMessage } from "../../../models/common";
import { MetaInfoType, ScopeEnum } from "../../globals";

export interface ChildQueryOptions {
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
}

export interface UseQueryType<T> extends UseQueryOptions<T>, ChildQueryOptions {
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
  queryKey: QueryKey;
  statusMessage: StatusMessage | undefined;
}
interface IUseQueryMetaInfo extends ChildQueryOptions {
  metaInfo: MetaInfoType[];
}
export type UseQueryResult<T> = IUseQueryResult & UseQueryResultTanstack<T>;
export type UseQueryForDataGridResult<T> = UseQueryResult<T> &
  IUseQueryMetaInfo;

// This custom hook can be used to issue a GET request to the server.
export const useQuery = <T>(
  props: UseQueryDataGridType<T>
): UseQueryForDataGridResult<T> => {
  let statusMessage: StatusMessage | undefined = undefined;
  const {
    scope,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    metaInfo,
    queryKey,
    ...options
  } = props;
  const refreshOptions = React.useMemo(() => {
    return {
      staleTime: props.disableAutoRefresh ? Infinity : staleTime,
      gcTime: props.disableAutoRefresh ? Infinity : gcTime,
      refetchInterval: props.disableAutoRefresh ? false : refetchInterval,
      refetchOnWindowFocus: props.disableAutoRefresh
        ? false
        : refetchOnWindowFocus,
      refetchOnMount: props.disableAutoRefresh ? "always" : refetchOnMount,
      refetchOnReconnect: props.disableAutoRefresh ? false : refetchOnReconnect,
    };
  }, [
    props.disableAutoRefresh,
    staleTime,
    gcTime,
    refetchInterval,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
  ]);

  const query = useQueryTanstack({
    ...options,
    ...refreshOptions,
    queryKey: queryKey,
    enabled: options.enabled ?? true,
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

  return React.useMemo(() => {
    return {
      ...query,
      scope,
      queryKey: queryKey,
      statusMessage,
      metaInfo: metaInfo ?? [],
    };
  }, [query, scope, metaInfo, statusMessage, queryKey]);
};
