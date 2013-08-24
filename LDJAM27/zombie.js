function zombie(pSprite) {
    this.sprite = pSprite;
    this.vel_x = 1;
    this.vel_y = 1;

    this.update = update;
    function update() {
        this.updatePosition();
    }
    
    this.updatePosition = updatePosition;
    function updatePosition() {
        this.sprite.position.x += this.vel_x;
        this.sprite.position.y += this.vel_y;
    }
}