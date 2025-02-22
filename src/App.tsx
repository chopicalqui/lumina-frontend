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

import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import { theme } from "./layout/theme";
import { useQuerySession } from "./utils/hooks/tanstack/useQuerySession";
import PageContent from "./layout/PageContent";
import { NAVIGATION, PageEnum } from "./layout/NavigationItems";
import { APP_NAME } from "./utils/consts";
import { SessionManager } from "./layout/SessionManager";

const BRANDING = {
  title: APP_NAME.toLocaleUpperCase(),
};

export default function App() {
  const { session, authentication, meQuery } = useQuerySession();
  const router = useDemoRouter(`/${PageEnum.accounts}`);
  const me = meQuery.data;
  const statusMessage = meQuery.statusMessage;
  const isError = meQuery.isError;

  return (
    <>
      <SessionManager account={me} />
      <AppProvider
        session={session}
        authentication={authentication}
        navigation={NAVIGATION}
        branding={BRANDING}
        router={router}
        theme={theme}
      >
        <DashboardLayout
          disableCollapsibleSidebar
          defaultSidebarCollapsed={me?.sidebarCollapsed}
          hideNavigation={session === null}
        >
          <PageContent
            me={me}
            isError={isError}
            statusMessage={statusMessage}
            pathname={router.pathname}
            navigate={router.navigate}
          />
        </DashboardLayout>
      </AppProvider>
    </>
  );
}
