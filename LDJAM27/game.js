function Game(width,height) {
    var self = this;
    this.renderer = PIXI.autoDetectRenderer(width,height);
    
    this.lastFrame=new Date();

    this.activeContext = null;
    
    self.gameLoop = gameLoop;
    function gameLoop() {
        if(self.ready()) {
        
            var thisFrame=new Date();
            var delta=thisFrame.getTime()-self.lastFrame.getTime();
            self.lastFrame=thisFrame;
            
            self.activeContext.update(delta);
            //alert("about to render scene.");
            self.renderer.render(self.activeContext.stage);
            //alert("Scene rendered!");
        }
    }
    
    self.ready = ready;
    function ready() {
        return self.activeContext.loaded;
    }
}

function GameContext(map) {
    var self = this;
    this.stage = new PIXI.Stage(0x77FF77,true);
    this.zombies = new entityList(this);
    this.turrets = new entityList(this);
    this.loaded = false;
    
    self.assetsLoaded = assetsLoaded;
    function assetsLoaded() {
        self.gameMap = loadTileMap(map,self.stage);
        zombie1 = new zombie(30,30);
        self.zombies.add(zombie1);
        self.stage.addChild(zombie1.sprite);
        self.loaded = true;
    }
    
    var assetsToLoad = [ "zombies/scaryzombie.png" ];
    assetloader = new PIXI.AssetLoader(assetsToLoad);
    assetloader.onComplete = self.assetsLoaded;
    assetloader.load();
    
    self.update = update;
    function update(delta) {
        self.zombies.update(delta);
    }
}

function entityList(context,pEntities) {
    var self = this;
    this.context = context;
    if (pEntities !== undefined) this.entities = pEntities;
    else this.entities = new Array;
    
    self.add = add;
    function add(ent) {
        self.entities.push(ent);
        ent.context = self.context;
    }
    
    self.update = update;
    function update(delta) {
        for (var i in self.entities) {
            ent = self.entities[i];
            if(ent.update !== undefined) {
                ent.update(delta);
            }
        }
    }
}