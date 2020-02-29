import CustomTerrainMaterial from "../common/CustomTerrainMaterial"
import TerrainShaderFS from "./terrainShader.fs";
import TerrainShaderVS from "./terrainShader.vs";
import VertexMesh = Laya.VertexMesh;
import SubShader = Laya.SubShader;
import Shader3D = Laya.Shader3D;

export { customTerrianShader }

function customTerrianShader() {

    CustomTerrainMaterial.__init__();
    var attributeMap: any = {
        'a_Position': VertexMesh.MESH_POSITION0,
        'a_Normal': VertexMesh.MESH_NORMAL0,
        'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
    };
    var uniformMap: any = {
        'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
        'u_WorldMat': Shader3D.PERIOD_SPRITE,
        'u_CameraPos': Shader3D.PERIOD_CAMERA,
        'u_SplatAlphaTexture': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseTexture1': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseTexture2': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseTexture3': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseTexture4': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseTexture5': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseScale1': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseScale2': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseScale3': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseScale4': Shader3D.PERIOD_MATERIAL,
        'u_DiffuseScale5': Shader3D.PERIOD_MATERIAL
    };

    var customTerrianShader: Shader3D = Shader3D.add("CustomTerrainShader");
    var subShader: SubShader = new SubShader(
        attributeMap,
        uniformMap
    );
    customTerrianShader.addSubShader(subShader);
    subShader.addShaderPass(
        TerrainShaderVS,
        TerrainShaderFS
    );
}