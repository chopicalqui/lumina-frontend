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
  useMutation as useTanstackMutation,
  UseMutationOptions as useTanstackMutationOptions,
  UseMutationResult as UseTanstackMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { StatusMessage } from "../../../models/common";

export type UseMutationOptions<
  TData = unknown,
  TError = AxiosError<StatusMessage, any>,
  TVariables = any,
  TContext = unknown,
> = useTanstackMutationOptions<TData, TError, TVariables, TContext>;

export interface IUseMutationResult {
  statusMessage: StatusMessage | undefined;
}
export type UseMutationResult<
  TData = unknown,
  TError = AxiosError<StatusMessage, any>,
  TVariables = any,
  TContext = unknown,
> = IUseMutationResult &
  UseTanstackMutationResult<TData, TError, TVariables, TContext>;

/**
 * Handles the given error and returns a new error object. It ensures that also network errors are handled.
 */
export const getStatusMessage = (
  isError: boolean,
  isSuccess: boolean,
  data: any,
  error: AxiosError<StatusMessage>,
  isMutation: boolean = false
): StatusMessage | undefined => {
  let result: StatusMessage | undefined = undefined;
  if (isError) {
    if (error.code === "ERR_NETWORK") {
      result = new StatusMessage({
        severity: "error",
        message: "No network connection available.",
      });
    } else if (
      typeof data === "object" &&
      "type" in (data ?? {}) &&
      data?.type === "statusMessage"
    ) {
      result = new StatusMessage({
        severity: data?.severity,
        message: data?.message,
      });
    }
  } else if (isMutation && isSuccess) {
    if (
      typeof data === "object" &&
      "type" in (data ?? {}) &&
      data?.type === "statusMessage"
    ) {
      result = data as StatusMessage;
    } else {
      result = new StatusMessage({
        severity: "success",
        message: "The operation was successful.",
      });
    }
  }
  return result;
};

/**
 * Wrapper around the useMutation hook from Tanstack. It ensures that network errors are handled correctly.
 */
export const useMutation = <
  TData = unknown,
  TError = AxiosError<StatusMessage, any>,
  TVariables = any,
  TContext = undefined,
>(
  props: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const { ...options } = props;
  let statusMessage: StatusMessage | undefined = undefined;

  const mutation = useTanstackMutation<TData, TError, TVariables, TContext>({
    ...options,
    networkMode: "offlineFirst",
  });

  const { ...mutationProps } = mutation;

  statusMessage = getStatusMessage(
    mutation.isError,
    mutation.isSuccess,
    mutationProps.data,
    mutationProps.error as AxiosError<StatusMessage, any>,
    true
  );

  return React.useMemo(() => {
    return {
      ...mutation,
      statusMessage,
    };
  }, [mutation, statusMessage]);
};
