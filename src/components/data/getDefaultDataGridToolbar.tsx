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

import { Box, Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import { QueryKey } from "@tanstack/react-query";
import { queryClient } from "../../utils/consts";
import { Account } from "../../models/account/account";
import { ScopeEnum } from "../../utils/globals";
import { GridToolbarContainer } from "@mui/x-data-grid";

/**
 * Defines the properties for the DataGrid's default toolbar.
 */
export interface DefaultToolbarProps {
  // The account of the current user.
  me: Account;
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
  // The default toolbar has a button to create a new item. This property defines the name of the button.
  createButtonName?: string;
  // The default toolbar has a button to create a new item. This property defines the click handler of the button.
  onCreateButtonClick?: () => void;
  // The DataGrid's query key. This is used to invalidate the query when the refresh button is clicked.
  queryKey?: QueryKey;
  // Additional elements for the toolbar.
  elements?: JSX.Element[];
}

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

export const getDefaultGridToolbar = ({
  me,
  scope,
  createButtonName,
  onCreateButtonClick,
  queryKey,
  elements,
}: DefaultToolbarProps) => {
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
  return () => <GridToolbarContainer>{result}</GridToolbarContainer>;
};
