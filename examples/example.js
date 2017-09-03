'use strict' // must have 'use strict' at top

const SteamBot = require('../index.js');

let bot = new SteamBot('account', 'password', {
	sharedSecret: 'sharedSecret', //For this bot to work, you NEED to provide the shared secret
	identitySecret: 'identitySecret', //For this bot to work, you NEED to provide the identity secret
	groupID: '103582791460007047', // ID of the gruop that the bot will invite the users upon friendInvite accept
	customGameName: 'Steam Bot', // Shows this custom name for the game playing
	gamePlayed: 730 // AppID of the played game
});

bot.logOn(); // LogOn onto Steam