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
  CircularProgress,
  Box,
  IconButton,
  SxProps,
  Theme,
  TextFieldVariants,
} from "@mui/material";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { AutoCompleteClass, AutoCompleteOption } from "../../utils/globals";
import { QueryKey } from "@tanstack/react-query";
import {
  AutocompleteChangeReason,
  AutocompletePropsSizeOverrides,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import { OverridableStringUnion } from "@mui/types";
import {
  useMutation,
  UseMutationResult,
} from "../../utils/hooks/tanstack/useMutation";
import { useQuery } from "../../utils/hooks/tanstack/useQuery";
import { axiosDelete, axiosGet, axiosPost } from "../../utils/axios";
import { LuminaControlOptions } from "./common";
import { invalidateQueryKeys } from "../../utils/consts";
import { UseMutationAlert } from "../feedback/TanstackAlert";
import { useConfirmDialog } from "../../utils/hooks/mui/useConfirmDialog";
import ConfirmationDialog from "../feedback/dialogs/ConfirmDialog";

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
 * The render option function .
 */
export type RenderOptionFunctionType = (
  props: React.HTMLAttributes<HTMLLIElement> & { key: any },
  option: AutoCompleteClass,
  state: AutocompleteRenderOptionState
) => React.ReactNode;

/**
 * The render option type.
 */
type RenderOptionType = {
  allowDelete?: boolean;
  isLoading?: boolean;
  onDelete: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  props: React.HTMLAttributes<HTMLLIElement>;
  option: AutoCompleteClass;
  state: AutocompleteRenderOptionState;
};

/**
 * Render a single option in the Autocomplete component.
 */
const RenderOption = React.memo((props: RenderOptionType) => {
  const { allowDelete, onDelete, option } = props;
  const { ...optionProps } = props.props;
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
      }}
      {...optionProps}
    >
      <span style={{ flexGrow: 1 }}>{option.label}</span>
      {allowDelete === true ? (
        <IconButton aria-label="delete" size="small" onClick={onDelete}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      ) : undefined}
    </Box>
  );
});

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
  // The variant of the renderInput component.
  variant?: TextFieldVariants;
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
  // The render option function.
  renderOption?: RenderOptionFunctionType;
  // The component's size
  size?: OverridableStringUnion<
    "small" | "medium",
    AutocompletePropsSizeOverrides
  >;
  // Optional function that returns component that is displayed before the text.
  startAdornment?: (row: AutoCompleteClass | null) => JSX.Element | undefined;
  // Instead of a label, a placeholder can be specified.
  placeholder?: string;
  // sx prop for the TextField component.
  sxTextfield?: SxProps<Theme>;
  // Handler that is called before a new POST request is sent to the backend. It allows the parent component to
  // modify the content of the final POST request body.
  onCreateHandler?: (name: string) => any;
  // Handler that is called when a new Autocomplete item is successfully created.
  onCreateSuccessHandler?: (data: AutoCompleteClass) => void;
  // Handler that is called when a new Autocomplete item is successfully deleted.
  onDeleteSuccessHandler?: () => void;
  // List of query keys that must be invalidated when a new Autocomplete item is successfully created
  // (default is queryKey)
  postInvalidateQueryKeys?: QueryKey[];
  // List of query keys that must be invalidated when a Autocomplete item is successfully deleted.
  // (default is queryKey)
  deleteInvalidateQueryKeys?: QueryKey[];
}

export type AutocompleteOptions = AutocompleteProps & LuminaControlOptions;

/**
 * Autocomplete component that can be created by the ControlFactory component.
 */
