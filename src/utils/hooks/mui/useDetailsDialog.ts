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
import { DialogProps } from "@mui/material";
import { DetailsDialogMode } from "../../globals";
import { GridRowId } from "@mui/x-data-grid";

export interface UseDialogResult extends OnOpenOptions {
  onOpen: (props: DialogProps) => void;
}

export interface UseDetailsDialogOptions {
  // The name of the entity to display in the dialog. This will be used in the title.
  name: string;
  // If true, the dialog will display an "Add & Close" button.
  displayAddAndCloseButton?: boolean;
}

export interface DialogState {
  // The ID of the entity to display in the dialog.
  rowId?: GridRowId;
  // The mode of the dialog.
  mode?: DetailsDialogMode;
}

interface UseDetailsDialogState
  extends UseDetailsDialogOptions,
    DialogProps,
    DialogState {}

export interface DetailsDialogOptions extends UseDetailsDialogState {
  // Closes the dialog.
  onClose: () => void;
}

export interface UseDetailsDialogResult extends DetailsDialogOptions {
  displayAddAndCloseButton: boolean;
  // Opens the dialog.
  onOpen: (props: OnOpenOptions) => void;
}

export interface OnOpenOptions extends DialogProps {
  // The ID of the entity to display in the dialog.
  rowId?: GridRowId;
  // The mode of the dialog.
  mode: DetailsDialogMode;
}

/**
 * This hook is used to obtain a dialog handler for the details dialog.
 */
export const useDetailsDialog = (
  props: UseDetailsDialogOptions
): UseDetailsDialogResult => {
  const [state, setState] = React.useState<UseDetailsDialogState>({
    open: false,
    name: props.name,
  });

  /**
   * Opens the dialog.
   */
  const handleOpen = React.useCallback((props: OnOpenOptions) => {
    setState((x: UseDetailsDialogState) => ({
      ...x,
      ...props,
      rowId: props.mode === DetailsDialogMode.Add ? undefined : props.rowId,
      open: true,
    }));
  }, []);

  /**
   * Closes the dialog.
   */
  const handleClose = React.useCallback(() => {
    setState((x: UseDetailsDialogState) => ({ ...x, open: false }));
  }, []);

  return React.useMemo(
    () => ({
      ...state,
      displayAddAndCloseButton: props.displayAddAndCloseButton ?? true,
      onClose: handleClose,
      onOpen: handleOpen,
    }),
    [state, handleClose, handleOpen, props.displayAddAndCloseButton]
  );
};
