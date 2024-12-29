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
import { StatusMessage } from "../../../models/common";
import { AlertSnackbarOptions } from "../../../components/feedback/AlertSnackbar";

interface UseAlertSnackbarResult extends AlertSnackbarOptions {
  onNotify: (statusMessage: StatusMessage) => void;
}

/**
 * Hook to display a snackbar alert.
 */
export const useAlertSnackbar = (): UseAlertSnackbarResult => {
  const [state, setState] = React.useState<StatusMessage | undefined>(
    undefined
  );

  // Callback to notify the user.
  const onNotify = React.useCallback(
    (statusMessage: StatusMessage) => setState(statusMessage),
    []
  );

  // Callback to reset the state.
  const onClose = React.useCallback(() => setState(undefined), []);

  return React.useMemo(
    () => ({ context: state, onNotify, onClose }),
    [state, onNotify, onClose]
  );
};
