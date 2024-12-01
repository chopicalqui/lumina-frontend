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
import { useQueryMe } from "../../../models/account/account";
import { API_PATH_PREFIX, ORG_LOGO, ORG_NAME, ORG_URL } from "../../consts";
import { Authentication, Session } from "@toolpad/core/AppProvider";

// This custom hook can be used to access the information of the currently logged in user.
export const useQuerySession = () => {
  const meQuery = useQueryMe();
  const me = meQuery.data;
  const session: Session | null = React.useMemo(
    () =>
      meQuery.isSuccess
        ? {
            user: {
              id: me!.id,
              email: me!.email,
              image: me!.image,
              name: me!.name,
            },
            org: {
              name: ORG_NAME,
              url: ORG_URL,
              logo: ORG_LOGO,
            },
          }
        : null,
    [me, meQuery.isSuccess]
  );
  const authentication = React.useMemo<Authentication>(() => {
    return {
      signIn: () => {
        window.location.assign(`${API_PATH_PREFIX}/redirect-login`);
      },
      signOut: () => {
        window.location.assign(`${API_PATH_PREFIX}/logout`);
      },
    };
  }, []);
  return React.useMemo(() => {
    return {
      session,
      authentication,
      meQuery,
    };
  }, [session, authentication, meQuery]);
};
