const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE tokens(
    token varchar(255) not null unique,
    expires_at date default null,
    id_user char(64) not null,
    foreign key (id_user) references users(id)
  );`);
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE IF EXISTS tokens CASCADE;');
};