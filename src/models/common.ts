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

import { AlertColor } from "@mui/material";
import { GetErrorOptions } from "../components/inputs/common";
import { Dayjs } from "dayjs";

/*
 * This class is used by all Lumina API model classes to provide a common interface for all Lumina API model classes.
 */
export abstract class ModelBase {
  constructor(public id: string | null) {}

  public getQueryId(): string {
    return this.id ?? "";
  }
}

/*
 * This class is used by all Lumina API model classes to provide a common interface for all Lumina API model classes.
 */
export abstract class NamedModelBase extends ModelBase {
  constructor(
    public name: string,
    id: string | null
  ) {
    super(id);
    this.name = name;
  }
}

/**
 * Data class for status messages.
 *
 * This class is used by useLuminaQuery useLuminaMutation and SnackbarAlert to obtain and display status messages.
 */
export class StatusMessage {
  type?: string;
  severity: AlertColor;
  message: string;

  constructor(data: any) {
    this.type = data.type;
    this.severity = data.severity;
    this.message = data.message;
  }
}

/**
 * Default input validation for TextField components.
 */
export const verifyTextFieldDefault = (props: GetErrorOptions) => {
  const { value, label, required } = props;
  if (required && !value) {
    throw new Error(`${label} is required.`);
  }
};

/**
 * Default input validation for DatePicker components.
 */
export const verifyDatePickerDefault = (props: GetErrorOptions) => {
  const { value, label, required } = props;
  if (required && !value) {
    throw new Error(`${label} is required.`);
  }
  if ((value as Dayjs)?.isValid() === false) {
    throw new Error(`${label} is not a valid date.`);
  }
};

/**
 * Default input validation for Autocomplete components.
 */

export const verifyAutocompleteDefault = (props: GetErrorOptions) => {
  const { value, label, required } = props;
  if (required && (!value || (Array.isArray(value) && value.length === 0))) {
    throw new Error(`${label} is required.`);
  }
};

/**
 * Input validation for email addresses.
 */
export const verifyEmail = (props: GetErrorOptions) => {
  const { value, label } = props;
  // Perform the default validation
  verifyTextFieldDefault(props);
  if (
    value &&
    !(value as string).match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
  ) {
    throw new Error(
      `${label?.toString().toLowerCase()} is not a valid email address.`
    );
  }
};
