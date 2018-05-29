/**** Evasion mode state ****/

aimingtest.trackingMode = function (game) {};

aimingtest.trackingMode.prototype = function (game) {};

aimingtest.trackingMode.prototype = {

    create: function () {

        // Timer to control hits
        this.timerHits={
            isOn: false,
            start: function(){
                this.t0=performance.now();
            },
            getTime: function(){
                this.t1=performance.now();
                var elapsedTimeMs=Math.ceil(this.t1-this.t0);
                return elapsedTimeMs;
            }
        };

        // Timer to control fails
        this.timerFails={
            isOn: false,
            start: function(){
                this.t0=performance.now();
            },
            getTime: function(){
                this.t1=performance.now();
                var elapsedTimeMs=Math.ceil(this.t1-this.t0);
                return elapsedTimeMs;
            }
        }

        // Sum distances to target
        this.distances = 0;
        // Distance samples
        this.samples = 0;

        // Shooting (bool)
        this.isShooting = false;
        // Evasion tweens for target.x and target.y
        this.evasionTweenx = null;
        this.evasionTweeny = null;
        // Fails counter
        this.penalties=0;
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
        this.target.sp = 350; // This isn't body speed.

        // Easing functions in array
        this.easingArray = [];
        this.easingArray.push(Phaser.Easing.Cubic.InOut);
        this.easingArray.push(Phaser.Easing.Quintic.InOut);
        this.easingArray.push(Phaser.Easing.Elastic.InOut);
        this.easingArray.push(Phaser.Easing.Cubic.In);
        this.easingArray.push(Phaser.Easing.Cubic.Out);
        this.easingArray.push(Phaser.Easing.Back.In);
        this.easingArray.push(Phaser.Easing.Back.InOut);

        this.sndTarget.play();
        this.target.reset(this.math.between(80, 600), this.math.between(80, 350));
        this.resetTargetx();
        this.resetTargety();

        // OnDown event
        this.input.onDown.add(function () {
            t.isShooting = true;
        }, this);

        // OnUp event
        this.input.onUp.add(function () {

            t.isShooting = false;

            if (t.timerHits.isOn) {
                this.score += Math.ceil(this.timerHits.getTime() / 100);
                this.timerHits.isOn = false;
            };

            if(this.timerFails.isOn){
                this.penalties+= this.timerFails.getTime()/100;
                this.timerFails.isOn=false;
            };
        }, this);

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

        if (this.isShooting) {
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

                if(this.timerFails.isOn){
                    this.penalties+= this.timerFails.getTime()/100;
                    this.timerFails.isOn=false;
                };
                
                this.sndHit.play();
            } else {
                if (this.timerHits.isOn) {
                    this.score += this.timerHits.getTime() / 100;
                    this.timerHits.isOn = false;
                };

                if(!this.timerFails.isOn){
                    this.timerFails.start();
                    this.timerFails.isOn=true;
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
            tx = Phaser.Math.between(this.target.radio, this.world.width / 2 - this.target.radio);

        } else {
            tx = Phaser.Math.between(this.world.width / 2 + this.target.radio, this.world.width - this.target.radio);
        };


        duration = Math.ceil((Math.abs(this.target.x - tx) * 1000) / this.target.sp);

        var rd = Phaser.Math.between(0, 6);



        this.evasionTweenx = this.add.tween(this.target).to({
            x: tx
        }, duration, t.easingArray[rd]).start();

        this.evasionTweenx.onComplete.addOnce(t.resetTargetx, this);


    },

    resetTargety: function () {

        var ty, duration;
        var t = this;

        if (this.evasionTweeny != null) {
            this.evasionTweeny.stop();
        }

        ty = Phaser.Math.between(this.target.radio, this.world.height - this.target.radio);


        duration = Math.ceil((Math.abs(this.target.y - ty) * 1000) / (this.target.sp / 2));

        var rd = Phaser.Math.between(0, 6);



        this.evasionTweeny = this.add.tween(this.target).to({
            y: ty
        }, duration, t.easingArray[rd]).start();

        this.evasionTweenx.onComplete.addOnce(t.resetTargety, this);


    },

    gameOver: function () {

        //clear inputDown to avoid exit before see results
        this.input.onDown.removeAll();
        this.target.visible = false;

        //clear time events
        this.time.events.remove(this.timerEvent);
        clearTimeout(this.gameOverTimer);


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
        this.totalScore = Math.ceil(this.score-this.penalties-(60-(this.score+this.penalties)/10)*0.5);
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
        var wastedTime=Math.ceil((this.penalties/10));
        var averageDistance = Math.ceil(this.distances / this.samples);
        var idleTime=60-usefullTime-wastedTime;

        // 2º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.textContent = 'HIT';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = usefullTime.toString() + ' secs';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = '+'+Math.ceil(this.score).toString();
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
        cell.textContent = '-'+Math.ceil(this.penalties).toString();
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
        cell.textContent = '-'+Math.ceil(idleTime/2).toString();
        row.appendChild(cell);
        tableResults.appendChild(row);

        // 5º row
        var row = document.createElement('tr');
        var cell = document.createElement('th');
        cell.setAttribute('colspan', 2);
        cell.textContent = 'AVERAGE DISTANCE';
        row.appendChild(cell);
        var cell = document.createElement('td');
        cell.textContent = averageDistance+' px';
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