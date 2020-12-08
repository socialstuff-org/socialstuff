import express from 'express';
// @ts-ignore
import customEnv from 'custom-env';
customEnv.env();

import router from './router';

const APP_PORT = parseInt(process.env.APP_PORT || '3002');
const APP_HOST = process.env.APP_HOST || '::1';

const cors = require('cors');
const app = express();

app.use(express.json())
app.use(express.urlencoded());
app.use(cors());
app.options('*', cors())
app.use('/', router);

app.listen(APP_PORT, APP_HOST, () => {
    console.log(`service running on ${APP_HOST}:${APP_PORT}`);
});
