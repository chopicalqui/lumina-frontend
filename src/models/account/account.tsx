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
import { Link } from "@mui/material";
import {
  formatTimestampToUTC,
  getAutoCompleteOption,
  ScopeEnum,
  AccountRole,
  MetaInfoType,
  getEnumNames,
} from "../../utils/globals";
import {
  ChildQueryOptions,
  useQuery,
} from "../../utils/hooks/tanstack/useQuery";
import { NamedModelBase } from "../common";
import {
  queryKeyAccounts,
  queryKeyAccountMe,
  URL_ACCOUNTS,
  URL_ACCOUNTS_ME,
} from "./common";
import { axiosDelete, axiosGet } from "../../utils/axios";
import { useDeleteMutation } from "../../utils/hooks/tanstack/useDeleteMutation";
import { queryClient } from "../../utils/consts";

export const META_INFO: MetaInfoType[] = [
  {
    visibleDataGrid: false,
    dataGridInfo: {
      field: "id",
      headerName: "ID",
      type: "string",
      hideable: true,
    },
  },
  {
    dataGridInfo: {
      field: "name",
      headerName: "Name",
      type: "string",
      description: "The name of the account.",
      editable: true,
    },
  },
  {
    dataGridInfo: {
      field: "email",
      headerName: "Email",
      type: "string",
      description: "The user's email address.",
      renderCell: (params: any) => (
        <Link href={`mailto:${params.value}`}>{params.value}</Link>
      ),
    },
  },
  {
    dataGridInfo: {
      field: "locked",
      headerName: "Locked",
      type: "boolean",
      description: "Defines whether the user is locked.",
    },
  },
  {
    dataGridInfo: {
      field: "roles",
      headerName: "Roles",
      type: "singleSelect",
      valueOptions: getEnumNames(AccountRole),
      description: "The user's role memberships.",
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any) => value?.map((x: any) => x.label),
    },
  },
  {
    dataGridInfo: {
      field: "activeFrom",
      headerName: "Active From",
      type: "date",
      description: "The date from which onward the account can be used.",
    },
  },
  {
    dataGridInfo: {
      field: "activeUntil",
      headerName: "Expires",
      type: "date",
      description: "The date the account expires.",
    },
  },
  {
    dataGridInfo: {
      field: "lastLogin",
      headerName: "Last Login",
      type: "dateTime",
      description: "The date [UTC] the user logged in the last time.",
    },
  },
];

export class AccountLookup {
  public id: string;
  public label: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.label = userData.full_name;
  }
}

export class AccountRead extends NamedModelBase {
  email: string;
  roles: AccountRole[];
  locked: boolean;
  activeFrom?: Date;
  activeUntil?: Date;
  lastLogin?: Date;

  constructor(data: any) {
    super(data.full_name, data.id);
    this.email = data.email;
    this.roles = data.roles.map((x: AccountRole) =>
      getAutoCompleteOption(AccountRole, x)
    );
    this.locked = data.locked;
    this.activeFrom = data.active_from && new Date(data.active_from);
    this.activeUntil = data.active_until && new Date(data.active_until);
    this.lastLogin = formatTimestampToUTC(data.last_login);
  }
}

export class Account extends AccountRead {
  lightMode: boolean;
  sidebarCollapsed: boolean;
  tableDensity: string;
  image: string;

  constructor(data: any) {
    super(data);
    this.lightMode = data.light_mode;
    this.sidebarCollapsed = data.sidebar_collapsed;
    this.tableDensity = data.table_density;
    this.image = data.avatar;
  }

  hasReadAccess(component?: ScopeEnum) {
    return true;
  }
  hasCreateAccess(component?: ScopeEnum) {
    return true;
  }
  hasWriteAccess(component?: ScopeEnum) {
    return true;
  }
  hasDeleteAccess(component?: ScopeEnum) {
    return true;
  }
}

/*
 * Returns the current user.
 */
export const useQueryMe = () =>
  useQuery({
    queryKey: queryKeyAccountMe,
    disableAutoRefresh: true,
    retry: 0,
    queryFn: React.useCallback(
      async () => axiosGet<Account>(URL_ACCOUNTS_ME),
      []
    ),
    select: React.useCallback((data: Account) => new Account(data), []),
  });

/**
 * Returns all accounts.
 */
export const useQueryAccounts = (props: ChildQueryOptions) =>
  useQuery({
    queryKey: queryKeyAccounts,
    queryFn: React.useCallback(
      async () => axiosGet<Account[]>(URL_ACCOUNTS),
      []
    ),
    select: React.useCallback(
      (data: Account[]) => data.map((x) => new Account(x)),
      []
    ),
    metaInfo: META_INFO,
    scope: props.scope,
  });

/**
 * Returns all accounts.
 */
export const useDeleteAccount = () =>
  useDeleteMutation({
    mutationFn: React.useCallback(
      async (data: any) => axiosDelete(`${URL_ACCOUNTS}/${data}`),
      []
    ),
    onSuccess: React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeyAccounts });
    }, []),
  });
