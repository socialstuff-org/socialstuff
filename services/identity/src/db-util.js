import util    from 'util';
import mysql   from 'mysql2/promise';
import migrate from 'migrate';

/**
 * @returns {Promise<mysql.PromiseConnection>}
 */
export function createConnection() {
  return mysql.createConnection({
                                  host:               process.env.MYSQL_HOST,
                                  user:               process.env.MYSQL_USER,
                                  password:           process.env.MYSQL_PASSWORD,
                                  database:           process.env.MYSQL_DATABASE,
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

export async function rebuildDatabase() {
  await util.promisify(migrate.load)({stateStore: '.migrate'})
    .then(set => util.promisify(set.down.bind(set)())
    .then(() => set))
    .then(set => util.promisify(set.up.bind(set))());
}