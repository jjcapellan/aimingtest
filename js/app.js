window.onload = function () {
    var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'div_game');

    game.state.add('boot', aimingtest.boot);
    game.state.add('menu', aimingtest.menu);
    game.state.add('inGame', aimingtest.inGame);
    game.state.start('boot');
};

var aimingtest = {};

/**** Load state ****/

aimingtest.boot = function (game) {};

aimingtest.boot.prototype = function (game) {};

aimingtest.boot.prototype = {
    
    preload: function () {

        this.load.image('target', 'assets/images/target.png');
        this.load.image('pointer', 'assets/images/pointer.png');
        this.load.image('particle1', 'assets/images/particle1.png');
        this.load.image('particle2', 'assets/images/particle2.png');
        this.load.image('particle3', 'assets/images/particle3.png');
        this.load.audio('shot', 'assets/sounds/165271__mojomills__cap-shot-2.mp3');
        this.load.audio('hit', 'assets/sounds/249613__otisjames__explosionsfx.mp3');
        this.load.audio('spawn', 'assets/sounds/11221__jnr-hacksaw__zap.mp3');

    },

    create: function () {

        this.state.start('menu');

    }
}



/**** Menu state ****/

aimingtest.menu = function (game) {};

aimingtest.menu.prototype = function (game) {};

aimingtest.menu.prototype = {

    create: function () {

        this.stage.backgroundColor = 'rgb(106,98,60)';
        document.getElementById('display').innerHTML='AIMING TEST V1.0';
        var text;
        var textStyle = {
            font: "bold 32px Arial",
            fill: "#fff",
            align: "center",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        };
        text = this.add.text(0, 0, 'Use your mouse button to shoot the targets\n\nClick to start', textStyle);
        text.setTextBounds(0, 0, 960, 540);
        this.input.onDown.add(function () {
            this.input.onDown.removeAll();
            var t = this;
            var counterSeconds = 3;
            text.setText(counterSeconds.toString());
            counterSeconds--;
            var counterInterval = setInterval(function () {
                text.setText(counterSeconds.toString());
                counterSeconds--;
                if (counterSeconds < 0) {
                    clearInterval(counterInterval);
                    t.game.state.start('inGame');
                };
            }, 1000);

        }, this);
    }


}


/**** InGame state ****/

aimingtest.inGame = function (game) {};

aimingtest.inGame.prototype = function (game) {};

