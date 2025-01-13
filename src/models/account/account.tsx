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
import {
  getAutocompleteOption,
  ScopeEnum,
  AccountRole,
  getEnumNames,
  valueGetterDate,
  getFinalDayjs,
  renderCellAutocompleteOptionList,
  getFinalAutoCompleteValue,
  getAutocompleteOptions,
  valueGetterAutocompleteOptionList,
  AutoCompleteOption,
  renderCellEmail,
} from "../../utils/globals";
import {
  ChildQueryOptions,
  useQuery,
} from "../../utils/hooks/tanstack/useQuery";
import { NamedModelBase, verifyEmail } from "../common";
import { queryKeyAccounts, URL_ACCOUNTS, URL_ACCOUNTS_ME } from "./common";
import { axiosDelete, axiosGet, queryKeyAccountMe } from "../../utils/axios";
import { useDeleteMutation } from "../../utils/hooks/tanstack/useDeleteMutation";
import { queryClient } from "../../utils/consts";
import { MetaInfoType } from "../../components/inputs/controlFactoryUtils";
import dayjs from "dayjs";
import { useQueryItems } from "../../utils/hooks/tanstack/useQueryItems";
import { useQueryItemById } from "../../utils/hooks/tanstack/useQueryItemById";
import { GetErrorOptions } from "../../components/inputs/common";
import { GridRenderCellParams } from "@mui/x-data-grid";

/**
 * Core model class for the Account model.
 *
 * This class is used by DataGrid components to correctly display and interact with the data. In addition,
 * it can be used by the useControlFactory hook and ControlFactory component to create form fields.
 */
export const META_INFO: MetaInfoType[] = [
  {
    visibleDataGrid: false,
    dataGridInfo: {
      field: "id",
      headerName: "ID",
      type: "string",
      hideable: true,
    },
    mui: {
      textfield: {
        field: "id",
        label: "ID",
        helperText: "The unique identifier of the access token.",
      },
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
      // Render email to a clickable mailto link
      renderCell: renderCellEmail,
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
      /**
       * Scopes is an object and as a result, we need to use a custom valueGetter to obtain the label and return a string.
       * This string is used by the DataGrid to filter, sort and export the data.
       */
      valueGetter: valueGetterAutocompleteOptionList,
      /**
       * Per default, renderCell uses the output of valueGetter to render the cell. Nevertheless,
       * we can override this behavior by providing a custom renderCell function.
       */
      renderCell: (cell: GridRenderCellParams<AutoCompleteOption[]>) =>
        renderCellAutocompleteOptionList(cell),
    },
    mui: {
      autocomplete: {
        field: "roles",
        label: "Roles",
        multiple: true,
        options: getAutocompleteOptions(AccountRole),
        helperText: "The user's role memberships.",
        getFinalValue: getFinalAutoCompleteValue,
      },
    },
  },
  {
    dataGridInfo: {
      field: "lastLogin",
      headerName: "Last Login",
      type: "dateTime",
      description: "The date [UTC] the user logged in the last time.",
      valueGetter: valueGetterDate,
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
  {
    dataGridInfo: {
      field: "activeFrom",
      headerName: "Active From",
      type: "date",
      description: "The date from which onward the account can be used.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "activeFrom",
        label: "Active From",
        helperText: "The date from which onward the account can be used.",
        getFinalValue: getFinalDayjs,
        /**
         * This optional function is used to validate the input of the Active Until field.
         */
        getError: ({ value, state, label }: GetErrorOptions) => {
          const activeFrom = value as dayjs.Dayjs | undefined;
          const activeUntil = state.values.activeUntil as
            | dayjs.Dayjs
            | undefined;
          if (activeFrom && activeUntil && activeUntil.isBefore(activeFrom)) {
            return `The ${label} must be before the Active Until date.`;
          }
        },
      },
    },
  },
  {
    dataGridInfo: {
      field: "activeUntil",
      headerName: "Expires",
      type: "date",
      description: "The date the account expires.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "activeUntil",
        label: "Active Until",
        helperText: "The date until which the account can be used.",
        getFinalValue: getFinalDayjs,
        /**
         * This optional function is used to validate the input of the Active Until field.
         */
        getError: ({ value, state, label }: GetErrorOptions) => {
          const activeFrom = state.values.activeFrom as dayjs.Dayjs | undefined;
          const activeUntil = value as dayjs.Dayjs | undefined;
          if (activeFrom && activeUntil && activeUntil.isBefore(activeFrom)) {
            return `The ${label} must be after the Active From date.`;
          }
        },
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
  activeFrom?: dayjs.Dayjs;
  activeUntil?: dayjs.Dayjs;
  lastLogin?: dayjs.Dayjs;

  constructor(data: any) {
    super(data.full_name, data.id);
    this.email = data.email;
    this.roles = data.roles.map((x: AccountRole) =>
      getAutocompleteOption(AccountRole, x)
    );
    this.locked = data.locked;
    this.activeFrom = data.active_from && dayjs(data.active_from);
    this.lastLogin = data.active_from && dayjs(data.last_login);
    this.activeUntil = data.active_until && dayjs(data.active_until);
  }
}

export class Account extends AccountRead {
  public readonly lightMode: boolean;
  public readonly sidebarCollapsed: boolean;
  public readonly tableDensity: string;
  public readonly image: string;
  public readonly expiration: Date;
  private readonly _roles: AccountRole[];

  constructor(data: any) {
    super(data);
    this.lightMode = data.light_mode;
    this.sidebarCollapsed = data.sidebar_collapsed;
    this.tableDensity = data.table_density;
    this.image = data.avatar;
    this.expiration = new Date(data.expiration);
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
  useQueryItems(
    Account,
    queryKeyAccounts,
    URL_ACCOUNTS,
    META_INFO,
    props.scope
  );

/*
 * Returns the account that matches the given props.rowId.
 */
export const useQueryAccountById = (props: ChildQueryOptions) =>
  useQueryItemById(
    Account,
    queryKeyAccounts,
    URL_ACCOUNTS,
    META_INFO,
    props?.rowId,
    props.scope
  );

/**
 * Returns all accounts.
 */
export const useDeleteAccount = () =>
  useDeleteMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) => axiosDelete(`${URL_ACCOUNTS}/${data}`),
        onSuccess: async () =>
          await queryClient.invalidateQueries({ queryKey: queryKeyAccounts }),
      }),
      []
    )
  );
