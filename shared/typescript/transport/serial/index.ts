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
    type: 'Buffer' | 'string' | DeserializationSchema;
    isArray?: boolean;
  };
}

export interface Serializable {
  [field: string]: (Buffer | string | Serializable) | (Buffer | string | Serializable)[];
}

export function serialize(foo: Serializable) {
  const result: Buffer[] = [];
  for (const name in foo) {
    let element = foo[name] as Buffer | string | Serializable;
    const elementLength = Buffer.alloc(4, 0);
    if (!(element instanceof Buffer)) {
      if (typeof element === 'string') {
        element = Buffer.from(element, 'utf-8');
      } else if (element instanceof Array) {
        element = Buffer.concat(element.map(serialize));
      } else if (typeof element === 'object') {
        element = serialize(element);
      } else {
        throw new Error(`Encountered unexpected type at element '${element}'!`);
      }
    }
    elementLength.writeUInt32BE(element.length);
    result.push(elementLength, element);
  }
  return Buffer.concat(result);
}

function foo(type: 'string' | 'Buffer' | DeserializationSchema, data: Buffer) {
  if (type === 'string') {
    return data.toString('utf-8');
  } else if (type === 'Buffer') {
    return data;
  } else {
    return null;
  }
}

export function deserialize(schema: DeserializationSchema, data: Buffer, _isArray: boolean = false) {
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
        tmp[key] = foo(schema[key].type, elementBuffer) || deserialize(schema, elementBuffer);
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
        value = foo(schema[name].type, elementBuffer);
        if (!value) {
          value = deserialize(schema[name].type as any, elementBuffer);
        }
      }
      result[name] = value;
    }
    return result;
  }
}

export function objectToDeserializationSchema(obj: Serializable) {
  const result: DeserializationSchema = {};
  for (const name in obj) {
    let type: 'string' | 'Buffer' | DeserializationSchema;
    let isArray = undefined;
    if (obj[name] instanceof Buffer) {
      type = 'Buffer';
    } else if (typeof obj[name] === 'string') {
      type = 'string';
    } else if (obj[name] instanceof Array) {
      const firstEntry = (obj[name] as Serializable[]).find(() => true) as Serializable;
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
