window.onload = function () {
    var game = new Phaser.Game(960, 540, Phaser.CANVAS, 'div_game');

    game.state.add('boot', aimingtest.boot);
    game.state.add('menu', aimingtest.menu);
    game.state.add('basicMode', aimingtest.basicMode);
    game.state.add('evasionMode', aimingtest.evasionMode);
    game.state.start('boot');
};