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
import SaveIcon from "@mui/icons-material/Save";
import { URL_FILTER_MENU_SUFFIX } from "../../../../models/account/common";
import Autocomplete, {
  AutocompleteOnBlurType,
  AutocompleteOnChangeType,
} from "../../../../components/inputs/Autocomplete";
import {
  DataGridFilterLookup,
  useQuerySelectedFilter,
} from "../../../../models/account/datagrid";
import { AutocompleteChangeReason } from "@mui/material";
import { GridFilterModel } from "@mui/x-data-grid";
import { useMutation } from "../../tanstack/useMutation";
import { axiosPut } from "../../../axios";
import { invalidateQueryKeys } from "../../../consts";
import { QueryKey } from "@tanstack/react-query";
import { AutoCompleteClass } from "../../../globals";
import { UseDataGridScopeResult } from "./useDataGridScopeInfo";

// Object used to clear the DataGrid filter.
export const CLEAR_FILTER: GridFilterModel = { items: [] };

export interface UseDataGridFilterManagerResults {
  // The DataGrid's filter URL.
  filterUrl: string;
  // The DataGrid's filter QueryKey.
  filterQueryKey: QueryKey;
  // The query key of the selected filter.
  selectedFilterQueryKey: QueryKey;
  // The Autocomplete component for the DataGrid filter.
  Autocomplete?: JSX.Element;
  // Callback fired when the value changes.
  onChange?: AutocompleteOnChangeType;
  // Callback fired when the TextField loses focus.
  onBlur?: AutocompleteOnBlurType;
  onFilterUpdate: () => void;
}

