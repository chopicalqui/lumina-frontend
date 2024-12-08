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
import { Button } from "@mui/material";

/**
 * Options for opening a details dialog.
 */
export interface DetailsDialogOptions extends DialogOptions {
  // The mode of the dialog.
  mode?: DetailsDialogMode;
}

/**
 * This component is the default dialog that is used to display details about a DataGrid entry.
 */
const DetailsDialog = React.memo((props: DetailsDialogOptions) => {
  const { mode, name, onClose, ...context } = props;
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
          <Button key="cancel" onClick={onClose}>
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
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
        ];
    }
  }, [mode, onClose]);

  return (
    <Dialog {...context} name={title} onClose={onClose} buttons={buttons} />
  );
});

export default DetailsDialog;
