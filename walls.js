function WallTool() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
}

function WallConstructor(context,ngrid_x,ngrid_y) {
    this.context = context;
    this.start = new PIXI.Point(ngrid_x,ngrid_y);
    this.current = this.start;
    this.DOC = new PIXI.DisplayObjectContainer;
}

WallConstructor.prototype.update = function(delta) {
    var m_pos_x = this.context.stage.getMousePosition().x;
    var m_pos_y = this.context.stage.getMousePosition().y;
    var m_pos = new PIXI.Point(m_pos_x/this.context.map.tilewidth,
                           m_pos_y/this.context.map.tileheight);
    
    var g_pos = new PIXI.Point(Math.floor(m_pos.x),Math.floor(m_pos.y));
    var rel = new PIXI.Point(m_pos.x-g_pos.x-0.5,m_pos.y-g_pos.y-0.5);
    
    var s_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    s_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                    this.start.y*this.context.map.tileheight);
    this.DOC.addChild(s_spr);
    
    if(!pointInBox(m_pos,this.current,new PIXI.Point(this.current.x+1,this.current.y+1))) {
        this.current = g_pos;
        if(rel.x > rel.y && rel.x > -rel.y) this.drawWall('h',g_pos);
        else if(rel.y > rel.x && rel.y > -rel.x) this.drawWall('v',g_pos);
        else if(rel.x < rel.y && rel.x < -rel.y) this.drawWall('h',g_pos);
        else if(rel.y < rel.x && rel.y < -rel.x) this.drawWall('v',g_pos);
    }
}

WallConstructor.prototype.drawWall = function(initialDirection,g_pos) {
    for(var child in this.DOC.children) {
        this.DOC.removeChild(this.DOC.children[child]);
    }
    var h_dist = g_pos.x - this.current.x;
    var v_dist = g_pos.y - this.current.y;
    var h_dir = h_dist / Math.abs(h_dist);
    var v_dir = v_dist / Math.abs(v_dist);
    
    var s_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    s_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                    this.start.y*this.context.map.tileheight);
    this.DOC.addChild(s_spr);
    
    if(initialDirection == 'h') {
        drawHzLeg(this.start.y);
        var c_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
        c_spr.position = new PIXI.Point(g_pos.x*this.context.map.tilewidth,
                                        this.start.y*this.context.map.tileheight);
        this.DOC.addChild(c_spr);
        drawVtLeg(g_pos.x);
        
    } else if(initialDirection == 'v') {
        drawVtLeg(this.start.x);
        var c_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
        c_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                        g_pos.y*this.context.map.tileheight);
        this.DOC.addChild(c_spr);
        drawHzLeg(g_pos.y);
    }
    
    e_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    e_spr.position = new PIXI.Point(g_pos.x*this.context.map.tilewidth,
                                    g_pos.y*this.context.map.tileheight);
    this.DOC.addChild(e_spr);
    
    function drawHzLeg(g_pos_y) {
        for(var d0 = 1; d0 < Math.abs(h_dist); ++d0) {
            var d0r = h_dir*d0;
            alert(d0r);
            var w_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/wall.png"));
            w_spr.position = new PIXI.Point((this.start.x+d0r)*this.context.map.tilewidth,
                                            g_pos_y*this.context.map.tileheight);
            this.DOC.addChild(w_spr);
        }
    }
    function drawVtLeg(g_pos_x) {
        for(var d1 = 1; d1 < Math.abs(v_dist); ++d1) {
            var d1r = v_dir*d1;
            var w_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/wall.png"));
            w_spr.position = new PIXI.Point((g_pos_x+1)*this.context.map.tilewidth,
                                            (this.start.y+d1r)*this.context.map.tileheight);
            w_spr.rotation = Math.PI/2;
            this.DOC.addChild(w_spr);
        }
    }
}

function pointInBox(point,box_tl,box_br) {
    return (point.x >= box_tl.x && point.x < box_br.x && point.y >= box_tl.y && point.y < box_br.y);
}
