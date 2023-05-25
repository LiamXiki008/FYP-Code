//Class used to create a tile object
class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.tileStatus = "empty";

        this.adjacentTiles = {
            left: null,
            right: null,
            top: null,
            bottom: null

        };



        this.material = new THREE.MeshBasicMaterial({
            color: "white",
            wireframe: false,
            transparent: true,
        });

       

      
        this.geometry = new THREE.BoxGeometry(1, 1, 0);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x + 0.5, this.y + 0.5, 0);
        this.mesh.name = "Tile";



        this.boundingBox = null;
        this.setBoundingBox();

        return this;
    }

    //Set the status of the tile
    setTileStatus(status) {
        this.tileStatus = status;
    }

    //Set the adjacent tiles for the tile
    setAdjacentTiles(tiles) {
        for (var i = 0; i < tiles.length; i++) {
            if (tiles[i].x == this.x - 1 && tiles[i].y == this.y) {
                this.adjacentTiles.left = tiles[i];
            }
            if (tiles[i].x == this.x + 1 && tiles[i].y == this.y) {
                this.adjacentTiles.right = tiles[i];
            }
            if (tiles[i].x == this.x && tiles[i].y == this.y - 1) {
                this.adjacentTiles.bottom = tiles[i];
            }
            if (tiles[i].x == this.x && tiles[i].y == this.y + 1) {
                this.adjacentTiles.top = tiles[i];
            }
        }
    }

    //Set the bounding box for the tile
    setBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    //Get the bounding box for the tile
    getTile(x,y){
        if(this.x == x && this.y == y){
            return this;
        }
        else{
            return null;
        }
    }


}