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

import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import { type Navigation } from "@toolpad/core/AppProvider";

export const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main Items",
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Administration",
  },
  {
    segment: "user",
    title: "User",
    icon: <DashboardIcon />,
  },
  {
    segment: "access-token",
    title: "Access Token",
    icon: <TimelineIcon />,
  },
];
