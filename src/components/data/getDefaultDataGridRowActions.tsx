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
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridActionsColDef,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Account } from "../../models/account/account";
import { ScopeEnum } from "../../utils/globals";

export interface GetDefaultDataGridActionsProps {
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
  // The account of the current user.
  me?: Account;
  add?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  view?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  edit?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  delete?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  customActions?: JSX.Element[];
}

export const getDefaultDataGridRowActions = ({
  me,
  scope,
  ...props
}: GetDefaultDataGridActionsProps): GridActionsColDef => {
  const result = (
    params: GridRowParams<GridValidRowModel>
  ): React.ReactElement<GridActionsCellItemProps>[] => {
    const actions: JSX.Element[] = [];
    const hasWriteAccess = me?.hasWriteAccess(scope) ?? false;
    const hasDeleteAccess = me?.hasDeleteAccess(scope) ?? false;
    const customActions = props.customActions ?? [];
    const showInMenu =
      (hasWriteAccess ? 1 : 0) +
        (hasDeleteAccess ? 1 : 0) +
        customActions.length >
      1;
    if (hasWriteAccess && props.edit) {
      actions.push(
        <GridActionsCellItem
          showInMenu={showInMenu}
          icon={<EditIcon />}
          label={props.edit?.title ?? "Edit"}
          onClick={() => props.edit?.onClick(params)}
        />
      );
    }
    if (hasDeleteAccess && props.delete) {
      actions.push(
        <GridActionsCellItem
          showInMenu={showInMenu}
          icon={<DeleteIcon />}
          label={props.delete?.title ?? "Delete"}
          onClick={() => props.delete?.onClick(params)}
        />
      );
    }
    if (props.view) {
      actions.push(
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label={props.view?.title ?? "View"}
          onClick={() => props.view?.onClick(params)}
        />
      );
    }
    if (props.add) {
      actions.push(
        <GridActionsCellItem
          icon={<AddIcon />}
          label={props.add?.title ?? "Add"}
          onClick={() => props.add?.onClick(params)}
        />
      );
    }
    return actions;
  };
  return {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 100,
    cellClassName: "actions",
    getActions: result,
  };
};
