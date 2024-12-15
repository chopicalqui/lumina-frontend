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

import { GridColDef } from "@mui/x-data-grid";
import { TextFieldOptions } from "./TextField";
import { LuminaControlOptions } from "./common";
import { SwitchOptions } from "./Switch";
import { AutoCompleteOption, DetailsDialogMode } from "../../utils/globals";
import { DatePickerOptions } from "./DatePicker";
import { Dayjs } from "dayjs";
import {
  verifyTextFieldDefault,
  verifyDatePickerDefault,
} from "../../models/common";

/**
 * The different states an input control can have.
 */
type StateFlagProps = {
  edited: boolean;
  errorText?: string;
};

/**
 * The state's state type.
 */
export type StateStateType = { [key: string]: StateFlagProps };

/**
 * Lumina uses a centralized approach to define the meta information of the model classes. This information is used
 * by Lumina to build the user interface and the MUI DataGrid.
 */
export interface MetaInfoType {
  // Whether the column is initially visible in the MUI DataGrid (default is true).
  visibleDataGrid?: boolean;
  // Information for InputControlWrapper component.
  inputControlInfo?: any;
  // Column information for the MUI DataGrid.
  dataGridInfo?: GridColDef;
  // Information for the useControlFactory hook to setup the control.
  // TODO: Update this attribute to include new MUI controls
  mui?: {
    textfield?: TextFieldOptions;
    switch?: SwitchOptions;
    datapicker?: DatePickerOptions<any>;
  };
}

/**
 * The different types of OnChange events.
 */
export type OnChangeEventType = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement
>;

/**
 * The different types of OnBlur events.
 */
export type OnBlurEventType = React.FocusEvent<
  HTMLInputElement | HTMLTextAreaElement,
  Element
>;

/*
 * The different types of reducer function actions.
 */
export type StateActions = "ON_CHANGE" | "ON_BLUR" | "UPDATE_VALUES";

// TODO: Update this type to include new MUI controls
export type MuiOptionsType =
  | TextFieldOptions
  | SwitchOptions
  | DatePickerOptions<any>;
// TODO: Update this type to include new MUI controls
export type MuiType = "textfield" | "switch" | "datepicker";
export type ControlValueType =
  | string
  | boolean
  | number
  | AutoCompleteOption
  | Dayjs
  | null // Only for datepicker
  | Date;

/**
 * This type is used to define the content of a control factory column definition.
 */
export interface StateColumnTypeProps extends LuminaControlOptions {
  options: MuiOptionsType;
  type: MuiType;
}

/**
 * This type is used to define the control factory column definition.
 */
export interface StateColumnType {
  [key: string]: StateColumnTypeProps;
}

/**
 * This type is used to define the control factory value definition.
 */
export interface StateValueType {
  [key: string]: ControlValueType;
}

/**
 * The state of the ControlFactory reducer.
 */
export interface ControlFactoryReducerState {
  // Contains the metadata of all controls within the current form.
  columns: StateColumnType;
  // Contains the current values of all controls within the current form.
  values: StateValueType;
  // Contains the state of all controls within the current form.
  states: StateStateType;
  // Defines whether one of the controls within the current form has an error.
  hasErrors?: boolean;
  // Defines whether any of the form values changed.
  hasChanges?: boolean;
  // Defines the form's status.
  mode?: DetailsDialogMode;
}

/**
 * The options of the OnChange event.
 */
export interface OnChangeOptionsType {
  // The attribute name of the control.
  field: string;
  // The event object provided by the control's onChange event.
  event?: OnChangeEventType;
  // The new value of the control.
  newValue: ControlValueType;
}

/**
 * The options of the OnBlur event.
 */
export interface OnBlurOptionsType {
  // The attribute name of the control.
  field: string;
  // The event object provided by the control's onBlur event.
  event: OnBlurEventType;
  // The new value of the control.
  newValue: ControlValueType;
}

/**
 * The options of the ControlFactory reducer.
 */
export interface ControlFactoryReducerOptions {
  // The state action that was dispatched.
  action: StateActions;
  // The arguments of action ON_CHANGE.
  onChangeOptions?: OnChangeOptionsType;
  // The arguments of action ON_BLUR.
  onBlurOptions?: OnBlurOptionsType;
  // The arguments of action UPDATE_VALUES.
  updateValuesOptions?: {
    // Contains the key value pairs of the controls that should be updated.
    content: any;
  };
}

/**
 * Helper function to split the MUI options from the rest of the options.
 */
const splitMuiOptions = (muiOptions: MuiOptionsType) => {
  const {
    field,
    label,
    noSubmit,
    errorText,
    getError,
    getFinalValue,
    ...options
  } = muiOptions;
  return {
    field,
    label,
    noSubmit: noSubmit === true,
    errorText,
    getError,
    getFinalValue,
    options: { ...options, label },
  };
};

/*
 * This function returns the input control's current value via the given event.
 */
