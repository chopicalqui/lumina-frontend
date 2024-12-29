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

import { AxiosRequestConfig, AxiosResponse } from "axios";
import { axiosClient } from "./consts";
import { StatusMessage } from "../models/common";
import { getCookieValue } from "./globals";
import { CSRF_TOKEN_HEADER } from "./consts";

/**
 * This function is used to issue a GET request to the server.
 */
export const axiosGet = async <T>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined
): Promise<T> =>
  axiosClient.get<T>(url, config).then((response) => response.data);

/**
 * This function is used to issue a GET request to the server.
 */
export const axiosGetWithCsrf = async <T>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined
): Promise<T> => {
  const headers = { ...(config?.headers ?? {}) };
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  if (token) {
    headers[CSRF_TOKEN_HEADER] = token;
  }
  return axiosClient
    .get<T>(url, { ...config, headers })
    .then((response) => response.data);
};

/**
 * This function is used to issue a POST request to the server.
 */
export const axiosPost = async <TData, TVariables>(
  url: string,
  data?: TVariables,
  config?: AxiosRequestConfig<any> | undefined
): Promise<TData> => {
  const headers = { ...(config?.headers ?? {}) };
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  if (token) {
    headers[CSRF_TOKEN_HEADER] = token;
  }
  return axiosClient
    .post<
      TData,
      AxiosResponse<TData, StatusMessage>
    >(url, data, { ...config, headers })
    .then((response) => response.data);
};

/**
 * This function is used to issue a PATCH request to the server.
 */
export const axiosPatch = async <TData, TVariables>(
  url: string,
  data?: TVariables,
  config?: AxiosRequestConfig<any> | undefined
): Promise<TData> => {
  const headers = { ...(config?.headers ?? {}) };
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  if (token) {
    headers[CSRF_TOKEN_HEADER] = token;
  }
  return axiosClient
    .patch<
      TData,
      AxiosResponse<TData, StatusMessage>
    >(url, data, { ...config, headers })
    .then((response) => response.data);
};

/**
 * This function is used to issue a PUT request to the server.
 */
export const axiosPut = async <TData, TVariables>(
  url: string,
  data?: TVariables,
  config?: AxiosRequestConfig<any> | undefined
): Promise<TData> => {
  const headers = { ...(config?.headers ?? {}) };
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  if (token) {
    headers[CSRF_TOKEN_HEADER] = token;
  }
  return axiosClient
    .put<
      TData,
      AxiosResponse<TData, StatusMessage>
    >(url, data, { ...config, headers })
    .then((response) => response.data);
};

/**
 * This function is used to issue a PUT request to the server.
 */
export const axiosDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig<any> | undefined
): Promise<T> => {
  const headers = { ...(config?.headers ?? {}) };
  const token = getCookieValue(CSRF_TOKEN_HEADER);
  if (token) {
    headers[CSRF_TOKEN_HEADER] = token;
  }
  return axiosClient
    .delete<T, AxiosResponse<T, StatusMessage>>(url, { ...config, headers })
    .then((response) => response.data);
};
