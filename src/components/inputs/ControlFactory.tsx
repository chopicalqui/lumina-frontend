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
import TextField from "./TextField";
import { UseControlFactoryResult } from "../../utils/hooks/mui/useControlFactory";
import { TextFieldProps } from "@mui/material";
import Switch, { SwitchOptions } from "./Switch";
import DatePicker, { DatePickerOptions } from "./DatePicker";
import dayjs from "dayjs";

export interface ControlFactoryOptions {
  // The attribute name of the control.
  field: string;
  // The control factory's context returned by the useControlFactory hook.
  context: UseControlFactoryResult;
}

const ControlFactory = React.memo(
  ({ field, context }: ControlFactoryOptions) => {
    const fieldValue = context.state.values[field];
    const fieldState = context.state.states[field];
    const fieldColumn = context.state.columns[field];
    const { onChange, onBlur } = context;

    // Create all input control events
    const onChangeTextField = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ event, field, newValue: null }),
      [field, onChange]
    );
    const onChangeSwitch = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) =>
        onChange({ event, field, newValue: checked }),
      [field, onChange]
    );
    const onChangeDatePicker = React.useCallback(
      (
        value: dayjs.Dayjs | null
        //context: PickerChangeHandlerContext<DateValidationError>
      ) => onChange({ event: undefined, field, newValue: value }),
      [field, onChange]
    );
    const onBlurTextField = React.useCallback(
      (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
      ) => onBlur({ event, field, newValue: null }),
      [field, onBlur]
    );

    // Perform input validation.
    if (!fieldColumn) {
      console.error(
        `ControlFactory: unknown field ${field}. Probably the MetaInfoType is incomplete.`
      );
      return null;
    }
    const { options } = fieldColumn;

    // TODO: Update this if statement to include new MUI control
    if (fieldColumn.type === "switch") {
      return (
        <Switch
          {...(options as SwitchOptions)}
          value={fieldValue}
          onChange={onChangeSwitch}
        />
      );
    } else if (fieldColumn.type === "textfield") {
      const { helperText, ...props } = options as TextFieldProps;
      return (
        <TextField
          {...props}
          value={fieldValue as string}
          error={fieldState.errorText !== undefined}
          helperText={fieldState.errorText ? fieldState.errorText : helperText}
          onChange={onChangeTextField}
          onBlur={onBlurTextField}
        />
      );
    } else if (fieldColumn.type === "datepicker") {
      const { helperText, ...props } = options as DatePickerOptions<any>;
      return (
        <DatePicker
          {...props}
          error={fieldState.errorText !== undefined}
          helperText={fieldState.errorText || helperText}
          onChange={onChangeDatePicker}
        />
      );
    } else {
      console.error(`ControlFactory: unknown control type ${fieldColumn.type}`);
    }
  }
);

export default ControlFactory;
