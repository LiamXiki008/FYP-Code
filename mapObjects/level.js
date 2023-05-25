class Level {
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
        this.boxes = [];

        this.engine = engine;
        this.levelCount = levelCount;
       
        this.desiredDifficulty = desiredDifficulty;

        this.levelDifficulty = 0;

        this.dataSent = false;
      
        this.transitionMatrixHarder = [
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
        ];

        this.currentStateEasier = 0;

        this.transitionMatrixEasier = [
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],
            [0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11,0.11],         
        ];

        this.currentStateHarder = 0;

        console.log("Desired Difficulty: " + this.desiredDifficulty);    

        this.initialiseMap();
        this.levelAttempts = 0;

        this.levelTimeStart = Date.now();
        console.log("Level time start: " + this.levelTimeStart);
    
    }


    initialiseMap() {

        let leafs = [];
        let l;
        
        
        var rootSizes = [200,250,275,300,325,350]

        let root = new Leaf(0, 0, rootSizes[this.levelCount], rootSizes[this.levelCount], null);
        leafs.push(root);
       
        let didSplit = true;
        while (didSplit) {
            
            didSplit = false;
            for (let i = 0; i < leafs.length; i++) {
                l = leafs[i];
                if (l.leftChild == null && l.rightChild == null && this.treeDepth< (this.levelCount+3)) {
                    
                   
                    if (l.width > this.MAX_ROOM_SIZE || l.height > this.MAX_ROOM_SIZE || Math.random() > 0.25) {
                        if (l.split()) {
                            
                            leafs.push(l.leftChild);
                            leafs.push(l.rightChild);
                            didSplit = true;
                            this.treeDepth++;

                        }
                    }
                }
            }
        }

        this.createRooms(root);
        this.createPaths();
        this.createPerimeter();
        this.spawnEnemies();
        this.getEnemyRooms();
        this.spawnLoot();
        this.setDynamicStatic();

        
        //this.getRoom(root);
        
        this.spawnRoom = this.rooms[0];
        this.finalRoom = this.rooms[this.rooms.length - 1];
        
        this.map = new THREE.Group();
      
        //Group the rooms and corridors together
        for (let i = 0; i < this.rooms.length; i++) {
            this.map.add(this.rooms[i].mesh);
        }


        for (let i = 0; i < this.corridors.length; i++) {

            this.map.add(this.corridors[i].mesh);
        }

        for (let i = 0; i < this.perimTiles.length; i++) {

            //Occasionally change the colour of the perimeter tiles to red
            if (Math.random() > 0.9) {
                this.perimTiles[i].material.color.setHex(0xff0000);
                this.redTilesCount++;
            }
                
            this.map.add(this.perimTiles[i].mesh);
        }

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


        while(Math.abs(this.levelDifficulty - this.desiredDifficulty) > 5){
            if(this.levelDifficulty > this.desiredDifficulty){

                this.makeLevelEasier();
                
                var switchNum = this.currentStateEasier+1;

                switch(switchNum){
                    case 1:
                        //Remove a static enemy
                        if(this.staticEnemies > 0){
                         //Randomise enemy type
                         let randomEnemyType = Math.floor(Math.random() * 5) + 1;
                             let removeEnemySuccess = this.removeEnemy(randomEnemyType,false);
                                if(removeEnemySuccess){

                                console.log("Removed a static enemy");
                                this.staticEnemies--;
                                this.enemyTypes[randomEnemyType]--;
                                } 
                                else {
                                    console.log("Failed to remove enemy");
                                }
                        }
                        break;
                    case 2:
                        //Remove a dynamic enemy
                        if(this.dynamicEnemies > 0){
                            //Randomise enemy type
                            let randomEnemyType = Math.floor(Math.random() * 5) + 1;

                            let enemyRemoveSuccess = this.removeEnemy(randomEnemyType,true);
                            if(enemyRemoveSuccess){
                                console.log("Removed a dynamic enemy");
                                this.dynamicEnemies--;
                                this.enemyTypes[randomEnemyType]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }
                        }
                        break;
                    
                    case 3:
                        //Remove enemies of type 4
                        //Randomise true or false
                        let randomBool = Math.floor(Math.random() * 2) + 1;
                        if(randomBool == 1){

                            let enemyRemoveSuccess = this.removeEnemy(4,true);
                            if(enemyRemoveSuccess){
                                console.log("Removed a dynamic enemy of type 4");

                            this.dynamicEnemies--;
                            this.enemyTypes[4]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }

                        }else{
                            let enemyRemoveSuccess = this.removeEnemy(4,false);

                            if(enemyRemoveSuccess){
                                console.log("Removed a static enemy of type 4");
                                this.staticEnemies--;
                                this.enemyTypes[4]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }

                        }
                        
                        break;
                    case 4:
                        //Remove enemies of type 3
                         //Randomise true or false
                         let randomBool2 = Math.floor(Math.random() * 2) + 1;
                         if(randomBool2 == 1){
                             let enemyRemoveSuccess = this.removeEnemy(3,true);
                                if(enemyRemoveSuccess){
                                    this.dynamicEnemies--;
                                    this.enemyTypes[3]--;
                                } 
                                else {
                                    console.log("Failed to remove enemy");
                                }
                         }else{

                            let enemyRemoveSuccess = this.removeEnemy(3,false);
                            if(enemyRemoveSuccess){

                             console.log("Removed a static enemy of type 3");
                             this.staticEnemies--;
                             this.enemyTypes[3]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }

                         }
                        break;
                    case 5:
                        //Remove enemies of type 2
                        //Randomise true or false
                        let randomBool3 = Math.floor(Math.random() * 2) + 1;
                        if(randomBool3 == 1){
                            let enemyRemoveSuccess = this.removeEnemy(2,true);
                            if(enemyRemoveSuccess){
                                console.log("Removed a dynamic enemy of type 2");
                                this.dynamicEnemies--;
                                this.enemyTypes[2]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }

                        }else{
                            let enemyRemoveSuccess = this.removeEnemy(2,false);
                            if(enemyRemoveSuccess){
                                console.log("Removed a static enemy of type 2");
                                this.staticEnemies--;
                                this.enemyTypes[2]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }
                        }
                        break;
                    case 6:
                        //Remove enemies of type 1
                        //Randomise true or false
                        let randomBool4 = Math.floor(Math.random() * 2) + 1;
                        if(randomBool4 == 1){
                            let enemyRemoveSuccess = this.removeEnemy(1,true);
                            if(enemyRemoveSuccess){
                                console.log("Removed a dynamic enemy of type 1");
                                this.dynamicEnemies--;
                                this.enemyTypes[1]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }

                        }else{
                            let enemyRemoveSuccess = this.removeEnemy(1,false);
                            if(enemyRemoveSuccess){
                                console.log("Removed a static enemy of type 1");
                                this.staticEnemies--;
                                this.enemyTypes[1]--;
                            }
                            else {
                                console.log("Failed to remove enemy");
                            }
                        }
                        break;

                        case 7:
                            //Remove loot
                            let addSuccess = this.addLoot();
                            if(addSuccess){
                                console.log("Added loot");
                            }
                            else {
                                console.log("Failed to add loot");
                            }

                            break;

                        case 8:
                            this.makeEnemiesLessAggressive();
                            console.log("Made enemies less aggressive");
                            break;

                        case 9:
                            console.log("Changing enemy holding key");
                            let changeKey = this.changeEnemyHoldingKey(true);
                            if(changeKey){
                                console.log("Changed enemy holding key");
                            }
                            else {
                                console.log("Failed to change enemy holding key");
                            }

                            break;

                    default:
                        //Remove enemies of type 1
                        break;
                }


            } else if(this.levelDifficulty < this.desiredDifficulty){
                //Make the level harder
                this.makeLevelHarder();

                var switchNumHarder = this.currentStateHarder+1;

                switch(switchNumHarder){
                    case 1:
                        //Add a static enemy
                        //Randomise enemy type
                        let randomEnemyType = Math.floor(Math.random() * 5) + 1;
                        var enemyAdd = this.addEnemy(randomEnemyType,false);
                        if(enemyAdd){
                        console.log("Added a static enemy");
                        this.staticEnemies++;
                        this.enemyTypes[randomEnemyType]++;
                        }
                        else {
                            console.log("Failed to add enemy");
                        }

                        break;
                    case 2:
                        //Add a dynamic enemy
                        //Randomise enemy type
                        let randomEnemyType2 = Math.floor(Math.random() * 5) + 1;
                        var enemyAdd = this.addEnemy(randomEnemyType2,true);
                        if(enemyAdd){
                        console.log("Added a dynamic enemy");
                        this.dynamicEnemies++;
                        this.enemyTypes[randomEnemyType2]++;
                        }
                        else {
                            console.log("Failed to add enemy");
                        }

                        break;
                   
                    case 3:
                        //Add enemies of type 4
                        //Randomise true or false
                        let randomBool = Math.floor(Math.random() * 2) + 1;
                        if(randomBool == 1){
                            var enemyAdd = this.addEnemy(4,true);
                            if(enemyAdd){
                            console.log("Added a dynamic enemy of type 4");
                            this.dynamicEnemies++;
                            this.enemyTypes[4]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }

                        }else{
                            var enemyAdd = this.addEnemy(4,false);
                            if(enemyAdd){
                            console.log("Added a static enemy of type 4");
                            this.staticEnemies++;
                            this.enemyTypes[4]++;
                            } 
                            else {
                                console.log("Failed to add enemy");
                            }
                        }
                        break;
                    case 4:
                        //Add enemies of type 3
                        //Randomise true or false
                        let randomBool2 = Math.floor(Math.random() * 2) + 1;
                        if(randomBool2 == 1){
                            var enemyAdd = this.addEnemy(3,true);
                            if(enemyAdd){
                            console.log("Added a dynamic enemy of type 3");
                            this.dynamicEnemies++;
                            this.enemyTypes[3]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }

                        }else{
                            var enemyAdd = this.addEnemy(3,false);
                            if(enemyAdd){
                            console.log("Added a static enemy of type 3");
                            this.staticEnemies++;
                            this.enemyTypes[3]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }
                        }
                        break;
                    case 5:
                        //Add enemies of type 2
                        //Randomise true or false
                        let randomBool3 = Math.floor(Math.random() * 2) + 1;
                        if(randomBool3 == 1){
                            var enemyAdd = this.addEnemy(2,true);
                            if(enemyAdd){
                            console.log("Added a dynamic enemy of type 2");
                            this.dynamicEnemies++;
                            this.enemyTypes[2]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }
                        }else{
                            var enemyAdd = this.addEnemy(2,false);
                            if(enemyAdd){
                            console.log("Added a static enemy of type 2");
                            this.staticEnemies++;
                            this.enemyTypes[2]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }
                        }

                        break;
                    case 6:
                        //Add enemies of type 1
                        //Randomise true or false
                        let randomBool4 = Math.floor(Math.random() * 2) + 1;
                        if(randomBool4 == 1){    
                            var enemyAdd = this.addEnemy(1,true);
                            if(enemyAdd){
                            console.log("Added a dynamic enemy of type 1");
                            this.dynamicEnemies++;
                            this.enemyTypes[1]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }

                        }else{
                            var enemyAdd = this.addEnemy(1,false);
                            if(enemyAdd){
                            console.log("Added a static enemy of type 1");
                            this.staticEnemies++;
                            this.enemyTypes[1]++;
                            }
                            else {
                                console.log("Failed to add enemy");
                            }
                        }
                        break;

                    case 7:
                        //Add Loot
                        let removeSuccess = this.removeLoot();
                        if(removeSuccess){
                            console.log("Removed loot");
                        }
                        else {
                            console.log("Failed to remove loot");
                        }

                        break;


                    case 8:
                        this.makeEnemiesMoreAggressive();
                        console.log("Made enemies more aggressive");
                        break;

                    case 9:
                        console.log("Changing enemy holding key");
                        let changedKey = this.changeEnemyHoldingKey(false);
                        if(changedKey){
                            console.log("Changed enemy holding key");
                        }
                        else {
                            console.log("Failed to change enemy holding key");
                        }

                        break;

                    default:
                        //Add enemies of type 0
                        break;

                }

            }
            this.levelDifficulty = this.calculateDifficulty();
        }

       
        console.log(this.boxes);
        console.log(this.rooms);
    }

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

            var roomSize = new THREE.Vector2(Math.floor(Math.random() * (leaf.width - 2)) + 15, Math.floor(Math.random() * (leaf.height - 2)) + 15);
            var roomPos = new THREE.Vector2(Math.floor(Math.random() * (leaf.width - roomSize.x - 1)) + 1, Math.floor(Math.random() * (leaf.height - roomSize.y - 1)) + 1);

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
            var room = new Room(leaf.x + roomPos.x, leaf.y + roomPos.y, roomSize.x, roomSize.y, this.roomsCount);

            leaf.room = room;
            leaf.roomWidth = roomSize.x;
            leaf.roomHeight = roomSize.y;
            leaf.x = leaf.x + roomPos.x;
            leaf.y = leaf.y + roomPos.y;
        
            this.rooms.push(room);
            this.roomsCount++;

        }


    }

    getRoom(leaf) {
        if (leaf.room != null) {
            return leaf.room;
        } else {

            if (leaf.leftChild != null) {
                return this.getRoom(leaf.leftChild);
            } else {
                return this.getRoom(leaf.rightChild);
            }
        }

    }

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

    //Get the actual width of the map from the smallest x to the biggest x
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

    spawnEnemies() {
        //Spawn a random number of enemies in each room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];

            
            //Random number of enemies based on the size of the room
            var numEnemies = Math.floor((tmp.width * tmp.height / 1000));
            
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

        //Pick a random enemy to have the key
        let randomEnemyIndex = Math.floor(Math.random() * this.enemies.length) + 1;
        this.enemies[randomEnemyIndex].hasKey = true;
        console.log("Enemy " + randomEnemyIndex + " has the key");
    }

    spawnLoot() {
        //Spawn a random number of loot in each room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];

            //Random number of loot based on the size of the room
            var numLoot = Math.floor((Math.random() * 3) + 1);
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

        // var keySpawned = false;
        // while (!keySpawned) {
        //     //spawn a key in a random room
        //     var room = Math.floor(Math.random() * (this.rooms.length-1))+1;
            
        //     var tmp = this.rooms[room];

        //     var innerArea = tmp.getInnerArea();

        //     //Generate a random position in between the max and min x and y keeping in mind the size of the enemy which is 3x3 and the size of the perimeter tiles which is 1x1
        //     var x = Math.floor(Math.random() * (innerArea.maxX - innerArea.minX - 3)) + innerArea.minX + 1;
        //     var y = Math.floor(Math.random() * (innerArea.maxY - innerArea.minY - 3)) + innerArea.minY + 1;

        //     var loot = new Loot(x, y, 5, this.lootCount);
        //     loot.room = i;

        //     //If the enemy is on a perimeter tile, move it to the center of the tile
        //     if (x % 2 == 0) {
        //         x++;
        //     }
        //     if (y % 2 == 0) {
        //         y++;
        //     }

        //     //Check if there is already an enemy at that position keeping in mind the size of the enemy which is 3x3
        //     var occupied = false;
        //     for (var k = 0; k < this.enemies.length; k++) {
        //         //Check if the bounding box of the enemy is colliding with the bounding box of another enemy
        //         if (loot.boundingBox.intersectsBox(this.enemies[k].boundingBox)) {
        //             occupied = true;
        //             break;
        //         }
        //     }

        //     //If the position is not occupied then spawn an enemy
        //     if (!occupied) {
        //         //Change the colour of the key mesh to yellow
        //         loot.mesh.material.color.setHex(0xffff00);
        //         this.lootCount++;
        //         this.loot.push(loot);
        //         keySpawned = true;
                

        //     } else {
        //         j--;
               
        //     }
        // }

    }

    //Spawn a key 
    spawnKey(x,y){
        var loot = new Loot(x, y, 5, this.lootCount);
        loot.mesh.material.color.setHex(0xffff00);
        this.lootCount++;
        this.loot.push(loot);
        
        console.log("Key spawned at: " + x + ", " + y);

        this.engine.scene.add(loot.mesh);
    }

    //Get the enemy rooms
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

    //Get the types of enemies
    getEnemyTypes() {
        //Get the type of enemy
        for (var i = 0; i < this.enemies.length-1; i++) {
            var tmp = this.enemies[i];
            this.enemyTypes[tmp.type]++;
        }

        return this.enemyTypes;
    }

    //Get the size of each room
    getRoomSizes() {
        //Get the size of each room
        for (var i = 0; i < this.rooms.length; i++) {
            var tmp = this.rooms[i];
            this.roomSizes[i] = ((tmp.innerArea.maxX - tmp.innerArea.minX) / 2) * ((tmp.innerArea.maxY - tmp.innerArea.minY) / 2);
        }

        return this.roomSizes;

    }

    //Get the enemy fire rates
    getEnemyFireRates() {
        //Get the fire rate of each enemy
        for (var i = 0; i < this.enemies.length; i++) {
            var tmp = this.enemies[i];
            this.enemyFireRates[i] = tmp.fireRate;
        }

        return this.enemyFireRates;
    }

    //Get the tree depth
    getTreeDepth() {
        return this.treeDepth;
    }
  
    //Get the number of enemies per room
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

    //Set the number of static and dynamic enemies
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

            for(var i = 0; i < this.enemies.length; i++){
                //Get the index of the enemy that has the key
                if(this.enemies[i].hasKey){
                    var keyEnemyType = this.enemies[i].type;
                }
            }

            difficulty += keyEnemyType;

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
        

        //A function to add enemies to the map
        addEnemy(type, isDynamic){
                
            //Find a room to add the enemy to
            let randomNum = Math.floor(Math.random() * (this.rooms.length-1)) +1;
            let room = this.rooms[randomNum];
            let x = Math.floor(Math.random() * (room.innerArea.maxX - room.innerArea.minX)) + room.innerArea.minX;
            let y = Math.floor(Math.random() * (room.innerArea.maxY - room.innerArea.minY)) + room.innerArea.minY;

            //Check if the tile is occupied
            var enemy = new Enemy(x, y, type, this.enemyCount, this.engine);
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
            //Add the enemy
            
            enemy.room = randomNum;
            enemy.isDynamic = isDynamic;
            if(enemy.type!=4){
                enemy.enemyGun.setEnemyGunSpawnPoint(x, y,enemy.type);
            }
            this.enemies.push(enemy);
            this.enemyCount++;

            //Add the enemy to the map
            this.map.add(enemy.mesh);
            this.map.add(enemy.shieldMesh);

            return true;

             } else {
                console.log("Enemy not added");
                return false;
             }
            
                
        }

        //A function to remove enemies from the map
        removeEnemy(type, isDyamic){

            var enemyIndex = -1;

            for(let i = 0; i < this.enemies.length; i++){
                if(this.enemies[i].type == type && this.enemies[i].isDynamic == isDyamic && this.enemies[i].hasKey == false){
                    
                    enemyIndex = i;
                    break;
                }
            }

            if(enemyIndex == -1){
                return false;
            }

            console.log("Enemy removed: " + enemyIndex);
            console.log("Enemy type: " + this.enemies[enemyIndex].type);
            console.log(this.map.getObjectByName("Enemy" + enemyIndex));

            //Make the bounding box empty
            this.enemies[enemyIndex].boundingBox.makeEmpty();
            //Remove the enemy
            this.map.remove(this.map.getObjectByName("Enemy" + enemyIndex));
            //Remove the shield
            this.map.remove(this.map.getObjectByName("Shield" + enemyIndex));

            //Remove the enemy from the array
            this.enemies.splice(enemyIndex, 1);
            //Rearrange the enemies array
            for(let i = enemyIndex; i < this.enemies.length; i++){
                this.enemies[i].mesh.name = "Enemy" + i;
                this.enemies[i].shieldMesh.name = "Shield" + i;
                this.enemies[i].enemyID = i;
            }

            return true;
        }

        //A function to add loot to the map
        addLoot(){
            //Find a room to add the loot to
            let randomNum = Math.floor(Math.random() * this.rooms.length);
            let room = this.rooms[randomNum];
            let x = Math.floor(Math.random() * (room.innerArea.maxX - room.innerArea.minX)) + room.innerArea.minX;
            let y = Math.floor(Math.random() * (room.innerArea.maxY - room.innerArea.minY)) + room.innerArea.minY;

            //Check if the tile is occupied
            let occupied = false;
            for(let i = 0; i < this.enemies.length; i++){
                let tmp = this.enemies[i];
                if(tmp.x == x && tmp.y == y){
                    occupied = true;
                    break;
                }

                if(tmp.x + 1 == x && tmp.y == y){
                    occupied = true;
                    break;
                }

                if(tmp.x == x && tmp.y + 1 == y){
                    occupied = true;
                    break;
                }

                if(tmp.x + 1 == x && tmp.y + 1 == y){
                    occupied = true;
                    break;
                }

            }

            if(occupied){
                return false;
            }

            //Add the loot
            var type = Math.floor(Math.random() * 3);

            var loot = new Loot(x, y, type);
            this.loot.push(loot);
            this.map.add(loot.mesh);

            return true;
        }

        //A function to remove loot from the map
        removeLoot(){
            var lootIndex = -1;

            //Randomly select a loot to remove
            lootIndex = Math.floor(Math.random() * this.loot.length);

            var loot = this.loot[lootIndex];

            if(loot.type == "key"){
                return false;
            }

            if(lootIndex == -1 || this.loot.length <= 1 ){
                return false;
            }

            //Remove the loot
            this.map.remove(this.map.getObjectByName("Loot" + lootIndex));
            //Remove the loot from the array
            this.loot.splice(lootIndex, 1);
            //Rearrange the loot array
            for(let i = lootIndex; i < this.loot.length; i++){
                this.loot[i].mesh.name = "Loot" + i;
            }
            
            return true;
        }


        //A function to reset the level
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
            //Update the opacity of the key
            document.querySelector("#key").style.opacity = 0.5;

            this.engine.game.closeExitDoor();


            this.levelAttempts++;

        }

        //A function to make the level easier
        makeLevelEasier(){

           //Traverse the markov chain to find the next state
              var currentState = this.transitionMatrixEasier[this.currentStateEasier];
              var nextState = -1;
              var randomNum = Math.random();
              var sum = 0;
 
                for(let i = 0; i < this.transitionMatrixEasier[this.currentStateEasier].length; i++){
                    sum += currentState[i];
                    if(randomNum <= sum){
                        nextState = i;
                        break;
                    }
                }

                if(nextState == -1){
                    nextState = this.transitionMatrixEasier.length - 1;
                } 
                this.currentStateEasier = nextState;
        }

        //A function to make the level harder
        makeLevelHarder(){

            //Traverse the markov chain to find the next state
            var currentState = this.transitionMatrixHarder[this.currentStateHarder];
            var nextState = -1;
            var randomNum = Math.random();
            var sum = 0;

            for(let i = 0; i < this.transitionMatrixHarder[this.currentStateHarder].length; i++){
                sum += currentState[i];
                if(randomNum <= sum){
                    nextState = i;
                    break;
                }
            }

            if(nextState == -1){
                nextState = this.transitionMatrixHarder.length - 1;
            }
            this.currentStateHarder = nextState;
        }

        //A function to make the enemies more aggressive
        makeEnemiesMoreAggressive(){
        
            for(let i = 0; i < this.enemies.length; i++){
                let tmp = this.enemies[i];
                tmp.aggression += 3;
            }
            
            this.addedAggression += 3;
        }

        //A function to make the enemies less aggressive
        makeEnemiesLessAggressive(){
            
            for(let i = 0; i < this.enemies.length; i++){
                let tmp = this.enemies[i];
                if(tmp.aggression > 3){
                tmp.aggression -= 3;
            }
            
        }
        this.addedAggression -= 3;
        }

        //A function to change the enemy holding the key
        changeEnemyHoldingKey(easier){
            if(easier){
                //Get the index of the enemy holding the key
                var index = -1;
                for(let i = 0; i < this.enemies.length; i++){
                    if(this.enemies[i].hasKey){
                        index = i;
                        break;
                    }
                }

                //Get the type of the enemy holding the key
                var type = this.enemies[index].type;
                console.log("Current type"+type);
                //Randomly select a new enemy to hold the key the has a smaller type
                var newType = -1;
                if(type == 0){
                    newType = 0;
                    return false;
                } else{
                
                var newEnemyIndex = -1;
                var newType = type - 1;

                while(newEnemyIndex == -1 && newType >= 0){
                    for(let i = 0; i < this.enemies.length; i++){
                        if(this.enemies[i].type == newType){
                            newEnemyIndex = i;
                            break;
                        }
                    }
                    newType--;
                }

                if(newEnemyIndex == -1){
                //Give the new enemy the key
                this.enemies[newEnemyIndex].hasKey = true;
                this.enemies[index].hasKey = false;
                console.log("New type"+this.enemies[newEnemyIndex].type);
                return true;
                }else{
                    console.log("New type"+this.enemies[newEnemyIndex].type);
                    return false;
                }

            }

                //Find an enemy of the new 
            }else{
                var index = -1;
                for(let i = 0; i < this.enemies.length; i++){
                    if(this.enemies[i].hasKey){
                        index = i;
                        break;
                    }
                }

                //Get the type of the enemy holding the key
                var type = this.enemies[index].type;
                console.log("Current type"+type);

                //Randomly select a new enemy to hold the key the has a smaller type
                var newIndex = -1;
                var newType = type + 1;

                if(type == 5){
                    newIndex = 5;
                    return false;
                } else{

                    while(newEnemyIndex == -1 && newType <= 5){
                        for(let i = 0; i < this.enemies.length; i++){
                            if(this.enemies[i].type == newType){
                                newIndex = i;
                                break;
                            }
                        }
                        
                        newType++;
                    }

                //Give the new enemy the key
                if(newIndex != -1){
                this.enemies[newIndex].hasKey = true;
                this.enemies[index].hasKey = false;
                console.log("New type"+this.enemies[newIndex].type);
                return true;
                } else{
                    console.log("No enemy of type "+newType+" found");
                    return false;
                }
            }
        }
    }
}