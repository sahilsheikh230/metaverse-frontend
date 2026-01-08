import Phaser, { Scene } from "phaser";
import Mainscene from "./scenes/MainScene"

const config={
 width: 1630,
 
  height:950,
  scale: {
    mode: Phaser.Scale.FIT,        
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
    type:Phaser.AUTO,
    scene:[Mainscene],
    parent:"game-container",
    physics:{
        default:"arcade",
        
    },
     

}
export default config;
