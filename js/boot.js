
var aimingtest = {};

/**** Load state ****/

aimingtest.boot = function (game) {};

aimingtest.boot.prototype = function (game) {};

aimingtest.boot.prototype = {

    preload: function () {

        this.load.atlasJSONArray('atl_game','assets/images/spritesheet.png','assets/images/spritesheet.json');
        this.load.audio('shot', 'assets/sounds/165271__mojomills__cap-shot-2.mp3');
        this.load.audio('hit', 'assets/sounds/249613__otisjames__explosionsfx.mp3');
        this.load.audio('spawn', 'assets/sounds/11221__jnr-hacksaw__zap.mp3');

    },

    create: function () {
        this.stage.backgroundColor = 'rgb(106,98,60)';        
        this.state.start('menu');
    }
}



