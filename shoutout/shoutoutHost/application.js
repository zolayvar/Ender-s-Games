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
		//hook into database
		self.data = new duncan.Data(dojo.hitch(self, self.error));
		self.data.getData(dojo.hitch(self, self.drawInitialPortal));
		//check up on saved states
		self.checkCookies();
	},
	drawInitialPortal: function(){		
		var self = this;
		var sessions = self.data.getSessionsForDisplay();
		dojo.empty('hi');
		var form = new duncan.Create('hi', function(name, code){
			self.createNewSession(name, code);
		});
		dojo.forEach(sessions, function(sesh){
			var form = new duncan.SeshForm(sesh[0], sesh[1], 'hi', function(){
				self.startActiveSession(sesh[0], sesh[1]);
			});
		});
	},
	createNewSession: function(name, code){
		var self = this;
		self.data.createNewSession(name, code, function(session){
			self.session = session;
			console.log('created new session', self.session);
		});
		self.go();
	},
	startActiveSession: function(name, code){
		var self = this;
		self.data.selectActiveSession(name, code, function(session){
			self.session = session;
			console.log('joined active session', self.session);
		});
		self.go();
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
			console.log(holder);
			for (var col = 0; col < 3; col++){
				var slot = new duncan.Slot(sloti, 'row'+row);
				self.slots.push(slot);
				sloti += 1;
			}
		}
		self.updateSlots();
	},
	pollAndUpdate: function(){
		var self = this;
		if (self.data.active != self.session){
			self.session = self.data.active;
			self.updateSlots();
		}
		setTimeout( dojo.hitch( self, self.pollAndUpdate ) , 1000 );
	},
	updateSlots: function(){
		var self = this;
		
	},
	checkCookies: function(){
		var self = this;
		self.cookieMonster = new duncan.cookie();
		var savedsesh = self.cookieMonster.getSession();
		if (savedsesh){
			self.savedsesh = savedsesh;
			self.data.selectActiveSession(savedsesh, 'cookied');
		}
	},
	error: function(message){
		console.log('error start');
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
		dojo.forEach(self.sessions, function(sesh){
			if (sesh.name == name){
				self.active = sesh;
				f(sesh);
			}
		});
	},
	createNewSession: function(name, code, f){
		var self = this;
		var newsession = {
			active: true,
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
		f(newsession);
	}, 
	pollActiveSession: function(){
		var self = this;
		self.database.fetchOne({
			query: {
				'name': self.active.name
			}
		}).then(function(session){
			if (self.active != session){
				self.active = session;
			}
			setTimeout( dojo.hitch( self, self.pollActiveSession ) , 1000 );
		});
	},
	changeActiveQuestion: function(){
	
	},
	freezeActiveSession: function(){
	
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
		self.plop.style.width = Math.floor( ($('#'+self.parent).width()-2) / 3 )-3+'px';
	},
	update: function(response){
	
	},
});

dojo.ready(function() {
    var app = new duncan.Main();        
});