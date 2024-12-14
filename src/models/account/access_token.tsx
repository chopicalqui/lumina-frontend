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
import { AutoCompleteOption, formatTimestampToUTC } from "../../utils/globals";
import {
  ChildQueryOptions,
  useQuery,
} from "../../utils/hooks/tanstack/useQuery";
import { queryKeyAccessTokens, URL_ME_ACCESS_TOKENS } from "./common";
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
  public expiration: Date;
  public scope: AutoCompleteOption[];
  public created_at: Date | undefined;

  constructor(data: any) {
    super(data.id);
    this.name = data.name;
    this.revoked = data.revoked;
    this.expiration = data.expiration;
    this.scope = data.scope;
    this.created_at = formatTimestampToUTC(data.created_at);
  }
}

/*
 * Returns the current user's access tokens.
 */
export const useQueryAccessTokens = (props: ChildQueryOptions) =>
  useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKeyAccessTokens,
        queryFn: async () => axiosGet<AccessToken[]>(URL_ME_ACCESS_TOKENS),
        select: (data: AccessToken[]) => data.map(() => new AccessToken(data)),
        metaInfo: META_INFO,
        scope: props.scope,
      }),
      [props]
    )
  );

/*
 * Returns the access token that matches the given props.rowId.
 */
export const useQueryAccessTokenById = (props: ChildQueryOptions) => {
  const url = React.useMemo(
    () => `${URL_ME_ACCESS_TOKENS}/${props.rowId}`,
    [props.rowId]
  );
  const queryKey = React.useMemo(
    () => (props.rowId ? [...queryKeyAccessTokens, props.rowId] : []),
    [props.rowId]
  );
  return useQuery(
    React.useMemo(
      () => ({
        queryKey: queryKey,
        queryFn: async () => axiosGet<AccessToken>(url),
        select: (data: AccessToken) => new AccessToken(data),
        enabled: !!props.rowId,
        metaInfo: META_INFO,
        scope: props.scope,
      }),
      [props.rowId, url, props.scope, queryKey]
    )
  );
};

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
