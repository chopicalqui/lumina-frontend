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
import { useQueryAccounts, useQueryMe } from "../models/account/account";
import { useDataGrid } from "../utils/hooks/mui/useDataGrid";
import DataGrid from "../components/data/DataGrid";
import { DetailsDialogMode, ScopeEnum } from "../utils/globals";
import { useDefaultDataGridRowActions } from "../utils/hooks/mui/useDefaultDataGridRowActions";
import { useDetailsDialog } from "../utils/hooks/mui/useDetailsDialog";
import AccountDetailsDialog from "./dialogs/account/AccountDetailsDialog";

const Accounts = React.memo(() => {
  // We obtain the current user's data.
  const me = useQueryMe();
  // We query all access tokens for the DataGrid.
  const queryContext = useQueryAccounts(
    React.useMemo(() => ({ scope: ScopeEnum.DataGridAccount }), [])
  );
  // We obtain the context to open the details dialog for adding new or editing/viewing existing access tokens.
  const { onOpen, ...detailsDialogContext } = useDetailsDialog(
    React.useMemo(() => ({ name: "Account" }), [])
  );
  // We obtain the default row actions for the DataGrid.
  const rowActions = useDefaultDataGridRowActions(
    React.useMemo(
      () => ({
        me: me!.data!,
        queryContext,
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
      [me, onOpen, queryContext]
    )
  );
  // We obtain the DataGrid configuration.
  const dataGrid = useDataGrid({
    me: me!.data!,
    queryContext,
    rowActions,
  });

  return (
    <>
      <AccountDetailsDialog context={detailsDialogContext} />
      <DataGrid {...dataGrid} />
    </>
  );
});

export default Accounts;
