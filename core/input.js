// Helper class which provides a simple input facade.
var Input = function (canvas) {

   this.key = {
    w:false,
    a:false,
    s:false,
    d:false,
    q:false,
    e:false,
    p:false,
    k:false,
    arrowUp:false,
    arrowDown:false,
    arrowLeft:false,
    arrowRight:false,


   };


   this.startedMoving  = false;

   //add event listeners for keydown and keyup events
  document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === 'w') {
        this.key.w = true;
        this.startedMoving = true;
    }
    else if (keyName === 's') {
        this.key.s = true;
        this.startedMoving = true;
    }
    else if (keyName === 'a') {
        this.key.a = true;
        this.startedMoving = true;
    }

    else if (keyName === 'd') {
        this.key.d = true;
        this.startedMoving = true;
    }
    else if (keyName === 'q') {
        this.key.q = true;
    }
    else if (keyName === 'e') {
        this.key.e = true;
    }
   
    else if (keyName === 'p') {
        this.key.p = true;
    }
    else if (keyName === 'k') {
        this.key.k = true;
        //this.startedMoving = true;

    } else if (keyName == 'ArrowUp') {
        this.key.arrowUp = true;
    } else if (keyName == 'ArrowDown') {
        this.key.arrowDown = true;
    } else if (keyName == 'ArrowLeft') {
        this.key.arrowLeft = true;
    } else if (keyName == 'ArrowRight') {
        this.key.arrowRight = true;
    }
    }, false);

    document.addEventListener('keyup', (event) => {
        const keyName = event.key;
        if (keyName === 'w') {
            this.key.w = false;
        }
        else if (keyName === 's') {
            this.key.s = false;
        }
        else if (keyName === 'a') {
            this.key.a = false;
        }
        else if (keyName === 'd') {
            this.key.d = false;
        }
        else if (keyName === 'q') {
            this.key.q = false;
        }
        else if (keyName === 'e') {
            this.key.e = false;
        }
        else if (keyName === 'p') {
            this.key.p = false;
        }
        else if (keyName === 'k') {
            this.key.k = false;
        }
         else if (keyName == 'ArrowUp') {
            this.key.arrowUp = false;
        } else if (keyName == 'ArrowDown') {
            this.key.arrowDown = false;
        } else if (keyName == 'ArrowLeft') {
            this.key.arrowLeft = false;
        } else if (keyName == 'ArrowRight') {
            this.key.arrowRight = false;
        }
        
    }, false);

};

//check if a key is pressed
Input.prototype.isKeyDown = function (key) {
    return this.key[key];
}

//check if a key is released
Input.prototype.isKeyUp = function (key) {
    return !this.key[key];
}