const Autocomplete = (args: AutocompleteOptions) => {
  const {
    error,
    label,
    helperText,
    queryUrl: url,
    queryKey,
    onChange,
    onBlur,
    allowDelete,
    variant,
    size,
    startAdornment,
    placeholder,
    sxTextfield,
    onCreateHandler,
    onCreateSuccessHandler,
    onDeleteSuccessHandler,
    postInvalidateQueryKeys: postInvalidateQueryKeys_,
    deleteInvalidateQueryKeys: deleteInvalidateQueryKeys_,
    renderOption: renderOption_,
    ...props
  } = args;
  const freeSolo = args.freeSolo ?? false;
  const multiple = args.multiple ?? false;
  const required = args.required ?? false;
  const value = React.useMemo(
    () => (multiple ? (args.value ?? []) : (args.value ?? null)),
    [args.value, multiple]
  );
  const postInvalidateQueryKeys = React.useMemo(
    () => (postInvalidateQueryKeys_ ? postInvalidateQueryKeys_ : [queryKey]),
    [postInvalidateQueryKeys_, queryKey]
  );
  const deleteInvalidateQueryKeys = React.useMemo(
    () =>
      deleteInvalidateQueryKeys_ ? deleteInvalidateQueryKeys_ : [queryKey],
    [deleteInvalidateQueryKeys_, queryKey]
  );
  const [open, setOpen] = React.useState(false);
  const async = url !== undefined && queryKey !== undefined;
  const queryUrl = React.useMemo(() => url ?? "", [url]);
  const mutationPostContext = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosPost(queryUrl ?? "", data),
        onSuccess: (data: AutocompleteClass) => {
          onCreateSuccessHandler?.(data);
          invalidateQueryKeys(...(postInvalidateQueryKeys ?? []));
        },
      }),
      [queryUrl, postInvalidateQueryKeys, onCreateSuccessHandler]
    )
  );
  const confirm = useConfirmDialog();
  const mutationDeleteContext = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (id: any) => axiosDelete(queryUrl, id),
        onSuccess: () => {
          onDeleteSuccessHandler?.();
          invalidateQueryKeys(...(deleteInvalidateQueryKeys ?? []));
        },
      }),
      [queryUrl, deleteInvalidateQueryKeys, onDeleteSuccessHandler]
    )
  );

  // Fetch the data from the backend.
  const queryContext = useQuery<AutocompleteClass[]>(
    React.useMemo(
      () => ({
        url: queryUrl,
        queryFn: async () => axiosGet(queryUrl ?? ""),
        select: (data: AutocompleteClass[]) =>
          data.map((x) => x as AutocompleteClass),
        queryKey: queryKey ?? [],
        enabled: async && open,
      }),
      [async, queryUrl, queryKey, open]
    )
  );
  const options = React.useMemo(() => queryContext.data ?? [], [queryContext]);

  /**
   * Function pushes new entry to the backend.
   */
  const onPushNewEntry = React.useCallback(
    (
      item: string,
      event: React.SyntheticEvent,
      stateValue?: AutoCompleteClass[]
    ) => {
      const body = onCreateHandler?.(item) ?? { label: item };
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
    [mutationPostContext, onChange, onCreateHandler]
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
    (params: AutocompleteRenderInputParams) => {
      const slotProps: any = {
        input: {
          ...params.InputProps,
          endAdornment: (
            <>
              {queryContext.isLoading ? (
                <CircularProgress color="inherit" size={20} />
              ) : null}
              {params.InputProps.endAdornment}
            </>
          ),
        },
        htmlInput: {
          ...params.inputProps,
        },
      };
      if (startAdornment) {
        slotProps.input.startAdornment = startAdornment(value as any);
      }
      return (
        <TextField
          {...params}
          size={size}
          label={label}
          error={error}
          required={required}
          helperText={helperText}
          placeholder={placeholder}
          variant={variant}
          sx={sxTextfield}
          slotProps={slotProps}
        />
      );
    },
    [
      value,
      label,
      error,
      required,
      helperText,
      queryContext.isLoading,
      placeholder,
      size,
      variant,
      startAdornment,
      sxTextfield,
    ]
  );

  /**
   * This function is used to render the options in the Autocomplete component.
   */
  const renderOptionLocal = React.useCallback<RenderOptionFunctionType>(
    (props, option, state) => {
      const { key, ...optionProps } = props;
      return (
        <RenderOption
          key={key}
          props={optionProps}
          state={state}
          option={option}
          isLoading={queryContext.isLoading}
          allowDelete={allowDelete}
          onDelete={(event) => {
            event.stopPropagation();
            confirm.showDialog({
              title: "Delete item ...",
              message: `Are you sure you want to delete "${option.label}"?`,
              onConfirm: () => mutationDeleteContext.mutate({ id: option.id }),
            });
          }}
        />
      );
    },
    [queryContext.isLoading, allowDelete, confirm, mutationDeleteContext]
  );

  const renderOption = React.useMemo(
    () => renderOption_ ?? renderOptionLocal,
    [renderOption_, renderOptionLocal]
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
      <ConfirmationDialog {...confirm} />
      <FormControl error={error} fullWidth={true}>
        <MuiAutocomplete
          {...props}
          options={options}
          value={value ?? []}
          open={open}
          onOpen={onOpen}
          onClose={onClose}
          renderInput={renderInput}
          size={size}
          onBlur={onBlur}
          onChange={freeSolo ? onChangeHandler : onChange}
          filterOptions={freeSolo ? filterOptions : undefined}
          getOptionLabel={React.useCallback(
            (option: string | AutoCompleteClass) => {
              if (Array.isArray(option)) return "";
              return typeof option === "string" ? option : option.label;
            },
            []
          )}
          renderOption={renderOption}
          isOptionEqualToValue={React.useCallback(
            (option: AutocompleteClass, value: AutocompleteClass) =>
              option.id === value.id,
            []
          )}
        />
      </FormControl>
    </>
  );
};

export default React.memo(Autocomplete) as (
  props: AutocompleteOptions
) => JSX.Element;
