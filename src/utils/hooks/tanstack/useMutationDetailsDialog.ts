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

/**
 * The properties for the useMutationDetailsDialog hook.
 */
export interface UseMutationDetailsDialog {
  // The mode of the dialog.
  mode: DetailsDialogMode;
  // The URL to send the data to.
  url: string;
  // The keys to invalidate.
  invalidateQueryKeys?: QueryKey[];
}

/**
 * This hook is used to obtain a mutation handler for the details dialog.
 */
export const useMutationDetailsDialog = <TData, TVariables>(
  props: UseMutationDetailsDialog
) => {
  const mutationFn: MutationFunction<TData, TVariables> = React.useMemo(() => {
    switch (props.mode) {
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
  }, [props.mode, props.url]);

  const onSuccess = React.useCallback(
    () =>
      props?.invalidateQueryKeys?.forEach((queryKey: QueryKey) =>
        queryClient.invalidateQueries({ queryKey })
      ),
    [props?.invalidateQueryKeys]
  );
  // Obtain handler for updating the backend
  const mutation = useMutation(
    React.useMemo(() => ({ mutationFn, onSuccess }), [mutationFn, onSuccess])
  );

  return mutation;
};
