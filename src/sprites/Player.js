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
    this.scene.add.existing( this );

    this.scene.input.on('pointerdown', ( pointer ) => {
      this.pointerDown = true;
      this.moveToX = pointer.worldX;
      this.moveToY = pointer.worldY;
    });

    this.scene.input.on('pointerup', ( pointer ) => {
      this.pointerDown = false;
    });

    this.scene.input.on('pointermove', ( pointer ) => {
      this.moveToX = pointer.worldX;
      this.moveToY = pointer.worldY;
    });
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

    var desiredAnim = "stop"

    if( this.pointerDown === true ){
      var radians = this.scene.physics.moveTo( this, this.moveToX, this.moveToY, this.speed );
      var angle = (radians * 180) / Math.PI ;
      console.log(`Angle  is ${angle}` );

      desiredAnim = this.directionToPointer( angle );
    } else {
      desiredAnim = this.checkCursorKeys( cursors );
    }

    this.syncAnimation( desiredAnim );

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale( this.speed );
  }

  checkCursorKeys( cursors ){
    var desiredAnim = "stop";
    
    // Vertical movement
    if (cursors.up.isDown) {
      this.body.setVelocityY(-this.speed);
      desiredAnim = 'walk-up';
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(this.speed);
      desiredAnim = 'walk-down';
    }
    
    // Horizontal movement
    if (cursors.left.isDown) {
      this.body.setVelocityX(-this.speed);
      desiredAnim = 'walk-right';
      this.flipX =  true ;
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(this.speed);
      desiredAnim = 'walk-right';
      this.flipX = false ;
    }

    return desiredAnim;
  }

  directionToPointer( angle ){
    var desiredAnim;

    if( angle > -45 && angle <= 45 ){
      this.flipX = false ;
      desiredAnim = 'walk-right';
    } else if( angle > 45 && angle <= 135 ){
      desiredAnim = 'walk-down';
    } else if( angle > 135 || angle < -135 ){
      // go left
      this.flipX = true ;
      desiredAnim = 'walk-right';
    } else {
      desiredAnim = 'walk-up';
    }

    return desiredAnim;
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

