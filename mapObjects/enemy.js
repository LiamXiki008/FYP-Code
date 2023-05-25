//Class used to create an enemy object
class Enemy{
    constructor(x,y,enemyType,enemyID,engine){

        this.x = x;
        this.y = y;
        this.enemyID = enemyID;
        this.direction = 0;
        this.room = -1;
        this.width = 0;
        this.height = 0;
        this.fireRate = 0;
        this.aggression = 0;
        this.startingPosition = new THREE.Vector3(x,y,0);
        this.startingRotation = 0;
        this.bulletDamage = 0;
        this.hasKey = false;
        this.engine = engine;   
        
        //Randomly choose whether enemy is dynamic or static
        
        this.shieldMesh = null;
        this.maxOpacity = 0.3;
        this.type = enemyType;

        this.enemyGun = null;
        this.helper = null;
        this.timeLastHit = null;

        //Create the enemy mesh
        switch(enemyType){
            case 1:
                var texture = new THREE.TextureLoader().load("../images/enemy1.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                //Rotate the texture
                texture.rotation = -Math.PI / 2;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                this.geometry = new THREE.BoxGeometry(3,3,0);
                this.width = 2;
                this.height = 4;
                this.health = 75;
                this.shield = 100;
                this.fireRate = 0.001;
                this.aggression = 25;
                this.maxHealth = 75;
                this.bulletDamage = 2;
                this.speed = 0.0175;
                this.isDynamic = Math.random() > 0.2 ? true : false;

                break;
            case 2:
                var texture = new THREE.TextureLoader().load("../images/enemy2.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                //Rotate the texture
                texture.rotation = -Math.PI / 2;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                this.geometry = new THREE.BoxGeometry(2,2,0);
                this.width = 2;
                this.height = 2;
                this.health = 75;
                this.shield = 75;
                this.fireRate = 0.15;
                this.aggression = 35;
                this.maxHealth = 150;
                this.bulletDamage = 5;
                this.speed = 0.015;
                this.isDynamic = Math.random() > 0.2 ? true : false;

                break;
            case 3:
                var texture = new THREE.TextureLoader().load("../images/enemy3.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                //Rotate the texture
                texture.rotation = -Math.PI / 2;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                this.geometry = new THREE.BoxGeometry(4,4,0);
                this.width = 4;
                this.height = 4;
                this.speed = 0.015;
                this.health = 50;
                this.shield = 100;
                this.fireRate = 0.15;
                this.aggression = 25;
                this.maxHealth = 50;
                this.bulletDamage = 5;
                this.isDynamic = Math.random() > 0.2 ? true : false;


                break;
            case 4:
                var texture = new THREE.TextureLoader().load("../images/enemy4.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                //Rotate the texture
                texture.rotation = -Math.PI / 2;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                this.geometry = new THREE.BoxGeometry(3,3,0);
                this.width = 3;
                this.height = 3;
                this.health = 25;
                this.shield = 25;
                this.fireRate = 0;
                this.aggression = 50;
                this.maxHealth = 50;
                this.bulletDamage = 0;
                this.speed = 0.05;
                this.isDynamic = true;

                

                break;
            case 5:
                var texture = new THREE.TextureLoader().load("../images/enemy5.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                //Rotate the texture
                texture.rotation = -Math.PI / 2;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                this.geometry = new THREE.BoxGeometry(5,5,0);
                this.width = 5;
                this.height = 5;
                this.speed = 0.01;
                this.health = 50;
                this.shield = 150;
                this.fireRate = 0.5;
                this.aggression = 30;
                this.maxHealth = 200;
                this.bulletDamage = 20;
                this.isDynamic = Math.random() > 0.2 ? true : false;


                break;
            default:
                console.log("Enemy type not found");
                break;
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.x, this.y, 0);

        this.mesh.name = "Enemy" + this.enemyID;

        this.boundingBox = null;
        this.createBoundingBox();
        this.createShieldMesh();
        this.createEnemyGun();


        return this;
    }

    //Set the enemy's starting position
    setSpawnPoint(x,y){
        this.mesh.position.set(x,y,0);
        this.startingPosition = new THREE.Vector3(x,y,0);
        this.startingRotation = this.mesh.rotation;

    }

    //Create the bounding box for the enemy
    createBoundingBox(){
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
       
        //Make a helper to visualize the bounding box
        this.helper = new THREE.Box3Helper(this.boundingBox, 0xffff00);
        
    }

    //Set the enemy room
    setEnemyRoom(room){
        this.room = room;
    }

    //Get the enemy room
    getEnemyRoom(){
        return this.room;
    }

    //Create the shield mesh for the enemy
    createShieldMesh(){
        //Create a circle to represent the shield around the enemy based on the size of the enemy
        switch(this.enemyType){
            case 1:
                var shieldGeometry = new THREE.CircleGeometry(1.5, 32);
                break;
            case 2:
                var shieldGeometry = new THREE.CircleGeometry(2, 32);
                break;
            case 3:
                var shieldGeometry = new THREE.CircleGeometry(2.5, 32);
                break;
            case 4:
                var shieldGeometry = new THREE.CircleGeometry(1.5, 32);
                break;
            case 5:
                var shieldGeometry = new THREE.CircleGeometry(2.5, 32);
                break;
            default:
                var shieldGeometry = new THREE.CircleGeometry(3.5, 32);
                break;


        }
        var shieldMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, opacity: this.maxOpacity, transparent: true});
        this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.shieldMesh.position.set(this.x, this.y, 0);
        this.shieldMesh.name = "Shield" + this.enemyID;

        return this.shieldMesh;
    }

    //Update the shield mesh
    updateShieldMesh(){
        this.shieldMesh.position.set(this.x, this.y, 0);
    }

    //Update the enemy shield opacity
    updateShieldOpacity(){
        this.shieldMesh.material.opacity = Math.min(0.3,0.3*this.shield/100);
    }

    //Create the enemy gun
    createEnemyGun(){
        
        if(this.fireRate > 0){
            if(this.enemyType == 3){
             this.enemyGun = new EnemyGun(this.engine,this.fireRate,this.type);
            }else{
             this.enemyGun = new EnemyGun(this.engine,this.fireRate,this.type);
            }
        }
    }

    //Update the bounding box for the enemy
    updateBoundingBox(){
        this.boundingBox.setFromObject(this.mesh);

        if (this.mesh.rotation.z != Math.PI / 2 || this.mesh.rotation.z != -Math.PI / 2 || this.mesh.rotation.z != 0 || this.mesh.rotation.z != Math.PI) {
            this.boundingBox.min.x += 0.55;
            this.boundingBox.min.y += 0.55;
            this.boundingBox.max.x -= 0.55;
            this.boundingBox.max.y -= 0.55;
        } 
    }
}


