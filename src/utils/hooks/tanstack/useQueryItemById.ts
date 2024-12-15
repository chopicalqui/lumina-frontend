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

import { QueryKey } from "@tanstack/react-query";
import { ClassType, ScopeEnum } from "../../globals";
import { MetaInfoType } from "../../../components/inputs/controlFactoryUtils";
import { useQuery } from "./useQuery";
import { axiosGet } from "../../axios";
import React from "react";
import { GridRowId } from "@mui/x-data-grid";

/**
 * Hook to query a single item by its ID.
 */
export const useQueryItemById = <T>(
  ClassRef: ClassType<T>,
  baseQueryKey: QueryKey,
  baseUrl: string,
  metaInfo: MetaInfoType[],
  rowId?: GridRowId,
  scope?: ScopeEnum
) => {
  const url = React.useMemo(() => `${baseUrl}/${rowId}`, [baseUrl, rowId]);
  const queryKey = React.useMemo(
    () => (rowId ? [...baseQueryKey, rowId] : []),
    [baseQueryKey, rowId]
  );
  return useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKey,
        queryFn: async () => axiosGet<T>(url),
        select: (data: T) => new ClassRef(data),
        enabled: !!rowId,
        disableAutoRefresh: true,
        refetchOnMount: "always",
        metaInfo: metaInfo,
        scope: scope,
      }),
      [ClassRef, queryKey, url, metaInfo, scope, rowId]
    )
  );
};
