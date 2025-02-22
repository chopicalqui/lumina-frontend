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
import { GridFilterModel } from "@mui/x-data-grid";
import { AutocompleteClass } from "../../utils/globals";
import { GridInitialState } from "../../utils/hooks/mui/datagrid/useDataGridScopeInfo";
import { useQuery } from "../../utils/hooks/tanstack/useQuery";
import { axiosGet } from "../../utils/axios";
import { URL_FILTER_SELECTED_SUFFIX } from "./common";
import { QueryKey } from "@tanstack/react-query";

/**
 *
 */
export class DataGridFilterLookup extends AutocompleteClass {
  public readonly filter: GridFilterModel;
  constructor(data: any) {
    super(data);
    this.filter = data.filter;
  }
}

/**
 *
 */
export class DataGridRead {
  public readonly settings: GridInitialState;
  public readonly selectedFilter?: DataGridFilterLookup;

  constructor(data: any) {
    this.settings = data.settings;
    this.selectedFilter = data.selected_filter as DataGridFilterLookup;
  }
}

/**
 * Returns the user's selected filter for the given DataGrid.
 */
export const useQuerySelectedFilter = (
  filterUrl: string,
  filterQueryKey: QueryKey
) => {
  const url = React.useMemo(
    () => filterUrl + URL_FILTER_SELECTED_SUFFIX,
    [filterUrl]
  );
  const queryKey = React.useMemo(
    () => [...filterQueryKey, "selected"],
    [filterQueryKey]
  );
  const result = useQuery({
    url,
    queryKey,
    queryFn: async () => axiosGet<DataGridFilterLookup>(url),
  });
  return React.useMemo(
    () => ({ ...result, queryKey, url, data: result.data ?? null }),
    [queryKey, result, url]
  );
};
