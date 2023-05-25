//Game class responsible for handling the game logic and game mechanics

class Game {

    //Constructor
    constructor(engine,experimentMode) {
        this.isCameraMoving = false;
        this.levelCount = 0;
        this.levelNumber = 0;

        this.isExperiment = experimentMode;
    
        this.experimentLevelsGenerated = [];
        
        //Set the difficulty of the first level
        if(!this.isExperiment){
        this.levelDifficulty = this.calculateDesiredDifficulty();
        this.level = new Level(engine, this.levelCount, this.levelDifficulty);
        }else{
            //Randomise a number between 1-6 
            this.levelNumber = Math.floor(Math.random() * 6) + 1;
            
            //Check if the level has already been generated
            if(this.experimentLevelsGenerated.includes(this.levelNumber)){
                //If it has, generate a new number
                while(this.experimentLevelsGenerated.includes(this.levelNumber)){
                    this.levelNumber = Math.floor(Math.random() * 6) + 1;
                }
            }
            console.log("Level number: " + this.levelNumber);
            this.level = new ExperimentLevel(engine, this.levelNumber, this.levelDifficulty);
            this.experimentLevelsGenerated.push(this.levelNumber);
        }

        console.log(this.levelDifficulty);
        //Create a new player spaceship
        this.playerSpaceship = new PlayerSpaceship(engine);

        this.username = "";

        this.engine = engine;
        
        this.enemiesKilled = 0;

        this.currentMoveStartTime = 0;

        this.playerParameters = [];

        this.levelParameters = [];

        this.levelComplete = false;

        this.score = 0;

        //Set the initial player parameters
        this.initialisePlayerParams();
        //Set the initial level parameters
        this.setLevelParameters();

        this.levelisOver = false;
        this.controlsEnabled = true;

        
    
    }


