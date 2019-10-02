'use strict';

class Installations {

    constructor() {
        this.installations = {};
    }

    register(pageId, accessToken, botName) {
        this.installations[pageId] = {
            'accessToken': accessToken,
            'botName': botName,
        }

        return;
    }

    get(pageId) {
        return this.installations[pageId];
    }

}

global.installations = new Installations();