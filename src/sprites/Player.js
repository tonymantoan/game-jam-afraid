import Phaser from 'phaser'

export default class extends Phaser.GameObjects.Sprite {
  constructor ({ scene, x, y, asset }) {
    super(scene, x, y, asset)

    var animConfig = {
      key: 'walk-down',
      frames: scene.anims.generateFrameNumbers( asset, { start: 0, end: 3 }),
      frameRate: 6,
      yoyo: false,
      repeat: -1
    }

    scene.anims.create( animConfig );

    animConfig.key = 'walk-right';
    animConfig.frames = scene.anims.generateFrameNumbers( asset, { start: 4, end: 7 });
    scene.anims.create( animConfig );

    animConfig.key = 'walk-up';
    animConfig.frames = scene.anims.generateFrameNumbers( asset, { start: 8, end: 11 });
    scene.anims.create( animConfig );

    // physics
    scene.physics.world.enable(this);
    this.body.setSize(32, 32);
    this.speed = 150;
  }

  spawn(){
    //this.scene.toUpdate.push( this );
    this.scene.add.existing( this );
  }

  gameOver(){
    this.anims.stop();
    this.body.setVelocity( 0 );
  }

  update( cursors ){
    super.update();
    //this.anims.stop();

    // Stop previous movements
    this.body.setVelocity( 0 );

    var animSet = false;
    var desiredAnim = "stop"
    // Horizontal movement
    if (cursors.left.isDown) {
      this.body.setVelocityX(-this.speed);
      desiredAnim = 'walk-right';
      this.flipX =  true ;
      animSet = true;
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(this.speed);
      desiredAnim = 'walk-right';
      this.flipX = false ;
      animSet = true;
    }

    // Vertical movement
    if (cursors.up.isDown) {
      this.body.setVelocityY(-this.speed);
      if( !animSet ){
        desiredAnim = 'walk-up';
      }
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(this.speed);
      if( !animSet ){
        desiredAnim = 'walk-down';
      }
    }

    this.syncAnimation( desiredAnim );

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale( this.speed );
  }

  syncAnimation( desiredState ){
    var current = this.anims.isPlaying ? this.anims.getCurrentKey() : "stop";

    if( current !== desiredState ){
      if( desiredState === "stop" ){
        this.anims.stop();
      } else {
        this.play( desiredState );
      }
    }
  }

}

