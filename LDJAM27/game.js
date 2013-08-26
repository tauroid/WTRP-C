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
    this.mouseTool = null;
    
    this.phase = "none";
    
    self.setMouseTool = setMouseTool;
    self.removeMouseTool = removeMouseTool;
    
    self.startBuildPhase = startBuildPhase;
    
    self.getByGridCoords = getByGridCoords;
    
    this.mouseTurret = new Turret(this.map);
    self.assetsLoaded = assetsLoaded;
    function assetsLoaded() {
        self.stage.addChild(self.map_DO);
        self.stage.addChild(self.buildMenu.menu_DO);
        self.buildMenu.menu_DO.position = new PIXI.Point(640,0);
        
        self.buildMenu.addEntry(new MenuEntry(null,"Gonorrhoea",self.setMouseTool,self.mouseTurret));
        self.buildMenu.addEntry(new MenuEntry(null,"Disfiguring\nburns",null));
        self.buildMenu.addEntry(new MenuEntry(null,"Neil's\nbutt", null));
        
        self.loaded = true;
        self.startBuildPhase();
    }
    
    function startBuildPhase() {
        self.phase = "build";
        self.map_DO.setInteractive(true);
    }
    
    var assetsToLoad = [ "zombies/scaryzombie.png",
                         "buildmenu/butan.png",
                         "buildmenu/butandown.png",
                         "buildmenu/butanhover.png",
                         "turret/turret_top.png",
                         "turret/turret_base.png",
                         "buildmenu/banner.png" ];
                         
    assetloader = new PIXI.AssetLoader(assetsToLoad);
    assetloader.onComplete = self.assetsLoaded;
    assetloader.load();
    
    self.update = update;
    function update(delta) {
        if(self.mouseTool !== null) {
            self.mouseTool.sprite.position = self.stage.getMousePosition();
        }

        self.map.zombies.update(delta);
        self.map.turrets.update(delta);
    }
    
    this.map_DO.mousedown = function(mouseData) {
        var grid_x = Math.floor(self.stage.getMousePosition().x/self.map.tilewidth);
        var grid_y = Math.floor(self.stage.getMousePosition().y/self.map.tileheight);
        
        if (self.mouseTool !== null && self.canPlaceonGrid(grid_x,grid_y)) {
            self.addToMapGrid(self.mouseTool,grid_x,grid_y);
        }
    }
    
    function setMouseTool(entityWithSprite) {
        if(self.mouseTool === entityWithSprite) {
            removeMouseTool();
            return;
        }
        if(self.mouseTool !== null) self.map_DO.removeChild(self.mouseTool.sprite);
        self.mouseTool = entityWithSprite;
        self.stage.addChild(self.mouseTool.sprite);
    }
    
    function removeMouseTool() {
        if(self.mouseTool !== null) {
            self.stage.removeChild(self.mouseTool.sprite);
            self.mouseTool = null;
        }
    }
    
    self.canPlaceonGrid = canPlaceonGrid;
    function canPlaceonGrid(grid_x,grid_y) {
        return !detectCollision(getBlockedPlacementArray(self.map),grid_x,grid_y) &&
               !getByGridCoords(grid_x,grid_y) &&
               !getByGridCoords(grid_x+1,grid_y) &&
               !getByGridCoords(grid_x+1,grid_y+1) &&
               !getByGridCoords(grid_x,grid_y+1) &&
               !getByGridCoords(grid_x-1,grid_y+1) &&
               !getByGridCoords(grid_x-1,grid_y) &&
               !getByGridCoords(grid_x-1,grid_y-1) &&
               !getByGridCoords(grid_x,grid_y-1) &&
               !getByGridCoords(grid_x+1,grid_y-1);
    }
    
    self.addToMapGrid = addToMapGrid;
    function addToMapGrid(gridobject,grid_x,grid_y) {
        var placedobject;
        if(gridobject instanceof Turret) {
            placedobject = new Turret(self.map);
            placedobject.grid_x = grid_x; placedobject.grid_y = grid_y;
            placedobject.sprite.position = new PIXI.Point((grid_x+0.5)*self.map.tilewidth,
                                                        (grid_y+0.5)*self.map.tileheight);

            self.map.turrets.add(placedobject);
            self.map_DO.addChild(placedobject.sprite);
        }
    }
    
    function getByGridCoords(grid_x,grid_y) {
        for(var e in self.map.turrets.entities) {
            if (self.map.turrets.entities[e].grid_x == grid_x && self.map.turrets.entities[e].grid_y == grid_y)
                return self.map.turrets.entities[e];
        }
        return null;
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