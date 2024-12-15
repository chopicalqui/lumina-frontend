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
import { ModelBase } from "../common";
import { AutoCompleteOption, valueGetterDate } from "../../utils/globals";
import { ChildQueryOptions } from "../../utils/hooks/tanstack/useQuery";
import { queryKeyAccessTokens, URL_ME_ACCESS_TOKENS } from "./common";
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
  },
  {
    dataGridInfo: {
      field: "name",
      headerName: "Name",
      type: "string",
      description: "The name associated with the JWT.",
      editable: true,
    },
    mui: {
      textfield: {
        field: "name",
        label: "Access Token Name",
        required: true,
        disabled: false,
        noSubmit: false,
        helperText: "The name associated with the JWT.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "revoked",
      headerName: "Revoked",
      type: "boolean",
      description: "Whether the JWT is revoked or not.",
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
      type: "dateTime",
      description: "The date when the JWT expires.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "expiration",
        label: "Expiration",
        required: true,
        disablePast: true,
        helperText: "The date when the JWT expires.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "created_at",
      headerName: "Created At",
      type: "dateTime",
      description: "The date when the JWT was created.",
      valueGetter: valueGetterDate,
    },
    mui: {
      datapicker: {
        field: "created_at",
        label: "Created At",
        disabled: true,
        disablePast: true,
        helperText: "The date when the JWT was created.",
      },
    },
  },
];

export class AccessToken extends ModelBase {
  public name: string | null;
  public revoked: boolean;
  public expiration: dayjs.Dayjs;
  public scope: AutoCompleteOption[];
  public created_at?: dayjs.Dayjs;

  constructor(data: any) {
    super(data.id);
    this.name = data.name;
    this.revoked = data.revoked;
    this.expiration = dayjs(data.expiration);
    this.scope = data.scope;
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
