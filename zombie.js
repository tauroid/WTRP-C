function zombie(context,pos0_x,pos0_y) {
    this.context = context;
    //this.image = "zombies/scaryzombie.png";
    //this.texture = PIXI.Texture.fromImage(this.image);
    
    this.vel_x = 10;
    this.vel_y = 10;
    this.max_speed = 80;
    this.speed = this.max_speed;
    this.health = 10;
    this.animations = {};
    this.diameter = 0.8;
    
    this.loadSpriteSheets();
    
    this.sprite = this.animations.forwards;
    this.sprite.animationSpeed = 0.25;
    
    this.born = new Date();
    
    this.cls = null;
    this.base = null;
    this.acid = null;
    
    this.clsarray = null;
    this.basearray = null;
    this.acidarray = null;

    this.sprite.position = new PIXI.Point(pos0_x,pos0_y);
    this.obstructed = { c00: false,
                        c01: false,
                        c10: false,
                        c11: false,
                      };
    this.winning = false;
    this.dead = false;
    
    this.grid_x0 = this.giveGridRefX() + 0.1;
    this.grid_y0 = this.giveGridRefY();
    this.grid_x1 = this.grid_x0 + 0.8;
    this.grid_y1 = this.grid_y0 + 1;
    this.ngrid_x0 = Math.floor(this.grid_x0);
    this.ngrid_y0 = Math.floor(this.grid_y0);
    this.ngrid_x1 = Math.floor(this.grid_x1);
    this.ngrid_y1 = Math.floor(this.grid_y1);
    
    this.initPathfinding();
}
    
zombie.prototype.update = function(delta) {
    if(!this.dead){
        if(this.health <= 0) this.die("turret");
        if(new Date() - this.born > 10000) this.die("old");
    }
    if(this.winning) return;
    
    this.move(delta);
    
    // Why? Why can't I design something that makes sense?
    if(this.sprite != this.animations.attack) this.setCorrectAnimation();
    this.updatePosition(delta);
}
//give a refference to the x position of the sprite in terms of grid refference
    
zombie.prototype.giveGridRefX = function(){
    return this.sprite.position.x/this.context.map.tilewidth;
}
    //give a refference to the y position of the sprite in terms of grid refference
    
zombie.prototype.giveGridRefY = function(){
    return this.sprite.position.y/this.context.map.tileheight;
}

zombie.prototype.setGridRefX = function(v){
    this.sprite.position.x = v*this.context.map.tilewidth;
}

zombie.prototype.setGridRefY = function(v){
    this.sprite.position.y = v*this.context.map.tileheight;
}
    
/* Sorry Jon
    
function moveToGrid(new_grid_x,new_grid_y){
    if (new_grid_x>this.giveGridRefX()){
        this.sprite.position.x += this.vel_x;}
    else if(new_grid_x<this.giveGridRefX()){
        this.sprite.position.x -= this.vel_x;}
    
    if (new_grid_y>this.giveGridRefY()){
        this.sprite.position.y += this.vel_y;}
    else if (new_grid_y>this.giveGridRefY()){
        this.sprite.position.y -= this.vel_y;}
}*/
zombie.prototype.move = function(delta) {
    var vel_x_old = this.vel_x;
    var vel_y_old = this.vel_y;
    
    var ngrid_x = Math.floor((this.grid_x0+this.grid_x1)/2);
    var ngrid_y = Math.floor((this.grid_y0+this.grid_y1)/2);
    
    if(ngrid_x == this.waypoint.x && ngrid_y == this.waypoint.y) {
        this.waypoint = this.pathfinding.nextWaypoint();
        console.log("Next waypoint is x: "+this.waypoint.x+", y: "+this.waypoint.y);
    }
    
    this.moveTowardGoal(this.waypoint.x,this.waypoint.y);
    this.collideWithEntities(this.context.map.zombies.entities)
    this.checkObstructions(delta);
    
    if(this.acidarray[ngrid_y*this.context.map.width+ngrid_x] == 1)
        this.speed = 3/8*this.max_speed;
    else this.speed = this.max_speed;
    
    var obstructedCorners = (this.obstructed.c00 ? 1 : 0) +
                            (this.obstructed.c01 ? 1 : 0) +
                            (this.obstructed.c10 ? 1 : 0) +
                            (this.obstructed.c11 ? 1 : 0);
    
    this.collide(obstructedCorners);
}
    
