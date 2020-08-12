const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS registration_confirmations(
    expires_at date not null,
    secret varchar(50) not null,
    id_user BINARY(16) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE IF EXISTS registration_confirmations CASCADE;');
};
