import Phaser from 'phaser'

import Player   from '../sprites/Player'
import NPC from '../sprites/Npc'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' })
  }

  init ( levelData ) {
    this.tileMapName = levelData.tileMapName;
    this.tileSetName = levelData.tileSetName;

    this.tileMapHandle = `tileMap${levelData.tileMapName}`;
    this.tileSetHandle = `tileSet${levelData.tileSetName}`;

    this.npcs = [];
  }

  preload () {
    // Load the tilemap and tileset
    this.load.tilemapTiledJSON( this.tileMapHandle, `./assets/${this.tileMapName}` );
    this.load.image( this.tileSetHandle, `./assets/images/${this.tileSetName}` );

    this.load.spritesheet('nudyMan', './assets/images/nudy.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('npc1', './assets/images/npc1.png', { frameWidth: 32, frameHeight: 58 });
  }

  create () {
    this.gameOver = false;

    this.levelOneMap = this.make.tilemap( {key: this.tileMapHandle} );

    const tiles = this.levelOneMap.addTilesetImage( "school2", this.tileSetHandle );
    this.groundLayer = this.levelOneMap.createDynamicLayer("ground", tiles, 0, 0);
    const levelLocations = this.levelOneMap.objects.filter( objectLayer => objectLayer.name === "locations" )[0];
    const npcLayer = this.levelOneMap.objects.filter( objectLayer => objectLayer.name === "npcs" )[0];

    levelLocations.objects.forEach( location => {
      if( location.name === "playerSpawn" ){
        this.player = new Player( {scene: this, x: location.x, y: location.y, asset: "nudyMan"} );
        this.player.spawn();
      }
    });

    console.log("Map Height: " + this.levelOneMap.heightInPixels );
    npcLayer.objects.forEach( npc => {
      var npc = new NPC( {scene: this, x: npc.x, y: npc.y, asset: "npc1"} );
      console.log(`Spawn NPC at ${npc.x},${npc.y}`);
      npc.spawn();
      this.physics.add.collider( npc, this.groundLayer );
      this.physics.add.overlap( npc, this.player, this.playerCollided, null, this );
      //npc.setRandomPosition();
      this.npcs.push( npc );
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.groundLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider( this.player, this.groundLayer );

    this.setupCamera();
  }

  setupCamera(){
    const camera = this.cameras.main;
    camera.startFollow( this.player );
    camera.setBounds(0, 0, this.levelOneMap.widthInPixels, this.levelOneMap.heightInPixels);
  }

  update( time, delta ){

    if( this.gameOver ){

      this.player.gameOver();
      this.npcs.forEach( npc => {
        npc.gameOver();
      });

      this.physics.shutdown();

      var msgPoint = this.cameras.main.getWorldPoint( 150, 150 );
      this.add.text(msgPoint.x, msgPoint.y, 'You were spotted :( \nPress Any Key\n To Restart', {
        font: '64px',
        fill: '#7744ff'
      });

      this.time.addEvent({
        delay: 500,
        callback: this.endGame,
        callbackScope: this,
        loop: false
      });
      
    } else {
      this.resetTileAlpha();

      this.player.update( this.cursors );

      this.npcs.forEach( npc => {
        npc.update();
        var tilesInSight = this.checkVision( npc );
        tilesInSight.forEach( tile => {
          tile.setAlpha( 1 );
        });
        if( this.physics.overlapTiles( this.player, tilesInSight ) ){
          console.log("You got spotted!");
          this.gameOver = true;
        }
      });
    }

  }

  endGame(){
      this.input.keyboard.once('keyup', this.restart ); 
  }

  resetTileAlpha(){
    this.groundLayer.forEachTile( tile => {
      tile.setAlpha( .7 );
    });
  }


  checkVision( npc ){
    var vCone = npc.getVisionCone( );

    var tilesInVision = this.levelOneMap.getTilesWithinShape( vCone, null, this.cameras.main, this.groundLayer );

    // filter out any tiles that are blocked by walls, obstacles, etc.
    var unblockedTiles = tilesInVision.filter( tile => {
      var line = new Phaser.Geom.Line( npc.x, npc.y, tile.getCenterX(), tile.getCenterY() );
      var tilesInLine = this.levelOneMap.getTilesWithinShape( line, null, this.cameras.main, this.groundLayer );

      // If a collider is found in this line of tiles, this tile isn't visible.
      return tilesInLine.find( t => t.collides ) ? false : true;
    });

    //console.log( `Found ${tilesInVision.length} tiles in the NPC's cone.` );
    return unblockedTiles;
  }

  restart(){
    var levelData = {tileMapName: this.tileMapName, tileSetName: this.tileSetName};
    this.scene.restart( levelData );
  }

  playerCollided( npc ){
    console.log("Collision detected with NPC");
    this.gameOver = true;
  }
}
