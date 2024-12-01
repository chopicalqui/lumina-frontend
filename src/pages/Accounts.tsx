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
import { useQueryAccounts, useQueryMe } from "../models/account/account";
import { useDataGrid } from "../utils/hooks/mui/useDataGrid";
import DataGrid from "../components/data/DataGrid";
import { ScopeEnum } from "../utils/globals";
import { getDefaultDataGridRowActions } from "../components/data/getDefaultDataGridRowActions";

const Accounts = React.memo(() => {
  const scope = ScopeEnum.DataGridAccount;
  const me = useQueryMe();
  const rowActions = getDefaultDataGridRowActions({
    scope,
    me: me!.data!,
  });
  const queryContext = useQueryAccounts();
  const dataGrid = useDataGrid({
    scope,
    me: me!.data!,
    queryContext,
    rowActions,
  });

  return <DataGrid {...dataGrid} />;
});

export default Accounts;
