//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
var playerCount = 0;
var username = "";

var spaceShooter = function() {
 
  var pages = document.getElementsByClassName("page");
  for(var i = 0; i < pages.length; i++){
    pages[i].style.display = "none";
  }
  
  document.getElementById("canvas-cg-lab").style.display = "block";
  document.getElementById("HUD").style.display = "block";
  document.getElementById("LOOT").style.display = "block";

  //Make the canvas fill its parent
  var canvas = document.getElementById("canvas-cg-lab");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  //get the timestamp
  var lastTime = Date.now();
  //Get the last 5 digits of the timestamp
  lastTime = lastTime.toString().substr(-5);
  //Create a uuid for the player using random string
  var uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  //create a unique username
  username = "Player_" + lastTime +"_"+ uuid;
  
  var questionnaire = document.getElementById("questionnaire");
  questionnaire.setAttribute("href","https://docs.google.com/forms/d/e/1FAIpQLSeP9J3qWPRZCv_q2vuZ9nCJGeoV8XzkTPROS695ts1HNGKtQw/viewform?usp=pp_url&entry.1552717332="+ username);

 // console.log("https://docs.google.com/forms/d/e/1FAIpQLSeP9J3qWPRZCv_q2vuZ9nCJGeoV8XzkTPROS695ts1HNGKtQw/viewform?usp=pp_url&entry.1552717332="+ username);

  //initialization
  engine = new Engine();
  engine.init();

  // run
  engine.main();

  engine.game.username = username;
  };

function showPage(pageNum){
  var pages = document.getElementsByClassName("page");
  for(var i = 0; i < pages.length; i++){
    pages[i].style.display = "none";
  }
  pages[pageNum-1].style.display = "block";
        
}

function createLevel(){
  document.getElementById("canvas-cg-lab").style.display = "block";
 // engine.game.setPlayerParameters();
 // engine.game.sendPlayerParamsToDb();
  engine.game.createNewLevel(true);
  document.getElementById("levelPassed").style.display = "none";

}

function reset(){
  document.getElementById("levelFailed").style.display = "none";
  document.getElementById("canvas-cg-lab").style.display = "block";
  //engine.resetLevel();
  engine.game.levelisOver = false;
  engine.game.createNewLevel(false);
}

  