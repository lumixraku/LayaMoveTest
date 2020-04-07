# First Laya



Official Doc

[LayaAir2](http://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-0-0)

[examples](https://layaair.ldc.layabox.com/demo/?category=3d&group=Sprite3D&name=Sprite3DClone)

[高效配置指南](https://ldc2.layabox.com/doc/?nav=zh-js-3-0-9)

注意!

LayaAir2的文档是以   idc2 开头, 有时候搜索到的文档是idc开头, 这是1.0的API,  和2.0 差别很大.




## How to run?

在IDE中 `F8` to Compile 之后再Debug 运行才行

在命令行中
配置rollup.config.js 之后,  根目录下运行```rollup -cw```


PS:
静态资源都在bin 目录中



PS:
官方也提供命令行方式来compile,  不过我尝试失败了.

https://www.npmjs.com/package/layaair-cmd

https://ask.layabox.com/question/2099

上面两个都旧了 从npm官网上看 layaair2-cmd 是最新的





原因如下
1. 试图运行`layaair2-cmd compile`遇到了如下错误
```
env: node\r: No such file or directory
```

原因是windows 和 Unix 系的换行字符不同.  npm的作者应该是在windows 上开发的.





2. 又遇到了gulp里面报这个错误 `ReferenceError: primordials is not defined`
官方建议的node版本是 10
于是 `sudo n 10.19` 切换了版本



3. 之后gulp又遇到了这个

```
gulpInst.start.apply(gulpInst, toRun);
TypeError: Cannot read property 'apply' of undefined
```

stackoverflow 建议全局安装 gulp-cli




4. 之后可以运行`layaair2-cmd compile `了 不过提示 compile 不在 gulp 的task 中
虽然`gulp --tasks --gulpfile .laya/compile.js `列出的列表中有这个task
然后尝试
```
gulp compile --gulpfile .laya/compile.js
```
有个报错说无法解析非js的文件 报错在Main.ts 26行 不懂...







## 和 Egret 不同的地方

相比于egret 在 HTML 标签中设置dpr (Or 分辨率) 属性, Laya 的全部都在GameConfig.ts 中.
Egret 本身提供了一个编辑器来创建GameObject,
Laya 则是和Unity 结合, 在Unity 编辑好之后导出.




### 和Unity 不同的地方

[Laya3D](https://ask.layabox.com/question/1745)

Unity 是左手坐标系 而Laya 是右手坐标系

因此导出的坐标在y z 相同的情况下 x 是相反的





## With Unity

[plugin 文档](https://github.com/layabox/layaair-doc/tree/master/Chinese/LayaAir_TS/3D/beginners/unity_plugin)

[从Unity中导出模型](http://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-8-2)

文档中提到的3D插件下载方式已经不复存在 3D插件在下载IDE弹窗中有
https://ldc2.layabox.com/layadownload/?type=layaairide-LayaAir%20IDE%202.3.0


[导出踩坑](https://zhuanlan.zhihu.com/p/82067089)


支持的导出类型

Scene3D
Sprite3D
MeshSprite3D
SkinnedMeshSprite3D
ShuriKenParticle3D
Camera
DirectionLight
PointLight
TrailSprite3D

PS:
以上这些在 class Scene3DUtils 这个类有定义


### 资源文件

ls lh lm lav lmat 格式文件

ls s:scene 场景文件 (导出时要选择场景)

lh Sprite3D数据文件

lm m: mesh

lav av: avatar 在游戏世界中 avatar 表示骨骼动画

lmat mat:material

PS:
 lh导出的3D显示对象容器Spirte3D类型数据文件，JSON格式编码，是unity3D中layaAir导出插件选择导出 预设 类别生成，内容比*.ls格式少了光照贴图，其他全部相同。



更加更细的说明在 [Layadoc github](https://github.com/layabox/layaair-doc/blob/master/Chinese/LayaAir_JS/3D/beginners/model/readme.md)




## 动画

Unity part

不过下面的是 humanoid 类型的动画 Laya并不支持这个动画

0.从商店中找一个动画 (这个动画最好带有模型)

1.点一下animation，把右边rig页下的animation type改成humaniod

2.点一下模型model文件(fbx), 在rig tab 下 create avatar (create from this model)

3.在scene中选中人物, 创建一个(或者拖入animator) animation definition 选刚才给你人物创建的avatar




## 一些需要继续尝试的地方

[远近距离的裁剪](http://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-5-4)

[renderTexture](http://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-14-9) 讲的啥啊 是读取预先存储的图片么?? 语句都不通顺..

[向脚本传参](https://ask.layabox.com/question/4772) 现在用的是全局静态类的方式 zhikun是说addComponent返回值就是这个对象 试试看

[分离模式](https://ask.layabox.com/question/1399) 这种模式比较像egret 的 exml 形式

regClass 这是什么操作



`export module ui.game` 应该是在ES6的export 标准出现之前的模块划分方式



## camera

```

this.camera.transform.lookAt(role3D.transform.position, new Laya.Vector3(1, -1, 1));

后面这个向量可以控制摄像头的旋转  它表示摄像机的Y 方向

```



## 一些坑

### 导入场景文件后报 Cannot read property 'btCollisionObject' of undefined

lib里的laya.physics3D.js

Unity 中的player选了Collider 就一定要选RigidBody? 不然说phsycical 无法添加


###

场景中的所有shader 都要转为Laya 的shader

[踩坑](https://zhuanlan.zhihu.com/p/82067089)

Unity 的shader 不是标准的shader Laya 的shader 是glsl