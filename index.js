'use strict';

// Imports dependencies and set up http server
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');

const routes = require('./routes');

const qs = require('querystring');
const graph = require('./graph');

// Initialize the installations global
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

  // Ensure that required env variables are defined
  if(process.env.APP_ID === undefined) {
    throw new Error('Missing required env variable APP_ID');
  }

  if(process.env.APP_SECRET === undefined) {
    throw new Error('Missing required env variable APP_SECRET');
  }

  if(process.env.BASE_URL === undefined) {
    throw new Error('Missing required env variable BASE_URL');
  }

  if(process.env.VERIFY_TOKEN === undefined) {
    throw new Error('Missing required env variable VERIFY_TOKEN');
  }

  // Subscribe to Page webhooks (this is the chat message webhook receiver)
  graph(process.env.APP_ID + '/subscriptions')
    .post()
    .qs({
      object: 'page',
      fields: 'messages',
      callback_url: process.env.BASE_URL + '/webhook',
      verify_token: process.env.VERIFY_TOKEN,
      access_token: process.env.APP_ID + '|' + process.env.APP_SECRET,
    })
    .send()
    .then(tokenResponse => {
      console.log(`Page webhook response ${tokenResponse}.`);
    });

    // Subscribe to the app uninstall event (fires when company chooses to uninstall)
    graph(process.env.APP_ID + '/subscriptions')
      .post()
      .qs({
        object: 'application',
        fields: 'workplace_uninstall',
        callback_url: process.env.BASE_URL + '/webhook',
        verify_token: process.env.VERIFY_TOKEN,
        access_token: process.env.APP_ID + '|' + process.env.APP_SECRET,
      })
      .send()
    .then(tokenResponse => {
      console.log(`Uninstall subscription webhook response ${tokenResponse}.`);
    });

  console.log(`App is running on port ${app.get('port')}.`);
});
