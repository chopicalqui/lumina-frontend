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
import Autocomplete, { AutocompleteOptions } from "./Autocomplete";
import {
  CountryLookup,
  queryKeyCountriesLookup,
  URL_COUNTRIES_LOOKUP,
  URL_COUNTRY_FLAGS,
} from "../../models/country";
import { AutocompleteClass } from "../../utils/globals";
import { Box } from "@mui/material";

const CountrySelect = (props: AutocompleteOptions) => {
  return (
    <Autocomplete
      {...props}
      queryUrl={URL_COUNTRIES_LOOKUP}
      queryKey={queryKeyCountriesLookup}
      renderOption={React.useCallback(
        (
          props: React.HTMLAttributes<HTMLLIElement> & { key: any },
          option: AutocompleteClass
        ) => {
          const result = option as CountryLookup;
          return (
            <Box
              component="li"
              sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              {...props}
            >
              <img
                loading="lazy"
                width="30"
                key={"img_" + props.id}
                srcSet={
                  URL_COUNTRY_FLAGS + "/" + result.code.toLowerCase() + " 2x"
                }
                src={URL_COUNTRY_FLAGS + "/" + result.code.toLowerCase()}
              />
              {result.label} ({result.code})
            </Box>
          );
        },
        []
      )}
      startAdornment={React.useCallback((row: AutocompleteClass | null) => {
        const result = row as CountryLookup | null;
        return result ? (
          <img
            width="30"
            style={{ marginRight: "5px" }}
            key={"img_" + result.id}
            srcSet={`${URL_COUNTRY_FLAGS}/${result.code.toLowerCase()} 2x`}
            src={`${URL_COUNTRY_FLAGS}/${result.code.toLowerCase()}`}
            alt={result.label}
          />
        ) : undefined;
      }, [])}
    />
  );
};

export default React.memo(CountrySelect) as (
  props: AutocompleteOptions
) => JSX.Element;