zombie.prototype.moveTowardGoal = function(x_goal,y_goal){
    
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
    var vel = { x: x_goal - this.giveGridRefX(), y: y_goal - this.giveGridRefY() };
    this.normaliseVelocity(vel);
    if(this.vel_x != vel.x) this.vel_x = vel.x;
    if(this.vel_y != vel.y) this.vel_y = vel.y;
}

zombie.prototype.checkObstructions = function(delta) {
    this.grid_x0 = this.giveGridRefX() + 0.1 + delta*this.vel_x/1000/this.context.map.tilewidth;
    this.grid_y0 = this.giveGridRefY() + delta*this.vel_y/1000/this.context.map.tileheight;
    this.grid_x1 = this.grid_x0 + 0.8;
    this.grid_y1 = this.grid_y0 + 1;
    this.ngrid_x0 = Math.floor(this.grid_x0);
    this.ngrid_y0 = Math.floor(this.grid_y0);
    this.ngrid_x1 = Math.floor(this.grid_x1);
    this.ngrid_y1 = Math.floor(this.grid_y1);
    
    this.obstructed.c00 = this.clsarray[this.ngrid_y0*this.context.map.width+this.ngrid_x0] == 1;
    this.obstructed.c01 = this.clsarray[this.ngrid_y0*this.context.map.width+this.ngrid_x1] == 1;
    this.obstructed.c10 = this.clsarray[this.ngrid_y1*this.context.map.width+this.ngrid_x0] == 1;
    this.obstructed.c11 = this.clsarray[this.ngrid_y1*this.context.map.width+this.ngrid_x1] == 1;
    
    if (this.basearray[Math.floor(this.grid_y1+0.1)*this.context.map.width+this.ngrid_x0] == 1){
        this.context.startDefeatedPhase();
        this.winning = true;
    }
}
    
zombie.prototype.setCorrectAnimation = function() {
    var angle = Math.atan2(this.vel_x,this.vel_y);
    if(this.sprite != this.animations.left && angle >= -Math.PI/2 && angle < -Math.PI*3/8) {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.left.position = this.sprite.position;
        this.sprite = this.animations.left;
        this.context.map_DO.addChild(this.sprite);
    }
    else if(this.sprite != this.animations.diag_dl && angle >= -Math.PI*3/8 && angle < -Math.PI/8) {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.diag_dl.position = this.sprite.position;
        this.sprite = this.animations.diag_dl;
        this.context.map_DO.addChild(this.sprite);
    }
    else if(this.sprite != this.animations.forwards && angle >= -Math.PI/8 && angle < Math.PI/8) {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.forwards.position = this.sprite.position;
        this.sprite = this.animations.forwards;
        this.context.map_DO.addChild(this.sprite);
    }
    else if(this.sprite != this.animations.diag_dr && angle >= Math.PI/8 && angle < Math.PI*3/8) {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.diag_dr.position = this.sprite.position;
        this.sprite = this.animations.diag_dr;
        this.context.map_DO.addChild(this.sprite);
    }
    else if(this.sprite != this.animations.right && angle >= Math.PI*3/8 && angle < Math.PI/2) {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.right.position = this.sprite.position;
        this.sprite = this.animations.right;
        this.context.map_DO.addChild(this.sprite);
    }
}
    
zombie.prototype.updatePosition = function(delta) {
    this.sprite.position.x += this.vel_x*delta/1000;
    this.sprite.position.y += this.vel_y*delta/1000;
}
    
zombie.prototype.normaliseVelocity = function(vel) {
    var speed=Math.sqrt(Math.pow(vel.x,2)+Math.pow(vel.y,2));
    vel.x = this.speed*vel.x/speed;
    vel.y = this.speed*vel.y/speed;
}

zombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
}

