dojo.provide('duncan.Main');
dojo.require('dojo.parser');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.TextBox');

// adjust the namespace if you changed it in index.html; this widget serves
// as our main controller to do stuff across the whole app and kick off the
// app when the page loads
dojo.declare('duncan.Main', null, {
	constructor: function(){
		var self = this;
		self.frozen = false;
		//hook into database
		self.data = new duncan.Data(dojo.hitch(self, self.error));
		self.data.getData(dojo.hitch(self, self.drawInitialPortal));
	},
	drawInitialPortal: function(){		
		var self = this;
		var sessions = self.data.getSessionsForDisplay();
		self.checkCookies(dojo.hitch(self, function(){
			console.log('okay, we made it back into draw');
			dojo.empty('hi');
			var form = new duncan.Create('hi', function(name, code){
				self.createNewSession(name, code);
			});
			dojo.forEach(sessions, function(sesh){
				var form = new duncan.SeshForm(sesh[0], sesh[1], 'hi', function(){
					self.startActiveSession(sesh[0], sesh[1]);
				});
			});
		}));
	},
	createNewSession: function(name, code){
		var self = this;
		self.data.createNewSession(name, code, function(session){
			self.session = session;
		});
		self.go();
	},
	startActiveSession: function(name, code, f){
		var self = this;
		self.data.selectActiveSession(name, code, dojo.hitch(self, function(session){
			if (session){
				self.session = session;
				self.go();
			}
			else {
				console.log('the session wasnt good');
				f();
			}
		}));
	}, 
	go: function(){
		var self = this;
		self.drawSession();
		self.cookieMonster.setSession(self.session.name);
		self.data.pollActiveSession();
		self.pollAndUpdate();
	},
	drawSession: function(){
		var self = this;
		
		console.log(self.session.question);
		//draw header
		dojo.empty('headerContent');
		var question = dojo.create('input', {
			'id': 'question',
			'value': self.session.question,
		}, 'headerContent');
		dojo.connect(question, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				self.data.changeActiveQuestion(question.value);
			}
		});
		$("#question").watermark('Enter the question');
		var open = dojo.create('button', {
			'id': 'openbutton',
			'class': 'menu',
			'innerHTML': 'Open Session'
		}, 'headerContent');
		dojo.connect(open, 'onclick', function(e){
			self.open();
		});
		var freeze = dojo.create('button', {
			'id': 'freezebutton',
			'class': 'menu',
			'innerHTML': 'Freeze Question'
		}, 'headerContent');
		dojo.connect(freeze, 'onclick', function(e){
			self.freeze();
		});
		var wipe = dojo.create('button', {
			'id': 'wipebutton',
			'class': 'menu',
			'innerHTML': 'Wipe Responses'
		}, 'headerContent');
		dojo.connect(wipe, 'onclick', function(e){
			self.wipe();
		});
		var close = dojo.create('button', {
			'id': 'wipebutton',
			'class': 'menu',
			'innerHTML': 'Close Session'
		}, 'headerContent');
		dojo.connect(close, 'onclick', function(e){
			self.close();
		});
		
		//draw slots
		var h = Math.floor(($('#content').height()-2)/7);
		self.slots = [];
		var sloti = 0;
		dojo.empty('hi');
		for (var row = 0; row < 7; row++){
			var holder = dojo.create('div', {
				'class': 'row',
				'id': 'row'+row
			}, 'hi');
			holder.style.height = h + 'px';
			for (var col = 0; col < 3; col++){
				var slot = new duncan.Slot(sloti, 'row'+row);
				self.slots.push(slot);
				sloti += 1;
			}
		}
		self.updateSlots();
	},
	open: function(){ //extra needed - low priority
		//maybe some styling or something to show that it has been opened?  otherwise, the user may hit the button repeatedly, which would ruin everything
		var self = this;
		self.data.openActiveSession()
	},
	close: function(){
		var self = this;
		self.cookieMonster.deleteSession();
		self.data.closeActiveSession(function(){
			dojo.empty("content");
			dojo.byId("headerContent").innerHTML = "  Shoutout";
			var app = new duncan.Main();
		});
	},
	freeze: function(){ //extra needed - low priority
		var self = this;
		if (self.frozen == false){
			self.frozen = true;
			dojo.byId('freezebutton').innerHTML = "Unfreeze Question";
		}
		else {
			dojo.byId('freezebutton').innerHTML = "Freeze Question";
			self.frozen = false;
		}
	},
	wipe: function(){ 
		var self = this;
		self.data.wipeActiveResponses();
		self.updateSlots();
	},
	pollAndUpdate: function(){
		var self = this;
		self.session = self.data.active;
		self.updateSlots();
		setTimeout( dojo.hitch( self, self.pollAndUpdate ) , 1000 );
	},
	updateSlots: function(){ 
		var self = this;
		if (self.frozen == false){
			for (var i = 0; i < 21; i++){
				var name = 'r'+i;
				self.slots[i].update(self.session[name]['text']);
			}
		}
	},
	checkCookies: function(f){
		var self = this;
		self.cookieMonster = new duncan.cookie();
		var savedsesh = self.cookieMonster.getSession();
		if (savedsesh){
			self.savedsesh = savedsesh;
			console.log('i have a saved cookie', savedsesh);
			self.startActiveSession(savedsesh, 'cookied', f);
		}
		else { f(); }
	},
	error: function(message){
		console.log('error start', message);
		var self = this;
	}
});

