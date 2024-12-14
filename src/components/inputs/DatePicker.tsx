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
import { PickerValidDate } from "@mui/x-date-pickers";
import { LuminaControlOptions } from "./common";
import { Dayjs } from "dayjs";

export type DatePickerProps<
  TDate extends PickerValidDate,
  TEnableAccessibleFieldDOMStructure extends boolean = false,
> = MuiDatePickerProps<TDate, TEnableAccessibleFieldDOMStructure> &
  React.RefAttributes<HTMLDivElement>;

export interface DatePickerOptions<
  TEnableAccessibleFieldDOMStructure extends boolean = false,
> extends LuminaControlOptions,
    DatePickerProps<Dayjs, TEnableAccessibleFieldDOMStructure> {
  ref?: any;
  label: string;
  error?: boolean;
  required?: boolean;
  helperText?: string;
}

const DatePicker = React.memo((props: DatePickerOptions<any>) => {
  const theme = useTheme();
  const { required, label, error, helperText, readOnly, ...other } = props;
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
