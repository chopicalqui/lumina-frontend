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

import { ReactNode } from "react";
import {
  ControlFactoryReducerState,
  ControlValueType,
} from "./controlFactoryUtils";

/**
 * Options for the getError function.
 */
export interface GetErrorOptions {
  // The attribute name of the control.
  field: string;
  // The attribute's friendly name.
  label: ReactNode;
  // The new value.
  value: ControlValueType;
  // The entire state of the control.
  state: ControlFactoryReducerState;
  // Defines whether the field is mandatory
  required?: boolean;
}

/**
 * Defines properties that must be implemented by all Lumina controls.
 */
export interface LuminaControlOptions {
  // The attribute name of the control.
  field: string;
  // The attribute's friendly name.
  label: ReactNode;
  // If set to false, then the control's value is not sent to the server (default is false).
  noSubmit?: boolean;
  // Internal value to set the control's error message.
  errorText?: string;
  // Function that performs validation on the control and returns an error message if the control is invalid.
  getError?: (props: GetErrorOptions) => void;
  // Function that returns the final value of the control.
  getFinalValue?: (value: any) => any;
}
