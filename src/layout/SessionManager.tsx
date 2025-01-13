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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Account } from "../models/account/account";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { renewSession, logoutSession } from "../utils/axios";
import {
  SESSION_TIMEOUT as SESSION_TIMEOUT_SECONDS,
  SESSION_TIMEOUT_BUFFER as SESSION_TIMEOUT_BUFFER_SECONDS,
  SESSION_TIMEOUT_WARNING as SESSION_TIMEOUT_WARNING_SECONDS,
} from "../utils/consts";

const SESSION_TIMEOUT = SESSION_TIMEOUT_SECONDS * 1000;
const SESSION_TIMEOUT_BUFFER = SESSION_TIMEOUT_BUFFER_SECONDS * 1000;
const SESSION_TIMEOUT_WARNING = SESSION_TIMEOUT_WARNING_SECONDS * 1000;
const VIRTUAL_SESSION_DURATION =
  SESSION_TIMEOUT - SESSION_TIMEOUT_WARNING - SESSION_TIMEOUT_BUFFER;

/**
 * Formats the time in seconds to a human-readable format.
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * A circular progress bar that shows the remaining time of the session.
 */
const CountdownProgress = React.memo(
  ({ timeRemaining }: { timeRemaining: number }) => {
    const value = Math.floor(
      (timeRemaining / SESSION_TIMEOUT_WARNING_SECONDS) * 100
    );
    return (
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
        }}
      >
        <CircularProgress variant="determinate" color="error" value={value} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{ color: "text.secondary" }}
          >
            {formatTime(timeRemaining)}
          </Typography>
        </Box>
      </Box>
    );
  }
);

/**
 * Component that keeps track of the user's session.
 *
 * The session token (JWT) automatically expires after a certain amount of time. Due the asynchronous nature of the
 * frontend, we introduce a virtual session expiration time that is relative to the last user activity. If there is
 * user activity then the session is automatically renewed.
 *
 * If there is no user activity, a session expiration warning is shown. If the user does not renew the session, then
 * the user is automatically logged out.
 */
export const SessionManager = React.memo(
  ({ account }: { account?: Account }) => {
    // State that is updated which each user activity (mouse movement, key press).
    const [lastActivity, setLastActivity] = React.useState(Date.now());
    // State that defines when the component should terminate the session. It is also used to display the session
    // expiration warning.
    const [terminateAt, setTerminateAt] = React.useState<number>();
    // Used to display the session expiration warning. It contains the time when the session will terminate.
    const [timeRemaining, setTimeRemaining] = React.useState(
      SESSION_TIMEOUT_WARNING_SECONDS
    );
    // We automatically renew the session if there was some activity.
    const timeBetweenLastActivityAndExpiration = React.useMemo(
      () =>
        (account?.expiration
          ? account?.expiration.getTime() - lastActivity
          : SESSION_TIMEOUT) - SESSION_TIMEOUT_BUFFER,
      [account, lastActivity]
    );
    const isAuthenticated =
      account !== undefined &&
      new Date().getTime() < account.expiration.getTime();

    /**
     * We register event listeners for mouse movement and key presses to update the last activity timestamp.
     * This way we can track the user's activity and invalidate the session after a certain amount of inactivity.
     */
    React.useEffect(() => {
      if (!isAuthenticated) return;
      const updateActivity = () => setLastActivity(Date.now());

      window.addEventListener("mousemove", updateActivity);
      window.addEventListener("keydown", updateActivity);

      return () => {
        window.removeEventListener("mousemove", updateActivity);
        window.removeEventListener("keydown", updateActivity);
      };
    }, [isAuthenticated]);

    /*
     * With each user activity, we reset the timer that displays the session expiration warning.
     *
     * If the timer is not reset, the session expiration warning dialog will be shown after.
     */
    React.useEffect(() => {
      // If the user is not logged in, then we do not need to show the session expiration warning.
      if (!isAuthenticated || terminateAt !== undefined) return;
      const timer = setTimeout(
        () => setTerminateAt(new Date().getTime() + SESSION_TIMEOUT_WARNING),
        VIRTUAL_SESSION_DURATION
      );
      return () => clearTimeout(timer);
    }, [lastActivity, isAuthenticated, terminateAt]);

    /**
     * If a user is active at time t, then we need to ensure that the session remains active until t + SESSION_TIMEOUT.
     *
     * Hence, this hook initializes a timer that will automatically renew the current session before it expires.
     */
    React.useEffect(() => {
      const timer = setTimeout(() => {
        renewSession();
      }, timeBetweenLastActivityAndExpiration);
      return () => clearTimeout(timer);
    }, [timeBetweenLastActivityAndExpiration]);

    /**
     * Once we have an termination date, we update the time remaining every second and once, the time remaining is 0,
     * we automatically log out the user.
     */
    React.useEffect(() => {
      if (!terminateAt) return;

      const interval = setInterval(() => {
        const timeRemaining = Math.floor(
          (terminateAt - new Date().getTime()) / 1000
        );

        if (timeRemaining >= 0) {
          setTimeRemaining(timeRemaining);
        } else {
          logoutSession();
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [terminateAt]);

    /**
     * Handles the manual renewal of the session.
     */
    const handleRenew = React.useCallback(async () => {
      setTerminateAt(undefined);
      renewSession();
    }, []);

    /**
     * Handles the manual logout of the session.
     */
    const handleLogout = React.useCallback(() => {
      setTerminateAt(undefined);
      logoutSession();
    }, []);

    return (
      <Dialog
        open={isAuthenticated && terminateAt !== undefined}
        maxWidth="xs"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon color="warning" />
            <Typography variant="h6" component="span">
              Session Expiration Warning
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Your session will expire in:
          </DialogContentText>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            marginY={2} // Adds vertical margin for spacing
          >
            <CountdownProgress timeRemaining={timeRemaining} />
          </Box>
          <DialogContentText id="alert-dialog-description">
            To continue your session, click the <strong>Renew Session</strong>{" "}
            button below. If you do nothing, you will be logged out
            automatically.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            aria-label="Renew your session"
            variant="contained"
            color="primary"
            onClick={handleRenew}
          >
            Renew Session
          </Button>
          <Button
            aria-label="Logout and end your session"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
