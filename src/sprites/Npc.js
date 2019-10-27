import Phaser from 'phaser'

//export default class extends Phaser.GameObjects.Sprite {
export default class extends Phaser.Physics.Arcade.Sprite {
  constructor ({ scene, x, y, asset }) {
    super(scene, x, y, asset)

    var animConfig = {
      key: 'npc-walk-down',
      frames: scene.anims.generateFrameNumbers( asset, { start: 0, end: 3 }),
      frameRate: 6,
      yoyo: false,
      repeat: -1
    }

    scene.anims.create( animConfig );

    animConfig.key = 'npc-walk-right';
    animConfig.frames = scene.anims.generateFrameNumbers( asset, { start: 4, end: 7 });
    scene.anims.create( animConfig );

    animConfig.key = 'npc-walk-up';
    animConfig.frames = scene.anims.generateFrameNumbers( asset, { start: 8, end: 11 });
    scene.anims.create( animConfig );

    scene.physics.add.existing(this);
    this.body.setSize(32, 48);
    this.speed = 40;

    //this.setCollideWorldBounds(true);

    this.actionStart = new Date();
    this.actionTime = 1000; 
  }

  spawn(){
    //this.scene.toUpdate.push( this );
    this.scene.add.existing( this );
    console.log(`NPC spawned at ${this.x} ${this.y}`);
  }

  gameOver(){
    this.anims.stop();
    this.body.setVelocity( 0 );
  }

  changeMove(){
    // Stop previous movements
    this.body.setVelocity( 0 );

    var xMove = Math.round( Math.random()*3 );
    var yMove = Math.round( Math.random()*3 );

    if( xMove === 1 ){
      this.body.setVelocityX(-this.speed);
    } else if( xMove === 2 ){
      this.body.setVelocityX(this.speed);
    }

    if( yMove === 1 ){
      this.body.setVelocityY(-this.speed);
    } else if( yMove === 2 ){
      this.body.setVelocityY(this.speed);
    }

    this.actionStart = new Date();
    this.actionTime = Math.round( (Math.random()*1000)+500 );
  }

  getVisionCone(){
    var orientation = this.getOrientation();

    var p1 = new Phaser.Geom.Point( this.x, this.y );
    if( orientation === "left" ){
      var p2 = new Phaser.Geom.Point( this.x - 100, this.y+48 );
      var p3 = new Phaser.Geom.Point( this.x - 100, this.y-48 );
    }

    if( orientation === "right" ){
      var p2 = new Phaser.Geom.Point( this.x + 100, this.y+48 );
      var p3 = new Phaser.Geom.Point( this.x + 100, this.y-48 );
    }
    
    if( orientation === "up" ){
      var p2 = new Phaser.Geom.Point( this.x - 48, this.y-100 );
      var p3 = new Phaser.Geom.Point( this.x + 48, this.y-100 );
    }

    if( orientation === "down" ){
      var p2 = new Phaser.Geom.Point( this.x - 48, this.y+100 );
      var p3 = new Phaser.Geom.Point( this.x + 48, this.y+100 );
    }

    var visionCone = new Phaser.Geom.Triangle( p1.x, p1.y, p2.x, p2.y, p3.x, p3.y );

    return visionCone;
  }

  getOrientation(){
    var orientation = "";

    if( this.body.velocity.x < 0 ){
      orientation = "left";
    } else if( this.body.velocity.x > 0 ){
      orientation = "right";
    } else {
      if( this.body.velocity.y < 0 ){
        orientation = "up";
      } else {
        orientation = "down";
      }
    }

    return orientation;
  }

  update(){
    super.update();

    var timeLaps = ( new Date() - this.actionStart );
    if( timeLaps > this.actionTime ){
      this.changeMove();
    }

    
    var desiredAnim = this.isStopped() ? "stop" : `npc-walk-${this.getOrientation()}`;
    if( desiredAnim === "npc-walk-left" ){
      this.flipX = true;
      desiredAnim = "npc-walk-right";
    } else {
      this.flipX = false;
    }

    this.syncAnimation( desiredAnim );
  }

  isStopped(){
    return (this.body.velocity.x === 0 && this.body.velocity.y === 0) ? true : false;
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
  } // end of method

}

