import GlobalConfig from "../GlobalConfig";


export default class SceneManager {

    private static _instance: SceneManager;

    public static get instance(): SceneManager {
        !this._instance && (this._instance = new SceneManager);
        return this._instance;
    }

    private _scene: Laya.Scene3D;
    initialize() {

    }
    
    loadScene(sceneName: string): Promise<any> {
        let path = GlobalConfig.scenePathMap[sceneName]
        return new Promise((resolve, reject) => {
            
            if (!path) {
                reject("no scene " +  sceneName)
            }
            if (path.endsWith("ls")) {
                Laya.Scene3D.load(path, Laya.Handler.create(this, resolve));            
            }else{
                Laya.Scene.load(path, Laya.Handler.create(this, resolve));
            }
        })
    }

    toScene(sceneName: string, closeOthers? : boolean): void {
        let path = GlobalConfig.scenePathMap[sceneName]
        if (path.endsWith("ls")) {
            Laya.Scene.open(path)
        } else {
            Laya.Scene.open(path);
        }        
    }


    public get currentScene(): Laya.Scene3D {
        if (this._scene) {
            return this._scene;
        }
        
    }

    public getObjectByName(name: string): Laya.Sprite3D {
        return (this._scene.getChildByName(name) as Laya.Sprite3D);
    }

    public addChild(node: Laya.Sprite3D): Laya.Sprite3D {
        return this._scene.addChild(node) as Laya.Sprite3D;
    }
}

