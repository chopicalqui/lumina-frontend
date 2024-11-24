/**
 * This file is part of Guardian.
 *
 * Guardian is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Guardian is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Guardian. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import {
  formatTimestampToUTC,
  getAutoCompleteOption,
  AccountRole,
} from "../../utils/globals";
import { NamedModelBase } from "../common";

export class AccountLookup {
  public id: string;
  public label: string;

  constructor(userData: any) {
    this.id = userData.id;
    this.label = userData.full_name;
  }
}

export class AccountRead extends NamedModelBase {
  email: string;
  roles: AccountRole[];
  locked: boolean;
  activeFrom?: Date;
  activeUntil?: Date;
  lastLogin?: Date;

  constructor(data: any) {
    super(data.full_name, data.id);
    this.email = data.email;
    this.roles = data.roles.map((x: AccountRole) =>
      getAutoCompleteOption(AccountRole, x)
    );
    this.locked = data.locked;
    this.activeFrom = data.active_from && new Date(data.active_from);
    this.activeUntil = data.active_until && new Date(data.active_until);
    this.lastLogin = formatTimestampToUTC(data.last_login);
  }
}

export class Account extends AccountRead {
  lightMode: boolean;
  sidebarCollapsed: boolean;
  tableDensity: string;
  image: string;

  constructor(data: any) {
    super(data);
    this.lightMode = data.light_mode;
    this.sidebarCollapsed = data.sidebar_collapsed;
    this.tableDensity = data.table_density;
    this.image = data.avatar;
  }
}
