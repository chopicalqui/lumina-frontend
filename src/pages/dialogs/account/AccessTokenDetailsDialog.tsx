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
import DetailsDialog from "../../../components/feedback/dialogs/DetailsDialog";
import { useControlFactory } from "../../../utils/hooks/mui/useControlFactory";
import { useQueryAccessTokenById } from "../../../models/account/access_token";
import ControlFactory from "../../../components/inputs/ControlFactory";
import { Grid2 as Grid, Paper } from "@mui/material";

const AccessTokenDetailsDialog = React.memo(
  ({ context }: { context: DetailsDialogOptions }) => {
    // Obtain the access token by ID.
    const queryContext = useQueryAccessTokenById(
      React.useMemo(
        () => ({
          rowId: context.rowId,
        }),
        [context.rowId]
      )
    );
    // Obtain the control factory context.
    const controlContext = useControlFactory(
      queryContext.metaInfo,
      queryContext
    );

    return (
      <DetailsDialog
        {...context}
        maxWidth="sm"
        fullWidth
        isLoading={queryContext.isLoading}
      >
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ControlFactory field="name" context={controlContext} />
            </Grid>
            <Grid size={12}>
              <ControlFactory field="revoked" context={controlContext} />
            </Grid>
            <Grid size={12}>
              <ControlFactory field="expiration" context={controlContext} />
            </Grid>
            <Grid size={12}>
              <ControlFactory field="created_at" context={controlContext} />
            </Grid>
          </Grid>
        </Paper>
      </DetailsDialog>
    );
  }
);

export default AccessTokenDetailsDialog;
