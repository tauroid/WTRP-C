function BuildMenu(context) {
    var self = this;
    this.context = context;
    
    this.menu_DO = new PIXI.DisplayObjectContainer;
    this.menuEntries = [];
    
    this.bannertex = new PIXI.Texture.fromImage("buildmenu/banner.png");
    this.bannerspr = new PIXI.Sprite(this.bannertex);
    
    this.menu_DO.addChild(this.bannerspr);
    
    self.addEntry = addEntry;
    function addEntry(menuentry) {
        menuentry.btncontainer.position = new PIXI.Point(0,self.menuEntries.length*MenuEntry.height);
        self.menu_DO.addChild(menuentry.btncontainer);
        self.menuEntries.push(menuentry);
    }
}

MenuEntry.height = 80;

function MenuEntry(movieclip,text,callback) {
    var self = this;
    this.mousedOver = false;
    this.callback = callback;
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
        self.mousedOver = true;
        self.displayText.rotation = 3.96/360*2*Math.PI;
        self.movieclip.rotation = 3.96/360*2*Math.PI;
        self.btnMovClip.gotoAndStop(2);
    }
    
    this.btnMovClip.mouseout = function(mouseData) {
        self.mousedOver = false;
        self.displayText.rotation = -2.07/360*2*Math.PI;
        self.movieclip.rotation = -2.07/360*2*Math.PI;
        self.btnMovClip.gotoAndStop(0);
    }
    
    this.btnMovClip.mousedown = function(mouseData) {
        self.btnMovClip.gotoAndStop(1);
        self.callback.apply(null,self.callargs);
    }
    
    this.btnMovClip.mouseup = function(mouseData) {
        if(self.mousedOver) self.btnMovClip.gotoAndStop(2);
        else self.btnMovClip.gotoAndStop(0);
    }
    
    this.displayText = new PIXI.Text(this.text,{ font: "14pt Arial", fill:"black", wordWrap: true, wordWrapWidth: this.movieclip? 100 : 160 });
    this.displayText.position = new PIXI.Point(this.btnMovClip.width/2, this.btnMovClip.height/2);
    this.displayText.anchor = new PIXI.Point(this.movieclip ? 20/this.displayText.width : 87/this.displayText.width,
                                             (this.displayText.height-36)/2/this.displayText.height);
    this.displayText.rotation = -2.07/360*2*Math.PI;
    
    this.btncontainer.addChild(this.displayText);
    
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