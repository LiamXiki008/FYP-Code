//Class used to create an enemy gun object
class EnemyGun {
    constructor(engine,fireRate,enemyType) {

        this.bulletSpeed = 0.1; // Speed of the bullets fired by the gun
        this.fireRate = fireRate; // The rate of fire in seconds
        this.lastFired = 0; // Time when the gun was last fired
        this.bullets = []; // An array to store the bullets fired by the gun
        this.enemyType = enemyType;
        this.engine = engine;

        //Create a small cube to represent the gun
        this.gunMaterial = new THREE.MeshBasicMaterial({
            color: "blue",
            wireframe: false
        });
        this.gunGeometry = new THREE.BoxGeometry(0.5, 0.5, 0);
        this.mesh = new THREE.Mesh(this.gunGeometry, this.gunMaterial);
        this.mesh.position.set(0.5, 0.5, 0);

        this.sound = new THREE.Audio(this.engine.listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../audio/lasershot2.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(false);
            this.sound.setVolume(0.7);
        });

        this.bulletFiredCount = 0;

        return this;

    }

    //Set the spawn point of the gun
    setEnemyGunSpawnPoint(x, y,enemyType) {
        //switch statement to determine the spawn point of the gun
        switch (enemyType) {
            case 1:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
            case 2:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
            case 3:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
            case 4:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
            case 5:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
            default:
                this.mesh.position.set(x + 0.5, y + 0.5, 0);
                break;
        }

    }

    //Update the position of the gun
    updateEnemyGunPosition(enemy) {
        //Make the gun rotate with the player
        this.mesh.position.x = enemy.mesh.position.x + Math.cos(enemy.mesh.rotation.z) * 0.5;
        this.mesh.position.y = enemy.mesh.position.y + Math.sin(enemy.mesh.rotation.z) * 0.5;

        //Make the gun rotate with the player
        this.mesh.rotation.z = enemy.mesh.rotation.z + 0.05;

    }

    // Fire the gun
    fireEnemyGun(enemy, player) {
        //Check if the distance between the player and the enemy is less than 10
        if (Math.sqrt(Math.pow(player.mesh.position.x - enemy.mesh.position.x, 2) + Math.pow(player.mesh.position.y - enemy.mesh.position.y, 2)) < enemy.aggression) {

            //Check if the gun is ready to fire


            const time = performance.now();
            if (time - this.lastFired >= this.fireRate * 20000) {
                this.sound.play();
                this.lastFired = time;
                if(this.enemyType == 3){
                const bullet = new Bullet(enemy.mesh.position.x, enemy.mesh.position.y, enemy.mesh.rotation.z, this.bullets.length, 20);
                const bullet2 = new Bullet(enemy.mesh.position.x, enemy.mesh.position.y, enemy.mesh.rotation.z, this.bullets.length, 20);
                const bullet3 = new Bullet(enemy.mesh.position.x, enemy.mesh.position.y, enemy.mesh.rotation.z, this.bullets.length, 20);

                bullet.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
                bullet2.position.set(this.mesh.position.x + Math.cos(enemy.mesh.rotation.z)*0.5 -.5, this.mesh.position.y + Math.sin(enemy.mesh.rotation.z)*0.5 -.5, this.mesh.position.z);
                bullet3.position.set(this.mesh.position.x + Math.cos(enemy.mesh.rotation.z)*0.5+.5, this.mesh.position.y + Math.sin(enemy.mesh.rotation.z)*0.5-.5, this.mesh.position.z);

                this.bullets.push(bullet);
                this.bullets.push(bullet2);
                this.bullets.push(bullet3);

                bullet.mesh.material.color.setHex(0xff0000);
                bullet2.mesh.material.color.setHex(0xff0000);
                bullet3.mesh.material.color.setHex(0xff0000);

                engine.scene.add(bullet.mesh);
                engine.scene.add(bullet2.mesh);
                engine.scene.add(bullet3.mesh);

                this.bulletFiredCount++;
                this.bulletFiredCount++;
                this.bulletFiredCount++;

                }else{
                const bullet = new Bullet(enemy.mesh.position.x, enemy.mesh.position.y, enemy.mesh.rotation.z, this.bullets.length, 20);
                bullet.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
                this.bullets.push(bullet);
                //Make the bullet red
                bullet.mesh.material.color.setHex(0xff0000);
                engine.scene.add(bullet.mesh);
                this.bulletFiredCount++;
                }

            }
        }
    }

    // Update the bullets fired by the gun
    updateEnemyGun(delta) {
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.update(delta);
            if (bullet.isDead) {
                this.bullets.splice(i, 1);
                engine.scene.remove(bullet);
            }
        }
    }

    //Get the number of bullets fired by the gun
    getBulletsFiredCount() {
        return this.bulletFiredCount;
    }
}