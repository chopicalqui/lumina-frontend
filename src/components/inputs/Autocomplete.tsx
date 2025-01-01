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
  AutocompleteProps as MuiAutocompleteProps_,
  ChipTypeMap,
  FilterOptionsState,
  Autocomplete as MuiAutocomplete,
  FormControl,
  TextField,
} from "@mui/material";
import React from "react";
import { AutoCompleteClass, AutoCompleteOption } from "../../utils/globals";
import { QueryKey } from "@tanstack/react-query";
import {
  AutocompleteChangeReason,
  AutocompleteRenderInputParams,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import {
  useMutation,
  UseMutationResult,
} from "../../utils/hooks/tanstack/useMutation";
import { useQuery } from "../../utils/hooks/tanstack/useQuery";
import { axiosDelete, axiosGet, axiosPost } from "../../utils/axios";
import { LuminaControlOptions } from "./common";
import { queryClient } from "../../utils/consts";
import { UseMutationAlert } from "../feedback/TanstackAlert";

const filter = createFilterOptions<AutoCompleteClass>();

/**
 * The AutocompleteProps type.
 */
export type MuiAutocompleteProps<
  T extends AutoCompleteClass = AutoCompleteClass,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap["defaultComponent"],
> = MuiAutocompleteProps_<
  T,
  Multiple,
  DisableClearable,
  FreeSolo,
  ChipComponent
>;

/**
 * Helper interface to notify the onChange handler that a new value should be created.
 *
 * This interface is used by the filterOptions function to suggest the creation of a new value.
 */
interface AutocompleteFilterClass extends AutoCompleteClass {
  new?: boolean;
}

/**
 * Filter the options and suggest the creation of a new value.
 */
const filterOptions = (
  options: AutoCompleteClass[],
  state: FilterOptionsState<AutoCompleteClass>
): AutocompleteFilterClass[] => {
  const filtered = filter(options, state) as AutocompleteFilterClass[];
  const { inputValue } = state;
  // Suggest the creation of a new value
  if (inputValue !== "" && filtered.length === 0) {
    filtered.push({
      id: inputValue,
      label: `Add "${inputValue}"`,
      new: true,
    });
  }
  return filtered;
};

/**
 * The AutocompleteClass type.
 */
type AutocompleteClass = any;

/**
 * The onChange event handler type.
 */
export type AutocompleteOnChangeType = (
  event: React.SyntheticEvent,
  newValue: any | any[] | null,
  reason: AutocompleteChangeReason
) => void;

/**
 * The onBlur event handler type.
 */
export type AutocompleteOnBlurType = (
  event: React.FocusEvent<HTMLDivElement, Element>
) => void;

/**
 * Interface for the Autocomplete component.
 *
 * We cannot derive it from the MuiAutocompleteProps because there are conflicting properties.
 */
export interface AutocompleteProps {
  // The value of the autocomplete.
  value?: AutoCompleteClass | AutoCompleteClass[] | null;
  // A list of options that will be shown in the Autocomplete.
  options?: AutoCompleteClass[];
  // If true, the label is displayed as required and the input element is required.
  required?: boolean;
  // If true, the Autocomplete is free solo, meaning that the user input is not bound to provided options.
  freeSolo?: boolean;
  // If true, value must be an array and the menu will support multiple selections.
  multiple?: boolean;
  // Flag to indicate if the component contains an input error.
  error?: boolean;
  // Helper text to display below the input.
  helperText?: string;
  // The endpoint to fetch the data from.
  queryUrl?: string;
  // If true, the Autocomplete is disabled.
  disabled?: boolean;
  // The query key used to fetch the data from the backend.
  queryKey?: QueryKey;
  // The mutation used to create a new entry in the backend.
  mutation?: UseMutationResult;
  // Callback fired when the value changes.
  onChange?: AutocompleteOnChangeType;
  // Callback fired when the TextField loses focus.
  onBlur?: AutocompleteOnBlurType;
  // If true, the user can delete the value.
  allowDelete?: boolean;
}

export type AutocompleteOptions = AutocompleteProps & LuminaControlOptions;

/**
 * Autocomplete component that can be created by the ControlFactory component.
 */
const Autocomplete = React.memo((args: AutocompleteOptions) => {
  const {
    error,
    label,
    helperText,
    queryUrl,
    queryKey,
    onChange,
    onBlur,
    ...props
  } = args;
  const freeSolo = args.freeSolo ?? false;
  const multiple = args.multiple ?? false;
  const required = args.required ?? false;
  const value = multiple ? (args.value ?? []) : (args.value ?? null);
  const [open, setOpen] = React.useState(false);
  const async = queryUrl !== undefined && queryKey !== undefined;
  const mutationPostContext = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosPost(queryUrl ?? "", data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
      }),
      [queryUrl, queryKey]
    )
  );
  const mutationDeleteContext = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosDelete(queryUrl ?? "", data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey }),
      }),
      [queryUrl, queryKey]
    )
  );

  // Fetch the daa from the backend.
  const queryContext = useQuery<AutocompleteClass[]>(
    React.useMemo(
      () => ({
        queryFn: async () => axiosGet(queryUrl ?? ""),
        select: (data: AutocompleteClass[]) =>
          data.map((x) => x as AutocompleteClass),
        queryKey: queryKey ?? [],
        enabled: async && open,
      }),
      [async, queryUrl, queryKey, open]
    )
  );
  const options = queryContext.data ?? [];

  /**
   * Function pushes new entry to the backend.
   *
   * We cannot use a Tanstack mutation because we must immediately obtain and process the HTTP response.
   */
  const onPushNewEntry = React.useCallback(
    (
      item: string,
      event: React.SyntheticEvent,
      stateValue?: AutoCompleteClass[]
    ) => {
      const body = { label: item };
      mutationPostContext.mutate(body, {
        onSuccess: (data: unknown) => {
          if (stateValue) {
            if (data) {
              stateValue.push(
                new AutoCompleteClass(data as AutoCompleteOption)
              );
              onChange?.(event, stateValue, "createOption");
            }
          } else {
            onChange?.(
              event,
              new AutoCompleteClass(data as AutoCompleteOption),
              "createOption"
            );
          }
        },
      });
    },
    [mutationPostContext, onChange]
  );

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

        if (newElement?.new) {
          // If the element does not exist in the dropdown menu yet, then we have to push the value to the backend
          onPushNewEntry(newElement.id, event, updatedValue);
        } else if (newElement) {
          updatedValue.push(newElement);
          onChange?.(event, updatedValue, reason);
        } else {
          // This case is called, when the last element in the selection is deleted.
          onChange?.(event, updatedValue, reason);
        }
      } else {
        if (newValue?.new) {
          // If the element does not exist in the dropdown menu yet, then we have to push the value to the backend
          onPushNewEntry(newValue.id, event);
        } else if (newValue) {
          onChange?.(event, newValue, reason);
        } else {
          // If the content of the component is deleted.
          onChange?.(event, newValue, reason);
        }
      }
    },
    [multiple, onPushNewEntry, onChange]
  );

  /**
   * This function is used to get the render input for the Autocomplete component.
   */
  const renderInput = React.useCallback(
    (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        label={label}
        error={error}
        required={required}
        helperText={helperText}
      />
    ),
    [label, error, required, helperText]
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
    <>
      <UseMutationAlert {...mutationPostContext} />
      <UseMutationAlert {...mutationDeleteContext} />
      <FormControl error={error} fullWidth={true}>
        <MuiAutocomplete
          {...props}
          options={options}
          value={value ?? []}
          open={open}
          onOpen={onOpen}
          onClose={onClose}
          renderInput={renderInput}
          onBlur={onBlur}
          onChange={freeSolo ? onChangeHandler : onChange}
          filterOptions={freeSolo ? filterOptions : undefined}
          isOptionEqualToValue={React.useCallback(
            (option: AutocompleteClass, value: AutocompleteClass) =>
              option.id === value.id,
            []
          )}
        />
      </FormControl>
    </>
  );
});

export default Autocomplete;
