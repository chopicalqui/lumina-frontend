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
 * along with MyAwesomeProject. If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Lukas Reiter
 * @copyright Copyright (C) 2024 Lukas Reiter
 * @license GPLv3
 */

import React from "react";
import { Alert } from "@mui/material";
import LoadingBar from "./LoadingBar";
import {
  UseDataGridResult,
  MuiDataGrid,
} from "../../utils/hooks/mui/useDataGrid";
import ConfirmationDialog, {
  ConfirmationDialogOptions,
} from "../feedback/dialogs/ConfirmDialog";

const DataGrid = React.memo(<T,>(props: UseDataGridResult<T>) => {
  const {
    apiRef,
    queryContext,
    mutateResetConfig,
    confirmResetDialogOptions,
    ...dataGridProps
  } = props;
  const rows = React.useMemo(
    () => queryContext?.data ?? [],
    [queryContext.data]
  );

  if (queryContext.isError) {
    const statusMessage = queryContext.statusMessage;
    return (
      statusMessage && (
        <Alert severity={statusMessage.severity}>{statusMessage.message}</Alert>
      )
    );
  }

  return (
    <>
      <ConfirmationDialog
        {...(confirmResetDialogOptions as ConfirmationDialogOptions)}
        mutation={mutateResetConfig}
      />
      <MuiDataGrid
        {...dataGridProps}
        apiRef={apiRef}
        rows={rows as any}
        density={"compact"}
      />
      <LoadingBar query={queryContext} />
    </>
  );
});

export default DataGrid;
