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
import { UseQueryResult } from "../../tanstack/useQuery";
import {
  GridActionsColDef,
  GridColDef,
  GridColumnVisibilityModel,
} from "@mui/x-data-grid-premium";
import {
  DefaultDataGridToolbarOptions,
  useDefaultDataGridToolbar,
} from "./useDefaultDataGridToolbar";
import { useMutation } from "../../tanstack/useMutation";
import { UseMutationResult } from "../../tanstack/useMutation";
import { invalidateQueryKeys } from "../../../consts";
import { axiosPut } from "../../../axios";
import { useConfirmDialog, UseConfirmDialogOptions } from "../useConfirmDialog";
import {
  DataGridRead,
  DataGridFilterLookup,
} from "../../../../models/account/datagrid";
import { UseDataGridFilterManagerResults } from "./useDataGridFilterManager";
import {
  DataGridOptions,
  UseDataGridScopeResult,
} from "./useDataGridScopeInfo";

/**
 * This interface defines the properties of the useDataGrid hook.
 */
export interface UseDataGridOptions<T> extends DefaultDataGridToolbarOptions {
  // The properties of the DataGrid component.
  dataGrid?: DataGridOptions;
  // Actions that are attached to each DataGrid row.
  rowActions?: GridActionsColDef;
  // General information about the DataGrid.
  scopeInfo: UseDataGridScopeResult<T>;
  // Optional filter manager that allows users to manage their filters.
  filterManager?: UseDataGridFilterManagerResults;
}

export interface UseDataGridResult<T> extends DataGridOptions {
  queryContext: UseQueryResult<T>;
  selectedFilter?: DataGridFilterLookup;
  querySettings: UseQueryResult<DataGridRead>;
  mutateResetConfig: UseMutationResult;
  confirmResetDialogOptions: UseConfirmDialogOptions;
  scopeInfo: UseDataGridScopeResult<T>;
}

/**
 * This custom hook can be used to issue a GET request to the server and to obtain the configuration for a MUI DataGrid.
 */
export const useDataGrid = <T>({
  scopeInfo,
  dataGrid,
  rowActions,
  createButtonName,
  onCreateButtonClick,
  elements,
  filterManager,
}: UseDataGridOptions<T>): UseDataGridResult<T> => {
  const {
    apiRef,
    settingsUrl,
    queryContext,
    querySettings,
    settingsResetUrl,
    settingsQueryKey,
  } = scopeInfo;
  const onFilterUpdate = filterManager?.onFilterUpdate;
  const selectedFilterQueryKey = filterManager?.selectedFilterQueryKey;

  /**
   * Update DataGrid configuration for DataGrid.
   */
  const mutateConfig = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosPut(settingsUrl, data),
        onSuccess: () => invalidateQueryKeys(settingsQueryKey),
      }),
      [settingsUrl, settingsQueryKey]
    )
  );

  /**
   * Reset DataGrid configuration for DataGrid.
   */
  const mutateResetConfig = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async () => axiosPut(settingsResetUrl),
        onSuccess: () =>
          invalidateQueryKeys(settingsQueryKey, selectedFilterQueryKey),
      }),
      [settingsResetUrl, settingsQueryKey, selectedFilterQueryKey]
    )
  );

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
  const dataGridToolbar = useDefaultDataGridToolbar(
    React.useMemo(
      () => ({
        apiRef,
        elements,
        scopeInfo,
        filterManager,
        onResetSettings,
        createButtonName,
        onCreateButtonClick,
      }),
      [
        apiRef,
        elements,
        scopeInfo,
        filterManager,
        onResetSettings,
        createButtonName,
        onCreateButtonClick,
      ]
    )
  );

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
      .filter((x) => x.dataGridInfo && x?.visibleDataGrid === false)
      .forEach((x) => {
        result[x.dataGridInfo!.field] = false;
      });
    return result;
  }, [queryContext.metaInfo]);

  // We ensure that per default, the initially hidden columns are part of the initialState object.
  const initialState = React.useMemo(
    () =>
      Object.keys(querySettings?.data?.settings ?? {}).length > 0
        ? querySettings?.data?.settings
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
    const columns = queryContext.metaInfo
      .filter((x) => x.dataGridInfo !== undefined)
      .map((x) => x.dataGridInfo!);
    if (rowActions) {
      result.push(rowActions, ...columns);
    } else {
      result.push(...columns);
    }
    return result;
  }, [rowActions, queryContext.metaInfo]);

  return React.useMemo(
    () => ({
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
      selectedFilter: querySettings?.data?.selectedFilter,
      // Events to update updates on the DataGrid configuration in the backend.
      onColumnVisibilityModelChange: onConfigUpdate,
      onColumnWidthChange: onConfigUpdate,
      onFilterModelChange: onFilterUpdate ?? onConfigUpdate,
      onSortModelChange: onConfigUpdate,
      onColumnOrderChange: onConfigUpdate,
      confirmResetDialogOptions,
      filterManager,
      scopeInfo,
    }),
    [
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
      onFilterUpdate,
      confirmResetDialogOptions,
      filterManager,
      scopeInfo,
    ]
  );
};
