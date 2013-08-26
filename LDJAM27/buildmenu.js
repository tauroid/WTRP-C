function BuildMenu(context) {
    var self = this;
    this.context = context;
    
    this.menu_DO = new PIXI.DisplayObjectContainer;
    this.menuEntries = {};
    
    this.bannertex = new PIXI.Texture.fromImage("buildmenu/banner.png");
    this.bannerspr = new PIXI.Sprite(this.bannertex);
    
    this.menu_DO.addChild(this.bannerspr);
    
    self.addEntry = addEntry;
    function addEntry(name,menuentry) {
        var entries_no = 0;
        for(var e in self.menuEntries){
            ++entries_no;
        }
        menuentry.btncontainer.position = new PIXI.Point(0,entries_no*MenuEntry.height);
        self.menu_DO.addChild(menuentry.btncontainer);
        self.menuEntries[name] = menuentry;
    }
    
    self.updateText = updateText;
    function updateText(name,text) {
        if(self.menuEntries[name] == undefined) return;
        self.menuEntries[name].text = text;
        self.menuEntries[name].btncontainer.removeChild(self.menuEntries[name].displayText);
        self.menuEntries[name].setupText();
    }
    
    self.activate = activate;
    function activate() {
        for(var e in self.menuEntries) {
            self.menuEntries[e].active = true;
        }
    }
    
    self.deactivate = deactivate;
    function deactivate() {
        for(var e in self.menuEntries) {
            self.menuEntries[e].active = false;
        }
    }
}

MenuEntry.height = 80;

function MenuEntry(movieclip,text,callback) {
    var self = this;
    this.mousedOver = false;
    this.callback = callback;
    this.active = true;
    if (arguments.length > 3) this.callargs = Array.prototype.slice.call(arguments).slice(3,arguments.length);
    
    this.text = text;
    this.movieclip = movieclip;
    
    this.btncontainer = new PIXI.DisplayObjectContainer;
    
    this.btntex = PIXI.Texture.fromImage("buildmenu/butan.png");
    this.btntexdown = PIXI.Texture.fromImage("buildmenu/butandown.png");
    this.btntexhover = PIXI.Texture.fromImage("buildmenu/butanhover.png");
    
    this.btntextures = [ this.btntex, this.btntexdown, this.btntexhover ];
    
    this.btnMovClip = new PIXI.MovieClip(this.btntextures);
    this.btnMovClip.setInteractive(true);
    
    this.btnMovClip.gotoAndStop(0);
    
    this.btncontainer.addChild(this.btnMovClip);
    
    this.btnMovClip.mouseover = function(mouseData) {
        if(!self.active) return;
        self.mousedOver = true;
        self.displayText.rotation = 3.96/360*2*Math.PI;
        self.movieclip.rotation = 3.96/360*2*Math.PI;
        self.btnMovClip.gotoAndStop(2);
    }
    
    this.btnMovClip.mouseout = function(mouseData) {
        if(!self.active) return;
        self.mousedOver = false;
        self.displayText.rotation = -2.07/360*2*Math.PI;
        self.movieclip.rotation = -2.07/360*2*Math.PI;
        self.btnMovClip.gotoAndStop(0);
    }
    
    this.btnMovClip.mousedown = function(mouseData) {
        if(!self.active) return;
        self.btnMovClip.gotoAndStop(1);
        self.callback.apply(null,self.callargs);
    }
    
    this.btnMovClip.mouseup = function(mouseData) {
        if(!self.active) return;
        if(self.mousedOver) self.btnMovClip.gotoAndStop(2);
        else self.btnMovClip.gotoAndStop(0);
    }
    
    self.setupText = setupText;
    function setupText() {
        self.displayText = new PIXI.Text(self.text,{ font: "14pt Arial", fill:"black", wordWrap: true, wordWrapWidth: self.movieclip? 100 : 160 });
        self.displayText.position = new PIXI.Point(self.btnMovClip.width/2, self.btnMovClip.height/2);
        self.displayText.anchor = new PIXI.Point(self.movieclip ? 20/self.displayText.width : 87/self.displayText.width,
                                             (self.displayText.height-36)/2/self.displayText.height);
        self.displayText.rotation = -2.07/360*2*Math.PI;
    
        self.btncontainer.addChild(self.displayText);
    }
    
    this.setupText();
    
    if(this.movieclip) {
        this.movieclip.position = new PIXI.Point(this.btnMovClip.width/2, this.btnMovClip.height/2);
        this.movieclip.anchor = new PIXI.Point(87/this.movieclip.width,0.35);
        this.movieclip.rotation = -2.07/360*2*Math.PI;
        
        this.btncontainer.addChild(this.movieclip);
    }
    
    this.btnoverlaytex = PIXI.Texture.fromImage("buildmenu/butan_overlay.png");
    this.btnoverlayspr = new PIXI.Sprite(this.btnoverlaytex);
    this.btncontainer.addChild(this.btnoverlayspr);
}