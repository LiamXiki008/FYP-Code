//A class that represents a gun in the game
class Gun {
    constructor(engine) {

        this.bulletSpeed = 0.1; // Speed of the bullets fired by the gun
        this.fireRate = 0.1; // The rate of fire in seconds
        this.lastFired = 0; // Time when the gun was last fired
        this.bullets = []; // An array to store the bullets fired by the gun
        this.bulletFrequency = 1000;

        this.engine = engine;

        //Create a small cube to represent the gun
        this.gunMaterial = new THREE.MeshBasicMaterial({
            color: "white",
            wireframe: false,
            transparent: true,
        });
      
        this.gunGeometry = new THREE.CircleGeometry(0.05, 32);
        this.mesh = new THREE.Mesh(this.gunGeometry, this.gunMaterial);
        this.mesh.position.set(0.25, 0.25, 0);

        this.texture = new THREE.TextureLoader().load("../images/bullet.png");
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set(1, 1);
        this.texture.anisotropy = 16;
        this.texture.encoding = THREE.sRGBEncoding;
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;
       
        this.sound = new THREE.Audio(this.engine.listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../audio/playerGun.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(false);
            this.sound.setVolume(0.4);
        });


        this.bulletFiredCount = 0;

        return this;

    }

    //Set the spawn point of the gun
    setGunSpawnPoint(x, y) {
        this.mesh.position.set(x, y + .5, 0);
    }

    //Update the position of the gun
    updateGunPosition(playerSpaceship) {
        //Make the gun rotate with the player
        this.mesh.position.x = playerSpaceship.position.x + Math.cos(playerSpaceship.rotation.z) * 0.5;
        this.mesh.position.y = playerSpaceship.position.y + Math.sin(playerSpaceship.rotation.z) * 0.5;

        //Make the gun rotate with the player
        this.mesh.rotation.z = playerSpaceship.rotation.z + 0.05;

    }

    // Fire the gun
    fire(playerSpaceship) {

        const time = performance.now();
       

        if (time - this.lastFired >= this.fireRate * this.bulletFrequency) {

            this.lastFired = time;
            const bullet = new Bullet(playerSpaceship.mesh.position.x, playerSpaceship.mesh.position.y, playerSpaceship.mesh.rotation.z, this.bullets.length, 55);
            //set the texture of the bullet
            bullet.mesh.material.map = this.texture;
            bullet.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
            this.bullets.push(bullet);
            this.engine.scene.add(bullet.mesh);
         
            //play the sound of the gun
            this.bulletFiredCount++;
        }
        this.sound.play();
    }

    // Update the bullets fired by the gun
    update(delta) {
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.update(delta);
            if (bullet.isDead) {
                this.bullets.splice(i, 1);
                this.engine.scene.remove(bullet);
    
            }
        }

    }

    //Get the number of bullets fired by the gun
    getBulletsFiredCount() {
        return this.bulletFiredCount;
    }
}