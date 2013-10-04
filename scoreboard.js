function Scoreboard(context,text) {
    var self = this;
    this.text = text;
    this.context = context;
    
    self.open = open;
    self.closeAndStartBuildPhase = closeAndStartBuildPhase;
    self.close = close;
    
    this.bgsprite = new PIXI.Sprite(PIXI.Texture.fromImage("scoreboard/scoreboard.png"));
    this.btnMovClipTextures = [ PIXI.Texture.fromImage("scoreboard/Button.png"),
                                PIXI.Texture.fromImage("scoreboard/Button_click.png"),
                                PIXI.Texture.fromImage("scoreboard/Button_hover.png") ];
    this.closeBtn = new Button(this.btnMovClipTextures,"Play again?",this.closeAndStartBuildPhase);
    this.quitToMenuBtn = new Button(this.btnMovClipTextures,"Quit to menu",function() { game.activeContext = mainmenu; self.close(); });
    
    self.updateText = updateText;
    function updateText(text) {
        self.text = text;
        self.DOC.removeChild(this.displayText);
        self.setupText();
    }
    
    self.setupText = setupText;
    function setupText() {
        self.displayText = new PIXI.Text(self.text,{ font: "14pt Arial", fill:"black", wordWrap: true, wordWrapWidth: 300 });
        self.displayText.position = new PIXI.Point(90,120);
    
        self.DOC.addChild(self.displayText);
    }
    
    this.closeBtn.btncontainer.position = new PIXI.Point(244,348);
    this.quitToMenuBtn.btncontainer.position = new PIXI.Point(86,348);
    
    this.DOC = new PIXI.DisplayObjectContainer;
    this.DOC.position = new PIXI.Point(80,80);
    this.DOC.addChild(this.bgsprite);
    this.DOC.addChild(this.closeBtn.btncontainer);
    this.DOC.addChild(this.quitToMenuBtn.btncontainer);
    this.setupText();
    
    function open(){
        self.context.stage.addChild(self.DOC);
    }
    
    function closeAndStartBuildPhase() {
        self.context.stage.removeChild(self.DOC);
        self.context.startBuildPhase(new Resources(5,2,20));
    }
    
    function close() {
        self.context.stage.removeChild(self.DOC);
    }
}
