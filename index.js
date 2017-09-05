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

		this.options = Object.assign({}, options);
	    this.logfile = this.options.logfile || this.username + '.log';

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
		this.client.on("loggedOn", this._onLoggedOn.bind(this));
		this.client.on("steamGuard", this._onSteamGuard.bind(this));
		this.client.on("error", this._onError.bind(this));
		this.client.on("disconnected", this._onDisconnected.bind(this));
		this.client.on("sentry", this._onSentry.bind(this));
		this.client.on("webSession", this._onWebSession.bind(this));
		this.client.on("loginKey", this._onLoginKey.bind(this));
		this.client.on("newItems", this._onNewItems.bind(this));
		this.client.on("newComments", this._onNewComments.bind(this));
		this.client.on("tradeOffers", this._onTradeOffers.bind(this));
		this.client.on("offlineMessages", this._onOfflineMessages.bind(this));
		this.client.on("vanityURL", this._onVanityUrl.bind(this));
		this.client.on("accountInfo", this._onAccountInfo.bind(this));
		this.client.on("emailInfo", this._onEmailInfo.bind(this));
		this.client.on("accountLimitations", this._onAccountLimitations.bind(this));
		this.client.on("vacBans", this._onVacBans.bind(this));
		this.client.on("wallet", this._onWallet.bind(this));
		this.client.on("licenses", this._onLicenses.bind(this));
		this.client.on("gifts", this._onGifts.bind(this));
		this.client.on("appOwnershipCached", this._onAppOwnershipCached.bind(this));
		this.client.on("changelist", this._onChangelist.bind(this));
		this.client.on("appUpdate", this._onAppUpdate.bind(this));
		this.client.on("packageUpdate", this._onPackageUpdate.bind(this));
		this.client.on("marketingMessages", this._onMarketingMessages.bind(this));
		this.client.on("tradeRequest", this._onTradeRequest.bind(this));
		this.client.on("tradeResponse", this._onTradeResponse.bind(this));
		this.client.on("tradeStarted", this._onTradeStarted.bind(this));
		this.client.on("playingState", this._onPlayingState.bind(this));
		this.client.on("user", this._onUser.bind(this));
		this.client.on("group", this._onGroup.bind(this));
		this.client.on("groupEvent", this._onGroupEvent.bind(this));
		this.client.on("groupAnnouncement", this._onGroupAnnouncement.bind(this));
		this.client.on("friendRelationship", this._onFriendRelationship.bind(this));
		this.client.on("groupRelationship", this._onGroupRelationship.bind(this));
		this.client.on("friendsList", this._onFriendsList.bind(this));
		this.client.on("groupList", this._onGroupsList.bind(this));
		this.client.on("friendsGroupList", this._onFriendsGroupList.bind(this));
		this.client.on("nicknameList", this._onNicknameList.bind(this));
		this.client.on("friendOrChatMessage", this._onFriendOrChatMessage.bind(this));
		this.client.on("friendMessage", this._onFriendMessage.bind(this));
		this.client.on("friendTyping", this._onFriendTyping.bind(this));
		this.client.on("friendLeftConversation", this._onFriendLeftConversation.bind(this));
		this.client.on("friendMessageEcho", this._onFriendMessageEcho.bind(this));
		this.client.on("friendTypingEcho", this._onFriendTypingEcho.bind(this));
		this.client.on("chatMessage", this._onChatMessage.bind(this));
		this.client.on("chatHistory", this._onChatHistory.bind(this));
		this.client.on("chatInvite", this._onChatInvite.bind(this));
		this.client.on("chatCreated", this._onChatCreated.bind(this));
		this.client.on("chatEnter", this._onChatEnter.bind(this));
		this.client.on("chatLeft", this._onChatLeft.bind(this));
		this.client.on("chatUserJoined", this._onChatUserJoined.bind(this));
		this.client.on("chatUserLeft", this._onChatUserLeft.bind(this));
		this.client.on("chatUserDisconnected", this._onChatUserDisconnected.bind(this));
		this.client.on("chatUserKicked", this._onChatUserKicked.bind(this));
		this.client.on("chatUserBanned", this._onChatUserBanned.bind(this));
		this.client.on("chatUserSpeaking", this._onChatUserSpeaking.bind(this));
		this.client.on("chatUserDoneSpeaking", this._onChatUserDoneSpeaking.bind(this));
		this.client.on("chatSetPublic", this._onChatSetPublic.bind(this));
		this.client.on("chatSetPrivate", this._onChatSetPrivate.bind(this));
		this.client.on("chatSetOfficersOnly", this._onChatSetOfficersOnly.bind(this));
		this.client.on("lobbyInvite", this._onLobbyInvite.bind(this));

		//TradeOfferManager Events
		this.manager.on('newOffer', this._onNewOffer.bind(this));
		this.manager.on('receivedOfferChanged', this._onReceivedOfferChanged.bind(this));
		this.manager.on('pollData', this._onPollData.bind(this));

		//Steam Community Events
		this.community.on('sessionExpired', this._onSessionExpired.bind(this));
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

	//Steam User Handlers

	/**
	* Emitted when you're successfully logged into Steam.
	* @param {Object} response - An object containing various details about your account (TODO: update every property based on CMsgClientLogonResponse)
	*/
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


	/**
	* Emitted when you're successfully logged into Steam.
	* @param {String} domain - If an email code is needed, the domain name of the address where the email was sent. null if an app code is needed.
	* @param {requestCallback} callback - Should be called when the code is available. It takes a code as a parameter
	* @param {boolean} lastCodeWrong - If you're using 2FA and the last code you provided was wrong, false otherwise
	*/
	_onSteamGuard(domain, callback, lastCodeWrong){}

	/**
	* Emitted when an error occurs during logon. Also emitted if we're disconnected and autoRelogin is either disabled, or it's a fatal disconnect.
	* @param {Object} error - An Error object
	*/
	_onError(error){}

	/**
	* Emitted when we're disconnected from Steam for a non-fatal reason and autoRelogin is enabled. SteamUser will continually retry connection and 
	will either emit loggedOn when logged back on, or error if a fatal logon error is experienced.Also emitted in response to a logOff() call.
	* @param {Integer} eresult - A value from the SteamUser.EResult enum
	* @param {String} msg - A string describing the reason for the disconnect, if available (might be undefined)
	*/
	_onDisconnected(eresult, msg){}

	/**
	* Emitted when Steam sends us a new sentry file. By default, SteamUser will automatically save and reuse this sentry file for subsequent logins.
	* @param {Buffer} sentry - A Buffer containing your new sentry file
	*/
	_onSentry(sentry){}

	/**
	* Emitted when a steamcommunity.com web session is successfully negotiated. This will automatically be emitted on logon and in response to webLogOn calls.
	* @param {Integer} sessionID - The value of the sessionid cookie
	* @param {Object[]} cookies - An array of cookies, as name=value strings
	*/
	_onWebSession(sessionID, cookies){}

	/**
	* If you enabled rememberPassword in logOn, this will be emitted when Steam sends us a new login key. This key can be passed to logOn as loginKey in lieu of a password on subsequent logins.
	* @param {Integer?} key - Your login key
	*/
	_onLoginKey(key){}


	/**
	* Emitted when Steam sends a notification of new items. You can reset the count to 0 by loading your inventory page (https://steamcommunity.com/my/inventory) while logged in.
	* @param {Integer} count - How many new items you have (can be 0)
	*/
	_onNewItems(count){}

	/**
	* Emitted when Steam sends a notification of new comments.
	* @param {Integer} count- How many total new comments you have (can be 0)
	* @param {Integer} myItems - How many of the total comments are on your content (workshop items, screenshots, your profile, etc.)
	* @param {Integer} discussions - How many of the total comments are posts in subscribed discussion threads
	*/
	_onNewComments(count, myItems, discussions){}

	/**
	* Emitted when Steam sends a notification of new trade offers.
	* @param {Integer} count - How many active received trade offers you have (can be 0)
	*/
	_onTradeOffers(count){}

	/**
	* Emitted when Steam sends a notification of unread offline chat messages. This will always be emitted after logon, even if you have no messages.
	* @param {Integer} count - How many unread offline chat messages you have
	* @param {String[]} friends - An array of SteamID strings for the users who have sent you unread offline chat messages
	*/
	_onOfflineMessages(count, friends){}

	/**
	* Emitted when your vanity URL changes. url is your new vanity URL. This event is emitted before the vanityURL property is updated, so you can compare to see what changed.
	* @param {String} url - Your new vanity URL
	*/
	_onVanityUrl(url){}

	/**
	* Emitted on logon and when account info changes. This event is emitted before the accountInfo property is updated, so you can compare to see what changed.
	* @param {String} name - Your account's Steam (persona) name
	* @param {String} country - The character code from which you're logging in (via GeoIP), e.g. "US"
	* @param {Integer} authedMachines - How many machines are authorized to login to your account with Steam Guard
	* @param {?} flags - Your account's bitwise flags
	* @param {String} facebookID - If your account is linked with Facebook, this is your Facebook account ID
	* @param {String} facebookName - If your account is linked with Facebook, this is your (real) name on Facebook
	*/
	_onAccountInfo(name, country, authedMachines, flags, facebookID, facebookName){}

	/**
	* Emitted on logon and when email info changes. The emailInfo property will be updated after this event is emitted.
	* @param {String} address - Your account's email address
	* @param {Boolean} validated - A boolean value for whether or not your email address is validated
	*/
	_onEmailInfo(address, validated){}

	/**
	* Emitted on logon and when limitations change. The limitations property will be updated after this event is emitted.
	* @param {Boolean} limited - true if your account is limited, false if not
	* @param {Boolean} communityBanned - True if your account is banned from Steam Community, false if not
	* @param {Boolean} locked - true if your account is locked, false if not (accounts can also be locked by Support)
	* @param {Boolean} canInviteFriends - true if your account can invite friends, false if not
	*/
	_onAccountLimitations(limited, communityBanned, locked, canInviteFriends){}

	/**
	* Emitted on logon and probably when you get banned/unbanned. The vac property will be updated after this event is emitted.
	* @param {Integer} numBans - How many bans your account has
	* @param {Integer[]?} appids - The AppIDs from which you're banned. Since each ban affects a range of AppIDs, some of the AppIDs in this array may not exist.
	*/
	_onVacBans(numBans, appids){}

	/**
	* 
	* @param {Boolean} hasWallet - true if your account has a Steam Wallet, false if not
	* @param {Enum} currency - The currency ID of your account's wallet (the enum of currencies is available as SteamUser.ECurrencyCode)
	* @param {?} balance - Your account's current wallet balance
	*/
	_onWallet(hasWallet, currency, balance){}

	/**
	* Emitted on logon and when licenses change. The licenses property will be updated after this event is emitted. 
	This isn't emitted for anonymous accounts. However, all anonymous user accounts have a license for package 17906 automatically.
	* @param {Object[]} licenses - An array of licenses
	*/
	_onLicenses(licenses){}

	/**
	* Emitted on logon and when you receive/accept/decline a gift or guest pass. The gifts property will be updated after this event is emitted.
	* @param {Object[]} gifts - An array of gift objects
	*/
	_onGifts(gifts){}

	/**
	* Emitted once we have all data required in order to determine app ownership. You can now safely call getOwnedApps, ownsApp, getOwnedDepots, and ownsDepot.
	This is only emitted if enablePicsCache is true.
	*/
	_onAppOwnershipCached(){}

	/**
	* Emitted when we receive a new changelist from Steam. The picsCache property is updated after this is emitted, so you can get the previous 
	changenumber via picsCache.changenumber. This is only emitted if enablePicsCache is true and changelistUpdateInterval is nonzero.
	* @param {Integer} changenumber - The changenumber of the changelist we just received
	* @param {Object[]} apps - An array of AppIDs which changed since our last received changelist
	*@parma {Object[]} packages - An array of PackageIDs which changed since our last received changelist
	*/
	_onChangelist(changenumber, apps, packages){}


	/**
	* Emitted when an app that was already in our cache updates. The picsCache property is updated after this is emitted, so you can get the previous 
	app data via picsCache.apps[appid]. This is only emitted if enablePicsCache is true and changelistUpdateInterval is nonzero.
	* @param {Integer} appid - The AppID of the app which just changed
	* @param {Object} data - An object identical to that received from getProductInfo
	*/
	_onAppUpdate(appid, data){}


	/**
	* Emitted when a package that was already in our cache updates. The picsCache property is updated after this is emitted, so you can get the previous
	package data via picsCache.packages[packageid].This is only emitted if enablePicsCache is true and changelistUpdateInterval is nonzero.
	* @param {Integer} packageid - The PackageID of the package which just changed
	* @param {Object} data - An object identical to that received from getProductInfo
	*/
	_onPackageUpdate(packageid, data){}


	/**
	* Emitted on logon, and when new marketing messages are published. Marketing messages are the popups that appear after you exit a game if you have 
	"Notify me about additions or changes to my games, new releases, and upcoming releases" enabled in the Steam client.
	* @param {Date} A Date object containing the time when this batch of messages was published
	* @param {Object[]} messages - An array of objects containing the following properties: id, url and flags
	*/
	_onMarketingMessages(timestamp, messages){}

	/**
	* Emitted when someone sends us a trade request.
	* @param {Object} steamID - The SteamID of the user who sent the request, as a SteamID object
	* @param {requestCallback} respond - A function which you should call to either accept (true) or decline(false) the request 
	*/
	_onTradeRequest(steamID, respond){}

	/**
	* Emitted when someone responds to our trade request. Also emitted with response EEconTradeResponse.Cancel when someone cancels their outstanding trade request to us.
	* @param {Object} steamID - The SteamID of the other user, as a SteamID object
	* @param {Enum} response - A value from the EEconTradeResponse enum
	* @param {Object[]} restrictions - An object containing the following properties (of which any or all could be undefined): steamguardRequiredDays, newDeviceCooldownDays, 
	defaultPasswordResetProbationDays, passwordResetProbationDays, defaultEmailChangeProbationDays, emailChangeProbationDays
	*/
	_onTradeResponse(steamID, response, restrictions){}

	/**
	* Emitted when a new trade session has started (either as a result of someone accepting a Steam trade request, an in-game (TF2) trade request, or something else).
	* @param {Object} steamID - The SteamID of your trade partner, as a SteamID object
	*/
	_onTradeStarted(steamID){}

	/**
	* Emitted under these conditions:
    -Right after logon, only if a game is being played on this account in another location (i.e. blocked is true)
    -Whenever a game starts (or stops) being played on another session
    -Whenever you start (or stop) playing a game on this session (via gamesPlayed).In this case, blocked is false and playingApp is the AppID you're currently playing
	* @param {Boolean} blocked - true if you're blocked from playing a game on this session (because a game is being played on this account using another logon session)
	* @param {Integer} playingApp - If blocked, this is the AppID of the game that is being played elsewhere
	*/
	_onPlayingState(blocked, playingApp){}


	/**
	* Emitted when Steam sends us persona information about a user. The users property isn't yet updated when this is emitted, so you can compare to see what changed.
	* @param {Object} steamID - A SteamID object for the user whose data we just received
	* @param {Object} user - An object containing the user's persona data
	*/
	_onUser(steamID, user){}


	/**
	* Emitted when Steam sends us information about a Steam group. The groups property isn't yet updated when this is emitted, so you can compare to see what changed.
	* @param {Object} steamID - A SteamID object for the group whose data we just received
	* @param {Object} group - An object containing the group's data
	*/
	_onGroup(steamID, group){}

	/**
	* Emitted when a group schedules a new event, or a new event starts.
	* @param {Object} steamID - A SteamID object for the group who just posted/started an event
	* @param {String} headline - The name of the event
	* @param {Date} date - A Date object for the event's start time
	* @param {String} gid - The event's GID (link to the event page at https://steamcommunity.com/gid//event/)
	* @param {Integer} gameID - The AppID of the game which this event is associated with
	*/
	_onGroupEvent(steamID, headline, date, gid, gameID){}

	/**
	* 
	* @param {Object} steamID - A SteamID object for the group who just posted an announcement
	* @param {String} headline - The name of the announcement
	* @param {String} gid - The announcement's GID (link to the announcement page at https://steamcommunity.com/gid//announcements/detail/)
	*/
	_onGroupAnnouncement(steamID, headline, gid){}

	/**
	* Emitted when our relationship with a particular user changes. For example, EFriendRelationship.RequestRecipient means that we got 
	invited as a friend, EFriendRelationship.None means that we got unfriended.The myFriends property isn't yet updated when this is emitted, 
	so you can compare to the old value to see what changed.
	* @param {Object} steamID - A SteamID object for the user whose relationship with us just changed
	* @param {Integer} relationship - A value from EFriendRelationship
	*/
	_onFriendRelationship(steamID, relationship){}

	/**
	* Emitted when our relationship with a particular Steam group changes.The myGroups property isn't yet updated when this is emitted, 
	so you can compare to the old value to see what changed.
	* @param {Object} steamID - A SteamID object for the group whose relationship with us just changed 
	* @param {Integer} relationship - A value from EClanRelationship
	*/
	_onGroupRelationship(steamID, relationship){}


	/**
	* Emitted when our friends list is downloaded from Steam after logon.
	*/
	_onFriendsList(){}

	/**
	* Emitted when our group list is downloaded from Steam after logon.
	*/
	_onGroupsList(){}

	/**
	* Emitted when our friends group list is downloaded from Steam, which should be shortly after logon (automatically). In the official client, 
	friend groups are called tags. The myFriendGroups property will be updated after this event is emitted, so you can compare groups with the property to see what changed.
	* @param {Object[]} groups - An object whose structure is identical to the myFriendGroups property
	*/
	_onFriendsGroupList(groups){}

	/**
	* Emitted when we receive our full nickname list from Steam, which should be shortly after logon (automatically). You can access it via the myNicknames property.
	*/
	_onNicknameList(){}

	/**
	* 
	* @param {Object} senderID - The message sender, as a SteamID object
	* @param {String} message - The message text
	* @param {Object?} room - The room to which the message was sent. This is the user's SteamID if it was a friend message
	*/
	_onFriendOrChatMessage(senderID, message, room){}

	/**
	* Emitted when we receive a direct friend message (that is, not through a chat room), as long as we're online.
	* @param {Object} senderID - The message sender, as a SteamID object
	* @param {String} message - The message text
	*/
	_onFriendMessage(steamID, message){}

	/**
	* Emitted when Steam notifies us that one of our friends is typing a message to us, as long as we're online.
	* @param {Object} senderID - The SteamID of the friend who's typing
	*/
	_onFriendTyping(senderID){}

	/**
	* Emitted when Steam notifies us that one of our friends with whom we've been chatting has closed our chat window, as long as we're online.
	* @param {Object} senderID - The SteamID of the friend who closed our chat window
	*/
	_onFriendLeftConversation(senderID){}

	/**
	* Emitted when Steam echos us a message that we sent to a friend on another login.
	* @param {Object} recipientID - The SteamID of the user who rececived this message
	* @param {String} message - The message text
	*/
	_onFriendMessageEcho(recipientID, message){

	}

	/**
	* Emitted when Steam echos us a notification that we're typing to a friend on another login.
	* @param {Object} recipientID - The SteamID of the user who we're typing to
	*/
	_onFriendTypingEcho(recipientID){}

	/**
	* Emitted when we receive a chat message from a chat room, as long as we're online. This is a special ID event. Any of the following are acceptable:
	* @param {Object} room - The SteamID of the chat room
	* @param {Object} chatter - The SteamID of the message sender
	* @param {String} message - The message text
	*/
	_onChatMessage(room, chatter, message){}

	/**
	* With the exception of the steamID argument, this is identical to the callback of getChatHistory.
	* @param {Object} steamID - The SteamID of the user with whom we got chat history
	* @param {Integer} success - An EResult value
	* @param {String[]} messages - An array of message objects
	*/
	_onChatHistory(steamID, success, messages){}


	/**
	* Emitted when we're invited to join a chat room. This is a special ID event. Any of the following are acceptable:
	-chatInvite
	-chatInvite#inviterID
	-chatInvite#chatID
	-chatInvite#inviterID#chatID
	* @param {Object} inviterID - The SteamID of the user who invited us
	* @param {Object} chatID - The SteamID of the chat that we were invited to
	* @param {String} chatName - The name of the chat we were invited to. Empty if it's a multi-user chat and not a group chat.
	*/
	_onChatInvite(inviterID, chatID, chatName){}

	/**
	* With the exception of the friendID argument, this event is identical to the callback of createChatRoom.
	* @param {Object} friendID - The SteamID of the friend with whom we were creating this room
	* @param {Integer} eresult - An EResult value
	* @param {Object} chatID - The SteamID of the newly-created chat, if successful
	*/
	_onChatCreated(friendID, eresult, chatID){}

	/**
	* With the exception of the chatID argument, this event is identical to the callback of joinChat.
	* @param {Object} chatID - The SteamID of the chat room that we either entered or failed to enter
	* @param {Integer} response - A value from EChatRoomEnterResponse
	*/
	_onChatEnter(chatID, response){}

	/**
	* Emitted when we leave a chat room for any reason (we left, kicked, banned, etc).
	* @param {Object} chatID - The SteamID of the chat room that we left
	*/
	_onChatLeft(chatID){}

	/**
	* Emitted when a user joins a chat room we're in.
	* @param {Object} chatID - The SteamID of the chat room that the user joined
	* @param {Object} userID - The SteamID of the user who joined
	*/
	_onChatUserJoined(chatID, userID){}

	/**
	* Emitted when a user leaves a chat room we're in.
	* @param {Object} chatID - The SteamID of the chat room that the user left
	* @param {Object} userID - The SteamID of the user who left
	*/
	_onChatUserLeft(chatID, userID){}

	/**
	* Emitted when a user in a chat room we're in disconnects from Steam.
	* @param {Object} chatID - The SteamID of the chat room that the user disconnected from
	* @param {Object} userID - The SteamID of the user who disconnected
	*/
	_onChatUserDisconnected(chatID, userID){}

	/**
	* Emitted when a user is kicked from a chat room we're in.
	* @param {Object} chatID - The SteamID of the chat room that the user was kicked from
	* @param {Object} userID - The SteamID of the user who was kicked
	* @param {Object} actor - The SteamID of the user who did the kicking
	*/
	_onChatUserKicked(chatID, userID, actor){}

	/**
	* Emitted when a user is banned from a chat room we're in.
	* @param {Object} chatID - The SteamID of the chat room that the user was banned from
	* @param {Object} userID - The SteamID of the user who was banned
	* @param {Object} actor - The SteamID of the user who did the banning
	*/
	_onChatUserBanned(chatID, userID, actor){}

	/**
	* Emitted when a user in a chat room we're in starts speaking over voice chat.
	* @param {Object} chatID - The SteamID of the chat room that the user is speaking in
	* @param {Object} userID - The SteamID of the user who is speaking
	*/
	_onChatUserSpeaking(chatID, userID){}

	/**
	* Emitted when a user in a chat room we're in stops speaking over voice chat.
	* @param {Object} chatID - The SteamID of the chat room that the user is done speaking in
	* @param {Object} userID - The SteamID of the user who is done speaking
	*/
	_onChatUserDoneSpeaking(chatID, userID){}

	/**
	* Emitted when a chat room we're in is unlocked so that anyone can join.
	* @param {Object} chatID - The SteamID of the chat room that was unlocked
	* @param {Object} actor - The SteamID of the user who unlocked it
	*/	
	_onChatSetPublic(chatID, actor){}

	/**
	* Emitted when a chat room we're in is locked so that only group members can join without an invite.
	* @param {Object} chatID - The SteamID of the chat room that was locked
	* @param {Object} actor - The SteamID of the user who locked it
	*/
	_onChatSetPrivate(chatID, actor){}

	/**
	* 
	* @param {Object} chatID - The SteamID of the chat room that was set officers-only
	* @param {Object} actor - The SteamID of the user who set it officers-only
	*/
	_onChatSetOfficersOnly(chatID, actor){}

	/**
	* 
	* @param {Object} inviterID - The SteamID of the user who invited us to a Steam lobby
	* @param {Object} lobbyID - The SteamID of the lobby we were invited to
	*/
	_onLobbyInvite(inviterID, lobbyID){}


	//Steam TradeOffer Manager Handlers

	/**
	* 
	* @param {}
	*/
	_onNewOffer(offer){}

	/**
	* 
	* @param {}
	*/
	_onReceivedOfferChanged(offer, oldState){}

	/**
	* 
	* @param {}
	*/
	_onPollData(pollData){}

	/**
	* 
	* @param {}
	*/
	_onSessionExpired(error){}
}

SteamBot.SteamUser = SteamUser;

module.exports = SteamBot