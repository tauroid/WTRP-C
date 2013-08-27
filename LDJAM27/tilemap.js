function loadTileMap (tilemap) {
    var usedGids = {};
    var tilemapcontainer = new PIXI.DisplayObjectContainer;
    
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
                
                tilemapcontainer.addChild(tilespr);
            }
        }
        
        //alert("Finished with "+tilemap.layers[l].name);
    }
    return tilemapcontainer;
}

function getCollidableArray(tilemap) {
    var collidableArray = new Array(tilemap.width*tilemap.height);
    for(var i = 0; i < tilemap.width*tilemap.height; ++i) collidableArray[i] = 0;
    for(var l in tilemap.layers) {
        if (tilemap.layers[l].properties !== undefined &&
            tilemap.layers[l].properties.collidable == "true") {
            for(var d in tilemap.layers[l].data) {
                collidableArray[d] = tilemap.layers[l].data[d] == 0 ? collidableArray[d] : 1;
            }
        }
    }
    for(var z in tilemap.turrets.entities) {
        var turret = tilemap.turrets.entities[z];
        collidableArray[turret.grid_y*tilemap.width+turret.grid_x] = 1;
    }
    return { width: tilemap.width, height: tilemap.height, array: collidableArray };
}

function getBlockedPlacementArray(tilemap) {
    var blockedArray = new Array(tilemap.width*tilemap.height);
    for(var i = 0; i < tilemap.width*tilemap.height; ++i) blockedArray[i] = 0;
    for(var l in tilemap.layers) {
        if (tilemap.layers[l].properties !== undefined &&
            tilemap.layers[l].properties.no_placement == "true") {
            for(var d in tilemap.layers[l].data) {
                blockedArray[d] = tilemap.layers[l].data[d] == 0 ? blockedArray[d] : 1;
            }
        }
    }
    return { width: tilemap.width, height: tilemap.height, array: blockedArray };
}

function getBaseArray(tilemap) {
    var baseArray = new Array(tilemap.width*tilemap.height);
    for(var i = 0; i < tilemap.width*tilemap.height; ++i) baseArray[i] = 0;
    for(var l in tilemap.layers) {
        if (tilemap.layers[l].properties !== undefined &&
            tilemap.layers[l].properties.base == "true") {
            for(var d in tilemap.layers[l].data) {
                baseArray[d] = tilemap.layers[l].data[d] == 0 ? baseArray[d] : 1;
            }
        }
    }
    return { width: tilemap.width, height: tilemap.height, array: baseArray };
}

function detectCollision(clsnArrayObject,grid_x,grid_y) {
    return clsnArrayObject.array[grid_y*clsnArrayObject.width+grid_x] == 1;
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