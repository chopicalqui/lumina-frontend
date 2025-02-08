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
import { DetailsDialogMode, ScopeEnum } from "../utils/globals";
import {
  useDeleteAccessTokens,
  useQueryAccessTokens,
} from "../models/account/access_token";
import { useDefaultDataGridRowActions } from "../utils/hooks/mui/datagrid/useDefaultDataGridRowActions";
import { useDataGrid } from "../utils/hooks/mui/datagrid/useDataGrid";
import DataGrid from "../components/data/DataGrid";
import AccessTokenDetailsDialog from "./dialogs/account/AccessTokenDetailsDialog";
import { useDetailsDialog } from "../utils/hooks/mui/useDetailsDialog";
import ConfirmationDialog, {
  ConfirmationDialogOptions,
} from "../components/feedback/dialogs/ConfirmDialog";
import { useDataGridScopeInfo } from "../utils/hooks/mui/datagrid/useDataGridScopeInfo";
import { useDataGridFilterManager } from "../utils/hooks/mui/datagrid/useDataGridFilterManager";

const AccessTokens = React.memo(() => {
  // We query all access tokens for the DataGrid.
  const queryContext = useQueryAccessTokens(
    React.useMemo(
      () => ({
        scope: ScopeEnum.DataGridAccessToken,
      }),
      []
    )
  );
  // Gather general information required by DataGrid hooks.
  const scopeInfo = useDataGridScopeInfo(queryContext);
  // Allow the user to manage DataGrid filters.
  const filterManager = useDataGridFilterManager(scopeInfo);
  // We obtain the context to open the details dialog for adding new or editing/viewing existing access tokens.
  const { onOpen, ...detailsDialogContext } = useDetailsDialog(
    React.useMemo(
      () => ({ name: "Access Token", displayAddAndCloseButton: false }),
      []
    )
  );
  // We obtain the Tanstack mutation to allow deleting access tokens.
  const {
    showDialog: showConfirmDeleteDialog,
    mutation: mutateDelete,
    ...confirmDeleteDialogOptions
  } = useDeleteAccessTokens();
  // We obtain the default row actions for the DataGrid.
  const rowActions = useDefaultDataGridRowActions(
    React.useMemo(
      () => ({
        scopeInfo,
        delete: {
          onClick: (params) => showConfirmDeleteDialog(params.id),
        },
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
      [scopeInfo, onOpen, showConfirmDeleteDialog]
    )
  );
  // We obtain the DataGrid configuration.
  const dataGrid = useDataGrid(
    React.useMemo(
      () => ({
        scopeInfo,
        rowActions,
        filterManager,
        onCreateButtonClick: () =>
          onOpen({
            mode: DetailsDialogMode.Add,
            open: true,
          }),
      }),
      [scopeInfo, rowActions, filterManager, onOpen]
    )
  );

  return (
    <>
      <ConfirmationDialog
        {...(confirmDeleteDialogOptions as ConfirmationDialogOptions)}
        mutation={mutateDelete}
      />
      {/* We newly mount the AccountDetailsDialog component each time to ensure the account data is newly fetched from the backend. */}
      {detailsDialogContext.open && (
        <AccessTokenDetailsDialog context={detailsDialogContext} />
      )}
      <DataGrid {...dataGrid} />
    </>
  );
});

export default AccessTokens;
