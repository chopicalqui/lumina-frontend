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
  verifyEmail,
} from "./common";
import { axiosDelete, axiosGet } from "../../utils/axios";
import { useDeleteMutation } from "../../utils/hooks/tanstack/useDeleteMutation";
import { queryClient } from "../../utils/consts";
import { MetaInfoType } from "../../components/inputs/controlFactoryUtils";

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
    mui: {
      textfield: {
        field: "name",
        label: "Name",
        disabled: true,
        noSubmit: true,
        helperText: "The name of the account.",
      },
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
    mui: {
      textfield: {
        field: "email",
        label: "Email",
        disabled: true,
        noSubmit: true,
        helperText: "The name of the account.",
        getError: verifyEmail,
      },
    },
  },
  {
    dataGridInfo: {
      field: "locked",
      headerName: "Locked",
      type: "boolean",
      description: "Defines whether the account is locked.",
    },
    mui: {
      switch: {
        field: "locked",
        label: "Locked",
      },
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
    mui: {
      datapicker: {
        field: "activeFrom",
        label: "Active From",
        required: true,
        disablePast: true,
        helperText: "The date from which onward the account can be used.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "activeUntil",
      headerName: "Expires",
      type: "date",
      description: "The date the account expires.",
    },
    mui: {
      datapicker: {
        field: "activeUntil",
        label: "Active Until",
        required: true,
        disablePast: true,
        helperText: "The date until which the account can be used.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "lastLogin",
      headerName: "Last Login",
      type: "dateTime",
      description: "The date [UTC] the user logged in the last time.",
    },
    mui: {
      datapicker: {
        field: "lastLogin",
        label: "Last Login",
        required: false,
        disabled: true,
        noSubmit: true,
        helperText: "The date the user logged in the last time.",
      },
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
  _roles: AccountRole[];

  constructor(data: any) {
    super(data);
    this.lightMode = data.light_mode;
    this.sidebarCollapsed = data.sidebar_collapsed;
    this.tableDensity = data.table_density;
    this.image = data.avatar;
    this._roles = data.roles;
  }

  hasReadAccess(scope?: ScopeEnum) {
    return (
      scope &&
      (this._roles.includes(AccountRole.Admin) ||
        (this._roles.includes(AccountRole.Auditor) &&
          ![ScopeEnum.PageAccessToken].includes(scope)))
    );
  }

  hasCreateAccess(scope?: ScopeEnum) {
    return (
      scope &&
      (this._roles.includes(AccountRole.Admin) ||
        (this._roles.includes(AccountRole.Api) &&
          scope === ScopeEnum.PageAccessToken))
    );
  }

  hasWriteAccess(scope?: ScopeEnum) {
    return (
      scope &&
      (this._roles.includes(AccountRole.Admin) ||
        (this._roles.includes(AccountRole.Api) &&
          scope === ScopeEnum.PageAccessToken))
    );
  }

  hasDeleteAccess(scope?: ScopeEnum) {
    return (
      scope &&
      (this._roles.includes(AccountRole.Admin) ||
        (this._roles.includes(AccountRole.Api) &&
          scope === ScopeEnum.PageAccessToken))
    );
  }
}

/*
 * Returns the current user.
 */
export const useQueryMe = () =>
  useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKeyAccountMe,
        disableAutoRefresh: true,
        retry: 0,
        queryFn: async () => axiosGet<Account>(URL_ACCOUNTS_ME),
        select: (data: Account) => new Account(data),
      }),
      []
    )
  );

/**
 * Returns all accounts.
 */
export const useQueryAccounts = (props: ChildQueryOptions) =>
  useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKeyAccounts,
        queryFn: async () => axiosGet<Account[]>(URL_ACCOUNTS),
        select: (data: Account[]) => data.map((x) => new Account(x)),
        metaInfo: META_INFO,
        scope: props.scope,
      }),
      [props]
    )
  );
/*
 * Returns the account that matches the given props.rowId.
 */
export const useQueryAccountById = (props: ChildQueryOptions) => {
  const url = React.useMemo(
    () => `${URL_ACCOUNTS}/${props.rowId}`,
    [props.rowId]
  );
  const queryKey = React.useMemo(
    () => (props.rowId ? [...queryKeyAccounts, props.rowId] : []),
    [props.rowId]
  );
  return useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKey,
        queryFn: async () => axiosGet<Account>(url),
        select: (data: Account) => new Account(data),
        enabled: !!props.rowId,
        metaInfo: META_INFO,
        scope: props.scope,
      }),
      [props.rowId, url, props.scope, queryKey]
    )
  );
};

/**
 * Returns all accounts.
 */
export const useDeleteAccount = () =>
  useDeleteMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosDelete(`${URL_ACCOUNTS}/${data}`),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: queryKeyAccounts }),
      }),
      []
    )
  );
