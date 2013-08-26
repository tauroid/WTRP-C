function Turret(context) {
    var self = this;
    this.context = context;
    this.toptexture = PIXI.Texture.fromImage("turret/turret_top.png");
    this.basetexture = PIXI.Texture.fromImage("turret/turret_base.png");
    this.mflaretexture = PIXI.Texture.fromImage("turret/muzzleflare.png");
    this.basespr = new PIXI.Sprite(this.basetexture);
    this.basespr.anchor = new PIXI.Point(0.5,0.5);
    this.topspr = new PIXI.Sprite(this.toptexture);
    this.topspr.anchor = new PIXI.Point(0.5,0.5);
    this.mflarespr = new PIXI.Sprite(this.mflaretexture);
    this.mflarespr.anchor = new PIXI.Point(0.5,1+this.basespr.height/2/this.mflarespr.height);
    
    this.mflaretime = 150;
    this.mflareactive = false;
    
    this.sprite = new PIXI.DisplayObjectContainer;
    this.sprite.addChild(this.basespr); this.sprite.addChild(this.topspr);
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
    this.turnspeed = 360;
    this.angle = 0;
    this.range = 5;
    
    this.ai = new TurretAI(this);
    
    this.grid_x = 0;
    this.grid_y = 0;
    
    this.ai.lookAt(170);
    
    self.update = update;
    function update(delta) {
        var now = new Date();
        self.ai.update(delta);
        self.topspr.rotation = self.angle/360*2*Math.PI;
        
        self.updateMFlare(now);
    }
    
    self.shoot = shoot;
    function shoot(zombie) {
        zombie.takeDamage(4);
    }
    
    self.updateMFlare = updateMFlare;
    function updateMFlare(now) {
        self.mflarespr.rotation = self.angle/360*2*Math.PI;
        if(now - self.ai.lastShotTime <= self.mflaretime && !self.mflareactive && self.ai.ready) {
            self.mflareactive = true;
            self.sprite.addChild(self.mflarespr);
        }
        if(now - self.ai.lastShotTime > self.mflaretime && self.mflareactive) {
            self.mflareactive = false;
            self.sprite.removeChild(self.mflarespr);
        }
    }
}

function TurretAI(turret) {
    var self = this;
    this.parent = turret;
    this.targetAngle = 0;
    this.turning = false;
    this.firing = false;
    this.shootDelay = 1000;
    this.lastShotTime = null;
    this.target = null;
    this.clockwise = true;
    this.lastTurnTime = new Date();
    this.turnEvery = 1500;
    this.ready = false;
    
    self.correctAngle = correctAngle;
    
    self.lookAt = lookAt;
    // One argument for angle, two for grid coords
    function lookAt(location) {
        if (arguments.length == 1) self.targetAngle = location;
        else if(arguments.length == 2) 
            self.targetAngle = Math.atan2(arguments[0]-self.parent.grid_x,self.parent.grid_y-arguments[1])/2/Math.PI*360;
        else return;
        
        self.clockwise = self.correctAngle(self.targetAngle - self.parent.angle) < 0;
        self.turning = true
    }
    
    self.lookAtAndShoot = lookAtAndShoot;
    function lookAtAndShoot(zombie) {
        self.lookAt(zombie.sprite.position.x/self.parent.context.map.tilewidth,
                    zombie.sprite.position.y/self.parent.context.map.tileheight);
        self.firing = true;
        self.target = zombie;
    }
    
    self.update = update;
    function update(delta) {
        self.turnStep(delta);
        
        var now = new Date();
        if(!self.firing && self.ready && (now - self.lastShotTime > this.shootDelay || self.lastShotTime == null)) {
            var target = self.findTarget(self.parent.range,self.parent.context.map.zombies);
            
            if(target !== null) { 
                self.lookAtAndShoot(target);
            }
        }
        
        if (now - self.lastTurnTime > self.turnEvery && !self.firing) {
            self.lastTurnTime = now;
            self.lookAt(Math.random() * 360);
        }
    }
    
    self.turnStep = turnStep;
    function turnStep(delta) {
        if(self.turning) {
            var ts = self.parent.turnspeed;
            var nextAngle = self.parent.angle + (self.clockwise ? -1 : 1)*ts*delta/1000;
            
            if (Math.abs(self.correctAngle(self.targetAngle-nextAngle)) <= ts/2*delta/1000) {
                self.turning = false;
                var now = new Date();
                self.lastTurnTime = now;
                self.parent.angle = self.targetAngle;
                if(!self.ready) self.ready = true;
                if (self.firing) {
                    if (distance(self.parent.grid_x,
                                self.parent.grid_y,
                                self.target.sprite.position.x/self.parent.context.map.tilewidth,
                                self.target.sprite.position.y/self.parent.context.map.tileheight)
                        <= self.parent.range) {
                        self.parent.shoot(self.target);
                        self.lastShotTime = now;
                    }
                    self.firing = false;
                }
            }
            else {
                if(self.firing) self.lookAt(self.target.sprite.position.x/self.parent.context.map.tilewidth,
                                            self.target.sprite.position.y/self.parent.context.map.tileheight);
                self.parent.angle = nextAngle;
            }
        }
    }
    
    function correctAngle(angle) {
        return Math.abs(angle % 360) > 180 ? 
            (angle % 360 > 0 ? (angle % 360) - 360 : (angle % 360) + 360) : angle % 360;
    }
    
    self.findTarget = findTarget;
    function findTarget(range,list) {
        var inRange = [];
        
        for(var z in list.entities) {
            var dist = distance(self.parent.grid_x,
                                self.parent.grid_y,
                                list.entities[z].sprite.position.x/self.parent.context.map.tilewidth,
                                list.entities[z].sprite.position.y/self.parent.context.map.tileheight);
            if(dist <= self.parent.range) {
                inRange.push([list.entities[z],dist]);
            }
        }
        
        if(inRange.length == 1) return inRange[0][0];
        else if(inRange.length > 1) {
            var nearest = inRange[0];
            for(var z in inRange.slice(1,inRange.length)) {
                if(inRange[z][1] < nearest[1]) nearest = inRange[z];
            }
            return nearest[0];
        }
        else return null;
    }
}