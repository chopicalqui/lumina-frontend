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
import {
  UseQueryResult,
  UseQueryForDataGridResult,
} from "../tanstack/useQuery";
import {
  DataGridPremium,
  DataGridPremiumProps,
  GridActionsColDef,
  GridColDef,
  GridColumnVisibilityModel,
  useGridApiRef,
} from "@mui/x-data-grid-premium";
import { Account } from "../../../models/account/account";
import { ScopeEnum } from "../../globals";
import { getDefaultGridToolbar } from "../../../components/data/getDefaultDataGridToolbar";

// Abstraction type allowing to switch between different data grid implementations.
export type DataGridOptions = DataGridPremiumProps;
export const MuiDataGrid = DataGridPremium;

/**
 * This interface defines the properties of the useDataGrid hook.
 */
export interface UseDataGridOptions<T> {
  // The account of the current user.
  me: Account;
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
  // The properties of the useQuery hook.
  queryContext: UseQueryForDataGridResult<T>;
  // The properties of the DataGrid component.
  dataGrid?: DataGridOptions;
  // Actions that are attached to each DataGrid row.
  rowActions?: GridActionsColDef;
}

export interface UseDataGridReturn<T> extends DataGridOptions {
  queryContext: UseQueryResult<T>;
}

/**
 * This custom hook can be used to issue a GET request to the server and to obtain the configuration for a MUI DataGrid.
 */
export const useDataGrid = <T>({
  me,
  scope,
  queryContext,
  dataGrid,
  rowActions,
}: UseDataGridOptions<T>): UseDataGridReturn<T> => {
  const apiRef = useGridApiRef();

  // Prepare the DataGrid column definition
  const dataGridColumns: GridColDef[] = React.useMemo(() => {
    const result: GridColDef[] = [];
    const columns = queryContext.metaInfo.map((x) => x.dataGridInfo);
    if (rowActions) {
      result.push(rowActions, ...columns);
    } else {
      result.push(...columns);
    }
    return result;
  }, [rowActions, queryContext.metaInfo]);

  // Prepare the DataGrid column visibility model
  const columnVisibilityModel: GridColumnVisibilityModel = React.useMemo(() => {
    const result: GridColumnVisibilityModel = {};
    queryContext.metaInfo.forEach((x) => {
      result[x.dataGridInfo.field] = x.visibleDataGrid ?? true;
    });
    return result;
  }, [queryContext.metaInfo]);

  const slots = React.useMemo(() => {
    return {
      toolbar: getDefaultGridToolbar({
        me: me!,
        scope,
        queryKey: queryContext.queryKey,
      }),
    };
  }, [scope, me, queryContext.queryKey]);

  // Prepare the DataGrid data
  const data = React.useMemo(
    () => (queryContext.isSuccess ? queryContext.data : []) as any[],
    [queryContext.isSuccess, queryContext.data]
  );

  if (scope && !scope?.startsWith("datagrid_"))
    throw new Error(
      `The given id '${scope}' is invalid. The id must start with 'datagrid_'.`
    );

  return {
    ...dataGrid,
    apiRef,
    columns: dataGridColumns,
    rows: data,
    columnVisibilityModel: columnVisibilityModel,
    queryContext,
    slots,
  };
};
