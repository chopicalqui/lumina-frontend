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
import {
  UseMutationResult,
  UseMutationOptions,
  useMutation,
} from "./useMutation";
import { useConfirmDialog } from "../mui/useConfirmDialog";
import { ConfirmationDialogOptions } from "../../../components/feedback/dialogs/ConfirmDialog";

export interface UseDeleteMutationResult extends ConfirmationDialogOptions {
  // The function that displays the confirmation dialog.
  showDialog: (...args: any) => void;
  // useMutation context to be able to communicate any states to the component.
  mutation: UseMutationResult;
}

/**
 * Hook for component components / feedback / ConfirmationDialog that executes the given
 * mutation, once the user confirms the execution.
 */
export const useDeleteMutation = (
  props: UseMutationOptions
): UseDeleteMutationResult => {
  // Obtain handler for a ConfirmationDialog component
  const confirmDialog = useConfirmDialog();
  // Obtain handler for updating the backend
  const mutation = useMutation(props);

  const showDialog = React.useCallback(
    (...args: any) =>
      confirmDialog?.showDialog({
        title: "Delete item ...",
        message: "Are you sure you want to permanently delete the item?",
        onConfirm: () => mutation.mutate(args),
      }),
    [confirmDialog, mutation]
  );

  return React.useMemo(() => {
    return { ...confirmDialog, showDialog, mutation };
  }, [confirmDialog, showDialog, mutation]);
};
