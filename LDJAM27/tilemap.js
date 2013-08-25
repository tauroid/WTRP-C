function loadTileMap (tilemap, stage) {
    var usedGids = {};
    
    for(var l in tilemap.layers) {
        for(var d in tilemap.layers[l].data) {
            var gid = tilemap.layers[l].data[d];
            var tile = null;
            
            if (!gidUsed(gid,usedGids)) {
                for(var i = tilemap.tilesets.length-1; i >= 0; --i) {
                    var tileset = tilemap.tilesets[i];
                    
                    if(tileset.firstgid <= gid) {
                        var tileloc = gid - tileset.firstgid;
                        var tilesetwidth = Math.floor(tileset.imagewidth/tileset.tilewidth);
                        tilebase = PIXI.BaseTexture.fromImage(tileset.image);
                        frame = { 
                            x: tileset.tilewidth*(tileloc % tilesetwidth),
                            y: tileset.tileheight*Math.floor(tileloc/tilesetwidth),
                            width: tileset.tilewidth,
                            height: tileset.tileheight
                        }
                        tile = new PIXI.Texture(tilebase, frame);
                        //alert(tile.frame.x+" "+tile.frame.y+" "+tile.frame.width+" "+tile.frame.height);
                        
                        usedGids[gid] = tile;
                        //alert("Loading tileset "+tileset.name+" at "+tileset.image);
                        break;
                    }
                }
            }
            else tile = usedGids[gid];
            
            if (tile !== null) {
                tilespr = new PIXI.Sprite(tile);
                tilespr.position.x = (d % tilemap.width)*tilemap.tilewidth;
                tilespr.position.y = Math.floor(d/tilemap.width)*tilemap.tileheight;
                //alert("This tile goes at x="+tilespr.position.x+", y="+tilespr.position.y);
                
                stage.addChild(tilespr);
            }
        }
        
        //alert("Finished with "+tilemap.layers[l].name);
    }
}

function getCollidableArray(tilemap) {
    var collidableArray = new Array(tilemap.width*tilemap.height);
    for(var i in collidableArray) collidableArray[i] = 0;
    for(var l in tilemap.layers) {
        if (tilemap.layers[l].collidable == "true") {
            for(var d in tilemap.layers[l].data) {
                colliableArray[d] = tilemap.layers[l].data[d] == 0 ? collidableArray[d] : 1;
            }
        }
    }
    return { width: tilemap.width, height: tilemap.height, array: collidableArray };
}

function gidUsed(gid,usedGids) {
    used = false;
    for(var g in usedGids) {
        if(usedGids.hasOwnProperty(g)) {
            if (g == gid) used = true;
        }
    }
    return used;
}