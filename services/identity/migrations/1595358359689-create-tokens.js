const { sharedConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await sharedConnection();
  // TODO add index for `token` column
  await db.query(`CREATE TABLE IF NOT EXISTS tokens(
    token binary(16) not null unique,
    expires_at date default null,
    id_user BINARY(16) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await sharedConnection();
  await db.query('DROP TABLE IF EXISTS tokens CASCADE;');
};
