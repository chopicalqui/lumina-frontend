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
import { useTheme } from "@mui/material/styles";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { DatePickerProps as MuiDatePickerProps } from "@mui/x-date-pickers/DatePicker/DatePicker.types";
import { LuminaControlOptions } from "./common";
import { Dayjs } from "dayjs";

export type DatePickerProps<
  TEnableAccessibleFieldDOMStructure extends boolean = false,
> = MuiDatePickerProps<Dayjs, TEnableAccessibleFieldDOMStructure> &
  React.RefAttributes<HTMLDivElement>;

export interface DatePickerOptions<
  TEnableAccessibleFieldDOMStructure extends boolean = false,
> extends LuminaControlOptions,
    DatePickerProps<TEnableAccessibleFieldDOMStructure> {
  ref?: any;
  // The input label.
  label: string;
  // Flag to indicate if the component contains an input error.
  error?: boolean;
  // Flag to indicate if the component is mandatory.
  required?: boolean;
  // Helper text to display below the input.
  helperText?: string;
  // Lost focus handler.
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => void;
}

/**
 * DatePicker component that can be created by the ControlFactory component.
 */
const DatePicker = React.memo((props: DatePickerOptions<any>) => {
  const theme = useTheme();
  const { required, label, error, helperText, readOnly, onBlur, ...other } =
    props;
  const datePickerLabel = required ? label + " *" : label;

  const sx = React.useMemo(
    () => ({
      minWidth: "100%",
      color: error ? theme.palette.error.main : undefined,
      ...props.sx,
    }),
    [props.sx, error, theme.palette.error.main]
  );

  return (
    <MuiDatePicker
      slotProps={{
        textField: {
          helperText,
          onBlur,
          error,
        },
      }}
      label={datePickerLabel}
      value={props.value}
      readOnly={readOnly}
      disabled={readOnly}
      sx={sx}
      {...other}
    />
  );
});

export default DatePicker;
