'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qs = require('querystring');
const graph = require('../graph');

const webhooks = require('./webhooks');

const router = express.Router();

router.route('/')
  .get((req, res, next) => res.render('home'));

router.route('/favicon.ico')
  .get((req, res, next) => res.sendStatus(404));

router.route('/index')
  .get((req, res, next) => {
    let app_id = process.env.APP_ID;
    let redirect_uri = process.env.REDIRECT_URI;
    return res.render(
      'index',
      {
        appId: app_id,
        redirectUri: redirect_uri,
      }
    );
  });

// Accept the installation redirect from Workplace and exchange the install code for an access token
router.route('/page_install/:app_id')
  .get((req, res, next) => {
    if (!req.query.code) {
      return res
        .status(400)
        .render('error', { message: 'No code received.' });
    }
    graph('oauth/access_token')
      .qs({
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code: req.query.code,
      })
      .send()
      .then(tokenResponse => {
        return Promise.all([
          graph('me')
            .token(tokenResponse.access_token)
            .qs({ fields: 'name' })
            .send(),
          graph('community')
            .token(tokenResponse.access_token)
            .qs({ fields: 'install,name' })
            .send()
        ])
          .then(responses => {
            const pageResponse = responses[0];
            const communityResponse = responses[1];
            console.log(pageResponse);
            console.log(communityResponse);

            // keep the installation information  (page, access token, and bot name) in memory for demo purposes
            const installations = global.installations;
            installations.register(pageResponse.id, tokenResponse.access_token, pageResponse.name);

            return {
              id: pageResponse.id,
              name: pageResponse.name,
              accessToken: tokenResponse.access_token,
              communityId: communityResponse.id,
              communityName: communityResponse.name,
              installId: communityResponse.install.id,
            };
          })
      }
      )
      .then(page => {
        const state = req.query.state;
        res.render('pageInstallSuccess', { page, state });
      })
      .catch(next);
  });


router.use(webhooks);

module.exports = router;
