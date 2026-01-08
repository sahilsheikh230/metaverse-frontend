import Phaser from "phaser";
import punk from "../assets/punk.png";
/*loads map from tiled editor as officetileset.json*/
import mapJSON from "../assets/maps/officetileset.json";
import interiors from "../assets/tiles/INTERIORS.png";
import builder from "../assets/tiles/BUILDER.png";
import { socket } from "../socket";
let otherplayers = {}
let player = null;
let direction = "down"
let moving = false;

export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: "MainScene" });
  }
/*loads the assets required before creating or rendering it */
  preload() {
    /*loading the required assets like character interiors */
    this.load.tilemapTiledJSON("office", mapJSON);
    this.load.image("interiors", interiors);
    this.load.image("builder", builder);

    this.load.spritesheet("punk", punk, {
      frameWidth: 64,
      frameHeight: 64
    });
  }
/* creats the objects map player and walls*/
  create() {
    const map = this.make.tilemap({ key: "office" });

    const interiorsTiles = map.addTilesetImage("interiors", "interiors");
    const builderTiles = map.addTilesetImage("builder", "builder");

    const floorLayer = map.createLayer("floor", [interiorsTiles, builderTiles], 0, 0);
    const wallLayer = map.createLayer("walls", [builderTiles, interiorsTiles], 0, 0);
    const furnitureLayer = map.createLayer("furniture", [builderTiles, interiorsTiles], 0, 0);

    floorLayer.setDepth(0);
    wallLayer.setDepth(10);
    furnitureLayer.setDepth(20);
    /*collision set for player*/
    wallLayer.setCollisionByProperty({ collision: true });
    furnitureLayer.setCollisionByProperty({ collision: true })
    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    );

    /* before frontend is loaded server sends the players so for the perfect timing we need to emit event from frontend so that players can be shown */
    socket.emit("requestplayers");

    /*shows players in map*/
    socket.on("showPlayers", (players) => {

      if (!player && players[socket.id]) {

        player = this.physics.add.sprite(players[socket.id].x, players[socket.id].y, "punk");
        /* to add name on top of player*/
        player.nameText = this.add.text(
          player.x,
          player.y - 40,
          players[socket.id].name,
          {
            fontSize: "12px",
            color: "#ffffff",

            padding: { x: 4, y: 2 }
          }
        ).setOrigin(0.5);
        /* these are player properties such as size ,collision true for walls and interiors */
        player.setSize(32, 40);
        player.setOffset(16, 24);
        player.setCollideWorldBounds(true);
        player.nameText.setDepth(1000);
        this.physics.add.collider(player, wallLayer);
        this.physics.add.collider(player, furnitureLayer);

        this.cameras.main.setBounds(
          0,
          0,
          map.widthInPixels,
          map.heightInPixels +
          150
        );
        this.cameras.main.startFollow(player);
        this.cameras.main.setZoom(1.2);


      }
      /*loading other players */
      Object.keys(players).forEach((id) => {
        if (id === socket.id) return;
        if (!otherplayers[id]) {
          otherplayers[id] = this.add.sprite(players[id].x, players[id].y, "punk");
          otherplayers[id].nameText = this.add.text(
            player.x,
            player.y - 40,
            players[id].name,
            {
              fontSize: "12px",
              color: "#ffffff",

              padding: { x: 4, y: 2 }
            }
          ).setOrigin(0.5);
        }
      })




      /* if player disconnects its name also is not shown*/
      Object.keys(otherplayers).forEach((id) => {
        if (!players[id]) {
          otherplayers[id].destroy();
          otherplayers[id].nameText.destroy();
          delete otherplayers[id];



        }
      })
    })
    /* receives new positions from server  to where player is moved and also to show movement to other players*/
    socket.on("playermoved", ({ xcord, ycord, idmoved, direction, moving }) => {
      const p = otherplayers[idmoved];
      if (!p) return;

      p.targetX = xcord;
      p.targetY = ycord;
      p.direction = direction;
      p.moving = moving

    })


    /* animations for moving of character to left,right,up and down*/
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("punk", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("punk", { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("punk", { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("punk", { start: 12, end: 15 }),
      frameRate: 8,
      repeat: -1
    });
    /* sends new position to server on every movement of player but after delay of 50 to reduce lagging and interpolation*/
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        if (!player) return;

        socket.emit("playerpositions", {
          xcord: player.x,
          ycord: player.y,
          direction: direction,
          moving: moving,
        });
      }
    });
  }
  /* update is used in player movement*/
  update() {
    if (!player || !player.body) return;

    const speed = 150;


    player.setVelocity(0);
    player.setDepth(player.y + 1);

    Object.values(otherplayers).forEach(p => {
      p.setDepth(p.y + 25);
    });
    if (this.cursors.left.isDown) {
      player.setVelocityX(-speed);
      player.anims.play("left", true);
      direction = "left"
      moving = true;
    }
    else if (this.cursors.right.isDown) {
      player.setVelocityX(speed);
      player.anims.play("right", true);
      direction = "right"
      moving = true;
    }
    else if (this.cursors.up.isDown) {
      player.setVelocityY(-speed);
      player.anims.play("up", true);
      direction = "up"
      moving = true;
    }
    else if (this.cursors.down.isDown) {
      player.setVelocityY(speed);
      player.anims.play("down", true);
      direction = "down"
      moving = true;
    }
    else {
      player.anims.stop();
      moving = false
    }
    if (player && player.nameText) {
      player.nameText.setPosition(player.x, player.y - 40);
    }




    /*name is on player whenever player moves*/
    Object.values(otherplayers).forEach((p) => {
      p.nameText.setPosition(p.x, p.y - 40);
    })


    /*after getting new cordinates from server, In update function we move th eplayer to new position*/
    Object.values(otherplayers).forEach(p => {
      if (p.targetX !== undefined) {
        p.x += (p.targetX - p.x) * 0.30;
        p.y += (p.targetY - p.y) * 0.30;
      }
      if (p.moving) {
        p.anims.play(p.direction, true);
      } else {
        p.anims.stop();
      }
    });



  }
}