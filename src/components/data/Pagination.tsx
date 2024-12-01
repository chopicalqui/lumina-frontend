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
import { Box, Pagination as MuiPagination, Typography } from "@mui/material";
import {
  useGridSelector,
  useGridApiContext,
  gridPageCountSelector,
  gridFilteredSortedRowIdsSelector,
  gridPaginationModelSelector,
} from "@mui/x-data-grid";

/**
 * DataGrid footer component that displays the total number of rows and the pagination controls.
 */
const Pagination = React.memo(() => {
  const apiRef = useGridApiContext();
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const filteredRows = useGridSelector(
    apiRef,
    gridFilteredSortedRowIdsSelector
  );
  const rowCount = filteredRows.length;
  // Do not implement conditional hiding any of the elements below because this will cause an
  // exception once the datagrid only contains a single row that is than pinned/selected.
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ m: 1, ml: 2 }}>
        Total Rows: {rowCount}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <MuiPagination
        count={pageCount}
        page={paginationModel.page + 1}
        onChange={(_: React.ChangeEvent<unknown>, page: number) =>
          apiRef.current.setPage(page - 1)
        }
      />
    </Box>
  );
});

export default Pagination;
