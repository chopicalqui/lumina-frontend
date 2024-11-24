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
import { NAVIGATION } from "./layout/NavigationItems";
import PageContent from "./layout/PageContent";

export default function App() {
  const { session, authentication, meQuery } = useQuerySession();
  const router = useDemoRouter("/page");
  const me = meQuery.query.data;
  //console.log("AppProviderBasic", user);
  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      router={router}
      theme={theme}
    >
      <DashboardLayout
        disableCollapsibleSidebar
        defaultSidebarCollapsed={me?.sidebarCollapsed}
        hideNavigation={session === null}
      >
        <PageContent
          pathname={router.pathname}
          meQuery={meQuery}
          navigate={router.navigate}
        />
      </DashboardLayout>
    </AppProvider>
  );
}
