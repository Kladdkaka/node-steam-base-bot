'use strict' // must have 'use strict' at top

const SteamBot = require('../index.js');

let bot = new SteamBot('myaccount', 'mypassword', {
	sharedSecret: 'mysharedsecret',
	groupID: 'steamgroupid',
	gamePlayedName: 'This is what the bot will play as non steam game',
	gamePlayed: 730 // this is the appid of the game run
});

bot.logOn(); // LogOn onto Steam