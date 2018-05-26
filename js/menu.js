/**** Menu state ****/

aimingtest.menu = function (game) {};

aimingtest.menu.prototype = function (game) {};

aimingtest.menu.prototype = {

    create: function () {

        document.getElementById('menu').style.display = 'block';
        document.getElementById('display').innerHTML = 'AIMING TEST V1.0';
        var t=this;
        // Add listeners to menu buttons
        document.getElementById('btnNormalMode').addEventListener('click', function () {
            t.countDown('basicMode');
        });

        document.getElementById('btnEvasionMode').addEventListener('click', function () {
            t.countDown('evasionMode');
        });

        
        var textStyle = {
            font: "bold 32px Arial",
            fill: "#fff",
            align: "center",
            boundsAlignH: "center",
            boundsAlignV: "middle"
        };
        this.text = this.add.text(0, 0, '', textStyle);
        this.text.setTextBounds(0, 0, 960, 540);

        
    },

    countDown: function(mode){
        var state = mode;
        var t=this;
        document.getElementById('menu').style.display = 'none';
        var counterSeconds = 3;
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