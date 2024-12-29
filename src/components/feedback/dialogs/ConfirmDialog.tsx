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
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { UseConfirmDialogState } from "../../../utils/hooks/mui/useConfirmDialog";
import { Portal } from "@mui/material";
import { UseMutationResult } from "../../../utils/hooks/tanstack/useMutation";
import { UseMutationAlert } from "../TanstackAlert";

export interface ConfirmationDialogOptions extends UseConfirmDialogState {
  // The function to be executed when the user cancels the dialog.
  onCancel: () => void;
  mutation?: UseMutationResult;
}

/**
 * Dialog that receives the output of hook useConfirmDialog. It displays a message box that allows
 * users to confirm an action.
 */
const ConfirmationDialog = React.memo((props: ConfirmationDialogOptions) => {
  const { open, title, message, onConfirm, onCancel, mutation } = props;

  const handleConfirmation = React.useCallback(() => {
    onConfirm?.();
    onCancel();
  }, [onConfirm, onCancel]);

  return (
    <>
      {mutation && <UseMutationAlert {...mutation} />}
      <Portal container={document.getElementById("confirm-dialog")}>
        <Dialog
          open={open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel} autoFocus>
              No
            </Button>
            <Button onClick={handleConfirmation}>Yes</Button>
          </DialogActions>
        </Dialog>
      </Portal>
    </>
  );
});

export default ConfirmationDialog;
