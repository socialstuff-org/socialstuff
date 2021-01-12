// This file is part of the TITP.
//
// TITP is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TITP is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with TITP.  If not, see <https://www.gnu.org/licenses/>.

let ENABLE_DEBUG_LOGGING = false;

import chalk from 'chalk';

export function enableLogging() {
  ENABLE_DEBUG_LOGGING = true;
}

export function disableLogging() {
  ENABLE_DEBUG_LOGGING = true;
}

export function log(...items: any[]) {
  if (!ENABLE_DEBUG_LOGGING) {
    return;
  }
  const t = new Date();
  const logAt = `(${t.toISOString()})`;
  console.log(chalk.bold(logAt), ...items);
}

export function prefix(p: string, prefixColor: chalk.Chalk = chalk.blueBright) {
  return log.bind(null, prefixColor.call(undefined, `[${p}]`));
}
