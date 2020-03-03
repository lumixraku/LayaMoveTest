(function () {
    'use strict';

    /*
    * 游戏初始化配置;
    */
    class GameConfig {
        constructor() {
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    // 相关取值在 laya.core.js
    GameConfig.scaleMode = Laya.Stage.SCALE_FULL;
    GameConfig.screenMode = Laya.Stage.SCREEN_NONE;
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "scene/GameScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    // GameConfig.init();
    //# sourceMappingURL=GameConfig.js.map

    var ShadowGLSL = "#ifndef GRAPHICS_API_GLES3\n\t#define NO_NATIVE_SHADOWMAP\n#endif\n\n#ifdef NO_NATIVE_SHADOWMAP\n\t#define TEXTURE2D_SHADOW(textureName) uniform mediump sampler2D textureName\n\t#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) (texture2D(textureName,coord3.xy).r<coord3.z?0.0:1.0)\n\t#define TEXTURE2D_SHADOW_PARAM(shadowMap) sampler2D shadowMap\n#else\n\t#define TEXTURE2D_SHADOW(textureName) uniform mediump sampler2DShadow textureName\n\t#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) texture2D(textureName,coord3)\n\t#define TEXTURE2D_SHADOW_PARAM(shadowMap) sampler2DShadow shadowMap\n#endif\n\n#include \"ShadowSampleTent.glsl\"\n\nTEXTURE2D_SHADOW(u_ShadowMap);\nuniform vec4 u_ShadowMapSize;\nuniform vec4 u_ShadowBias; // x: depth bias, y: normal bias\nuniform vec4 u_ShadowParams; // x: shadowStrength\nuniform mat4 u_ShadowLightViewProjects[4];\nuniform vec4 u_shadowPSSMDistance;\n\nvec4 getShadowCoord(vec4 positionWS)\n{\n\treturn u_ShadowLightViewProjects[0] * positionWS;\n}\n\nfloat sampleShdowMapFiltered4(TEXTURE2D_SHADOW_PARAM(shadowMap),vec3 shadowCoord,vec4 shadowMapSize)\n{\n\tfloat attenuation;\n\tvec4 attenuation4;\n\tvec2 offset=shadowMapSize.xy/2.0;\n\tvec3 shadowCoord0=shadowCoord + vec3(-offset,0.0);\n\tvec3 shadowCoord1=shadowCoord + vec3(offset.x,-offset.y,0.0);\n\tvec3 shadowCoord2=shadowCoord + vec3(-offset.x,offset.y,0.0);\n\tvec3 shadowCoord3=shadowCoord + vec3(offset,0.0);\n    attenuation4.x = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord0);\n    attenuation4.y = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord1);\n    attenuation4.z = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord2);\n    attenuation4.w = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord3);\n\tattenuation = dot(attenuation4, vec4(0.25));\n\treturn attenuation;\n}\n\nfloat sampleShdowMapFiltered9(TEXTURE2D_SHADOW_PARAM(shadowMap),vec3 shadowCoord,vec4 shadowmapSize)\n{\n\tfloat attenuation;\n\tfloat fetchesWeights[9];\n    vec2 fetchesUV[9];\n    sampleShadowComputeSamplesTent5x5(shadowmapSize, shadowCoord.xy, fetchesWeights, fetchesUV);\n\tattenuation = fetchesWeights[0] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[0].xy, shadowCoord.z));\n    attenuation += fetchesWeights[1] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[1].xy, shadowCoord.z));\n    attenuation += fetchesWeights[2] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[2].xy, shadowCoord.z));\n    attenuation += fetchesWeights[3] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[3].xy, shadowCoord.z));\n    attenuation += fetchesWeights[4] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[4].xy, shadowCoord.z));\n    attenuation += fetchesWeights[5] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[5].xy, shadowCoord.z));\n    attenuation += fetchesWeights[6] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[6].xy, shadowCoord.z));\n    attenuation += fetchesWeights[7] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[7].xy, shadowCoord.z));\n    attenuation += fetchesWeights[8] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[8].xy, shadowCoord.z));\n\treturn attenuation;\n}\n\nfloat sampleShadowmap(vec4 shadowCoord)\n{\n\tshadowCoord.xyz /= shadowCoord.w;\n\tfloat attenuation = 1.0;\n\tif(shadowCoord.z > 0.0 && shadowCoord.z < 1.0)\n\t{\n\t\t#if defined(SHADOW_SOFT_SHADOW_HIGH)\n\t\t\tattenuation = sampleShdowMapFiltered9(u_ShadowMap,shadowCoord.xyz,u_ShadowMapSize);\n\t\t#elif defined(SHADOW_SOFT_SHADOW_LOW)\n\t\t\tattenuation = sampleShdowMapFiltered4(u_ShadowMap,shadowCoord.xyz,u_ShadowMapSize);\n\t\t#else\n\t\t\tattenuation = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap,shadowCoord.xyz);\n\t\t#endif\n\t\tattenuation = mix(1.0,attenuation,u_ShadowParams.x);//shadowParams.x:shadow strength\n\t}\n\treturn attenuation;\n}\n\nvec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)\n{\n    float invNdotL = 1.0 - clamp(dot(lightDirection, normalWS),0.0,1.0);\n    float scale = invNdotL * u_ShadowBias.y;\n\n    // normal bias is negative since we want to apply an inset normal offset\n    positionWS += lightDirection * vec3(u_ShadowBias);\n    positionWS += normalWS * vec3(scale);\n    return positionWS;\n}\n";

    var ShadowSampleTentGLSL = "// ------------------------------------------------------------------\n//  PCF Filtering Tent Functions\n// ------------------------------------------------------------------\n\n// Assuming a isoceles right angled triangle of height \"triangleHeight\" (as drawn below).\n// This function return the area of the triangle above the first texel(in Y the first texel).\n//\n// |\\      <-- 45 degree slop isosceles right angled triangle\n// | \\\n// ----    <-- length of this side is \"triangleHeight\"\n// _ _ _ _ <-- texels\nfloat sampleShadowGetIRTriangleTexelArea(float triangleHeight)\n{\n    return triangleHeight - 0.5;\n}\n\n// Assuming a isoceles triangle of 1.5 texels height and 3 texels wide lying on 4 texels.\n// This function return the area of the triangle above each of those texels.\n//    |    <-- offset from -0.5 to 0.5, 0 meaning triangle is exactly in the center\n//   / \\   <-- 45 degree slop isosceles triangle (ie tent projected in 2D)\n//  /   \\\n// _ _ _ _ <-- texels\n// X Y Z W <-- result indices (in computedArea.xyzw and computedAreaUncut.xyzw)\n// Top point at (right,top) in a texel,left bottom point at (middle,middle) in a texel,right bottom point at (middle,middle) in a texel.\nvoid sampleShadowGetTexelAreasTent3x3(float offset, out vec4 computedArea, out vec4 computedAreaUncut)\n{\n    // Compute the exterior areas,a and h is same.\n    float a = offset + 0.5;\n    float offsetSquaredHalved = a * a * 0.5;\n    computedAreaUncut.x = computedArea.x = offsetSquaredHalved - offset;\n    computedAreaUncut.w = computedArea.w = offsetSquaredHalved;\n\n    // Compute the middle areas\n    // For Y : We find the area in Y of as if the left section of the isoceles triangle would\n    // intersect the axis between Y and Z (ie where offset = 0).\n    computedAreaUncut.y = sampleShadowGetIRTriangleTexelArea(1.5 - offset);\n    // This area is superior to the one we are looking for if (offset < 0) thus we need to\n    // subtract the area of the triangle defined by (0,1.5-offset), (0,1.5+offset), (-offset,1.5).\n    float clampedOffsetLeft = min(offset,0.0);\n    float areaOfSmallLeftTriangle = clampedOffsetLeft * clampedOffsetLeft;\n    computedArea.y = computedAreaUncut.y - areaOfSmallLeftTriangle;\n\n    // We do the same for the Z but with the right part of the isoceles triangle\n    computedAreaUncut.z = sampleShadowGetIRTriangleTexelArea(1.5 + offset);\n    float clampedOffsetRight = max(offset,0.0);\n    float areaOfSmallRightTriangle = clampedOffsetRight * clampedOffsetRight;\n    computedArea.z = computedAreaUncut.z - areaOfSmallRightTriangle;\n}\n\n// Assuming a isoceles triangle of 2.5 texel height and 5 texels wide lying on 6 texels.\n// This function return the weight of each texels area relative to the full triangle area.\n//  /       \\\n// _ _ _ _ _ _ <-- texels\n// 0 1 2 3 4 5 <-- computed area indices (in texelsWeights[])\n// Top point at (right,top) in a texel,left bottom point at (middle,middle) in a texel,right bottom point at (middle,middle) in a texel.\nvoid sampleShadowGetTexelWeightsTent5x5(float offset, out vec3 texelsWeightsA, out vec3 texelsWeightsB)\n{\n    vec4 areaFrom3texelTriangle;\n    vec4 areaUncutFrom3texelTriangle;\n    sampleShadowGetTexelAreasTent3x3(offset, areaFrom3texelTriangle, areaUncutFrom3texelTriangle);\n\n    // Triangle slope is 45 degree thus we can almost reuse the result of the 3 texel wide computation.\n    // the 5 texel wide triangle can be seen as the 3 texel wide one but shifted up by one unit/texel.\n    // 0.16 is 1/(the triangle area)\n    texelsWeightsA.x = 0.16 * (areaFrom3texelTriangle.x);\n    texelsWeightsA.y = 0.16 * (areaUncutFrom3texelTriangle.y);\n    texelsWeightsA.z = 0.16 * (areaFrom3texelTriangle.y + 1.0);\n    texelsWeightsB.x = 0.16 * (areaFrom3texelTriangle.z + 1.0);\n    texelsWeightsB.y = 0.16 * (areaUncutFrom3texelTriangle.z);\n    texelsWeightsB.z = 0.16 * (areaFrom3texelTriangle.w);\n}\n\n// 5x5 Tent filter (45 degree sloped triangles in U and V)\nvoid sampleShadowComputeSamplesTent5x5(vec4 shadowMapTextureTexelSize, vec2 coord, out float fetchesWeights[9], out vec2 fetchesUV[9])\n{\n    // tent base is 5x5 base thus covering from 25 to 36 texels, thus we need 9 bilinear PCF fetches\n    vec2 tentCenterInTexelSpace = coord.xy * shadowMapTextureTexelSize.zw;\n    vec2 centerOfFetchesInTexelSpace = floor(tentCenterInTexelSpace + 0.5);\n    vec2 offsetFromTentCenterToCenterOfFetches = tentCenterInTexelSpace - centerOfFetchesInTexelSpace;\n\n    // find the weight of each texel based on the area of a 45 degree slop tent above each of them.\n    vec3 texelsWeightsUA, texelsWeightsUB;\n    vec3 texelsWeightsVA, texelsWeightsVB;\n    sampleShadowGetTexelWeightsTent5x5(offsetFromTentCenterToCenterOfFetches.x, texelsWeightsUA, texelsWeightsUB);\n    sampleShadowGetTexelWeightsTent5x5(offsetFromTentCenterToCenterOfFetches.y, texelsWeightsVA, texelsWeightsVB);\n\n    // each fetch will cover a group of 2x2 texels, the weight of each group is the sum of the weights of the texels\n    vec3 fetchesWeightsU = vec3(texelsWeightsUA.xz, texelsWeightsUB.y) + vec3(texelsWeightsUA.y, texelsWeightsUB.xz);\n    vec3 fetchesWeightsV = vec3(texelsWeightsVA.xz, texelsWeightsVB.y) + vec3(texelsWeightsVA.y, texelsWeightsVB.xz);\n\n    // move the PCF bilinear fetches to respect texels weights\n    vec3 fetchesOffsetsU = vec3(texelsWeightsUA.y, texelsWeightsUB.xz) / fetchesWeightsU.xyz + vec3(-2.5,-0.5,1.5);\n    vec3 fetchesOffsetsV = vec3(texelsWeightsVA.y, texelsWeightsVB.xz) / fetchesWeightsV.xyz + vec3(-2.5,-0.5,1.5);\n    fetchesOffsetsU *= shadowMapTextureTexelSize.xxx;\n    fetchesOffsetsV *= shadowMapTextureTexelSize.yyy;\n\n    vec2 bilinearFetchOrigin = centerOfFetchesInTexelSpace * shadowMapTextureTexelSize.xy;\n    fetchesUV[0] = bilinearFetchOrigin + vec2(fetchesOffsetsU.x, fetchesOffsetsV.x);\n    fetchesUV[1] = bilinearFetchOrigin + vec2(fetchesOffsetsU.y, fetchesOffsetsV.x);\n    fetchesUV[2] = bilinearFetchOrigin + vec2(fetchesOffsetsU.z, fetchesOffsetsV.x);\n    fetchesUV[3] = bilinearFetchOrigin + vec2(fetchesOffsetsU.x, fetchesOffsetsV.y);\n    fetchesUV[4] = bilinearFetchOrigin + vec2(fetchesOffsetsU.y, fetchesOffsetsV.y);\n    fetchesUV[5] = bilinearFetchOrigin + vec2(fetchesOffsetsU.z, fetchesOffsetsV.y);\n    fetchesUV[6] = bilinearFetchOrigin + vec2(fetchesOffsetsU.x, fetchesOffsetsV.z);\n    fetchesUV[7] = bilinearFetchOrigin + vec2(fetchesOffsetsU.y, fetchesOffsetsV.z);\n    fetchesUV[8] = bilinearFetchOrigin + vec2(fetchesOffsetsU.z, fetchesOffsetsV.z);\n\n    fetchesWeights[0] = fetchesWeightsU.x * fetchesWeightsV.x;\n    fetchesWeights[1] = fetchesWeightsU.y * fetchesWeightsV.x;\n    fetchesWeights[2] = fetchesWeightsU.z * fetchesWeightsV.x;\n    fetchesWeights[3] = fetchesWeightsU.x * fetchesWeightsV.y;\n    fetchesWeights[4] = fetchesWeightsU.y * fetchesWeightsV.y;\n    fetchesWeights[5] = fetchesWeightsU.z * fetchesWeightsV.y;\n    fetchesWeights[6] = fetchesWeightsU.x * fetchesWeightsV.z;\n    fetchesWeights[7] = fetchesWeightsU.y * fetchesWeightsV.z;\n    fetchesWeights[8] = fetchesWeightsU.z * fetchesWeightsV.z;\n}";

    var ShadowCasterVSGLSL = "#include \"Lighting.glsl\";\n#include \"Shadow.glsl\"\n\nattribute vec4 a_Position;\nattribute vec3 a_Normal;\n\n#ifdef BONE\n\tconst int c_MaxBoneCount = 24;\n\tattribute vec4 a_BoneIndices;\n\tattribute vec4 a_BoneWeights;\n\tuniform mat4 u_Bones[c_MaxBoneCount];\n#endif\n\n#ifdef GPU_INSTANCE\n\tattribute mat4 a_WorldMat;\n#else\n\tuniform mat4 u_WorldMat;\n#endif\n\nuniform mat4 u_ViewProjection;\n\nuniform vec3 u_LightDirection;\n\n#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))||(defined(LIGHTMAP)&&defined(UV))\n\tattribute vec2 a_Texcoord0;\n\tvarying vec2 v_Texcoord0;\n#endif\n\nvec4 shadowCasterVertex()\n{\n\tmat4 worldMat;\n\t#ifdef GPU_INSTANCE\n\t\tworldMat = a_WorldMat;\n\t#else\n\t\tworldMat = u_WorldMat;\n\t#endif\n\t\n\t#ifdef BONE\n\t\tmat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;\n\t\tskinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;\n\t\tskinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;\n\t\tskinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;\n\t\tworldMat = worldMat * skinTransform;\n\t#endif\n\n\tvec4 positionWS = worldMat * a_Position;\n\tvec3 normalWS = normalize(a_Normal*inverse(mat3(worldMat)));//if no normalize will cause precision problem\n\n\tpositionWS.xyz = applyShadowBias(positionWS.xyz,normalWS,u_LightDirection);\n\n\tvec4 positionCS = u_ViewProjection * positionWS;\n\tpositionCS.z = max(positionCS.z, 0.0);//min ndc z is 0.0\n\n\t// //TODO没考虑UV动画呢\n\t// #if defined(DIFFUSEMAP)&&defined(ALPHATEST)\n\t// \tv_Texcoord0=a_Texcoord0;\n\t// #endif\n    return positionCS;\n}\n";

    var ShadowCasterFSGLSL = "// #ifdef ALPHATEST\n// \tuniform float u_AlphaTestValue;\n// #endif\n\n// #ifdef DIFFUSEMAP\n// \tuniform sampler2D u_DiffuseTexture;\n// #endif\n\n// #if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))\n// \tvarying vec2 v_Texcoord0;\n// #endif\n\nvec4 shadowCasterFragment()\n{\n    return vec4(0.0);\n    // #if defined(DIFFUSEMAP)&&defined(ALPHATEST)\n\t// \tfloat alpha = texture2D(u_DiffuseTexture,v_Texcoord0).w;\n\t// \tif( alpha < u_AlphaTestValue )\n\t// \t{\n\t// \t\tdiscard;\n\t// \t}\n\t// #endif\n}\n";

    var TerrainShaderFS = "#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n\nuniform sampler2D u_SplatAlphaTexture;\n\nuniform sampler2D u_DiffuseTexture1;\nuniform sampler2D u_DiffuseTexture2;\nuniform sampler2D u_DiffuseTexture3;\nuniform sampler2D u_DiffuseTexture4;\nuniform sampler2D u_DiffuseTexture5;\n\nuniform vec2 u_DiffuseScale1;\nuniform vec2 u_DiffuseScale2;\nuniform vec2 u_DiffuseScale3;\nuniform vec2 u_DiffuseScale4;\nuniform vec2 u_DiffuseScale5;\n\nvarying vec2 v_Texcoord0;\n\n#include \"Shadow.glsl\"\n#ifdef RECEIVESHADOW\n\tvarying vec4 v_ShadowCoord;\n#endif\n\n\nvoid main()\n{\n\t#ifdef CUSTOM_DETAIL_NUM1\n\t\tvec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);\n\t\tvec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);\n\t\tgl_FragColor.xyz = color1.xyz * splatAlpha.r;\n\t#elif defined(CUSTOM_DETAIL_NUM2)\n\t\tvec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);\n\t\tvec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);\n\t\tvec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);\n\t\tgl_FragColor.xyz = color1.xyz * splatAlpha.r + color2.xyz * (1.0 - splatAlpha.r);\n\t#elif defined(CUSTOM_DETAIL_NUM3)\n\t\tvec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);\n\t\tvec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);\n\t\tvec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);\n\t\tvec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);\n\t\tgl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * (1.0 - splatAlpha.r - splatAlpha.g);\n\t#elif defined(CUSTOM_DETAIL_NUM4)\n\t\tvec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);\n\t\tvec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);\n\t\tvec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);\n\t\tvec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);\n\t\tvec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScale4);\n\t\tgl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b);\n\t#elif defined(CUSTOM_DETAIL_NUM5)\n\t\tvec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);\n\t\tvec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);\n\t\tvec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);\n\t\tvec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);\n\t\tvec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScale4);\n\t\tvec4 color5 = texture2D(u_DiffuseTexture5, v_Texcoord0 * u_DiffuseScale5);\n\t\tgl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * splatAlpha.a + color5.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b - splatAlpha.a);\n\t#else\n\t\t//gl_FragColor.xyz = vec3(0.0, 1.0, 0.0);\n\t#endif\n\n\n}\n";

    var TerrainShaderVS = "#include \"Lighting.glsl\";\nattribute vec4 a_Position;\nattribute vec2 a_Texcoord0;\nattribute vec3 a_Normal;\n\nuniform mat4 u_MvpMatrix;\nvarying vec2 v_Texcoord0;\n\nvoid main()\n{\n  gl_Position = u_MvpMatrix * a_Position;\n  v_Texcoord0 = a_Texcoord0;\n gl_Position=remapGLPositionZ(gl_Position);\n}";

    var BlinnPhongMaterial = Laya.BlinnPhongMaterial;
    var Shader3D = Laya.Shader3D;
    var VertexMesh = Laya.VertexMesh;
    var SubShader = Laya.SubShader;
    /**
     * ...
     * @author
     */
    class CustomTerrainMaterial extends BlinnPhongMaterial {
        constructor() {
            super();
            this.customTerrianShader();
            CustomTerrainMaterial.__initDefine__();
            this.setShaderName("CustomTerrainShader");
        }
        /**
         * @private
         */
        static __initDefine__() {
            CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM1");
            CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM2");
            CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM3");
            CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM4");
            CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM5");
        }
        /**
         * 获取splatAlpha贴图。
         * @return splatAlpha贴图。
         */
        get splatAlphaTexture() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.SPLATALPHATEXTURE);
        }
        /**
         * 设置splatAlpha贴图。
         * @param value splatAlpha贴图。
         */
        set splatAlphaTexture(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.SPLATALPHATEXTURE, value);
        }
        /**
         * 获取第一层贴图。
         * @return 第一层贴图。
         */
        get diffuseTexture1() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE1);
        }
        /**
         * 设置第一层贴图。
         * @param value 第一层贴图。
         */
        set diffuseTexture1(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE1, value);
            this._setDetailNum(1);
        }
        /**
         * 获取第二层贴图。
         * @return 第二层贴图。
         */
        get diffuseTexture2() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE2);
        }
        /**
         * 设置第二层贴图。
         * @param value 第二层贴图。
         */
        set diffuseTexture2(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE2, value);
            this._setDetailNum(2);
        }
        /**
         * 获取第三层贴图。
         * @return 第三层贴图。
         */
        get diffuseTexture3() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE3);
        }
        /**
         * 设置第三层贴图。
         * @param value 第三层贴图。
         */
        set diffuseTexture3(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE3, value);
            this._setDetailNum(3);
        }
        /**
         * 获取第四层贴图。
         * @return 第四层贴图。
         */
        get diffuseTexture4() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE4);
        }
        /**
         * 设置第四层贴图。
         * @param value 第四层贴图。
         */
        set diffuseTexture4(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE4, value);
            this._setDetailNum(4);
        }
        /**
         * 获取第五层贴图。
         * @return 第五层贴图。
         */
        get diffuseTexture5() {
            return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE5);
        }
        /**
         * 设置第五层贴图。
         * @param value 第五层贴图。
         */
        set diffuseTexture5(value) {
            this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE5, value);
            this._setDetailNum(5);
        }
        setDiffuseScale1(scale1) {
            this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE1, scale1);
        }
        setDiffuseScale2(scale2) {
            this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE2, scale2);
        }
        setDiffuseScale3(scale3) {
            this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE3, scale3);
        }
        setDiffuseScale4(scale4) {
            this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE4, scale4);
        }
        setDiffuseScale5(scale5) {
            this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE5, scale5);
        }
        _setDetailNum(value) {
            switch (value) {
                case 1:
                    this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                    break;
                case 2:
                    this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                    break;
                case 3:
                    this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                    break;
                case 4:
                    this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                    break;
                case 5:
                    this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                    this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                    break;
            }
        }
        customTerrianShader() {
            // 要和shader 中的输入参数一一对应
            var attributeMap = {
                'a_Position': VertexMesh.MESH_POSITION0,
                'a_Normal': VertexMesh.MESH_NORMAL0,
                'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
            };
            var uniformMap = {
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
            Shader3D.addInclude("ShadowSampleTent.glsl", ShadowSampleTentGLSL);
            Shader3D.addInclude("Shadow.glsl", ShadowGLSL);
            Shader3D.addInclude("ShadowCasterVS.glsl", ShadowCasterVSGLSL);
            Shader3D.addInclude("ShadowCasterFS.glsl", ShadowCasterFSGLSL);
            var customTerrianShader = Shader3D.add("CustomTerrainShader");
            var subShader = new SubShader(attributeMap, uniformMap);
            customTerrianShader.addSubShader(subShader);
            subShader.addShaderPass(TerrainShaderVS, TerrainShaderFS);
        }
    }
    CustomTerrainMaterial.SPLATALPHATEXTURE = Shader3D.propertyNameToID("u_SplatAlphaTexture");
    CustomTerrainMaterial.DIFFUSETEXTURE1 = Shader3D.propertyNameToID("u_DiffuseTexture1");
    CustomTerrainMaterial.DIFFUSETEXTURE2 = Shader3D.propertyNameToID("u_DiffuseTexture2");
    CustomTerrainMaterial.DIFFUSETEXTURE3 = Shader3D.propertyNameToID("u_DiffuseTexture3");
    CustomTerrainMaterial.DIFFUSETEXTURE4 = Shader3D.propertyNameToID("u_DiffuseTexture4");
    CustomTerrainMaterial.DIFFUSETEXTURE5 = Shader3D.propertyNameToID("u_DiffuseTexture5");
    CustomTerrainMaterial.DIFFUSESCALE1 = Shader3D.propertyNameToID("u_DiffuseScale1");
    CustomTerrainMaterial.DIFFUSESCALE2 = Shader3D.propertyNameToID("u_DiffuseScale2");
    CustomTerrainMaterial.DIFFUSESCALE3 = Shader3D.propertyNameToID("u_DiffuseScale3");
    CustomTerrainMaterial.DIFFUSESCALE4 = Shader3D.propertyNameToID("u_DiffuseScale4");
    CustomTerrainMaterial.DIFFUSESCALE5 = Shader3D.propertyNameToID("u_DiffuseScale5");
    //# sourceMappingURL=CustomTerrainMaterial.js.map

    var Texture2D = Laya.Texture2D;
    var Vector2 = Laya.Vector2;
    function createTerrainMaterial() {
        var customMaterial = new CustomTerrainMaterial();
        Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/splatAlphaTexture.png", Laya.Handler.create(this, function (tex) {
            customMaterial.splatAlphaTexture = tex;
        }));
        Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground1.png", Laya.Handler.create(this, function (tex) {
            customMaterial.diffuseTexture1 = tex;
        }));
        Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground2.png", Laya.Handler.create(this, function (tex) {
            customMaterial.diffuseTexture2 = tex;
        }));
        Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground3.png", Laya.Handler.create(this, function (tex) {
            customMaterial.diffuseTexture3 = tex;
        }));
        Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground1.png", Laya.Handler.create(this, function (tex) {
            customMaterial.diffuseTexture4 = tex;
        }));
        customMaterial.setDiffuseScale1(new Vector2(27.92727, 27.92727));
        customMaterial.setDiffuseScale2(new Vector2(13.96364, 13.96364));
        customMaterial.setDiffuseScale3(new Vector2(18.61818, 18.61818));
        customMaterial.setDiffuseScale4(new Vector2(13.96364, 13.96364));
        return customMaterial;
    }
    //# sourceMappingURL=createMyMaterial.js.map

    class MainLayer extends Laya.Sprite {
        constructor() {
            super();
            this.init();
        }
        initContainer($container) {
            this.container = $container;
            this.container.addChild(this.sceneLayer);
            this.container.addChild(this.mainLayer);
            this.container.addChild(this.commonLayer);
            this.container.addChild(this.popLayer);
            this.container.addChild(this.messageLayer);
            this.container.addChild(this.storyLayer);
            this.container.addChild(this.tipLayer);
            this.container.addChild(this.gmLayer);
            this.container.addChild(this.topLayer);
            this.container.addChild(this.eyiIpLayer);
        }
        init() {
            this.sceneLayer = new Laya.Sprite();
            this.sceneLayer.mouseEnabled = false;
            this.sceneLayer.mouseThrough = false;
            this.mainLayer = new Laya.Sprite();
            this.mainLayer.mouseEnabled = false;
            this.mainLayer.mouseThrough = false;
            this.commonLayer = new Laya.Sprite();
            this.commonLayer.mouseEnabled = false;
            this.commonLayer.mouseThrough = false;
            this.popLayer = new Laya.Sprite();
            this.popLayer.mouseEnabled = false;
            this.popLayer.mouseThrough = false;
            this.messageLayer = new Laya.Sprite();
            this.messageLayer.mouseEnabled = false;
            this.messageLayer.mouseThrough = false;
            this.storyLayer = new Laya.Sprite();
            this.storyLayer.mouseEnabled = false;
            this.storyLayer.mouseThrough = false;
            this.tipLayer = new Laya.Sprite();
            this.tipLayer.mouseEnabled = false;
            this.tipLayer.mouseThrough = false;
            this.gmLayer = new Laya.Sprite();
            this.gmLayer.mouseEnabled = false;
            this.gmLayer.mouseThrough = false;
            this.topLayer = new Laya.Sprite;
            this.topLayer.mouseEnabled = false;
            this.topLayer.mouseThrough = false;
            this.eyiIpLayer = new Laya.Sprite;
            this.eyiIpLayer.mouseEnabled = false;
            this.eyiIpLayer.mouseThrough = false;
        }
    }
    //# sourceMappingURL=mainLayer.js.map

    class GameManager {
        constructor() {
            this.baseLayer = new MainLayer();
            this.sceneData = new SceneData();
            this.baseLayer.initContainer(Laya.stage);
        }
        static get Instance() {
            if (!this._instance) {
                this._instance = new GameManager();
            }
            return this._instance;
        }
    }
    class SceneData {
        constructor() {
            this.autoMoveDir = 9999;
        }
    }
    //# sourceMappingURL=GameManager.js.map

    class JoyBoxUI extends Laya.View {
        constructor() {
            super();
        }
        createChildren() {
            Laya.View.regComponent("VirtualJoyUI", VirtualJoyUI);
            super.createChildren();
            this.createView(JoyBoxUI.uiView);
        }
    }
    JoyBoxUI.uiView = {
        "type": "View",
        "props": {
            "width": 1600,
            "height": 1400
        },
        "child": [{
                "type": "Label",
                "props": {
                    "y": 13,
                    "x": 256,
                    "var": "txtRoleName",
                    "text": "主界面"
                }
            }
            // 是动态加的
            // , {
            //     "type": "VirtualJoy",
            //     "props": {
            //         "y": 0,
            //         "x": 400,
            //         "var": "joyUI",
            //         "runtime": "VirtualJoyUI"
            //     }
            // }
        ]
    };
    class VirtualJoyUI extends Laya.View {
        constructor() {
            super();
        }
        createChildren() {
            super.createChildren();
            this.createView(VirtualJoyUI.uiView);
        }
    }
    VirtualJoyUI.uiView = {
        "type": "View",
        "props": {},
        "child": [{
                "type": "Image",
                "props": {
                    "y": 0,
                    "x": 0,
                    "var": "virtual",
                    "skin": "skin/home/circle.png"
                }
            }, {
                "type": "Image",
                "props": {
                    "y": 25,
                    "x": 25,
                    "var": "ball",
                    "skin": "skin/home/ball.png"
                }
            }]
    };
    class VirtualJoy {
        constructor(skin) {
            this.circleRadius = 0;
            this.ballRadius = 0;
            this.centerX = 0;
            this.centerY = 0;
            this.p1 = new Laya.Point();
            this.startMove = false;
            this._start = false;
            this._skin = skin;
            this.circleRadius = 60.5; //图片大小是 121
            this.ballRadius = 35;
            this.centerX = this.circleRadius;
            this.centerY = this.circleRadius;
            this._skin.pivotX = this.circleRadius;
            this._skin.pivotY = this.circleRadius;
            this._skin.ball.pivotX = this.ballRadius;
            this._skin.ball.pivotY = this.ballRadius;
            this._skin.ball.x = this.centerX;
            this._skin.ball.y = this.centerY;
            this.p1.x = this._skin.x;
            this.p1.y = this._skin.y;
            this._skin.visible = false;
            this._skin.mouseEnabled = false;
            this._skin.mouseThrough = true;
            this.start();
        }
        start() {
            if (this._start)
                return;
            if (this._skin.parent == null) {
                let container = GameManager.Instance.baseLayer.mainLayer;
                container.addChild(this._skin);
            }
            this._skin.visible = false;
            let root = Laya.stage;
            root.on(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
            this._start = true;
        }
        stop() {
            this._start = false;
            this.clearMove();
            let root = Laya.stage;
            root.off(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
        }
        onTouchBegin(e) {
            // if(!(e.target instanceof egret.Stage)) return;
            if (!this._skin) {
                return;
            }
            // this._skin.x this._skin.y 对应中心位置
            //因为有设置pivot 轴心点的位置是处于图片的center center
            this._skin.x = e.stageX;
            this._skin.y = e.stageY;
            if (this._skin.parent == null) {
                let container = GameManager.Instance.baseLayer.mainLayer;
                container.addChild(this._skin);
            }
            this._skin.visible = true;
            this._skin.ball.x = this.centerX;
            this._skin.ball.y = this.centerY;
            this.p1.x = this._skin.x;
            this.p1.y = this._skin.y;
            let root = Laya.stage;
            // 鼠标左键
            root.off(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
            root.on(Laya.Event.MOUSE_UP, this, this.onTouchEnd);
            root.on(Laya.Event.MOUSE_MOVE, this, this.onTouchMove);
            // this._skin.visible = false;
        }
        onTouchEnd(e) {
            // if(this.touchID != e.touchPointID){
            // 	return;
            // }
            let root = Laya.stage;
            root.on(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
            this._skin.ball.x = this.centerX; // ball 这个相对位置是父容器的左上角
            this._skin.ball.y = this.centerY;
            this.clearMove();
        }
        onTouchMove(e) {
            // if(this.touchID != e.touchPointID){
            // 	return;
            // }
            e.stopPropagation();
            if (!this._skin) {
                return;
            }
            let p2 = new Laya.Point(e.stageX, e.stageY);
            // Math.atan2()函数返回点(x,y)和原点(0,0)之间直线的倾斜角，弧度值
            // 表示斜线和 x=x 这条线(垂直方向的)的夹角
            // 弧度 = (π × 角度) / 180
            // 角度 = (180×弧度) / π
            let angle = Math.atan2(p2.y - this.p1.y, p2.x - this.p1.x);
            // JOY Stick 的偏移
            let dist = Math.sqrt((this.p1.x - p2.x) * (this.p1.x - p2.x) + (this.p1.y - p2.y) * (this.p1.y - p2.y));
            let bx, by; //ball 相对于父容器左上角的偏移
            // 拖动距离在圆圈内的时候
            if (dist <= (this.circleRadius - this.ballRadius)) {
                this._skin.ball.x = bx = this.centerX + p2.x - this._skin.x; //似乎用 this.p1也可以
                this._skin.ball.y = by = this.centerY + p2.y - this._skin.y;
            }
            else {
                this._skin.ball.x = bx = Math.cos(angle) * (this.circleRadius - this.ballRadius) + this.centerX;
                this._skin.ball.y = by = Math.sin(angle) * (this.circleRadius - this.ballRadius) + this.centerY;
                this._skin.visible = true;
            }
            if (this._skin.visible == false) {
                return;
            }
            // let cellw:number = GameDefine.MAP_GRID_WIDTH;
            // let cellh:number = GameDefine.MAP_GRID_HEIGHT;
            // let dir = DirectionUtil.getDir( Math.floor(p2.x/cellw)-Math.floor(this.p1.x/cellw),Math.floor(p2.y/cellh)- Math.floor(this.p1.y/cellh));
            //	TestGB.Instance.moveByVirtual(dir);
            let dir = this.orientation(bx, by, this.centerX, this.centerY);
            this.moveByVirtual(dir);
            //console.log(dir+'playRun移动方向');
        }
        //atan2(x, y)
        //               +
        //               |
        //               |
        //               |
        //               |
        //   -1 * (right)|   0 ~ 90
        //               |
        //               |
        // +--------------------------+
        //               |
        //               |
        //               |
        //   -1 * (right)|   180 - up
        //               |
        //               |
        //               |
        //               |
        //               +
        orientation(ballx, bally, centerx, centery) {
            var dx = ballx - centerx;
            var dy = -(bally - centery);
            // 这里的计算应该以 centerx centery 为圆心
            // 注意2D世界中的坐标系是左上角 0,0   越往下y越大
            // console.log("dx  dy", dx, dy)
            var r = Math.atan2(dx, dy) * 180 / Math.PI; //根据弧度计算角度
            return r;
        }
        clearMove() {
            //	TestGB.Instance.moveByVirtual(-1);
            this.moveByVirtual(9999);
            if (this._skin.parent) {
                this._skin.parent.removeChild(this._skin);
            }
            let root = Laya.stage;
            root.off(Laya.Event.MOUSE_UP, this, this.onTouchEnd);
            root.off(Laya.Event.MOUSE_MOVE, this, this.onTouchMove);
        }
        moveByVirtual(value) {
            if (GameManager.Instance.sceneData.autoMoveDir != value) {
                // DataManager.Instance.sceneData.sendNotification(constants.E_DATA_NOTIFY_UIVIEW.VIRTUAL_MOVE,value);
                GameManager.Instance.sceneData.autoMoveDir = value;
            }
        }
    }
    //# sourceMappingURL=joy.js.map

    var Vector3 = Laya.Vector3;
    class RoleMoveScript extends Laya.Script3D {
        constructor() {
            super();
        }
        /**
         * @inheritDoc
         */
        onAwake() {
            this.player = this.owner;
            if (this.player) {
                this.playerAnimator = this.player.getComponent(Laya.Animator);
                //https://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-16-5
                //插件目前暂不支持角色碰撞器导出，使用时需要使用代码创建。
                //然后导出后的player的 components 下面确实没有 capsuleCollider  只有rigidbody 和 js 还有就是 animator
                //this.playerCollider = this.player.getComponent(Laya.PhysicsCollider)
                //摩擦力
                // this.playerCollider.friction = 2;
                //物理碰撞体设置弹力
                // this.playerCollider.restitution = 0.3;
                var character = this.player.addComponent(Laya.CharacterController);
                var capsuleShape = new Laya.CapsuleColliderShape(0.2516022, 1.598118, 1);
                //这里最后1 代表方向 static SHAPEORIENTATION_UPY: number = 1;
                capsuleShape.localOffset = new Laya.Vector3(0.0152, 0.7938, 0);
                character.colliderShape = capsuleShape;
                // 以上这段character 相关的代码  是控制人物能够站立在地面上
                let transform = this.player.transform;
                let playerPosition = transform.position;
                this.lastPos = playerPosition;
                const lookAtPoint1 = new Laya.Vector3(playerPosition
                    .x + 9.489044, transform.position.y, playerPosition.z - 4.87); //仙人掌
                const lookAtPoint2 = new Laya.Vector3(playerPosition.x + 19.35, 10.12411, playerPosition.z - 11.91); //岩石
                const lookAtPoint3 = new Laya.Vector3(274.0090026855469, transform.position.y, 34.65625); // KyleRobot
                const lookAtPoint31 = new Laya.Vector3(272.6490173339844, transform.position.y, 34.65625); // KyleRobot
                const lookAtPoint32 = new Laya.Vector3(271.239013671875, transform.position.y, 34.65625); // KyleRobot
                const lookAtPoint4 = new Laya.Vector3(playerPosition.x + 19.1, transform.position.y, playerPosition.z - 20.23); //Roboto
                let rotation = new Laya.Quaternion();
                setTimeout(() => {
                    // this.player.transform.rotate(new Vector3(0, 180, 0), true, false)
                    //不能正确指向目标
                    // Laya.Quaternion.lookAt(transform.position, lookAtPoint32, new Laya.Vector3(0, 1, 0), rotation);
                    // this.player.transform.localRotation = rotation;
                    this.player.transform.lookAt(lookAtPoint32, new Laya.Vector3(0, 1, 0), false);
                    let forward = new Vector3();
                    this.player.transform.getForward(forward);
                    console.log("for ward", forward);
                    // this.player.transform.rotate(new Vector3(0, 180, 0), false, false);//中心对称取反一下
                    console.log("pos", this.player.transform.position);
                    let newPos = new Vector3();
                    Vector3.add(transform.position, new Vector3(0.5, 0, 0.5), newPos);
                    this.player.transform.position = newPos;
                    this.lastPos = newPos;
                    console.log("pos", this.player.transform.position);
                }, 1500);
            }
        }
        /**
         * @inheritDoc
         */
        onUpdate() {
            if (GameManager.Instance.sceneData.autoMoveDir != 9999) {
                let transform = this.player.transform;
                this.player.transform.position = this.lastPos;
                // console.log("new pos  1", transform.position.x - this.lastPos.x)
                // console.log("autoMoveDir", GameManager.Instance.sceneData.autoMoveDir)
                // 弧度 = (π × 角度) / 180
                // 角度 = (180×弧度) / π
                // 弧度 - π  相当于角度 - 180
                // 注意 Math.cos(90 * Math.PI/180) 存在精度问题  结果是6.123031769111886e-17
                let rotateAngle = GameManager.Instance.sceneData.autoMoveDir * Math.PI / 180;
                let sz = Math.sin(rotateAngle); //
                let sx = Math.cos(rotateAngle); //
                // posx = sxl + transform.position.x;
                // posz = szl + transform.position.z;
                // 效果一样
                // console.log("sz  sx", sx/sz,  sxl/szl, sz, sx)
                // console.log(sz, sx)
                // 调整了摄像头的方位 默认看到的是这样的  z 和 unity 中的z 一致 但x 相反
                // x
                // ^
                // |
                // |
                // |
                // |
                // |
                // +------------> z
                // 由于人物是用z的负方向去指向lookat物体
                // 所以角度这里要有180的调整
                let posx = sx + transform.position.x;
                let posz = -sz + transform.position.z; //取反的原因下面有说明
                let posy = 0 + transform.position.y;
                let rotation = new Laya.Quaternion();
                // 关于lookat
                // 就是看向目标  让物体Z轴指向目标。(这是Unity)
                // https://zhuanlan.zhihu.com/p/80490378
                // https://blog.csdn.net/qq_34568700/article/details/95772668
                // 而Laya 使用不同的坐标系
                // 存在偏差(坐标系不同?)  当JOY 顺时针旋转的时候  人物在逆时针旋转
                let lookAtPoint = new Vector3(posx, transform.position.y, posz);
                // 方法1  直接用人物本身的lookat
                // 最后人物旋转180的原因是  似乎laya 中是使用z的负方向去lookat的
                // this.player.transform.lookAt(lookAtPoint, new Laya.Vector3(0, 1, 0), false);
                // console.log("local rotation 1", sz, sx, lookAtPoint, this.player.transform.localRotation);
                // this.player.transform.rotate(new Vector3(0, 180, 0), false, false);//中心对称取反一下
                // 但是update 函数中却不能这么操作  不然人物闪动 在不断的变化方向
                // 方法2 用全局lookat 得到 rotate
                // 存在一个问题 角度上是x轴对称的
                // 比如实际上看 1 1 的位置时候  人物实际上朝向的是 (-1 1)
                // 当看 1 -1 时  人物实际上看的是 -1 -1
                Laya.Quaternion.lookAt(transform.position, lookAtPoint, new Laya.Vector3(0, 1, 0), rotation);
                this.player.transform.localRotation = rotation;
                // console.log("new pos  2", this.player.transform.position.x - this.lastPos.x)
                // console.log("local rotation 2", sz, sx, lookAtPoint, this.player.transform.localRotation);
                // 方法3 rotate //不行 这样会一直转下去
                // this.player.transform.rotate(new Vector3(0, rotateAngle, 0), false, false)
                // 注释掉这个就可以原地不动
                // 这里的 vec3 和似乎和运动方向没关系  和速度也没有关系  不懂
                // (this.owner as Laya.Sprite3D).transform.translate(new Laya.Vector3(1/600, 0, -1/600), true);
                let newPos = new Vector3();
                Vector3.add(transform.position, new Vector3(sx / 10, 0, sz / 10), newPos);
                // console.log("new pos  3", newPos.x - this.lastPos.x)
                // this.player.transform.position = newPos
                this.player.transform.translate(new Vector3(sx / 10, 0, sz / 10), true);
                this.lastPos = newPos;
                this.playerAnimator.play("Run");
            }
            else {
                if (this.playerAnimator) {
                    this.playerAnimator.play("Idle");
                }
            }
            //如果动画名字弄错的话 会有  Cannot read property '_clip' of undefined 的报错
        }
        onCollisionEnter(collision) {
            // console.log("player collision", collision)
        }
    }
    // 另外有个帖子也说道了朝向这个问题
    // https://ask.layabox.com/question/38719
    //# sourceMappingURL=RoleMoveScript.js.map

    var Vector3$1 = Laya.Vector3;
    class CameraFollowScript extends Laya.Script3D {
        constructor() {
            super();
            /** @private */
            this._tempVector3 = new Laya.Vector3();
            this.yawPitchRoll = new Laya.Vector3();
            this.resultRotation = new Laya.Quaternion();
            this.tempRotationZ = new Laya.Quaternion();
            this.tempRotationX = new Laya.Quaternion();
            this.tempRotationY = new Laya.Quaternion();
            this.rotaionSpeed = 0.00006;
        }
        /**
         * @private
         */
        _updateRotation() {
            if (Math.abs(this.yawPitchRoll.y) < 1.50) {
                // 欧拉角生成四元数
                // https://en.wikipedia.org/wiki/Aircraft_principal_axes 偏航軸
                // Yew:y   Roll:z  Pitch:x
                Laya.Quaternion.createFromYawPitchRoll(this.yawPitchRoll.x, this.yawPitchRoll.y, this.yawPitchRoll.z, this.tempRotationZ);
                // console.log("rotation   1", this.camera.transform.localRotation)
                this.tempRotationZ.cloneTo(this.camera.transform.localRotation);
                // console.log("rotation   2", this.camera.transform.localRotation)
                // 不懂要这一步做啥...不是已经clone了么...
                this.camera.transform.localRotation = this.camera.transform.localRotation;
                // console.log("rotation   3", this.camera.transform.localRotation)
                let forward = new Vector3$1();
                this.camera.transform.getForward(forward);
                let scaleFactor = 10;
                let cubeDistance = new Vector3$1(forward.x * scaleFactor, 3, forward.y * scaleFactor);
                let cuePos = new Vector3$1();
                Vector3$1.add(this.camera.transform.position, cubeDistance, cuePos);
                this.camCube.transform.position = cuePos;
                console.log("forward", forward, cuePos);
            }
        }
        /**
         * @inheritDoc
         */
        onAwake() {
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
            Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.leftMouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.leftMouseUp);
            Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.mouseOut);
            this.camera = this.owner;
            this.role3D = GameManager.Instance.role3D;
            this.lastRoleTransform = this.role3D.transform.position;
            this.camCube = GameManager.Instance.camCube;
        }
        /**
         * @inheritDoc
         */
        onUpdate() {
            var elapsedTime = Laya.timer.delta;
            let role3D = this.role3D;
            if (!isNaN(this.lastMouseX) && !isNaN(this.lastMouseY) && this.isRightMouseDown) {
                var scene = this.owner.scene;
                Laya.KeyBoardManager.hasKeyDown(87) && this.moveForward(-0.01 * elapsedTime); //W
                Laya.KeyBoardManager.hasKeyDown(83) && this.moveForward(0.01 * elapsedTime); //S
                Laya.KeyBoardManager.hasKeyDown(65) && this.moveRight(-0.01 * elapsedTime); //A
                Laya.KeyBoardManager.hasKeyDown(68) && this.moveRight(0.01 * elapsedTime); //D
                Laya.KeyBoardManager.hasKeyDown(81) && this.moveVertical(0.01 * elapsedTime); //Q
                Laya.KeyBoardManager.hasKeyDown(69) && this.moveVertical(-0.01 * elapsedTime); //E
                var offsetX = Laya.stage.mouseX - this.lastMouseX;
                var offsetY = Laya.stage.mouseY - this.lastMouseY;
                var yprElem = this.yawPitchRoll;
                yprElem.x -= offsetX * this.rotaionSpeed * elapsedTime;
                yprElem.y -= offsetY * this.rotaionSpeed * elapsedTime;
                // console.log("offset ", offsetX, offsetY, yprElem.x, yprElem.y)
                this._updateRotation();
            }
            else {
                // if (this.isLeftMouseDown) {
                let roleMoveVec = new Vector3$1(role3D.transform.position.x - this.lastRoleTransform.x, role3D.transform.position.y - this.lastRoleTransform.y, role3D.transform.position.z - this.lastRoleTransform.z);
                this.camera.transform.position = new Vector3$1(this.camera.transform.position.x + roleMoveVec.x, this.camera.transform.position.y + roleMoveVec.y, this.camera.transform.position.z + roleMoveVec.z);
                //lookAt(role3D.transform.position, new Laya.Vector3(0,1,0));
            }
            this.lastMouseX = Laya.stage.mouseX;
            this.lastMouseY = Laya.stage.mouseY;
            this.lastRoleTransform = new Vector3$1(role3D.transform.position.x, role3D.transform.position.y, role3D.transform.position.z);
        }
        /**
         * @inheritDoc
         */
        onDestroy() {
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
            Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
        }
        rightMouseDown(e) {
            // 根据四元数得到欧拉角
            this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            //如果e 是 Event 则应该这样获取到在stage上的位置 Laya.stage.mouseX;
            this.lastMouseX = e.stageX;
            this.lastMouseY = e.stageY;
            this.isRightMouseDown = true;
        }
        rightMouseUp(e) {
            this.isRightMouseDown = false;
        }
        leftMouseDown(e) {
            console.log("left");
            // this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
            // this.lastMouseX = Laya.stage.mouseX;
            // this.lastMouseY = Laya.stage.mouseY;
            this.isLeftMouseDown = true;
        }
        leftMouseUp(e) {
            this.isLeftMouseDown = false;
        }
        mouseOut(e) {
            this.isRightMouseDown = false;
            this.isLeftMouseDown = false;
        }
        /**
         * 向前移动。
         * @param distance 移动距离。
         */
        moveForward(distance) {
            this._tempVector3.x = this._tempVector3.y = 0;
            this._tempVector3.z = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向右移动。
         * @param distance 移动距离。
         */
        moveRight(distance) {
            this._tempVector3.y = this._tempVector3.z = 0;
            this._tempVector3.x = distance;
            this.camera.transform.translate(this._tempVector3);
        }
        /**
         * 向上移动。
         * @param distance 移动距离。
         */
        moveVertical(distance) {
            this._tempVector3.x = this._tempVector3.z = 0;
            this._tempVector3.y = distance;
            this.camera.transform.translate(this._tempVector3, false);
        }
    }
    //# sourceMappingURL=CameraFollowScript.js.map

    class GlobalConfig {
    }
    GlobalConfig.scenePathMap = {
        "entry": "scene/GameScene.scene",
        // 如果使用预设  导出的是 lh 后缀
        // 要使用场景  导出的才是 ls 文件
        "game": "res/LayaScene_DesertScene_mobile/Conventional/DesertScene_mobile.ls"
    };
    window["GlobalConfig"] = GlobalConfig;
    //# sourceMappingURL=GlobalConfig.js.map

    class SceneManager {
        static get instance() {
            !this._instance && (this._instance = new SceneManager);
            return this._instance;
        }
        initialize() {
        }
        loadScene(sceneName) {
            let path = GlobalConfig.scenePathMap[sceneName];
            return new Promise((resolve, reject) => {
                if (!path) {
                    reject("no scene " + sceneName);
                }
                if (path.endsWith("ls")) {
                    Laya.Scene3D.load(path, Laya.Handler.create(this, resolve));
                }
                else {
                    Laya.Scene.load(path, Laya.Handler.create(this, resolve));
                }
            });
        }
        toScene(sceneName, closeOthers) {
            let path = GlobalConfig.scenePathMap[sceneName];
            if (path.endsWith("ls")) {
                Laya.Scene.open(path);
            }
            else {
                Laya.Scene.open(path);
            }
        }
        get currentScene() {
            if (this._scene) {
                return this._scene;
            }
        }
        getObjectByName(name) {
            return this._scene.getChildByName(name);
        }
        addChild(node) {
            return this._scene.addChild(node);
        }
    }
    //# sourceMappingURL=SceneManager.js.map

    var Shader3D$1 = Laya.Shader3D;
    class MultiplePassOutlineMaterial extends Laya.BaseMaterial {
        constructor() {
            super();
            MultiplePassOutlineMaterial.initShader();
            this.setShaderName("MultiplePassOutlineShader");
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.1581197);
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
            this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, new Laya.Vector4(1.0, 0, 1.0, 0.0));
        }
        /**
         * @private
         */
        static __init__() {
        }
        /**
         * 获取漫反射贴图。
         * @return 漫反射贴图。
         */
        get albedoTexture() {
            return this._shaderValues.getTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
        }
        /**
         * 设置漫反射贴图。
         * @param value 漫反射贴图。
         */
        set albedoTexture(value) {
            this._shaderValues.setTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
        }
        /**
         * 获取线条颜色
         * @return 线条颜色
         */
        get outlineColor() {
            return this._shaderValues.getVector(MultiplePassOutlineMaterial.OUTLINECOLOR);
        }
        set outlineColor(value) {
            this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
        }
        /**
         * 获取轮廓宽度。
         * @return 轮廓宽度,范围为0到0.05。
         */
        get outlineWidth() {
            return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH);
        }
        /**
         * 设置轮廓宽度。
         * @param value 轮廓宽度,范围为0到0.05。
         */
        set outlineWidth(value) {
            value = Math.max(0.0, Math.min(0.05, value));
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
        }
        /**
         * 获取轮廓亮度。
         * @return 轮廓亮度,范围为0到1。
         */
        get outlineLightness() {
            return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
        }
        /**
         * 设置轮廓亮度。
         * @param value 轮廓亮度,范围为0到1。
         */
        set outlineLightness(value) {
            value = Math.max(0.0, Math.min(1.0, value));
            this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
        }
        static initShader() {
            MultiplePassOutlineMaterial.__init__();
            var attributeMap = {
                'a_Position': Laya.VertexMesh.MESH_POSITION0,
                'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
                'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0
            };
            var uniformMap = {
                'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
                'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
                'u_OutlineWidth': Laya.Shader3D.PERIOD_MATERIAL,
                'u_OutlineColor': Laya.Shader3D.PERIOD_MATERIAL,
                'u_OutlineLightness': Laya.Shader3D.PERIOD_MATERIAL,
                'u_AlbedoTexture': Laya.Shader3D.PERIOD_MATERIAL
            };
            // Shader3D.addInclude("Lighting.glsl", LightingGLSL); // 在 Laya.3d.js 中已经添加了  没有必要再次添加
            var customShader = Laya.Shader3D.add("MultiplePassOutlineShader");
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            customShader.addSubShader(subShader);
            let vs1 = `
        attribute vec4 a_Position;
        attribute vec3 a_Normal;

        uniform mat4 u_MvpMatrix;
        uniform float u_OutlineWidth;


        void main()
        {
           vec4 position = vec4(a_Position.xyz + a_Normal * u_OutlineWidth, 1.0);
           gl_Position = u_MvpMatrix * position;
        }`;
            let ps1 = `
        #ifdef FSHIGHPRECISION
            precision highp float;
        #else
           precision mediump float;
        #endif
        uniform vec4 u_OutlineColor;
        uniform float u_OutlineLightness;

        void main()
        {
           vec3 finalColor = u_OutlineColor.rgb * u_OutlineLightness;
           gl_FragColor = vec4(finalColor,0.0);
        }`;
            var pass1 = subShader.addShaderPass(vs1, ps1);
            pass1.renderState.cull = Laya.RenderState.CULL_FRONT;
            let vs2 = `
        #include "Lighting.glsl"

        attribute vec4 a_Position;
        attribute vec2 a_Texcoord0;

        uniform mat4 u_MvpMatrix;
        uniform mat4 u_WorldMat;

        attribute vec3 a_Normal;
        varying vec3 v_Normal;
        varying vec2 v_Texcoord0;

        void main()
        {
           gl_Position = u_MvpMatrix * a_Position;
           mat3 worldMat=mat3(u_WorldMat);
           v_Normal=worldMat*a_Normal;
           v_Texcoord0 = a_Texcoord0;
           gl_Position=remapGLPositionZ(gl_Position);
        }`;
            let ps2 = `
        #ifdef FSHIGHPRECISION
            precision highp float;
        #else
            precision mediump float;
        #endif
        varying vec2 v_Texcoord0;
        varying vec3 v_Normal;

        uniform sampler2D u_AlbedoTexture;


        void main()
        {
           vec4 albedoTextureColor = vec4(1.0);

           albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);
           gl_FragColor=albedoTextureColor;
        }`;
            subShader.addShaderPass(vs2, ps2);
        }
    }
    MultiplePassOutlineMaterial.ALBEDOTEXTURE = Shader3D$1.propertyNameToID("u_AlbedoTexture");
    MultiplePassOutlineMaterial.OUTLINECOLOR = Shader3D$1.propertyNameToID("u_OutlineColor");
    MultiplePassOutlineMaterial.OUTLINEWIDTH = Shader3D$1.propertyNameToID("u_OutlineWidth");
    MultiplePassOutlineMaterial.OUTLINELIGHTNESS = Shader3D$1.propertyNameToID("u_OutlineLightness");
    //# sourceMappingURL=MultiplePassOutlineMaterial.js.map

    var Mesh = Laya.Mesh;
    class GameScene extends Laya.Scene3D {
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
                let camera = this._camera = scene.getChildByName("Main Camera");
                //相机视角控制组件(脚本),
                // camera.addComponent(CameraMoveScript);
                this._scene.addChild(camera); // camera 也有scene 属
                let camCube = scene.getChildByName("Cube");
                this._scene.addChild(camCube);
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
                let desert = scene.getChildByName("DesertScene");
                this.loadLight(desert);
                this.loadTerrain(desert);
                this.morePlants(desert);
                this.playerControl(desert);
            });
            // Laya.Scene3D.load("res/LayaScene_DesertScene_mobile/Conventional/DesertScene_mobile.ls", Laya.Handler.create(this,  (scene)=> {
            // this.addToScene0()
            // this._scene = scene;
            // Laya.stage.addChild(scene);
            // this.addToSceneFromUnity(scene)
            // }))
        }
        initShader() {
            // customTerrianShader()
        }
        loadLight(desert) {
            // 使用Unity 中的光照
            let dLight = this._scene.getChildByName("Directional Light");
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
        loadTerrain(desert) {
            // 获取terrain // terrain 在console 中显示的类型就是 MeshSprite3D
            var terrain = desert.getChildByName("Terrain");
            terrain.meshRenderer.receiveShadow = true;
            Mesh.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/terrain_Terrain.lm", Laya.Handler.create(this, function (mesh) {
                // var mat: Laya.BlinnPhongMaterial = new Laya.BlinnPhongMaterial();
                // Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/terrain/Ground1.png", Laya.Handler.create(this, function (tex: Texture2D): void {
                //     mat.albedoTexture = tex
                //     mat.specularTexture = tex
                //     terrain.meshRenderer.material = mat
                //     terrain.meshRenderer.receiveShadow = true
                // }));
                terrain.meshRenderer.material = createTerrainMaterial();
                terrain.meshRenderer.receiveShadow = true;
                // sharedMaterial  masterial 有什么区别
            }));
            //平面添加物理碰撞体组件
            var planeStaticCollider = terrain.addComponent(Laya.PhysicsCollider);
            //创建盒子形状碰撞器
            var planeShape = new Laya.BoxColliderShape(10, 0, 10);
            //物理碰撞体设置形状
            planeStaticCollider.colliderShape = planeShape;
            //物理碰撞体设置摩擦力
            planeStaticCollider.friction = 2;
            //物理碰撞体设置弹力
            planeStaticCollider.restitution = 0.3;
            let rock = desert.getChildByName("Rocks").getChildByName("rock07_m");
            console.log("rock", rock.transform.position);
            let kyle = desert.getChildByName("RobotKyle");
            console.log("kyle", kyle.transform.position);
            let kyle1 = desert.getChildByName("RobotKyle (1)");
            // console.log("kyle1", kyle1.transform.position)
            let kyle2 = desert.getChildByName("RobotKyle (2)");
            // console.log("kyle2", kyle2.transform.position)
            let roboto = desert.getChildByName("Roboto");
            // console.log("roboto", roboto.transform.position)
            let wall1 = desert.getChildByName("wall").getChildByName("wall1");
            wall1.meshRenderer.receiveShadow = true;
            let wall2 = desert.getChildByName("wall").getChildByName("wall2");
            wall2.meshRenderer.castShadow = true;
            // 给wall1 增加材质
            Laya.Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/Assets/FightingUnityChan_FreeAsset/FightingUnityChan_FreeAsset/Models/UnityChanShader/Texture/hair_01.jpg", Laya.Handler.create(this, function (texture) {
                var customMaterial = new MultiplePassOutlineMaterial();
                customMaterial.albedoTexture = texture;
                customMaterial.outlineWidth = 1;
                customMaterial.outlineColor = new Laya.Vector4(1, 1, 1, 1);
                wall1.meshRenderer.sharedMaterial = customMaterial;
            }));
            Laya.Mesh.load("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm", Laya.Handler.create(this, function (mesh) {
                var layaMonkey = new Laya.MeshSprite3D(mesh);
                desert.addChild(layaMonkey);
                layaMonkey.transform.position = new Laya.Vector3(274.27136005859376, 0.3661185466766358, 32.73448944091797);
                // layaMonkey.transform.localScale = new Laya.Vector3(0.3, 0.3, 0.3);
                layaMonkey.transform.rotation = new Laya.Quaternion(0.7071068, 0, 0, -0.7071067);
                var customMaterial = new MultiplePassOutlineMaterial();
                //漫反射贴图
                Laya.Texture2D.load("res/threeDimen/skinModel/LayaMonkey2/Assets/LayaMonkey/diffuse.png", Laya.Handler.create(this, function (texture) {
                    customMaterial.albedoTexture = texture;
                }));
                layaMonkey.meshRenderer.sharedMaterial = customMaterial;
                // let rotation = new Laya.Vector3(0, 0.01, 0);
                // Laya.timer.frameLoop(1, this, function (): void {
                //     layaMonkey.transform.rotate(rotation, false);
                // });
            }));
        }
        morePlants(desert) {
            let plants = desert.getChildByName("Plants");
            let catcus03Outer = desert.getChildByName("Plants").getChildByName("cactus03_m");
            let oneCatcus03 = catcus03Outer.getChildByName("default");
            let onePos = oneCatcus03.transform.position;
            // 这里只能指定世界坐标
            let copy1 = Laya.Sprite3D.instantiate(oneCatcus03, catcus03Outer, false, new Laya.Vector3(1 + onePos.x, onePos.y, -1 + onePos.z));
            // console.log("oneCatcus03", oneCatcus03.transform.position, oneCatcus03.transform.localPosition)
            // console.log("copy1      ", copy1.transform.position, copy1.transform.localPosition)
            // console.log("catcus03", catcus03)
        }
        playerControl(desert) {
            let player = desert.getChildByName("unitychan");
            GameManager.Instance.role3D = player;
            console.log("player", player.transform.position);
            let playerRootMesh = player.getChildAt(1);
            for (let i = 0; i < playerRootMesh.numChildren; i++) {
                let oneMesh = playerRootMesh.getChildAt(i);
                oneMesh.skinnedMeshRenderer.castShadow = true;
            }
            Laya.stage.addChild(new JoyBoxUI());
            new VirtualJoy(new VirtualJoyUI());
            player.addComponent(RoleMoveScript);
            this._camera.addComponent(CameraFollowScript); // 因为follow 用到了 role3D 所有要等 player 准备好了之后才添加这个component
            // var customMaterial = new MultiplePassOutlineMaterial();
            // Laya.Texture2D.load("res/LayaScene_DesertScene_mobile/Conventional/Assets/Robot Kyle/Textures/Robot_Color.jpg", Laya.Handler.create(this, function (texture) {
            //     customMaterial.albedoTexture = texture;
            // }));
            // //设置材质
            // for (let i = 0; i < playerRootMesh.numChildren; i++) {
            //     let oneMesh = playerRootMesh.getChildAt(i) as Laya.SkinnedMeshSprite3D
            //     oneMesh.skinnedMeshRenderer.castShadow = true
            //     oneMesh.skinnedMeshRenderer.sharedMaterial = customMaterial;
            // }
        }
    }
    //# sourceMappingURL=GameScene.js.map

    class Main {
        constructor() {
            //根据IDE设置初始化引擎
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            //兼容微信不支持加载scene后缀场景
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
            // if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
            // if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
            // if (GameConfig.stat)
            Laya.enableDebugPanel();
            // Laya.Stat.show();
            Laya.alertGlobalError = true;
            //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            //加载IDE指定的场景
            // 下面加载的场景是 gameScene
            // 这个场景绑定的ts 是GameUI
            // 调用这个语句之后 GameUI 的 constructor 才会执行
            // GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
            new GameScene();
        }
    }
    //激活启动类
    new Main();
    // layaMaxUI ---> GameUI ---> GameConfig ----> Main

}());
//# sourceMappingURL=bundle.js.map
