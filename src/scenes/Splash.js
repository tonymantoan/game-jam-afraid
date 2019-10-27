import Phaser from 'phaser'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'SplashScene' })
  }

  preload () {
  }

  create () {
    const wrapWidth = Math.round( this.game.config.width * .80 );
    var intro = `You go to bed for a peaceful night of rest, only to wake up in a nightmare! You are back in school.... naked!


You're only comfort is that all the other students are very nearsighted.


Press any key to being


Game developed by Tony Mantoan
Game Assets created by Steve Aversa`;
    this.add.text(100, 100, intro, {
      font: '24px',
      fill: '#7744ff',
      wordWrap: { width: wrapWidth, useAdvancedWrap: true }
    });

    this.input.keyboard.on('keyup', (eventName, event) => { 
      this.scene.start('GameScene', {tileMapName: "school2.json", tileSetName: "school2.png"} )
      this.scene.start( 'UIScene' )
    });
  }

  update () {}
}
