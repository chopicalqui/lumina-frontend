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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DetailsDialogOptions } from "../../../utils/hooks/mui/useDetailsDialog";
import DetailsDialog from "../../../components/feedback/dialogs/DetailsDialog";
import { useControlFactory } from "../../../utils/hooks/mui/useControlFactory";
import { useQueryAccessTokenById } from "../../../models/account/access_token";
import ControlFactory from "../../../components/inputs/ControlFactory";
import {
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { useMutationDetailsDialog } from "../../../utils/hooks/tanstack/useMutationDetailsDialog";
import {
  queryKeyAccessTokens,
  URL_ME_ACCESS_TOKENS,
} from "../../../models/account/common";
import { UseMutationAlert } from "../../../components/feedback/TanstackAlert";
import { DetailsDialogMode } from "../../../utils/globals";

const AccessTokenDetailsDialog = React.memo(
  ({ context }: { context: DetailsDialogOptions }) => {
    const { rowId, ...props } = context;

    // Obtain the access token by ID.
    const queryContext = useQueryAccessTokenById(
      React.useMemo(
        () => ({
          rowId: rowId,
        }),
        [rowId]
      )
    );

    // Obtain the Tanstack mutation to allow updating the access token.
    const mutationContext = useMutationDetailsDialog(
      React.useMemo(
        () => ({
          url: URL_ME_ACCESS_TOKENS,
          mode: context.mode!,
          invalidateQueryKeys: [queryKeyAccessTokens],
        }),
        [context.mode]
      )
    );

    // Obtain the control factory context.
    const controlContext = useControlFactory(
      queryContext.metaInfo,
      context.mode,
      queryContext,
      React.useMemo(
        () => ({
          mutate: mutationContext.mutate,
        }),
        [mutationContext.mutate]
      )
    );
    const tokenValue = controlContext.state.values.value;

    // Copy the access token to the clipboard.
    const onAccessTokenCopy = React.useCallback(() => {
      if (tokenValue) {
        navigator.clipboard.writeText(tokenValue.toString());
        // TODO: Notify the user that the access token has been copied.
      }
    }, [tokenValue]);

    const textFieldOptions = React.useMemo(
      () => ({
        type: "password",
        slotProps: {
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="copy"
                  size="small"
                  onClick={onAccessTokenCopy}
                >
                  <ContentCopyIcon fontSize="inherit" />
                </IconButton>
              </InputAdornment>
            ),
          },
        },
      }),
      [onAccessTokenCopy]
    );

    return (
      <DetailsDialog
        {...props}
        maxWidth="sm"
        fullWidth
        isLoading={queryContext.isLoading}
        controlContext={controlContext}
      >
        <UseMutationAlert {...mutationContext} />
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ControlFactory
                field="name"
                context={controlContext}
                disabled={context.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={12}>
              <ControlFactory
                field="scopes"
                context={controlContext}
                disabled={context.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={6}>
              <ControlFactory
                field="expiration"
                context={controlContext}
                disabled={context.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={6}>
              <ControlFactory
                field="revoked"
                context={controlContext}
                disabled={context.mode !== DetailsDialogMode.Edit}
              />
            </Grid>
            {tokenValue && (
              <Grid size={12}>
                <ControlFactory
                  field="value"
                  context={controlContext}
                  textFieldOptions={textFieldOptions}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </DetailsDialog>
    );
  }
);

export default AccessTokenDetailsDialog;
