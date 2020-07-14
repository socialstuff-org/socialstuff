const mysql = require('mysql2/promise');

/**
 * @returns {Promise<mysql.PromiseConnection>}
 */
export function createConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: 'root',
    password: 'root',
    database: process.env.MYSQL_DATABASE,
  });
}

let _sharedConnection;
export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}
