//Class used to create the controlled levels
class ExperimentLevel{
    constructor(engine,levelCount,desiredDifficulty) {
        this.map = null;
        this.spawnRoom = null;

        this.finalRoom = null;

        this.MAX_ROOM_SIZE = 100;

        this.rooms = [];
        this.corridors = [];
        this.corridorsCount = 0;
        this.roomsCount = 0;
        this.roomSizes = [];

        this.treeDepth = 0;

        this.powerUps = [];
        this.loot = [];
        this.lootCount = 0;
        this.lootCollected = [];

        this.perimTiles = [];
        this.redTilesCount = 0;

        this.enemies = [];
        this.enemiesPerRoom = [];
        this.enemiesCount = 0;
        this.enemyTypes = [0, 0, 0, 0, 0];
        this.enemyFireRates = [];
        this.staticEnemies = 0;
        this.dynamicEnemies = 0;
        this.addedAggression = 0;
        this.healthRecovered = 0;
        this.shieldRecovered = 0;

        this.engine = engine;
        this.levelCount = levelCount;
       
        this.desiredDifficulty = desiredDifficulty;
        this.dataSent = false;

        this.levelDifficulty = 0;

        this.initialiseMap(levelCount);
        this.levelAttempts = 0;

        this.levelTimeStart = Date.now();
    
    }

    //Initialise the map
    initialiseMap(levelCount) {

        var treeDepthMax = 0;
        switch (levelCount) {
            case 1:
                treeDepthMax = 2;
                break;
            case 2:
                treeDepthMax = 3;
                break;
            case 3:
                treeDepthMax = 3;
                break;
            case 4:
                treeDepthMax = 4;
                break;
            case 5:
                treeDepthMax = 4;
                break;

            case 6:
                treeDepthMax = 5;
                break;
        }

        
        let leafs = [];
        let l;

        var rootSizes = [200,250,275,300,325,350]

        let root = new Leaf(0, 0, rootSizes[this.levelCount-1], rootSizes[this.levelCount-1], null);
        leafs.push(root);
       
        let didSplit = true;
        while (didSplit) {
            
            didSplit = false;
            for (let i = 0; i < leafs.length; i++) {
                l = leafs[i];
                if (l.leftChild == null && l.rightChild == null && this.treeDepth< treeDepthMax) {
                    
                   
                    if (l.width > this.MAX_ROOM_SIZE || l.height > this.MAX_ROOM_SIZE || Math.random() > 0.25) {
                        if (l.splitEvenly()) {
                            
                            leafs.push(l.leftChild);
                            leafs.push(l.rightChild);
                            didSplit = true;
                            this.treeDepth++;

                        }
                    }
                }
            }
        }

        //Create the rooms
        this.createRooms(root);
        //Create the corridors
        this.createPaths();
        //Create the perimeter
        this.createPerimeter();
        //Spawn the enemies
        this.spawnEnemies(levelCount);
        this.getEnemyRooms();
        //Spawn the loot
        this.spawnLoot(levelCount);
        this.setDynamicStatic();

        this.spawnRoom = this.rooms[0];
        this.finalRoom = this.rooms[this.rooms.length - 1];

        this.map = new THREE.Group();

         //Group the rooms and corridors together
         for (let i = 0; i < this.rooms.length; i++) {
            this.map.add(this.rooms[i].mesh);
        }

        //Add the corridors to the map group
        for (let i = 0; i < this.corridors.length; i++) {

            this.map.add(this.corridors[i].mesh);
        }

        //Add the perimeter tiles to the map group
        for (let i = 0; i < this.perimTiles.length; i++) {

            //Occasionally change the colour of the perimeter tiles to red
            if (Math.random() > 0.9) {
                this.perimTiles[i].material.color.setHex(0xff0000);
                this.redTilesCount++;
            }
                
            this.map.add(this.perimTiles[i].mesh);
        }

        //Add the loot to the map group
        for(let i=0; i<this.loot.length; i++){
            this.map.add(this.loot[i].mesh);
        }


        for (let i = 0; i < this.enemies.length; i++) {
            //Add the enemies group to the map group
            this.map.add(this.enemies[i].mesh);
            this.map.add(this.enemies[i].shieldMesh);         
        }

        //set the mesh name of the map
        this.map.name = "Map";

        this.levelDifficulty = this.calculateDifficulty();


    }

