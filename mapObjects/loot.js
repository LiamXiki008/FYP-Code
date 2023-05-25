//Class for loot objects
class Loot{
    constructor(x, y, type, lootID){
        this.x = x;
        this.y = y;
        this.type = "";
        this.lootID = lootID;
        this.room = -1;
        this.material = null;
       
        //switch statement to determine the type of loot
        switch(type){
            //Health
            case 0:
                this.type = "health";
                var geometry = new THREE.BoxGeometry(4,4,0); 
                var texture = new THREE.TextureLoader().load("../images/healthpack.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                break;
            //Shield
            case 1:
                this.type = "shield";
                var geometry = new THREE.BoxGeometry(2.5,2.5,0); 
                var texture = new THREE.TextureLoader().load("../images/shield.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });

                break;
            //Damage
            case 2:
                this.type = "damage";
                var geometry = new THREE.BoxGeometry(2.5,2.5,0);
                var texture = new THREE.TextureLoader().load("../images/damage.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                }); 
                
                break;
            //Fire Rate
            case 3:
                this.type = "fireRate";
                
                var geometry = new THREE.BoxGeometry(2.5,2.5,0);
                var texture = new THREE.TextureLoader().load("../images/firerate.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                }); 
                break;
            //Speed
            case 4:
                this.type = "speed";
                var geometry = new THREE.BoxGeometry(2.5,2.5,0); 
                var texture = new THREE.TextureLoader().load("../images/speed.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                break;
            //Key
            case 5:
                this.type = "key";
                var geometry = new THREE.BoxGeometry(2.5,2.5,0); 
                var texture = new THREE.TextureLoader().load("../images/key.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
                texture.anisotropy = 16;
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;

                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                });
                
                break;

            default:
                this.type = "health";
                break;
                
        }

        //Create a cube mesh
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.set(this.x, this.y, 0);
        this.mesh.name = "Loot" + this.lootID;

        this.boundingBox = null;
        this.setBoundingBox();

        return this;
    }
    
    //Set the spawn point of the loot
    setLootSpawnPoint(x, y) {
        this.x = x;
        this.y = y;
    }

    //Create the bounding box for the loot
    setBoundingBox() {
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
    }

    //Get the bounding box for the loot
    getBoundingBox() {
        return this.boundingBox;
    }



}