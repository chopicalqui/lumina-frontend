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
import { useQueryAccessTokenById as useQueryByIdPrimary } from "../../../models/account/access_token";
import ControlFactory from "../../../components/inputs/ControlFactory";
import {
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { useMutationDetailsDialog } from "../../../utils/hooks/tanstack/useMutationDetailsDialog";
import {
  queryKeyAccessTokens as queryKeyPrimary,
  URL_ME_ACCESS_TOKENS as URL_PRIMARY,
} from "../../../models/account/common";
import { UseMutationAlert } from "../../../components/feedback/TanstackAlert";
import { DetailsDialogMode } from "../../../utils/globals";

const AccessTokenDetailsDialog = React.memo(
  ({ context }: { context: DetailsDialogOptions }) => {
    const { rowId: _rowId, ...props } = context;
    // We store the access token value in the local state.
    const [tokenValue, setTokenValue] = React.useState<string | null>(null);
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
            // The actual access token value is only returned when creating a new access token. In order to display
            // the access token value, we store it in the local state.
            onSuccess: (data: any, mode?: DetailsDialogMode) => {
              if (mode === DetailsDialogMode.Add) {
                setTokenValue(data.value);
              }
            },
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
        mode={dialogState.mode}
        maxWidth="sm"
        fullWidth
        isLoading={queryContext.isLoading}
        controlContext={controlContext}
      >
        <UseMutationAlert {...mutationContext} />
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ControlFactory
                field="name"
                context={controlContext}
                disabled={dialogState.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={12}>
              <ControlFactory
                field="scopes"
                context={controlContext}
                disabled={dialogState.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={6}>
              <ControlFactory
                field="expiration"
                context={controlContext}
                disabled={dialogState.mode !== DetailsDialogMode.Add}
              />
            </Grid>
            <Grid size={6}>
              <ControlFactory
                field="revoked"
                context={controlContext}
                disabled={dialogState.mode !== DetailsDialogMode.Edit}
              />
            </Grid>
            {tokenValue && (
              <Grid size={12}>
                <ControlFactory
                  field="value"
                  value={tokenValue}
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
