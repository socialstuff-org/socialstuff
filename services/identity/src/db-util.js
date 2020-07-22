const mysql = require('mysql2/promise');

/**
 * @returns {Promise<mysql.PromiseConnection>}
 */
export function createConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
  });
}

let _sharedConnection;

/**
 *
 * @returns {Promise<mysql.PromiseConnection>}
 */
export function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}
