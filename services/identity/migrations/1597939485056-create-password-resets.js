const { sharedConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await sharedConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS password_resets(
    expires_at date not null,
    secret binary(16) not null,
    id_user BINARY(16) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await sharedConnection();
  await db.query('DROP TABLE IF EXISTS password_resets CASCADE;');
};
