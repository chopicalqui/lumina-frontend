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
import { DetailsDialogOptions } from "../../../utils/hooks/mui/useDetailsDialog";
import { useQueryAccountById as useQueryByIdPrimary } from "../../../models/account/account";
import { useControlFactory } from "../../../utils/hooks/mui/useControlFactory";
import { Grid2 as Grid, Paper } from "@mui/material";
import ControlFactory from "../../../components/inputs/ControlFactory";
import { useMutationDetailsDialog } from "../../../utils/hooks/tanstack/useMutationDetailsDialog";
import {
  queryKeyAccounts as queryKeyPrimary,
  URL_ACCOUNTS as URL_PRIMARY,
} from "../../../models/account/common";
import { UseMutationAlert } from "../../../components/feedback/TanstackAlert";
import DetailsDialog from "../../../components/feedback/dialogs/DetailsDialog";

const AccountDetailsDialog = React.memo(
  ({ context }: { context: DetailsDialogOptions }) => {
    const { rowId: _rowId, ...props } = context;
    // Obtain the Tanstack mutation together with the dialog state. It allows updating/creating the record and
    // managing the dialog's lifecycle.
    const { mutation: mutationContext, state: dialogState } =
      useMutationDetailsDialog(
        React.useMemo(
          () => ({
            url: URL_PRIMARY,
            queryKey: queryKeyPrimary,
            dialogContext: context,
            invalidateQueryKeys: [],
          }),
          [context]
        )
      );

    // Obtain the record by ID.
    const queryContext = useQueryByIdPrimary(
      React.useMemo(
        () => ({
          rowId: dialogState.rowId,
        }),
        [dialogState.rowId]
      )
    );

    // Obtain the control factory context.
    const controlContext = useControlFactory(
      queryContext.metaInfo,
      dialogState.mode,
      queryContext,
      React.useMemo(
        () => ({
          mutate: mutationContext.mutate,
        }),
        [mutationContext.mutate]
      )
    );

    return (
      <DetailsDialog
        {...props}
        mode={dialogState.mode}
        maxWidth="md"
        fullWidth
        isLoading={queryContext.isLoading}
        controlContext={controlContext}
      >
        <UseMutationAlert {...mutationContext} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <ControlFactory field="name" context={controlContext} />
            </Grid>
            <Grid size={6}>
              <ControlFactory field="email" context={controlContext} />
            </Grid>
            <Grid size={8}>
              <ControlFactory field="roles" context={controlContext} />
            </Grid>
            <Grid size={4}>
              <ControlFactory field="lastLogin" context={controlContext} />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={2}>
              <ControlFactory field="locked" context={controlContext} />
            </Grid>
            <Grid size={5}>
              <ControlFactory field="activeFrom" context={controlContext} />
            </Grid>
            <Grid size={5}>
              <ControlFactory field="activeUntil" context={controlContext} />
            </Grid>
          </Grid>
        </Paper>
      </DetailsDialog>
    );
  }
);

export default AccountDetailsDialog;
