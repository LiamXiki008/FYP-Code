//Engine Class - This class is responsible for the rendering of the game, the creation of the scene, the camera and the lights
class Engine {
    constructor() {
        this.fps = 30;
        this.game = null;

        this.gl = null;
        this.canvas = null;
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.overHeadCamera = null;
        this.lightNode = null;
        this.materials = [];
        this.textureList = [];
        this.input = null;
        this.listener = null;

        this.sceneCopy = null;

        this.insetWidth = 0;
        this.insetHeight = 0;
        
        
        this.clock = new THREE.Clock();

    }

    //init function - this function is responsible for the creation of the scene, the camera and the lights
    init() {
        this.scene = new THREE.Scene();
        //scene background color black
        this.scene.background = new THREE.Color(0x000000);
      
        //Add lights to the scene
        var light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(50, 50, 50);
        this.scene.add(light);

        //Add a renderer to the scene
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        //Add a camera to the scene
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene.add(this.camera);
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        
        //Randomly generate a number between 0 and 1
        var random = Math.random();
        //If the number is less than 0.5, generate a level with a corridor
        if(random < 0.5){
            this.game = new Game(this,false);
        } else {
            this.game = new Game(this,true);
        }

        //render the level
        this.game.renderLevel(this);

        //add a camera to the scene
        this.camera.position.set(this.game.playerSpaceship.mesh.position.x, this.game.playerSpaceship.mesh.position.y, 75);
        this.camera.lookAt(this.game.playerSpaceship.mesh.position);


        
        this.canvas = document.getElementById("canvas-cg-lab");
        //add an input to the scene
        this.input = new Input(this.canvas);

        try {
            this.gl = this.canvas.getContext("experimental-webgl");
        } catch (e) {
            alert("Error: " + e);
        }

        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.aspect = this.canvas.width / this.canvas.height;

        this.insetWidth = 0.25 * this.canvas.width;
        this.insetHeight = 0.25 * this.canvas.height;

        //add a listener to the scene
        const sound = new THREE.Audio(this.listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('../audio/backgroundMusic.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.25);
            sound.play();
        });

       
    }

    //main function - this function is responsible for the rendering of the game
    main = function() {

        //request animation frame
        var animate = () => {
            requestAnimationFrame(animate);

            const delta = this.clock.getDelta();
            
            //Game logic
            if(!this.game.levelisOver){
                this.game.checkInput(this);
                this.game.moveCamera(this);
                if(this.input.startedMoving){
                this.game.checkCollision();
                this.game.moveEnemies();
                this.game.enemyShooting();
                }
            }
            

            for(let i = 0; i < this.game.level.enemies.length; i++){
                if(this.game.level.enemies[i].enemyGun != null){
                this.game.level.enemies[i].enemyGun.updateEnemyGun(delta);
                }
            }

            this.game.playerSpaceship.gun.update(delta);
 
            //If the level is over, display the appropriate message
            if(this.game.levelCount == 5 && this.game.levelisOver){
                document.getElementById("canvas-cg-lab").style.display = "none";
                document.getElementById("gameOver").style.display = "block";
                document.getElementById("finalScoreGameOver").innerHTML = this.game.score;
                document.getElementById("finalScoreUsername").innerHTML = "Username:" + this.game.username;

                if(!this.game.level.dataSent){
                this.game.setPlayerParameters();
                this.game.sendPlayerParamsToDb();
                this.game.level.dataSent = true;
                }
                

            }else
             if(this.game.levelisOver && this.game.levelComplete == false){
                document.getElementById("levelFailed").style.display = "block";
                document.getElementById("canvas-cg-lab").style.display = "none";
                this.input.startedMoving = false;
                if(!this.game.level.dataSent){
                    this.game.setPlayerParameters();
                    this.game.sendPlayerParamsToDb();
                    this.game.level.dataSent = true;
                }
            } else if(this.game.levelisOver && this.game.levelComplete == true){
                document.getElementById("levelPassed").style.display = "block";
                document.getElementById("canvas-cg-lab").style.display = "none";
                this.input.startedMoving = false;
                if(!this.game.level.dataSent){
                    this.game.setPlayerParameters();
                    this.game.sendPlayerParamsToDb();
                    this.game.level.dataSent = true;
                }
            }

            this.renderer.render(this.scene, this.camera);

        };

        //call animate function
        animate();
    }

    //reset level function
    resetLevel() {
       this.input.startedMoving = false;
       this.game.rerenderLevel(this);
    }

    


};