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
import { useMutation } from "../../utils/hooks/tanstack/useMutation";
import { axiosPost } from "../../utils/axios";
import { invalidateQueryKeys } from "../../utils/consts";
import { QueryKey } from "@tanstack/react-query";
import { UseMutationAlert } from "../feedback/TanstackAlert";

/**
 * This interface defines the properties of the FileUpload component.
 */
interface FileUploadOptions {
  id: string;
  url: string;
  queryKey: QueryKey;
}

/**
 * This component allows users to upload files to the server.
 */
const FileUpload = React.memo(({ id, url, queryKey }: FileUploadOptions) => {
  const mutation = useMutation(
    React.useMemo(
      () => ({
        mutationFn: async (data: any) =>
          axiosPost(url, data, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        onSuccess: () => invalidateQueryKeys(queryKey),
      }),
      [url, queryKey]
    )
  );

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      // Prepare the file for upload
      const formData = new FormData();
      formData.append("file", file);

      // Send the file to the server
      mutation.mutate(formData);
    }
  };

  return (
    <>
      <UseMutationAlert {...mutation} />
      <input
        accept="image/png"
        style={{ display: "none" }}
        id={id}
        type="file"
        onChange={handleFileChange}
      />
    </>
  );
});

export default FileUpload;
