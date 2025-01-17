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
import { useQueryMe } from "../models/account/account";
import { useDefaultDataGridRowActions } from "../utils/hooks/mui/useDefaultDataGridRowActions";
import { useDataGrid } from "../utils/hooks/mui/useDataGrid";
import DataGrid from "../components/data/DataGrid";
import AccessTokenDetailsDialog from "./dialogs/account/AccessTokenDetailsDialog";
import { useDetailsDialog } from "../utils/hooks/mui/useDetailsDialog";
import ConfirmationDialog, {
  ConfirmationDialogOptions,
} from "../components/feedback/dialogs/ConfirmDialog";

const AccessTokens = React.memo(() => {
  // We obtain the current user's data.
  const me = useQueryMe();
  // We query all access tokens for the DataGrid.
  const queryContext = useQueryAccessTokens(
    React.useMemo(
      () => ({
        scope: ScopeEnum.DataGridAccessToken,
      }),
      []
    )
  );
  // We obtain the context to open the details dialog for adding new or editing/viewing existing access tokens.
  const { onOpen, ...detailsDialogContext } = useDetailsDialog(
    React.useMemo(() => ({ name: "Access Token" }), [])
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
        me: me!.data!,
        queryContext,
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
      [onOpen, showConfirmDeleteDialog, me, queryContext]
    )
  );
  // We obtain the DataGrid configuration.
  const dataGrid = useDataGrid({
    me: me!.data!,
    queryContext,
    rowActions,
    onCreateButtonClick: React.useCallback(
      () =>
        onOpen({
          mode: DetailsDialogMode.Add,
          open: true,
        }),
      [onOpen]
    ),
  });

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
