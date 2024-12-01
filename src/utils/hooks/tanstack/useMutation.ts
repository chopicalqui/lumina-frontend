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

export type UseMutationOptions<TData, TError, TVariables, TContext> =
  useTanstackMutationOptions<TData, TError, TVariables, TContext>;

export interface UseMutationResult<TData, TError, TVariables, TContext> {
  mutation: UseTanstackMutationResult<TData, TError, TVariables, TContext>;
  statusMessage: StatusMessage | undefined;
}

/**
 * Handles the given error and returns a new error object. It ensures that also network errors are handled.
 * @param error
 * @returns
 */
export const handleError = (
  isError: boolean,
  error: AxiosError<StatusMessage>
): StatusMessage | undefined => {
  if (!isError) return;
  if (error.code === "ERR_NETWORK") {
    return new StatusMessage({
      severity: "error",
      message: "No network connection available.",
    });
  } else if (
    typeof error.response?.data === "object" &&
    "type" in (error.response?.data ?? {}) &&
    error.response?.data?.type === "statusMessage"
  ) {
    return new StatusMessage({
      severity: error.response?.data?.severity,
      message: error.response?.data?.message,
    });
  }
  return;
};

/**
 * Wrapper around the useMutation hook from Tanstack. It ensures that network errors are handled correctly.
 */
export const useMutation = <
  TData,
  TError extends AxiosError,
  TVariables,
  TContext,
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

  statusMessage = handleError(
    mutation.isError,
    mutationProps.error as AxiosError<StatusMessage>
  );

  return React.useMemo(() => {
    return {
      mutation,
      statusMessage,
    };
  }, [mutation, statusMessage]);
};
