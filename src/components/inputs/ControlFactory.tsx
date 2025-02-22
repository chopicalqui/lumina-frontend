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
import {
  AutocompleteChangeReason,
  SwitchProps,
  TextFieldProps,
} from "@mui/material";
import Switch, { SwitchOptions } from "./Switch";
import DatePicker, { DatePickerOptions, DatePickerProps } from "./DatePicker";
import dayjs from "dayjs";
import Autocomplete, {
  AutocompleteProps,
  AutocompleteOptions,
} from "./Autocomplete";
import { AutocompleteClass, DetailsDialogMode } from "../../utils/globals";
import { ControlValueType } from "./controlFactoryUtils";
import CountrySelect from "./CountrySelect";

export interface ControlFactoryProps {
  // The attribute name of the control.
  field: string;
  // If true, the control is disabled.
  disabled?: boolean;
  // The current value of the control.
  value?: ControlValueType;
  // The control factory's context returned by the useControlFactory hook.
  context: UseControlFactoryResult;
  // TODO: Add options for each control type.
  textFieldOptions?: TextFieldProps;
  switchOptions?: SwitchProps;
  datePickerOptions?: DatePickerProps;
  autoCompleteOptions?: AutocompleteProps;
  countrySelectOptions?: AutocompleteProps;
}

export type ControlFactoryOptions = ControlFactoryProps;

const ControlFactory = ({
  field,
  value,
  context,
  disabled,
  textFieldOptions,
  switchOptions,
  datePickerOptions,
  autoCompleteOptions,
}: ControlFactoryOptions) => {
  const mode = context.state.mode;
  const fieldValue = context.state.values[field];
  const fieldState = context.state.states[field];
  const fieldColumn = context.state.columns[field];
  const disabledGlobal = disabled || mode === DetailsDialogMode.View;
  const { onChange, onBlur } = context;
  const { label: _tmp, ...datePickerProps } = datePickerOptions ?? {};

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
  const onChangeAutoComplete = React.useCallback(
    (
      event: React.SyntheticEvent,
      newValue: any | any[] | null,
      _reason: AutocompleteChangeReason
    ) => onChange({ event, field, newValue }),
    [field, onChange]
  );
  const onBlurTextField = React.useCallback(
    (
      event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
    ) => onBlur({ event, field, newValue: null }),
    [field, onBlur]
  );
  const onBlurAutoComplete = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement, Element>) =>
      onBlur({ event, field, newValue: null }),
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
  if (fieldColumn.type === "textfield") {
    const { helperText, disabled, ...props } = options as TextFieldProps;
    return (
      <TextField
        {...props}
        {...textFieldOptions}
        value={(value as string) ?? (fieldValue as string)}
        error={fieldState.errorText !== undefined}
        helperText={fieldState.errorText ? fieldState.errorText : helperText}
        disabled={disabledGlobal || disabled}
        onChange={onChangeTextField}
        onBlur={onBlurTextField}
      />
    );
  } else if (fieldColumn.type === "autocomplete") {
    const { helperText, disabled, ...props } = options as AutocompleteOptions;
    return (
      <Autocomplete
        {...props}
        {...autoCompleteOptions}
        value={
          (value as AutocompleteClass) ?? (fieldValue as AutocompleteClass)
        }
        error={fieldState.errorText !== undefined}
        helperText={
          fieldState.errorText ? fieldState.errorText : helperText?.toString()
        }
        disabled={disabledGlobal || disabled}
        onChange={onChangeAutoComplete}
        onBlur={onBlurAutoComplete}
      />
    );
  } else if (fieldColumn.type === "switch") {
    const { disabled, ...props } = options as SwitchOptions;
    return (
      <Switch
        {...props}
        {...switchOptions}
        checked={(value as boolean) ?? (fieldValue as boolean) ?? false}
        disabled={disabledGlobal || disabled}
        onChange={onChangeSwitch}
      />
    );
  } else if (fieldColumn.type === "datepicker") {
    const { helperText, disabled, ...props } =
      options as DatePickerOptions<any>;
    return (
      <DatePicker
        {...props}
        {...datePickerProps}
        value={(value as dayjs.Dayjs) ?? (fieldValue as dayjs.Dayjs) ?? null}
        error={fieldState.errorText !== undefined}
        helperText={fieldState.errorText || helperText}
        disabled={disabledGlobal || disabled}
        onChange={onChangeDatePicker}
        onBlur={onBlurTextField}
      />
    );
  } else if (fieldColumn.type === "countryselect") {
    const { helperText, disabled, ...props } = options as AutocompleteOptions;
    return (
      <CountrySelect
        {...props}
        {...autoCompleteOptions}
        value={
          (value as AutocompleteClass) ?? (fieldValue as AutocompleteClass)
        }
        error={fieldState.errorText !== undefined}
        helperText={
          fieldState.errorText ? fieldState.errorText : helperText?.toString()
        }
        disabled={disabledGlobal || disabled}
        onChange={onChangeAutoComplete}
        onBlur={onBlurAutoComplete}
      />
    );
  } else {
    console.error(`ControlFactory: unknown control type ${fieldColumn.type}`);
  }
};

export default React.memo(ControlFactory) as (
  props: ControlFactoryOptions
) => JSX.Element;
