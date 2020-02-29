export default class GlobalConfig {
    static scenePathMap: { [key: string]: string } = {
        "entry": "scene/GameScene.scene", //似乎后缀也可以是json  后缀是可以设置的
        // 如果使用预设  导出的是 lh 后缀
        // 要使用场景  导出的才是 ls 文件
        "game": "res/LayaScene_DesertScene_mobile/Conventional/DesertScene_mobile.ls"


    };
}

window["GlobalConfig"] = GlobalConfig;