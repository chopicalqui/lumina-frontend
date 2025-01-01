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

export interface UseConfirmDialogOptions {
  // The title of the dialog.
  title: string;
  // The message of the dialog.
  message: string;
  // Callback function to be executed when the user confirms the dialog.
  onConfirm?: (...args: any) => void;
}

export interface UseConfirmDialogState extends UseConfirmDialogOptions {
  // Defines whether the dialog should be displayed or not.
  open: boolean;
}

export interface UseConfirmDialogResult extends UseConfirmDialogState {
  // The function to be executed when the user cancels the dialog.
  onCancel: () => void;
  // The function that displays the confirmation dialog.
  showDialog: (props: UseConfirmDialogOptions) => void;
}

/**
 * Hook for component components / feedback / ConfirmationDialog.
 * 
 * The dialog provides the user the opportunity to confirm an action (e.g., to delete something) and
 * if the user confirms, executes the function onConfirm.
 * 
 * Usage:
 * 
 const {showDialog, ...confirmationDialogOptions} = useConfirmationDialog({
  title: "Delete item ...",
  message: "Are you sure you want to permanently delete the item?"
 })

 showDialog(
  {
    title: "Delete item ...",
    message: "Are you sure you want to permanently delete the item?",
    onConfirm: () => alert("Action confirmed")
  }
 );

 return (<ConfirmationDialog {...confirmationDialogOptions}>/)
 */
export const useConfirmDialog = (): UseConfirmDialogResult => {
  const [state, setState] = React.useState<UseConfirmDialogState>(
    React.useMemo(
      () => ({
        open: false,
        title: "",
        message: "",
        onConfirm: undefined,
      }),
      []
    )
  );

  const onCancel = React.useCallback(() => {
    setState((state) => state && { ...state, open: false });
  }, []);

  const showDialog = React.useCallback(
    ({ title, message, onConfirm }: UseConfirmDialogOptions) => {
      setState(() => ({
        open: true,
        title,
        message,
        onConfirm,
      }));
    },
    []
  );

  return React.useMemo(() => {
    return {
      open: state.open,
      title: state.title,
      message: state.message,
      onConfirm: state.onConfirm,
      onCancel,
      showDialog,
    };
  }, [state, onCancel, showDialog]);
};
