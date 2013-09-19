function zombie(context,pos0_x,pos0_y) {
    var self = this;
    this.context = context;
    //this.image = "zombies/scaryzombie.png";
    //this.texture = PIXI.Texture.fromImage(this.image);
    
    this.vel_x = 10;
    this.vel_y = 10;
    this.max_speed = 80;
    this.health = 10;
    this.animations = {};
    
    this.loadSpriteSheets();
    
    this.sprite = this.animations.forwards;
    this.sprite.animationSpeed = 0.25;
    
    this.born = new Date();
    
    this.clsarray = getCollidableArray(map1).array;
    this.basearray = getBaseArray(map1).array;
    this.acidarray = getAcidArray(map1).array;

    this.sprite.position = new PIXI.Point(pos0_x,pos0_y);
    this.obstructed = { c00: false,
                        c01: false,
                        c10: false,
                        c11: false,
                      };
    this.winning = false;
    this.dead = false;
    
    self.update = update;
    function update(delta) {
        if(!self.dead){
            if(self.health <= 0) self.die("turret");
            if(new Date() - self.born > 10000) self.die("old");
        }
        if(self.winning) return;
        //self.clsarray = getCollidableArray(map1).array;
        //self.basearray = getBaseArray(map1).array;
        
        self.move(delta);
        
        self.setCorrectAnimation();
        self.updatePosition(delta);
    }
    
    self.giveGridRefX = giveGridRefX;
    
    self.giveGridRefY = giveGridRefY;
    
    //self.moveToGrid = moveToGrid;
    
    self.move = move;
    
    self.moveTowardGoal = moveTowardGoal;
    
    self.checkObstructions = checkObstructions;
    
    self.setCorrectAnimation = setCorrectAnimation;
    
    //give a refference to the x position of the sprite in terms of grid refference
    
    function giveGridRefX(){
        return self.sprite.position.x/self.context.map.tilewidth;
    }
    //give a refference to the y position of the sprite in terms of grid refference
    
    function giveGridRefY(){
        return self.sprite.position.y/self.context.map.tileheight;
    }
    
    /* Sorry Jon
    
    function moveToGrid(new_grid_x,new_grid_y){
        if (new_grid_x>self.giveGridRefX()){
            self.sprite.position.x += self.vel_x;}
        else if(new_grid_x<self.giveGridRefX()){
            self.sprite.position.x -= self.vel_x;}
        
        if (new_grid_y>self.giveGridRefY()){
            self.sprite.position.y += self.vel_y;}
        else if (new_grid_y>self.giveGridRefY()){
            self.sprite.position.y -= self.vel_y;}
    }*/
    function move(delta) {
        var vel_x_old = self.vel_x;
        var vel_y_old = self.vel_y;
        
        self.moveTowardGoal(10,19);
        self.checkObstructions(delta);
        
        var ngrid_x = Math.floor((self.grid_x0+self.grid_x1)/2);
        var ngrid_y = Math.floor((self.grid_y0+self.grid_y1)/2);
        if(self.acidarray[ngrid_y*self.context.map.width+ngrid_x] == 1)
            self.max_speed = 30;
        else self.max_speed = 80;
        
        var obstructedCorners = (self.obstructed.c00 ? 1 : 0) +
                                (self.obstructed.c01 ? 1 : 0) +
                                (self.obstructed.c10 ? 1 : 0) +
                                (self.obstructed.c11 ? 1 : 0);
        
        if (obstructedCorners == 1) {
            if (self.obstructed.c10) {
                if (self.ngrid_x1-self.grid_x0 > self.grid_y1 - self.ngrid_y1) {
                    self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                    self.vel_y = 0;
                    self.vel_x = self.max_speed;
                } else {
                    self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                    if (self.vel_x < 0) {
                        self.vel_x = 0;
                        self.vel_y = self.max_speed;
                    }
                }
            } else if (self.obstructed.c11) {
                if (self.grid_x1 - self.ngrid_x1 > self.grid_y1 - self.ngrid_y1) {
                    self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                    self.vel_y = 0;
                    self.vel_x = -self.max_speed;
                } else {
                    self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                    if (self.vel_x > 0) {
                        self.vel_x = 0;
                        self.vel_y = self.max_speed;
                    }
                }
            }
        }
        
        if (obstructedCorners == 2) {
            if (self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                self.vel_y = 0;
                self.vel_x = (vel_x_old > 0 ? 1 : -1)*self.max_speed;
            } else if (self.obstructed.c00 && self.obstructed.c10) {
                self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                if (self.vel_x < 0) {
                    self.vel_x = 0;
                    self.vel_y = self.max_speed;
                }
            } else if (self.obstructed.c01 && self.obstructed.c11) {
                self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                if (self.vel_x > 0) {
                    self.vel_x = 0;
                    self.vel_y = self.max_speed;
                }
            }
        }
        
        if(obstructedCorners == 3) {
            if (self.obstructed.c00 && self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                self.vel_y = 0;
                self.vel_x = self.max_speed;
            } else if (self.obstructed.c01 && self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                self.vel_y = 0;
                self.vel_x = -self.max_speed;
            }
        }
        
                /*var direction = 0;
                var r = 1;
                var l = 1;
                while ( (self.clsarray[(self.ngrid_y)*self.context.map.width+self.ngrid_x+r] == 1 ||
                         self.clsarray[(self.ngrid_y+1)*self.context.map.width+self.ngrid_x+r] == 1) &&
                       self.ngrid_x + r < self.context.map.width) ++r;
                while ( (self.clsarray[(self.ngrid_y)*self.context.map.width+self.ngrid_x-l] == 1 ||
                         self.clsarray[(self.ngrid_y+1)*self.context.map.width+self.ngrid_x-l] == 1) &&
                       self.ngrid_x - l >= 0) ++l;
                if(r<l && self.ngrid_x+r < self.context.map.width-1) direction = 1;
                else if(l<r && self.ngrid_x+l > 0) direction = -1;
                */
    }
    
    function moveTowardGoal(x_goal,y_goal){
        
        /* Sorry :(
        
        var x_dir, y_dir, temp_x_dir, temp_y_dir, top; // 0 if equal to goal, 1 if greater, -1 if less
        if (giveGridRefX()<x_goal){
            x_dir = 1
        }
        
        else if (giveGridRefX()>x_goal){
            x_dir = -1
        }
        else{
            x_dir = 0
        }
        
        if (giveGridRefY()<y_goal){
            y_dir = 1
        }
        
        else if (giveGridRefY()>y_goal){
            y_dir = -1
        }
        else{
            y_dir = 0;
        } */
        var vel = { x: x_goal - self.giveGridRefX() - 0.5, y: y_goal - self.giveGridRefY() - 0.5 };
        self.normaliseVelocity(vel);
        if(self.vel_x != vel.x) self.vel_x = vel.x;
        if(self.vel_y != vel.y) self.vel_y = vel.y;
            
        //alert(Math.floor(self.sprite.position.x/32)+" "+Math.floor(self.sprite.position.y/32));
        //alert(grid_x+" "+grid_y);
    }

    function checkObstructions(delta) {
        self.grid_x0 = self.giveGridRefX() + 0.1 + delta*self.vel_x/1000/self.context.map.tilewidth;
        self.grid_y0 = self.giveGridRefY() + delta*self.vel_y/1000/self.context.map.tileheight;
        self.grid_x1 = self.grid_x0 + 0.8;
        self.grid_y1 = self.grid_y0 + 1;
        self.ngrid_x0 = Math.floor(self.grid_x0);
        self.ngrid_y0 = Math.floor(self.grid_y0);
        self.ngrid_x1 = Math.floor(self.grid_x1);
        self.ngrid_y1 = Math.floor(self.grid_y1);
        
        self.obstructed.c00 = self.clsarray[self.ngrid_y0*self.context.map.width+self.ngrid_x0] == 1;
        self.obstructed.c01 = self.clsarray[self.ngrid_y0*self.context.map.width+self.ngrid_x1] == 1;
        self.obstructed.c10 = self.clsarray[self.ngrid_y1*self.context.map.width+self.ngrid_x0] == 1;
        self.obstructed.c11 = self.clsarray[self.ngrid_y1*self.context.map.width+self.ngrid_x1] == 1;
        
        /*self.obstructed.bl = ((self.ngrid_y == self.context.map.height - 1 || self.ngrid_x == 0) ||
                              (self.clsarray[self.ngrid_y+1*self.context.map.width+self.ngrid_x-1] == 1)) &&
                             (self.vel_x < 0) && (self.grid_x - self.ngrid_x < 0.3) &&
                             (self.ngrid_y + 1 - self.grid_y < 0.5);
        self.obstructed.br = ((self.ngrid_y == self.context.map.height - 1 ||
                               self.ngrid_x == self.context.map.width - 1) ||
                              (self.clsarray[self.ngrid_y+1*self.context.map.width+self.ngrid_x+1] == 1)) &&
                             (self.vel_x > 0) && (self.ngrid_x + 1 - self.grid_x < 0.3) &&
                             (self.ngrid_y + 1 - self.grid_y < 0.5);*/
        
        if (self.basearray[Math.floor(self.grid_y1+0.1)*self.context.map.width+self.ngrid_x0] == 1){
            self.context.startDefeatedPhase();
            self.winning = true;
        }
    }
    
    function setCorrectAnimation() {
        var angle = Math.atan2(self.vel_x,self.vel_y);
        if(self.sprite != self.animations.left && angle >= -Math.PI/2 && angle < -Math.PI*3/8) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.left.position = self.sprite.position;
            self.sprite = self.animations.left;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(self.sprite != self.animations.diag_dl && angle >= -Math.PI*3/8 && angle < -Math.PI/8) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.diag_dl.position = self.sprite.position;
            self.sprite = self.animations.diag_dl;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(self.sprite != self.animations.forwards && angle >= -Math.PI/8 && angle < Math.PI/8) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.forwards.position = self.sprite.position;
            self.sprite = self.animations.forwards;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(self.sprite != self.animations.diag_dr && angle >= Math.PI/8 && angle < Math.PI*3/8) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.diag_dr.position = self.sprite.position;
            self.sprite = self.animations.diag_dr;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(self.sprite != self.animations.right && angle >= Math.PI*3/8 && angle < Math.PI/2) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.right.position = self.sprite.position;
            self.sprite = self.animations.right;
            self.context.map_DO.addChild(self.sprite);
        }
    }
    
    self.updatePosition = updatePosition;
    function updatePosition(delta) {
        self.sprite.position.x += self.vel_x*delta/1000;
        self.sprite.position.y += self.vel_y*delta/1000;
    }
    
    self.normaliseVelocity = normaliseVelocity;
    function normaliseVelocity(vel) {
        var speed=Math.sqrt(Math.pow(vel.x,2)+Math.pow(vel.y,2));
        vel.x = self.max_speed*vel.x/speed;
        vel.y = self.max_speed*vel.y/speed;
    }
}

zombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
}

zombie.prototype.die = function(reason) {
    var self = this;
    if (reason == "turret") {
        self.context.map_DO.removeChild(self.sprite);
        self.animations.death.position = self.sprite.position;
        self.sprite = self.animations.death;
        self.context.map_DO.addChild(self.sprite);
    } else if (reason == "old") {
        self.context.map_DO.removeChild(self.sprite);
        self.animations.melting.position = self.sprite.position;
        self.sprite = self.animations.melting;
        self.context.map_DO.addChild(self.sprite);
    }
    self.winning = true; // hohoho
    self.dead = true;
    
    setTimeout(function() {
        self.context.map.zombies.remove(self);
        self.context.map_DO.removeChild(self.sprite);
    },1000);
}

zombie.prototype.mctextures = {};

zombie.prototype.spritesheets = { "attacking_f": "Bios/Standard/bio1_attacking_f.png",
                          "backwards": "Bios/Standard/bio1_backwards.png",
                          "death": "Bios/Standard/bio1_death.png",
                          "diag_dl": "Bios/Standard/bio1_diag_dl.png",
                          "diag_dr": "Bios/Standard/bio1_diag_dr.png",
                          "forwards": "Bios/Standard/bio1_forwards.png",
                          "left": "Bios/Standard/bio1_left.png",
                          "right": "Bios/Standard/bio1_right.png",
                          "melting": "Bios/Standard/bio1_melting.png" };

zombie.prototype.loadTextures = function() {
    for(var sht in this.spritesheets) {
        var sheettex = PIXI.BaseTexture.fromImage(this.spritesheets[sht]);
        var sheetlength = Math.floor(sheettex.height/32);
        var sheettextures = [];
        for(var i = 0; i < sheetlength; ++i) {
            sheettextures.push(new PIXI.Texture(sheettex,new PIXI.Rectangle(0,32*i,32,32)));
        }
        this.mctextures[sht] = sheettextures;
    }
}
               
zombie.prototype.loadSpriteSheets = function() {
    for(var sht in this.mctextures) {
        this.animations[sht] = new PIXI.MovieClip(this.mctextures[sht]);
        this.animations[sht].gotoAndPlay(0);
        this.animations[sht].animationSpeed = 0.2;
    }
    this.animations.death.loop = false;
    this.animations.melting.loop = false;
}
