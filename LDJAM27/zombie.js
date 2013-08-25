function zombie(pos0_x,pos0_y) {
    var self = this;
    this.image = "zombies/scaryzombie.png";
    this.texture = PIXI.Texture.fromImage(this.image);
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.scale = new PIXI.Point(6.4,6.4);
    this.vel_x = 10;
    this.vel_y = 0;
    this.max_speed = 30;

    this.sprite.position = new PIXI.Point(pos0_x,pos0_y);
    
    self.update = update;
    function update() {
        self.vel_x -= 0.005*(self.sprite.position.x-320);
        self.vel_y -= 0.005*(self.sprite.position.y-320);
        self.normaliseVelocity();
        self.updatePosition();
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