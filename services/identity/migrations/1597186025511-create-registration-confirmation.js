const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS registration_confirmations(
    token binary(16) not null unique,
    expires_at date not null,
    id_user BINARY(16) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE IF EXISTS registration_confirmations CASCADE;');
};
