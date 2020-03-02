


import Mesh = Laya.Mesh;
import { customTerrianShader } from "./customMaterial/customShader"
import { createTerrainMaterial } from "./customMaterial/createMyMaterial"
import { JoyBoxUI, VirtualJoyUI, VirtualJoy } from "../ui/joy"
import RoleMoveScript from "./RoleMoveScript"
import CameraMoveScript from "./common/CameraMoveScript"
import CameraFollowScript from "./common/CameraFollowScript"
import SceneManager from "./SceneManager"
import GameManager from "./GameManager"

export default  class GameScene extends Laya.Scene3D {
    private _scene: Laya.Scene3D;
    private _camera: Laya.Camera;
    private _dlight: Laya.DirectionLight;
    constructor() {
        super();

        this._scene = null;
        this._camera = null;
        SceneManager.instance.loadScene("game").then((scene) => {
            this.initShader();
            this._scene = scene;
            // scene.zOrder = -10
            Laya.stage.addChild(scene);
            // 使用Unity 中导出的相机
            let camera: Laya.Camera = this._camera = scene.getChildByName("Main Camera") as Laya.Camera;
            //相机视角控制组件(脚本),
            // camera.addComponent(CameraMoveScript);
            this._scene.addChild(camera);  // camera 也有scene 属
            let camCube = scene.getChildByName("Cube") as Laya.Sprite3D;
            this._scene.addChild(camCube)
            GameManager.Instance.camCube = camCube;



            // 调整了摄像头的方位 目前看到的是这样的
            // x
            // ^
            // |
            // |
            // |
            // |
            // |
            // +------------> z




            let desert: Laya.Sprite3D = scene.getChildByName("DesertScene") as Laya.Sprite3D
            this.loadLight(desert);



            this.loadTerrain(desert)
            this.morePlants(desert)
            this.playerControl(desert)
        })

        // Laya.Scene3D.load("res/LayaScene_DesertScene_mobile/Conventional/DesertScene_mobile.ls", Laya.Handler.create(this,  (scene)=> {
        // this.addToScene0()
        // this._scene = scene;
        // Laya.stage.addChild(scene);

        // this.addToSceneFromUnity(scene)
        // }))
    }
    initShader() {
        customTerrianShader()
    }


    loadLight(desert: Laya.Sprite3D) {

        // 使用Unity 中的光照

        let dLight: Laya.DirectionLight = this._scene.getChildByName("Directional Light") as Laya.DirectionLight;
        dLight.color = new Laya.Vector3(0, 1, 1);
        // dLight._direction = new Laya.Vector3(0.5, -1, 0);

        //这个颜色会覆盖 光的颜色  表示物体接受到这个光之后的漫反射颜色
        // dLight.diffuseColor = new Laya.Vector3(0, 0, 0);
        //添加灯光投影
        dLight.shadow = true;
        dLight.shadowDistance = 45;
        dLight.shadowResolution = 2048;
        dLight.shadowPSSMCount = 1;
        dLight.shadowPCFType = 1;
        this._scene.addChild(dLight);

        // let wall: Laya.Scene3D = desert.getChildByName("walls").getChildByName("wall1") as Laya.Sprite3D;
        // 使用自创建的light
        // this._dlight = this.scene.addChild(new Laya.DirectionLight());
        // this._dlight.color = new Laya.Vector3(0, 1, 1);
        // // this._dlight.transform.translate(new Laya.Vector3(-2.165527, 2.193848, -3.087891));
        // this._dlight._direction = new Laya.Vector3(0.3, -1, 0);
        // this._dlight.shadow = true;
        // this._dlight.shadowDistance = 45;
        // this._dlight.shadowPSSMCount = 1;
        // this._dlight.shadowPCFType = 1;
        // this._dlight.shadowResolution = 2048;
    }


    loadTerrain(desert: Laya.Sprite3D) {

        // 获取terrain // terrain 在console 中显示的类型就是 MeshSprite3D
        var terrain: Laya.MeshSprite3D = desert.getChildByName("Terrain") as Laya.MeshSprite3D
        terrain.meshRenderer.receiveShadow = true


        Mesh.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/terrain_Terrain.lm", Laya.Handler.create(this, function (mesh: Mesh): void {
            terrain.meshRenderer.sharedMaterial = createTerrainMaterial();
        }))

        //平面添加物理碰撞体组件
        var planeStaticCollider: Laya.PhysicsCollider = terrain.addComponent(Laya.PhysicsCollider);
        //创建盒子形状碰撞器
        var planeShape: Laya.BoxColliderShape = new Laya.BoxColliderShape(10, 0, 10);
        //物理碰撞体设置形状
        planeStaticCollider.colliderShape = planeShape;
        //物理碰撞体设置摩擦力
        planeStaticCollider.friction = 2;
        //物理碰撞体设置弹力
        planeStaticCollider.restitution = 0.3;


        let rock = desert.getChildByName("Rocks").getChildByName("rock07_m") as Laya.Sprite3D
        console.log("rock", rock.transform.position)
        let kyle = desert.getChildByName("RobotKyle") as Laya.Sprite3D
        console.log("kyle", kyle.transform.position)
        let kyle1 = desert.getChildByName("RobotKyle (1)") as Laya.Sprite3D
        // console.log("kyle1", kyle1.transform.position)
        let kyle2 = desert.getChildByName("RobotKyle (2)") as Laya.Sprite3D
        // console.log("kyle2", kyle2.transform.position)
        let roboto = desert.getChildByName("Roboto") as Laya.Sprite3D
        // console.log("roboto", roboto.transform.position)

        let wall1: Laya.MeshSprite3D = desert.getChildByName("wall").getChildByName("wall1") as Laya.MeshSprite3D;
        wall1.meshRenderer.receiveShadow = true;
        console.log("wall1", wall1)


    }

    morePlants(desert: Laya.Sprite3D) {
        let plants: Laya.Sprite3D = desert.getChildByName("Plants") as Laya.Sprite3D
        let catcus03Outer: Laya.Sprite3D = desert.getChildByName("Plants").getChildByName("cactus03_m") as Laya.Sprite3D
        let oneCatcus03: Laya.Sprite3D = catcus03Outer.getChildByName("default") as Laya.Sprite3D
        let onePos = oneCatcus03.transform.position
        // 这里只能指定世界坐标
        let copy1 = Laya.Sprite3D.instantiate(oneCatcus03, catcus03Outer, false, new Laya.Vector3(1 + onePos.x, onePos.y, -1 + onePos.z));
        // console.log("oneCatcus03", oneCatcus03.transform.position, oneCatcus03.transform.localPosition)
        // console.log("copy1      ", copy1.transform.position, copy1.transform.localPosition)
        // console.log("catcus03", catcus03)

    }

    playerControl(desert: Laya.Sprite3D) {
        let player: Laya.Sprite3D = desert.getChildByName("unitychan") as Laya.Sprite3D
        GameManager.Instance.role3D = player;
        console.log("player", player.transform.position)


        let playerRootMesh = player.getChildAt(1) as Laya.Sprite3D
        for (let i = 0; i < playerRootMesh.numChildren; i++) {
            let oneMesh = playerRootMesh.getChildAt(i) as Laya.SkinnedMeshSprite3D
            oneMesh.skinnedMeshRenderer.castShadow = true
        }

        Laya.stage.addChild(new JoyBoxUI());
        new VirtualJoy(new VirtualJoyUI());


        this._camera.addComponent(CameraFollowScript);
        player.addComponent(RoleMoveScript)


    }

}