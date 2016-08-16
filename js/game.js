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
        this.bodies = [new Player(this, gameSize)];
        
        var self = this;
        // функция обновления
        var tick = function() {
            self.update();
            self.draw(screen, gameSize);
            requestAnimationFrame(tick);
        }
        
        // вызывающая функция
        tick(); 
    }
    
    Game.prototype = {
        // функция обновления всех переменных 
        update: function() {
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
        }
    }
    
    //функция игрока
    var Player = function(game, gameSize) {
        this.game = game;
        this.size = {width:16, height:16};
        this.position = {x: gameSize.x/2-this.size.width/2, y:gameSize.y-this.size.height};
        this.keyboarder = new Keyboarder();
    }

    Player.prototype = {
        update: function() {
            if(this.keyboarder.isLeft(this.keyboarder.KEYS.LEFT)) {
                this.position.x -= 2;
            }
            if (this.keyboarder.isRight(this.keyboarder.KEYS.RIGHT)) {
                this.position.x += 2;
            }
            if (this.keyboarder.isSpace(this.keyboarder.KEYS.SPACE)) {
                var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y},{x:0,y:-6});
                this.game.addBody(bullet);
            }
        }
    }
    
    //функция стрельбы
    var Bullet = function(position, velocity) {
        this.size = {width:3, height:3};
        this.position = position;
        this.velocity = velocity;
    }

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