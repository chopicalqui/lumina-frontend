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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Alert as MuiAlert, AlertProps, AlertColor } from "@mui/material";
import { UseMutationResult } from "../../utils/hooks/tanstack/useMutation";
import { UseQueryForDataGridResult } from "../../utils/hooks/tanstack/useQuery";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

/**
 * This component can be used in combination with custom hook useTanstackQuery to fetch data from the backend and
 * provide feedback about the fetching process back to the user.
 */
export const UseQueryAlert = React.memo(
  <T,>({ context }: { context: UseQueryForDataGridResult<T> }) => {
    const { statusMessage } = context;
    if (!statusMessage) {
      return null;
    }
    return (
      <TanstackAlert
        open={statusMessage !== undefined}
        severity={statusMessage?.severity}
        message={statusMessage?.message ?? ""}
      />
    );
  }
);

/*
 * This component can be used in combination with custom hook useTanstackMutation to submit data to the backend and
 * provide feedback about the submission back to the user.
 */
export const UseMutationAlert = React.memo(
  <TData, TError, TVariables, TContext>({
    context,
  }: {
    context: UseMutationResult<TData, TError, TVariables, TContext>;
  }) => {
    const { statusMessage, mutation } = context;

    const onReset = React.useCallback(() => {
      mutation.reset();
    }, [mutation]);

    return (
      <TanstackAlert
        open={statusMessage !== undefined}
        severity={statusMessage?.severity}
        message={statusMessage?.message ?? ""}
        resetFn={onReset}
      />
    );
  }
);

const TanstackAlert: React.FC<{
  open?: boolean;
  severity?: AlertColor;
  message?: string;
  // Usually this the useMutation's reset function. It is called when the Snackbar is closed and it is used to reset the mutation's state (isError will be reset).
  resetFn?: () => void;
}> = React.memo((props) => {
  const [open, setOpen] = React.useState(props.open ?? false);

  useEffect(() => {
    if (props.severity) {
      setOpen(true);
    }
  }, [props.severity]);

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    if (open) props.resetFn?.();
    setOpen(false);
  };

  // Without this code, the Snackbar with an empty success alert component will be displayed for a split second.
  if (!props.severity) {
    return;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={props.severity}
        sx={{ width: "100%" }}
      >
        {props.message}
      </Alert>
    </Snackbar>
  );
});
