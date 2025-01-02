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
import { NamedModelBase } from "../common";
import {
  AutoCompleteOption,
  getFinalAutoCompleteValue,
  getFinalDayjs,
  renderCellAutocompleteOptionList,
  valueGetterDate,
} from "../../utils/globals";
import { ChildQueryOptions } from "../../utils/hooks/tanstack/useQuery";
import {
  queryKeyAccessTokens,
  queryKeyScopes,
  URL_ME_ACCESS_TOKENS,
  URL_ME_SCOPES,
} from "./common";
import { axiosDelete } from "../../utils/axios";
import { useDeleteMutation } from "../../utils/hooks/tanstack/useDeleteMutation";
import { queryClient } from "../../utils/consts";
import { MetaInfoType } from "../../components/inputs/controlFactoryUtils";
import dayjs from "dayjs";
import { useQueryItems } from "../../utils/hooks/tanstack/useQueryItems";
import { useQueryItemById } from "../../utils/hooks/tanstack/useQueryItemById";

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
      description: "The name associated with the access token.",
      editable: true,
    },
    mui: {
      textfield: {
        field: "name",
        label: "Access Token Name",
        required: true,
        disabled: false,
        noSubmit: false,
        helperText: "The name associated with the access token.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "scopes",
      headerName: "Scopes",
      type: "string",
      description: "The scopes associated with the access token.",
      editable: false,
      renderCell: renderCellAutocompleteOptionList,
    },
    mui: {
      autocomplete: {
        field: "scopes",
        label: "Scopes",
        required: true,
        freeSolo: true,
        multiple: true,
        queryUrl: URL_ME_SCOPES,
        queryKey: queryKeyScopes,
        helperText: "The scopes associated with the access token.",
        getFinalValue: getFinalAutoCompleteValue,
      },
    },
  },
  {
    dataGridInfo: {
      field: "revoked",
      headerName: "Revoked",
      type: "boolean",
      description: "Whether the access token is revoked or not.",
    },
    mui: {
      switch: {
        field: "revoked",
        label: "Revoked",
      },
    },
  },
  {
    dataGridInfo: {
      field: "expiration",
      headerName: "Expiration",
      type: "date",
      description: "The date when the access token expires.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "expiration",
        label: "Expiration",
        required: true,
        disablePast: true,
        helperText: "The date when the access token expires.",
        getFinalValue: getFinalDayjs,
      },
    },
  },
  {
    dataGridInfo: {
      field: "created_at",
      headerName: "Created At",
      type: "dateTime",
      description: "The date when the access token was created.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "created_at",
        label: "Created At",
        disabled: true,
        disablePast: true,
        noSubmit: true,
        helperText: "The date when the access token was created.",
      },
    },
  },
  {
    mui: {
      textfield: {
        field: "value",
        label: "Access Token",
        disabled: true,
        noSubmit: true,
        helperText:
          "The actual access token value. Copy this value now as it will not be shown again.",
      },
    },
  },
];

export class AccessToken extends NamedModelBase {
  public value?: string;
  public revoked: boolean;
  public expiration?: dayjs.Dayjs;
  public scopes: AutoCompleteOption[];
  public created_at?: dayjs.Dayjs;

  constructor(data: any) {
    super(data.name, data.id);
    this.value = data.value;
    this.scopes = data.scopes;
    this.revoked = data.revoked ?? false;
    this.expiration = data.expiration && dayjs(data.expiration);
    this.created_at = dayjs(data.created_at);
  }
}

/*
 * Returns the current user's access tokens.
 */
export const useQueryAccessTokens = (props: ChildQueryOptions) =>
  useQueryItems(
    AccessToken,
    queryKeyAccessTokens,
    URL_ME_ACCESS_TOKENS,
    META_INFO,
    props.scope
  );

/*
 * Returns the access token that matches the given props.rowId.
 */
export const useQueryAccessTokenById = (props: ChildQueryOptions) =>
  useQueryItemById(
    AccessToken,
    queryKeyAccessTokens,
    URL_ME_ACCESS_TOKENS,
    META_INFO,
    props?.rowId,
    props.scope
  );

/**
 * Delete's the access token with the given ID.
 */
export const useDeleteAccessTokens = () =>
  useDeleteMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosDelete(`${URL_ME_ACCESS_TOKENS}/${data}`),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: queryKeyAccessTokens }),
      }),
      []
    )
  );
