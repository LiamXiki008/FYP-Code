//Class used to create a corridor object
class Corridor {
    constructor(x, y, width, height, direction) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.color = 'white';
        this.direction = direction; // 0 = vertical, 1 = horizontal

        this.startPoint = {
            x: 0,
            y: 0
        };

        this.endPoint = {
            x: 0,
            y: 0
        };


        this.tiles = [];
        this.perimeter = [];
        this.boundingBox = null;

        this.material = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: false
        });
        this.geometry = new THREE.BoxGeometry(this.width, this.height, 0);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x + this.width / 2, this.y + this.height / 2, 0);

        this.setTiles();
        this.setPerimeter();
        this.createBoundingBox();
        this.setStartPoint(this.x, this.y);
        this.setEndPoint(this.x + this.width, this.y + this.height);

        return this;
    }

    //Set the tiles for the corridor
    setTiles() {
        //Set tiles on the outer perimeter of the corridor
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                //Create a tile for each position in the corridor except for the edges
                if (i != 0 && i != this.width - 1 && j != 0 && j != this.height - 1) {

                    this.tiles.push(new Tile(this.x + i, this.y + j));
                }
            }
        }

    }

    //Set the perimeter of the corridor
    setPerimeter() {
        //Set the perimeter of the corridor
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                //Add the perimeter tiles to the perimeter array
                if (i == 0 || i == this.width - 1 || j == 0 || j == this.height - 1) {
                    this.perimeter.push(new Tile(this.x + i, this.y + j));
                }
            }
        }
    }

    //Create a bounding box for the corridor
    createBoundingBox() {
        //Create a bounding box for the corridor
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    //Get the bounding box for the corridor
    getBoundingBox() {
        return this.boundingBox;
    }

    //Set the start point of the corridor
    setStartPoint(x, y) {
        this.startPoint.x = x;
        this.startPoint.y = y;
    }

    //Set the end point of the corridor
    setEndPoint(x, y) {
        this.endPoint.x = x;
        this.endPoint.y = y;
    }

}