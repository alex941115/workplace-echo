'use strict';

class Installations {

    constructor() {
        this.botsByPageId = {};
        this.pagesByInstallationId = {};
    }

    registerBot(pageId, accessToken, botName, installationId) {
        this.botsByPageId[pageId] = {
            'accessToken': accessToken,
            'botName': botName,
        };

        this.pagesByInstallationId[installationId] = pageId;

        return;
    }

    getBotByPageId(pageId) {
        return this.botsByPageId[pageId];
    }

    deregister(installationId) {
        // lookup the page based on the installation id
        pageId = this.pagesByInstallationId[installationId];

        // remove this bot from memory
        delete this.botsByPageId[pageId];

        // remove the cross reference by installation id
        delete this.pagesByInstallationId[installationId];
    }

}

global.installations = new Installations();
