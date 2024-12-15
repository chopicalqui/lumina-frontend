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
  ControlFactoryReducerOptions,
  ControlFactoryReducerState,
  createInitialStateStates,
  createInitialStateValues,
  createStateColumns,
  handleOnChangeBlur,
  MetaInfoType,
  OnBlurOptionsType,
  OnChangeOptionsType,
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
  }
  return { ...state };
};

/**
 * Hook to use a control factory.
 */
export const useControlFactory = <T>(
  metaInfo: MetaInfoType[],
  queryContext?: UseQueryForDataGridResult<T>
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
   */
  const updateValues = React.useCallback(
    (content: StateValueType) =>
      dispatch({
        action: "UPDATE_VALUES",
        updateValuesOptions: { content },
      }),
    []
  );

  // Update the values when the query context is successful.
  React.useEffect(() => {
    if (isSuccess) {
      dispatch({
        action: "UPDATE_VALUES",
        updateValuesOptions: { content },
      });
    }
  }, [isSuccess, content]);

  return React.useMemo(
    () => ({ state, onChange, onBlur, updateValues }),
    [state, onChange, onBlur, updateValues]
  );
};
