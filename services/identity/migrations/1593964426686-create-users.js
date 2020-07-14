const { createConnection } = require('../lib/db-util');

module.exports.up = async next => {
  const db = await createConnection();
  await db.query(`CREATE TABLE users(
    id varchar(64) unique primary key,
    username varchar(64) unique not null,
    password varchar(192) not null,
    created_at date not null default now()
  );`);
  next();
};

module.exports.down = async next => {
  const db = await createConnection();
  await db.query('DROP TABLE users TRUNCATE;');
  next();
};
