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

import { Dayjs } from "dayjs";
import { GetErrorOptions } from "../../components/inputs/common";

// Query keys for accounts
export const queryKeyAccounts = ["accounts"];
export const queryKeyAccountMe = ["me"];
export const queryKeyAccountMeNotifications = [
  ...queryKeyAccountMe,
  "notifications",
];
export const queryKeyAccountMeSettings = [
  ...queryKeyAccountMe,
  "accountSettings",
];
export const queryKeyAccessTokens = [...queryKeyAccountMe, "accessTokens"];
export const queryKeyAccountMeDataGrid = [...queryKeyAccountMe];

// REST API endpoints for accounts
export const URL_PATH_ACCOUNTS_PREFIX = "/v1/accounts";
export const URL_ACCOUNTS = URL_PATH_ACCOUNTS_PREFIX;
export const URL_ACCOUNTS_ME = URL_PATH_ACCOUNTS_PREFIX + "/me";
export const URL_ACCOUNTS_ME_SETTINGS = URL_ACCOUNTS_ME + "/settings";
export const URL_ACCOUNTS_ME_LIGHTMODE =
  URL_ACCOUNTS_ME_SETTINGS + "/toggle-light-mode";
export const URL_USERS_ME_TOGGLE_MENU =
  URL_ACCOUNTS_ME_SETTINGS + "/toggle-menu";
export const URL_USERS_ME_TABLE_DENSITY =
  URL_ACCOUNTS_ME_SETTINGS + "/table-density";
export const URL_ACCOUNTS_ME_AVATAR = URL_ACCOUNTS_ME_SETTINGS + "/avatar";
export const URL_ACCOUNTS_ME_AVATAR_RESET = URL_ACCOUNTS_ME_AVATAR + "/reset";
export const URL_DATAGRID_SETTINGS =
  URL_ACCOUNTS_ME_SETTINGS + "/data-grid/{id}";
export const URL_DATAGRID_SETTINGS_RESET = URL_DATAGRID_SETTINGS + "/reset";
// Notifications
export const URL_ME_NOTIFICATIONS = URL_ACCOUNTS_ME + "/notifications";
// Access tokens
export const URL_ME_ACCESS_TOKENS = URL_ACCOUNTS_ME + "/access-tokens";

/**
 * Default input validation for text fields.
 */
export const verifyTextFieldDefault = (props: GetErrorOptions) => {
  const { value, label, required } = props;
  if (required && !value) {
    throw new Error(`${label} is required.`);
  }
};

export const verifyDatePickerDefault = (props: GetErrorOptions) => {
  const { value, label, required } = props;
  console.log(value);
  if (required && !value) {
    throw new Error(`${label} is required.`);
  }
  if ((value as Dayjs)?.isValid() === false) {
    throw new Error(`${label} is not a valid date.`);
  }
};

/**
 * Input validation for email addresses.
 */
export const verifyEmail = (props: GetErrorOptions) => {
  const { value, label } = props;
  // Perform the default validation
  verifyTextFieldDefault(props);
  if (
    value &&
    !(value as string).match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
  ) {
    throw new Error(
      `${label?.toString().toLowerCase()} is not a valid email address.`
    );
  }
};
