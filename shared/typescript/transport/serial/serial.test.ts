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

import {bufferToUInt, serialize, uInt32ToBuffer, uIntToBuffer} from './index';

describe('serial', () => {
  describe.skip('number serialization and deserialization', () => {
    describe('uIntToBuffer', () => {
      it.each([
        [0x4587, Buffer.from([0x87, 0x45])],
        [0x2809, Buffer.from([0x09, 0x28])],
        [0x6619, Buffer.from([0x19, 0x66])],
        [0x54, Buffer.from([0x54])],
        [0x54762288, Buffer.from([0x08, 0x22, 0x76, 0x54])],
        [0x568708, Buffer.from([0x08, 0x87, 0x56])],
      ])('should properly convert numbers to buffers', (number, buffer) => {
        console.log('number:', number);
        const serialized = uIntToBuffer(number);
        if (!serialized.equals(buffer)) {
          console.error('number:', number.toString(16), ';buffer:', buffer, ';serialized:', serialized);
        }
        expect(serialized.equals(buffer)).toBeTruthy();
      });
    });
  });

  describe('bufferToUInt', () => {
    it('should properly convert buffers to numbers', () => {
      // TODO
    });
  });

  describe('serialize - object serialization', () => {
    it('should properly convert an object with a string to binary', () => {
      const obj = { foo: 'bar' };
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(3);
      expect(serialized.slice(4).toString('utf-8')).toEqual('bar');
    });

    it.each([4, 65583, /* 20719254740, 435476534 */])('should properly convert an object with a number to binary', n => {
      const obj = { foo: n };
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(4);
      expect(serialized.readUInt32BE(4)).toEqual(n);
    });

    it('properly maps arrays', () => {
      const str = ['hello', 'socialstuff', 'this is another', 'longer string'];
      const serialized = serialize(str);
      expect(serialized.readUInt32BE()).toEqual(4);
      let offset = 4;
      str.forEach((s, i) => {
        const length = serialized.readUInt32BE(offset);
        offset += 4;
        expect(length).toEqual(Buffer.from(str[i], 'utf-8').length);
        const storedString = serialized.slice(offset, length).toString('utf-8');
        offset += length;
        expect(storedString).toEqual(s);
      });
    });

    it('should properly convert an object with a Date to binary', () => {
      const obj = { foo: new Date() };
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(obj.foo.toISOString().length);
      expect(serialized.slice(4).toString('utf-8')).toEqual(obj.foo.toISOString());
    });

    it.each([1337, 45672, 23, 64354565, 567])('should properly handle nested objects', n => {
      const obj = {
        foo: {
          bar: n
        }
      };
      const serializedNumber = uInt32ToBuffer(n);
      const serialized = serialize(obj);
      expect(serialized.readUInt32BE()).toEqual(8);
      expect(serialized.slice(4).readUInt32BE()).toEqual(4);
      // console.log(serializedNumber, serialized);
      expect(serialized.slice(8).readUInt32BE()).toEqual(n);
    });
  });
});
