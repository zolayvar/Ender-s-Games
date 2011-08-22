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
dojo.require('dijit.form.TextBox');

// adjust the namespace if you changed it in index.html; this widget serves
// as our main controller to do stuff across the whole app and kick off the
// app when the page loads
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
		$('#prompt').watermark('Enter a question');
		if (items.length == 0){
			out.innerHTML = "There are no existing sessions.  Make a new one, eh?";
			self.addCreateForm();
		}
		if (items.length > 0){
			out.innerHTML = "There are existing sessions.  You can join or create.";
			self.addCreateForm();
			var active = [];
			for (i = 0; i < items.length; i++){
				if (items[i].active){
					active.push(items[i]);
				}
			}
			self.displaySessions(active);
		}
	},
	addCreateForm: function(){
		var self = this;
	
		dojo.byId('createForm').style.display = 'block';
		
		var namefield = dojo.byId('name');
		var codefield = dojo.byId('code');
		
		$('#name').watermark('New room name');
		$('#code').watermark('Specify a code');
		
		dojo.connect(namefield, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				self.createSession(namefield.value, codefield.value, true);
			}
		});
		dojo.connect(codefield, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				self.createSession(namefield.value, codefield.value, true);
			}
		});
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
		var hi = dojo.byId('sessions');
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
					self.startSession(sesh);
				}
			}
		});
		$('.seshcode').watermark('Code');
	},
	createSession: function(name, code, start){
		var self = this;
		var newsession = {
			active: start || false,
			name: name,
			code: code,
			question: '',
			r0: {
				live: false,
				text: '',
				owner: ''
			},
			r1: {
				live: false,
				text: '',
				owner: ''
			},
			r2: {
				live: false,
				text: '',
				owner: ''
			},
			r3: {
				live: false,
				text: '',
				owner: ''
			},
			r4: {
				live: false,
				text: '',
				owner: ''
			},
			r5: {
				live: false,
				text: '',
				owner: ''
			},
			r6: {
				live: false,
				text: '',
				owner: ''
			},
			r7: {
				live: false,
				text: '',
				owner: ''
			},
			r8: {
				live: false,
				text: '',
				owner: ''
			},
			r9: {
				live: false,
				text: '',
				owner: ''
			},
			r10: {
				live: false,
				text: '',
				owner: ''
			},
			r11: {
				live: false,
				text: '',
				owner: ''
			},
			r12: {
				live: false,
				text: '',
				owner: ''
			},
			r13: {
				live: false,
				text: '',
				owner: ''
			},
			r14: {
				live: false,
				text: '',
				owner: ''
			},
			r15: {
				live: false,
				text: '',
				owner: ''
			},
			r16: {
				live: false,
				text: '',
				owner: ''
			},
			r17: {
				live: false,
				text: '',
				owner: ''
			},
			r18: {
				live: false,
				text: '',
				owner: ''
			},
			r19: {
				live: false,
				text: '',
				owner: ''
			},
			r20: {
				live: false,
				text: '',
				owner: ''
			},
			r21: {
				live: false,
				text: '',
				owner: ''
			},
		};
		self.database.newItem(newsession);
		self.database.save();
		if (start){
			self.database.fetchOne({query:{'name':name, 'code':code}}).then(function(sess){
				self.startSession(sess);
			});
			
		}
	},
	startSession: function(session){
		var self = this;
		self.session = session;
		session.active = true;
		dojo.byId('headerContent').style.display = 'none';
		dojo.byId('createForm').style.display = 'none';
		dojo.byId('hi').style.display = 'none';
		dojo.byId('sessions').style.display = 'none';
		var prompt = dojo.byId('prompt')
		prompt.value = session.question;
		dojo.byId('liveheader').style.display = 'block';
		dojo.connect(prompt, 'onkeyup', function(e){
			dojo.removeClass('prompt', 'good');
			dojo.addClass('prompt', 'bad');
			if (e.keyCode == dojo.keys.ENTER){
				//update the session question
				session.question = prompt.value;
				dojo.removeClass('prompt', 'bad');
				dojo.addClass('prompt', 'good');
				self.database.updateOne({
					'query': {'_id': session._id},
					'data': {'question': prompt.value},
					'save': true
				});
			}
		});
		self.database.save();
		self.drawBoxes();
		self.pollAndUpdate();
	},
	drawBoxes: function(){
		var self = this;
		self.slots = [];
		var hi = dojo.byId('hi');
		dojo.empty('hi');
		hi.style.display = 'block';
		dojo.byId('content').style.padding = '0px';
		var height = ($('#content').height())/7-4;
		for (var i = 0; i < 7; i++){
			var holder = dojo.create( 'div', {
				'id': 'row',
				'class': 'row'
			}, hi);
			for (var j = 0; j < 3; j++){
				var plop = dojo.create( 'textArea', {
					id: i+""+j+'',
					value: "",
					'class': 'response'
				}, holder);
				plop.style.height = height+'px';
				self.slots.push(plop);
				self.firstEmpty = 0;
			}
		}
	},
	pollAndUpdate: function(){
		var self = this;
		function resize(slot){
			var text = slot.value;
			console.log(slot, text);
			var poop = dojo.create( 'div', {
				class: 'test',
				id: 'poop',
				innerHTML: text || 'l'
			}, 'hi');
			var desiredH = dojo.coords(slot).h;
			poop.style.fontSize = desiredH + 4 + 'px';	
			var curr = desiredH + 4;
			while (dojo.coords(poop).h > desiredH){
				curr -= .5;
				poop.style.fontSize = curr + 'px';	
			}
			slot.style.fontSize = curr + 'px';	
			dojo.destroy(poop);
		}
		for (var i = 0; i < self.session.responses.length; i++){
			var r = self.session.responses[i];
			if (self.slots[i].value != '' && self.slots[i].value != r){
				console.log('what do I do if I need to push that shit back?');
				resize(self.slots[i]);
			}
			else{
				if (r != ''){
					self.slots[i].value = r;
					resize(self.slots[i]);
				}
			}
		}
		self.database.fetchOne({
			query: {
				'name': self.session.name
			}
		}).then(function(session){
			self.session = session;
			setTimeout(dojo.hitch(self, self.pollAndUpdate), 1000);
		});
	},
	error: function(message){
		dojo.byId('hi').innerHTML = message
	}
});

dojo.ready(function() {
    var app = new duncan.Main();        
});