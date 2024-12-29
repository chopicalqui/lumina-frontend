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
import {
  checkStateForErrors,
  ControlFactoryReducerOptions,
  ControlFactoryReducerState,
  createInitialStateStates,
  createInitialStateValues,
  createStateColumns,
  getFinalState,
  handleOnChangeBlur,
  MetaInfoType,
  OnBlurOptionsType,
  OnChangeOptionsType,
  OnSubmitOptionsType,
  StateValueType,
} from "../../../components/inputs/controlFactoryUtils";
import { UseQueryForDataGridResult } from "../tanstack/useQuery";

/**
 * Creates the initial state for the control factory.
 */
export const useInitialState = (
  metaInfo: MetaInfoType[]
): ControlFactoryReducerState => {
  const columns = React.useMemo(() => createStateColumns(metaInfo), [metaInfo]);
  return React.useMemo(
    () => ({
      columns,
      values: createInitialStateValues(columns),
      states: createInitialStateStates(columns),
      hasErrors: false,
      hasChanges: false,
      mode: undefined,
    }),
    [columns]
  );
};

/**
 * The result of the useControlFactory hook.
 */
export interface UseControlFactoryResult {
  // The current state of the reducer.
  state: ControlFactoryReducerState;
  // The onChange event handler for input controls.
  onChange: (props: OnChangeOptionsType) => void;
  // The onBlur event handler for input controls.
  onBlur: (props: OnBlurOptionsType) => void;
  // The onSubmit event handler for input controls.
  onSubmit: (props?: OnSubmitOptionsType) => void;
  // Function to highlight the errors of the input controls.
  highlightErrors: () => void;
  // Function to update the values of the input controls.
  updateValues: (content: any) => void;
}

/**
 * The reducer function for the control factory.
 */
const controlFactoryReducer = (
  state: ControlFactoryReducerState,
  options: ControlFactoryReducerOptions
) => {
  const { action } = options;

  if (action === "ON_CHANGE" || action === "ON_BLUR") {
    const result = handleOnChangeBlur(state, options);
    return result;
  } else if (action === "UPDATE_VALUES") {
    if (!options.updateValuesOptions) {
      throw new Error("The updateValuesOptions are missing.");
    }
    const result: StateValueType = {};
    const { content } = options.updateValuesOptions;
    Object.keys(state.columns).forEach((field) => {
      if (field in content) {
        result[field] = content[field];
      }
    });
    return {
      ...state,
      values: { ...state.values, ...content, ...result },
    };
  } else if (action === "ON_SUBMIT") {
    const newState = checkStateForErrors(state);
    // If there are errors, we return the state.
    if (newState.hasErrors) {
      throw new Error(
        "The on submit action should only be called when you are sure that there aren't any errors."
      );
    }
    // If there are no errors, we obtain the final value and call the mutate function.
    const result = getFinalState(newState);
    options.onSubmitOptions?.mutate(result);
  } else if (action == "HIGHLIGHT_ERRORS") {
    const newState = checkStateForErrors(state);
    return newState;
  }
  return { ...state };
};

/**
 * Hook to use a control factory.
 */
export const useControlFactory = <T>(
  metaInfo: MetaInfoType[],
  queryContext?: UseQueryForDataGridResult<T>,
  // The options for the onSubmit event handler.
  // You can either provide it as a hook parameter or as a parameter in the onSubmit function.
  onSubmitOptions?: OnSubmitOptionsType
): UseControlFactoryResult => {
  const initialState = useInitialState(metaInfo);
  const [state, dispatch] = React.useReducer(
    controlFactoryReducer,
    initialState
  );
  const isSuccess = queryContext?.isSuccess === true;
  const content = queryContext?.data;

  /**
   * The onChange event handler for input controls.
   */
  const onChange = React.useCallback(
    (props: OnChangeOptionsType) =>
      dispatch({
        action: "ON_CHANGE",
        onChangeOptions: props,
      }),
    [dispatch]
  );

  /**
   * The onBlur event handler for input controls.
   */
  const onBlur = React.useCallback(
    (props: OnBlurOptionsType) =>
      dispatch({
        action: "ON_BLUR",
        onBlurOptions: props,
      }),
    [dispatch]
  );

  /**
   * Function to update the values of the input controls.
   * Note: The keys of the content object must exist in the columns object.
   */
  const updateValues = React.useCallback(
    (content: StateValueType) =>
      dispatch({
        action: "UPDATE_VALUES",
        updateValuesOptions: { content },
      }),
    []
  );

  /**
   * The onSubmit event handler for input controls.
   */
  const onSubmit = React.useCallback(
    (props?: OnSubmitOptionsType) => {
      // Check if there are errors in the form.
      const tmpState = checkStateForErrors(state);
      if (tmpState.hasErrors) {
        dispatch({ action: "HIGHLIGHT_ERRORS" });
        throw new Error("The form has errors.");
      } else {
        dispatch({
          action: "ON_SUBMIT",
          onSubmitOptions: props ?? onSubmitOptions,
        });
      }
    },
    [dispatch, onSubmitOptions, state]
  );

  /**
   * Function to highlight the errors of the input controls.
   */
  const highlightErrors = React.useCallback(
    () => dispatch({ action: "HIGHLIGHT_ERRORS" }),
    []
  );

  /**
   * Function to check the errors of the input controls.
   */
  const checkErrors = React.useCallback(() => {
    const tmpState = checkStateForErrors(state);
    if (tmpState.hasErrors) {
      dispatch({ action: "HIGHLIGHT_ERRORS" });
      throw new Error("The form has errors.");
    }
  }, [state]);

  /**
   * Update the values when the query context is successful.
   */
  React.useEffect(() => {
    if (isSuccess) {
      dispatch({
        action: "UPDATE_VALUES",
        updateValuesOptions: { content },
      });
    }
  }, [isSuccess, content]);

  return React.useMemo(
    () => ({
      state,
      onChange,
      onBlur,
      updateValues,
      onSubmit,
      checkErrors,
      highlightErrors,
    }),
    [
      state,
      onChange,
      onBlur,
      updateValues,
      onSubmit,
      checkErrors,
      highlightErrors,
    ]
  );
};
