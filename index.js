'use strict'

const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const SteamTradeOfferManager = require('steam-tradeoffer-manager');
const Winston = require('winston');

const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

class SteamBot {
	constructor(username, password, options){
		this.username = username;
		this.password = password;
	    this.options = options || {};

	    this.service = this.options.service || undefined;
	    this.apikey = this.options.apikey || undefined;
	    this.logfile = this.options.logfile || this.username + '.log';
	    this.guardCode = this.options.guardCode || undefined;
	    this.twoFactorCode = this.options.twoFactorCode || undefined;
	    this.sharedSecret = this.options.sharedSecret || undefined;
	    this.identitySecret = this.options.identitySecret || undefined;
	    this.confirmationInterval = this.options.confirmationInterval || 30000;
	    this.gamePlayed = this.options.gamePlayed || undefined;

	    this.groupID = this.options.groupID || undefined;
	    this.customGameName = this.options.customGameName || undefined

	    this.client = new SteamUser();
	    this.community = new SteamCommunity();
	    this.manager = new SteamTradeOfferManager({
	    	"steam": this.client,
	    	"language": "en"
	    });
	    
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

		//SteamUser Events
		this.client.on("loggedOn", (response) => { this._onLoggedOn(response) });
		this.client.on("webSession", (sessionID, cookies) => { this._onWebSession(sessionID, cookies) } );
		this.client.on("friendMessage", (steamID, message) => { this._onFriendMessage(steamID, message) });
		this.client.on("friendRelationship", (steamID, relationship) => { this._onFriendRelationship(steamID, relationship) });

		//TradeOfferManager Events
		this.manager.on('newOffer', (offer) => { this._onNewOffer(offer); });
		this.manager.on('receivedOfferChanged', (offer, oldState) => { this._onReceivedOfferChanged(offer, oldState); });
		this.manager.on('pollData', (pollData) => { this._onPollData(pollData); });
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

	//Handlers (may be overriden)
	_onLoggedOn(response){
		if (response.eresult === SteamUser.EResult.OK) {
			this.logger.info('Logged into Steam!');
			this.client.setPersona(SteamUser.EPersonaState = 1);
			if(this.gamePlayed){
				this.client.gamesPlayed([(this.customGameName ? this.customGameName : "SteamRDSBot"), this.gamePlayed]);
			}
		} else {
		    this.logger.warn('EResult for logon: ' + response.eresult);
		}
	}

	_onWebSession(sessionID, cookies){
		this.manager.setCookies(cookies, (error) => {
			if (error) {
				this.logger.error("WebSession error :" + error);
				process.exit(1); // Fatal error since we couldn't get our API key
				return;
			}
			this.logger.info("Successfully received Steam API key");
		});

		this.community.setCookies(cookies);
		this.community.startConfirmationChecker(this.confirmationInterval, this.identitySecret); // Checks and accepts confirmations every 30 seconds
	}

	_onFriendMessage(steamID, message){
	    this.logger.info('Message from ' + steamID + ': ' + message);
	    this.client.chatMessage(steamID, 'Hi, thanks for messaging me! My owner haven\'t finished me yet! You\'ll have to wait a little bite more for my services');
	}

	_onFriendRelationship(steamID, relationship){
		if (relationship === SteamUser.EFriendRelationship.RequestRecipient) {
        	this.client.addFriend(steamID);
	    } else if (relationship === SteamUser.EFriendRelationship.Friend) {
	        if (this.groupID) {
	            this.client.inviteToGroup(steamID, this.groupID);
	        }
	        this.client.chatMessage(steamID, 'Hi, thanks for adding me! My owner haven\'t finished me yet! You\'ll have to wait a little bite more for my services');
	    }
	}

	_onNewOffer(offer){
		this.logger.warn("TradeOfferManager: New offer #" + offer.id + " from " + offer.partner.getSteam3RenderedID() + ", but I won't do anything, because I am not configured yet!");
	}

	_onReceivedOfferChanged(offer, oldState){
		this.logger.warn("TradeOfferManager: Offer #" + offer.id + " changed: " + TradeOfferManager.ETradeOfferState[oldState] + " => " + TradeOfferManager.ETradeOfferState[offer.oldState]+ ", but I won't do anything, because I am not configured yet!");
	}

	_onPollData(pollData){
		this.logger.warn("TradeOfferManager: onPollData event fired, but I won't do anything, because I am not configured yet!");
	}
}

SteamBot.SteamUser = SteamUser;

module.exports = SteamBot