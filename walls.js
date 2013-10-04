function WallTool() {
    this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    this.sprite.anchor = new PIXI.Point(0.5,0.5);
}

function WallPlacementTool(context,ngrid_x,ngrid_y,quantity) {
    this.context = context;
    this.wallconst = new WallConstructor(this.context,ngrid_x,ngrid_y,quantity);
    this.context.animators.add(this.wallconst);
    this.context.tile_DO.addChild(this.wallconst.DOC);
}

WallPlacementTool.prototype.constructor = WallPlacementTool;

WallPlacementTool.prototype.placeWall = function() {
    var wallslayer = WallConstructor.wallsLayer(this.context.map);
    for(var i in wallslayer.data) wallslayer.data[i] = this.wallconst.data[i] ?
                                                 this.wallconst.data[i] : wallslayer.data[i];
    this.context.tile_DO.removeChild(this.wallconst.DOC);
    this.context.animators.remove(this.wallconst);
    this.context.map_DO.removeChild(this.context.tile_DO);
    this.context.tile_DO = loadTileMap(this.context.map);
    this.context.map_DO.addChildAt(this.context.tile_DO,0);
    
    return this.wallconst.used;
}

function WallConstructor(context,ngrid_x,ngrid_y,quantity) {
    this.context = context;
    this.tilenum = quantity;
    this.used = 1;
    this.start = new PIXI.Point(ngrid_x,ngrid_y);
    this.current = this.start;
    this.DOC = new PIXI.DisplayObjectContainer;
    this.dir = '0';
    this.impassable = getBlockedPlacementArray(this.context.map);
    this.h_dist = 0;
    this.v_dist = 0;
    this.data = new Array(this.context.map.width*this.context.map.height);
    for(var i = 0; i < this.data.length; ++i) this.data[i] = 0;
    
    var s_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    s_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                    this.start.y*this.context.map.tileheight);
    this.DOC.addChild(s_spr);
    this.data[this.start.y*this.context.map.width+this.start.x] = 2;
    
    this.context.buildMenu.updateText("walls","Walls x "+
                                          (this.context.resources.nWallTiles-this.used));
}

WallConstructor.prototype.constructor = WallConstructor;

WallConstructor.prototype.update = function(delta) {
    var m_pos_x = this.context.stage.getMousePosition().x;
    var m_pos_y = this.context.stage.getMousePosition().y;
    
    var m_pos = new PIXI.Point(m_pos_x/this.context.map.tilewidth,
                               m_pos_y/this.context.map.tileheight);
    
    var g_pos = new PIXI.Point(clamp(Math.floor(m_pos.x),0,this.context.map.width-1),
                               clamp(Math.floor(m_pos.y),0,this.context.map.height-1));
    var rel = new PIXI.Point(m_pos.x-this.start.x-0.5,m_pos.y-this.start.y-0.5);
    
    if(!pointInBox(m_pos,this.start,new PIXI.Point(this.start.x+1,this.start.y+1)) && 
       this.dir == '0') {
        if(rel.x > rel.y && rel.x > -rel.y) this.dir = 'h';
        else if(rel.y > rel.x && rel.y > -rel.x) this.dir = 'v';
        else if(rel.x < rel.y && rel.x < -rel.y) this.dir = 'h';
        else if(rel.y < rel.x && rel.y < -rel.x) this.dir = 'v';
    } else if(pointInBox(m_pos,
                          this.start,
                          new PIXI.Point(this.start.x+1,this.start.y+1)) &&
              this.dir != '0') {
        this.dir = '0';
    }
    if(!pointInBox(m_pos,this.current,new PIXI.Point(this.current.x+1,this.current.y+1))) {
        this.current = g_pos;
        this.drawWall(this.dir,g_pos);
        this.context.buildMenu.updateText("walls","Walls x "+
                                          (this.context.resources.nWallTiles-this.used));
    }
}

