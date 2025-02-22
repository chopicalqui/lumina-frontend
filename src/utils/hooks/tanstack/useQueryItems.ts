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
import { useQuery } from "./useQuery";
import { QueryKey } from "@tanstack/react-query";
import { axiosGet } from "../../axios";
import { MetaInfoType } from "../../../components/inputs/controlFactoryUtils";
import { ClassType, ScopeEnum } from "../../globals";

/**
 * Hook to query a list of items.
 */
export const useQueryItems = <T>(
  ClassRef: ClassType<T>,
  queryKey: QueryKey,
  url: string,
  metaInfo: MetaInfoType[],
  scope?: ScopeEnum
) =>
  useQuery(
    React.useMemo(
      () => ({
        url,
        queryKey: queryKey,
        queryFn: async () => axiosGet<T[]>(url),
        select: (data: T[]) => data.map((x) => new ClassRef(x)),
        disableAutoRefresh: false,
        metaInfo: metaInfo,
        scope: scope,
      }),
      [ClassRef, queryKey, url, metaInfo, scope]
    )
  );
