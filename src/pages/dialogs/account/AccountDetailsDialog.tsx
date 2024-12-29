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
import DetailsDialog, {
  Item,
} from "../../../components/feedback/dialogs/DetailsDialog";
import { useQueryAccountById } from "../../../models/account/account";
import { useControlFactory } from "../../../utils/hooks/mui/useControlFactory";
import { Grid2 as Grid, Paper } from "@mui/material";
import ControlFactory from "../../../components/inputs/ControlFactory";
import { useMutationDetailsDialog } from "../../../utils/hooks/tanstack/useMutationDetailsDialog";
import { queryKeyAccounts, URL_ACCOUNTS } from "../../../models/account/common";
import { UseMutationAlert } from "../../../components/feedback/TanstackAlert";

const AccountDetailsDialog = React.memo(
  ({ context }: { context: DetailsDialogOptions }) => {
    const { rowId, ...props } = context;

    // Obtain the access token by ID.
    const queryContext = useQueryAccountById(
      React.useMemo(
        () => ({
          rowId,
        }),
        [rowId]
      )
    );

    // Obtain the Tanstack mutation to allow updating the account.
    const mutationContext = useMutationDetailsDialog(
      React.useMemo(
        () => ({
          url: URL_ACCOUNTS,
          mode: context.mode!,
          invalidateQueryKeys: [queryKeyAccounts],
        }),
        [context.mode]
      )
    );

    // Obtain the control factory context.
    const controlContext = useControlFactory(
      queryContext.metaInfo,
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
              <Item>roles</Item>
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
