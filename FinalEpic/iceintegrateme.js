
dojo.declare("icegame", null, {
	constructor: function(x, y, w, h, f){
		this.xo = x;
		this.yo = y;
		this.w = w;
		this.h = h;
		worldAABB = new b2AABB();
		worldAABB.minVertex.Set(-1000, -1000);
		worldAABB.maxVertex.Set(2000, 2000);
		this.gravity = new b2Vec2(0, 0);
		this.doSleep = true;
		this.world = new b2World(worldAABB, this.gravity, this.doSleep);
		this.picbox = {};
		this.picbox.r = g.vis.r;
		console.log(this.picbox.r);
		this.outFunction = f;
		this.playing = true;
		this.el = [];
	},
	remove: function(){
		dojo.forEach(this.el, function(e){
			e.remove();
		});
	},
	setup: function(){
		console.log('inside the setup of the ice game');
		this.setupGraphics();
		this.step(1);
	},
	step: function(cnt) {
		var self = this;
		ig.world.Step(1.0/60, 1);
		setTimeout(function(){self.step(cnt||0)}, 10);
	},
	setupGraphics: function(){
		var h = this.h;
		var w = this.w;
		var picbox = this.picbox;
		picbox.initCracks = 1 + this.w * this.h / 70000;
		picbox.boxCracks = 0;
		picbox.crackPaths = this.makeCrackPaths();
		picbox.crack = new Array();
		for(var i = 0; i < picbox.initCracks; i++){
		  picbox.crack[i] = new crack(30+this.xo/10 + Math.floor(Math.random() * (this.w / 10 - 50)), Math.floor(Math.random() * (this.h / 10)));
		}
		picbox.goal = new goal();
		picbox.sled = new sled(80, h - h/6 - 40, 210, "8ebae5", 74, 73, 76, 75, w - w/10);
		picbox.sled2 = new sled(50, h - h/6 - 60, 210, "0000af", 65, 87, 68, 83, w/10);
		picbox.wall = new wall(w, h);
	},
	makeCrackPaths: function(){
		this.out = new Array();
		var out = this.out;
		out[0] = "m 0,0 -1.6415,-2.65165 2.27284,2.52538 0.50508,-1.26269 -0.50508,1.89403 0,1.6415 z"
		out[1] = "m 0,0 -0.75762,2.39911 1.51523,-2.39911 0,2.39911 -0.88388,2.02031 1.51523,-2.39912 -0.37881,-2.90418 1.89403,1.76776 -2.39911,-2.27284 2.14658,0.25254 -0.37881,-0.50508 -2.52538,-0.12627 -1.51523,-2.65165 1.38896,3.283 -2.52538,1.26269 2.77792,-0.88389 z"
		out[2] = "m 0,0 -1.76777,4.54569 2.02031,-3.6618 0.63134,5.17703 1.13643,-4.54569 -1.01016,2.39912 -0.12627,-4.16688 3.03046,-4.04061 -3.15673,3.40926 -0.3788,-7.07107 -1.89404,4.67196 1.51523,-2.27284 -0.75761,4.41941 -4.41942,-1.01015 z";
		out[3] = "m 0,0 -6.69226,1.6415 -2.65165,-1.26269 2.90419,0.75761 5.05076,-1.51523 -3.40927,-1.26269 3.40927,0.63135 -2.27284,-2.90419 2.65165,-4.67195 -1.6415,4.16687 2.52538,3.283 1.01015,-3.283 0,-3.78807 1.01015,3.91434 -1.13642,3.15673 4.04061,-1.76777 2.39912,-5.3033 -1.38896,5.93465 -4.67196,1.76777 4.92449,0.25253 3.283,3.91434 -3.53553,-3.03045 -4.54569,-0.37881 3.78807,2.52538 0.25254,5.17703 -1.38896,-4.79822 -3.15673,-2.77792 1.26269,3.53553 -3.53553,2.39912 4.79822,2.52538 -5.80837,-2.39912 3.40926,-2.65165 z"
		out[4] = "m 0,0 -4.41942,10.35406 3.78807,-10.9854 -7.57614,2.65165 0.75761,5.55584 -1.76776,-6.43973 6.31345,-1.51523 0,-2.39911 -5.3033,-4.29315 5.55584,3.78808 0.37881,2.39911 1.76776,-1.01016 -2.39911,-6.94479 3.6618,-3.03046 -2.77792,3.03046 1.89404,6.69226 4.29315,-5.3033 -0.25254,-5.17704 1.26269,5.17704 -4.41942,5.55583 6.9448,-3.03045 4.54569,-4.41942 -4.04061,5.17703 -6.18719,2.52538 5.80838,0.50508 3.40927,4.54569 -3.78808,-3.78808 -5.80837,-0.50507 4.54568,4.54568 -0.3788,2.90419 3.15672,3.78807 -4.04061,-3.28299 0.25254,-3.15673 z";
		out[5] = "m 0,0 -5.55584,4.41941 -6.9448,-0.88388 6.69226,-0.12627 4.54569,-3.78807 -11.61676,-1.13642 11.86929,0.3788 -5.80837,-9.59645 4.54568,-3.40926 -3.28299,3.53553 5.42957,8.96511 1.76776,-14.39468 -1.26269,14.64722 3.91434,-8.71257 5.93465,-0.37881 -5.42957,0.88389 -3.28299,8.83883 11.11167,-5.42957 6.56599,3.6618 -6.43972,-2.77792 -10.22779,4.9245 4.54568,6.31345 5.42957,-1.01015 0.63135,-4.29315 0.12627,4.92449 -6.56599,1.2627 -4.9245,-5.93465 1.89404,11.23795 z";
		out[6] = "m 0,0 -10.73287,-3.283 -4.9245,-8.33376 5.55584,7.44988 10.48034,3.03046 -6.9448,-15.65737 7.07106,14.26841 4.54569,-12.12183 7.19734,-1.76777 -6.56599,2.52538 -2.77792,12.50064 12.50063,-12.12183 6.06092,1.13642 -5.55584,-0.12627 -13.76333,13.25825 11.86929,-4.04061 -10.6066,4.29315 20.58186,-4.29315 -22.22335,5.68211 7.44987,2.52538 2.77792,9.09138 -3.6618,-8.5863 -7.57615,-3.15673 -2.27284,8.33376 2.14657,-9.34391 -10.35406,10.48033 4.67196,0.75762 -5.55584,-0.50508 z";
		return out;
	},
	makeSledBody: function(startX, startY, startRot){
		var points = [[-15,-5], [15,-5], [10,5], [-10,5]];
		var polySd = new b2PolyDef();
		startRot = startRot * Math.PI / 180;
			polySd.vertexCount = points.length;
			for (var i = 0; i < points.length; i++) {
			  polySd.vertices[i].Set(points[i][0], points[i][1]);
			}
			polySd.density = 0.5;
			polySd.restitution = 1.0;
			polySd.friction = 0.0;

		var bodies = new Array();
			var prevBody;
			var prevX = 0;
			var prevY = 0;

			for (var i = 0; i < 5; i++){
			  var polyBd = new b2BodyDef();
		  var xMod = 14 * Math.sin(startRot) * i;
		  var yMod = 14 * Math.cos(startRot) * i;
			  polyBd.AddShape(polySd);
			  polyBd.position.Set(startX + xMod, startY - yMod);
		  polyBd.rotation = startRot;
		  polyBd.linearDamping = .02;
		  polyBd.angularDamping = .026;
		  var polyBody = ig.world.CreateBody(polyBd);
		  if (i == 4){
			polySd.density = 1.0;
		  }

		  bodies[i] = polyBody;

		  if (i > 0){
			   var jointDef = new b2RevoluteJointDef();
		   jointDef.collideConnected = true;
			   jointDef.anchorPoint.Set(prevX, prevY);
			   jointDef.body1 = prevBody;
			   jointDef.body2 = polyBody;
			   joint = ig.world.CreateJoint(jointDef);
			  }

			  prevX = startX + xMod;
			  prevY = startY - yMod;
			  prevBody = polyBody;
			}
		 return bodies;
	}
});

	dojo.declare("sled", null, {
		constructor: function(origX, origY, origRot, color, leftKey, upKey, rightKey, downKey, scoreX){
			var self = this;
			self.bodies = ig.makeSledBody(origX+ig.xo, origY+ig.yo, origRot);
			self.right = false;
			self.left = false;
			self.up = false;
			self.path = "M-15 -5 L15 -5 L10 5 L-10 5 Z";
			self.safe = false;
			self.x = new Array()
			self.y = new Array()
			self.pic = new Array();
			self.rot = new Array();
			self.playing = true;
			for(var i = 1; i < 6; i++){
				self.x[i] = self.bodies[i - 1].m_position.x;
				self.y[i] = self.bodies[i - 1].m_position.y;
			}
			self.draw(color, scoreX);
			dojo.connect(null, 'onkeydown', function(e){
				if (e.keyCode == rightKey){
					self.right = true;
				}
				else if (e.keyCode == leftKey){
					self.left = true;
				}
				else if (e.keyCode == upKey){
					self.up = true;
				}
				else if (e.keyCode == downKey){
					self.down = true;
				}
			});
			dojo.connect(null, 'onkeyup', function(e){
				if (e.keyCode == rightKey){
					self.right = false;
				}
				else if (e.keyCode == leftKey){
					self.left = false;
				}
				else if (e.keyCode == upKey){
					self.up = false;
				}
				else if (e.keyCode == downKey){
					self.down = false;
				}
			});
			var a = ig.picbox.r.text(scoreX+ig.xo, ig.h/10, "");
			ig.el.push(a);
			self.pic[0] = a;
			self.pic[0].attr({fill: color, "font-size": 32});
			self.pic[0].attr({text: String.fromCharCode(leftKey) + ", " + String.fromCharCode(upKey) + ", " + String.fromCharCode(downKey) + ", " + String.fromCharCode(rightKey)});
			setInterval(dojo.hitch(this,self.update), 15);
		},
		draw: function(color, scoreX){
			var self = this;
			for(var i = 1; i <= 5; i++){
				var pic = ig.picbox.r.path(self.path);
				ig.el.push(pic);
				pic.attr({fill: color});
				pic.rotate(self.bodies[i - 1].GetRotation());
				x = self.bodies[i - 1].m_position.x;
				y = self.bodies[i - 1].m_position.y;
				self.rot[i] = self.bodies[i - 1].GetRotation();
				pic.translate(x, y);
				self.pic[i] = pic;
			}
		},
		update: function(){
			var self = this;
			if(self.playing && ig.playing){
				for(var i = 0; i < 4; i++){
					self.bodies[i].WakeUp();
				}
				if(self.up){
					for(var i = 0; i < 4; i++){
						self.bodies[i].ApplyForce(new b2Vec2(-70000 * Math.sin(self.bodies[i].GetRotation()), Math.cos(self.bodies[i].GetRotation()) * 70000), self.bodies[i].GetCenterPosition());
					}
				}
				if(self.down){
					for(var i = 0; i < 4; i++){
						self.bodies[i].ApplyForce(new b2Vec2(30000 * Math.sin(self.bodies[i].GetRotation()), Math.cos(self.bodies[i].GetRotation()) * -30000), self.bodies[i].GetCenterPosition());
					}
				}
				if(self.right){
					self.bodies[0].ApplyTorque(1000000);
				}
				if(self.left){
					self.bodies[0].ApplyTorque(-1000000);
				}
				for(var i = 1; i <= 5 ; i++){
					//console.log(self.bodies[i - 1].m_position.x - self.x[i], self.bodies[i - 1].m_position.y - self.y[i]);
					self.pic[i].translate(self.bodies[i - 1].m_position.x - self.x[i], self.bodies[i - 1].m_position.y - self.y[i]);
					self.x[i] = self.bodies[i - 1].m_position.x;
					self.y[i] = self.bodies[i - 1].m_position.y;
					var x = self.x[i];
					var y = self.y[i];
					this.pic[i].rotate(self.bodies[i - 1].m_rotation * 180 / Math.PI - self.rot[i]);
					self.rot[i] = self.bodies[i - 1].m_rotation * 180 / Math.PI;
					for(var c = 0; c < ig.picbox.boxCracks; c++){
					  var x2 = ig.picbox.crack[c].x * 10;
					  var y2 = ig.picbox.crack[c].y * 10;
					  var d = Math.sqrt(Math.pow((x2 - x),2) + Math.pow((y2 - y),2));
					  if(d < 180){
						if(ig.picbox.crack[c].strength == 70){
							ig.picbox.crack[c].strength -= 2;
						}
						else if(Math.abs(ig.picbox.crack[c].strength - 20) < 1){
							var k = ig.picbox.boxCracks;
							ig.picbox.crack[ig.picbox.boxCracks] = new crack((x2 / 10 + x)/11, (y2 / 10 + y)/11);
							ig.picbox.crack[c].strength -= 2;
						}
						if(d < 120 && ig.picbox.crack[c].strength > 0){
							ig.picbox.crack[c].strength -= Math.pow((120 - d),1.4) * .0003;
						}
						if(d < 60 - ig.picbox.crack[c].strength){
							 ig.picbox.crack[c].strength = 0;
							 for(var i = 0; i < 6; i++){
							self.pic[i].attr({fill:"none",stroke:"none"});
							 }
							 var a = ig.picbox.r.path(ig.picbox.crackPaths[5]);
							 ig.el.push(a);
							 self.pic = a;
							 self.pic.toBack();
							 self.pic.translate(self.x[2], self.y[2]);
							 self.pic.scale(9);
							 self.pic.rotate(Math.random() * 180);
							 self.pic.attr({fill: "#88aaff", stroke: "none"});
							 self.playing = false;
						}
					  }
					}
					if(x > ig.w + ig.xo - 110){
					  self.safe = true;
					}
					else{
					  self.safe = false;
					}
				}
			}
		}
	});

	dojo.declare("crack", null, {
						constructor: function(x, y){
								var self = this;
			self.strength = 70;
			self.x = x;
			self.y = y;
			self.nextCrack = 2;
			self.pic = new Array();
			self.cracks = 0;
								self.draw();
			ig.picbox.boxCracks++;
			setInterval(dojo.hitch(this,self.update), 15);
						},
						draw: function(){
								var self = this;
								//self.x = 30 + Math.floor(Math.random() * (dojo.window.getBox().w / 10 - 50));
								//self.y = Math.floor(Math.random() * (dojo.window.getBox().h / 10));
						},
		update: function(){
			var self = this;
			if (ig.playing){
			if ((70-self.strength) > self.nextCrack){
				if(self.cracks < 7){
				var a = ig.picbox.r.path(ig.picbox.crackPaths[self.cracks]).toFront();
				ig.el.push(a);
				self.pic[self.cracks] = a;
				self.pic[self.cracks].translate(self.x * 10, self.y * 10);
				self.pic[self.cracks].rotate(Math.random() * 180);
				self.pic[self.cracks].scale(5.0 + self.cracks / 4);
				self.pic[self.cracks].attr({fill: "#88aaff", stroke: "none"});
				self.pic[self.cracks].toBack();
				//self.back.toBack();
				self.cracks++;
				self.nextCrack += 3 + self.cracks * .7;
				}
			}
			}
		}
	});

	dojo.declare("goal", null, {
						constructor: function(){
								var self = this;
			self.pic = new Array();
								var a = ig.picbox.r.rect(100+ig.xo, ig.yo, 1, ig.h);
								ig.el.push(a);
								self.pic[0] = a;
								self.pic[0].attr({fill: '000000'});
								var a = ig.picbox.r.rect(ig.w- 100+ig.xo, ig.yo, 1, ig.h);
								ig.el.push(a);
								self.pic[1] = a;
								self.pic[1].attr({fill: '000000'});
								self.draw();
			setInterval(dojo.hitch(this,self.update), 15);
						},
						draw: function(){
								var self = this;
								self.x = ig.w;
								self.y = Math.floor(Math.random() * (ig.h / 10));
						},
		update: function(){
			if (ig.playing){
			if((ig.picbox.sled.safe || !ig.picbox.sled.playing) && (ig.picbox.sled2.safe || !ig.picbox.sled2.playing)){
			  ig.playing = false;
			
			if(ig.picbox.sled.safe && ig.picbox.sled2.safe){ //todo - you can change these messages if you want, their not particularly creative i guess
						 //or if you want to make the effects more specific, like losing sled dogs that's cool, I just figured
									 //these would be easy to implement
				ig.outFunction("You made it across the ice without losing any team members!", function(){});
			}
			else if(ig.picbox.sled.safe && !ig.picbox.sled2.safe || ig.picbox.sled2.safe && !ig.picbox.sled.safe){
				ig.outFunction("You lost a team member while attempting to cross the ice!", function(){g.team.killVictim();});
			}
			else{
				ig.outFunction("You lost a team member while attempting to cross the ice!", function(){g.team.killVictim();});
			}
		}}
		}
				});

