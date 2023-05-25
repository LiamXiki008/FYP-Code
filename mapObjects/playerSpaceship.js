//Class used to create a player object
class PlayerSpaceship {
    constructor(engine) {

        this.health = 400;
        this.shield = 200;
        this.speed = 0;
        this.acceleration = 0.15;
        this.deceleration = -0.035;
        this.damage = 15;
        this.maxSpeed = 20;
        this.direction = 0;

        this.speedBoost = false;

        this.engine = engine;

        this.playerGroup = new THREE.Group();

        var texture = new THREE.TextureLoader().load("../images/ship.png");
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
        this.geometry = new THREE.BoxGeometry(2.5, 2.5, 0);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 1);
        this.mesh.name = "Player";
        this.playerGroup.add(this.mesh);

        this.boundingBox = null;

        this.gun = null;

        this.createGun();
        this.createBoundingBox();


        return this;

    }

    //Create a gun and attach it to the player so that it moves with the player
    createGun() {
        this.gun = new Gun(this.engine);
        this.playerGroup.add(this.gun.mesh);
    }

    //Set the spawn point of the player
    setSpawnPoint(x, y) {
        this.mesh.position.set(x, y, 0);
        //Rotate the player to face upwards
        this.mesh.rotation.z = Math.PI / 2;
    }

    //Create the bounding box for the player
    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }


    //Update the bounding box for the player
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);

        //If the player is not facingg upwards, left, right or down, then make the bounding box smaller
        if (this.mesh.rotation.z != Math.PI / 2 && this.mesh.rotation.z != -Math.PI / 2 && this.mesh.rotation.z != 0 && this.mesh.rotation.z != Math.PI) {
            this.boundingBox.min.x += 0.55;
            this.boundingBox.min.y += 0.55;
            this.boundingBox.max.x -= 0.55;
            this.boundingBox.max.y -= 0.55;
        }

    }



}