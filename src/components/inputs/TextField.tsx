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
import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import { LuminaControlOptions } from "./common";

export type TextFieldOptions = LuminaControlOptions & TextFieldProps;

/**
 * Text area input control that can be created by the ControlFactory component.
 */
const TextField: React.FC<TextFieldProps> = React.memo((props) => {
  const { label, ...textFieldProps } = props;
  const sx = React.useMemo(
    () => ({ width: "100%", ...textFieldProps.sx }),
    [textFieldProps.sx]
  );

  return (
    <MuiTextField
      {...textFieldProps}
      sx={sx}
      label={label}
      hiddenLabel={!label}
    />
  );
});

export default TextField;