dojo.declare("wall", null, {
	constructor: function(x, y){
		var points = [[[ig.xo, ig.yo], [-5+ig.xo, -5+ig.yo], [x + 5+ig.xo, -5+ig.yo], [x+ig.xo, 0+ig.yo]],
				  [[x+ig.xo, ig.yo], [x + 5+ig.xo, -5+ig.yo], [x + 5+ig.xo, y + 5+ig.yo], [x+ig.xo, y+ig.yo]],
				  [[x+ig.xo, y+ig.yo], [x + 5+ig.xo, y + 5+ig.yo], [-5+ig.xo, y + 5+ig.yo], [0+ig.xo, y+ig.yo]],
				  [[0+ig.xo, y+ig.yo], [-5+ig.xo, y + 5+ig.yo], [-5+ig.xo, -5+ig.yo], [0+ig.xo, 0+ig.yo]]];
		var polySd = new Array();
		var polyBd = new b2BodyDef();
		for( var i = 0; i < 4; i++){
			polySd[i] = new b2PolyDef();
			polySd[i].vertexCount = points[i].length;
			polySd[i].localRotation = 0;
				polySd[i].localPosition = new b2Vec2(0, 0);
				polySd[i].density = 999;
			for(var v = points[i].length - 1; v >= 0; v--){
				polySd[i].vertices[v].Set(points[i][v][0], points[i][v][1]);
			}
			polyBd.AddShape(polySd[i]);
		}
		polyBd.position.Set(0,0);
		ig.world.CreateBody(polyBd);
	},
});