    //Function used to create the rooms
    createRooms(leaf) {

        // this function generates all the rooms and hallways for this Leaf and all of its children.
        if (leaf.leftChild != null || leaf.rightChild != null) {
            // this leaf has been split, so go into the children leafs
            if (leaf.leftChild != null) {
                this.createRooms(leaf.leftChild);
            }
            if (leaf.rightChild != null) {
                this.createRooms(leaf.rightChild);
            }

        } else if (leaf.leftChild == null && leaf.rightChild == null) {

            
            var roomSize = new THREE.Vector2(Math.floor(leaf.width-50), Math.floor(leaf.height-50));
            //Make the position of the room in the centre of the leaf
            var roomPos = new THREE.Vector2(Math.floor(leaf.width / 2 - roomSize.x / 2), Math.floor(leaf.height / 2 - roomSize.y / 2));
            
            //var roomPos = new THREE.Vector2(Math.floor(Math.random() * (leaf.width - roomSize.x - 1)) + 1, Math.floor(Math.random() * (leaf.height - roomSize.y - 1)) + 1);


           
            //Check if rooms overlap
            var roomOverlap = false;
            for (let i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i].x < leaf.x + roomPos.x + roomSize.x && this.rooms[i].x + this.rooms[i].width > leaf.x + roomPos.x && this.rooms[i].y < leaf.y + roomPos.y + roomSize.y && this.rooms[i].y + this.rooms[i].height > leaf.y + roomPos.y) {
                    roomOverlap = true;

                }
            }

            //If rooms overlap, don't create room
            if (roomOverlap) {
                return;
            }
            //Create the quad
            var room = new Room(leaf.x, leaf.y, roomSize.x, roomSize.y, this.roomsCount);

            leaf.room = room;
            leaf.roomWidth = roomSize.x;
            leaf.roomHeight = roomSize.y;
            leaf.x = leaf.x ;
            leaf.y = leaf.y;

             //Randomise an rgb colour
            // var r = Math.floor(Math.random() * 255) + 1;
            // var g = Math.floor(Math.random() * 255) + 1;
            // var b = Math.floor(Math.random() * 255) + 1;
            // var colour = new THREE.Color("rgb(" + r + "," + g + "," + b + ")");
            

            // //Show the leafs
            // var geometry = new THREE.BoxGeometry(leaf.width, leaf.height,1);
            // var material = new THREE.MeshBasicMaterial({
            //     color: colour,
            // });
            // var cube = new THREE.Mesh(geometry, material);
            // cube.position.set(leaf.x + leaf.width / 2, leaf.y + leaf.height / 2 , -1);
            // this.engine.scene.add(cube);

