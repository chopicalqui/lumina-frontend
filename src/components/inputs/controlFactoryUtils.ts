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
import { AutocompleteOption, DetailsDialogMode } from "../../utils/globals";
import { DatePickerOptions } from "./DatePicker";
import { Dayjs } from "dayjs";
import {
  verifyTextFieldDefault,
  verifyDatePickerDefault,
  StatusMessage,
  verifyAutocompleteDefault,
} from "../../models/common";
import { MutateOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AutocompleteOptions } from "./Autocomplete";

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
  // Column information for the MUI DataGrid.
  dataGridInfo?: GridColDef;
  // Information for the useControlFactory hook to setup the control.
  // TODO: Update this attribute to include new MUI controls
  mui?: {
    textfield?: TextFieldOptions;
    switch?: SwitchOptions;
    datapicker?: DatePickerOptions<any>;
    autocomplete?: AutocompleteOptions;
    countryselect?: AutocompleteOptions;
  };
}

/**
 * The different types of OnChange events.
 */
export type OnChangeEventType =
  | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  | React.SyntheticEvent;

/**
 * The different types of OnBlur events.
 */
export type OnBlurEventType =
  | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  | React.FocusEvent<HTMLDivElement, Element>;

/*
 * The different types of reducer function actions.
 */
export type StateActions =
  | "ON_CHANGE"
  | "ON_BLUR"
  | "UPDATE_VALUES"
  | "HIGHLIGHT_ERRORS";

// TODO: Update this type to include new MUI controls
export type MuiOptionsType =
  | TextFieldOptions
  | SwitchOptions
  | AutocompleteOptions
  | DatePickerOptions<any>;

// TODO: Update this type to include new MUI controls
export type MuiType =
  | "textfield"
  | "switch"
  | "datepicker"
  | "autocomplete"
  | "countryselect";
export type ControlValueType =
  | string
  | boolean
  | number
  | AutocompleteOption
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

export interface OnSubmitOptionsType {
  // The mutate function to call.
  mutate: (
    variables: any,
    options?:
      | MutateOptions<unknown, AxiosError<StatusMessage, any>, any, undefined>
      | undefined
  ) => void;
  // The onUpdate function returned by the useControlFactory hook. It updates the state values after the mutation
  // was successful (status code 200).
  onUpdate?: (content: StateValueType) => void;
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
  // The arguments of action ON_SUBMIT.
  onSubmitOptions?: OnSubmitOptionsType;
  // The arguments of action UPDATE_VALUES.
  updateValuesOptions?: {
    // Contains the key value pairs of the controls that should be updated.
    content: any;
  };
}

/**
 * This function is used to check the entire state for errors.
 */
export const checkStateForErrors = (state: ControlFactoryReducerState) => {
  const result = { ...state };
  result.hasErrors = false;
  Object.entries(state.columns).forEach(([field, fieldColumn]) => {
    // Perform input validation
    const fieldValue = state.values[field];
    const errorOptions = {
      field,
      label: fieldColumn?.label,
      value: fieldValue,
      state,
      required: fieldColumn?.options.required,
    };
    try {
      // TODO: Update this if statement to include new MUI control
      if (fieldColumn.type === "textfield") {
        // Perform the default validation
        verifyTextFieldDefault(errorOptions);
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      } else if (["autocomplete", "countryselect"].includes(fieldColumn.type)) {
        // Perform the default validation
        verifyTextFieldDefault(errorOptions);
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      } else if (fieldColumn.type === "switch") {
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      } else if (fieldColumn.type === "datepicker") {
        // Perform the default validation
        verifyDatePickerDefault(errorOptions);
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      }
    } catch (e: unknown) {
      result.hasErrors = true;
      result.states[field].errorText = (e as Error).message;
    }
  });
  return result;
};

/**
 * This function is used to obtain the final state of the form.
 */
