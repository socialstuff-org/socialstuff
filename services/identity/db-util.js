const mysql = require('mysql2/promise');

/**
 * @returns {Promise<mysql.PromiseConnection>}
 */
function createConnection() {
  /** @type {mysql.PromiseConnection} */
  const connection = mysql.createConnection({
    host: 'socialstuff_identity_mysql',
    user: 'root',
    password: 'root',
    database: 'socialstuff_identity',
  });
  return connection;
}

let _sharedConnection;
function sharedConnection() {
  if (!_sharedConnection) {
    _sharedConnection = createConnection();
  }
  return _sharedConnection;
}

module.exports = {
  createConnection,
  sharedConnection
};