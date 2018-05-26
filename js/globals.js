
var globals = {

    getDistance: function (pointA, pointB) {

        var dx = pointA.x - pointB.x;
        var dy = pointA.y - pointB.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance;

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
    },
/**
 * Makes a particles emitter object
 * 
 * @param {Phaser.Game} game 
 * @returns {Phaser.Particles.Arcade.Emitter}
 */
getEmitter: function(game){
        var emitter = game.add.emitter();
        emitter.makeParticles('atl_game', ['particle1c', 'particle2c', 'particle3c'], 30);
        emitter.gravity = 0;
        emitter.minSpeed = 600;
        emitter.maxParticleSpeed = new Phaser.Point(800, 800);
        emitter.minParticleSpeed = new Phaser.Point(-800, -800);
        emitter.alpha = 0.5;
        emitter.lifespan = 1000;
        emitter.height = 90;
        emitter.width = 90;
        return emitter;
    }
}
