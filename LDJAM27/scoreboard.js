function Scoreboard(context,text) {
    var self = this;
    this.text = text;
    this.context = context;
    
    self.open = open;
    self.close = close;
    
    this.bgsprite = new PIXI.Sprite(PIXI.Texture.fromImage("scoreboard/scoreboard.png"));
    this.btnMovClipTextures = [ PIXI.Texture.fromImage("scoreboard/Button.png"),
                                PIXI.Texture.fromImage("scoreboard/Button_click.png"),
                                PIXI.Texture.fromImage("scoreboard/Button_hover.png") ];
    this.closeBtn = new Button(this.btnMovClipTextures,"Play again?",this.close);
    this.quitToMenuBtn = new Button(this.btnMovClipTextures,"Quit to menu",null);
    
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
    
    this.closeBtn.btnMovClip.anchor = new PIXI.Point(1,1);
    this.closeBtn.btncontainer.position = new PIXI.Point(394,408);
    
    this.DOC = new PIXI.DisplayObjectContainer;
    this.DOC.position = new PIXI.Point(80,80);
    this.DOC.addChild(this.bgsprite);
    this.DOC.addChild(this.closeBtn.btncontainer);
    this.setupText();
    
    function open(){
        self.context.map_DO.addChild(self.DOC);
    }
    
    function close() {
        self.context.map_DO.removeChild(self.DOC);
        self.context.startBuildPhase(new Resources(10,5,20));
    }
}