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
import { DialogProps } from "@mui/material";
import React from "react";

/**
 * Options for opening a dialog.
 */
export interface OnOpenOptions extends DialogProps {
  // The title of the dialog.
  name?: string;
}

/**
 * Result of the useDialog hook.
 */
export interface UseDialogResult extends OnOpenOptions {
  // Function to open the dialog.
  onOpen: (props: DialogProps) => void;
}

/**
 * Hook to handle component Dialog.
 */
export const useDialog = (): UseDialogResult => {
  const [state, setState] = React.useState<OnOpenOptions>({
    open: false,
    name: undefined,
  });

  const handleOpen = React.useCallback((props: OnOpenOptions) => {
    setState((x: OnOpenOptions) => ({ ...x, ...props, open: true }));
  }, []);

  const handleClose = React.useCallback(() => {
    setState((x: OnOpenOptions) => ({ ...x, open: false }));
  }, []);

  return React.useMemo(
    () => ({
      ...state,
      onClose: handleClose,
      onOpen: handleOpen,
    }),
    [state, handleClose, handleOpen]
  );
};
