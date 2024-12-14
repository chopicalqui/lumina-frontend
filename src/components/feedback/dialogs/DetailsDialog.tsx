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
import { Button, styled } from "@mui/material";
import { useConfirmDialog } from "../../../utils/hooks/mui/useConfirmDialog";
import ConfirmationDialog from "./ConfirmDialog";

/**
 * Options for opening a details dialog.
 */
export interface DetailsDialogOptions extends DialogOptions {
  // The mode of the dialog.
  mode?: DetailsDialogMode;
}

export const Item = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  width: "100%",
}));

/**
 * This component is the default dialog that is used to display details about a DataGrid entry.
 */
const DetailsDialog = React.memo((props: DetailsDialogOptions) => {
  const { mode, name, onClose, ...context } = props;
  const { showDialog, ...confirmDialogOptions } = useConfirmDialog();
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

  const onCancel = React.useCallback(
    () =>
      showDialog({
        title: "Cancel",
        message: "Are you sure you want to cancel?",
        onConfirm: onClose,
      }),
    [showDialog, onClose]
  );

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
          <Button key="save" onClick={onClose}>
            Save
          </Button>,
          <Button key="save-close" onClick={onClose}>
            Save & Close
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
        ];
      case DetailsDialogMode.Add:
        return [
          <Button key="add" onClick={onClose}>
            Add
          </Button>,
          <Button key="add-close" onClick={onClose}>
            Add & Close
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
        ];
    }
  }, [mode, onClose, onCancel]);

  return (
    <>
      <ConfirmationDialog {...confirmDialogOptions} />
      <Dialog {...context} name={title} onClose={onClose} buttons={buttons} />
    </>
  );
});

export default DetailsDialog;
