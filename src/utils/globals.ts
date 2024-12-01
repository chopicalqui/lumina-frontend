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

import { GridColDef } from "@mui/x-data-grid";

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
}

/**
 * Defines the IDs of the MUI DataGrids in the application.
 *
 * It is used for checking whether the user has access to this component.
 */
export enum ScopeEnum {
  PageAccount = "page_account",
  PageAccessToken = "page_access_token",
  DataGridAccount = "datagrid_account",
  DataGridAccessToken = "datagrid_access_token",
}

/**
 * Lumina uses a centralized approach to define the meta information of the model classes. This information is used
 * by Lumina to build the user interface and the MUI DataGrid.
 */
export interface MetaInfoType {
  // Whether the column is visible in the MUI DataGrid (default is true).
  visibleDataGrid?: boolean;
  // Information for InputControlWrapper component.
  inputControlInfo?: any;
  // Column information for the MUI DataGrid.
  dataGridInfo: GridColDef;
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
 * Formats an ISO 8601 timestamp by truncating fractional seconds to three digits
 * (milliseconds) and appends a "Z" to indicate UTC time.
 *
 * @param {string} timestamp - The ISO 8601 timestamp to format (e.g., "2024-11-23T12:34:56.123456").
 * @returns {string} - The formatted timestamp with milliseconds truncated to three digits and "Z" appended (e.g., "2024-11-23T12:34:56.123Z").
 */
export const formatTimestampToUTC = (timestamp: string): Date | undefined => {
  let result: Date | undefined = undefined;
  if (timestamp && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+/.test(timestamp)) {
    result = new Date(timestamp.replace(/(\.\d{3})\d*/, "$1") + "Z");
  }
  return result;
};
