
import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameOver')
export class gameOver extends Component {

    start () {
    }
    onBtnClick(){
        director.loadScene('scene-2d');
    }
}
