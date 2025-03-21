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
import Typography from "@mui/material/Typography";
import { TypographyProps } from "@mui/material/Typography";
import { COPYRIGHT_LONG, COPYRIGHT_SHORT } from "../../utils/consts";

/**
 * Options for the `Copyright` component.
 */
interface CopyrightOptions extends TypographyProps {
  open: boolean;
}

/**
 * A component that displays the copyright.
 */
const Copyright = (props: CopyrightOptions) => {
  const content = React.useMemo(() => {
    if (props.open) {
      return COPYRIGHT_LONG;
    } else {
      return COPYRIGHT_SHORT;
    }
  }, [props.open]);

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      sx={{ mb: 1 }}
      {...props}
    >
      {content}
    </Typography>
  );
};

export default Copyright;
