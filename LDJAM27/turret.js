function Turret(parentmap) {
    var self = this;
    this.parentmap = parentmap;
    this.toptexture = PIXI.Texture.fromImage("turret/turret_top.png");
    this.basetexture = PIXI.Texture.fromImage("turret/turret_base.png");
    this.basespr = new PIXI.Sprite(this.basetexture);
    this.basespr.anchor = new PIXI.Point(0.5,0.5);
    this.topspr = new PIXI.Sprite(this.toptexture);
    this.topspr.anchor = new PIXI.Point(0.5,0.5);
    
    this.sprite = new PIXI.DisplayObjectContainer;
    this.sprite.addChild(this.basespr); this.sprite.addChild(this.topspr);
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
    this.turnspeed = 360;
    this.angle = 0;
    this.range = 3;
    
    this.ai = new TurretAI(this);
    
    this.grid_x = 0;
    this.grid_y = 0;
    
    this.ai.lookAt(-20);
    
    self.update = update;
    function update(delta) {
        self.ai.update(delta);
        self.topspr.rotation = self.angle/360*2*Math.PI;
    }
    
    self.shoot = shoot;
    function shoot(zombie) {
        alert("DIE!");
    }
}

function TurretAI(turret) {
    var self = this;
    this.parent = turret;
    this.targetAngle = 0;
    this.turning = false;
    this.firing = false;
    this.target = null;
    this.clockwise = true;
    this.lastTurnTime = new Date();
    this.turnEvery = 1500;
    
    self.correctAngle = correctAngle;
    
    self.lookAt = lookAt;
    // One argument for angle, two for grid coords
    function lookAt(location) {
        if (arguments.length == 1) self.targetAngle = location;
        else if(arguments.length == 2) 
            self.targetAngle = Math.atan2(arguments[0]-self.parent.grid_x,arguments[1]-self.parent.grid_y)/2/Math.PI*360;
        else return;
        
        self.clockwise = self.correctAngle(self.targetAngle - self.parent.angle) < 0;
        self.turning = true
    }
    
    self.lookAtAndShoot = lookAtAndShoot;
    function lookAtAndShoot(zombie) {
        self.lookAt(zombie.sprite.position.x/self.parent.parentmap.tilewidth,
                    zombie.sprite.position.y/self.parent.parentmap.tileheight);
        self.firing = true;
        self.target = zombie;
    }
    
    self.update = update;
    function update(delta) {
        self.turnStep(delta);
        if(!self.firing) {
            var target = self.findTarget(self.parent.range,self.parent.parentmap.zombies);
            if(target !== null) self.lookAtAndShoot(target);
        }
        
        var now = new Date();
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
                self.parent.angle = self.targetAngle;
                if (self.firing) {
                    self.parent.shoot(self.target);
                    self.firing = false;
                }
            }
            else {
                if(self.firing) self.lookAt(self.target.sprite.position.x/self.parent.parentmap.tilewidth,
                                            self.target.sprite.position.y/self.parent.parentmap.tileheight);
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
            var dist = Math.sqrt(Math.pow(list.entities[z].sprite.position.x/self.parent.parentmap.tilewidth-self.parent.grid_x,2),
                                 Math.pow(list.entities[z].sprite.position.y/self.parent.parentmap.tileheight-self.parent.grid_y,2));
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