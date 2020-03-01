import CustomTerrainMaterial from "../common/CustomTerrainMaterial"
import Texture2D = Laya.Texture2D;
import Vector2 = Laya.Vector2;


export { createTerrainMaterial }
function createTerrainMaterial(): CustomTerrainMaterial {
    var customMaterial: CustomTerrainMaterial = new CustomTerrainMaterial();
    Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/splatAlphaTexture.png", Laya.Handler.create(this, function (tex: Texture2D): void {
        customMaterial.splatAlphaTexture = tex;
    }));
    Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground1.png", Laya.Handler.create(this, function (tex: Texture2D): void {
        customMaterial.diffuseTexture1 = tex;
    }));

    Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground2.png", Laya.Handler.create(this, function (tex: Texture2D): void {
        customMaterial.diffuseTexture2 = tex;
    }));

    Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground3.png", Laya.Handler.create(this, function (tex: Texture2D): void {
        customMaterial.diffuseTexture3 = tex;
    }));

    Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground1.png", Laya.Handler.create(this, function (tex: Texture2D): void {
        customMaterial.diffuseTexture4 = tex;
    }))
    customMaterial.setDiffuseScale1(new Vector2(27.92727, 27.92727));
    customMaterial.setDiffuseScale2(new Vector2(13.96364, 13.96364));
    customMaterial.setDiffuseScale3(new Vector2(18.61818, 18.61818));
    customMaterial.setDiffuseScale4(new Vector2(13.96364, 13.96364));
    return customMaterial
}
