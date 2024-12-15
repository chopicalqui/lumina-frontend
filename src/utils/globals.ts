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

import dayjs from "dayjs";

// Define a model class type with a constructor
export type ClassType<T> = new (...args: any[]) => T;

/**
 * This type is used to define the auto-complete options in the application.
 */
export type AutoCompleteOption = {
  id: number;
  label: string;
};

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
export const getAutoCompleteOption = (
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
export const valueGetterAutoCompleteOption = (
  value: AutoCompleteOption
): string => value.label;

/**
 * This function is used to get the value of an auto-complete list.
 */
export const valueGetterAutoCompleteOptionList = (
  value: AutoCompleteOption[]
): string[] => value.map((x) => x.label);

/**
 * This function is used to get the value of a date field.
 */
export const valueGetterDate = (value?: dayjs.Dayjs): Date | undefined =>
  value?.toDate();

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
