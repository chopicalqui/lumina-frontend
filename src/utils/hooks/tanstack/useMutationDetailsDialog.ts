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
import { MutationFunction, QueryKey } from "@tanstack/react-query";
import { DetailsDialogMode } from "../../globals";
import { useMutation } from "./useMutation";
import { axiosPatch, axiosPost, axiosPut } from "../../axios";
import { queryClient } from "../../consts";
import { DetailsDialogOptions, DialogState } from "../mui/useDetailsDialog";

/**
 * The properties for the useMutationDetailsDialog hook.
 */
export interface UseMutationDetailsDialog {
  // The mode of the dialog.
  dialogContext: DetailsDialogOptions;
  // The URL to send the data to.
  url: string;
  // The query key of the given URL.
  queryKey: QueryKey;
  // The keys to invalidate.
  invalidateQueryKeys?: QueryKey[];
  // The success handler.
  onSuccess?: (data: any, mode?: DetailsDialogMode) => void;
}

/**
 * This hook is used to obtain a mutation handler for the details dialog.
 */
export const useMutationDetailsDialog = <TData, TVariables>(
  props: UseMutationDetailsDialog
) => {
  /**
   * State that allows managing the dialog context within the component.
   */
  const [state, setDialogState] = React.useState<DialogState>(
    React.useMemo(
      () => ({
        rowId: props.dialogContext.rowId,
        mode: props.dialogContext.mode ?? DetailsDialogMode.View,
      }),
      [props.dialogContext.rowId, props.dialogContext.mode]
    )
  );

  /**
   * Obtain the mutation function based on the mode.
   */
  const mutationFn: MutationFunction<TData, TVariables> = React.useMemo(() => {
    switch (state.mode) {
      case DetailsDialogMode.Add:
        return (data: TVariables) =>
          axiosPost<TData, TVariables>(props.url, data);
      case DetailsDialogMode.Edit:
        return (data: TVariables) =>
          axiosPut<TData, TVariables>(props.url, data);
      default:
        return (data: TVariables) =>
          axiosPatch<TData, TVariables>(props.url, data);
    }
  }, [state.mode, props.url]);

  /**
   * The success handler for the mutation.
   */
  const onSuccess = React.useCallback(
    (data: any) => {
      props?.onSuccess?.(data, state.mode);
      // Invalidate the query keys.
      props?.invalidateQueryKeys
        ?.filter((queryKey: QueryKey) => queryKey !== props.queryKey)
        .forEach((queryKey: QueryKey) =>
          queryClient.invalidateQueries({ queryKey })
        );
      queryClient.invalidateQueries({ queryKey: props.queryKey });
      if (state.mode === DetailsDialogMode.Add) {
        // We switch the dialog's mode to edit after adding a new record.
        setDialogState((x: DialogState) => ({
          ...x,
          rowId: data.id, // Causes the details dialog to re-render and fetch the new data from the backend.
          mode: DetailsDialogMode.Edit,
        }));
      }
    },
    [state.mode, setDialogState, props]
  );

  /**
   * Obtain handler for updating the backend
   */
  const mutation = useMutation(
    React.useMemo(() => ({ mutationFn, onSuccess }), [mutationFn, onSuccess])
  );

  return React.useMemo(() => ({ mutation, state }), [mutation, state]);
};
