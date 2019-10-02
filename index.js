
/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `npm install`
 * 3. Update the VERIFY_TOKEN
 *
 */

'use strict';

// Imports dependencies and set up http server
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');

const routes = require('./routes');
const installations = require('./installations');

const app = express();
app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'pug');
app.set('json spaces', 2);

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});
app.use(routes);

dotenv.config();

app.listen(app.get('port'), () => {
  console.log(`App is running on port ${app.get('port')}.`);
});