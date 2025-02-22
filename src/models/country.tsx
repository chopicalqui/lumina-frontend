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

import { GridRenderCellParams } from "@mui/x-data-grid";
import { MetaInfoType } from "../components/inputs/controlFactoryUtils";
import { AutocompleteClass } from "../utils/globals";
import { ChildQueryOptions } from "../utils/hooks/tanstack/useQuery";
import { useQueryItems } from "../utils/hooks/tanstack/useQueryItems";
import { ModelBase } from "./common";
import { API_PATH_PREFIX } from "../utils/consts";
import { useQueryItemById } from "../utils/hooks/tanstack/useQueryItemById";

export const queryKeyCountries = ["countries"];
export const queryKeyCountriesLookup = ["countries", "lookup"];
export const URL_COUNTRIES = "/v1/countries";
export const URL_COUNTRIES_LOOKUP = URL_COUNTRIES + "/lookup";
export const URL_COUNTRY_FLAGS = API_PATH_PREFIX + "/v1/countries/svg";

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
      valueGetter: (value: CountryLookup) => value.label,
    },
    mui: {
      countryselect: {
        field: "name",
        label: "Name",
        disabled: false,
        noSubmit: true,
        helperText: "The country's flag.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "flagPath",
      headerName: "Flag",
      type: "string",
      description: "The name of the account.",
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<CountryRead>) => (
        <img
          loading="lazy"
          width="30"
          key={"img_" + params.value}
          srcSet={`${params.value} 2x`}
          src={`${params.value}`}
          alt={params.row.name.label}
        />
      ),
    },
  },
  {
    dataGridInfo: {
      field: "code",
      headerName: "Code",
      type: "string",
      description: "The country's code.",
      align: "center",
      headerAlign: "center",
    },
    mui: {
      textfield: {
        field: "code",
        label: "Code",
        disabled: true,
        noSubmit: true,
        helperText: "The country's code.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "phone",
      headerName: "Phone",
      type: "string",
      description: "The country's phone prefix.",
    },
    mui: {
      textfield: {
        field: "phone",
        label: "Phone",
        disabled: true,
        noSubmit: true,
        helperText: "The country's phone prefix.",
      },
    },
  },
  {
    dataGridInfo: {
      field: "default",
      headerName: "Default",
      type: "boolean",
      description: "Default countries are displayed first in lookups.",
      editable: true,
    },
    mui: {
      switch: {
        field: "default",
        label: "Default",
      },
    },
  },
  {
    dataGridInfo: {
      field: "display",
      headerName: "Display",
      type: "boolean",
      description: "Defines whether country should be displayed in lookups.",
      editable: true,
    },
    mui: {
      switch: {
        field: "display",
        label: "Display",
      },
    },
  },
];

export class CountryLookup extends AutocompleteClass {
  public readonly code: string;
  constructor(data: any) {
    super(data);
    this.code = data.code;
  }
}

export class CountryRead extends ModelBase {
  public readonly name: CountryLookup;
  public readonly code: string;
  public readonly phone: string;
  public readonly default: boolean;
  public readonly display: boolean;
  public readonly flagPath: string;

  constructor(data: any) {
    super(data.id);
    this.name = { id: data.id, label: data.name, code: data.code };
    this.code = data.code;
    this.phone = data.phone;
    this.default = data.default;
    this.display = data.display;
    this.flagPath = `${URL_COUNTRY_FLAGS}/${this.code.toLowerCase()}`;
  }
}

/**
 * Returns all countries.
 */
export const useQueryCountries = (props: ChildQueryOptions) =>
  useQueryItems(
    CountryRead,
    queryKeyCountries,
    URL_COUNTRIES,
    META_INFO,
    props.scope
  );

/*
 * Returns the account that matches the given props.rowId.
 */
export const useQueryCountryById = (props: ChildQueryOptions) =>
  useQueryItemById(
    CountryRead,
    queryKeyCountries,
    URL_COUNTRIES,
    META_INFO,
    props?.rowId,
    props.scope
  );
