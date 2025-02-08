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
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { invalidateQueryKeys } from "../../../consts";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { GridApi, UseDataGridScopeResult } from "./useDataGridScopeInfo";
import { UseDataGridFilterManagerResults } from "./useDataGridFilterManager";

/**
 * The default toolbar for the DataGrid.
 */
export const defaultGridTools = [
  <GridToolbarColumnsButton key="columns-button" />,
  <GridToolbarFilterButton key="filter-button" />,
  <GridToolbarExport
    key="export-button"
    slotProps={{
      tooltip: { title: "Export data" },
    }}
  />,
  <GridToolbarQuickFilter key="quick-filter-button" debounceMs={1000} />,
];

export interface DefaultDataGridToolbarOptions {
  // Additional elements for the toolbar.
  elements?: JSX.Element[];
  // The default toolbar has a button to create a new item. This property defines the name of the button.
  createButtonName?: string;
  // The default toolbar has a button to create a new item. This property defines the click handler of the button.
  onCreateButtonClick?: () => void;
}

/**
 * Defines the properties for the DataGrid's default toolbar.
 */
export interface UseDefaultDataGridToolbarOptions<T>
  extends DefaultDataGridToolbarOptions {
  // Allows interacting with the DataGrid
  apiRef: React.MutableRefObject<GridApi>;
  // Additional elements for the toolbar.
  elements?: JSX.Element[];
  // General information about the DataGrid.
  scopeInfo: UseDataGridScopeResult<T>;
  // The object to manage the DataGrid filter.
  filterManager?: UseDataGridFilterManagerResults;
  // The function to reset the DataGrid layout
  onResetSettings?: () => void;
  // The default toolbar has a button to create a new item. This property defines the name of the button.
  createButtonName?: string;
  // The default toolbar has a button to create a new item. This property defines the click handler of the button.
  onCreateButtonClick?: () => void;
}

/**
 * This hook returns the default toolbar for the DataGrid.
 */
export const useDefaultDataGridToolbar = <T,>({
  elements,
  scopeInfo,
  onResetSettings,
  createButtonName,
  onCreateButtonClick,
  filterManager,
}: UseDefaultDataGridToolbarOptions<T>) => {
  const { me, queryContext } = scopeInfo;
  const { queryKey, scope } = queryContext;
  const Autocomplete = filterManager?.Autocomplete;

  const result = React.useMemo(() => {
    const result = [...defaultGridTools, ...(elements ?? [])];
    const createButtonAccess = me.hasCreateAccess(scope);
    if (createButtonAccess && onCreateButtonClick) {
      result.push(
        <Button
          key="create-new-button"
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onCreateButtonClick}
        >
          {createButtonName ? createButtonName : "New"}
        </Button>
      );
    }

    if (queryKey) {
      result.push(<Box key="flex-grow-box" sx={{ flexGrow: 1 }} />);
      // If a filterManager is present, then we display the Autocomplete component.
      if (Autocomplete) {
        result.push(
          <Box key="filter-drop-down" sx={{ width: "250px" }}>
            {Autocomplete}
          </Box>
        );
      }
      result.push(
        <Tooltip title="Refresh" key="refresh-button">
          <IconButton
            key="refresh-button"
            aria-label="refresh"
            size="small"
            color="primary"
            onClick={() => invalidateQueryKeys(queryKey)}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      );
    }
    if (onResetSettings) {
      result.push(
        <Tooltip title="Reset Layout" key="reset-settings-button">
          <IconButton
            key="reset-layout-button"
            aria-label="reset-layout"
            size="small"
            color="primary"
            onClick={onResetSettings}
          >
            <ClearIcon />
          </IconButton>
        </Tooltip>
      );
    }
    return result;
  }, [
    me,
    createButtonName,
    onCreateButtonClick,
    onResetSettings,
    queryKey,
    scope,
    elements,
    Autocomplete,
  ]);
  return React.useCallback(
    () => <GridToolbarContainer>{result}</GridToolbarContainer>,
    [result]
  );
};
