function Button(btnMovClipTextures,text,callback) {
    var self = this;
    this.mousedOver = false;
    this.callback = callback;
    this.btnMovClip = new PIXI.MovieClip(btnMovClipTextures);
    this.btnMovClip.setInteractive(true);
    
    if (arguments.length > 3) this.callargs = Array.prototype.slice.call(arguments).slice(3,arguments.length);
    
    this.text = text;
    
    this.btncontainer = new PIXI.DisplayObjectContainer;
    
    this.btnMovClip.gotoAndStop(0);
    
    this.btncontainer.addChild(this.btnMovClip);
    
    this.btnMovClip.mouseover = function(mouseData) {
        self.mousedOver = true;
        self.btnMovClip.gotoAndStop(2);
    }
    
    this.btnMovClip.mouseout = function(mouseData) {
        self.mousedOver = false;
        self.btnMovClip.gotoAndStop(0);
    }
    
    this.btnMovClip.mousedown = function(mouseData) {
        self.btnMovClip.gotoAndStop(1);
        if(self.callargs != undefined) self.callback.apply(null,self.callargs);
        else if(self.callback != null) self.callback();
    }
    
    this.btnMovClip.mouseup = function(mouseData) {
        if(self.mousedOver) self.btnMovClip.gotoAndStop(2);
        else self.btnMovClip.gotoAndStop(0);
    }
    
    self.setupText = setupText;
    function setupText() {
        self.displayText = new PIXI.Text(self.text,{ font: "14pt Arial", fill:"white", wordWrap: true, wordWrapWidth: self.movieclip? 100 : 160 });
        self.displayText.position = new PIXI.Point(-self.btnMovClip.width/2,-self.btnMovClip.height/2);
        self.displayText.anchor = new PIXI.Point(self.displayText.width/2/self.displayText.width,
                                                 8/self.displayText.height);
    
        self.btncontainer.addChild(self.displayText);
    }
    
    this.setupText();
}