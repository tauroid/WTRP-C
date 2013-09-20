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
    this.map.acidspray = new entityList(this);
    this.buildMenu = new BuildMenu(this);
    this.buildTime = 10000;
    this.buildTimer = new TimerText;
    this.map_DO = loadTileMap(this.map);
    this.loaded = false;
    this.mouseTool = null;
    this.animators = new entityList(this);
    this.resources = null;
    this.scoreboard = null;
    this.acidcannon = new AcidCannon(this,18,19);
    
    this.phase = "none";
    
    self.setMouseTool = setMouseTool;
    self.removeMouseTool = removeMouseTool;
    
    self.startBuildPhase = startBuildPhase;
    
    self.getByGridCoords = getByGridCoords;
    
    this.mouseTurret = new Turret(null);
    this.mouseTarget = new AcidTarget(0,0);
    self.load = load;
    function load() {
        self.stage.addChild(self.map_DO);
        self.map_DO.addChild(self.acidcannon.sprite);
        
        self.stage.addChild(self.buildMenu.menu_DO);
        self.buildMenu.menu_DO.position = new PIXI.Point(640,0);
        
        self.buildMenu.addEntry("turrets",new MenuEntry(new PIXI.Sprite(PIXI.Texture.fromImage("buildmenu/turret_blue.png")),
                                "Turrets",self.setMouseTool,self.mouseTurret));
        self.buildMenu.addEntry("acid_spray",new MenuEntry(new PIXI.Sprite(PIXI.Texture.fromImage("buildmenu/acid_blue.png")),
                                "Acid Spray",self.setMouseTool,self.mouseTarget));
        self.buildMenu.addEntry("walls",new MenuEntry(new PIXI.Sprite(PIXI.Texture.fromImage("buildmenu/wallend_blue.png")),
                                "Walls", null));
                                
        self.buildTimer.cntr.position = new PIXI.Point(self.map.width*self.map.tilewidth/2,
                                                       self.map.height*self.map.tileheight*0.1);
        self.scoreboard = new Scoreboard(self,"");
        
        self.stage.addChild(self.buildTimer.cntr);
        self.loaded = true;
    }
    
    self.clearEntityListAndSprites = clearEntityListAndSprites;
    
    function startBuildPhase(resources) {
        self.clearEntityListAndSprites(self.map.turrets);
        self.clearEntityListAndSprites(self.map.zombies);
        self.clearEntityListAndSprites(self.map.acidspray);
        self.phase = "build";
        self.resources = resources;
        self.map_DO.setInteractive(true);
        
        self.buildMenu.activate();
        self.buildMenu.updateText("turrets","Turrets x "+self.resources.nTurrets);
        self.buildMenu.updateText("acid_spray","Acid Spray x "+self.resources.nAcidSpray);
        self.buildMenu.updateText("walls","Walls x "+self.resources.nWallTiles);
        
        self.map_DO.addChild(self.buildTimer.cntr);
        self.animators.add(new ValueAnimator(function(value) {
                                                 self.buildTimer.updateText(value);
                                             },self.buildTime,0,self.buildTime));
                                             
        setTimeout(self.startAttackPhase,self.buildTime);
    }
    
    self.startAttackPhase = startAttackPhase;
    function startAttackPhase() {
        self.removeMouseTool();
        self.buildMenu.deactivate();
        self.map_DO.removeChild(self.buildTimer.cntr);
        for(var i = 0; i < 10; ++i) {
            var zomb = new zombie(self,Math.random()*608,0);
            self.map.zombies.add(zomb);
            self.map_DO.addChild(zomb.sprite);
        }
        self.phase = "attack";
    }
    
    self.startVictoryPhase = startVictoryPhase;
    function startVictoryPhase() {
        self.phase = "victory";
        self.scoreboard.updateText("Victory!\n\nTurrets used: "+(self.resources.iniTurrets-self.resources.nTurrets)+"\nAcid used: "+(self.resources.iniAcidSpray-self.resources.nAcidSpray)+"\nWall tiles used: 0");
        self.scoreboard.open();
    }
    
    self.startDefeatedPhase = startDefeatedPhase;
    function startDefeatedPhase() {
        self.phase = "defeat";
        self.scoreboard.updateText("You have been overrun!");
        self.scoreboard.open();
    }
    
    self.update = update;
    function update(delta) {
        if(self.phase == "attack") if(self.map.zombies.entities.length == 0) self.startVictoryPhase();
        if(self.mouseTool !== null) {
            self.mouseTool.sprite.position = self.stage.getMousePosition();
        }

        for(var a in self.animators.entities) {
            if(self.animators.entities[a].finished) self.animators.remove(self.animators.entities[a]);
        }
        
        self.acidcannon.update(delta);
        self.map.zombies.update(delta);
        self.map.turrets.update(delta);
        self.animators.update(delta);
    }
    
    this.map_DO.mousedown = function(mouseData) {
        if(self.phase == "build") {
            var grid_x = Math.floor(self.stage.getMousePosition().x/self.map.tilewidth);
            var grid_y = Math.floor(self.stage.getMousePosition().y/self.map.tileheight);
            
            if (self.mouseTool !== null && self.canPlaceonGrid(grid_x,grid_y)) {
                if (self.mouseTool instanceof Turret && self.resources.nTurrets > 0) {
                    self.addToMapGrid(self.mouseTool,grid_x,grid_y);
                    --self.resources.nTurrets;
                    self.buildMenu.updateText("turrets","Turrets x "+self.resources.nTurrets);
                } else if (self.mouseTool instanceof AcidTarget && self.resources.nAcidSpray > 0
                            && self.buildTimer.time > 500) {
                    self.acidcannon.addTarget(grid_x,grid_y);
                    --self.resources.nAcidSpray;
                    self.buildMenu.updateText("acid_spray","Acid Spray x "+self.resources.nAcidSpray);
                }
            }
        }
    }
    
    function setMouseTool(entityWithSprite) {
        if(self.mouseTool === entityWithSprite) {
            self.removeMouseTool();
            return;
        }
        if(self.mouseTool) self.removeMouseTool();
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
            placedobject = new Turret(self);
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
        for(var e in self.map.acidspray.entities) {
            if (self.map.acidspray.entities[e].ngrid_x == grid_x && self.map.acidspray.entities[e].ngrid_y == grid_y)
                return self.map.acidspray.entities[e];
        }
        return null;
    }
    
    function clearEntityListAndSprites(entitylist) {
        var length = entitylist.entities.length;
        for(var e = 0; e < length; ++e) {
            self.map_DO.removeChild(entitylist.entities[0].sprite);
            entitylist.entities.splice(0,1);
        }
    }
}

