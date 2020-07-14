#!/bin/sh
ls
npm run build
npx migrate
npm start
