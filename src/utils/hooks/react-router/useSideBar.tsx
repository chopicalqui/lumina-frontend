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

import { Divider, ListSubheader, Tooltip } from "@mui/material";
import { Account } from "../../../models/account/account";
import MenuItem from "../../../layout/components/MenuItem";
import { NAVIGATION } from "../../../layout/NavigationItems";
import React from "react";

const getMenuItem = (
  title: string,
  path: string,
  icon: React.ReactElement<any, any>,
  key: any
) => (
  <MenuItem
    key={key}
    to={title}
    primary={path}
    icon={
      <Tooltip title={title} placement="right">
        {icon}
      </Tooltip>
    }
  />
);

export const useSideBar = (me?: Account, collapsed?: boolean) => {
  return React.useMemo(
    () =>
      NAVIGATION.map((item, index) => {
        const elements: JSX.Element[] = [];
        const children = item.children ?? [];
        // Add a Divider if the next item also has children
        if (!collapsed && children.length > 0) {
          elements.push(
            <ListSubheader component="div" key={`sub-menu-${index}`} inset>
              {item.title}
            </ListSubheader>
          );
        }

        children.forEach((child) => {
          if (me?.hasReadAccess(child.scope)) {
            elements.push(
              getMenuItem(
                child.title,
                child.routerPath,
                child.icon,
                `item-${child.routerPath}`
              )
            );
          }
        });

        if (index !== 0 && index + 1 < NAVIGATION.length) {
          const nextItem = NAVIGATION[index + 1];
          if ((nextItem?.children?.length ?? 0) > 0) {
            elements.push(<Divider key={`divider-${index}`} />);
          }
        }

        return elements;
      }),
    [me, collapsed]
  );
};
