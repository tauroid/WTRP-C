function zombie(context,pos0_x,pos0_y) {
    var self = this;
    this.context = context;
    //this.image = "zombies/scaryzombie.png";
    //this.texture = PIXI.Texture.fromImage(this.image);
    
    this.vel_x = 10;
    this.vel_y = 10;
    this.max_speed = 3;
    this.health = 10;
    
    this.spritesheets = { "attacking_f": "Bios/Standard/bio1_attacking_f.png",
                          "backwards": "Bios/Standard/bio1_backwards.png",
                          "death": "Bios/Standard/bio1_death.png",
                          "diag_dl": "Bios/Standard/bio1_diag_dl.png",
                          "diag_dr": "Bios/Standard/bio1_diag_dr.png",
                          "forwards": "Bios/Standard/bio1_forwards.png",
                          "left": "Bios/Standard/bio1_left.png",
                          "right": "Bios/Standard/bio1_right.png",
                          "melting": "Bios/Standard/bio1_melting.png" };
                          
    this.animations = {};
    this.loadSpriteSheets();
    this.sprite = this.animations.forwards;
    this.sprite.animationSpeed = 0.25;
    
    this.born = new Date();
    
    this.arystr = getCollidableArray(map1).array;
    this.basearray = getBaseArray(map1).array;

    this.sprite.position = new PIXI.Point(pos0_x,pos0_y);
    
    self.update = update;
    function update(delta) {
        self.normaliseVelocity();
    
        self.arystr = getCollidableArray(map1).array;
        self.basearray = getBaseArray(map1).array;
        
        self.moveToGoal(10,19);
        //self.updatePosition();
        if(self.health <= 0) self.die();
        if(new Date() - self.born > 10000) self.die();
    }
    
    self.giveGridRefX = giveGridRefX;
    
    self.giveGridRefY = giveGridRefY;
    
    self.moveToGrid = moveToGrid;
    
    self.moveToGoal = moveToGoal;
    
    //give a refference to the x position of the sprite in terms of grid refference
    
    function giveGridRefX(){
        return (Math.floor(self.sprite.position.x/32));
    }
    //give a refference to the x position of the sprite in terms of grid refference
    
    function giveGridRefY(){
        return (Math.floor(self.sprite.position.y/32));
    }
    
    function moveToGrid(new_grid_x,new_grid_y){
        if (new_grid_x>Math.floor(self.sprite.position.x/32)){
            self.sprite.position.x += self.vel_x;}
        else if(new_grid_x<Math.floor(self.sprite.position.x/32)){
            self.sprite.position.x -= self.vel_x;}
        
        if (new_grid_y>Math.floor(self.sprite.position.y/32)){
            self.sprite.position.y += self.vel_y;}
        else if (new_grid_y>Math.floor(self.sprite.position.y/32)){
            self.sprite.position.y -= self.vel_y;}
    }
    
    function moveToGoal(x_goal,y_goal){
        
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
        }
        
        temp_grid_x = Math.floor(self.sprite.position.x/32 + x_dir);
        temp_grid_y = Math.floor(self.sprite.position.y/32 + y_dir);
        
        //alert(self.arystr[temp_grid_x+((temp_grid_y)*self.context.map.width)] ==0);
        if (self.arystr[temp_grid_x+((temp_grid_y)*self.context.map.width)] ==0){
            grid_x = temp_grid_x;
            grid_y = temp_grid_y;
            
            grid_x = Math.floor(self.sprite.position.x/32 + x_dir);
            grid_y = Math.floor(self.sprite.position.y/32 + y_dir);
        }
        else {
            if (y_dir ==1){
                grid_x = Math.floor(self.sprite.position.x/32 -1);
                grid_y = Math.floor(self.sprite.position.y/32 + -1);
            }
            else {
                grid_x = Math.floor(self.sprite.position.x/32 -1);
                grid_y = Math.floor(self.sprite.position.y/32 + -1);
            }
        }
        
        if (self.basearray[temp_grid_x+((temp_grid_y)*self.context.map.width)] !=0){
            self.context.startDefeatedPhase();
        }
            
        
        //alert(Math.floor(self.sprite.position.x/32)+" "+Math.floor(self.sprite.position.y/32));
        //alert(grid_x+" "+grid_y);
        if(x_dir == 0 && y_dir == 1) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.forwards.position = self.sprite.position;
            self.sprite = self.animations.forwards;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(x_dir == 1 && y_dir == 0) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.right.position = self.sprite.position;
            self.sprite = self.animations.right;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(x_dir == -1 && y_dir == 0) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.left.position = self.sprite.position;
            self.sprite = self.animations.left;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(x_dir == 1 && y_dir == 1) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.diag_dr.position = self.sprite.position;
            self.sprite = self.animations.diag_dr;
            self.context.map_DO.addChild(self.sprite);
        }
        else if(x_dir == -1 && y_dir == 1) {
            self.context.map_DO.removeChild(self.sprite);
            self.animations.diag_dl.position = self.sprite.position;
            self.sprite = self.animations.diag_dl;
            self.context.map_DO.addChild(self.sprite);
        }
        
        moveToGrid(grid_x,grid_y);
    }
    
    self.updatePosition = updatePosition;
    function updatePosition() {
        self.sprite.position.x += self.vel_x;
        self.sprite.position.y += self.vel_y;
    }
    
    self.normaliseVelocity = normaliseVelocity;
    function normaliseVelocity() {
        hyp=Math.sqrt(Math.pow(self.vel_x,2)+Math.pow(self.vel_y,2));
        if(hyp > self.max_speed) {
            self.vel_x = self.max_speed*self.vel_x/hyp;
            self.vel_y = self.max_speed*self.vel_y/hyp;
        }
    }
}

zombie.prototype.takeDamage = function(damage) {
    this.health -= damage;
}

zombie.prototype.die = function() {
    this.context.map.zombies.remove(this);
    this.context.map_DO.removeChild(this.sprite);
}

zombie.prototype.loadSpriteSheets = function() {
    for(var sht in this.spritesheets) {
        var sheettex = PIXI.BaseTexture.fromImage(this.spritesheets[sht]);
        var sheetlength = Math.floor(sheettex.height/32);
        var sheettextures = [];
        for(var i = 0; i < sheetlength; ++i) {
            sheettextures.push(new PIXI.Texture(sheettex,new PIXI.Rectangle(0,32*i,32,32)));
        }
        this.animations[sht] = new PIXI.MovieClip(sheettextures);
        this.animations[sht].gotoAndPlay(0);
        this.animations[sht].animationSpeed = 0.2;
    }
}