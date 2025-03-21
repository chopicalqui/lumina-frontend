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
import useWebSocket from "react-use-websocket";
import AlertSnackbar from "./AlertSnackbar";
import { QueryKey } from "@tanstack/react-query";
import { CSRF_TOKEN_HEADER, invalidateQueryKeys } from "../../utils/consts";
import { WebSocketMessage } from "../../models/common";
import { getCookieValue } from "../../utils/globals";

interface WebSocketAlertProps {
  isAuthenticated: boolean;
}

export const WebSocketAlert = (props: WebSocketAlertProps) => {
  const [alertState, setAlertState] = React.useState<WebSocketMessage>();
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  const wsUrl = `${protocol}//${window.location.host}/api/ws`;

  const onMessage = React.useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const message = new WebSocketMessage(data);
    // console.log("WebSocketAlert", message, data);
    setAlertState(message);
  }, []);

  // Establish a WebSocket connection to the backend
  const { sendJsonMessage } = useWebSocket(
    wsUrl,
    {
      share: true,
      onMessage: onMessage,
      shouldReconnect: React.useCallback(() => true, []),
      // Send the token to the backend to authenticate the user
      onOpen: () => sendJsonMessage({ type: "login", token: token }),
      /*onClose: () =>
        setAlertState(
          new WebSocketMessage({
            severity: "error",
            message:
              "WebSocket connection was lost. You won't receive realtime information anymore.",
            status: 500,
          })
        ),*/
    },
    props.isAuthenticated
  );

  // Invalidate queries when the alertState contains the respective
  if (alertState?.payload && "invalidateQueries" in alertState.payload) {
    alertState.payload.invalidateQueries.forEach((queryKey: QueryKey) => {
      invalidateQueryKeys(queryKey);
    });
  }

  if (alertState?.message) {
    console.log(alertState.message);
  }

  return (
    <>
      <AlertSnackbar
        context={alertState}
        onClose={() => setAlertState(undefined)}
      />
    </>
  );
};
