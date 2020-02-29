
import MainLayer from "../ui/mainLayer"

export default class GameManager {
    role3D: Laya.Sprite3D;

    camCube: Laya.Sprite3D;

    public baseLayer: MainLayer = new MainLayer();

    constructor() {
        this.baseLayer.initContainer(Laya.stage);
    }

    private static _instance: GameManager;
    public sceneData: SceneData = new SceneData();

    public static get Instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }
}
class SceneData {
    constructor() {
    }

    public autoMoveDir: number = 9999;
}