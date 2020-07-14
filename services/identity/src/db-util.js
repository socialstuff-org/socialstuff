const mysql = require('mysql2/promise');

/**
 * @returns {Promise<mysql.PromiseConnection>}
 */
export function createConnection() {
  return mysql.createConnection({
    host: 'socialstuff_identity_mysql',
    user: 'root',
    password: 'root',
    database: 'socialstuff_identity',
  });
}

let _sharedConnection;
export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}