zombie.prototype.die = function(reason) {
    if (reason == "turret") {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.death.position = this.sprite.position;
        this.sprite = this.animations.death;
        this.context.map_DO.addChild(this.sprite);
    } else if (reason == "old") {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.melting.position = this.sprite.position;
        this.sprite = this.animations.melting;
        this.context.map_DO.addChild(this.sprite);
    }
    
    this.winning = true; // hohoho
    this.dead = true;
    
    var curzomb = this;
    setTimeout(function() {
        curzomb.context.map.zombies.remove(curzomb);
        curzomb.context.map_DO.removeChild(curzomb.sprite);
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

zombie.prototype.initPathfinding = function() {
    this.cls = getCollidableArray(map1);
    this.base = getBaseArray(map1);
    this.acid = getAcidArray(map1);
    
    this.clsarray = this.cls.array;
    this.basearray = this.base.array;
    this.acidarray = this.acid.array;
    
    var ngrid_x = Math.floor((this.grid_x0+this.grid_x1)/2);
    var ngrid_y = Math.floor((this.grid_y0+this.grid_y1)/2);

    var m_array = { 
        width: this.acid.width, height: this.acid.height,
        array: new Array(this.context.map.width*this.context.map.height) 
    };
    
    for(var i = 0; i < m_array.array.length; ++i) m_array.array[i] = this.acidarray[i] ? 8/3 : 1;
    this.pathfinding = new AStar(this.cls,m_array);
    this.pathfinding.findPath(new PIXI.Point(ngrid_x,ngrid_y),
                              new PIXI.Point(10,19));
    if(this.pathfinding.noroute) {
        this.pathfinding.newMap(getCollidableArrayNoWalls(map1),m_array);
        this.pathfinding.findPath(new PIXI.Point(ngrid_x,ngrid_y),
                              new PIXI.Point(10,19));
    }
    this.waypoint = this.pathfinding.nextWaypoint();
}

zombie.prototype.collide = function(obstructedCorners) {
    if(obstructedCorners > 0) console.log("Blockage!");
    
    if (obstructedCorners == 1) {
        if (this.obstructed.c10) {
            if (this.ngrid_x1-this.grid_x0 > this.grid_y1 - this.ngrid_y1) {
                this.sprite.position.y = (this.ngrid_y1 - 1)*this.context.map.tileheight;
                /*this.vel_y = 0;
                this.vel_x = this.max_speed;*/
            } else {
                this.sprite.position.x = (this.ngrid_x0 + 0.9)*this.context.map.tilewidth;
                /*if (this.vel_x < 0) {
                    this.vel_x = 0;
                    this.vel_y = this.max_speed;
                }*/
            }
        } else if (this.obstructed.c11) {
            if (this.grid_x1 - this.ngrid_x1 > this.grid_y1 - this.ngrid_y1) {
                this.sprite.position.y = (this.ngrid_y1 - 1)*this.context.map.tileheight;
                /*this.vel_y = 0;
                this.vel_x = -this.max_speed;*/
            } else {
                this.sprite.position.x = (this.ngrid_x1 - 0.9)*this.context.map.tilewidth;
                /*if (this.vel_x > 0) {
                    this.vel_x = 0;
                    this.vel_y = this.max_speed;
                }*/
            }
        }
    }
    
    if (obstructedCorners == 2) {
        if (this.obstructed.c10 && this.obstructed.c11) {
            this.sprite.position.y = (this.ngrid_y1 - 1)*this.context.map.tileheight;
            /*this.vel_y = 0;
            this.vel_x = (vel_x_old > 0 ? 1 : -1)*this.max_speed;*/
        } else if (this.obstructed.c00 && this.obstructed.c10) {
            this.sprite.position.x = (this.ngrid_x0 + 0.9)*this.context.map.tilewidth;
            /*if (this.vel_x < 0) {
                this.vel_x = 0;
                this.vel_y = this.max_speed;
            }*/
        } else if (this.obstructed.c01 && this.obstructed.c11) {
            this.sprite.position.x = (this.ngrid_x1 - 0.9)*this.context.map.tilewidth;
            /*if (this.vel_x > 0) {
                this.vel_x = 0;
                this.vel_y = this.max_speed;
            }*/
        }
    }
    
    if(obstructedCorners == 3) {
        if (this.obstructed.c00 && this.obstructed.c10 && this.obstructed.c11) {
            this.sprite.position.y = (this.ngrid_y1 - 1)*this.context.map.tileheight;
            this.sprite.position.x = (this.ngrid_x0 + 0.9)*this.context.map.tilewidth;
            /*this.vel_y = 0;
            this.vel_x = this.max_speed;*/
        } else if (this.obstructed.c01 && this.obstructed.c10 && this.obstructed.c11) {
            this.sprite.position.y = (this.ngrid_y1 - 1)*this.context.map.tileheight;
            this.sprite.position.x = (this.ngrid_x1 - 0.9)*this.context.map.tilewidth;
            /*this.vel_y = 0;
            this.vel_x = -this.max_speed;*/
        }
    }
}

function xp10d3(context,pos0_x,pos0_y) {
    zombie.call(this,context,pos0_x,pos0_y);
    this.max_speed = 110;
    this.splode = true;
}

xp10d3.prototype = Object.create(zombie.prototype);
xp10d3.prototype.constructor = xp10d3;

xp10d3.prototype.initPathfinding = function() {
    this.cls = getCollidableArray(map1);
    this.base = getBaseArray(map1);
    this.acid = getAcidArray(map1);
    
    this.clsarray = this.cls.array;
    this.basearray = this.base.array;
    this.acidarray = this.acid.array;
    
    var ngrid_x = Math.floor((this.grid_x0+this.grid_x1)/2);
    var ngrid_y = Math.floor((this.grid_y0+this.grid_y1)/2);
    
    var m_array = { 
        width: this.acid.width, height: this.acid.height,
        array: new Array(this.context.map.width*this.context.map.height) 
    };
    
    for(var i = 0; i < m_array.array.length; ++i) m_array.array[i] = this.acidarray[i] ? 8/3 : 1;
    this.pathfinding = new AStar(getCollidableArrayNoWalls(map1),m_array);
    this.pathfinding.findPath(new PIXI.Point(ngrid_x,ngrid_y),
                              new PIXI.Point(10,19));
    this.waypoint = this.pathfinding.nextWaypoint();
}

xp10d3.prototype.collide = function() {
    zombie.prototype.collide.call(this);
    
    var exploded = false;
    if (this.obstructed.c00 && isWall(this.context.map,
            new PIXI.Point(this.ngrid_x0,this.ngrid_y0))) {
        destroyWall(this.context.map,new PIXI.Point(this.ngrid_x0,this.ngrid_y0),this.context);
        exploded = true;
    }
    if (this.obstructed.c01 && isWall(this.context.map,
            new PIXI.Point(this.ngrid_x1,this.ngrid_y0))) {
        destroyWall(this.context.map,new PIXI.Point(this.ngrid_x1,this.ngrid_y0),this.context);
        exploded = true;
    }
    if (this.obstructed.c10 && isWall(this.context.map,
            new PIXI.Point(this.ngrid_x0,this.ngrid_y1))) {
        destroyWall(this.context.map,new PIXI.Point(this.ngrid_x0,this.ngrid_y1),this.context);
        exploded = true;
    }
    if (this.obstructed.c11 && isWall(this.context.map,
            new PIXI.Point(this.ngrid_x1,this.ngrid_y1))) {
        destroyWall(this.context.map,new PIXI.Point(this.ngrid_x1,this.ngrid_y1),this.context);
        exploded = true;
    }
    
    if (exploded) this.die("xp10d3");
}

xp10d3.prototype.mctextures = {};

xp10d3.prototype.spritesheets = { "attack":gameDir+"Bios/xp10d3/xp10d3_attack.png",
                     "backwards":gameDir+"Bios/xp10d3/xp10d3_backwards.png",
                     "death":gameDir+"Bios/xp10d3/xp10d3_death.png",
                     "diag_dl":gameDir+"Bios/xp10d3/xp10d3_diag_dl.png",
                     "diag_dr":gameDir+"Bios/xp10d3/xp10d3_diag_dr.png",
                     "forwards":gameDir+"Bios/xp10d3/xp10d3_forwards.png",
                     "frantic_f":gameDir+"Bios/xp10d3/xp10d3_frantic_f.png",
                     "left":gameDir+"Bios/xp10d3/xp10d3_left.png",
                     "melting":gameDir+"Bios/xp10d3/xp10d3_melting.png",
                     "right":gameDir+"Bios/xp10d3/xp10d3_right.png", };
                     
xp10d3.prototype.loadSpriteSheets = function() {
    zombie.prototype.loadSpriteSheets.call(this);
    
    this.animations.attack.loop = false;
}

xp10d3.prototype.die = function(reason) {
    if(reason == "xp10d3") {
        this.context.map_DO.removeChild(this.sprite);
        this.animations.attack.position = this.sprite.position;
        this.sprite = this.animations.attack;
        this.context.map_DO.addChild(this.sprite);
    }
    
    zombie.prototype.die.call(this,reason);
}