            this.rooms.push(room);
            this.roomsCount++;

        }

    }

    //Function used to create the paths between the rooms
    createPaths() {
        var left, right;
        for (let i = 0; i < this.rooms.length; i++) {
            if (i == this.rooms.length - 1) {
                left = this.rooms[i];
                right = this.rooms[0];
            } else {
                left = this.rooms[i];
                right = this.rooms[i + 1];
            }
            this.createCorridors(left, right);
        }
    
    }

    //Function used to create the corridors
    createCorridors(left, right) {  
        var size = 8;
        //Get the center of each room
        var x1 = left.x + left.width / 2;
        var y1 = left.y + left.height / 2;
        var x2 = right.x + right.width / 2;
        var y2 = right.y + right.height / 2;

        var w = x2 - x1;
        var h = y2 - y1;
        var direction;

        if (y2 > y1) {
            y2 = y2 - 3;
        } else if (y2 < y1) {
            y2 = y2 + 3;
        }

        if (w < 0) {
            if (h < 0) {
                if (Math.random() < 0.5) {
                    direction = 0;

                    this.corridors.push(new Corridor(x2, y1, Math.abs(w), size, direction));
                    this.corridors.push(new Corridor(x2, y2, size, Math.abs(h) + size, 1 - direction));

                } else {
                    direction = 1;
                    this.corridors.push(new Corridor(x2, y2, Math.abs(w) + size, size, direction));
                    this.corridors.push(new Corridor(x1, y2, size, Math.abs(h), 1 - direction));

                }
            } else if (h > 0) {
                if (Math.random() < 0.5) {
                    direction = 0;
                    this.corridors.push(new Corridor(x2, y1, Math.abs(w), size, direction));
                    this.corridors.push(new Corridor(x2, y1, size, Math.abs(h), 1 - direction));

                } else {
                    direction = 1;
                    this.corridors.push(new Corridor(x2, y2, Math.abs(w) + size, size, direction));
                    this.corridors.push(new Corridor(x1, y1, size, Math.abs(h), 1 - direction));
                }
            } else if (w == 0) {
                direction = 1;
                this.corridors.push(new Corridor(x2, y2, Math.abs(w) + size, size, direction));
                this.corridors.push(new Corridor(x1, y1, size, Math.abs(h), 1 - direction));

            }
        } else if (w > 0) {
            if (h < 0) {
                if (Math.random() < 0.5) {
                    direction = 0;
                    this.corridors.push(new Corridor(x1, y2, Math.abs(w), size, direction));
                    this.corridors.push(new Corridor(x1, y2, size, Math.abs(h), 1 - direction));

                } else {
                    direction = 1;
                    this.corridors.push(new Corridor(x1, y1, Math.abs(w) + size, size, direction));
                    this.corridors.push(new Corridor(x2, y2, size, Math.abs(h), 1 - direction));

                }
            } else if (h > 0) {
                if (Math.random() < 0.5) {
                    direction = 1;
                    this.corridors.push(new Corridor(x1, y1, Math.abs(w) + size, size, direction));
                    this.corridors.push(new Corridor(x2, y1, size, Math.abs(h), 1 - direction));

                } else {
                    direction = 0;
                    this.corridors.push(new Corridor(x1, y2, Math.abs(w), size, direction));
                    this.corridors.push(new Corridor(x1, y1, size, Math.abs(h), 1 - direction));

                }
            } else if (h == 0) {
                direction = 1;
                this.corridors.push(new Corridor(x1, y1, Math.abs(w) + size, size, direction));
                this.corridors.push(new Corridor(x2, y2, size, Math.abs(h), 1 - direction));

            }
        } else if (w == 0) {
            if (h < 0) {
                direction = 0;
                this.corridors.push(new Corridor(x2, y2, size, Math.abs(h), direction));
            } else if (h > 0) {
                direction = 0;
                this.corridors.push(new Corridor(x1, y1, size, Math.abs(h), direction));
            }

        }

        this.corridorsCount++;
        //If corridor intersects with another room , increment the corridor count 
        
    }

    //Function used to create the enemies
    spawnEnemies(levelCount) {

        var enemyTypeHoldingKey = -1;

        switch(levelCount) {
            case 1:
                enemyTypeHoldingKey = 1;
                break;
            case 2:
                enemyTypeHoldingKey = 2;
                break;
            case 3:
                enemyTypeHoldingKey = 3;
                break;
            case 4:
                enemyTypeHoldingKey = 4;
                break;
            case 5:
                enemyTypeHoldingKey = 5;
                break;
            case 6:
                enemyTypeHoldingKey = 5;
                break;

                default:
                enemyTypeHoldingKey = 5;
        }

       
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];

            
            //Random number of enemies based on the size of the room
            //var numEnemies = Math.floor((tmp.width * tmp.height / 800));
            var numEnemies = Math.floor((tmp.width * tmp.height / (1200-(levelCount*100))));
            console.log(numEnemies);

            this.enemiesPerRoom.push(numEnemies);
            
            var innerArea = tmp.getInnerArea();

            for (var j = 0; j < numEnemies; j++) {


            //Generate a random position in between the max and min x and y keeping in mind the size of the enemy which is 3x3 and the size of the perimeter tiles which is 1x1
                var x = Math.floor(Math.random() * (innerArea.maxX - innerArea.minX - 3)) + innerArea.minX + 2;
                var y = Math.floor(Math.random() * (innerArea.maxY - innerArea.minY - 3)) + innerArea.minY + 2;


                //Randomly select an enemy type
                var type = Math.floor(Math.random() * 5)+1;
               
                //Create the enemy
                var enemy = new Enemy(x, y,type, this.enemiesCount,this.engine);
                enemy.aggression += 5* levelCount;

                //Check if the position is occupied
                var occupied = false;
                for (var k = 0; k < this.enemies.length; k++) {
                    //Check if the bounding box of the enemy is colliding with the bounding box of another enemy
                    if (enemy.boundingBox.intersectsBox(this.enemies[k].boundingBox)) {
                        occupied = true;
                        break;
                    }
                }

                //If the position is not occupied then spawn an enemy
                if (!occupied) {
                    
                    this.enemies.push(enemy);
                    
                    this.enemiesCount++;
                } else {
                    j--;
                }
        }
        }

        //Assign the key to an enemy ensuring that the type is equal to the enemyTypeHoldingKey
        var keyAssigned = false;
        while (!keyAssigned) {
            var enemyIndex = Math.floor(Math.random() * this.enemies.length);
            if (this.enemies[enemyIndex].type == enemyTypeHoldingKey) {
                this.enemies[enemyIndex].hasKey = true;
                keyAssigned = true;
            }
        }

    }

    //Function used to create the loot
    spawnLoot(levelCount) {
        var numLoot = 0;
        switch(levelCount){
            case 1:
            numLoot = 2;
            break;

            case 2:
            numLoot = 2;
            break;

            case 3:
            numLoot = 4;
            break;

            case 4:
            numLoot = 3;
            break;

            case 5:
            numLoot = 3;
            break;

            case 6:
            numLoot = 3;
            break;
        }   

        //Spawn a random number of loot in each room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            //randomise the number of loot to spawn in each room
            
            for (var j = 0; j < numLoot; j++) {


                var innerArea = tmp.getInnerArea();

                //Generate a random position in between the max and min x and y keeping in mind the size of the enemy which is 3x3 and the size of the perimeter tiles which is 1x1
                var x = Math.floor(Math.random() * (innerArea.maxX - innerArea.minX - 3)) + innerArea.minX + 1;
                var y = Math.floor(Math.random() * (innerArea.maxY - innerArea.minY - 3)) + innerArea.minY + 1;

                
                //Randomise a number between 0 and 4
                var type = Math.floor(Math.random() * 5);
                var loot = new Loot(x, y, type, this.lootCount);
                loot.room = i;

                //If the enemy is on a perimeter tile, move it to the center of the tile
                if (x % 2 == 0) {
                    x++;
                }
                if (y % 2 == 0) {
                    y++;
                }


                //Check if there is already an enemy at that position keeping in mind the size of the enemy which is 3x3
                var occupied = false;
                for (var k = 0; k < this.enemies.length; k++) {
                    //Check if the bounding box of the enemy is colliding with the bounding box of another enemy
                    if (loot.boundingBox.intersectsBox(this.enemies[k].boundingBox)) {
                        occupied = true;
                        break;
                    }
                }

                //If the position is not occupied then spawn an enemy
                if (!occupied) {
                    this.lootCount++;
                    this.loot.push(loot);
                } else {
                    j--;
                    
                }

               
            }
        }


    }
   

    getEnemyRooms() {

        //Get the room that the enemy is in
        for (var i = 0; i < this.enemies.length; i++) {
            var tmp = this.enemies[i];
            var room = this.isInRoom(tmp.x, tmp.y);
            if (room != -1) {
                tmp.room = room;
            }
        }
    }

    
    //Function used to check if the player is in a room
    isInRoom(x, y) {
        //Check if is in room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            if (x >= tmp.x && x <= tmp.x + tmp.width && y >= tmp.y && y <= tmp.y + tmp.height) {
                return i;
                
            }
        }
        return -1;
    }

    //Function used to check if the player is in a corridor
    isInCorridor(x, y) {
        //Check if is in corridor
        for (var i = 0; i < this.corridors.length; i++) {
            var tmp = this.corridors[i];
            //Check if it is in the middle of the corridor
            if (x >= tmp.x && x <= tmp.x + tmp.width - 1 && y >= tmp.y && y <= tmp.y + tmp.height - 1) {
                return i;
            }
        }
        return -1;
    }

    //Function used to get the width of the map
    getMapWidth() {
        var min =
            this.rooms[0].x;
        var max = 0;
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            if (tmp.x < min) {
                min = tmp.x;
            }
            if (tmp.x + tmp.width > max) {
                max = tmp.x + tmp.width;
            }
        }
        return max - min;
    }

     //Get the actual height of the map
     getMapHeight() {
        var min =
            this.rooms[0].y;
        var max = 0;
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            if (tmp.y < min) {
                min = tmp.y;
            }
            if (tmp.y + tmp.height > max) {
                max = tmp.y + tmp.height;
            }
        }
        return max - min;
    }

    //Function used to create the perimeter
    createPerimeter() {
        //Get the perimeter tiles   
        var perimeter = [];
        for (var i = 0; i < this.rooms.length; i++) {
            for (var j = 0; j < this.rooms[i].perimeter.length; j++) {

                perimeter.push(this.rooms[i].perimeter[j]);
            }
        }

        for (var i = 0; i < this.corridors.length; i++) {
            for (var j = 0; j < this.corridors[i].perimeter.length; j++) {

                perimeter.push(this.corridors[i].perimeter[j]);
            }
        }

        //Remove any tiles that are inside a room
        for (var i = 0; i < this.rooms.length; i++) {
            for (var j = 0; j < this.rooms[i].tiles.length; j++) {
                var tmp = this.rooms[i].tiles[j];
                for (var k = 0; k < perimeter.length; k++) {
                    if (tmp.x == perimeter[k].x && tmp.y == perimeter[k].y) {
                        perimeter.splice(k, 1);
                    }
                }
            }
        }


        //Check the region of the corridor and remove any tiles that are not on the edge of the region
        for (var i = 0; i < this.corridors.length; i++) {
            for (var j = 0; j < this.corridors[i].tiles.length; j++) {
                var tmp = this.corridors[i].tiles[j];
                for (var k = 0; k < perimeter.length; k++) {
                    if (tmp.x == perimeter[k].x && tmp.y == perimeter[k].y) {
                        perimeter.splice(k, 1);
                    }
                }
            }
        }

        this.perimTiles = perimeter;

        this.setPerimTilesTexture();

    }

    //Function used to set the texture of the perimeter tiles
    setPerimTilesTexture(){
        var texture = new THREE.TextureLoader().load("../images/tile1.png");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        //Rotate the texture
        texture.rotation = -Math.PI / 2;

        for (var i = 0; i < this.perimTiles.length; i++) {
            var tmp = this.perimTiles[i];
            tmp.mesh.material.map = texture;
        }
    }

    //Function used to get the direction of the collision for movement purposes
    getCollisionDirection(tileBB, playerSpaceship) {

        //Get the side of the tile that the player is colliding with
        var playerPosition = playerSpaceship.mesh.position;
        var tileCenter = tileBB.getCenter(new THREE.Vector3());
        var collisionDirection = new THREE.Vector3().subVectors(playerPosition, tileCenter).normalize();

        var absX = Math.abs(collisionDirection.x);
        var absY = Math.abs(collisionDirection.y);

        if (absX > absY) {
            if (collisionDirection.x > 0) {
                collisionDirection.x = 1;
                collisionDirection.y = 0;

                collisionDirection.state = "right";

            } else {
                collisionDirection.x = -1;
                collisionDirection.y = 0;

                collisionDirection.state = "left";
            }
        } else {
            if (collisionDirection.y > 0) {
                collisionDirection.x = 0;
                collisionDirection.y = 1;

                collisionDirection.state = "top";

            } else {
                collisionDirection.x = 0;
                collisionDirection.y = -1;

                collisionDirection.state = "bottom";
            }
        }

        return collisionDirection;
    }

    //Function used to get the rooms
    getEnemyRooms() {

        //Get the room that the enemy is in
        for (var i = 0; i < this.enemies.length; i++) {
            var tmp = this.enemies[i];
            var room = this.isInRoom(tmp.x, tmp.y);
            if (room != -1) {
                tmp.room = room;
            }
        }
    }

    //Get the enemy types
    getEnemyTypes() {
        //Get the type of enemy
        for (var i = 0; i < this.enemies.length-1; i++) {
            var tmp = this.enemies[i];
            this.enemyTypes[tmp.type]++;
        }

        return this.enemyTypes;
    }

    //Get the room sizes
    getRoomSizes() {
        //Get the size of each room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            this.roomSizes[i] = ((tmp.innerArea.maxX - tmp.innerArea.minX) / 2) * ((tmp.innerArea.maxY - tmp.innerArea.minY) / 2);
        }

        return this.roomSizes;

    }

    //Function used to spawn a key
    spawnKey(x,y){
        var loot = new Loot(x, y, 5, this.lootCount);
        loot.mesh.material.color.setHex(0xffff00);
        this.lootCount++;
        this.loot.push(loot);
        
        console.log("Key spawned at: " + x + ", " + y);

        this.engine.scene.add(loot.mesh);

    }

    //Function used to get the enemy fire rates
    getEnemyFireRates() {
        //Get the fire rate of each enemy
        for (var i = 0; i < this.enemies.length; i++) {
            var tmp = this.enemies[i];
            this.enemyFireRates[i] = tmp.fireRate;
        }

        return this.enemyFireRates;
    }

    //Function used to get the tree depth
    getTreeDepth() {
        return this.treeDepth;
    }
  
    //Function used to get the enemies per room
    getEnemiesPerRoom() {
        return this.enemiesPerRoom;
    }

    //Get the number of static enemies
    getStaticEnemyCount() {
        return this.staticEnemies;
    }

    //Get the number of dynamic enemies
    getDynamicEnemyCount() {
        return this.dynamicEnemies;
    }

    //Get the number of static and dynamic enemies
    setDynamicStatic(){
        for(var i = 0; i < this.enemies.length; i++){
            if(this.enemies[i].isDynamic){
                this.dynamicEnemies++;
            } else {
                this.staticEnemies++;
            }
        }
    }

     //Create a function to calculate the difficulty of the level
     calculateDifficulty() {

        //Calculate the difficulty
        var difficulty = 0;

        difficulty += (this.staticEnemies * 0.4);
        difficulty += (this.dynamicEnemies * 0.6);

        difficulty += (this.roomsCount * 0.5);
        difficulty += (this.corridorsCount * 0.1);

        difficulty += (this.enemyTypes[0] * 0.1);
        difficulty += (this.enemyTypes[1] * 0.2);
        difficulty += (this.enemyTypes[2] * 0.3);
        difficulty += (this.enemyTypes[3] * 0.4);
        difficulty += (this.enemyTypes[4] * 0.5); 

        difficulty += (this.redTilesCount * 0.05);

        difficulty += this.addedAggression;

        difficulty -= (this.lootCount * 0.1);

        //Calculate the sum of the room sizes
         var sum = 0;
         var sizes = [];
         sizes = this.getRoomSizes();

         for(var i = 0; i < sizes.length; i++){
             sum += sizes[i];
         }

        difficulty += ((this.enemies.length/sum) * 0.5);
        console.log("Difficulty: " + difficulty);

        return difficulty;
    }

    
    reset(){

        //Put the enemies back in their starting positions
        for(let i = 0; i < this.enemies.length; i++){
            let tmp = this.enemies[i];
            tmp.mesh.position.set(tmp.startingPosition.x,tmp.startingPosition.y, tmp.startingPosition.z);
            tmp.shieldMesh.position.set(tmp.startingPosition.x,tmp.startingPosition.y, tmp.startingPosition.z);
            tmp.x = tmp.startingPosition.x;
            tmp.y = tmp.startingPosition.y;
            tmp.z = tmp.startingPosition.z;
            tmp.health = tmp.maxHealth;
            tmp.shield = 100;
            tmp.shieldMesh.material.opacity = 0.5;
            
            tmp.boundingBox.makeEmpty();
            tmp.boundingBox.setFromObject(tmp.mesh);

            tmp.mesh.visible = true;
            tmp.shieldMesh.visible = true;
        }

        //Reset the loot
        for(let i = 0; i < this.loot.length; i++){
            let tmp = this.loot[i];
            tmp.mesh.visible = true;
            tmp.boundingBox.makeEmpty();
            tmp.boundingBox.setFromObject(tmp.mesh);
        }

        //Remove all the bullets from the scene
        for(let i = 0; i < engine.game.playerSpaceship.gun.bullets.length; i++){
            engine.game.playerSpaceship.gun.bullets[i].killBullet();
            engine.scene.remove(engine.game.playerSpaceship.gun.bullets[i].mesh);   
        }

        this.engine.game.playerSpaceship.speed = 0.15;
        this.engine.game.playerSpaceship.damage = 5;
        this.engine.game.playerSpaceship.health = 400;
        this.engine.game.playerSpaceship.shield = 200;
        this.engine.game.playerSpaceship.gun.fireRate = 0.1;

        document.querySelectorAll(".loot-row img").forEach(function(e){
            e.style.opacity = 0.5;
        });

        this.engine.game.playerSpaceship.hasKey = false;
        this.engine.game.closeExitDoor();


        this.levelAttempts++;

    }
}