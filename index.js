'use strict'

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const Winston = require('winston');

const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

class SteamBot {
	constructor(username, password, options){
		this.username = username;
		this.password = password;
	    this.options = options || {};

	    this.groupID = this.options.groupID || undefined;
	    this.logfile = this.options.logfile || this.username + '.log';
	    this.twoFactorCode = this.options.twoFactorCode || undefined;
	    this.sharedSecret = this.options.sharedSecret || undefined;
	    this.identitySecret = this.options.identitySecret || undefined;
	    this.confirmationInterval = this.options.confirmationInterval || undefined;
	    this.gamePlayedName = this.options.gamePlayedName || undefined
	    this.gamePlayed = this.options.gamePlayed || undefined;
	    
		this.client = new SteamUser();

		this.logger = new (Winston.Logger)({
	        transports: [
	            new (Winston.transports.Console)({
	                colorize: true,
	                timestamp: true,
	                label: this.username,
	                level: 'silly',
	                json: false
	            }),
	            new (Winston.transports.File)({
	                level: 'debug',
	                timestamp: true,
	                json: false,
	                filename: this.logfile
	            })
	        ]
	    });
		//Steam Events
		this.client.on("loggedOn", (response) => { this._onLoggedOn(response) });
		this.client.on("friendMessage", (steamID, message) => { this._onFriendMessage(steamID, message) });
		this.client.on("friendRelationship", (steamID, relationship) => { this._onFriendRelationship(steamID, relationship) });
	}

	logOn(){
		this.logger.info('Logging in...');
		try{	
			this.client.logOn({
			    accountName: this.username,
			    password: this.password,
			    twoFactorCode: SteamTotp.getAuthCode(this.options.sharedSecret)
			});	
		} catch(error){
			this.logger.error('Error logging in:' + error);
		}
	}

	_onLoggedOn(response){
		if (response.eresult === SteamUser.EResult.OK) {
			this.logger.info('Logged into Steam!');
			this.client.setPersona(SteamUser.EPersonaState = 1);
			if (this.gamePlayedName && this.gamePlayed){
				this.client.gamesPlayed([this.gamePlayedName, this.gamePlayed]);
			}
		} else {
		    this.logger.warn('EResult for logon: ' + response.eresult);
		}
	}

	_onFriendMessage(steamID, message){
	    this.logger.info('Message from ' + steamID + ': ' + message);
	    this.client.chatMessage(steamID, 'Hi, thanks for messaging me! If you are getting this message, it means that my ' +
	                                     'owner hasn\'t configured me properly. Annoy them with messages until they do!');
	}

	_onFriendRelationship(steamID, relationship){
		if (relationship === SteamUser.EFriendRelationship.RequestRecipient) {
        	this.client.addFriend(steamID);
	    } else if (relationship === SteamUser.EFriendRelationship.Friend) {
	        if (this.groupID) {
	            this.client.inviteToGroup(steamID, this.groupID);
	        }
	        this.client.chatMessage(steamID, 'Hi, thanks for adding me! If you are getting this message, it means that my ' +
	                                                'owner hasn\'t configured me properly. Annoy them with messages until they do!');
	    }
	}
}

SteamBot.SteamUser = SteamUser;

module.exports = SteamBot