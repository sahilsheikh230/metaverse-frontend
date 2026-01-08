import Phaser from "phaser";
import config from "./phaser";
import { useEffect} from "react";



export default  function CreateGame() {



    useEffect(() => {
        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div id="game-container"  ></div>
    );
}
