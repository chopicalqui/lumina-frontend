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

import React from "react";

import {
  GridActionsCellItem,
  GridActionsCellItemProps,
  GridActionsColDef,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Account } from "../../../models/account/account";
import { ScopeEnum } from "../../globals";
import { UseQueryForDataGridResult } from "../tanstack/useQuery";

/**
 * Defines the properties for the DataGrid's default row actions.
 */
export interface UseDefaultDataGridActionsOptions<T> {
  // The account of the current user.
  me?: Account;
  // The properties of the useQuery hook.
  queryContext: UseQueryForDataGridResult<T>;
  // The id of the current DataGrid. This is used to store the DataGrid's configuration in the local storage and
  // save custom filters in the backend.
  scope?: ScopeEnum;
  // If present, the DataGrid will have an action to view the current row.
  view?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  // If present, the DataGrid will have an action to edit the current row.
  edit?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  // If present, the DataGrid will have an action to delete the current row.
  delete?: {
    title?: string;
    onClick: (params: GridRowParams<GridValidRowModel>) => void;
  };
  // Additional custom actions for the DataGrid.
  customActions?: JSX.Element[];
}

/**
 * This hook returns the default actions for a DataGrid row.
 */
export const useDefaultDataGridRowActions = <T,>(
  props: UseDefaultDataGridActionsOptions<T>
): GridActionsColDef => {
  const {
    me,
    scope,
    view,
    edit,
    delete: rawDelete,
    customActions: rawCustomActions,
  } = props;
  const result = React.useCallback(
    (
      params: GridRowParams<GridValidRowModel>
    ): React.ReactElement<GridActionsCellItemProps>[] => {
      const actions: JSX.Element[] = [];
      const hasWriteAccess = me?.hasWriteAccess(scope) ?? false;
      const hasDeleteAccess = me?.hasDeleteAccess(scope) ?? false;
      const customActions = rawCustomActions ?? [];
      const showInMenu =
        (hasWriteAccess && edit ? 1 : 0) +
          (hasDeleteAccess && rawDelete ? 1 : 0) +
          (view ? 1 : 0) +
          customActions.length >
        2;
      if (view) {
        actions.push(
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label={view?.title ?? "View"}
            onClick={() => view?.onClick(params)}
          />
        );
      }
      if (hasWriteAccess && edit) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<EditIcon />}
            label={edit?.title ?? "Edit"}
            onClick={() => edit?.onClick(params)}
          />
        );
      }
      if (hasDeleteAccess && rawDelete) {
        actions.push(
          <GridActionsCellItem
            showInMenu={showInMenu}
            icon={<DeleteIcon />}
            label={rawDelete?.title ?? "Delete"}
            onClick={() => rawDelete?.onClick(params)}
          />
        );
      }
      if (customActions) {
        customActions.forEach((x, i) => {
          actions.push(
            <GridActionsCellItem
              key={i}
              icon={x.props.icon}
              label={x.props.label}
              onClick={x.props.onClick}
            />
          );
        });
      }
      return actions;
    },
    [me, scope, edit, view, rawDelete, rawCustomActions]
  );
  return React.useMemo(
    () => ({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      hideable: false,
      resizable: false,
      getActions: result,
    }),
    [result]
  );
};