export const getFinalState = (state: ControlFactoryReducerState) => {
  const result: StateValueType = {};
  Object.entries(state.columns).forEach(([field, fieldColumn]) => {
    if (!fieldColumn.noSubmit) {
      const fieldValue = state.values[field];
      const finalValue = fieldColumn?.getFinalValue?.(fieldValue) ?? fieldValue;
      result[field] = finalValue;
    }
  });
  return result;
};

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
  if (fieldColumn?.type === "textfield") {
    const onChangeEvent = onChangeOptions?.event as React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >;
    const onBlurEvent = onBlurOptions?.event as React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement,
      Element
    >;
    return onChangeEvent?.target.value ?? onBlurEvent?.target.value ?? "";
  } else if (
    ["autocomplete", "countryselect"].includes(fieldColumn?.type ?? "")
  ) {
    return reducerOptions.onChangeOptions?.newValue ?? null;
  } else if (fieldColumn?.type === "switch") {
    return reducerOptions.onChangeOptions?.newValue ?? false;
  } else if (fieldColumn?.type === "datepicker") {
    return reducerOptions.onChangeOptions?.newValue ?? null;
  } else {
    throw new Error(`Invalid control type: ${fieldColumn?.type}`);
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
  let hasError = false;
  let result: ControlFactoryReducerState;
  if (!field) {
    throw new Error("Field must not be undefined.");
  }
  let newValue = getControlValue(state, reducerOptions);
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
    result = {
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
        hasError = true;
        error = (e as Error).message;
      }
    }
    // Update error flag and message
    const fieldState: StateFlagProps = {
      errorText: error,
      edited: fieldValue !== newValue,
    };
    // Update state
    result = {
      ...state,
      states: { ...state.states, [field]: fieldState },
      values: { ...state.values, [field]: newValue },
    };
  } else if (
    ["autocomplete", "countryselect"].includes(fieldColumn?.type ?? "")
  ) {
    let error: string | undefined = undefined;
    try {
      // If the control looses focus, the errorOptions.value is set to the current value.
      if (action === "ON_BLUR") {
        newValue = fieldValue ?? null;
        errorOptions.value = fieldValue ?? null;
      }
      // Perform the default validation
      verifyAutocompleteDefault(errorOptions);
      // Perform the custom validation
      fieldColumn?.getError?.(errorOptions);
    } catch (e: unknown) {
      hasError = true;
      error = (e as Error).message;
    }
    // Update error flag and message
    const fieldState: StateFlagProps = {
      errorText: error,
      edited: fieldValue !== newValue,
    };
    // Update state
    result = {
      ...state,
      states: { ...state.states, [field]: fieldState },
      values: {
        ...state.values,
        [field]: newValue || null,
      },
    };
  } else if (fieldColumn?.type === "datepicker") {
    // Only validate when the focus is lost
    if (action === "ON_BLUR") {
      // Perform input validation
      let error: string | undefined = undefined;
      // The onBlur event by itself does not provide the new value. Hence, we need to consider the current value as well.
      errorOptions.value = fieldValue ?? newValue;
      try {
        // Perform the default validation
        verifyDatePickerDefault(errorOptions);
        // Perform the custom validation
        fieldColumn?.getError?.(errorOptions);
      } catch (e: unknown) {
        hasError = true;
        error = (e as Error).message;
      }
      // Update error flag and message
      const fieldState: StateFlagProps = {
        errorText: error,
        edited: fieldValue !== newValue,
      };
      // Update state
      result = {
        ...state,
        states: { ...state.states, [field]: fieldState },
        values: {
          ...state.values,
        },
      };
    } else {
      // Update state only in onChange cases
      const fieldState: StateFlagProps = {
        edited: fieldValue !== newValue,
      };
      // Update state
      result = {
        ...state,
        states: { ...state.states, [field]: fieldState },
        values: {
          ...state.values,
          [field]: newValue || null,
        },
      };
    }
  } else {
    throw new Error(`Invalid control type: ${fieldColumn?.type}`);
  }
  // An update in the current field can cause an error in other fields (e.g., a date must before another date).
  // Hence, we need to check the entire state.
  Object.keys(result.columns)
    .filter((key) => key !== field)
    .forEach((key) => {
      try {
        const errorOptions = {
          field: key,
          label: result.columns[key]?.label,
          value: result.values[key],
          state: result,
          required: result.columns[key]?.options.required,
        };
        result.columns[key].getError?.(errorOptions);
        result.states[key].errorText = undefined;
      } catch (e: unknown) {
        hasError = hasError || true;
        result.states[key].errorText = (e as Error).message;
      }
    });
  return result;
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
      } else if (mui?.autocomplete !== undefined) {
        const { options, field, label, ...rest } = splitMuiOptions(
          mui.autocomplete
        );
        acc[field] = {
          ...rest,
          label,
          field,
          type: "autocomplete",
          options: options as AutocompleteOptions,
        };
      } else if (mui?.countryselect !== undefined) {
        const { options, field, label, ...rest } = splitMuiOptions(
          mui.countryselect
        );
        acc[field] = {
          ...rest,
          label,
          field,
          type: "countryselect",
          options: options as AutocompleteOptions,
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
      acc[key] = null;
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
    if (
      [
        "textfield",
        "switch",
        "datepicker",
        "autocomplete",
        "countryselect",
      ].includes(value.type)
    ) {
      acc[key] = { ...defaultValue };
    } else {
      throw new Error(`Unknown type ${value.type}.`);
    }
    return acc;
  }, {} as StateStateType);
};
