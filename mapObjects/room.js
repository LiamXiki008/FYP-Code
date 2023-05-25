//Class used to create a room object
class Room {
    constructor(x, y, width, height, roomID) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.width = Math.round(width);
        this.height = Math.round(height);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: false
        });

        
        this.geometry = new THREE.BoxGeometry(this.width, this.height, 0);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x + this.width / 2, this.y + this.height / 2, 0);



        //set the room id
        this.id = roomID;

        //Set the room name
        this.mesh.name = "Room " + this.id;

        this.tiles = [];
        this.boundingBox = null;
        this.perimeter = [];

        this.innerArea = {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
            width: 0,
            height: 0
        };

        
        this.setTiles();
        this.setPerimeter();
        this.createBoundingBox();

        this.setInnerArea();

        return this;
    }

    //Set the tiles for the room
    setTiles() {
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                //Create a tile for each position in the room except for the edges
                if (i != 0 && i != this.width - 1 && j != 0 && j != this.height - 1) {

                    this.tiles.push(new Tile(this.x + i, this.y + j));
                }
            }
        }
    }

    //Set the perimeter of the room
    setPerimeter() {
        //Set the perimeter of the room
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                //Add the perimeter tiles to the perimeter array
                if (i == 0 || i == this.width - 1 || j == 0 || j == this.height - 1) {
                    this.perimeter.push(new Tile(this.x + i, this.y + j));
                }
            }
        }
    }

    //Create a bounding box for the room
    createBoundingBox() {
        //Create a bounding box for the room
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    //Get the bounding box for the room
    getBoundingBox() {
        return this.boundingBox;
    }

    //Get the inner area of the room
    getInnerArea() {
        return this.innerArea;
    }

    //Set the inner area of the room
    setInnerArea() {
        //The inner area is the area of the room -1 from each side
        this.innerArea.minX = this.x + 1;
        this.innerArea.maxX = this.x + this.width - 1;
        this.innerArea.minY = this.y + 1;
        this.innerArea.maxY = this.y + this.height - 1;
    }

}