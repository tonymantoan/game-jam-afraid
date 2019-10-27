import Phaser from 'phaser'

import BootScene from './scenes/Boot'
import SplashScene from './scenes/Splash'
import GameScene from './scenes/Game'

import config from './config'

console.log(`InnerX: ${window.innerWidth}, innerY: ${window.innerHeight}, DPR: ${window.devicePixelRatio}`);

const gameConfig = Object.assign(config, {
  scene: [BootScene, SplashScene, GameScene],
  width: Math.round( window.innerWidth ),
  height: Math.round( window.innerHeight ),
  physics: {
    default: "arcade",
    arcade: { gravity: {y:0} }
  }
})

class Game extends Phaser.Game {
  constructor () {
    super(gameConfig)
  }
}

window.game = new Game()
