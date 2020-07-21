const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE users(
    id char(36) unique primary key,
    username varchar(64) unique not null,
    password varchar(192) not null,
    public_key text not null,
    mfa_seed varchar(64)
  );`);
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE users CASCADE;');
};
