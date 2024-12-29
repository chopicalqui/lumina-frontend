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
import {
  AutocompleteProps as MuiAutocompleteProps,
  ChipTypeMap,
  FilterOptionsState,
  Autocomplete as MuiAutocomplete,
  FormControl,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import React from "react";
import { AutoCompleteClass, ClassType } from "../../utils/globals";
import { QueryKey } from "@tanstack/react-query";
import {
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import { UseMutationResult } from "../../utils/hooks/tanstack/useMutation";
import { useQuery } from "../../utils/hooks/tanstack/useQuery";
import { axiosGet } from "../../utils/axios";
import { LuminaControlOptions } from "./common";

const filter = createFilterOptions<AutoCompleteClass>();

/**
 * The AutocompleteProps type.
 */
export type AutocompleteProps<
  T extends AutoCompleteClass = AutoCompleteClass,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"],
> = MuiAutocompleteProps<
  T,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>;

/**
 * Filter the options and suggest the creation of a new value.
 */
const filterOptions = (
  options: AutoCompleteClass[],
  state: FilterOptionsState<AutoCompleteClass>
) => {
  const filtered = filter(options, state);
  const { inputValue } = state;
  // Suggest the creation of a new value
  const isExisting = options.some((option) => inputValue === option.label);
  if (inputValue !== "" && !isExisting) {
    filtered.push({
      id: inputValue,
      label: `Add "${inputValue}"`,
    });
  }
  return filtered;
};

/**
 * Interface for the Autocomplete component.
 */
export interface AutocompleteOptions<
  T extends AutoCompleteClass = AutoCompleteClass,
> extends LuminaControlOptions,
    AutocompleteProps<AutoCompleteClass> {
  // This class will be used to create new instances of the model.
  ClassRef: ClassType<T>;
  // Flag to indicate if the component contains an input error.
  error?: boolean;
  // Helper text to display below the input.
  helperText?: string;
  // The endpoint to fetch the data from.
  queryUrl?: string;
  // The query key used to fetch the data from the backend.
  queryKey?: QueryKey;
  // The mutation used to create a new entry in the backend.
  mutation?: UseMutationResult;
  // Flag to indicate if the input is required.
  required?: boolean;
  // Flag to indicate if the input can contain multiple values.
  multiple?: boolean;
}

const Autocomplete = React.memo(
  <T extends AutoCompleteClass = AutoCompleteClass>(
    args: AutocompleteOptions<T>
  ) => {
    const {
      ClassRef,
      error,
      label,
      value,
      helperText,
      queryUrl,
      queryKey,
      mutation,
      multiple,
      onChange,
      getOptionLabel,
      freeSolo,
      ...props
    } = args;
    const [open, setOpen] = React.useState(false);
    const async = queryUrl !== undefined && queryKey !== undefined;

    // Fetch the daa from the backend.
    const queryContext = useQuery<T[]>(
      React.useMemo(
        () => ({
          queryFn: async () => axiosGet(queryUrl ?? ""),
          select: (data: T[]) => data.map((x) => new ClassRef(x)),
          queryKey: queryKey ?? [],
          enabled: async && open,
        }),
        [async, queryUrl, queryKey, ClassRef, open]
      )
    );
    const options = queryContext.data ?? [];

    /**
     * Function pushes new entry to the backend.
     *
     * We cannot use a Tanstack mutation because we must immediately obtain and process the HTTP response.
     */
    const onPushNewEntry = React.useCallback(async (item: string) => {}, []);

    /**
     * Event handler for freeSolo mode.
     */
    const onChangeHandler = React.useCallback(
      async (
        event: React.SyntheticEvent,
        newValue: any | any[] | null,
        reason: AutocompleteChangeReason
      ) => {
        // newValue contains all the selected values. Therefore, if the multiple attribute is set to true, then newValue
        // is an array with all selected elements.
        if (multiple) {
          const count = newValue?.length ?? 0;
          const newElement = newValue[count - 1];
          const updatedValue = newValue?.slice(0, count - 1) ?? [];

          if (newElement?.inputValue) {
            // If the element does not exist in the dropdown menu yet, then it contains an object with the following
            // structure: {inputValue: 'Production', name: 'Add "Production"'} else, it is just a string.
            const jsonObject = await onPushNewEntry(newElement.inputValue);
            if (jsonObject === null) {
              return;
            }
            // Create a new value from the user input
            updatedValue.push(jsonObject);
            onChange?.(event, updatedValue, reason);
          } else if (
            getOptionLabel &&
            typeof getOptionLabel(newElement) === "string"
          ) {
            // If the element is of type string, then it's a value that already exists in the dropdown menu.
            updatedValue.push(newElement);
            onChange?.(event, updatedValue, reason);
          } else if (newElement) {
            // If the user enters a new value and hits enter. In this case, query.data is empty and we have to push the value
            // to the backend, which will create and/or just return the JSON object for us.
            const jsonObject = await onPushNewEntry(newElement);
            if (jsonObject === null) {
              return;
            }
            updatedValue.push(jsonObject);
            onChange?.(event, updatedValue, reason);
          } else {
            // If the content of the component is deleted.
            onChange?.(event, updatedValue, reason);
          }
        } else {
          // TODO: This branch tests Autocomplete components with singleSelect attribute. This has not been tested yet.
          if (newValue?.inputValue) {
            // If the element does not exist in the dropdown menu yet, then it contains an object with the following
            // structure: {inputValue: 'Production', name: 'Add "Production"'} else, it is just a string.
            const jsonObject = await onPushNewEntry(newValue.inputValue);
            if (jsonObject === null) {
              return;
            }
            onChange?.(event, jsonObject, reason);
          } else if (
            getOptionLabel &&
            typeof getOptionLabel(newValue) === "string"
          ) {
            // If the element is of type string, then it's a value that already exists in the dropdown menu.
            onChange?.(event, newValue, reason);
          } else if (newValue) {
            // If the user enters a new value and hits enter. In this case, query.data is empty and we have to push the value
            // to the backend, which will create and/or just return the JSON object for us.
            const jsonObject = await onPushNewEntry(newValue);
            if (jsonObject === null) {
              return;
            }
            onChange?.(event, jsonObject, reason);
          } else {
            // If the content of the component is deleted.
            onChange?.(event, newValue, reason);
          }
        }
      },
      [multiple, onPushNewEntry, onChange, getOptionLabel]
    );

    /**
     * Event handler that opens the Autocomplete's dropdown menu.
     */
    const onOpen = React.useCallback(() => setOpen(true), []);

    /**
     * Event handler that closes the Autocomplete's dropdown menu.
     */
    const onClose = React.useCallback(() => setOpen(false), []);

    return (
      <FormControl error={error} fullWidth={true}>
        <InputLabel htmlFor="input-label">{label}</InputLabel>
        <MuiAutocomplete
          {...props}
          options={options}
          freeSolo={freeSolo}
          multiple={multiple ?? false}
          value={value ?? []}
          open={open}
          onOpen={onOpen}
          onClose={onClose}
          onChange={freeSolo ? onChangeHandler : onChange}
          filterOptions={filterOptions}
        />
        <FormHelperText id="helper-text">{helperText}</FormHelperText>
      </FormControl>
    );
  }
);

export default Autocomplete;
