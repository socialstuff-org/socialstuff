const express = require('express');
const bodyParser = require('body-parser');

const register = require('./register');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/register', register);

app.listen(3000, '0.0.0.0', err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Social Stuff Identity service running on port 3000.');
});