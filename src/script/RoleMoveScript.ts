import Collision = Laya.Collision;
import ColliderShape = laya.d3.physics.shape.ColliderShape;
import GameManager from "./GameManager"
import Vector3 = Laya.Vector3;
export default class RoleMoveScript extends Laya.Script3D {
    protected player: Laya.Sprite3D;
    protected playerAnimator: Laya.Animator
    protected playerCollider: Laya.PhysicsCollider



    protected lastPos: Laya.Vector3

    constructor() {
        super();
    }
    /**
     * @inheritDoc
     */
    public onAwake(): void {
        this.player = this.owner as Laya.Sprite3D;
        if (this.player) {
            this.playerAnimator = this.player.getComponent(Laya.Animator)

            //https://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-4-16-5
            //插件目前暂不支持角色碰撞器导出，使用时需要使用代码创建。
            //然后导出后的player的 components 下面确实没有 capsuleCollider  只有rigidbody 和 js 还有就是 animator
            //this.playerCollider = this.player.getComponent(Laya.PhysicsCollider)
            //摩擦力
            // this.playerCollider.friction = 2;
            //物理碰撞体设置弹力
            // this.playerCollider.restitution = 0.3;


            var character: Laya.CharacterController = this.player.addComponent(Laya.CharacterController);
            var capsuleShape: Laya.CapsuleColliderShape = new Laya.CapsuleColliderShape(0.2516022, 1.598118, 1);
            //这里最后1 代表方向 static SHAPEORIENTATION_UPY: number = 1;
            capsuleShape.localOffset = new Laya.Vector3(0.0152, 0.7938, 0);
            character.colliderShape = capsuleShape;
            // 以上这段character 相关的代码  是控制人物能够站立在地面上


            let transform: Laya.Transform3D = this.player.transform;
            let playerPosition: Vector3 = transform.position;
            this.lastPos = playerPosition;


            const lookAtPoint1 = new Laya.Vector3(playerPosition
                .x  + 9.489044, transform.position.y, playerPosition.z - 4.87) //仙人掌
            const lookAtPoint2 = new Laya.Vector3(playerPosition.x + 19.35, 10.12411, playerPosition.z - 11.91) //岩石
            const lookAtPoint3 = new Laya.Vector3(274.0090026855469, transform.position.y, 34.65625)// KyleRobot

            const lookAtPoint31 = new Laya.Vector3(272.6490173339844, transform.position.y, 34.65625)// KyleRobot
            const lookAtPoint32 = new Laya.Vector3(271.239013671875, transform.position.y, 34.65625)// KyleRobot

            const lookAtPoint4 = new Laya.Vector3(playerPosition.x + 19.1, transform.position.y, playerPosition.z - 20.23) //Roboto
            let rotation: Laya.Quaternion = new Laya.Quaternion();
            setTimeout(() => {
                // this.player.transform.rotate(new Vector3(0, 180, 0), true, false)


                //不能正确指向目标
                // Laya.Quaternion.lookAt(transform.position, lookAtPoint32, new Laya.Vector3(0, 1, 0), rotation);
                // this.player.transform.localRotation = rotation;

                this.player.transform.lookAt(lookAtPoint32, new Laya.Vector3(0, 1, 0), false);
                let forward = new Vector3()
                this.player.transform.getForward(forward)
                console.log("for ward", forward)

                // this.player.transform.rotate(new Vector3(0, 180, 0), false, false);//中心对称取反一下
                console.log("pos", this.player.transform.position)
                let newPos = new Vector3();
                Vector3.add(transform.position, new Vector3(0.5 , 0, 0.5), newPos)
                this.player.transform.position = newPos
                this.lastPos = newPos
                console.log("pos", this.player.transform.position)
            }, 1500)


        }
    }

    /**
     * @inheritDoc
     */
    public onUpdate(): void {
        if (GameManager.Instance.sceneData.autoMoveDir != 9999) {

            let transform: Laya.Transform3D = this.player.transform;
            this.player.transform.position = this.lastPos;
            // console.log("new pos  1", transform.position.x - this.lastPos.x)
            // console.log("autoMoveDir", GameManager.Instance.sceneData.autoMoveDir)

            // 弧度 = (π × 角度) / 180
            // 角度 = (180×弧度) / π
            // 弧度 - π  相当于角度 - 180
            // 注意 Math.cos(90 * Math.PI/180) 存在精度问题  结果是6.123031769111886e-17


            let rotateAngle: number = GameManager.Instance.sceneData.autoMoveDir * Math.PI / 180;
            let sz: number = Math.sin(rotateAngle); //
            let sx: number = Math.cos(rotateAngle); //

            //sinα=cos（π/2-α），cosα=sin（π/2-α），
            //sin(x+π) = -sin(x)
            let szl: number = Math.sin(rotateAngle - Math.PI); //这是demo 中做法...取反(- Math.PI) 原因在方法2 中有说明
            let sxl: number = -Math.cos(rotateAngle - Math.PI);
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

            let rotation: Laya.Quaternion = new Laya.Quaternion();

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
            Vector3.add(transform.position, new Vector3(sx/10, 0, sz/10) ,newPos)
            // console.log("new pos  3", newPos.x - this.lastPos.x)
            // this.player.transform.position = newPos
            this.player.transform.translate(new Vector3(sx / 10, 0, sz / 10), true)
            this.lastPos = newPos



            this.playerAnimator.play("Run")
        } else {
            if (this.playerAnimator) {
                this.playerAnimator.play("Idle")

            }
        }

        //如果动画名字弄错的话 会有  Cannot read property '_clip' of undefined 的报错
    }

    public onCollisionEnter(collision: Collision): void {
        // console.log("player collision", collision)
    }
}

// 另外有个帖子也说道了朝向这个问题
// https://ask.layabox.com/question/38719