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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Navigate } from "@toolpad/core/AppProvider";
import { UseQueryAlert } from "../components/feedback/TanstackAlert";
import { UseLuminaQueryResult } from "../utils/hooks/tanstack/useQuery";
import { Account as LuminaAccount } from "../models/account/account";

const PageContent = React.memo(
  ({
    pathname,
    meQuery,
  }: {
    pathname: string;
    meQuery: UseLuminaQueryResult<LuminaAccount, Error>;
    navigate: Navigate;
  }) => {
    return (
      <>
        <UseQueryAlert context={meQuery} />
        <Box
          sx={{
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography>Dashboard content for {pathname}</Typography>
        </Box>
      </>
    );
  }
);

export default PageContent;
