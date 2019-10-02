# Workplace Echo Bot

This simple app demonstrates how to use a Workplace Third Party App that can be installed multiple times per Workplace tenant and that can be named upon installation.

The app functionality is to allow an admin to trigger the install and to simply keep the relevant installation metadata (e.g., the bot's name and page id along with the access token used for API invocations) in memory. Then when webhook requests are received (signifying that a user has messaged the bot), the app will make a simple response back to the user.