    //Function used as a listener for user input
    checkInput(engine) {

        //Move forward
        if (engine.input.isKeyDown('w') && this.controlsEnabled) {

            //Move forward in the direction the player spaceship is facing
            //Calculate the speed of the spaceship taking into account the acceleration
            this.playerSpaceship.direction = 1;

            
            if(this.playerSpaceship.speed < this.playerSpaceship.maxSpeed && !this.playerSpaceship.speedBoost){
                this.playerSpaceship.speed += this.playerSpaceship.acceleration;
            } 
            
            if(this.playerSpaceship.speed > this.playerSpaceship.maxSpeed && !this.playerSpaceship.speedBoost){
                this.playerSpaceship.speed = this.playerSpaceship.maxSpeed;
            }
            
            if(this.playerSpaceship.speedBoost){
                this.playerSpaceship.speed = this.playerSpaceship.maxSpeed +5;
            }

            // Update position based on speed and direction
            this.playerSpaceship.mesh.position.x += (this.playerSpaceship.speed/100) * Math.cos(this.playerSpaceship.mesh.rotation.z);
            this.playerSpaceship.mesh.position.y += (this.playerSpaceship.speed/100) * Math.sin(this.playerSpaceship.mesh.rotation.z);

            this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

            //Increment the distance traveled
            this.playerParameters[this.levelCount].distanceTraveled += 0.15;

            if (this.currentMoveStartTime == 0) {
                this.currentMoveStartTime = Date.now();
            }

        }
      
        //Move backward
        if (engine.input.isKeyDown('s') && this.controlsEnabled) {
            //Move backward in the direction the player spaceship is facing
            this.playerSpaceship.direction = -1;

            if(this.playerSpaceship.speed < this.playerSpaceship.maxSpeed && !this.playerSpaceship.speedBoost){
                this.playerSpaceship.speed += this.playerSpaceship.acceleration;
            } 

            if(this.playerSpaceship.speed > this.playerSpaceship.maxSpeed && !this.playerSpaceship.speedBoost){
                this.playerSpaceship.speed = this.playerSpaceship.maxSpeed;
            }
           
            this.playerSpaceship.mesh.position.x -= (this.playerSpaceship.speed/100) * Math.cos(this.playerSpaceship.mesh.rotation.z);
            this.playerSpaceship.mesh.position.y -= (this.playerSpaceship.speed/100) * Math.sin(this.playerSpaceship.mesh.rotation.z);
            this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

            //Increment the distance traveled
            this.playerParameters[this.levelCount].distanceTraveled += 0.15;

            if (this.currentMoveStartTime == 0 && this.controlsEnabled) {
                this.currentMoveStartTime = Date.now();
            }

        }

        //Rotate the player spaceship
        if (engine.input.isKeyDown('a') && this.controlsEnabled) {
            this.playerSpaceship.mesh.rotation.z += 0.04;
            this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);
           
        }
        //Rotate the player spaceship
        if (engine.input.isKeyDown('d') && this.controlsEnabled) {
            this.playerSpaceship.mesh.rotation.z -= 0.04;
            this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);
            
        }

        //Fire the gun
        if (engine.input.isKeyDown('k') && this.controlsEnabled) {
            this.playerSpaceship.gun.fire(this.playerSpaceship);
        }

        // if (engine.input.isKeyDown('q') && this.controlsEnabled) {
        //     engine.camera.position.z += 1;
        // }
        // if (engine.input.isKeyDown('e') && this.controlsEnabled) {
        //     engine.camera.position.z -= 1;
        // }
        // if (engine.input.isKeyDown('p') && this.controlsEnabled) {
        //     this.levelisOver = true;
        // }
        // if (engine.input.isKeyDown('arrowUp') && this.controlsEnabled) {
        //     engine.camera.position.y += 1;
        // }
        // if (engine.input.isKeyDown('arrowDown') && this.controlsEnabled) {
        //     engine.camera.position.y -= 1;
        // }
        // if (engine.input.isKeyDown('arrowLeft') && this.controlsEnabled) {
        //     engine.camera.position.x -= 1;
        // }
        // if (engine.input.isKeyDown('arrowRight') && this.controlsEnabled) {
        //     engine.camera.position.x += 1;
        // }

        //Update bounding box of player spaceship
        this.playerSpaceship.updateBoundingBox();

        //Calculate moving time
        if (!(engine.input.isKeyDown('w') || engine.input.isKeyDown('s'))) {

            if (this.playerSpaceship.speed > 0) {
                this.playerSpaceship.speed -= this.playerSpaceship.acceleration*2;
            
                this.playerSpaceship.mesh.position.x += (this.playerSpaceship.speed/100) * Math.cos(this.playerSpaceship.mesh.rotation.z) * this.playerSpaceship.direction;
                this.playerSpaceship.mesh.position.y += (this.playerSpaceship.speed/100) * Math.sin(this.playerSpaceship.mesh.rotation.z) * this.playerSpaceship.direction;
                this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);
                this.playerParameters[this.levelCount].distanceTraveled += 0.15; 
                
                if (this.currentMoveStartTime != 0) {
                var timeSpentMoving = (Date.now() - this.currentMoveStartTime) / 1000;

                this.playerParameters[this.levelCount].timeSpentMoving += timeSpentMoving;
                this.currentMoveStartTime = 0;

            }

            } else {
               
            this.playerSpaceship.speed = 0;
            this.playerSpaceship.direction = 0;
        }

        }

        //Update HUD elements
        document.getElementById("health_current").innerHTML = this.playerSpaceship.health;
        document.getElementById("shield_current").innerHTML = this.playerSpaceship.shield;
        document.getElementById("score_current").innerHTML = this.score;
        

    }

    //Function used to create a new level
    createNewLevel(levelPassed) {

        this.controlsEnabled = true;
        this.playerSpaceship.hasKey = false;
        this.engine.input.startedMoving = false;
        this.levelComplete = false;
        this.levelisOver = false;

        while (this.engine.scene.children.length > 0) {
            this.engine.scene.remove(this.engine.scene.children[0]);
        }

        console.log(this.playerParameters[this.levelCount]);
        console.log(this.levelParameters);

        this.enemiesKilled = 0;
        this.levelCount++;
        
        
        //Set the difficulty of the next level
        if(!this.isExperiment){
            this.levelDifficulty = this.calculateDesiredDifficulty();
            console.log("level difficulty desired: " + this.levelDifficulty);
            this.level = new Level(engine, this.levelCount, this.levelDifficulty);
            }else{
                //Randomise a number between 1-6 
                this.levelNumber = Math.floor(Math.random() * 6) + 1;
                //Check if the level has already been generated
                if(this.experimentLevelsGenerated.includes(this.levelNumber)){
                    //If it has, generate a new number
                    while(this.experimentLevelsGenerated.includes(this.levelNumber)){
                        this.levelNumber = Math.floor(Math.random() * 6) + 1;
                    }
                }
    
                console.log("level number: " + this.levelNumber);
                this.level = new ExperimentLevel(engine, this.levelNumber, this.levelDifficulty);
                this.experimentLevelsGenerated.push(this.levelNumber);
            }

        if(levelPassed){
            this.score += 100;
        }

        //Reset the player spaceship
        this.playerSpaceship.speed = 0.25;
        this.playerSpaceship.damage = 5;
        this.playerSpaceship.health = 400;
        this.playerSpaceship.shield = 200;
        this.playerSpaceship.gun.fireRate = 0.1;
        this.playerSpaceship.hasKey = false;

        //Update the opacity of the key icon
        document.getElementById("key").style.opacity = 0.5;

        this.initialisePlayerParams();
        this.setLevelParameters();
        this.renderLevel(this.engine);


    }

    //Function used to render level
    renderLevel(engine) {

        engine.scene.add(engine.game.level.map);

        this.playerSpaceship.setSpawnPoint(engine.game.level.spawnRoom.x + engine.game.level.spawnRoom.width / 2, engine.game.level.spawnRoom.y + engine.game.level.spawnRoom.height / 2);
        engine.scene.add(this.playerSpaceship.mesh);

        this.playerSpaceship.gun.setGunSpawnPoint(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);
        engine.scene.add(this.playerSpaceship.gun.mesh);

        

    }

    //Function used to reset level
    rerenderLevel(engine) {

        //Remove the map from the scene
        engine.scene.remove(this.level.map);

        this.controlsEnabled = true;
        this.level.reset();
        engine.scene.add(this.level.map);

        //Reset the player parameters
        this.initialisePlayerParams();
        this.playerSpaceship.hasKey = false;
        this.level.levelAttempts++;

        this.playerSpaceship.setSpawnPoint(engine.game.level.spawnRoom.x + engine.game.level.spawnRoom.width / 2, engine.game.level.spawnRoom.y + engine.game.level.spawnRoom.height / 2);
        this.playerSpaceship.gun.setGunSpawnPoint(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);
    }



    //Function used to move camera
    moveCamera(engine) {
        //While the player is in a room, the camera will be locked to the room
        //When the player enters a corridor but is not in a room, the camera will move in the direction of the corridor till it reaches a new room

        if (this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y) != -1) {

            //Lock the camera on the player
            engine.camera.position.x = this.playerSpaceship.mesh.position.x;
            engine.camera.position.y = this.playerSpaceship.mesh.position.y;
            engine.camera.position.z = 25;



        } else if (this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y) == -1) {

            if (this.level.isInCorridor(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y) != -1) {
                //The player is in a corridor
                //Move the camera in the direction of the corridor

                var currentCorridor = this.level.isInCorridor(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);

                //Get the direction that the player is facing by getting the rotation of the player spaceship
                var playerDirection = new THREE.Vector2(Math.cos(this.playerSpaceship.mesh.rotation.z), Math.sin(this.playerSpaceship.mesh.rotation.z));
                playerDirection.normalize();


                //Calculate the direction of the corridor
                var corridorDirection = new THREE.Vector2(this.level.corridors[currentCorridor].endPoint.x - this.level.corridors[currentCorridor].startPoint.x, this.level.corridors[currentCorridor].endPoint.y - this.level.corridors[currentCorridor].startPoint.y);



                corridorDirection.normalize();

                //Check from which side of the corridor the player is coming from
                //If the player is coming from the left side of the corridor, the camera will move in the opposite direction of the corridor
                //If the player is coming from the right side of the corridor, the camera will move in the direction of the corridor


                if (corridorDirection.x > corridorDirection.y) {

                    //Check from which side of the corridor the player is coming from
                    if (playerDirection.x < 0) {
                        //The player is coming from the left side of the corridor
                        //Move the camera in the opposite direction of the corridor
                        engine.camera.position.x -= corridorDirection.x * 0.12;
                        engine.camera.position.y = this.playerSpaceship.mesh.position.y;
                        engine.camera.position.z = 20;
                    } else if (playerDirection.x > 0) {
                        //The player is coming from the right side of the corridor
                        //Move the camera in the direction of the corridor
                        engine.camera.position.x += corridorDirection.x * 0.12;
                        engine.camera.position.y = this.playerSpaceship.mesh.position.y;
                        engine.camera.position.z = 20;
                    }
                } else if (corridorDirection.x < corridorDirection.y) {
                    //Check from which side of the corridor the player is coming from
                    if (playerDirection.y < 0) {
                        //The player is coming from the left side of the corridor
                        //Move the camera in the opposite direction of the corridor
                        engine.camera.position.x = this.playerSpaceship.mesh.position.x;
                        engine.camera.position.y -= corridorDirection.y * 0.12;
                        engine.camera.position.z = 20;
                    } else if (playerDirection.y > 0) {
                        //The player is coming from the right side of the corridor
                        //Move the camera in the direction of the corridor
                        engine.camera.position.x = this.playerSpaceship.mesh.position.x;
                        engine.camera.position.y += corridorDirection.y * 0.12;
                        engine.camera.position.z = 20;
                    }
                }


            } else {
                //The player is not in a room or a corridor
                //Move the camera to the spawn point
                console.log("Player is not in a room or a corridor");
            }

        }

        //Work out the number of times a player has changed rooms
        //If the player has changed rooms, increment the number of times the player has changed rooms
        if (this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y) != this.playerParameters[this.levelCount].currentRoom && this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y) != -1) {
            this.playerParameters[this.levelCount].currentRoom = this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);
            this.playerParameters[this.levelCount].roomsVisited++;
        }

        this.playerOutsideCamera();

    }

    //Function used for collision detection
    checkCollision() {

        //Check if the player is in a room that they have not been in before

        for (let i = 0; i < this.level.perimTiles.length; i++) {
            var tileBB = this.level.perimTiles[i].boundingBox;

            //Check if the player bounding box is colliding with the tile bounding box
            if (this.playerSpaceship.boundingBox.intersectsBox(tileBB)) {

                this.playerParameters[this.levelCount].collisionsWithPerimeter++;

                //Get the colour of the tile
                var tileColour = this.level.perimTiles[i].material.color.getHex();

                //If the tile is red, the player has collided with a red tile
                if (tileColour == 0xff0000) {
                    console.log("red");
                    if(this.score-5 > 0){
                        this.score -= 5;
                    } else {
                        this.score = 0;
                    }
                    
                }

                //Collision with door
                if(tileColour == 0x8b4513){
                    this.levelComplete = true;
                    this.levelisOver = true;
                    
                    //If level count is 6, finish the game
                    if(this.levelCount == 6){
                        document.getElementById("canvas-cg-lab").style.display = "none";
                        document.getElementById("gameOver").style.display = "block";
                        document.getElementById("finalScoreGameOver").innerHTML = this.score;
                        document.getElementById("finalScoreUsername").innerHTML = this.username;
                    }else{
                        //this.createNewLevel();
                        // document.getElementById("canvas-cg-lab").style.display = "none";
                        // document.getElementById("levelPassed").style.display = "block";
                        // document.getElementById("levelFailed").style.display = "none";
                        
                        for(let i=0; i<this.level.enemies.length; i++){
                            this.level.enemies[i].room = 100;
                        }
                        
                    //Stop controls
                    this.controlsEnabled = false;
                    }
                }

                //Get the collision direction
                var collisionDirection = this.level.getCollisionDirection(tileBB, this.playerSpaceship);

                //If the collision direction is top, move the player down
                if (collisionDirection.state == "top") {
                    this.playerSpaceship.mesh.position.y = this.playerSpaceship.mesh.position.y + 0.2;
                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);
                }
                //If the collision direction is bottom, move the player up
                if (collisionDirection.state == "bottom") {
                    this.playerSpaceship.mesh.position.y = this.playerSpaceship.mesh.position.y - 0.2;
                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);
                }
                //If the collision direction is left, move the player right
                if (collisionDirection.state == "left") {
                    this.playerSpaceship.mesh.position.x = this.playerSpaceship.mesh.position.x - 0.2;
                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                }
                //If the collision direction is right, move the player left 
                if (collisionDirection.state == "right") {
                    this.playerSpaceship.mesh.position.x = this.playerSpaceship.mesh.position.x + 0.2;
                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                }


            }
        }

        //Check for player enemy collision
        for (let i = 0; i < this.level.enemies.length; i++) {

            var enemyBB = this.level.enemies[i].boundingBox;

            var roomNumber = this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);
            var currentRoom = this.level.rooms[roomNumber];

            //Check if the player bounding box is colliding with the enemy bounding box
            if (this.playerSpaceship.boundingBox.intersectsBox(enemyBB)) {

                this.playerParameters[this.levelCount].collisionsWithEnemies++;

                //Make the enemy take damage on collision with the player
                this.enemyTakeDamage(i,false);

                //Check the shield of the player
                if(this.playerSpaceship.shield>0){
                    if(this.playerSpaceship.shield - 15 < 0){
                        this.playerSpaceship.shield = 0;
                        this.playerSpaceship.health = this.playerSpaceship.health - (15 - this.playerSpaceship.shield); 
                    }   else{
                        this.playerSpaceship.shield = this.playerSpaceship.shield - 15;
                        
                    }
                } else {
                    this.playerSpaceship.health = this.playerSpaceship.health - 15;
                }

                this.playerParameters[this.levelCount].damageTaken += 15;

                //Check if the player is dead
                if (this.playerSpaceship.health <= 0) {
                    console.log("Player is dead");
                    this.levelisOver = true;
                    this.levelComplete = false;
                }


                //Bounce the player and enemy away from each other
                var collisionDirection = this.level.getCollisionDirection(enemyBB, this.playerSpaceship);

                //If the collision direction is top, move the player down
                if (collisionDirection.state == "top") {

                    if (this.playerSpaceship.mesh.position.y + 2 > currentRoom.innerArea.maxY) {
                        this.playerSpaceship.mesh.position.y = currentRoom.innerArea.maxY;
                    } else {

                        this.playerSpaceship.mesh.position.y = this.playerSpaceship.mesh.position.y + 1.5;
                    }

                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                    //Move the enemy up
                    if (this.level.enemies[i].mesh.position.y - 2 < currentRoom.innerArea.minY) {
                        this.level.enemies[i].mesh.position.y = currentRoom.innerArea.minY;
                        this.level.enemies[i].shieldMesh.position.y = currentRoom.innerArea.minY;
                    } else {

                        this.level.enemies[i].mesh.position.y = this.level.enemies[i].mesh.position.y - 1.5;
                        this.level.enemies[i].shieldMesh.position.y = this.level.enemies[i].shieldMesh.position.y - 1.5;

                    }

                }
                //If the collision direction is bottom, move the player up
                if (collisionDirection.state == "bottom") {

                    if (this.playerSpaceship.mesh.position.y - 2 < currentRoom.innerArea.minY) {
                        this.playerSpaceship.mesh.position.y = currentRoom.innerArea.minY;
                    } else {
                        this.playerSpaceship.mesh.position.y = this.playerSpaceship.mesh.position.y - 1.5;
                    }
                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                    //Move the enemy down
                    if (this.level.enemies[i].mesh.position.y + 2 > currentRoom.innerArea.maxY) {
                        this.level.enemies[i].mesh.position.y = currentRoom.innerArea.maxY;
                        this.level.enemies[i].shieldMesh.position.y = currentRoom.innerArea.maxY;
                    } else {

                        this.level.enemies[i].mesh.position.y = this.level.enemies[i].mesh.position.y + 1.5;
                        this.level.enemies[i].shieldMesh.position.y = this.level.enemies[i].shieldMesh.position.y + 1.5;

                    }
                }
                //If the collision direction is left, move the player right
                if (collisionDirection.state == "left") {

                    if (this.playerSpaceship.mesh.position.x - 2 < currentRoom.innerArea.minX) {
                        this.playerSpaceship.mesh.position.x = currentRoom.innerArea.minX;
                    } else {

                        this.playerSpaceship.mesh.position.x = this.playerSpaceship.mesh.position.x - 1.5;
                    }

                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                    //Move the enemy right
                    if (this.level.enemies[i].mesh.position.x + 2 > currentRoom.innerArea.maxX) {
                        this.level.enemies[i].mesh.position.x = currentRoom.innerArea.maxX;
                        this.level.enemies[i].shieldMesh.position.x = currentRoom.innerArea.maxX;
                    } else {

                        this.level.enemies[i].mesh.position.x = this.level.enemies[i].mesh.position.x + 1.5;
                        this.level.enemies[i].shieldMesh.position.x = this.level.enemies[i].shieldMesh.position.x + 1.5;
                    }
                }
                //If the collision direction is right, move the player left
                if (collisionDirection.state == "right") {
                    if (this.playerSpaceship.mesh.position.x + 2 > currentRoom.innerArea.maxX) {
                        this.playerSpaceship.mesh.position.x = currentRoom.innerArea.maxX;
                    } else {

                        this.playerSpaceship.mesh.position.x = this.playerSpaceship.mesh.position.x + 1.5;
                    }

                    this.playerSpaceship.gun.updateGunPosition(this.playerSpaceship.mesh);

                    //Move the enemy left
                    if (this.level.enemies[i].mesh.position.x - 2 < currentRoom.innerArea.minX) {
                        this.level.enemies[i].mesh.position.x = currentRoom.innerArea.minX;
                        this.level.enemies[i].shieldMesh.position.x = currentRoom.innerArea.minX;
                    } else {

                        this.level.enemies[i].mesh.position.x = this.level.enemies[i].mesh.position.x - 1.5;
                        this.level.enemies[i].shieldMesh.position.x = this.level.enemies[i].shieldMesh.position.x - 1.5;
                    }
                }

                //Update the enemy bounding box
                if (!(this.level.enemies[i].boundingBox.isEmpty())) {
                    this.level.enemies[i].boundingBox.setFromObject(this.level.enemies[i].mesh);
                }
            }
        }

        //Check for enemy bullet collision
        for (let i = 0; i < this.level.enemies.length; i++) {
            for (let j = 0; j < this.playerSpaceship.gun.bullets.length; j++) {
                var bulletBB = this.playerSpaceship.gun.bullets[j].boundingBox;
                //Check if the player bounding box is colliding with the bullet bounding box
                if (this.level.enemies[i].boundingBox.intersectsBox(bulletBB)) {
                    this.enemyTakeDamage(i,true);
                    this.playerParameters[this.levelCount].bulletsHit++;

                    this.score += 1;

                    //Remove the bounding box from the scene
                    this.engine.scene.remove(this.playerSpaceship.gun.bullets[j].boundingBox);

                    //Remove the bullet from the bullets array
                  // this.playerSpaceship.gun.bullets.splice(j,1);
                   this.playerSpaceship.gun.bullets[j].killBullet();

                   this.engine.scene.remove(this.playerSpaceship.gun.bullets[j].mesh);

                    //Reset the index of the bullets array
                    for (let j = 0; j < this.playerSpaceship.gun.bullets.length; j++) {
                        this.playerSpaceship.gun.bullets[j].mesh.name = "Bullet" + j;
                    }

                }
            }
        }

        //Check for enemy bullet and player collision
        for (let i = 0; i < this.level.enemies.length; i++) {
            if(this.level.enemies[i].enemyGun != null){
            for (let j = 0; j < this.level.enemies[i].enemyGun.bullets.length; j++) {
                var bulletBB = this.level.enemies[i].enemyGun.bullets[j].boundingBox;

                //Check if the player bounding box is colliding with the bullet bounding box
                if (this.playerSpaceship.boundingBox.intersectsBox(bulletBB)) {

                    //Remove the bullet from the map group
                    this.level.map.remove(this.level.map.getObjectByName("EnemyBullet" + j));
                    //Remove the bullet from the bullets array
                    //this.playerSpaceship.gun.bullets.splice(j,1);
                    this.level.enemies[i].enemyGun.bullets[j].killBullet();

                    this.engine.scene.remove(this.level.enemies[i].enemyGun.bullets[j].mesh);

                    //Reset the index of the bullets array
                    for (let j = 0; j < this.level.enemies[i].enemyGun.bullets.length; j++) {
                        this.level.enemies[i].enemyGun.bullets[j].mesh.name = "EnemyBullet" + j;
                    }

                    //Remove the player health
                    if(this.playerSpaceship.shield>0){
                        this.playerSpaceship.shield-=this.level.enemies[i].bulletDamage;
                    } else{                    
                        this.playerSpaceship.health -= this.level.enemies[i].bulletDamage;
                    }

                    //The player parameter
                    this.playerParameters[this.levelCount].damageTaken += this.level.enemies[i].bulletDamage;

                    //If the player health is less than 0, kill the player
                    if (this.playerSpaceship.health <= 0) {
                        console.log("Player is dead");
                        this.levelisOver = true;
                    }
                }
            }
        }
    }

        //Check for bullet tiles collision
        for (let i = 0; i < this.level.perimTiles.length; i++) {
            for (let j = 0; j < this.playerSpaceship.gun.bullets.length; j++) {
                var bulletBB = this.playerSpaceship.gun.bullets[j].boundingBox;

                //Check if the player bounding box is colliding with the bullet bounding box
                if (this.level.perimTiles[i].boundingBox.intersectsBox(bulletBB)) {

                    //Remove the bullet from the map group
                    this.level.map.remove(this.level.map.getObjectByName("Bullet" + j));
                    //Remove the bullet from the bullets array
                    //this.playerSpaceship.gun.bullets.splice(j,1);
                    this.playerSpaceship.gun.bullets[j].killBullet();

                    this.engine.scene.remove(this.playerSpaceship.gun.bullets[j].mesh);

                    //Reset the index of the bullets array
                    for (let j = 0; j < this.playerSpaceship.gun.bullets.length; j++) {
                        this.playerSpaceship.gun.bullets[j].mesh.name = "Bullet" + j;
                    }
                }
            }
        }

        //Check for enemy bullet tiles collision
        for (let i = 0; i < this.level.perimTiles.length; i++) {
            for (let j = 0; j < this.level.enemies.length; j++) {
                if(this.level.enemies[j].enemyGun != null){
                for (let k = 0; k < this.level.enemies[j].enemyGun.bullets.length; k++) {
                    var bulletBB = this.level.enemies[j].enemyGun.bullets[k].boundingBox;

                    //Check if the player bounding box is colliding with the bullet bounding box
                    if (this.level.perimTiles[i].boundingBox.intersectsBox(bulletBB)) {

                        //Remove the bullet from the map group
                        this.level.map.remove(this.level.map.getObjectByName("EnemyBullet" + k));
                        //Remove the bullet from the bullets array
                        //this.playerSpaceship.gun.bullets.splice(j,1);
                        this.level.enemies[j].enemyGun.bullets[k].killBullet();

                        this.engine.scene.remove(this.level.enemies[j].enemyGun.bullets[k].mesh);

                        //Reset the index of the bullets array
                        for (let k = 0; k < this.level.enemies[j].enemyGun.bullets.length; k++) {
                            this.level.enemies[j].enemyGun.bullets[k].mesh.name = "EnemyBullet" + k;
                        }

                    }
                }
            }
        }
    }

        //Make enemy and enemy collision like player and enemy collision
        for (let i = 0; i < this.level.enemies.length; i++) {
            for (let j = 0; j < this.level.enemies.length; j++) {
                if (i != j) {
                    //Check if the bounding boxes are colliding
                    if (this.level.enemies[i].boundingBox.intersectsBox(this.level.enemies[j].boundingBox)) {
                        var collisionDirection = this.level.getCollisionDirection(this.level.enemies[i].boundingBox, this.level.enemies[j]);

                        if (collisionDirection.state == "top") {
                            if (this.level.enemies[i].mesh.position.y - 2 < currentRoom.innerArea.minY) {
                                this.level.enemies[i].mesh.position.y = currentRoom.innerArea.minY + this.level.enemies[i].height / 2;
                                this.level.enemies[i].shieldMesh.position.y = currentRoom.innerArea.minY + this.level.enemies[i].height / 2;
                            } else {

                                this.level.enemies[i].mesh.position.y = this.level.enemies[i].mesh.position.y - 1;
                                this.level.enemies[i].shieldMesh.position.y = this.level.enemies[i].shieldMesh.position.y - 1;
                            }

                            //Move the enemy down
                            if (this.level.enemies[j].mesh.position.y + 2 > currentRoom.innerArea.maxY) {
                                this.level.enemies[j].mesh.position.y = currentRoom.innerArea.maxY - this.level.enemies[j].height / 2;
                                this.level.enemies[j].shieldMesh.position.y = currentRoom.innerArea.maxY - this.level.enemies[j].height / 2;
                            } else {

                                this.level.enemies[j].mesh.position.y = this.level.enemies[j].mesh.position.y + 1;
                                this.level.enemies[j].shieldMesh.position.y = this.level.enemies[j].shieldMesh.position.y + 1;
                            }
                        }
                        if (collisionDirection.state == "bottom") {
                            if (this.level.enemies[i].mesh.position.y + 2 > currentRoom.innerArea.maxY) {
                                this.level.enemies[i].mesh.position.y = currentRoom.innerArea.maxY - this.level.enemies[i].height / 2;
                                this.level.enemies[i].shieldMesh.position.y = currentRoom.innerArea.maxY - this.level.enemies[i].height / 2;
                            } else {

                                this.level.enemies[i].mesh.position.y = this.level.enemies[i].mesh.position.y + 1;
                                this.level.enemies[i].shieldMesh.position.y = this.level.enemies[i].shieldMesh.position.y + 1;
                            }

                            //Move the enemy up
                            if (this.level.enemies[j].mesh.position.y - 2 < currentRoom.innerArea.minY) {
                                this.level.enemies[j].mesh.position.y = currentRoom.innerArea.minY + this.level.enemies[j].height / 2;
                                this.level.enemies[j].shieldMesh.position.y = currentRoom.innerArea.minY + this.level.enemies[j].height / 2;
                            } else {

                                this.level.enemies[j].mesh.position.y = this.level.enemies[j].mesh.position.y - 1;
                                this.level.enemies[j].shieldMesh.position.y = this.level.enemies[j].shieldMesh.position.y - 1;

                            }

                            if (collisionDirection.state == "left") {
                                if (this.level.enemies[i].mesh.position.x - 2 < currentRoom.innerArea.minX) {
                                    this.level.enemies[i].mesh.position.x = currentRoom.innerArea.minX + this.level.enemies[i].width / 2;
                                    this.level.enemies[i].shieldMesh.position.x = currentRoom.innerArea.minX + this.level.enemies[i].width / 2;
                                } else {

                                    this.level.enemies[i].mesh.position.x = this.level.enemies[i].mesh.position.x - 1;
                                    this.level.enemies[i].shieldMesh.position.x = this.level.enemies[i].shieldMesh.position.x - 1;
                                }

                                //Move the enemy right
                                if (this.level.enemies[j].mesh.position.x + 2 > currentRoom.innerArea.maxX) {
                                    this.level.enemies[j].mesh.position.x = currentRoom.innerArea.maxX - this.level.enemies[j].width / 2;
                                    this.level.enemies[j].shieldMesh.position.x = currentRoom.innerArea.maxX - this.level.enemies[j].width / 2;
                                } else {

                                    this.level.enemies[j].mesh.position.x = this.level.enemies[j].mesh.position.x + 1;
                                    this.level.enemies[j].shieldMesh.position.x = this.level.enemies[j].shieldMesh.position.x + 1;
                                }
                            }
                            if (collisionDirection.state == "right") {
                                if (this.level.enemies[i].mesh.position.x + 2 > currentRoom.innerArea.maxX) {
                                    this.level.enemies[i].mesh.position.x = currentRoom.innerArea.maxX - this.level.enemies[i].width / 2;
                                    this.level.enemies[i].shieldMesh.position.x = currentRoom.innerArea.maxX - this.level.enemies[i].width / 2;
                                } else {

                                    this.level.enemies[i].mesh.position.x = this.level.enemies[i].mesh.position.x + 1;
                                    this.level.enemies[i].shieldMesh.position.x = this.level.enemies[i].shieldMesh.position.x + 1;
                                }

                                //Move the enemy left
                                if (this.level.enemies[j].mesh.position.x - 2 < currentRoom.innerArea.minX) {
                                    this.level.enemies[j].mesh.position.x = currentRoom.innerArea.minX + this.level.enemies[j].width / 2;
                                    this.level.enemies[j].shieldMesh.position.x = currentRoom.innerArea.minX + this.level.enemies[j].width / 2;
                                } else {

                                    this.level.enemies[j].mesh.position.x = this.level.enemies[j].mesh.position.x - 1;
                                    this.level.enemies[j].shieldMesh.position.x = this.level.enemies[j].shieldMesh.position.x - 1;
                                }
                            }

                        }

                        //Update the bounding box
                        if ((!this.level.enemies[i].boundingBox.isEmpty())) {
                            this.level.enemies[i].boundingBox.setFromObject(this.level.enemies[i].mesh);
                        }
                        if ((!this.level.enemies[j].boundingBox.isEmpty())) {
                            this.level.enemies[j].boundingBox.setFromObject(this.level.enemies[j].mesh);
                        }
                    }
                }
            }
        }

        //Check player and loot collisions
        for (var i = 0; i < this.level.loot.length; i++) {
            if (this.level.loot[i].boundingBox.intersectsBox(this.playerSpaceship.boundingBox)) {
                //Get the type of loot
                var lootType = this.level.loot[i].type;

                var lootSound = new THREE.Audio(this.engine.listener);
                const audioLoader = new THREE.AudioLoader();
                audioLoader.load('../audio/powerup.mp3', function (buffer) {
                    lootSound.setBuffer(buffer);
                    lootSound.setVolume(0.5);
                    lootSound.play();
                });

                
                //Add the loot to the player
                switch (lootType) {
                    case "health":
                        if(this.playerSpaceship.health + 100 > 400){
                            this.playerSpaceship.health = 400;
                            this.playerParameters[this.levelCount].healthRecovered = 400 - this.playerSpaceship.health;
                        } else {
                        this.playerSpaceship.health = this.playerSpaceship.health + 100;
                        this.playerParameters[this.levelCount].healthRecovered = 100;
                        }
                        document.querySelectorAll('.loot-row img:nth-child(1)')[0].style.opacity=1;
                        //wait 2 seconds and then set opacity back to 0.5
                        setTimeout(function(){  
                            document.querySelectorAll('.loot-row img:nth-child(1)')[0].style.opacity=0.5;
                        }, 2000);

                        this.playerParameters[this.levelCount].lootCollected[0] += 1;

                        break;
                    case "shield":
                        if(this.playerSpaceship.shield + 100 > 200){
                            this.playerSpaceship.shield = 200;
                            this.playerParameters[this.levelCount].shieldRecovered = 200 - this.playerSpaceship.shield;
                        } else {
                        this.playerSpaceship.shield = this.playerSpaceship.shield + 100;
                        this.playerParameters[this.levelCount].shieldRecovered = 100;
                        }
                        document.querySelectorAll('.loot-row img:nth-child(2)')[0].style.opacity=1;
                        //wait 2 seconds and then set opacity back to 0.5
                        setTimeout(function(){  
                            document.querySelectorAll('.loot-row img:nth-child(2)')[0].style.opacity=0.5;
                        }, 2000);

                        this.playerParameters[this.levelCount].lootCollected[1] += 1;
                        
                        break;
                    case "speed":
                        // Increase the speed of the player for 10 seconds
                        var duration = 10; // in seconds
                        var tempSpeed = this.playerSpaceship.speed;
                         // increase in speed
                        this.playerSpaceship.speed = this.playerSpaceship.maxSpeed+5;
                        this.playerSpaceship.speedBoost= true; // increase the speed of the player
                        document.querySelectorAll('.loot-row img:nth-child(4)')[0].style.opacity=1;
                        // Start the timer
                        var timer = setInterval(() => {
                            // Reduce the remaining duration by 1 second
                            duration -= 1;
                            if (duration <= 0) {
                                document.querySelectorAll('.loot-row img:nth-child(4)')[0].style.opacity=0.5;
                                // Reset the player's speed after the duration has elapsed
                                this.playerSpaceship.speed = tempSpeed;
                                this.playerSpaceship.speedBoost= false;
                                clearInterval(timer); // stop the timer
                            }
                        }, 1000); // run the timer function every 1 second

                        this.playerParameters[this.levelCount].lootCollected[2] += 1;                                

                        break;

                    case "damage":
                        // Increase the damage of the player for 10 seconds
                        var duration = 10; // in seconds
                        var damageBoost = 5; // increase in damage
                        this.playerSpaceship.damage = 10; // increase the damage of the player
                        document.querySelectorAll('.loot-row img:nth-child(3)')[0].style.opacity=1;
                        // Start the timer
                        var timer = setInterval(() => {
                            // Reduce the remaining duration by 1 second
                            duration -= 1;
                            if (duration <= 0) {
                                document.querySelectorAll('.loot-row img:nth-child(3)')[0].style.opacity=0.5;
                                // Reset the player's damage after the duration has elapsed
                                this.playerSpaceship.damage = 5;
                                clearInterval(timer); // stop the timer
                            }
                        }, 1000); // run the timer function every 1 second

                        this.playerParameters[this.levelCount].lootCollected[3] += 1;

                        break;

                    case "fireRate":
                        // Increase the fire rate of the player for 10 seconds
                        var duration = 10; // in seconds
                        this.playerSpaceship.gun.fireRate = 0.05; // increase the fire rate of the player
                        document.querySelectorAll('.loot-row img:nth-child(5)')[0].style.opacity=1;
                        // Start the timer
                        var timer = setInterval(() => {
                            // Reduce the remaining duration by 1 second
                            duration -= 1;
                            if (duration <= 0) {
                                document.querySelectorAll('.loot-row img:nth-child(5)')[0].style.opacity=0.5;
                                // Reset the player's fire rate after the duration has elapsed
                                this.playerSpaceship.gun.fireRate = 0.1;
                                clearInterval(timer); // stop the timer
                            }
                        }, 1000); // run the timer function every 1 second

                        this.playerParameters[this.levelCount].lootCollected[4] += 1;

                        break;

                    case "key":
                        this.playerSpaceship.hasKey = true;
                        document.querySelectorAll('.loot-row img:nth-child(6)')[0].style.opacity=1;
                        this.openExitDoor();
                        break;


                    default:
                       
                        break;
                }

                //console.log("Loot picked up" + lootType)
                //Remove the loot from the scene
                this.level.loot[i].mesh.visible = false;

                //Remove the bounding box
                this.level.loot[i].boundingBox.makeEmpty();
                this.level.lootCollected[lootType] += 1;
                this.level.totalLootCollected += 1;
            }
        }

    }

    playerOutsideCamera() {

        var cameraPos = this.engine.camera.position;

        var playerPos = this.playerSpaceship.mesh.position;

        //If the player is outside the camera view, move the camera to the player position
        if (playerPos.x > cameraPos.x + 30 || playerPos.x < cameraPos.x - 30 || playerPos.y > cameraPos.y + 15 || playerPos.y < cameraPos.y - 15) {
            //console.log("outside");
            //Keep the player within the camera view by moving the player
            if (playerPos.x > cameraPos.x + 30) {
                this.playerSpaceship.mesh.position.x = cameraPos.x + 30;
            }
            if (playerPos.x < cameraPos.x - 30) {
                this.playerSpaceship.mesh.position.x = cameraPos.x - 30;
            }
            if (playerPos.y > cameraPos.y + 15) {
                this.playerSpaceship.mesh.position.y = cameraPos.y + 15;
            }
            if (playerPos.y < cameraPos.y - 15) {
                this.playerSpaceship.mesh.position.y = cameraPos.y - 15;
            }

        }
    }

    moveEnemies() {
        var currentPlayerRoom = this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);

        if (currentPlayerRoom == -1) {
            return;
        }


        //Move the enemies
        for (var i = 0; i < this.level.enemies.length; i++) {
            var tmp = this.level.enemies[i];
            if (tmp.room == currentPlayerRoom) {

                //If the enemy is in the map
                if (this.level.map.getObjectByName("Enemy" + tmp.enemyID) != null) {

                    var enemyType = tmp.type;
                    
                    var distanceFromPlayer;
                    switch (enemyType) {
                        case "1":
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;

                        case "2":
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;

                        case "3":
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;

                        case "4":
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;

                        case "5":
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;

                        default:
                            distanceFromPlayer = this.playerSpaceship.mesh.position.distanceTo(tmp.mesh.position);
                            break;
                    }

                    
                    var direction = new THREE.Vector3().subVectors(this.playerSpaceship.mesh.position, tmp.mesh.position).normalize();
                    var angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
                    tmp.mesh.rotation.z = angle * Math.PI / 180;


                    if (distanceFromPlayer < tmp.aggression && tmp.isDynamic) {

                        //Move the enemy towards the player
                        var direction = new THREE.Vector3().subVectors(this.playerSpaceship.mesh.position, tmp.mesh.position).normalize();
                        tmp.mesh.position.x += direction.x * tmp.speed;
                        tmp.mesh.position.y += direction.y * tmp.speed;

                        //Move the shield mesh towards the player
                        tmp.shieldMesh.position.x += direction.x * tmp.speed;
                        tmp.shieldMesh.position.y += direction.y * tmp.speed;

                    }

                    if (!tmp.boundingBox.isEmpty()) {
                        //this.level.enemies[i].boundingBox.setFromObject(this.level.enemies[i].mesh); 
                        this.level.enemies[i].updateBoundingBox();
                    }
                    if(tmp.enemyGun != null){
                        tmp.enemyGun.updateEnemyGunPosition(this.level.enemies[i]);
                    }
                }
            }
        }

        for (var i = 0; i < this.level.enemies.length; i++) {
            this.enemyShieldRegen(i);
        }

    }

    //Function used to make the enemy take damage either on collision or by a bullet
    enemyTakeDamage(enemyID,hitByBullet) {

        var enemy = this.level.enemies[enemyID];
        this.level.enemies[enemyID].timeLastHit = Date.now();

        
        if(!hitByBullet){
            if(enemy.type == 4){
                enemy.shield = 0;
                enemy.health = 0;

                if(this.playerSpaceship.shield - 30 > 0){
                    this.playerSpaceship.shield = this.playerSpaceship.shield - 30;
                } else {
                    this.playerSpaceship.shield = 0;
                    this.playerSpaceship.health = this.playerSpaceship.health - (30 - this.playerSpaceship.shield);
                }
            } else {
                enemy.health = enemy.health - this.playerSpaceship.damage;

                if(this.playerSpaceship.shield-1 > 0){
                    this.playerSpaceship.shield = this.playerSpaceship.shield - 1;
                } else {
                    this.playerSpaceship.shield = 0;
                    this.playerSpaceship.health = this.playerSpaceship.health - (1 - this.playerSpaceship.shield);
                }
            }
        }
        //Check the shield
        else if(hitByBullet){ 
            if(enemy.shield > 0) {
                enemy.shield = enemy.shield - this.playerSpaceship.damage;
                enemy.updateShieldOpacity();
                return;
            } else {
                this.level.enemies[enemyID].shieldMesh.visible = false;
                enemy.health = enemy.health - this.playerSpaceship.damage;
            }
        } 

        if (this.level.enemies[enemyID].health <= 0) {


            //Load the enemyShipExplosion
            var explosionSound = new THREE.Audio(this.engine.listener);
            var audioLoader = new THREE.AudioLoader();
            audioLoader.load('../audio/explosion.mp3', function (buffer) {
                explosionSound.setBuffer(buffer);
                explosionSound.setLoop(false);
                explosionSound.setVolume(0.6);
                explosionSound.play();
            });

            //Make the bounding box empty
            this.level.enemies[enemyID].boundingBox.makeEmpty();
            
            //Remove the enemy
            //this.level.map.remove(this.level.map.getObjectByName("Enemy" + i));
            this.level.enemies[enemyID].shieldMesh.visible = false;
            this.level.enemies[enemyID].mesh.visible = false;
            this.level.enemies[enemyID].shield = 0;
            this.level.enemies[enemyID].updateShieldOpacity();

            //Add to the enemies killed
            this.enemiesKilled++;
            this.score += 20 * this.level.enemies[enemyID].type;

            if(this.level.enemies[enemyID].hasKey){
                //Spawn the key
                this.level.spawnKey(this.level.enemies[enemyID].mesh.position.x,this.level.enemies[enemyID].mesh.position.y);

            }
        }

    }

    //Function used to regenerate the enemy shield after 10 seconds
    enemyShieldRegen(enemyID) {
        var enemy = this.level.enemies[enemyID];
        //If the enemy is not null

        if (enemy.shield > 0) {
            this.level.enemies[enemyID].shieldMesh.visible = true;
        }

        if (this.level.enemies[enemyID] != null && this.level.enemies[enemyID].boundingBox.isEmpty() == false) {

            //If time since last hit is more than 10 seconds
            if (Date.now() - this.level.enemies[enemyID].timeLastHit > 10000) {

                if (enemy.shield < 100) {
                    enemy.shield = enemy.shield + 0.1;
                    enemy.updateShieldOpacity();
                }

            }

        }
    }


    //Function used to set the level parameters
    setLevelParameters() {
        this.levelParameters.push({
            levelNumber: this.levelCount+1,
            numberOfRooms: this.level.rooms.length,
            numberOfEnemies: this.level.enemies.length,
            numberOfPowerUps: this.level.loot.length,
            numberOfCorridors: this.level.corridorsCount,

            //Get the number of enemies by type
            enemyFrequency: this.level.getEnemyTypes(),
            enemiesPerRoom: this.level.getEnemiesPerRoom(),
            roomSizes: this.level.getRoomSizes(),
            distanceFromRoot: 0,
            treeDepth: this.level.getTreeDepth(),
            staticEnemies: this.level.getStaticEnemyCount(),
            dyanmicEnemies: this.level.getDynamicEnemyCount(),
            enemyFireRates: this.level.getEnemyFireRates(),
            numberOfRedWalls: this.level.redTilesCount,
            numberOfPerimWalls: this.level.perimTiles.length,
            isExperimental : this.isExperiment,
            levelDifficulty: this.levelDifficulty,

        });

       
    }

    //Initialise the player parameters
    initialisePlayerParams() {
        this.playerParameters.push({
            timeToCompleteLevel: 0,
            levelAttempts: 0,
            enemiesKilled: 0,
            damageTaken: 0,
            damageDealt: 0,
            distanceTraveled: 0,
            timeSpentMoving: 0,
            timeSpentIdle: 0,
            bulletsFired: 0,
            bulletsHit: 0,
            bulletsMissed: 0,
            accuracy: 0,
            lootCollected: [],
            totalLootCollected: 0,
            totalHealthRecovered: 0,
            totalShieldRecovered: 0,
            totalHealthLost: 0,
            roomsVisited: 0,
            collisionsWithPerimeter: 0,
            collisionsWithEnemies: 0,
            levelCompleted: false,
            score: 0,
        });
    }

    //Function used to set the player parameters
    setPlayerParameters() {
        this.playerParameters[this.levelCount].enemiesKilled = this.enemiesKilled;
        this.playerParameters[this.levelCount].damageDealt = this.playerParameters[this.levelCount].bulletsHit * 5;
        if (this.levelCount == 0) {
            this.playerParameters[this.levelCount].bulletsFired = this.playerSpaceship.gun.getBulletsFiredCount();
        } else {
            this.playerParameters[this.levelCount].bulletsFired = this.playerSpaceship.gun.getBulletsFiredCount() - this.playerParameters[this.levelCount - 1].bulletsFired;
        }
        if (this.playerParameters[this.levelCount].bulletsFired == 0) {
            this.playerParameters[this.levelCount].accuracy = 0;
        } else {
            this.playerParameters[this.levelCount].accuracy = (this.playerParameters[this.levelCount].bulletsHit / this.playerParameters[this.levelCount].bulletsFired).toFixed(2) * 100;
        }
        this.playerParameters[this.levelCount].bulletsMissed = this.playerParameters[this.levelCount].bulletsFired - this.playerParameters[this.levelCount].bulletsHit;
        this.playerParameters[this.levelCount].timeToCompleteLevel = ((Date.now() - this.level.levelTimeStart) / 1000);
        console.log(this.level.levelTimeStart);
        this.playerParameters[this.levelCount].timeSpentIdle = (this.playerParameters[this.levelCount].timeToCompleteLevel - this.playerParameters[this.levelCount].timeSpentMoving).toFixed(2);
        this.playerParameters[this.levelCount].levelAttempts = this.level.levelAttempts+1;
        this.playerParameters[this.levelCount].distanceTraveled = this.playerParameters[this.levelCount].distanceTraveled;
       
        for(var i = 0; i < this.level.lootCollected.length; i++) {
            this.playerParameters[this.levelCount].totalLootCollected += this.level.lootCollected[i];
        }
        console.log(this.levelComplete);

        this.playerParameters[this.levelCount].levelCompleted = this.levelComplete;

    }

    //Function used to send the player parameters to the database
    sendPlayerParamsToDb() {
        var playerParams = this.playerParameters[this.levelCount];
        var levelParams = this.levelParameters[this.levelCount];
        var playerUsername = this.username;
        var level = this.levelCount+1;
        var playerData = {
            playerParams: playerParams,
            levelParams: levelParams,
            playerUsername: playerUsername,
            level: level,
        };

        $.ajax({
            type: 'POST',
            url: 'http://207.154.237.35:5501/api/player-parameters',
            data: JSON.stringify(playerData),
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log(data);
            },
            contentType: "application/json",
            dataType: 'json'

          
        });
    }

    //Function used to handle the enemy firing
    enemyShooting() {
       
        var currentPlayerRoom = this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y);

        if (currentPlayerRoom == -1) {
            return;
        }

        //Fire the enemy gun sporadically
        for (var i = 0; i < this.level.enemies.length; i++) {
            if(this.level.enemies[i].room == currentPlayerRoom){
            if (this.level.enemies[i] != null && this.level.enemies[i].boundingBox.isEmpty() == false ) {
                if (this.level.enemies[i].enemyGun != null) {
                    //Get the enemy type
                    var enemyType = this.level.enemies[i].type;

                  
                    //Fire the gun at different rates depending on the enemy type and at random intervals
                   
                    if (enemyType == 1) {
                        if (Math.random() < 0.01) {
                            this.level.enemies[i].enemyGun.fireEnemyGun(this.level.enemies[i], this.playerSpaceship);
                          
                        }
                    }
                    else if (enemyType == 2) {
                        if (Math.random() < 0.01) {
                            this.level.enemies[i].enemyGun.fireEnemyGun(this.level.enemies[i], this.playerSpaceship);
                          
                        }
                    }
                    else if (enemyType == 3) {
                        if (Math.random() < 0.02) {
                            this.level.enemies[i].enemyGun.fireEnemyGun(this.level.enemies[i], this.playerSpaceship);
                          
                        }
                    }
                    else if (enemyType == 4) {
                        if (Math.random() < 0.03) {
                            this.level.enemies[i].enemyGun.fireEnemyGun(this.level.enemies[i], this.playerSpaceship);
                          
                        }
                    }
                    else if (enemyType == 5) {
                        if (Math.random() < 0.04) {
                            this.level.enemies[i].enemyGun.fireEnemyGun(this.level.enemies[i], this.playerSpaceship);
                          
                        }
                    }
                }

                }
            }
        }
    }

    //Function used to spawn the door when the key is collected
    openExitDoor(){
        
        //Randomise a room number
        var randomRoom = Math.floor(Math.random() * (this.level.rooms.length-1))+1;

        //Make sure it is not the same as the room the player is in
        if(randomRoom == this.level.isInRoom(this.playerSpaceship.mesh.position.x, this.playerSpaceship.mesh.position.y)){
            randomRoom = Math.floor(Math.random() * (this.level.rooms.length-1))+1;
        }
        

        //Get the sum of the perimeter tiles of all rooms
        var perimeterTiles = 0;
        var roomPerimeterTiles = [];
        for(var i = 0; i < this.level.rooms.length; i++){
            perimeterTiles += this.level.rooms[i].perimeter.length;
            roomPerimeterTiles.push(perimeterTiles);
        }

        //Generate 4 random numbers between the index of the room before the random room and the index of the random room
        var randomNumber = (Math.floor(Math.random() * (roomPerimeterTiles[randomRoom]-roomPerimeterTiles[randomRoom-1]))+roomPerimeterTiles[randomRoom-1]);
        

        var texture = new THREE.TextureLoader().load( '../images/door.png' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        //Rotate the texture
        texture.rotation = -Math.PI / 2;

        //Check if it is on the vertical or horizontal axis
        if(this.level.perimTiles[randomNumber].x == this.level.perimTiles[randomNumber+1].x){
    
            this.level.perimTiles[randomNumber].material.map = texture;
            this.level.perimTiles[randomNumber+1].material.map = texture;
            this.level.perimTiles[randomNumber+2].material.map = texture;
            this.level.perimTiles[randomNumber+3].material.map = texture;
            this.level.perimTiles[randomNumber+4].material.map = texture;
            this.level.perimTiles[randomNumber+5].material.map = texture;
    
            this.level.perimTiles[randomNumber].material.color.setHex(0xffff00);
            this.level.perimTiles[randomNumber+1].material.color.setHex(0x8b4513);
            this.level.perimTiles[randomNumber+2].material.color.setHex(0x8b4513);
            this.level.perimTiles[randomNumber+3].material.color.setHex(0x8b4513);
            this.level.perimTiles[randomNumber+4].material.color.setHex(0x8b4513);
            this.level.perimTiles[randomNumber+5].material.color.setHex(0xffff00);
            // this.level.perimTiles[randomNumber].material.transparent = false;
            // this.level.perimTiles[randomNumber+5].material.transparent = false;
            
        }
        else{
        
        this.level.perimTiles[randomNumber].material.map = texture;
        this.level.perimTiles[randomNumber+2].material.map = texture;
        this.level.perimTiles[randomNumber+4].material.map = texture;
        this.level.perimTiles[randomNumber+6].material.map = texture;
        this.level.perimTiles[randomNumber+8].material.map = texture;
        this.level.perimTiles[randomNumber+10].material.map = texture;

        //Get the 4 random tiles from the perimeter tiles of the random room
        this.level.perimTiles[randomNumber].material.color.setHex(0xffff00);
        this.level.perimTiles[randomNumber+2].material.color.setHex(0x8b4513);
        this.level.perimTiles[randomNumber+4].material.color.setHex(0x8b4513);
        this.level.perimTiles[randomNumber+6].material.color.setHex(0x8b4513);
        this.level.perimTiles[randomNumber+8].material.color.setHex(0x8b4513);
        this.level.perimTiles[randomNumber+10].material.color.setHex(0xffff00);

        // this.level.perimTiles[randomNumber].material.transparent = false;
        // this.level.perimTiles[randomNumber+10].material.transparent = false;
        }
       


    }

    //Function used to close the exit door if the level is reset
    closeExitDoor(){

        var texture = new THREE.TextureLoader().load( '../images/tile1.png' );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.anisotropy = 16;
        texture.encoding = THREE.sRGBEncoding;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        //Rotate the texture
        texture.rotation = -Math.PI / 2;

        //Get all the perimeter tiles that have a specific colour
        for(var i = 0; i < this.level.perimTiles.length; i++){
            //Find the exit door by finding the tiles with the tile1.png texture
            if(this.level.perimTiles[i].material.map.image.currentSrc.includes("door.png")){
                this.level.perimTiles[i].material.map = texture;
                this.level.perimTiles[i].material.color.setHex(0xffffff);
            }
        }
    }



    //Function used to calculate the desired level difficulty
    calculateDesiredDifficulty(){
        console.log("Level Count: " + this.levelCount);
        if(this.levelCount == 0){
            return 30;
        } else{

        var desiredDiff = this.levelParameters[this.levelCount-1].levelDifficulty;

        var accuracyRatio = this.playerParameters[this.levelCount-1].accuracy/100;

        var accuracyCoefficient =  (2*accuracyRatio) - 1;

        var damageRatio = 0;
        if(this.playerParameters[this.levelCount-1].damageTaken == 0){
            damageRatio = 1;
        } else if(this.playerParameters[this.levelCount-1].damageDealt == 0){
            damageRatio = 0;
        } else {
         damageRatio = this.playerParameters[this.levelCount-1].damageTaken/this.playerParameters[this.levelCount-1].damageDealt;
         //Normalize the damage ratio
            damageRatio = damageRatio/(this.playerParameters[this.levelCount-1].damageTaken + this.playerParameters[this.levelCount-1].damageDealt);
        }

        var damageCoefficient =  (2*damageRatio) - 1;

        var timeRatio = this.playerParameters[this.levelCount-1].timeSpentMoving/this.playerParameters[this.levelCount-1].timeToCompleteLevel;

        var timeCoefficient =  (2*timeRatio) - 1;

        var lootRatio = this.playerParameters[this.levelCount-1].totalLootCollected/this.levelParameters[this.levelCount-1].numberOfPowerUps;

        var lootCoefficient =  (2*lootRatio) - 1;

        var killRatio = this.playerParameters[this.levelCount-1].enemiesKilled/this.levelParameters[this.levelCount-1].numberOfEnemies;

        var killCoefficient =  (2*killRatio) - 1;

        console.log("Accuracy: " + accuracyCoefficient + " " + accuracyRatio);
        console.log("Damage: " + damageCoefficient + " " + damageRatio);
        console.log(this.playerParameters[this.levelCount-1].timeSpentMoving + " " + this.playerParameters[this.levelCount-1].timeToCompleteLevel);
        console.log("Time: " + timeCoefficient + " " + timeRatio);
        console.log("Loot: " + lootCoefficient + " " + lootRatio);
        console.log("Kill: " + killCoefficient  + " " + killRatio);

        if(accuracyRatio > 0.5 && this.playerParameters[this.levelCount-1].bulletsFired < this.levelParameters[this.levelCount-1].numberOfEnemies){
            //Increase the difficulty
            accuracyCoefficient = accuracyCoefficient * 2;
        }

        if(damageRatio > 0.5 && this.playerParameters[this.levelCount-1].damageTaken < this.levelParameters[this.levelCount-1].numberOfEnemies){
            //Increase the difficulty
            damageCoefficient = damageCoefficient * 2;
        }

        if(timeRatio>0.5 && this.playerParameters[this.levelCount-1].bulletsFired < this.levelParameters[this.levelCount-1].numberOfEnemies){
            //Increase the difficulty
            timeCoefficient = timeCoefficient * 2;
        }

        if (accuracyRatio > 0.5) {
            var diff = accuracyRatio - 0.5;
            for (var i = 0; i < this.level.transitionMatrixEasier.length; i++) {
              this.level.transitionMatrixEasier[i][0] *= (1 - diff);
              this.level.transitionMatrixEasier[i][1] += 0.4 * diff;
              this.level.transitionMatrixEasier[i][2] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][3] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][4] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][5] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][7] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][8] += 0.1 * diff;
          
              this.level.transitionMatrixHarder[i][0] = 0.5 * diff;
              this.level.transitionMatrixHarder[i][1] += 0.5 * diff;
            }
          } else if (accuracyRatio < 0.5) {
            var diff = 0.5 - accuracyRatio;
            for (var i = 0; i < this.level.transitionMatrixEasier.length; i++) {
              this.level.transitionMatrixEasier[i][0] *= (1 - diff);
              this.level.transitionMatrixEasier[i][1] += 0.4 * diff;
              this.level.transitionMatrixEasier[i][2] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][3] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][4] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][5] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][7] += 0.1 * diff;
              this.level.transitionMatrixEasier[i][8] += 0.1 * diff;
          
              this.level.transitionMatrixHarder[i][0] *= (1 - diff);
              this.level.transitionMatrixHarder[i][1] += 0.5 * diff;
            }
          }
          

        if(damageRatio>0.5){

            var diff = damageRatio - 0.5;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixEasier[i][6] *= (1 - diff);
                this.level.transitionMatrixEasier[i][7] += 0.1 * diff;
            }
        } else if(damageRatio<0.5){

            var diff = 0.5 - damageRatio;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixEasier[i][6] *= (1 - diff);
                this.level.transitionMatrixEasier[i][7] += 0.1 * diff;
            }
        }

        if(timeRatio>0.5){

            var diff = timeRatio - 0.5;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixHarder[i][0] *= (1 - diff);
                this.level.transitionMatrixHarder[i][1] += 0.5 * diff;
                this.level.transitionMatrixHarder[i][7] += 0.5 * diff;
            }
        }

        if(lootRatio>0.5){
                
                var diff = lootRatio - 0.5;
    
                for(var i; i< this.level.transitionMatrixEasier.length; i++){
                    //Decrease the probability of all except the loot
                    this.level.transitionMatrixHarder[i][0] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][1] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][2] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][3] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][4] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][5] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][7] *= (1 - diff);
                    this.level.transitionMatrixHarder[i][8] *= (1 - diff);

                    //Increase the probability of loot
                    this.level.transitionMatrixHarder[i][6] += 0.4 * diff;

                    this.level.transitionMatrixEasier[i][6] *= (1 - diff);
                    this.level.transitionMatrixEasier[i][1] += 0.5 * diff;
                    this.level.transitionMatrixEasier[i][7] += 0.5 * diff;

                }
        } else if(lootRatio<0.5){
            var diff = 0.5 - lootRatio;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixHarder[i][6] *= (1 - diff);
                this.level.transitionMatrixHarder[i][0] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][1] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][2] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][3] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][4] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][5] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][7] += 1/8 * diff;
                this.level.transitionMatrixHarder[i][8] += 1/8 * diff;


                this.level.transitionMatrixEasier[i][6] *=  (1- diff);
                this.level.transitionMatrixEasier[i][0] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][1] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][2] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][3] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][4] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][5] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][7] -= 1/8 * diff;
                this.level.transitionMatrixEasier[i][8] -= 1/8 * diff;
            }

        }

        if(killRatio>0.5){
            var diff = killRatio - 0.5;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixHarder[i][7] += 0.5 * diff;
                this.level.transitionMatrixHarder[i][0] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][1] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][2] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][3] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][4] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][5] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][6] *= (1 - diff)/8;
                this.level.transitionMatrixHarder[i][8] *= (1 - diff)/8;
            }
        } else if(killRatio<0.5){
        
            var diff = 0.5 - killRatio;

            for(var i; i< this.level.transitionMatrixEasier.length; i++){
                this.level.transitionMatrixEasier[i][7] -= 0.5 * diff;
                this.level.transitionMatrixEasier[i][0] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][1] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][2] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][3] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][4] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][5] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][6] *= (1 - diff)/8;
                this.level.transitionMatrixEasier[i][8] *= (1 - diff)/8;
            }
            
        }

        if(this.playerParameters[this.levelCount-1].levelCompleted == true){
            //Increase the difficulty
            desiredDiff = desiredDiff + 10;
        }   else {
            //Decrease the difficulty  
            desiredDiff = desiredDiff - 10;
        }

        console.log("Desired Difficulty1: " + desiredDiff);
        console.log(this.playerParameters[this.levelCount-1].levelCompleted);
        
        if(this.playerParameters[this.levelCount-1].levelCompleted == true){
        desiredDiff = desiredDiff + (this.levelCount*10) + Math.abs(5* accuracyCoefficient) + Math.abs(5* damageCoefficient) + Math.abs(5* timeCoefficient) + Math.abs(5* lootCoefficient) + Math.abs(5* killCoefficient);
        } else {
        desiredDiff = desiredDiff - Math.abs(5 * accuracyCoefficient) - Math.abs(5 * damageCoefficient) - Math.abs(5* timeCoefficient) - Math.abs(5 * lootCoefficient) - Math.abs(5 * killCoefficient);
        }
        

        if(desiredDiff < this.levelCount*10){
            desiredDiff = this.levelCount*25;
        }

        //A level difficulty cannot be more than that of a level that has not been completed
        for(var i = 0; i < this.levelParameters.length; i++){
            if(desiredDiff > this.levelParameters[i].levelDifficulty && this.playerParameters[i].levelCompleted == false){  
                desiredDiff = this.levelParameters[i].levelDifficulty-5;
            }
        }

        
        //A level difficulty cannot be less than that of a level that has already been completed
        for(var i = 0; i < this.levelParameters.length; i++){
            if(desiredDiff < this.levelParameters[i].levelDifficulty && this.playerParameters[i].levelCompleted == true){
                desiredDiff = this.levelParameters[i].levelDifficulty;
            }
        }


        console.log("Desired Difficulty2: " + desiredDiff);
    
        return desiredDiff;
    }
}

}