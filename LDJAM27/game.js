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
    this.map = map;
    this.stage = new PIXI.Stage(0x77FF77,true);
    this.map.zombies = new entityList(this);
    this.map.turrets = new entityList(this);
    this.buildMenu = new BuildMenu(this);
    this.map_DO = loadTileMap(this.map);
    this.loaded = false;
    
    self.assetsLoaded = assetsLoaded;
    function assetsLoaded() {
        self.stage.addChild(self.map_DO);
        self.stage.addChild(self.buildMenu.menu_DO);
        self.buildMenu.menu_DO.position = new PIXI.Point(640,0);
        self.buildMenu.addEntry(new MenuEntry(null,"Disfiguring\nburns",null));
        self.buildMenu.addEntry(new MenuEntry(null,"Neil's\nbutt", null));
        zombie1 = new zombie(30,30);
        self.map.zombies.add(zombie1);
        self.map_DO.addChild(zombie1.sprite);
        self.loaded = true;
    }
    
    var assetsToLoad = [ "zombies/scaryzombie.png",
                         "buildmenu/butan.png",
                         "buildmenu/butandown.png",
                         "buildmenu/butanhover.png" ];
                         
    assetloader = new PIXI.AssetLoader(assetsToLoad);
    assetloader.onComplete = self.assetsLoaded;
    assetloader.load();
    
    self.update = update;
    function update(delta) {
        self.map.zombies.update(delta);
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