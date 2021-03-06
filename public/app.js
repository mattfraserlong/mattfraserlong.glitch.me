 // controller variables assigned
        const LEFT_KEY = 37;
        const UP_KEY = 38;
        const RIGHT_KEY = 39;
        const DOWN_KEY = 40;
        const SPACE_KEY = 32;

        //DOM elements declared
        var gameOverSign = document.getElementById("endGame");
        var gameOverButton = document.getElementById("restartBtn");
        var heroDiv = document.getElementById("hero");
        var form = document.getElementById("form");
        var laserDiv = document.getElementById("laser");
        var scores = document.getElementById("scores");
        var highscores = document.getElementById("highscores");
        var playerEnterBtn = document.getElementById("playerEnterBtn");
        
        //button actions
        playerEnterBtn.addEventListener("click", init);
        gameOverButton.addEventListener("click", init);

        // game state variables declared
        var LASER_SPEED;
        var ENEMY_SPEED;
        var HERO_MOVEMENT;
        var active;
        var enemies;
        var score;
        var restartFlag = false;
        var playerName;

        //game object variables declared
        var controller;
        var livesNumber;
      
        //first run div visibility options, before init triggered
        gameOverSign.style.visibility = "hidden";
        gameOverButton.style.visibility = "hidden";
        laserDiv.style.visibility = "hidden";
        heroDiv.style.visibility = "hidden";
        
        //interrogating db then pushing high scores to front end
        function getdbData() {           
            var HttpClient = function() {
                this.get = function(aUrl, aCallback) {
                    var anHttpRequest = new XMLHttpRequest();
                    anHttpRequest.onreadystatechange = function() { 
                    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                        aCallback(anHttpRequest.responseText);
                    } 
                anHttpRequest.open( "GET", aUrl, true );            
                anHttpRequest.send( null );
                }
            }
        
        //using HttpClient to get data
            var client = new HttpClient();
            client.get('https://mattfraserlong.glitch.me/api/space-invader', function(response) {
            scores.innerHTML = (response);
            });
        }
      
      //sending json object to the database
      function senddbData(myForm, score) {
        var xhr = new XMLHttpRequest();
        var url = "https://mattfraserlong.glitch.me/api/space-invader-post";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.onreadystatechange = function () { 
          if (xhr.readyState == 4 && xhr.status == 200) {
              var json = JSON.stringify(xhr.responseText);
          }
        }
      
        var data = JSON.stringify({"playerName":playerName, "playerScore":score});
        xhr.send(data);
      }

        // init game states for first game play and all others
        function init() {
            if (!restartFlag) {
              playerName = document.forms["myForm"].elements["name"].value;
              getdbData();
              HERO_MOVEMENT = 5;
              LASER_SPEED = 7;
              ENEMY_SPEED = 2;
              controller = new Object();
              enemies = new Array();
              score = 0;
              livesNumber = 0;
              active = true;
              form.style.visibility = "hidden";
              gameOverSign.style.visibility = "hidden";
              gameOverButton.style.visibility = "hidden";
              laserDiv.style.visibility = "visible";
              heroDiv.style.visibility = "visible";
              scores.style.visibility = "hidden";
              highscores.style.visibility = "hidden";
              gameOverButton.style.visibility = "hidden";
              gameOverSign.style.visibility = "hidden";
              restartFlag = true;
              
            } else if (restartFlag) {
              playerName = document.forms["myForm"].elements["name"].value;
              removeEnemy();
              resetScore();
              resetLives();
              form.style.visibility = "visible";
              gameOverSign.style.visibility = "hidden";
              gameOverButton.style.visibility = "hidden";
              laserDiv.style.visibility = "visible";
              heroDiv.style.visibility = "visible";
              scores.style.visibility = "visible";
              highscores.style.visibility = "visible";
              gameOverButton.style.visibility = "hidden";
              gameOverSign.style.visibility = "hidden";
              restartFlag = false;
            }
            window.requestAnimationFrame(loop);
        }

        // keep sprites on screen
        function ensureBounds(sprite, ignoreY) {
            if (sprite.x < 40) {
                sprite.x = 40;
            }
            if (!ignoreY && sprite.y < 40) {
                sprite.y = 40;
            }
            if (sprite.x + sprite.w > 500) {
                sprite.x = 500 - sprite.w;
            }
            if (!ignoreY && sprite.y + sprite.h > 500) {
                sprite.y = 500 - sprite.h;
            }
        }

        // create hero and laser
        function createSprite(element, x, y, w, h) {
            var spriteObj = new Object();
            spriteObj.element = element;
            spriteObj.x = x;
            spriteObj.y = y;
            spriteObj.w = w;
            spriteObj.h = h;
            return spriteObj;
        }

        // add enemy
        function addEnemy() {
            if (randomNumber(50) === 0) {
                let elementName = 'enemy' + randomNumber(10000000);
                let enemy = createSprite(elementName, (randomNumber(440) + 40), 40, 30, 30);
                enemies[enemies.length] = enemy;
                var element = document.createElement('div');
                element.id = enemy.element;
                element.className = 'enemy';
                document.body.insertBefore(element, document.body.childNodes[2]);
            }
        }

        // move laser and enemy positions
        function updatePositions() {
            laser.y -= LASER_SPEED;
            for (let i = 0; i < enemies.length; i++) {
                enemies[i].y += ENEMY_SPEED;
                ensureBounds(enemies[i], true);
            }
        }

        // do sprites overlap?
        function intersects(a, b) {
            return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        }
        
        // randonnumber generator
        function randomNumber(maxSize) {
            return parseInt(Math.random() * maxSize);
        }

        // game over and restart functions
        function gameOver() {
            active = false;
            gameOverSign.style.visibility = "visible";
            gameOverButton.style.visibility = "visible";
            senddbData(playerName, score);
            getdbData();
        }

        function restart() {
            restart = true;
            init();
        }

        function resetScore() {
            let score = document.getElementById("score");
            score.innerHTML = "000";
        }

        function resetLives() {
            let all = document.getElementsByClassName("lives");
            for (let i = 0; i < all.length; i++) {
                all[i].style.visibility = "visible";
            }
        }
      
        //remove enemy on restart
        function removeEnemy() {
            let all = document.getElementsByClassName('enemy');
            for (let i = 0; i < all.length; i++) {
                all[i].style.visibility = 'hidden';
            }
        }

        //define sprite co-ordinates and draw them
        function setPosition(sprite) {
            var e = document.getElementById(sprite.element);
            e.style.left = sprite.x + 'px';
            e.style.top = sprite.y + 'px';
        }

        function showSprites() {
            setPosition(hero);
            setPosition(laser);
            for (var i = 0; i < enemies.length; i++) {
                setPosition(enemies[i]);
            }
        }
          
        //update game score
        function scoreUpdate(tally) {
            let score = document.getElementById("score");
            score.innerHTML = tally;
        }
        
        // use intersects to check if sprites have collided
        function checkCollisions() {
            for (var i = 0; i < enemies.length; i++) {
                if (intersects(laser, enemies[i])) {
                    var element = document.getElementById(enemies[i].element);
                    element.style.visibility = 'hidden';
                    element.parentNode.removeChild(element);
                    enemies.splice(i, 1);
                    i--;
                    laser.y = -120;
                    score += 100;
                    scoreUpdate(score);
                } else if (intersects(hero, enemies[i])) {
                    livesNumber += 1;
                    var element = document.getElementById(enemies[i].element);
                    var lives = document.getElementById("lives" + livesNumber);
                    element.parentNode.removeChild(element);
                    enemies.splice(i, 1);
                    i--;
                    hero.y = 480;
                    hero.x = 250;
                    lives.style.visibility = "hidden";
                    if (livesNumber >= 3) {
                        gameOver();
                    }
                } else if (enemies[i].y + enemies[i].h >= 500) {
                    var element = document.getElementById(enemies[i].element);
                    element.style.visibility = 'hidden';
                    element.parentNode.removeChild(element);
                    enemies.splice(i, 1);
                    i--;
                }
            }
            if (laser.y < 20) {
                laser.y = -120;
            }
        }

        // the main game loop
        function loop() {
            if (active) {
                var looping = requestAnimationFrame(loop);
                updatePositions();
                handleControls();
                checkCollisions();
                addEnemy();
                showSprites();
            }
        }

        // Keyboard keys and controller
        function handleControls() {
            if (controller.up) {
                hero.y -= HERO_MOVEMENT;
            }
            if (controller.down) {
                hero.y += HERO_MOVEMENT;
            }
            if (controller.left) {
                hero.x -= HERO_MOVEMENT;
            }
            if (controller.right) {
                hero.x += HERO_MOVEMENT;
            }
            if (controller.space & laser.y <= -120) {
                laser.x = hero.x + 8;
                laser.y = hero.y - 50;
            }
            ensureBounds(hero);
        }

        function toggleKey(keyCode, isPressed) {
            if (keyCode == LEFT_KEY) {
                controller.left = isPressed;
            }
            if (keyCode == RIGHT_KEY) {
                controller.right = isPressed;
            }
            if (keyCode == UP_KEY) {
                controller.up = isPressed;
            }
            if (keyCode == DOWN_KEY) {
                controller.down = isPressed;
            }
            if (keyCode == SPACE_KEY) {
                controller.space = isPressed;
            }
        }

        document.onkeydown = function(evt) {
            toggleKey(evt.keyCode, true);
        };

        document.onkeyup = function(evt) {
            toggleKey(evt.keyCode, false);
        };

        // create hero and laser
        var hero = createSprite('hero', 250, 480, 20, 20);
        var laser = createSprite('laser', 5, -120, 10, 10);
      
        getdbData();
        