export const useDataGridFilterManager = <T,>(
  scopeInfo: UseDataGridScopeResult<T>
): UseDataGridFilterManagerResults => {
  const { apiRef, settingsUrl, settingsQueryKey, queryContext, querySettings } =
    scopeInfo;
  const currentFilter = apiRef.current?.exportState?.().filter?.filterModel;
  const { isSuccess, isFetching, isRefetching } = querySettings;
  const isProgrammaticUpdate = React.useRef(false); // Flag to prevent event trigger
  const isDataReady = React.useMemo(
    () => isSuccess && !isFetching && !isRefetching,
    [isSuccess, isFetching, isRefetching]
  );
  // Check if the current DataGrid filter is empty. In this case, we do not allow to save a new filter.
  const isFilterEmpty =
    currentFilter?.items?.length === 0 &&
    currentFilter?.quickFilterValues?.length === 0;

  /**
   * The URL to fetch the filters. It is used by the Autocomplete component.
   */
  const filterUrl = React.useMemo(
    () => settingsUrl + URL_FILTER_MENU_SUFFIX,
    [settingsUrl]
  );

  /**
   * The query key to fetch the filters. It is used by the Autocomplete component.
   */
  const filterQueryKey = React.useMemo(
    () => [...settingsQueryKey, "filter-menu"],
    [settingsQueryKey]
  );

  // Hook to obtain the selected Autocomplete item from the backend.
  const {
    data: value,
    queryKey: selectedFilterQueryKey,
    url: selectedFilterUrl,
  } = useQuerySelectedFilter(filterUrl, filterQueryKey);

  /**
   * Mutation to update the selected filter.
   */
  const mutationUpdateFilter = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosPut(selectedFilterUrl ?? "", data),
        onSuccess: () => invalidateQueryKeys(settingsQueryKey), // Automatically invalidates selectedFilterQueryKey
      }),
      [selectedFilterUrl, settingsQueryKey]
    )
  );

  /**
   * Callback fired when the user creates a new filter. It updates the filter object before it is sent to the backend.
   */
  const onNewFilterItem = React.useCallback(
    (name: string) => ({
      name,
      filter: apiRef.current.exportState().filter?.filterModel,
      data_grid_id: queryContext.scope,
    }),
    [apiRef, queryContext]
  );

  /**
   * This function is used to set the filter of the DataGrid.
   */
  const setFilter = React.useCallback(
    (value: DataGridFilterLookup) => {
      // If we add a new value, then the following happens:
      // - Once the filter is successfully created in the backend, on the onSuccess handler calls this function to set the filter.
      // - The Autcomplete component is updated with the new filter, which does not contain the filter attribute.
      //   and as a result, clears the filter again.
      // This if statement ensures that the second point is ignored.
      if (value && !("filter" in value)) return;

      const result = value?.filter ?? CLEAR_FILTER;
      isProgrammaticUpdate.current = true; // Suppress event
      apiRef.current?.setFilterModel?.(result);
      setTimeout(() => {
        isProgrammaticUpdate.current = false; // Allow user events again
      }, 0);
    },
    [isProgrammaticUpdate, apiRef]
  );

  /**
   * Mutation object for updating he backend in case of DataGrid onFilterModelChange events.
   */
  const mutateConfig = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosPut(settingsUrl + "?filter=true", data),
        onSuccess: () => invalidateQueryKeys(selectedFilterQueryKey),
      }),
      [settingsUrl, selectedFilterQueryKey]
    )
  );

  /**
   * DataGrid onFilterModelChange handler
   */
  const onFilterUpdate = React.useCallback(() => {
    if (isProgrammaticUpdate.current) {
      return; // Ignore programmatic updates
    }
    const result = apiRef.current.exportState();
    mutateConfig.mutate(result);
  }, [apiRef, mutateConfig]);

  /**
   * Callback fired when the value changes.
   */
  const onChange = React.useCallback(
    (
      _event: React.SyntheticEvent,
      newValue: any | any[] | null,
      _reason: AutocompleteChangeReason
    ) => {
      // Update the DataGrid filter.
      setFilter(newValue as DataGridFilterLookup);
      // Update the selected filter in the backend.
      mutationUpdateFilter.mutate({ selected_filter_id: newValue?.id });
    },
    [setFilter, mutationUpdateFilter]
  );

  /**
   * Called when a new Filter item was successfully created.
   */
  const onCreateSuccessHandler = React.useCallback(
    (data: AutoCompleteClass) => {
      invalidateQueryKeys(settingsQueryKey);
      setFilter(data as DataGridFilterLookup);
    },
    [setFilter, settingsQueryKey]
  );

  const onDeleteSuccessHandler = React.useCallback(() => {
    invalidateQueryKeys(settingsQueryKey);
  }, [settingsQueryKey]);

  /**
   * The Autocomplete component for the DataGrid filter.
   */
  const AutocompleteComponent = React.useMemo(
    () =>
      isDataReady ? (
        <Autocomplete
          key="filter-autocomplete"
          field=""
          label={undefined}
          value={value}
          placeholder="Save Filter..."
          size="small"
          variant="standard"
          freeSolo={!isFilterEmpty}
          queryUrl={filterUrl}
          queryKey={filterQueryKey}
          allowDelete={true}
          startAdornment={() => <SaveIcon fontSize="small" sx={{ mr: 1 }} />}
          sxTextfield={{
            "& .MuiInput-underline:before": {
              borderBottonWidht: "1px",
              borderBottonStyle: "solid",
              borderBottomColor: "var(--mui-palette-divider)",
            },
          }}
          onCreateHandler={onNewFilterItem}
          onCreateSuccessHandler={onCreateSuccessHandler}
          onDeleteSuccessHandler={onDeleteSuccessHandler}
          postInvalidateQueryKeys={[]}
          deleteInvalidateQueryKeys={[]}
          onChange={onChange}
        />
      ) : undefined,
    [
      isDataReady,
      isFilterEmpty,
      filterUrl,
      filterQueryKey,
      value,
      onNewFilterItem,
      onCreateSuccessHandler,
      onDeleteSuccessHandler,
      //settingsQueryKey,
      onChange,
    ]
  );

  return React.useMemo(
    () => ({
      scopeInfo,
      filterUrl,
      setFilter,
      filterQueryKey,
      onFilterUpdate,
      Autocomplete: AutocompleteComponent,
      selectedFilterQueryKey,
    }),
    [
      scopeInfo,
      filterUrl,
      setFilter,
      filterQueryKey,
      onFilterUpdate,
      AutocompleteComponent,
      selectedFilterQueryKey,
    ]
  );
};
