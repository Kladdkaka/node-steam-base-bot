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

var bot = new MyBot('username', 'password');
```

# Options
To initialize the bot, you must use `var bot = new MyBot(username, password)`, but you may also add an optional options object. This object can contain the following (and any others if you are adding to the bot):
```JavaScript
//Without options
var bot = new MyBot(username, password);
//With options
var bot = new MyBot(username, password, {
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
client.on("loggedOn")
client.on("steamGuard")
client.on("error")
client.on("disconnected")
client.on("sentry")
client.on("webSession")
client.on("loginKey")
client.on("newItems")
client.on("newComments")
client.on("tradeOffers")
client.on("offlineMessages")
client.on("vanityURL")
client.on("accountInfo")
client.on("emailInfo")
client.on("accountLimitations")
client.on("vacBans")
client.on("wallet")
client.on("licenses")
client.on("gifts")
client.on("appOwnershipCached")
client.on("changelist")
client.on("appUpdate")
client.on("packageUpdate")
client.on("marketingMessages")
client.on("tradeRequest")
client.on("tradeResponse")
client.on("tradeStarted")
client.on("playingState")
client.on("user")
client.on("group")
client.on("groupEvent")
client.on("groupAnnouncement")
client.on("friendRelationship")
client.on("groupRelationship")
client.on("friendsList")
client.on("groupList")
client.on("friendsGroupList")
client.on("nicknameList")
client.on("friendOrChatMessage")
client.on("friendMessage")
client.on("friendTyping")
client.on("friendLeftConversation")
client.on("friendMessageEcho")
client.on("friendTypingEcho")
client.on("chatMessage")
client.on("chatHistory")
client.on("chatInvite")
client.on("chatCreated")
client.on("chatEnter")
client.on("chatLeft")
client.on("chatUserJoined")
client.on("chatUserLeft")
client.on("chatUserDisconnected")
client.on("chatUserKicked")
client.on("chatUserBanned")
client.on("chatUserSpeaking")
client.on("chatUserDoneSpeaking")
client.on("chatSetPublic")
client.on("chatSetPrivate")
client.on("chatSetOfficersOnly")
client.on("lobbyInvite")

manager.on("newOffer")
manager.on("receivedOfferChanged")
manager.on("pollData")

community.on("sessionExpired")
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
