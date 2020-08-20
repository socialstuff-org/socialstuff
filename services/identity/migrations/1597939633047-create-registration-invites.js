const { sharedConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await sharedConnection();
  await db.query(`CREATE TABLE IF NOT EXISTS registration_invites(
    expires_at date not null,
    secret binary(16) not null unique
  );`);
};

module.exports.down = async next => {
  const db = await sharedConnection();
  await db.query('DROP TABLE IF EXISTS registration_invites CASCADE;');
};
