// This file is part of SocialStuff Identity.
//
// SocialStuff Identity is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SocialStuff Identity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with SocialStuff Identity.  If not, see <https://www.gnu.org/licenses/>.

export class FakeMysql {
  #data: any[] = [];
  #counter: number = 0;

  get counter() {
    return this.#counter;
  }

  constructor(data: any[]) {
    this.setData(data);
  }

  query(_q: string, _params: any[]) {
    return Promise.resolve(this.#data[this.#counter++]);
  }

  setData(data: any[]) {
    this.#data = data;
  }

  beginTransaction() {
    return Promise.resolve();
  }

  commit() {
    return Promise.resolve();
  }

  rollback() {
    return Promise.resolve();
  }
}
