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
  DataGridPremium,
  DataGridPremiumProps,
  useGridApiRef,
} from "@mui/x-data-grid-premium";
import { GridApiPremium } from "@mui/x-data-grid-premium/models/gridApiPremium";
import { GridInitialStatePremium } from "@mui/x-data-grid-premium/models/gridStatePremium";
import { useQuery, UseQueryForDataGridResult } from "../../tanstack/useQuery";
import {
  queryKeyAccountMeDataGrid,
  URL_DATAGRID_SETTINGS,
} from "../../../../models/account/common";
import { Account, useQueryMe } from "../../../../models/account/account";
import { QueryKey } from "@tanstack/react-query";
import { ScopeEnum } from "../../../globals";
import { axiosGet } from "../../../axios";
import { DataGridRead } from "../../../../models/account/datagrid";

// Abstraction type allowing to switch between different data grid implementations.
export type DataGridOptions = DataGridPremiumProps;
export type GridInitialState = GridInitialStatePremium;
export const MuiDataGrid = DataGridPremium;
export type GridApi = GridApiPremium;

export interface UseDataGridScopeResult<T> {
  me: Account;
  // Allows interacting with the DataGrid.
  apiRef: React.MutableRefObject<GridApi>;
  scope?: ScopeEnum;
  settingsUrl: string;
  settingsResetUrl: string;
  settingsQueryKey: QueryKey;
  querySettings: UseQueryForDataGridResult<DataGridRead>;
  // The properties of the useQuery hook.
  queryContext: UseQueryForDataGridResult<T>;
}

/**
 * This custom hook hosts all variables necessary to interact with a DataGrid.
 */
export const useDataGridScopeInfo = <T>(
  queryContext: UseQueryForDataGridResult<T>
): UseDataGridScopeResult<T> => {
  const apiRef = useGridApiRef();
  // We obtain the current user's data.
  const me = useQueryMe();
  const scope = queryContext.scope;
  const data = me.data!;

  const settingsUrl = React.useMemo(
    () => (scope && me ? URL_DATAGRID_SETTINGS.replace("{id}", scope) : ""),
    [scope, me]
  );

  const settingsResetUrl = React.useMemo(
    () => (settingsUrl ? settingsUrl + "/reset" : ""),
    [settingsUrl]
  );

  const settingsQueryKey: QueryKey = React.useMemo(
    () =>
      scope && me ? [...queryKeyAccountMeDataGrid, { dataGridId: scope }] : [],
    [scope, me]
  );

  // Obtain DataGrid configuration for DataGrid.
  const querySettings = useQuery(
    React.useMemo(
      () => ({
        url: settingsUrl,
        queryKey: settingsQueryKey,
        queryFn: async () => axiosGet<DataGridRead>(settingsUrl),
        select: (data: DataGridRead) => new DataGridRead(data),
        enabled: settingsQueryKey.length > 0 && settingsUrl.length > 0,
      }),
      [settingsQueryKey, settingsUrl]
    )
  );

  return React.useMemo(
    () => ({
      me: data,
      scope,
      apiRef,
      settingsUrl,
      queryContext,
      querySettings,
      settingsResetUrl,
      settingsQueryKey,
    }),
    [
      data,
      scope,
      apiRef,
      settingsUrl,
      queryContext,
      querySettings,
      settingsResetUrl,
      settingsQueryKey,
    ]
  );
};
