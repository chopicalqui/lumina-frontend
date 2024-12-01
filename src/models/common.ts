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

import { AlertColor } from "@mui/material";

/*
 * This class is used by all Lumina API model classes to provide a common interface for all Lumina API model classes.
 */
export abstract class ModelBase {
  constructor(public id: string | null) {}

  public getQueryId(): string {
    return this.id ?? "";
  }
}

/*
 * This class is used by all Lumina API model classes to provide a common interface for all Lumina API model classes.
 */
export abstract class NamedModelBase extends ModelBase {
  constructor(
    public name: string,
    id: string | null
  ) {
    super(id);
    this.name = name;
  }
}

/**
 * Data class for status messages.
 *
 * This class is used by useLuminaQuery useLuminaMutation and SnackbarAlert to obtain and display status messages.
 */
export class StatusMessage {
  type?: string;
  severity: AlertColor;
  message: string;

  constructor(data: any) {
    this.type = data.type;
    this.severity = data.severity;
    this.message = data.message;
  }
}
