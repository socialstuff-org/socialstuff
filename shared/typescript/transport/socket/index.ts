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

import {Socket} from 'net';

export function makeWriteP(socket: Socket) {
  return function writeP(data: Uint8Array | string, encoding?: BufferEncoding): Promise<void> {
    return new Promise((res, rej) => {
      socket.write(data, encoding, err => (err ? rej : res)(err as void));
    });
  };
}
