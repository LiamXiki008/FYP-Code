//Class used to create a bullet object
class Bullet {
    //Constructor for the bullet class
    constructor(x, y, direction, bulletID,speed) {

        this.speed = speed;
        this.direction = direction;
        this.isDead = false;

        this.bulletID = bulletID;

        this.position = new THREE.Vector3(x, y, 0);

        // Create the bullet mesh
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
        });
        //Sphere 
        const geometry = new THREE.SphereGeometry(0.25, 32, 32);
        this.mesh = new THREE.Mesh(geometry, material);

        //Set the name of the mesh
        this.mesh.name = "Bullet" + this.bulletID;

        this.createBoundingBox();

        return this;
    }



    // Update the position and movement of the bullet
    update(delta) {

        this.position.x += this.speed * delta * Math.cos(this.direction);
        this.position.y += this.speed * delta * Math.sin(this.direction);

        this.mesh.position.copy(this.position);
        this.updateBoundingBox();
    }

    //Kill the bullet
    killBullet() {
        this.isDead = true;
    }

    //Create the bounding box for the bullet
    createBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    //Update the bounding box for the bullet
    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

}