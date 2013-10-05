AStar = function(collisionarray,movementcostarray) {
    // Must have same dimensions
    this.c_array = collisionarray;
    this.m_array = movementcostarray;
    this.closedarray = new Array(this.c_array.width*this.c_array.height);
    
    this.path = [];
    this.waypointIndex = 0;
}

AStar.prototype.constructor = AStar;

AStar.prototype.nodeAtGridRef = function(gridref) {
    return this.closedarray[this.c_array.width*gridref.y+gridref.x];
}

AStar.prototype.findPath = function(gridref1,gridref2) {
    for(var i = 0; i < this.closedarray.length; ++i) 
        this.closedarray[i] = new AStar.Node(new PIXI.Point(i % this.c_array.width,
                                                Math.floor(i/this.c_array.width)),
                                                null,-1,-1);
    
    var finished = false;
    var openlist = [];
    
    this.start = gridref1;
    this.end = gridref2;
    
    var rootnode = this.nodeAtGridRef(gridref1);
    rootnode.previous = null;
    rootnode.g = 0;
    rootnode.h = this.heuristic(gridref1,gridref2);
    //alert(rootnode.p.x);
    rootnode.closed = true;
    
    openlist = openlist.concat(this.availableNodes(rootnode));
    var lcnode;

    while(!finished) {
        var lcindex = this.leastCostlyNodeIndex(openlist);
        lcnode = openlist[lcindex];
        
        //alert(lcnode.p.x+" "+lcnode.p.y);
        lcnode.closed = true;
        openlist.splice(lcindex,1);
        
        //alert(this.closedarray.toString());
        if(lcnode.p.x == gridref2.x && lcnode.p.y == gridref2.y) {
            console.log("WHOOP");
            finished = true;
        } else if(openlist.length == 0) {
            finished = true;
        } else {
            openlist = openlist.concat(this.availableNodes(lcnode));
        }
    }
    
    var pathnode = lcnode;
    var path = [];
    path.push(pathnode);
    
    while(pathnode !== rootnode) {
        pathnode = pathnode.previous;
        path.push(pathnode);
    }
    
    path.reverse();
    //alert("Path length: "+path.length);
    this.path = path;
}

AStar.prototype.nextWaypoint = function() {
    for(var w = this.waypointIndex + 1; w < this.path.length; ++w) {
        if(this.path[w].adjtoobst) {
            this.waypointIndex = w;
            return this.path[w].p;
        }
    }
    // Final node is not checked for adjtoobst so must be returned
    console.log("This is the last stop, choo choo");
    return this.path[this.path.length - 1].p;
}

AStar.prototype.availableNodes = function(node) {
    var adj = [];
    var min_x = -1;
    var max_x = 1;
    var min_y = -1;
    var max_y = 1;
    
    var gridref = node.p;
    var c_array = this.c_array;
    var m_array = this.m_array;
    
    if(gridref.x <= 0){ min_x = 0; node.adjtoobst = true; }
    else if(gridref.x >= c_array.width - 1){ max_x = 0; node.adjtoobst = true; }
    if(gridref.y <= 0){ min_y = 0; node.adjtoobst = true; }
    else if(gridref.y >= c_array.height - 1){ max_y = 0; node.adjtoobst = true; }
    //alert("Min x "+min_x+", max x "+max_x+"\nMin y "+min_y+" max y "+max_y);
    
    for(var j = min_y; j <= max_y; ++j) {
        for(var i = min_x; i <= max_x; ++i) {
            var curnode = this.nodeAtGridRef(new PIXI.Point(gridref.x+i,gridref.y+j));
            
            if(c_array.array[c_array.width*(gridref.y+j)+gridref.x+i] || curnode.closed) {
                if(c_array.array[c_array.width*(gridref.y+j)+gridref.x+i]) 
                    node.adjtoobst = true;
                //alert("nope");
                continue;
            }
            var m_cost = m_array.array[m_array.width*(gridref.y+j)+gridref.x+i];
            var g;
            var h = this.heuristic(new PIXI.Point(gridref.x+i,
                                                   gridref.y+j),
                                    this.end);
            if(i == 0 || j == 0) g = node.g+(m_cost);
            else g = node.g+(1.414*m_cost);
            
            if(curnode.open && g+h >= curnode.g+curnode.h) continue;
            else if(curnode.open) {
                curnode.previous = node;
                curnode.g = g;
                curnode.h = h;
                continue;
            }
            
            curnode.previous = node;
            curnode.g = g;
            curnode.h = h;
            curnode.open = true;
            adj.push(curnode);
        }
    }
    //alert("This time "+adj.length+" nodes were available.");
    return adj;
}

// Optimisations here I guess
AStar.prototype.heuristic = function(gridref,destination) {
    return Math.abs(destination.x - gridref.x) + Math.abs(destination.y - gridref.y);
}

AStar.prototype.leastCostlyNodeIndex = function(list) {
    var lowest = 0;
    var matching = [];
    matching.push(lowest);
    
    for(var n = 1; n < list.length; ++n) {
        var lowest_f = list[lowest].g+list[lowest].h;
        if(list[n].g+list[n].h < lowest_f) {
            matching.length = 0;
            lowest = n;
            matching.push(n);
        } else if(list[n].g+list[n].h == lowest_f) {
            matching.push(n);
        }
        //alert(list[lowest].g+" "+list[lowest].h);
    }
    
    // Choose the lowest distance to destination of same cost squares
    if(matching.length > 1) {
        var lowest_h = matching[0];
        for(var m = 1; m < matching.length; ++m) {
            if(list[matching[m]].h < list[lowest_h].h) lowest_h = matching[m];
        }
        lowest = lowest_h;
    }
    return lowest;
}

AStar.Node = function(gridref,previous,g,h) {
    this.p = gridref;
    this.previous = previous;
    this.g = g;
    this.h = h;
    this.adjtoobst = false;
    this.open = false;
    this.closed = false;
}
