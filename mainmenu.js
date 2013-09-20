function MainMenu(game) {
    var self = this;
    this.game = game;
    this.stage = new PIXI.Stage(0x130c17,true);
    this.loaded = false;
    
    self.assetsLoaded = assetsLoaded;
    self.update = update;
    self.loadLevel1 = loadLevel1;
    
    function assetsLoaded() {
        zombie.prototype.loadTextures();
        self.bgsprite = new PIXI.Sprite(PIXI.Texture.fromImage(
                                    "mainmenu/main_menu.png"));
        self.bgsprite.position.x = 20;
        
        self.btntex = [ PIXI.Texture.fromImage("scoreboard/Button.png"),
                        PIXI.Texture.fromImage("scoreboard/Button_click.png"),
                        PIXI.Texture.fromImage("scoreboard/Button_hover.png") ];
        self.btnStart = new Button(self.btntex,"Start!",self.loadLevel1);
        self.btnStart.btncontainer.position = new PIXI.Point(128,550);
        
        self.stage.addChild(self.bgsprite);
        self.stage.addChild(self.btnStart.btncontainer);
        
        self.loaded = true;
    }
    
    assetloader = new PIXI.AssetLoader(assetsToLoad);
    assetloader.onComplete = self.assetsLoaded;
    assetloader.load();
    
    function update(delta) {}
    
    function loadLevel1() {
        if(!level1.loaded) level1.load();
        level1.startBuildPhase(new Resources(5,10,20));
        self.game.activeContext = level1;
    }
}
