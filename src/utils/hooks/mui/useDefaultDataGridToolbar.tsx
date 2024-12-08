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
import { queryClient } from "../../consts";
import { Account } from "../../../models/account/account";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { UseQueryForDataGridResult } from "../tanstack/useQuery";

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
  // The default toolbar has a button to create a new item. This property defines the name of the button.
  createButtonName?: string;
  // The default toolbar has a button to create a new item. This property defines the click handler of the button.
  onCreateButtonClick?: () => void;
  // Additional elements for the toolbar.
  elements?: JSX.Element[];
}

/**
 * Defines the properties for the DataGrid's default toolbar.
 */
export interface UseDefaultDataGridToolbarOptions<T>
  extends DefaultDataGridToolbarOptions {
  // The account of the current user.
  me: Account;
  // The properties of the useQuery hook.
  queryContext: UseQueryForDataGridResult<T>;
  // The default toolbar has a button to create a new item. This property defines the name of the button.
  createButtonName?: string;
  // The default toolbar has a button to create a new item. This property defines the click handler of the button.
  onCreateButtonClick?: () => void;
  // Additional elements for the toolbar.
  elements?: JSX.Element[];
  // The function to reset the DataGrid layout
  onResetSettings?: () => void;
}

/**
 * This hook returns the default toolbar for the DataGrid.
 */
export const useDefaultDataGridToolbar = <T,>({
  me,
  queryContext,
  createButtonName,
  onCreateButtonClick,
  elements,
  onResetSettings,
}: UseDefaultDataGridToolbarOptions<T>) => {
  const { queryKey, scope } = queryContext;
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
      result.push(
        <Tooltip title="Refresh" key="refresh-button">
          <IconButton
            key="refresh-button"
            aria-label="refresh"
            size="small"
            color="primary"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: queryKey,
              })
            }
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
  ]);
  return React.useCallback(
    () => <GridToolbarContainer>{result}</GridToolbarContainer>,
    [result]
  );
};
