/**
 * Sample startup script for a UOW application.
 *
 * Import dojo modules or your own before you use them; remove these if you
 * replace the default layout.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('duncan.Main');
dojo.require('dojo.parser');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.AccordionContainer');
dojo.require('dijit.layout.TabContainer');

dojo.declare('duncan.Main', null, {
    constructor: function() {
		var self = this;
		self.getDB();
    },
	getDB: function(){
        var self = this;
		uow.data.getDatabase({
			database: 'zolayvar',
			collection: 'shoutout',
			mode: 'crud'
		}).then(function(db){
			self.database = db;
			var items = [];
			db.fetch({
				count: 50,
				onBegin: function() {},
				onItem: function(item) {
				  items.push(item);
				},
				onComplete: function() {
				  self.hi(items);
				},
				onError: function(e) {
				  self.error("Data problem. Punch Stephanie.");
				}
			});
		});
	},
	hi: function(items){
		var self = this;
		var out = dojo.byId("hi");
		if (items.length == 0){
			out.innerHTML = "There are no sessions.";
		}
		if (items.length > 0){
			var active = [];
			for (i = 0; i < items.length; i++){
				if (items[i].active){
					active.push(items[i]);
				}
			}
			out.innerHTML = "There are active sessions.  Pick which one you want to join.";
			self.displaySessions(active);
		}
	},
	displaySessions: function(items){
		var self = this;
		for (i = 0; i < items.length; i++){
			var sesh = items[i];
			self.displaySession(sesh);
		}
	},
	displaySession: function(sesh){
		var self = this;
		var hi = dojo.byId('hi');
		var sesh = sesh;
		var holder = dojo.create('div', {
			'class': "sesh"
		}, hi);
		var words = dojo.create('div', {
			'class': "seshname",
			'innerHTML': sesh.name
		}, holder);
		var input = dojo.create('input', {
			'class': "seshcode",
			'id': sesh.name
		}, holder);
		dojo.connect(input, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				if (input.value == sesh.code){
					self.joinSession(sesh);
				}
			}
		});
		$('.seshcode').watermark('Code');
	},
	joinSession: function(sesh){
		var self = this;
		self.sesh = sesh;
		dojo.empty('hi');
		dojo.byId('headerContent').innerHTML = self.sesh.question;
		self.submitted = false;
		self.claimFirstSlot();
		self.setupBox();
		self.pollAndUpdate();
	},
	genKey: function(){
		this.key = Date.now()+""+Math.random()+""+Math.random()+""+Math.random()+""+Math.random()+""+Math.random()+"";
	},
	claimFirstSlot: function(){
		var self = this;
		for (var i = 0; i < 21; i++){
			var attempt = 'r'+i;
			if (self.sesh[attempt]['live'] == false){
				 self.slot = attempt;
				 self.slotData = self.sesh[attempt];
				 return;
			}
		}
		self.error('Something is wrong.  Two possible reasons:<br>-More than 21 participants attempting to connect.<br>-The host has not yet started the session.');
	},
	checkSlotOwnership: function(){
		
	},
	setupBox: function(){
		var self = this;
		var box = dojo.create( 'textArea', {
			name: 'response',
			value: "",
			'class': 'response',
			'id': 'response'
		}, 'hi');
		dojo.connect(box, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				if (self.submitted == false){
					self.submit();
				}
			}
		});
	},
	submit: function(){
		var self = this;
		var newresp = self.sesh.responses.slice(0);
		var r = $.trim(dojo.byId('response').value);
		dojo.byId('response').value = r;
		newresp.push( r );
		var args = {
			'query': {'name': self.sesh.name},
			'data': {'responses': newresp},
			'save': true
		};
		self.database.updateOne(args)
	},
	pollAndUpdate: function(){
		var self = this;
		var oldquestion = self.sesh.question;
		self.database.fetchOne({
			query: {
				'name': self.sesh.name
			}
		}).then(function(session){
			console.log(session.question, oldquestion, oldquestion == session.question);
			if (oldquestion != session.question){
				self.sesh = session;
				dojo.byId('headerContent').innerHTML = self.sesh.question;
				dojo.removeClass('headerContent', 'good');
				dojo.addClass('headerContent', 'bad');
				self.submitted = false;
			}
			setTimeout( dojo.hitch(self, self.pollAndUpdate), 1500);
		});
		
	},
	error: function(message){
		dojo.empty('content');
		dojo.byId('content').innerHTML = message
	}
});

dojo.ready(function() {
    var app = new duncan.Main();        
});