dojo.declare("duncan.Data", null, {
	constructor: function(errorHandle){
		this.error = errorHandle;
	},
	getData: function(oncomp){
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
					self.sessions = items;
					oncomp();
				},
				onError: function(){
					self.error('Data error.');
				}
			});
		});	
	},
	getSessionsForDisplay: function(){
		var self = this;
		var out = [];
		dojo.forEach(self.sessions, function(sesh){
			out.push([sesh.name, sesh.code]);
		});
		return out;
	},
	selectActiveSession: function(name, code, f){
		var self = this;
		var good = false;
		dojo.forEach(self.sessions, function(sesh){
			if (sesh.name == name){
				self.active = sesh;
				f(sesh);
				good = true;
			}
		});
		if (!good){
			f(false);
		}
	},
	createNewSession: function(name, code, f){
		var self = this;
		var newsession = self.getBlankSession(name, code, "");
		self.active = newsession;
		self.database.newItem(newsession);
		self.database.save();
		f(newsession);
	}, 
	getBlankSession: function(name, code, question){
		return {
			active: true,
			name: name,
			code: code,
			question: question,
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
	},
	pollActiveSession: function(){
		var self = this;
		self.database.fetchOne({
			query: {
				'name': self.active.name
			}
		}).then(function(session){
			self.active = session;
			setTimeout( dojo.hitch( self, self.pollActiveSession ) , 1000 );
		});
	},
	openActiveSession: function(){ 
		var self = this;
		var dataval = self.getBlankSession(self.active.name, self.active.code, self.active.question);
		self.active = dataval;
		self.updateActiveInDatabase();
	},
	changeActiveQuestion: function(value){ 
		console.log('i know I want to change the active question to ', value);
		var self = this;
		self.active.question = value;
		self.updateActiveInDatabase();
	},
	wipeActiveResponses: function(){ 
		console.log('i know I want to wipe the responses');
		var self = this;
		for (var i = 0; i < 21; i++){
			var slot = 'r'+i;
			self.active[slot]['text'] = '';
		}
		self.updateActiveInDatabase();
	},
	closeActiveSession: function(f){ 
		var self = this;
		self.database.deleteOne({
			'query': {name: self.active.name},
			'save': true
		}).then(f);
	},
	updateActiveInDatabase: function(){
		var self = this;
		console.log('i want to push this home', self.active);
		var data = {
			name: self.active.name,
			active: self.active.active,
			question: self.active.question,
			code: self.active.code,
		}
		for (var i = 0; i < 21; i++){
			var slot = 'r' + i;
			data[slot] = {
				owner: self.active[slot].owner,
				text: self.active[slot].text,
				live: self.active[slot].live,
			}
		}
		self.database.putOne( {
			query: {'name':self.active.name},
			data: data,
			save: true
		});
	}
});

dojo.declare("duncan.cookie", null, {
	constructor: function(){
	},
	setSession: function(seshname){
		var self = this;
		dojo.cookie('session', seshname, {
			expires: self.get50min()
		});
	},
	getSession: function(){
		return dojo.cookie('session');
	},
	deleteSession: function(){
		dojo.cookie("session", "", {expire: -1});
	},
	get50min: function(){
		var date = new Date();
		date.setTime(date.getTime() + (50 * 60 * 1000));
		return date;
	}
});

dojo.declare("duncan.Create", null, {
	constructor: function(parent, submit){
		this.parent = parent;
		this.submit = submit;
		this.draw();
	}, 
	draw: function(){
		var self = this;
		var holder = dojo.create('div', {
			'class': "seshForm"
		}, self.parent);
		var words = dojo.create('input', {
			'id': "newSeshName",
		}, holder);
		dojo.connect(dojo.byId('newSeshName'), 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				self.submit($("#newSeshName").val(), input.value);
			}
		});
		holder.innerHTML += '<br>';
		var input = dojo.create('input', {
			'id': "newSeshCode",
		}, holder);
		dojo.connect(input, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				self.submit($("#newSeshName").val(), input.value);
			}
		});
		$('#newSeshName').watermark('Enter the name');
		$('#newSeshCode').watermark('Enter the code');
	}
});

dojo.declare("duncan.SeshForm", null, {
	constructor: function(name, code, parent, submit){
		this.name = name;
		this.code = code;
		this.parent = parent;
		this.submit = submit;
		this.draw();
	},
	draw: function(){
		var self = this;
		var holder = dojo.create('div', {
			'class': "seshForm"
		}, self.parent);
		var words = dojo.create('div', {
			'class': "seshName",
			'innerHTML': self.name
		}, holder);
		var input = dojo.create('input', {
			'class': "seshCode",
			'id': self.name
		}, holder);
		dojo.connect(input, 'keyup', function(e){
			if (e.keyCode == dojo.keys.ENTER){
				if (input.value == self.code){
					self.submit();
				}
			}
		});
		$('.seshCode').watermark('Enter the code');
	}
});

dojo.declare("duncan.Slot", null, {
	constructor: function(number, parent){
		this.number = number;
		this.parent = parent;
		this.draw();
	},
	draw: function(){
		var self = this;
		self.plop = dojo.create('textArea', {
			id: 'r'+self.number,
			value: "",
			'class': 'response'
		}, self.parent);
		self.plop.style.height = $('#'+self.parent).height()-4+'px';
		self.plop.style.width = Math.floor( ($('#'+self.parent).width()-8) / 3 )-2+'px';
	},
	update: function(response){
		this.plop.value = response;
	},
});

dojo.ready(function() {
    var app = new duncan.Main();        
});