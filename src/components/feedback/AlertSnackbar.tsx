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
import { StatusMessage } from "../../models/common";
import { TanstackAlert } from "./TanstackAlert";

/**
 * Options for the alert snackbar.
 */
export interface AlertSnackbarOptions {
  context?: StatusMessage;
  onClose: () => void;
}

/**
 * Displays an alert snackbar.
 */
const AlertSnackbar = React.memo((props: AlertSnackbarOptions) => {
  if (props.context === undefined) {
    return null;
  }
  return (
    <TanstackAlert
      open={true}
      severity={props.context.severity}
      message={props.context.message}
      resetFn={props.onClose}
    />
  );
});

export default AlertSnackbar;
