const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS users(
    id BINARY(16) unique primary key,
    username varchar(64) unique not null,
    password text not null,
    public_key text not null,
    mfa_seed varchar(64)
  );`);
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE IF EXISTS users CASCADE;');
};
