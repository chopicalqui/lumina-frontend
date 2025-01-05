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

import { Chip, Link, Stack } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";

// Define a model class type with a constructor
export type ClassType<T> = new (...args: any[]) => T;

/**
 * This type is used to define the auto-complete options in the application.
 */
export type AutoCompleteOption = {
  id: string | number;
  label: string;
};

/**
 * This class is used to define the auto-complete options in the application.
 */
export class AutoCompleteClass implements AutoCompleteOption {
  id: string | number;
  label: string;

  constructor(data: AutoCompleteOption) {
    this.id = data.id;
    this.label = data.label;
  }
}

/**
 * This enum is used to define the account roles in the application.
 */
export enum AccountRole {
  // Read-only access role
  Auditor = 100,
  // Full administrative access role
  Admin = 200,
  // Permission to create access tokens
  Api = 300,
}

/*
 * This enum is used to define the modes of the details dialog in the application.
 */
export enum DetailsDialogMode {
  View,
  Edit,
  Add,
}

/**
 * Defines the IDs of the MUI DataGrids in the application.
 *
 * It is used for checking whether the user has access to this component.
 */
export enum ScopeEnum {
  PageAccount = "e4f9c2cd-3500-4a5c-be7a-673a24e9f873",
  PageAccessToken = "5c4da514-4545-4628-8b10-1bcebf6289a1",
  DataGridAccount = "a822f003-e4d4-49a0-afac-25e4cd85f55d",
  DataGridAccessToken = "f1bbfa7f-44cc-4ba7-a296-05a16a5d0eec",
}

type EnumTypes = typeof AccountRole;

/*
 * This function returns the names of the enum values.
 */
export const getEnumNames = (enumClass: EnumTypes) => {
  const result = Object.keys(enumClass)
    .filter((item) => isNaN(+item))
    .map((item) => item.replace(/_/g, " "));
  return result;
};

/**
 * The REST API returns the user role as a number. This function converts the number to an AutoCompleteOption.
 */
export const getAutocompleteOption = (
  enumClass: EnumTypes,
  type?: any
): AutoCompleteOption => {
  return typeof type === "number"
    ? { id: type, label: enumClass[type]?.replace(/_/g, " ") ?? "" }
    : type;
};

/**
 * This function is used to get the value of an auto-complete field.
 */
export const valueGetterAutocompleteOption = (
  value: AutoCompleteOption
): string => value.label;

/**
 * This function is used to get the value of an auto-complete list.
 */
export const valueGetterAutocompleteOptionList = (
  value: AutoCompleteOption[]
): string => value.map((x) => x.label).join("; ");

/**
 * This function is used to render the value of a Autocomplete DataGrid cell.
 */
export const renderCellAutocompleteOptionList = (
  cell: GridRenderCellParams<any>,
  rowName: keyof typeof cell.row
) => {
  // Obtain raw data from the cell
  if (rowName in cell.row) {
    const result = cell.row[rowName] as AutoCompleteOption[];
    return (
      <Stack direction="row" spacing={1}>
        {result.map((x: AutoCompleteOption) => (
          <Chip key={x.id} label={x.label} variant="outlined" color="primary" />
        ))}
      </Stack>
    );
  }
};

/**
 * This function is used to get the value of a date field.
 */
export const valueGetterDate = (value?: dayjs.Dayjs): Date | undefined =>
  value?.toDate();

/**
 * This function renders an email DataGrid column cell as a clickable link.
 */
export const renderCellEmail = (cell: GridRenderCellParams<any>) => (
  <Link href={`mailto:${cell.value}`}>{cell.value}</Link>
);

/**
 * Returns the value of a cookie by its name.
 */
export const getCookieValue = (cookieName: string): string | null => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name.toLowerCase() === cookieName.toLocaleLowerCase()) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * This function is used to get the final dayjs value.
 */
export const getFinalDayjs = (value?: dayjs.Dayjs) =>
  value?.format("YYYY-MM-DD");

/**
 * This function is used to get the final value of the final Autocomplete value.
 */
export const getFinalAutoCompleteValue = (value: AutoCompleteOption) =>
  Array.isArray(value) ? value.map((x) => x.id) : value.id;

/*
 * This function returns the enum values as an object.
 */
export const getAutocompleteOptions = (
  enumClass: EnumTypes
): AutoCompleteOption[] => {
  const result = Object.keys(enumClass)
    .filter((item) => !isNaN(+item))
    .map((item) => {
      const key = Number(item);
      return {
        label: enumClass[key].replace(/_/g, " "),
        id: key,
      };
    });
  return result;
};
