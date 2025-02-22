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
import { useDataGrid } from "../utils/hooks/mui/datagrid/useDataGrid";
import DataGrid from "../components/data/DataGrid";
import { DetailsDialogMode, ScopeEnum } from "../utils/globals";
import { useDefaultDataGridRowActions } from "../utils/hooks/mui/datagrid/useDefaultDataGridRowActions";
import { useDetailsDialog } from "../utils/hooks/mui/useDetailsDialog";
import CountryDetailsDialog from "./dialogs/CountryDetailsDialog";
import { useDataGridScopeInfo } from "../utils/hooks/mui/datagrid/useDataGridScopeInfo";
import { useDataGridFilterManager } from "../utils/hooks/mui/datagrid/useDataGridFilterManager";
import { useQueryCountries } from "../models/country";

const Countries = React.memo(() => {
  // We query all access tokens for the DataGrid.
  const queryContext = useQueryCountries(
    React.useMemo(() => ({ scope: ScopeEnum.DataGridCountry }), [])
  );
  // Gather general information required by DataGrid hooks.
  const scopeInfo = useDataGridScopeInfo(queryContext);
  // Allow the user to manage DataGrid filters.
  const filterManager = useDataGridFilterManager(scopeInfo);
  // We obtain the context to open the details dialog for adding new or editing/viewing existing access tokens.
  const { onOpen, ...detailsDialogContext } = useDetailsDialog(
    React.useMemo(() => ({ name: "Country" }), [])
  );
  // We obtain the default row actions for the DataGrid.
  const rowActions = useDefaultDataGridRowActions(
    React.useMemo(
      () => ({
        scopeInfo,
        view: {
          onClick: (params) => {
            onOpen({
              rowId: params.id,
              mode: DetailsDialogMode.View,
              open: true,
            });
          },
        },
        edit: {
          onClick: (params) => {
            onOpen({
              rowId: params.id,
              mode: DetailsDialogMode.Edit,
              open: true,
            });
          },
        },
      }),
      [scopeInfo, onOpen]
    )
  );
  // We obtain the DataGrid configuration.
  const dataGrid = useDataGrid(
    React.useMemo(
      () => ({
        scopeInfo,
        rowActions,
        filterManager,
      }),
      [scopeInfo, rowActions, filterManager]
    )
  );

  return (
    <>
      {/* We newly mount the CountryDetailsDialog component each time to ensure the country data is newly fetched from the backend. */}
      {detailsDialogContext.open && (
        <CountryDetailsDialog context={detailsDialogContext} />
      )}
      <DataGrid {...dataGrid} />
    </>
  );
});

export default Countries;
