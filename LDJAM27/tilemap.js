function newTileMap (id) {
    this.tileMap = JSON.parse(document.getElementById(id).text);
    return this.tileMap;
}