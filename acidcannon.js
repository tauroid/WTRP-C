AcidCannon = function(context,ngrid_x,ngrid_y) {
    this.ngrid_x = ngrid_x;
    this.ngrid_y = ngrid_y;
    this.angularSpeed = 2;
    // TODO
    //  - Cannon sprite
    //  - Update routine
    this.context = context;
    this.inactiveTargets = [];
    this.activeTargets = [];
    this.projectiles = [];
    this.firing = false;
    this.rechargetime = 500;
    this.lastfiretime = new Date;
    
    this.basespr = new PIXI.Sprite(PIXI.Texture.fromImage(gameDir+"acidcannon/cannon_base.png"));
    this.topspr = new PIXI.Sprite(PIXI.Texture.fromImage(gameDir+"acidcannon/cannon_top.png"));
    this.basespr.position.x = (this.ngrid_x+0.5)*this.context.map.tilewidth;
    this.basespr.position.y = (this.ngrid_y+0.5)*this.context.map.tileheight;
    this.basespr.anchor = new PIXI.Point(0.5,0.5);
    this.topspr.position.x = (this.ngrid_x+0.5)*this.context.map.tilewidth;
    this.topspr.position.y = (this.ngrid_y+0.5)*this.context.map.tileheight;
    this.topspr.anchor = new PIXI.Point(0.5,0.5);
    this.sprite = new PIXI.DisplayObjectContainer;
    this.sprite.addChild(this.basespr);
    this.sprite.addChild(this.topspr);
}

AcidCannon.prototype.constructor = AcidCannon;

AcidCannon.prototype.update = function(delta) {
    if(!this.firing &&
       this.activeTargets[0] &&
       new Date - this.lastfiretime > this.rechargetime) this.fireAtNextTarget();
}

AcidCannon.prototype.addTarget = function(ngrid_x,ngrid_y) {
    var target = new AcidTarget(ngrid_x,ngrid_y,this.context);
    this.context.animators.add(new ValueAnimator(function(value) {
        target.sprite.scale.x = value;
        target.sprite.scale.y = value;
    },2,1,200));
    this.activeTargets.push(target);
    this.context.map_DO.addChild(target.sprite);
}

AcidCannon.prototype.fireAtNextTarget = function() {
    var target = this.activeTargets[0];
    var targetAngle = Math.atan2(target.ngrid_x-this.ngrid_x,this.ngrid_y-target.ngrid_y);
    var angleDiff = targetAngle - this.topspr.rotation;
    if(angleDiff % Math.PI*2 > Math.PI) 
        angleDiff = (angleDiff % Math.PI*2) - Math.PI*2;
    else if(angleDiff % Math.PI*2 < -Math.PI) 
        angleDiff = (angleDiff % Math.PI*2) + Math.PI*2;

    var self = this;
    var valueanim = new ValueAnimator(function(value) { self.topspr.rotation = value; },
                                  this.topspr.rotation,
                                  this.topspr.rotation+angleDiff,
                                  Math.abs(angleDiff)*1000/this.angularSpeed);
    self.inactiveTargets.push(target);
    self.activeTargets.splice(0,1);
    target = self.inactiveTargets[self.inactiveTargets.length-1];
                                  
    valueanim.setFinishCallback(function() {
        var spray = new AcidSpray(self.context);
        spray.sprite.rotation = targetAngle;
        self.context.map_DO.addChild(spray.sprite);
        var sprayanim = new ValueAnimator(function(tween) {
                // Confused yet? :):):)
                spray.sprite.position.x = ((target.ngrid_x-self.ngrid_x)*
                    tween+self.ngrid_x+0.5)*self.context.map.tilewidth;
                spray.sprite.position.y = ((target.ngrid_y-self.ngrid_y)*
                    tween+self.ngrid_y+0.5)*self.context.map.tileheight;
            },0,1,500);
              
        self.firing = false;
        self.lastfiretime = new Date;
        
        sprayanim.setFinishCallback(function() {
            if(self.inactiveTargets[0]) {
                self.context.map_DO.removeChild(self.inactiveTargets[0].sprite);
                self.inactiveTargets.splice(0,1);
            }
            spray.land(target.ngrid_x,target.ngrid_y);
        });
        self.context.animators.add(sprayanim);                            
    });
    
    this.context.animators.add(valueanim);
    this.firing = true;
}

AcidCannon.prototype.removeTarget = function(index) {
    this.context.map_DO.removeChild(this.targets[index].sprite);
    this.targets.splice(index,1);
}

AcidTarget = function(ngrid_x,ngrid_y,context) {
    this.context = context;
    this.ngrid_x = ngrid_x;
    this.ngrid_y = ngrid_y;
    this.sprite = new PIXI.Sprite(AcidTarget.texture);
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
    if(this.context) {
        this.sprite.position.x = (this.ngrid_x+0.5)*this.context.map.tilewidth;
        this.sprite.position.y = (this.ngrid_y+0.5)*this.context.map.tileheight;
    }
}

AcidTarget.prototype.constructor = AcidTarget;

AcidTarget.texture = PIXI.Texture.fromImage(gameDir+"acidcannon/target.png");

AcidSpray = function(context) {
    this.context = context;
    //this.projspd = 10;
    this.projspr = new PIXI.Sprite(AcidSpray.projtex);
    this.sprayspr = new PIXI.Sprite(AcidSpray.spraytex);
    this.sprite = this.projspr;
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
}

AcidSpray.prototype.constructor = AcidSpray;

AcidSpray.projtex = PIXI.Texture.fromImage(gameDir+"acidcannon/acid_projectile.png");
AcidSpray.spraytex = PIXI.Texture.fromImage(gameDir+"acidcannon/spray.png");

AcidSpray.prototype.land = function(ngrid_x,ngrid_y) {
    this.context.map_DO.removeChild(this.sprite);
    this.sprite = this.sprayspr;
    this.ngrid_x = ngrid_x;
    this.ngrid_y = ngrid_y;
    this.sprite.position = new PIXI.Point((this.ngrid_x+0.5)*this.context.map.tilewidth,
                                           (this.ngrid_y+0.5)*this.context.map.tileheight);
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
    this.context.map.acidspray.add(this);
    this.context.map_DO.addChild(this.sprite);
}
