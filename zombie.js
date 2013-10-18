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
    this.diameter = 0.8;
    
    this.loadSpriteSheets();
    
    this.sprite = this.animations.forwards;
    this.sprite.animationSpeed = 0.25;
    
    this.born = new Date();
    
    this.cls = getCollidableArray(map1);
    this.base = getBaseArray(map1);
    this.acid = getAcidArray(map1);
    
    this.clsarray = this.cls.array;
    this.basearray = this.base.array;
    this.acidarray = this.acid.array;

    this.sprite.position = new PIXI.Point(pos0_x,pos0_y);
    this.obstructed = { c00: false,
                        c01: false,
                        c10: false,
                        c11: false,
                      };
    this.winning = false;
    this.dead = false;
    
    self.giveGridRefX = giveGridRefX;
    self.giveGridRefY = giveGridRefY;

    self.setGridRefX = setGridRefX;
    self.setGridRefY = setGridRefY;
    
    this.grid_x0 = this.giveGridRefX() + 0.1;
    this.grid_y0 = this.giveGridRefY();
    this.grid_x1 = this.grid_x0 + 0.8;
    this.grid_y1 = this.grid_y0 + 1;
    this.ngrid_x0 = Math.floor(this.grid_x0);
    this.ngrid_y0 = Math.floor(this.grid_y0);
    this.ngrid_x1 = Math.floor(this.grid_x1);
    this.ngrid_y1 = Math.floor(this.grid_y1);
    
    var ngrid_x = Math.floor((self.grid_x0+self.grid_x1)/2);
    var ngrid_y = Math.floor((self.grid_y0+self.grid_y1)/2);
    
    var m_array = { 
        width: this.acid.width, height: this.acid.height,
        array: new Array(this.context.map.width*this.context.map.height) 
    };
    
    for(var i = 0; i < m_array.array.length; ++i) m_array.array[i] = this.acidarray[i] ? 8/3 : 1;
    this.pathfinding = new AStar(this.cls,m_array);
    this.pathfinding.findPath(new PIXI.Point(ngrid_x,ngrid_y),
                              new PIXI.Point(10,19));
    if(this.pathfinding.noroute) this.pathfinding.newMap(getCollidableArrayNoWalls(map1),m_array);
    this.pathfinding.findPath(new PIXI.Point(ngrid_x,ngrid_y),
                              new PIXI.Point(10,19));
    this.waypoint = this.pathfinding.nextWaypoint();
    
    self.update = update;
    function update(delta) {
        if(!self.dead){
            if(self.health <= 0) self.die("turret");
            if(new Date() - self.born > 10000) self.die("old");
        }
        if(self.winning) return;
        
        self.move(delta);
        
        self.setCorrectAnimation();
        self.updatePosition(delta);
    }
    
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

    function setGridRefX(v){
        self.sprite.position.x = v*self.context.map.tilewidth;
    }

    function setGridRefY(v){
        self.sprite.position.y = v*self.context.map.tileheight;
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
        
        var ngrid_x = Math.floor((self.grid_x0+self.grid_x1)/2);
        var ngrid_y = Math.floor((self.grid_y0+self.grid_y1)/2);
        
        if(ngrid_x == self.waypoint.x && ngrid_y == self.waypoint.y) {
            self.waypoint = self.pathfinding.nextWaypoint();
            console.log("Next waypoint is x: "+self.waypoint.x+", y: "+self.waypoint.y);
        }
        
        self.moveTowardGoal(self.waypoint.x,self.waypoint.y);

        self.collideWithEntities(self.context.map.zombies.entities)

        self.checkObstructions(delta);
        
        if(self.acidarray[ngrid_y*self.context.map.width+ngrid_x] == 1)
            self.max_speed = 30;
        else self.max_speed = 80;
        
        var obstructedCorners = (self.obstructed.c00 ? 1 : 0) +
                                (self.obstructed.c01 ? 1 : 0) +
                                (self.obstructed.c10 ? 1 : 0) +
                                (self.obstructed.c11 ? 1 : 0);

        if(obstructedCorners > 0) console.log("Blockage!");
        
        if (obstructedCorners == 1) {
            if (self.obstructed.c10) {
                if (self.ngrid_x1-self.grid_x0 > self.grid_y1 - self.ngrid_y1) {
                    self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                    /*self.vel_y = 0;
                    self.vel_x = self.max_speed;*/
                } else {
                    self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                    /*if (self.vel_x < 0) {
                        self.vel_x = 0;
                        self.vel_y = self.max_speed;
                    }*/
                }
            } else if (self.obstructed.c11) {
                if (self.grid_x1 - self.ngrid_x1 > self.grid_y1 - self.ngrid_y1) {
                    self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                    /*self.vel_y = 0;
                    self.vel_x = -self.max_speed;*/
                } else {
                    self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                    /*if (self.vel_x > 0) {
                        self.vel_x = 0;
                        self.vel_y = self.max_speed;
                    }*/
                }
            }
        }
        
        if (obstructedCorners == 2) {
            if (self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                /*self.vel_y = 0;
                self.vel_x = (vel_x_old > 0 ? 1 : -1)*self.max_speed;*/
            } else if (self.obstructed.c00 && self.obstructed.c10) {
                self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                /*if (self.vel_x < 0) {
                    self.vel_x = 0;
                    self.vel_y = self.max_speed;
                }*/
            } else if (self.obstructed.c01 && self.obstructed.c11) {
                self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                /*if (self.vel_x > 0) {
                    self.vel_x = 0;
                    self.vel_y = self.max_speed;
                }*/
            }
        }
        
        if(obstructedCorners == 3) {
            if (self.obstructed.c00 && self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                self.sprite.position.x = (self.ngrid_x0 + 0.9)*self.context.map.tilewidth;
                /*self.vel_y = 0;
                self.vel_x = self.max_speed;*/
            } else if (self.obstructed.c01 && self.obstructed.c10 && self.obstructed.c11) {
                self.sprite.position.y = (self.ngrid_y1 - 1)*self.context.map.tileheight;
                self.sprite.position.x = (self.ngrid_x1 - 0.9)*self.context.map.tilewidth;
                /*self.vel_y = 0;
                self.vel_x = -self.max_speed;*/
            }
        }
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
        var vel = { x: x_goal - self.giveGridRefX(), y: y_goal - self.giveGridRefY() };
        self.normaliseVelocity(vel);
        if(self.vel_x != vel.x) self.vel_x = vel.x;
        if(self.vel_y != vel.y) self.vel_y = vel.y;
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

zombie.prototype.spritesheets = { "attacking_f": gameDir+"Bios/Standard/bio1_attacking_f.png",
                          "backwards": gameDir+"Bios/Standard/bio1_backwards.png",
                          "death": gameDir+"Bios/Standard/bio1_death.png",
                          "diag_dl": gameDir+"Bios/Standard/bio1_diag_dl.png",
                          "diag_dr": gameDir+"Bios/Standard/bio1_diag_dr.png",
                          "forwards": gameDir+"Bios/Standard/bio1_forwards.png",
                          "left": gameDir+"Bios/Standard/bio1_left.png",
                          "right": gameDir+"Bios/Standard/bio1_right.png",
                          "melting": gameDir+"Bios/Standard/bio1_melting.png" };

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

zombie.prototype.collideWithEntities = function(list) {
    for (var e in list) {
        if(list[e] === this) continue;
        var dist_x = this.giveGridRefX()-list[e].giveGridRefX();
        var dist_y = this.giveGridRefY()-list[e].giveGridRefY();

        var distance = Math.sqrt(Math.pow(dist_x,2)+Math.pow(dist_y,2));
        var min_dist = this.diameter/2 + list[e].diameter/2;
        if(distance < min_dist) {
            this.setGridRefX(dist_x*min_dist/distance+list[e].giveGridRefX());
            this.setGridRefY(dist_y*min_dist/distance+list[e].giveGridRefY());
        }
    }
}
