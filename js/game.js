// цикл игры 
;(function(){
    var Game = function(canvasId) {
        var canvas = document.getElementById(canvasId);
        var screen = canvas.getContext('2d');
        var gameSize = {
            x: canvas.width,
            y: canvas.height
        };
        
        //массив объектов
        this.bodies = createInvaders(this).concat([new Player(this, gameSize)]);
        
        var self = this;
        loadSond("sound/shoot.wav", function(shootSound) {
            self.shootSound = shootSound;
            // функция обновления
            var tick = function() {
                self.update(gameSize);
                self.draw(screen, gameSize);
                requestAnimationFrame(tick);
            }

            // вызывающая функция
            tick(); 
        });
    }
    
    //игровой протатип
    Game.prototype = {
        // функция обновления всех переменных 
        update: function(gsmeSize) {
            var bodies = this.bodies;
            // функция проверяющая столкновения b1 c другим объектом b2
            var notCollidingWithAnything = function(b1) {
                return bodies.filter(function(b2) {
                    return colliding(b1, b2);
                }).length == 0;
            }
            
            this.bodies = this.bodies.filter(notCollidingWithAnything);
            
            // массив удаления выстрелов
            for(var i = 0; i < this.bodies.length; i++) {
                if(this.bodies[i].position.y < 0) {
                    this.bodies.splice(i,1);
                }
            }
            for(var i = 0; i < this.bodies.length; i++) {
                this.bodies[i].update();
            }
        },
        
        // функция рисующие объeкты на canvas's
        draw: function(screen, gameSize) {
            clearCanvas(screen, gameSize);
            for(var i = 0; i < this.bodies.length; i++) {
                drawRect(screen, this.bodies[i]);
            }
        }, 
        //функция добавляющая новое тело
        addBody: function(body) {
            this.bodies.push(body);
        },
        
        //функция возвращающая значения true 
        invadersBelow: function(invader) {
            return this.bodies.filter(function(b) {
                return b instanceof Invader &&
                b.position.y > invader.position.y &&
                b.position.x - invader.position.x < invader.size.width;
            }).length > 0;
        }
    }
    
    //функция врагов
    var Invader = function(game, positon) {
        this.game = game;
        this.size = {width:16, height:16};
        this.position = positon;
        this.patrolX = 0;
        this.speedX = 5;
    }
    
    // протатип врагов
    Invader.prototype = {
        //функция не дает выйди за рамки canvas'a
        update: function() {
            if(this.patrolX < 0 || this.patrolX > 500) {
                this.speedX = -this.speedX;
            }
            
            this.position.x += this.speedX;
            this.patrolX += this.speedX;
            
            if(Math.random() < 0.02 && !this.game.invadersBelow(this)) {
            var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y+this.size.height/2},{x:Math.random()-0.5,y:2});
                this.game.addBody(bullet);
            }
        }
    }
    
    //функция игрока
    var Player = function(game, gameSize) {
        this.game = game;
        this.bullets = 0;
        this.timer = 0;
        this.size = {width:16, height:16};
        this.position = {x: gameSize.x/2-this.size.width/2, y:gameSize.y-this.size.height};
        this.keyboarder = new Keyboarder();
    }
    
    //протатип игрока
    Player.prototype = {
        update: function() {
            if(this.keyboarder.isLeft(this.keyboarder.KEYS.LEFT)) {
                this.position.x -= 2;
            }
            if (this.keyboarder.isRight(this.keyboarder.KEYS.RIGHT)) {
                this.position.x += 2;
            }
            if (this.keyboarder.isSpace(this.keyboarder.KEYS.SPACE)) {
                if(this.bullets < 2) {
                    
                    var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y},{x:0,y:-10});
                    this.game.addBody(bullet);
                    this.bullets++;
                    this.game.shootSound.load();
                    this.game.shootSound.play();
                }
            }
            // увелечение переменной таймер
            this.timer++;
            if(this.timer % 12 == 0) {
                this.bullets = 0;
            }
        }
    }
    
    //функция стрельбы
    var Bullet = function(position, velocity) {
        this.size = {width:3, height:3};
        this.position = position;
        this.velocity = velocity;
    }
    
    //протатип стрельбы
    Bullet.prototype = {
        update: function() {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y; 
        }
    }
        
    
    //функция нажатия на клавишу
    var Keyboarder = function() {
        var keyState = {};
        
        window.onkeydown = function(e) {
            keyState[e.keyCode] = true;
        }
        window.onkeyup = function(e) {
            keyState[e.keyCode] = false;
        }
        
        this.isLeft = function(keyCode) {
            return keyState[keyCode] === true;
        }
        
        this.isRight = function(keyCode) {
            return keyState[keyCode] === true;
        }
        
        this.isSpace = function(keyCode) {
            return keyState[keyCode] === true;
        }
        
        this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
    }
    
    //функия захватчиков
    var createInvaders = function(game) {
        //массив захватчиков
        var invaders = [];
        //цикл
        for(var i = 0; i < 24; i++) {
            var x = 30 + (i%8) * 30;
            var y = 30 + (i%3) * 30;
            invaders.push(new Invader(game, {x:x, y:y}));
        }
        return invaders;
    }
    
    //функция столкновения
    var colliding = function(b1, b2) {
        return !(b1 == b2 ||
            b1.position.x + b1.size.width / 2 < b2.position.x - b2.size.width / 2 ||
            b1.position.y + b1.size.height / 2 < b2.position.y - b2.size.height / 2 ||
            b1.position.x - b1.size.width / 2 > b2.position.x + b2.size.width / 2 ||
            b1.position.y - b1.size.height / 2 > b2.position.y + b2.size.height / 2);
    }
    
    //звуки
    var loadSond = function(url, callback) {
        var loaded = function() {
            callback(sound);
            sound.removeEventListener("canplaythrough", loaded);
        }
        var sound = new Audio(url);
        sound.addEventListener("canplaythrough", loaded);
        sound.load();
    }
    
    //функция рисующиие обьекты 'body'
    var drawRect = function(screen, body) {
        screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
    }
    
    //функция очистки 
    var clearCanvas = function(screen, gameSize) {
        screen.clearRect(0,0,gameSize.x, gameSize.y);
    }
    
    window.onload = function() {
        new Game("screen");
    }
})();