export const getControlValue = (
  state: ControlFactoryReducerState,
  reducerOptions: ControlFactoryReducerOptions
): ControlValueType => {
  const { onBlurOptions, onChangeOptions } = reducerOptions;
  const field = onChangeOptions?.field || onBlurOptions?.field;
  const fieldColumn = field ? state.columns[field] : undefined;

  // TODO: Update this switch statement to include new MUI control
  switch (fieldColumn?.type) {
    case "textfield":
      return (
        onChangeOptions?.event?.target.value ??
        onBlurOptions?.event.target.value ??
        ""
      );
    case "switch":
      return reducerOptions.onChangeOptions?.newValue ?? false;
    case "datepicker":
      return reducerOptions.onChangeOptions?.newValue ?? null;
    default:
      throw new Error("Invalid control type: " + fieldColumn?.type);
  }
};

/**
 * Handles the useControlFactory's reducer actions ON_CHANGE and ON_BLUR.
 */
export const handleOnChangeBlur = (
  state: ControlFactoryReducerState,
  reducerOptions: ControlFactoryReducerOptions
): ControlFactoryReducerState => {
  const { action, onBlurOptions, onChangeOptions } = reducerOptions;
  const field = onChangeOptions?.field || onBlurOptions?.field;
  const fieldValue = field ? state.values[field] : undefined;
  const fieldColumn = field ? state.columns[field] : undefined;
  if (!field) {
    throw new Error("Field must not be undefined.");
  }
  const newValue = getControlValue(state, reducerOptions);
  const errorOptions = {
    field,
    label: fieldColumn?.label,
    value: newValue,
    state,
    required: fieldColumn?.options.required,
  };
  // TODO: Update this if statement to include new MUI control
  if (fieldColumn?.type === "switch") {
    // Update state
    return {
      ...state,
      values: { ...state.values, [field]: newValue },
    };
  } else if (fieldColumn?.type === "textfield") {
    // Perform input validation
    let error: string | undefined = undefined;
    // Only validate when the focus is lost
    if (action === "ON_BLUR") {
      try {
        // Perform the default validation
        verifyTextFieldDefault(errorOptions);
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      } catch (e: unknown) {
        error = (e as Error).message;
      }
    }
    // Update error flag and message
    const fieldState: StateFlagProps = {
      errorText: error,
      edited: fieldValue !== newValue,
    };
    // Update state
    return {
      ...state,
      states: { ...state.states, [field]: fieldState },
      values: { ...state.values, [field]: newValue },
    };
  } else if (fieldColumn?.type === "datepicker") {
    // Perform input validation
    let error: string | undefined = undefined;
    try {
      // Perform the default validation
      verifyDatePickerDefault(errorOptions);
      // Perform the custom validation
      fieldColumn?.getError?.(errorOptions);
    } catch (e: unknown) {
      error = (e as Error).message;
    }
    // Update error flag and message
    const fieldState: StateFlagProps = {
      errorText: error,
      edited: fieldValue !== newValue,
    };
    // Update state
    return {
      ...state,
      states: { ...state.states, [field]: fieldState },
      values: {
        ...state.values,
        [field]: newValue || null,
      },
    };
  } else {
    throw new Error(`Invalid control type: ${fieldColumn?.type}`);
  }
};

/**
 * This function converts the meta information to the columns attribute of the useControlFactory state.
 */
export const createStateColumns = (metaInfo: MetaInfoType[]): StateColumnType =>
  metaInfo
    .filter((item) => item.mui !== undefined)
    .reduce((acc: StateColumnType, item: MetaInfoType) => {
      const mui = item!.mui;
      // TODO: Update this if statement to include new MUI control
      if (mui?.textfield !== undefined) {
        const { options, field, label, ...rest } = splitMuiOptions(
          mui.textfield
        );
        acc[field] = {
          ...rest,
          label,
          field,
          type: "textfield",
          options: options as TextFieldOptions,
        };
      } else if (mui?.switch !== undefined) {
        const { options, field, label, ...rest } = splitMuiOptions(mui.switch);
        acc[field] = {
          ...rest,
          label,
          field,
          type: "switch",
          options: options as SwitchOptions,
        };
      } else if (mui?.datapicker !== undefined) {
        const { options, field, label, ...rest } = splitMuiOptions(
          mui.datapicker
        );
        acc[field] = {
          ...rest,
          label,
          field,
          type: "datepicker",
          options: options as DatePickerOptions<any>,
        };
      } else {
        throw new Error(`Invalid MetaInfoType`);
      }
      return acc;
    }, {} as StateColumnType);

/**
 * This function initializes the values attribute of the useControlFactory state.
 */
export const createInitialStateValues = (
  columns: StateColumnType
): StateValueType => {
  return Object.entries(columns).reduce((acc, [key, value]) => {
    if (value.type === "textfield") {
      acc[key] = "";
    } else if (value.type === "switch") {
      acc[key] = false;
    } else if (value.type === "datepicker") {
      acc[key] = null;
    } else {
      throw new Error(`Unknown type ${value.type}.`);
    }
    return acc;
  }, {} as StateValueType);
};

/**
 * This function initializes the states attribute of the useControlFactory state.
 */
export const createInitialStateStates = (
  columns: StateColumnType
): StateStateType => {
  return Object.entries(columns).reduce((acc: StateStateType, [key, value]) => {
    const defaultValue = { edited: false, errorText: undefined };
    // TODO: Update this if statement to include new MUI control
    if (["textfield", "switch", "datepicker"].includes(value.type)) {
      acc[key] = { ...defaultValue };
    } else {
      throw new Error(`Unknown type ${value.type}.`);
    }
    return acc;
  }, {} as StateStateType);
};
