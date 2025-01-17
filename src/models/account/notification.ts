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
import { NamedModelBase } from "../common";

/**
 * Data class for notifications.
 */
export class Notification extends NamedModelBase {
  public readonly message: string;
  public readonly date?: dayjs.Dayjs;
  public readonly read: boolean;

  constructor(notificationData: any) {
    super(notificationData.subject, notificationData.id);
    this.message = notificationData.message;
    this.date = dayjs(notificationData.created_at);
    this.read = notificationData.read;
  }
}
