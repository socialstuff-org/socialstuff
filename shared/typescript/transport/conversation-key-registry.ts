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

import {ECDH} from 'crypto';

export interface ConversationKeyRegistry {
  fetchConversationKey(username: string): Promise<Buffer>;

  saveConversationKey(username: string, key: Buffer): Promise<void>;

  /**
   * Save you own ECDH key pair, to later on continue the handshake with the specified user.
   * @param username
   * @param ecdh
   */
  saveEcdhForHandshake(username: string, ecdh: ECDH): Promise<void>;

  loadEcdhForHandshake(username: string): Promise<ECDH | false>;

  removeEcdhForHandshake(username: string): Promise<void>;
}
