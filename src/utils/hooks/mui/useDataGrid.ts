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
  useQuery,
} from "../tanstack/useQuery";
import {
  DataGridPremium,
  DataGridPremiumProps,
  GridActionsColDef,
  GridColDef,
  GridColumnVisibilityModel,
  useGridApiRef,
  GridInitialState,
} from "@mui/x-data-grid-premium";
import { Account } from "../../../models/account/account";
import {
  DefaultDataGridToolbarOptions,
  useDefaultDataGridToolbar,
} from "./useDefaultDataGridToolbar";
import { useMutation } from "../tanstack/useMutation";
import {
  queryKeyAccountMeDataGrid,
  URL_DATAGRID_SETTINGS,
} from "../../../models/account/common";
import { QueryKey } from "@tanstack/react-query";
import { UseMutationResult } from "../tanstack/useMutation";
import { queryClient } from "../../consts";
import { axiosGet, axiosPut } from "../../axios";
import { useConfirmDialog, UseConfirmDialogOptions } from "./useConfirmDialog";

// Abstraction type allowing to switch between different data grid implementations.
export type DataGridOptions = DataGridPremiumProps;
export const MuiDataGrid = DataGridPremium;

/**
 * This interface defines the properties of the useDataGrid hook.
 */
export interface UseDataGridOptions<T> extends DefaultDataGridToolbarOptions {
  // The account of the current user.
  me: Account;
  // The properties of the useQuery hook.
  queryContext: UseQueryForDataGridResult<T>;
  // The properties of the DataGrid component.
  dataGrid?: DataGridOptions;
  // Actions that are attached to each DataGrid row.
  rowActions?: GridActionsColDef;
}

export interface UseDataGridResult<T> extends DataGridOptions {
  queryContext: UseQueryResult<T>;
  querySettings: UseQueryResult<GridInitialState>;
  mutateConfig: UseMutationResult;
  mutateResetConfig: UseMutationResult;
  confirmResetDialogOptions: UseConfirmDialogOptions;
}

/**
 * This custom hook can be used to issue a GET request to the server and to obtain the configuration for a MUI DataGrid.
 */
export const useDataGrid = <T>({
  me,
  queryContext,
  dataGrid,
  rowActions,
  createButtonName,
  onCreateButtonClick,
  elements,
}: UseDataGridOptions<T>): UseDataGridResult<T> => {
  const apiRef = useGridApiRef();
  const scope = queryContext.scope;
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
  const querySettings = useQuery<GridInitialState>({
    queryKey: settingsQueryKey,
    queryFn: React.useCallback(
      async () => axiosGet<GridInitialState>(settingsUrl),
      [settingsUrl]
    ),
    enabled: settingsQueryKey.length > 0 && settingsUrl.length > 0,
  });

  // Update DataGrid configuration for DataGrid.
  const mutateConfig = useMutation({
    mutationFn: React.useCallback(
      async (data: any) => axiosPut(settingsUrl, data),
      [settingsUrl]
    ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: settingsQueryKey }),
  });

  // Reset DataGrid configuration for DataGrid.
  const mutateResetConfig = useMutation({
    mutationFn: React.useCallback(
      async () => axiosPut(settingsResetUrl),
      [settingsResetUrl]
    ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: settingsQueryKey }),
  });

  const { showDialog: showConfirmResetDialog, ...confirmResetDialogOptions } =
    useConfirmDialog();

  // This function is used by the DataGrid component to handle configuration updates.
  const onResetSettings = React.useCallback(
    () =>
      showConfirmResetDialog({
        title: "Reset DataGrid Configuration",
        message: "Are you sure you want to reset the DataGrid configuration?",
        onConfirm: () => mutateResetConfig.mutate({}),
      }),
    [mutateResetConfig, showConfirmResetDialog]
  );

  // Prepare the default DataGrid toolbar
  const dataGridToolbar = useDefaultDataGridToolbar({
    queryContext,
    me: me,
    onResetSettings,
    createButtonName,
    onCreateButtonClick,
    elements,
  });

  // Prepare the default DataGrid slots
  const slots = React.useMemo(() => {
    return {
      toolbar: dataGridToolbar,
    };
  }, [dataGridToolbar]);

  // Prepare the DataGrid data
  const data = React.useMemo(
    () => (queryContext.isSuccess ? queryContext.data : []) as any[],
    [queryContext.isSuccess, queryContext.data]
  );

  // This function is used by the DataGrid component to handle configuration updates.
  const onConfigUpdate = React.useCallback(() => {
    const result = apiRef.current.exportState();
    mutateConfig.mutate(result);
  }, [mutateConfig, apiRef]);

  // We extract all columns that are initially hidden.
  const columnVisibilityModel: GridColumnVisibilityModel = React.useMemo(() => {
    const result: GridColumnVisibilityModel = {};
    queryContext.metaInfo
      .filter((x) => x?.visibleDataGrid === false)
      .forEach((x) => {
        result[x.dataGridInfo.field] = false;
      });
    return result;
  }, [queryContext.metaInfo]);

  // We ensure that per default, the initially hidden columns are part of the initialState object.
  const initialState = React.useMemo(
    () =>
      Object.keys(querySettings?.data ?? {}).length > 0
        ? querySettings?.data
        : {
            columns: {
              columnVisibilityModel,
            },
          },
    [querySettings, columnVisibilityModel]
  );

  // Prepare the DataGrid column definition
  const columns: GridColDef[] = React.useMemo(() => {
    const result: GridColDef[] = [];
    const columns = queryContext.metaInfo.map((x) => x.dataGridInfo);
    if (rowActions) {
      result.push(rowActions, ...columns);
    } else {
      result.push(...columns);
    }
    return result;
  }, [rowActions, queryContext.metaInfo]);

  return React.useMemo(() => {
    return {
      ...dataGrid,
      apiRef,
      rows: data,
      columns,
      initialState,
      queryContext,
      querySettings,
      mutateConfig,
      mutateResetConfig,
      slots,
      // Events to update updates on the DataGrid configuration in the backend.
      onColumnVisibilityModelChange: onConfigUpdate,
      onColumnWidthChange: onConfigUpdate,
      onFilterModelChange: onConfigUpdate,
      onSortModelChange: onConfigUpdate,
      onColumnOrderChange: onConfigUpdate,
      confirmResetDialogOptions,
    };
  }, [
    dataGrid,
    apiRef,
    data,
    columns,
    initialState,
    querySettings,
    queryContext,
    mutateConfig,
    mutateResetConfig,
    slots,
    onConfigUpdate,
    confirmResetDialogOptions,
  ]);
};