// A container for stuff that needs updating
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
    
    self.remove = remove;
    function remove(ent) {
        for (var e in self.entities) {
            if (ent === self.entities[e]) {
                self.entities.splice(e,1);
                return;
            }
        }
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

function distance(x0,y0,x1,y1) {
    return Math.sqrt(Math.pow(x1-x0,2)+
                     Math.pow(y1-y0,2));
}

function TimerText() {
    var self = this;
    
    this.bgspr = new PIXI.Sprite(PIXI.Texture.fromImage("counterbg.png"));
    this.bgspr.anchor = new PIXI.Point(0.5,0.4);
    this.displayText = new PIXI.Text("Start",{ font: "16pt Arial" });
    this.cntr = new PIXI.DisplayObjectContainer;
    this.time = 10000;
    this.cntr.addChild(this.bgspr);
    this.cntr.addChild(this.displayText);
    self.updateText = updateText;
    function updateText(time) {
        self.time = time;
        self.cntr.removeChild(self.displayText);
        var text = Math.floor(time/1000)+"."+(Math.floor(time/100) % 10);
        self.displayText = new PIXI.Text(text,{ font: "bold 20pt Arial", fill: "white" });
        self.displayText.anchor = new PIXI.Point(0.5,(self.displayText.height-32)/2/self.displayText.height+0.1);
        self.cntr.addChild(this.displayText);
    }
}

function Resources(nTurrets,nAcidSpray,nWallTiles) {
    this.iniTurrets = nTurrets;
    this.iniAcidSpray = nAcidSpray;
    this.iniWallTiles = nWallTiles;
    this.nTurrets = nTurrets;
    this.nAcidSpray = nAcidSpray;
    this.nWallTiles = nWallTiles;
}
