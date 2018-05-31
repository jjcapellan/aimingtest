/**** Evasion mode state ****/

aimingtest.trackingMode = function (game) {};

aimingtest.trackingMode.prototype = function (game) {};

aimingtest.trackingMode.prototype = {

    create: function () {

        // Timer to control hits
        this.timerHits = {
            isOn: false,
            start: function () {
                this.t0 = performance.now();
            },
            getTime: function () {
                this.t1 = performance.now();
                var elapsedTimeMs = Math.ceil(this.t1 - this.t0);
                return elapsedTimeMs;
            }
        };

        // Timer to control fails
        this.timerFails = {
            isOn: false,
            start: function () {
                this.t0 = performance.now();
            },
            getTime: function () {
                this.t1 = performance.now();
                var elapsedTimeMs = Math.ceil(this.t1 - this.t0);
                return elapsedTimeMs;
            }
        }

        // Sum distances to target
        this.distances = 0;
        // Distance samples
        this.samples = 0;
        // Evasion tweens for target.x and target.y
        this.evasionTweenx = null;
        this.evasionTweeny = null;
        
        // Fails counter
        this.penalties = 0;
        //Best score initialization
        var cookie = globals.getCookie('aimingTrackingBest1');
        this.bestScore = (cookie != '') ? parseInt(cookie) : 0;
        // Display html element
        this.display = document.getElementById('display');
        this.display.innerHTML = '';
        // Target sprite
        this.target;
        // Base score
        this.score = 0;
        // Base score + bonus
        this.totalScore = 0;

        var t = this;

        // Particles emitter
        this.emitter = globals.getEmitter(this.game);
        //this.emitter.scale = 0.5;

        //Sound effects
        this.sndShot = this.add.audio('lgfailed', 1, false);
        this.sndHit = this.add.audio('lghit', 1, false);
        this.sndTarget = this.add.audio('spawn', 1, false);

        //Target sprite definition
        this.target = this.add.sprite(this.math.between(80, 960 - 80), this.math.between(80, 540 - 80), 'atl_game', 'targetc');
        this.target.anchor.setTo(0.5, 0.5);
        this.target.radio = this.target.height / 2;
        this.target.inputEnabled = true;
        this.target.visible = false;
        // Speed reference
        this.target.sp = 400; // This isn't body speed.350
        // x speed
        this.target.spx=this.target.sp/2;
        // y speed
        this.target.spy=this.target.sp/3;

        
        this.tweenMargin=this.target.radio*2;

        this.sndTarget.play();
        this.target.reset(this.math.between(80, 600), this.math.between(80, 350));
        this.resetTargetx();
        this.resetTargety();

        // OnUp event
        this.input.onUp.add(function () {
            if(!t.onUpblocked){

                if (t.timerHits.isOn) {
                    this.score += Math.ceil(this.timerHits.getTime() / 100);
                    this.timerHits.isOn = false;
                };

                if (this.timerFails.isOn) {
                    this.penalties += this.timerFails.getTime() / 100;
                    this.timerFails.isOn = false;
                };
            };
        }, this);
        
        // This avoids automatic onUp event when pointer left bounds.
        // When pointer exits bounds this happens:
        // 1º) event mouseout
        // 2ª) event mouseup
        // 3º) event mouseout
        // When pointer enters bounds:
        // 1º) event mouseover
        // 2ª) event mouseup
        // 3º) event mouseover

        this.onUpblocked=false;
        this.firstMouseOver=false;
        
        this.input.mouse.mouseOutCallback=function(){t.onUpblocked=true;};
        this.input.mouse.mouseOverCallback=function(){
            t.firstMouseOver=!t.firstMouseOver;
            if(!t.firstMouseOver){
                t.onUpblocked=false;
            };        
        };



        // Timer event. Take distances every 100ms.
        this.timerEvent = this.time.events.loop(100,
            function () {
                var distance = globals.getDistance(t.target.position, t.input.position);
                t.samples++;
                t.distances += distance;
            }, this);

        // Timer of 60 seconds to activate Game Over
        this.gameOverTimer = setTimeout(function () {
            t.gameOver();
        }, 60 * Phaser.Timer.SECOND);


    },

    update: function () {

        var t = this;
        // This updates pointer state when is stopped. Avoids incorrect results in this.target.input.pointerOver()
        this.input.activePointer.dirty = true;

        if (this.input.activePointer.isDown) {
            if (this.target.input.pointerOver()) {

                if (t.emitter.counts.emitted == 0) {
                    t.emitter.emitX = Math.ceil(t.target.x);
                    t.emitter.emitY = Math.ceil(t.target.y);
                    t.emitter.explode(100, 3);
                };

                if (!this.timerHits.isOn) {
                    this.timerHits.start();
                    this.timerHits.isOn = true;
                };

                if (this.timerFails.isOn) {
                    this.penalties += this.timerFails.getTime() / 100;
                    this.timerFails.isOn = false;
                };

                this.sndHit.play();
            } else {
                if (this.timerHits.isOn) {
                    this.score += this.timerHits.getTime() / 100;
                    this.timerHits.isOn = false;
                };

                if (!this.timerFails.isOn) {
                    this.timerFails.start();
                    this.timerFails.isOn = true;
                };
            }
        }

    },

    resetTargetx: function () {

        var tx, duration;
        var t = this;

        if (this.evasionTweenx != null) {
            this.evasionTweenx.stop();
        }

        if (this.target.x > this.world.width / 2) {
            tx = Phaser.Math.between(this.tweenMargin, this.world.width / 2 - this.target.radio);

        } else {
            tx = Phaser.Math.between(this.world.width / 2 + this.target.radio, this.world.width - this.tweenMargin);
        };


        duration = Math.ceil((Math.abs(this.target.x - tx) * 1000) / this.target.spx);



        this.evasionTweenx = this.add.tween(this.target).to({
            x: tx
        }, duration, Phaser.Easing.Back.InOut).start();

        this.evasionTweenx.onComplete.addOnce(t.resetTargetx, this);


    },

    resetTargety: function () {

        var ty, duration;
        var t = this;

        if (this.evasionTweeny != null) {
            this.evasionTweeny.stop();
        }

        ty = Phaser.Math.between(this.tweenMargin, this.world.height - this.tweenMargin);


        duration = Math.ceil((Math.abs(this.target.y - ty) * 1000) / this.target.spy);


        this.evasionTweeny = this.add.tween(this.target).to({
            y: ty
        }, duration, Phaser.Easing.Back.InOut).start();

        this.evasionTweenx.onComplete.addOnce(t.resetTargety, this);


    },

    gameOver: function () {

        //clear inputDown to avoid exit before see results
        this.input.onDown.removeAll();
        this.target.visible = false;

        //clear time events
        this.time.events.remove(this.timerEvent);
        clearTimeout(this.gameOverTimer);

        //clear other callbacks
        this.input.mouse.mouseOutCallback=null;
        this.input.mouse.mouseOverCallback=null;


        this.setTotalScore();

        // Check new record
        if (this.bestScore < this.totalScore) {
            this.display.innerHTML = 'You got a new record in Tracking mode!!!';
            globals.setCookie('aimingTrackingBest1', this.totalScore, 180);

        } else {
            this.display.innerHTML = 'Your best score is ' + this.bestScore.toString() + ' (Tracking mode)';
        };

        this.showResults();

    },

    setTotalScore: function () {
        this.totalScore = Math.ceil(this.score - this.penalties - (60 - (this.score + this.penalties) / 10) * 0.5);
    },

    showResults: function () {

        var tableResults = document.getElementById('tbl_results');
        var cellType = 'th';

        // 1º row with 3 cells
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.textContent = '';
        row.appendChild(cell);
        var cell = document.createElement('th');
        cell.textContent = 'TIME';
        row.appendChild(cell);
        var cell = document.createElement('th');
        cell.textContent = 'SCORE';
        row.appendChild(cell);
        tableResults.appendChild(row);

        // Calcs
        var usefullTime = Math.ceil((this.score / 10));
        var wastedTime = Math.ceil((this.penalties / 10));
        var averageDistance = Math.ceil(this.distances / this.samples);
        var idleTime = 60 - usefullTime - wastedTime;

        // 2º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.textContent = 'HIT';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = usefullTime.toString() + ' secs';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = '+' + Math.ceil(this.score).toString();
        row.appendChild(cell);
        tableResults.appendChild(row);

        // 3º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.textContent = 'FAULTS';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = wastedTime.toString() + ' secs';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = '-' + Math.ceil(this.penalties).toString();
        row.appendChild(cell);
        tableResults.appendChild(row);

        // 4º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.textContent = 'IDLE';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = idleTime.toString() + ' secs';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = '-' + Math.ceil(idleTime / 2).toString();
        row.appendChild(cell);
        tableResults.appendChild(row);

        // 5º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.setAttribute('colspan', 2);
        cell.textContent = 'AVERAGE DISTANCE';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = averageDistance + ' px';
        row.appendChild(cell);
        tableResults.appendChild(row);

        // 6º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.setAttribute('colspan', 2);
        cell.textContent = 'TOTAL SCORE';
        row.appendChild(cell);
        cell = document.createElement('td');
        cell.style.backgroundColor = 'red';
        cell.style.color = 'white';
        cell.style.fontSize = '1.5em';
        cell.textContent = this.totalScore.toString();
        row.appendChild(cell);
        tableResults.appendChild(row);

        tableResults.style.opacity = '1';


        document.getElementById('replay').innerHTML = 'Click to replay';


        // Changes onDown event in 1.5 seconds to avoid exit before see results
        var t = this;
        setTimeout(
            function () {
                t.input.onDown.add(t.replay, t);
            },
            1500);

    },

    replay: function () {
        // Clear table
        var tableResults = document.getElementById('tbl_results');
        tableResults.style.opacity = 0;
        tableResults.innerHTML = '';
        document.getElementById('replay').innerHTML = '';
        // Destroy emitter
        this.emitter.destroy();
        // Starts menu state
        this.state.start('menu');
    }



}