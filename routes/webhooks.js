'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const qs = require('querystring');
const graph = require('../graph');
const BadRequest = require('./api/BadRequest.js');

const router = express.Router();

// Used to verify the signature within incoming webhok requests
function xhub(req, res, buf, encoding) {
    const shaSignature = req.get('x-hub-signature');
    if (!shaSignature) {
        req.xhub = false;
        return;
    }

    const bodySignature = crypto.createHmac('sha1', process.env.APP_SECRET)
        .update(buf, encoding)
        .digest('hex');
    if ('sha1=' + bodySignature !== shaSignature) {
        logger.warn('mismatch xhub', { expected: shaSignature, actual: bodySignature });
        req.xhub = false;
        return;
    }
    req.xhub = true;
}

// For a message sent to a bot, attempt to reply back to the sender
function echo(messagingEvent) {
    console.log('Message event' + JSON.stringify(messagingEvent, null, 2));

    let recpient = messagingEvent.recipient.id;
    var installation = global.installations.get(recpient);

    if (installation !== null) {
        graph('me/messages')
            .token(installation.accessToken)
            .body({
              recipient: {
                id: messagingEvent.sender.id
              },
              message: {
                text: 'I\'m ' + installation.botName + '. Received: ' + messagingEvent.message.text
              }
            })
            .post()
            .send();

    } else {
        console.log('No matching installation with page id: ' + recpient);
    }


    return;
}

// Setup the webhook request validation
router.use(bodyParser.json({ verify: xhub }));


router.route('/webhook')
    // Accepts POST requests at /webhook endpoint to receive actual webhook events
    .post((req, res, next) => {
        // Parse the request body from the POST
        let body = req.body;

        if(body.object === "page") {

            // There may be multiple if Facebook has batched the webhook events
            body.entry.forEach(function (pageEntry) {

                // Iterate over each messaging event
                pageEntry.messaging.forEach(function (messagingEvent) {
                    if (messagingEvent.message) {
                        echo(messagingEvent);
                    }
                    else {
                        console.log('Unknown PAGE webhook request: ' + JSON.stringify(body, null, 2));
                    }
                });
            });

            res.sendStatus(200);
        } else {
            // Otherwise just output the body and return 200
            console.log('Received another kind of webhook request: ' + JSON.stringify(body, null, 2));
            res.sendStatus(200);
        }
    })
    // GET requests represent subscription confirmation requests
    .get((req, res, next) => {
        let params = req.query;
        if (!params['hub.mode'] && !params['hub.challenge'] && !params['hub.verify_token']) {
            next();
        }
        if (params['hub.verify_token'] !== process.env.VERIFY_TOKEN) {
            throw new BadRequest('Invalid verify token.');
        }
        return res.status(200).send(params['hub.challenge']);
    });

 module.exports = router;
