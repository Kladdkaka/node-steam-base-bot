# SteamRDSBot

[![npm version](https://img.shields.io/npm/v/steam-rdsbot.svg)](https://www.npmjs.com/package/steam-rdsbot)
[![npm](https://img.shields.io/npm/dm/steam-rdsbot.svg)](https://www.npmjs.com/package/steam-rdsbot)
[![dependencies](https://img.shields.io/david/ricardosohn/node-steam-rdsbot.svg)](https://www.npmjs.com/package/steam-rdsbot)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/ricardosohn/node-steam-rdsbot/blob/master/LICENSE)
[![Gratipay](https://img.shields.io/gratipay/user/ricardosohn.svg)](https://gratipay.com/~ricardosohn/)

A NodeJS module using ES6 that provides a SteamBot base class, allowing full customization & overriding.

This is on early development stage (and I'm also new to NodeJS), so there will be probably bugs.

# Installation
First you will need to install node.js if you haven't already. This will only work with Node.js >= 6.0.0 (Only tested with this version).

Once you have node and npm installed, type this command in shell, cmd, powershell, etc:
```
npm install steam-rdsbot 
```

# Usage

```JavaScript
var SteamRDSBot = require('steam-rdsbot');

class MyBot extends SteamRDSBot {
	_onFriendMsg(steamID, message, type) { } //overridden method
}

var Bot = new MyBot('username', 'password');
```

# Options
To initialize the bot, you must use `var Bot = new MyBot(username, password)`, but you may also add an optional options object. This object can contain the following (and any others if you are adding to the bot):
```JavaScript
//Without options
var Bot = new ChildBot(username, password);
//With options
var Bot = new ChildBot(username, password, {
	sentryfile: 'username.sentry', //sentry file that stores steamguard info, defaults to username.sentry
	logfile: 'username.log', //filename to log stuff to, defaults to username.log
	twoFactorCode: 'XXXXX', //two factor authentication code, only needed if you're using the mobile 2FA
	sharedSecret: 'XXXXXXXXXXXXXXXXXXXXXXXXXXX=', //shared secret, needed to automatically generate twoFactorCode
	identitySecret: 'XXXXXXXXX/XXXXXXXXXXXXXXX/X=', //identity secret, needed to automatically confirm trade offers, must be used with confirmationInterval
	confirmationInterval: 10000, //how often we should check for new trades to confirm in miliseconds, must be used with identitySecret
	gameNamePlayed: 'This is the non-steam game name that the bot will play',
  gamePlayed: 440 //game that the bot will play, don't include for no game
});
```

# Default methods and handlers

The base class SteamRDSBot includes a few (will add more) built in methods and listeners. 
You can add your own, and edit the built in ones right in your config file.

The event handlers are:
```
client.on("loggedOn", this._onLoggedOn.bind(this));
client.on("steamGuard", this._onSteamGuard.bind(this));
client.on("error", this._onError.bind(this));
client.on("disconnected", this._onDisconnected.bind(this));
client.on("sentry", this._onSentry.bind(this));
client.on("webSession", this._onWebSession.bind(this));
client.on("loginKey", this._onLoginKey.bind(this));
client.on("newItems", this._onNewItems.bind(this));
client.on("newComments", this._onNewComments.bind(this));
client.on("tradeOffers", this._onTradeOffers.bind(this));
client.on("offlineMessages", this._onOfflineMessages.bind(this));
client.on("vanityURL", this._onVanityUrl.bind(this));
client.on("accountInfo", this._onAccountInfo.bind(this));
client.on("emailInfo", this._onEmailInfo.bind(this));
client.on("accountLimitations", this._onAccountLimitations.bind(this));
client.on("vacBans", this._onVacBans.bind(this));
client.on("wallet", this._onWallet.bind(this));
client.on("licenses", this._onLicenses.bind(this));
client.on("gifts", this._onGifts.bind(this));
client.on("appOwnershipCached", this._onAppOwnershipCached.bind(this));
client.on("changelist", this._onChangelist.bind(this));
client.on("appUpdate", this._onAppUpdate.bind(this));
client.on("packageUpdate", this._onPackageUpdate.bind(this));
client.on("marketingMessages", this._onMarketingMessages.bind(this));
client.on("tradeRequest", this._onTradeRequest.bind(this));
client.on("tradeResponse", this._onTradeResponse.bind(this));
client.on("tradeStarted", this._onTradeStarted.bind(this));
client.on("playingState", this._onPlayingState.bind(this));
client.on("user", this._onUser.bind(this));
client.on("group", this._onGroup.bind(this));
client.on("groupEvent", this._onGroupEvent.bind(this));
client.on("groupAnnouncement", this._onGroupAnnouncement.bind(this));
client.on("friendRelationship", this._onFriendRelationship.bind(this));
client.on("groupRelationship", this._onGroupRelationship.bind(this));
client.on("friendsList", this._onFriendsList.bind(this));
client.on("groupList", this._onGroupsList.bind(this));
client.on("friendsGroupList", this._onFriendsGroupList.bind(this));
client.on("nicknameList", this._onNicknameList.bind(this));
client.on("friendOrChatMessage", this._onFriendOrChatMessage.bind(this));
client.on("friendMessage", this._onFriendMessage.bind(this));
client.on("friendTyping", this._onFriendTyping.bind(this));
client.on("friendLeftConversation", this._onFriendLeftConversation.bind(this));
client.on("friendMessageEcho", this._onFriendMessageEcho.bind(this));
client.on("friendTypingEcho", this._onFriendTypingEcho.bind(this));
client.on("chatMessage", this._onChatMessage.bind(this));
client.on("chatHistory", this._onChatHistory.bind(this));
client.on("chatInvite", this._onChatInvite.bind(this));
client.on("chatCreated", this._onChatCreated.bind(this));
client.on("chatEnter", this._onChatEnter.bind(this));
client.on("chatLeft", this._onChatLeft.bind(this));
client.on("chatUserJoined", this._onChatUserJoined.bind(this));
client.on("chatUserLeft", this._onChatUserLeft.bind(this));
client.on("chatUserDisconnected", this._onChatUserDisconnected.bind(this));
client.on("chatUserKicked", this._onChatUserKicked.bind(this));
client.on("chatUserBanned", this._onChatUserBanned.bind(this));
client.on("chatUserSpeaking", this._onChatUserSpeaking.bind(this));
client.on("chatUserDoneSpeaking", this._onChatUserDoneSpeaking.bind(this));
client.on("chatSetPublic", this._onChatSetPublic.bind(this));
client.on("chatSetPrivate", this._onChatSetPrivate.bind(this));
client.on("chatSetOfficersOnly", this._onChatSetOfficersOnly.bind(this));
client.on("lobbyInvite", this._onLobbyInvite.bind(this));

manager.on('newOffer', this._onNewOffer.bind(this));
manager.on('receivedOfferChanged', this._onReceivedOfferChanged.bind(this));
manager.on('pollData', this._onPollData.bind(this));

community.on('sessionExpired', this._onSessionExpired.bind(this));
```

The default methods are:
```
logOn(); //SteamUser.logOn(details)
```
# Help
**This repository is beginner friendly**. If you have a problem, no matter how simple it is, PLEASE open an issue, and either I or other users will try to answer it as quickly as possible. 
If you need help with something that is really complex or would take a long time, you can [add me on steam](http://steamcommunity.com/id/ricardosohn/)

# Contributors
**Pull requests are welcome!** If you found a bug and fixed it, send a pull request.
If you think that you added something useful, send a pull request. 
Please try to follow the existing style though.

Feel free to add your name and github link here if you contributed. Also add what you did to contribute.

* [dragonbanshee (project creator)](https://github.com/dragonbanshee)
* [andrewda (project creator & readme)](https://github.com/andrewda)
* [DoctorMcKay (steam nodes)](https://github.com/DoctorMcKay)
