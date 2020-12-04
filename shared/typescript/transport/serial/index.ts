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

export interface DeserializationSchema {
  [field: string]: {
    type: SerializedField;
    isArray?: boolean;
  };
}

type SerializedField = 'string' | 'Buffer' | DeserializationSchema | 'Date' | 'number';
type SerializableField = Buffer | string | number | Serializable | Date;

export interface Serializable {
  [field: string]: SerializableField | SerializableField[] | Serializable;
}

export function serialize(foo: Serializable | SerializableField[]): Buffer {
  if (foo instanceof Array) {
    const serializedElements = foo.map(x => serialize(x as any));
    serializedElements.push(uInt32ToBuffer(serializedElements.length));
    return Buffer.concat(serializedElements);
  } else {
    const result: Buffer[] = [];
    for (const name in foo) {
      let element = foo[name] as SerializableField;
      const elementLength = Buffer.alloc(4, 0);
      if (!(element instanceof Buffer)) {
        if (typeof element === 'string') {
          element = Buffer.from(element, 'utf-8');
        } else if (typeof element === 'number') {
          element = uInt32ToBuffer(element);
        } else if (element instanceof Array) {
          element = Buffer.concat(element.map(serialize));
        } else if (element instanceof Date) {
          element = Buffer.from(element.toISOString(), 'utf-8');
        } else if (typeof element === 'object') {
          element = serialize(element);
        } else {
          throw new Error(`Encountered unexpected type at element '${element}'!`);
        }
      }
      elementLength.writeUInt32BE((element as Buffer).length);
      result.push(elementLength, (element as Buffer));
    }
    return Buffer.concat(result);
  }
}

function parseFieldBytes(type: SerializedField, data: Buffer): SerializableField | null {
  if (type === 'string') {
    return data.toString('utf-8');
  } else if (type === 'number') {
    return data.readInt32BE();
  } else if (type === 'Buffer') {
    return data;
  } else if (type === 'Date') {
    return new Date(data.toString('utf-8'));
  } else {
    console.error(type);
    return null;
  }
}

export function deserialize<T = any>(schema: DeserializationSchema, data: Buffer, _isArray: boolean = false): T | T[] {
  let offset = 0;
  if (_isArray) {
    const result: any[] = [];
    while (offset < data.length) {
      const tmp: { [key: string]: any } = {};
      for (const key of Object.keys(schema)) {
        const elementLength = data.readUInt32BE(offset);
        offset += 4;
        const elementBuffer = data.slice(offset, offset + elementLength);
        offset += elementLength;
        const type = typeof schema === 'object' ? schema[key].type : schema;
        tmp[key] = parseFieldBytes(type, elementBuffer)
          || deserialize(schema, elementBuffer);
      }
      result.push(tmp);
    }
    return result;
  } else {
    const result: { [key: string]: any } = {};
    for (const name in schema) {
      const elementLength = data.readUInt32BE(offset);
      offset += 4;
      const elementBuffer = data.slice(offset, offset + elementLength);
      offset += elementLength;
      let value;
      if (schema[name].isArray) {
        value = deserialize(schema[name].type as any, elementBuffer, true);
      } else {
        value = parseFieldBytes(schema[name].type, elementBuffer);
        if (!value) {
          value = deserialize(schema[name].type as any, elementBuffer);
        }
      }
      result[name] = value;
    }
    return result as any;
  }
}

export function uInt32ToBuffer(n: number) {
  const result = Buffer.alloc(4, 0);
  result.writeInt32BE(n);
  return result;
}

export function objectToDeserializationSchema(obj: Serializable | Serializable[]): DeserializationSchema {
  if (typeof obj === 'string') {
    return 'string' as any;
  } else if (typeof obj === 'number') {
    return 'number' as any;
  } else if (obj instanceof Array) {
    return objectToDeserializationSchema(obj[0]);
  } else {
    const result: DeserializationSchema = {};
    for (const name in obj) {
      if (name === '0') {
        throw new Error(name);
      }
      let type: SerializedField;
      let isArray = undefined;
      if (obj[name] instanceof Buffer) {
        type = 'Buffer';
      } else if (typeof obj[name] === 'string') {
        type = 'string';
      } else if (typeof obj[name] === 'number') {
        type = 'number';
      } else if (obj[name] instanceof Date) {
        type = 'Date';
      } else if (obj[name] instanceof Array) {
        const firstEntry = (obj[name] as Serializable[])[0];
        if (!firstEntry) {
          throw new Error('Missing example item for schema creation!');
        }
        type = objectToDeserializationSchema(firstEntry);
        isArray = true;
      } else if (typeof obj[name] === 'object') {
        type = objectToDeserializationSchema(obj[name] as any);
      } else {
        throw new Error(`Given value '${obj[name]}' is of unfitting type!`);
      }
      result[name] = {
        type,
        isArray,
      };
    }
    return result;
  }
}

export function uIntToBuffer(num: number) {
  let n = Math.floor(num);
  let max = 256;
  let byteCount = 1;
  while (n > max) {
    max = max << 8 | 0xff;
    ++byteCount;
  }
  const bytes: number[] = [];
  for (let i = 0; i < byteCount; ++i) {
    const byte = n & 0xff;
    n >>= 8;
    bytes.push(byte);
  }
  // console.log('foo bytes:', bytes.map(x => x.toString(16)), ';n:', num.toString(16));
  return Buffer.from(bytes);
}

export function bufferToUInt(n: Buffer) {
  let result = 0;
  for (let i = 0; i < n.length; ++i) {
    result += n.readUInt8(i) << (8 * i);
    // console.log('current element:', Buffer.from([n.readInt8(i)]), 'sum', result);
  }
  return result;
}