aimingtest.inGame.prototype = {
    create: function () {
        // Arrays initialization
        this.shotsArray = [];
        this.hitsArray = [];
        //Best score initialization
        var cookie = this.getCookie('best');
        this.bestScore = (cookie != '') ? parseInt(cookie) : 0;
        // Display html element
        this.display = document.getElementById('display');
        this.display.innerHTML = '10 targets left'
        // Headers hitsArray
        this.hitsArray.push(['HIT', 'TIME', 'DISTANCE', 'SCORE']);
        // True when reloading
        this.reloadTime = false;
        // Target life time
        this.targetTimer;
        // Target sprite
        this.target;
        // Hits counter
        this.hitsCounter = 0;
        // Targets counter
        this.targetsCounter = 0;
        //Failed shots counter
        this.failedShotsCounter = 0;
        // Bonus distance counter
        this.bonusDistanceCounter = 0;
        // Bonus time counter
        this.bonusTimeCounter = 0;
        // Points time bonus
        this.pointsTimeBonus = 1000;
        // Points distance bonus
        this.pointsDistanceBonus = 400;
        // Target spawn time stamp
        this.targetStartTime;
        // Base score
        this.score = 0;
        // Base score + bonus
        this.totalScore = 0;

        var t = this;

        // Particles emitter
        this.emitter = this.add.emitter();
        this.emitter.makeParticles(['particle1', 'particle2', 'particle3']);
        this.emitter.gravity = 0;
        /*this.emitter.minAngle=0;
        this.emitter.maxAngle=340;*/
        this.emitter.minSpeed = 600;
        this.emitter.maxParticleSpeed = new Phaser.Point(800, 800);
        this.emitter.minParticleSpeed = new Phaser.Point(-800, -800);
        this.emitter.alpha = 0.5;
        this.emitter.lifespan = 1000;
        this.emitter.height = 90;
        this.emitter.width = 90;
        this.emitter.maxParticles=30;

        //Sound effects
        this.sndShot = this.add.audio('shot', 1, false);
        this.sndHit = this.add.audio('hit', 1, false);
        this.sndTarget = this.add.audio('spawn', 1, false);

        //Target sprite definition
        this.target = this.add.sprite(this.math.between(80, 960 - 80), this.math.between(80, 540 - 80), 'target');
        this.target.anchor.setTo(0.5, 0.5);
        this.target.inputEnabled = true;
        this.target.visible = false;

        // Spawn first target        
        this.targetTimer = setTimeout(t.resetTarget.bind(t), t.math.between(800, 1100));

        // Ondown event
        this.input.onDown.add(function (pointerPosition) {

            // Check reloadTime
            if (!t.reloadTime) {
                // This prevents multiple shots in a short time.
                t.reloadTime = true;
                // Target position (x,y)
                var targetPosition = t.target.position;
                var isHit = t.target.input.pointerOver();
                //Play sound
                t.sndShot.play();
                // Distance between mouse pointer and target
                var distance = parseInt(t.getDistance(pointerPosition, targetPosition));
                // New shot in shotsArray
                t.shotsArray.push(distance);

                // Check possible hit
                if (isHit && distance < 70) {

                    // Hit time stamp
                    var targetHitTime = performance.now();
                    //Play hit
                    t.sndHit.play();
                    // Explosion
                    t.emitter.x = targetPosition.x - 40;
                    t.emitter.y = targetPosition.y - 40;
                    t.emitter.explode(1000, 10);
                    // Hit count
                    t.hitsCounter++;
                    // Time elapsed until impact.
                    var timeSpan = parseInt(targetHitTime - t.targetStartTime);
                    // Hit score
                    var hitScore = parseInt(400 - distance * 2 - timeSpan / 10);
                    // Total score
                    t.score += hitScore;
                    // Check bonus
                    if (distance < 5) {
                        t.bonusDistanceCounter++;
                    };
                    if (timeSpan < 400) {
                        t.bonusTimeCounter++;
                    };
                    // New hit in the hits array
                    t.hitsArray.push([t.hitsCounter, timeSpan + ' ms', distance + ' px', hitScore + ' pts']);
                    // Reset target in new position
                    t.clearTimer();
                    t.target.visible = false;
                    if (this.targetsCounter == 10) {
                        this.gameOver();
                        return;
                    };
                    setTimeout(t.resetTarget.bind(t), this.math.between(300, 1000));

                } else {
                    t.failedShotsCounter++;
                };

                // A new shot is blocked for 100 milliseconds
                setTimeout(function () {
                        t.reloadTime = false;
                    },
                    30
                );

            }
        }, this);


    },

    resetTarget: function () {
        if (this.targetsCounter == 10) {
            this.gameOver();
            return;
        };
        this.targetsCounter++;
        this.sndTarget.play();
        this.target.reset(this.math.between(80, 960 - 80), this.math.between(80, 540 - 80));
        this.targetStartTime = performance.now();
        this.setTimer();
        this.display.innerHTML = (10 - this.targetsCounter) + ' targets left';
    },

    setTimer: function () {
        this.targetTimer = setTimeout(this.resetTarget.bind(this), this.math.between(800, 1000));
    },

    clearTimer: function () {
        clearTimeout(this.targetTimer);
    },

    getDistance: function (pointA, pointB) {

        var dx = pointA.x - pointB.x;
        var dy = pointA.y - pointB.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance;

    },

    gameOver: function () {

        this.setTotalScore();

        // Check new record
        if (this.bestScore < this.totalScore) {
            this.display.innerHTML = 'You got a new record !!!';
            this.setCookie('best',this.totalScore,180);

        } else {
            this.display.innerHTML = 'Your best score is ' + this.bestScore.toString();
        };

        this.showResults();

    },

    setTotalScore: function () {
        this.totalScore = this.score + this.bonusDistanceCounter * this.pointsDistanceBonus + this.bonusTimeCounter * this.pointsTimeBonus - this.failedShotsCounter * 400;        
    },

    showResults: function () {

        var tableResults = document.getElementById('tbl_results');
        var cellType = 'th';

        // hitsArray to table
        this.hitsArray.forEach(element => {
            var i = 0;
            var row = document.createElement('tr');
            for (i = 0; i < 4; i++) {
                var cell = document.createElement(cellType);
                cell.textContent = element[i];
                row.appendChild(cell);
            }
            cellType = 'td';
            tableResults.appendChild(row);
        });

        // StatsArray save game data
        var statsArray = [];
        statsArray.push('BONUS');
        statsArray.push([this.bonusDistanceCounter + ' x Distance < 5px', '+' + this.bonusDistanceCounter * this.pointsDistanceBonus + ' pts']);
        statsArray.push([this.bonusTimeCounter + ' x Time < 400ms', '+' + this.bonusTimeCounter * this.pointsTimeBonus + ' pts']);
        statsArray.push('PENALTIES');
        statsArray.push([this.failedShotsCounter + ' x Failed Shots', this.failedShotsCounter * (-400) + ' pts']);

        // StatsArray to table
        statsArray.forEach(element => {
            var i = 0;
            var rowSize = 0;
            var row = document.createElement('tr');
            if (Array.isArray(element)) {
                cellType = 'td';
                rowSize = 2;
            } else {
                cellType = 'th';
                rowSize = 1;
            }
            for (i = 0; i < rowSize; i++) {
                var cell = document.createElement(cellType);
                if (cellType == 'th') {
                    cell.setAttribute("colspan", 4);
                    cell.textContent = element;
                } else {
                    cell.setAttribute("colspan", 2);
                    cell.textContent = element[i];
                };
                row.appendChild(cell);
            }
            tableResults.appendChild(row);
        });

        // Total score        
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.setAttribute('colspan', 4);
        cell.textContent = 'TOTAL SCORE';
        row.appendChild(cell);
        tableResults.appendChild(row);

        row = document.createElement('tr');
        cell = document.createElement('td');
        cell.setAttribute('colspan', 4);
        cell.style.backgroundColor = 'red';
        cell.style.color = 'white';
        cell.style.fontSize = '1.5em';
        cell.textContent = this.totalScore.toString();
        row.appendChild(cell);
        tableResults.appendChild(row);
        tableResults.style.opacity = '1';


        document.getElementById('replay').innerHTML = 'Click to replay';

        // Changes onDown event
        this.input.onDown.removeAll();
        this.input.onDown.add(this.replay, this);

    },

    replay: function () {
        // Clear table
        var tableResults = document.getElementById('tbl_results');
        tableResults.style.opacity = 0;
        tableResults.innerHTML = '';
        document.getElementById('replay').innerHTML = '';
        // starts menu state
        this.state.start('menu');
    },

    setCookie: function (c_name, c_value, c_days) {
        var d = new Date();
        d.setTime(d.getTime() + (c_days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = c_name + "=" + c_value + ";" + expires + ";path=/";
    },

    getCookie: function (c_name) {
        var name = c_name + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }



}