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

import {bufferToUInt, serialize, uIntToBuffer} from './index';

describe('serial', () => {
  describe('serialize', () => {
    it('should properly convert an object with a string to binary', () => {
      const obj = { foo: 'bar' };
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(3);
      expect(serialized.slice(4).toString('utf-8')).toEqual('bar');
    });

    it('should properly convert an object with a number to binary', () => {
      const numbers = [4, 65583, 900719254740, 435476534];
      for (const n of numbers) {
        const obj = { foo: n };
        const serialized = serialize(obj);
        const numberAsBuffer = uIntToBuffer(n);
        expect(serialized.readUInt32BE()).toEqual(numberAsBuffer.length);
        expect(bufferToUInt(serialized.slice(4))).toEqual(n);
      }
    });

    it('properly maps arrays', () => {
      const str = ['hello', 'socialstuff', 'this is another, longer string'];
      const serialized = serialize(str);
      let offset = 0;
      for (const s of str) {
        const length = serialized.readUInt32BE(offset);
        offset += 4;
        expect(length).toEqual(s.length);
        const storedString = serialized.slice(offset, length).toString('utf-8');
        offset += length;
        expect(storedString).toEqual(s);
      }
    });

    it('should properly convert an object with a Date to binary', () => {
      const obj = { foo: new Date() };
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(obj.foo.toISOString().length);
      expect(serialized.slice(4).toString('utf-8')).toEqual(obj.foo.toISOString());
    });

    it('should properly handle nested objects', () => {
      const numbers = [1337, 45672, 23, 64354565, 567];
      for (const n of numbers) {
        const obj = {
          foo: {
            bar: n
          }
        };
        const serializedNumber = uIntToBuffer(n);
        const serialized = serialize(obj);
        expect(serialized.readUInt32BE()).toEqual(4 + serializedNumber.length);
        expect(serialized.slice(4).readUInt32BE()).toEqual(serializedNumber.length);
        console.log(serializedNumber, serialized);
        expect(bufferToUInt(serialized.slice(8))).toEqual(n);
      }
    })
  });
});
