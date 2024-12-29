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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React from "react";
import Dialog, { DialogOptions } from "./Dialog";
import { DetailsDialogMode } from "../../../utils/globals";
import { Button, CircularProgress, styled } from "@mui/material";
import { useConfirmDialog } from "../../../utils/hooks/mui/useConfirmDialog";
import ConfirmationDialog from "./ConfirmDialog";
import { UseControlFactoryResult } from "../../../utils/hooks/mui/useControlFactory";
import { useAlertSnackbar } from "../../../utils/hooks/tanstack/useAlertSnackbar";
import AlertSnackbar from "../AlertSnackbar";

/**
 * Options for opening a details dialog.
 */
export interface DetailsDialogOptions extends DialogOptions {
  // The mode of the dialog.
  mode?: DetailsDialogMode;
  // The form context holding all user input information.
  controlContext: UseControlFactoryResult;
  // Instructs the dialog to display a loading spinner.
  isLoading?: boolean;
}

export const Item = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  width: "100%",
}));

/**
 * This component is the default dialog that is used to display details about a DataGrid entry.
 */
const DetailsDialog = React.memo((props: DetailsDialogOptions) => {
  const { mode, name, onClose, isLoading, controlContext, ...context } = props;
  const { onSubmit: submitData } = controlContext;
  // Dialog to confirm that user wants to cancel the dialog.
  const { showDialog, ...confirmDialogOptions } = useConfirmDialog();
  // Alert box to inform the user about errors in one of the fields.
  const { onNotify, ...alertContext } = useAlertSnackbar();

  // Title of the dialog.
  const title = React.useMemo(() => {
    switch (mode) {
      case DetailsDialogMode.View:
        return `View ${name}`;
      case DetailsDialogMode.Edit:
        return `Edit ${name}`;
      case DetailsDialogMode.Add:
        return `Add ${name}`;
    }
  }, [mode, name]);

  // Callback to cancel the dialog.
  const onCancel = React.useCallback(
    () =>
      showDialog({
        title: "Cancel",
        message: "Are you sure you want to cancel?",
        onConfirm: onClose,
      }),
    [showDialog, onClose]
  );

  // Callback to check for errors and submit the form.
  const onSubmit = React.useCallback(() => {
    try {
      submitData();
    } catch (error) {
      onNotify({ severity: "error", message: (error as Error).message });
    }
  }, [submitData, onNotify]);

  // Callback to check for errors, submit the form and close the dialog.
  const onSubmitAndClose = React.useCallback(() => {
    try {
      submitData();
      onClose();
    } catch (error) {
      onNotify({ severity: "error", message: (error as Error).message });
    }
  }, [submitData, onClose, onNotify]);

  // Buttons to display in the dialog.
  const buttons = React.useMemo(() => {
    switch (mode) {
      case DetailsDialogMode.View:
        return [
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ];
      case DetailsDialogMode.Edit:
        return [
          <Button key="save" onClick={onSubmit}>
            Save
          </Button>,
          <Button key="save-close" onClick={onSubmitAndClose}>
            Save & Close
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
        ];
      case DetailsDialogMode.Add:
        return [
          <Button key="add" onClick={onSubmit}>
            Add
          </Button>,
          <Button key="add-close" onClick={onSubmitAndClose}>
            Add & Close
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
        ];
    }
  }, [mode, onClose, onCancel, onSubmit, onSubmitAndClose]);

  // Toolbar items to display a loading spinner.
  const toolbarItems = React.useMemo(() => {
    if (isLoading) {
      return [<CircularProgress key="cicular-progress" />];
    }
  }, [isLoading]);

  return (
    <>
      <AlertSnackbar {...alertContext} />
      <ConfirmationDialog {...confirmDialogOptions} />
      <Dialog
        {...context}
        name={title}
        onClose={React.useMemo(
          () => (mode == DetailsDialogMode.View ? onClose : onCancel),
          [mode, onClose, onCancel]
        )}
        buttons={buttons}
        toolbarItems={toolbarItems}
      />
    </>
  );
});

export default DetailsDialog;
