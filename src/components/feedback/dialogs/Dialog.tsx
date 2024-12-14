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

import {
  AppBar,
  Dialog as MuiDialog,
  DialogActions,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
  Slide,
  DialogProps,
  Portal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * The options that can be passed to the dialog component.
 */
export interface DialogOptions extends DialogProps {
  // The title of the dialog.
  name?: string;
  // // Function to close the dialog.
  onClose: () => void;
  // List of buttons that are displayed in the dialog's footer.
  buttons?: JSX.Element[];
  // List of toolbar items that are displayed in the dialog
  toolbarItems?: JSX.Element[];
}

/**
 * This component is the default dialog that is used to display information to the user.
 */
const Dialog = React.memo((props: DialogOptions) => {
  const { name, buttons, toolbarItems, onClose, children, ...context } = props;

  return (
    <Portal container={document.getElementById("dialog")}>
      <MuiDialog {...context} TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {name}
            </Typography>
            {toolbarItems}
          </Toolbar>
        </AppBar>
        <DialogContent>{children}</DialogContent>
        <DialogActions>{buttons}</DialogActions>
      </MuiDialog>
    </Portal>
  );
});

export default Dialog;
