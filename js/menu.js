/**** Menu state ****/

aimingtest.menu = function (game) {};

aimingtest.menu.prototype = function (game) {};

aimingtest.menu.prototype = {

    create: function () {

        // Initialize HTML elements
        document.getElementById('menu').style.display = 'block';
        document.getElementById('display').innerHTML = 'AIMING TEST V1.0';
        document.getElementById('normalBest').innerHTML = globals.getCookie('aimingTestBest');
        document.getElementById('evasionBest').innerHTML = globals.getCookie('aimingEvasionBest1');
        document.getElementById('trackingBest').innerHTML = globals.getCookie('aimingTrackingBest1');
        var t = this;

        // Add listeners to menu buttons
        document.getElementById('btnNormalMode').addEventListener('click', function () {
            t.countDown('basicMode');
        });

        document.getElementById('btnEvasionMode').addEventListener('click', function () {
            t.countDown('evasionMode');
        });

        document.getElementById('btnTrackingMode').addEventListener('click', function () {
            t.countDown('trackingMode');
        });

        document.getElementById('btnResetScores').addEventListener('click', function () {
            globals.setCookie('aimingEvasionBest1', '0', 180);
            globals.setCookie('aimingTestBest', '0', 180);
            globals.setCookie('aimingTrackingBest1', '0', 180);
            document.getElementById('normalBest').innerHTML = '0';
            document.getElementById('evasionBest').innerHTML = '0';
            document.getElementById('trackingBest').innerHTML = '0';
        });


        var textStyle = {
            font: "bold 32px Arial",
            fill: "#fff",
            align: "center",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        };

        var textStyleHelp = {
            font: "bold 18px Arial",
            fill: "#fff",
            align: "center",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        };

        this.text = this.add.text(0, 0, '', textStyle);
        this.text.setTextBounds(0, 0, 960, 540);

        this.helpText = this.add.text(0, 0, '', textStyleHelp);
        this.helpText.setTextBounds(0, 270, 960, 270);


    },

    countDown: function (mode) {
        var state = mode;
        var help;
        if (mode == 'trackingMode') {
            help = 'Try to follow the target with the mouse pressing the button to make points for 60 seconds.';
        } else {
            help = 'Shoot the ten targets with the mouse (click to shoot)';
        };
        var t = this;
        document.getElementById('menu').style.display = 'none';
        this.helpText.setText(help);
        var counterSeconds = 5;
        this.text.setText(counterSeconds.toString());
        counterSeconds--;
        var counterInterval = setInterval(function () {
            t.text.setText(counterSeconds.toString());
            counterSeconds--;
            if (counterSeconds < 0) {
                clearInterval(counterInterval);
                t.state.start(state);
            };
        }, 1000);
    }

}