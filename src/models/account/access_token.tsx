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
import {
  MetaInfoType,
  AutoCompleteOption,
  formatTimestampToUTC,
} from "../../utils/globals";
import {
  ChildQueryOptions,
  useQuery,
} from "../../utils/hooks/tanstack/useQuery";
import { queryKeyAccessTokens, URL_ME_ACCESS_TOKENS } from "./common";
import { axiosDelete, axiosGet } from "../../utils/axios";
import { useMutation } from "../../utils/hooks/tanstack/useMutation";
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
      description: "The name associated with the JWT.",
      editable: true,
    },
  },
  {
    dataGridInfo: {
      field: "revoked",
      headerName: "Revoked",
      type: "boolean",
      description: "Whether the JWT is revoked or not.",
    },
  },
  {
    dataGridInfo: {
      field: "expiration",
      headerName: "Expiration",
      type: "dateTime",
      description: "The date when the JWT expires.",
    },
  },
  {
    dataGridInfo: {
      field: "created_at",
      headerName: "Last Login",
      type: "dateTime",
      description: "The date when the JWT was created.",
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
  useQuery({
    queryKey: queryKeyAccessTokens,
    queryFn: React.useCallback(
      async () => axiosGet<AccessToken[]>(URL_ME_ACCESS_TOKENS),
      []
    ),
    select: React.useCallback(
      (data: AccessToken[]) => data.map(() => new AccessToken(data)),
      []
    ),
    metaInfo: META_INFO,
    scope: props.scope,
  });

/**
 * Delete's the access token with the given ID.
 */
export const useDeleteAccessTokens = () =>
  useMutation({
    mutationFn: React.useCallback(
      async (data: any) => axiosDelete(`${URL_ME_ACCESS_TOKENS}/${data}`),
      []
    ),
    onSuccess: React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeyAccessTokens });
    }, []),
  });
