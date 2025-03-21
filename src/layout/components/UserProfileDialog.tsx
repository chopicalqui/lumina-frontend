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
import {
  Box,
  Stack,
  Button,
  Dialog,
  Avatar,
  styled,
  Tooltip,
  Typography,
  ButtonBase,
  ToggleButton,
  DialogActions,
  DialogContent,
  FormControlLabel,
  ToggleButtonGroup,
  IconButton,
  Portal,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import { UserProfileDialogResult } from "../../utils/hooks/mui/useUserProfileDialog";
import { useQueryMe } from "../../models/account/account";
import { Item } from "../../components/feedback/dialogs/DetailsDialog";
import { invalidateQueryKeys } from "../../utils/consts";
import { axiosPut } from "../../utils/axios";
import {
  queryKeyAccountMe,
  URL_ACCOUNTS_ME_AVATAR,
  URL_ACCOUNTS_ME_AVATAR_RESET,
  URL_FULL_ACCOUNTS_ME_AVATAR,
  URL_ACCOUNTS_ME_LIGHTMODE,
  URL_USERS_ME_TABLE_DENSITY,
} from "../../models/account/common";
import { UseMutationAlert } from "../../components/feedback/TanstackAlert";
import { useMutation } from "../../utils/hooks/tanstack/useMutation";
import FileUpload from "../../components/inputs/FileUpload";

export const ItemBox = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

interface UserProfileDialogProps {
  context: UserProfileDialogResult;
}

/**
 * This component displays the user profile dialog.
 */
const UserProfileDialog = React.memo((props: UserProfileDialogProps) => {
  const account = useQueryMe();
  const { context } = props;
  const lightMode = account.data?.lightMode ? "lightmode" : "darkmode";
  const hasAvatar = account.data?.hasAvatar;
  const tableDensity = account.data?.tableDensity;
  const mutationLightMode = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async () => axiosPut(URL_ACCOUNTS_ME_LIGHTMODE),
        onSuccess: () => invalidateQueryKeys(queryKeyAccountMe),
      }),
      []
    )
  );
  const imageUrl = React.useMemo(
    () => (hasAvatar ? URL_FULL_ACCOUNTS_ME_AVATAR : undefined),
    [hasAvatar]
  );
  const mutationTableDensity = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosPut(URL_USERS_ME_TABLE_DENSITY, { density: data }),
        onSuccess: () => invalidateQueryKeys(queryKeyAccountMe),
      }),
      []
    )
  );
  const mutationDeleteAvatar = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosPut(URL_ACCOUNTS_ME_AVATAR_RESET, data),
        onSuccess: () => invalidateQueryKeys(queryKeyAccountMe),
      }),
      []
    )
  );

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: string
  ) => {
    if (newMode === null) return;
    mutationLightMode.mutate(undefined);
  };

  const handleTableDensityChange = (
    _event: React.MouseEvent<HTMLElement>,
    density: string
  ) => {
    if (density === null) return;
    mutationTableDensity.mutate(density);
  };

  const handleDeleteAvatar = () => {
    mutationDeleteAvatar.mutate(undefined);
  };

  return (
    <Portal container={document.getElementById("dialog")}>
      <UseMutationAlert {...mutationLightMode} />
      <UseMutationAlert {...mutationTableDensity} />
      <UseMutationAlert {...mutationDeleteAvatar} />
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={context.open}
        onClose={context.handleClose}
      >
        <DialogContent>
          <FileUpload
            id={"avatar"}
            url={URL_ACCOUNTS_ME_AVATAR}
            queryKey={queryKeyAccountMe}
          />
          <Stack>
            <Item sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <ItemBox>
                  <ButtonBase
                    onClick={() => document.getElementById("avatar")?.click()}
                  >
                    <Avatar
                      alt={account.data?.name ?? "User Profile"}
                      src={imageUrl}
                      sx={{ width: 150, height: 150 }}
                    />
                  </ButtonBase>
                  {account.data?.hasAvatar && (
                    <IconButton size="small" onClick={handleDeleteAvatar}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ItemBox>
                <ItemBox>
                  <Typography variant="h4">
                    {account.data?.name ?? "User Profile"}
                  </Typography>
                </ItemBox>
              </Stack>
            </Item>
            <Item sx={{ mb: 2 }}>
              <FormControlLabel
                label="Mode"
                labelPlacement="bottom"
                sx={{ m: 0 }}
                control={
                  <ToggleButtonGroup
                    value={lightMode}
                    exclusive
                    size="small"
                    onChange={handleModeChange}
                    aria-label="mode"
                  >
                    <ToggleButton value="darkmode">
                      <Tooltip describeChild title="Switch to darkmode.">
                        <DarkModeIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="lightmode">
                      <Tooltip describeChild title="Switch to lightmode.">
                        <LightModeIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                }
              />
              <FormControlLabel
                label="Table Density"
                labelPlacement="bottom"
                control={
                  <ToggleButtonGroup
                    value={tableDensity}
                    exclusive
                    size="small"
                    onChange={handleTableDensityChange}
                    aria-label="mode"
                  >
                    <ToggleButton
                      value="comfortable"
                      aria-label="density comportable"
                    >
                      <Tooltip
                        describeChild
                        title="Use table row density: Comportable"
                      >
                        <DensityLargeIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton
                      value="standard"
                      aria-label="density standard"
                    >
                      <Tooltip
                        describeChild
                        title="Use table row density: Standard"
                      >
                        <DensityMediumIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="compact" aria-label="density compact">
                      <Tooltip
                        describeChild
                        title="Use table row density: Compact"
                      >
                        <DensitySmallIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                }
              />
            </Item>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={context.handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
});

export default UserProfileDialog;