WallConstructor.prototype.drawWall = function(initialDirection,g_pos) {
    for(var i = this.DOC.children.length - 1; i >= 0; --i) {
        this.DOC.removeChild(this.DOC.children[i]);
    }
    for(i in this.data) this.data[i] = 0;
    
    var h_dist = g_pos.x - this.start.x;
    var v_dist = g_pos.y - this.start.y;
    
    //alert("Horizontal distance: "+h_dist+"\nVertical distance: "+v_dist);
    var s_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    s_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                    this.start.y*this.context.map.tileheight);
    this.DOC.addChild(s_spr);
    this.data[this.start.y*this.context.map.width+this.start.x] = 2;
    this.used = 1;
    if(this.used >= this.tilenum) return;
    
    if(initialDirection == 'h') {
        var actual_h_dist = this.unobstrHzDist(this.start.y,h_dist);
        var actual_v_dist = this.unobstrVtDist(this.start.x+actual_h_dist,v_dist);
        var h_dir = Math.round(actual_h_dist/Math.abs(actual_h_dist));
        var v_dir = Math.round(actual_v_dist/Math.abs(actual_v_dist));
        
        if(this.tilenum - this.used < Math.abs(actual_h_dist)) {
            actual_h_dist = h_dir*(this.tilenum - this.used);
            this.used = this.tilenum;
        } else {
            this.used += Math.abs(actual_h_dist);
        }
        
        this.drawHzLeg(this.start.y,actual_h_dist);
        var c_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
        c_spr.position = new PIXI.Point((this.start.x+actual_h_dist)*
                                             this.context.map.tilewidth,
                                        this.start.y*this.context.map.tileheight);
        this.DOC.addChild(c_spr);
        this.data[this.start.y*this.context.map.width+this.start.x+actual_h_dist] = 2;
        
        if(this.used >= this.tilenum) return;
        
        if(this.tilenum - this.used < Math.abs(actual_v_dist)) {
            actual_v_dist = v_dir*(this.tilenum - this.used);
            this.used = this.tilenum;
        } else {
            this.used += Math.abs(actual_v_dist);
        }
        
        this.drawVtLeg(this.start.x+actual_h_dist,actual_v_dist);
        
    } else if(initialDirection == 'v') {
        var actual_v_dist = this.unobstrVtDist(this.start.x,v_dist);
        var actual_h_dist = this.unobstrHzDist(this.start.y+actual_v_dist,h_dist);
        var h_dir = Math.round(actual_h_dist/Math.abs(actual_h_dist));
        var v_dir = Math.round(actual_v_dist/Math.abs(actual_v_dist));
        
        if(this.tilenum - this.used < Math.abs(actual_v_dist)) {
            actual_v_dist = v_dir*(this.tilenum - this.used);
            this.used = this.tilenum;
        } else {
            this.used += Math.abs(actual_v_dist);
        }
        
        this.drawVtLeg(this.start.x,actual_v_dist);
        var c_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
        c_spr.position = new PIXI.Point(this.start.x*this.context.map.tilewidth,
                                       (this.start.y+actual_v_dist)*
                                           this.context.map.tileheight);
        this.DOC.addChild(c_spr);
        this.data[(this.start.y+actual_v_dist)*this.context.map.width+this.start.x] = 2;
        
        if(this.used >= this.tilenum) return;
        
        if(this.tilenum - this.used < Math.abs(actual_h_dist)) {
            actual_h_dist = h_dir*(this.tilenum - this.used);
            this.used = this.tilenum;
        } else {
            this.used += Math.abs(actual_h_dist);
        }
        
        this.drawHzLeg(this.start.y+actual_v_dist,actual_h_dist);
    }
    
    e_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/walltower.png"));
    e_spr.position = new PIXI.Point((this.start.x+actual_h_dist)*this.context.map.tilewidth,
                                    (this.start.y+actual_v_dist)*
                                        this.context.map.tileheight);
    this.DOC.addChild(e_spr);
    this.data[(this.start.y+actual_v_dist)*this.context.map.width+
              this.start.x+actual_h_dist] = 2;
}

WallConstructor.prototype.drawHzLeg = function(g_pos_y,h_dist) {
    var h_dir = Math.round(h_dist / Math.abs(h_dist));
    for(var d0 = 1; d0 < Math.abs(h_dist); ++d0) {
        var d0r = h_dir*d0;
            
        var w_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/wall.png"));
        w_spr.position = new PIXI.Point((this.start.x+d0r)*this.context.map.tilewidth,
                                        g_pos_y*this.context.map.tileheight);
        this.DOC.addChild(w_spr);
        this.data[g_pos_y*this.context.map.width+this.start.x+d0r] = 24;
    }
}

WallConstructor.prototype.drawVtLeg = function(g_pos_x,v_dist) {
    var v_dir = v_dist / Math.abs(v_dist);
    for(var d1 = 1; d1 < Math.abs(v_dist); ++d1) {
        var d1r = v_dir*d1;
        
        var w_spr = new PIXI.Sprite(PIXI.Texture.fromImage("walls/wall.png"));
        w_spr.position = new PIXI.Point((g_pos_x+1)*this.context.map.tilewidth,
                                        (this.start.y+d1r)*this.context.map.tileheight);
        w_spr.rotation = Math.PI/2;
        this.DOC.addChild(w_spr);
        this.data[(this.start.y+d1r)*this.context.map.width+g_pos_x] = 28;
    }
}

WallConstructor.prototype.unobstrHzDist = function(g_pos_y,h_dist) {
    var h_dir = h_dist / Math.abs(h_dist);
    for(var d0 = 1; d0 <= Math.abs(h_dist); ++d0) {
        var d0r = h_dir*d0;
        if(this.impassable.array[this.impassable.width*g_pos_y+this.start.x+d0r])
            return h_dir*(Math.abs(d0r) - 1);
    }
    return h_dist;
}

WallConstructor.prototype.unobstrVtDist = function(g_pos_x,v_dist) {
    var v_dir = v_dist / Math.abs(v_dist);
    for(var d1 = 1; d1 <= Math.abs(v_dist); ++d1) {
        var d1r = v_dir*d1;
        if(this.impassable.array[this.impassable.width*(this.start.y+d1r)+g_pos_x])
            return v_dir*(Math.abs(d1r) - 1);
    }
    return v_dist;
}

WallConstructor.wallsLayer = function(tilemap) {
    for(var l in tilemap.layers) {
        if(tilemap.layers[l]["name"] == "Walls"){ return tilemap.layers[l]; alert("already exists");}
    }
    var layer = { "height":20,
                  "name":"Walls",
                  "opacity":1,
                  "properties":
                     {
                       "collidable":"true",
                       "no_placement":"true"
                     },
                  "type":"tilelayer",
                  "visible":true,
                  "width":20,
                  "x":0,
                  "y":0 
     };
     layer.data = new Array(layer.height*layer.width);
     for(var i = 0; i < layer.data.length; ++i) layer.data[i] = 0;
     tilemap.layers.push(layer);
     return layer;
}

function pointInBox(point,box_tl,box_br) {
    return (point.x >= box_tl.x && point.x < box_br.x && point.y >= box_tl.y && point.y < box_br.y);
}

function clamp(v,min,max) {
    return v < min ? min : (v > max ? max : v);
}
