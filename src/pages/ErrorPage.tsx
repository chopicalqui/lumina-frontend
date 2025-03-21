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
  useRouteError,
  Navigate,
  isRouteErrorResponse,
} from "react-router-dom";
import AlertSnackbar from "../components/feedback/AlertSnackbar";
import { StatusMessage } from "../models/common";

const ErrorPage = React.memo(() => {
  const error = useRouteError();
  let context: StatusMessage | undefined = undefined;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    context = new StatusMessage({
      status: error.status,
      severity: error.data?.type || "error",
      message: error.data?.message || error.statusText,
    });
  } else if (error instanceof Error) {
    context = new StatusMessage({
      status: 500,
      severity: "error",
      message: error.message,
    });
  } else if (typeof error === "string") {
    context = new StatusMessage({
      status: 500,
      severity: "error",
      message: error,
    });
  } else {
    console.error(error);
    context = new StatusMessage({
      status: 500,
      severity: "error",
      message: "Unknown error",
    });
  }

  // If user is not authenticated, then we redirect to the login page.
  if (context.status === 401) {
    return <Navigate to="/login" replace={true} />;
  }
  return <AlertSnackbar context={context} />;
});

export default ErrorPage;
