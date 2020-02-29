import GameManager from "../script/GameManager";
export { JoyBoxUI, VirtualJoyUI, VirtualJoy }


class JoyBoxUI extends Laya.View {
    public txtRoleName: Laya.Label;
    public joyUI: VirtualJoyUI;
    public static uiView: any = {
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
    constructor() {
        super()
    }
    createChildren(): void {
        Laya.View.regComponent("VirtualJoyUI", VirtualJoyUI);

        super.createChildren();
        this.createView(JoyBoxUI.uiView);

    }
}


class VirtualJoyUI extends Laya.View {
    public virtual: Laya.Image;
    public ball: Laya.Image;

    public static uiView: any = {
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
    constructor() { super() }
    createChildren(): void {

        super.createChildren();
        this.createView(VirtualJoyUI.uiView);

    }

}

class VirtualJoy {

    private circleRadius: number = 0;
    private ballRadius: number = 0;
    private centerX: number = 0;
    private centerY: number = 0;
    private touchID: number;
    private p1: Laya.Point = new Laya.Point();
    private startMove: boolean = false;
    private _start: boolean = false;
    private _skin: VirtualJoyUI;

    constructor(skin: VirtualJoyUI) {
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

    public start() {
        if (this._start)
            return;
        if (this._skin.parent == null) {
            let container: Laya.Sprite = GameManager.Instance.baseLayer.mainLayer;
            container.addChild(this._skin);
        }
        this._skin.visible = false;

        let root: Laya.Sprite = Laya.stage;
        root.on(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
        this._start = true;

    }
    public stop() {
        this._start = false;
        this.clearMove();
        let root: Laya.Sprite = Laya.stage;
        root.off(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
    }


    private onTouchBegin(e: Laya.Event): void {
        // if(!(e.target instanceof egret.Stage)) return;
        if (!this._skin) {
            return;
        }
        // this._skin.x this._skin.y 对应中心位置
        //因为有设置pivot 轴心点的位置是处于图片的center center
        this._skin.x = e.stageX;
        this._skin.y = e.stageY;

        if (this._skin.parent == null) {
            let container: Laya.Sprite = GameManager.Instance.baseLayer.mainLayer;
            container.addChild(this._skin);

        }
        this._skin.visible = true;
        this._skin.ball.x = this.centerX;
        this._skin.ball.y = this.centerY;
        this.p1.x = this._skin.x;
        this.p1.y = this._skin.y;

        let root: Laya.Sprite = Laya.stage;


        // 鼠标左键
        root.off(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
        root.on(Laya.Event.MOUSE_UP, this, this.onTouchEnd);
        root.on(Laya.Event.MOUSE_MOVE, this, this.onTouchMove);

        // this._skin.visible = false;

    }

    private onTouchEnd(e: Laya.Event): void {
        // if(this.touchID != e.touchPointID){
        // 	return;
        // }
        let root: Laya.Sprite = Laya.stage;

        root.on(Laya.Event.MOUSE_DOWN, this, this.onTouchBegin);
        this._skin.ball.x = this.centerX; // ball 这个相对位置是父容器的左上角
        this._skin.ball.y = this.centerY;
        this.clearMove();
    }
    private onTouchMove(e: Laya.Event): void {
        // if(this.touchID != e.touchPointID){
        // 	return;
        // }

        e.stopPropagation();
        if (!this._skin) {
            return;
        }
        let p2: Laya.Point = new Laya.Point(e.stageX, e.stageY);

        // Math.atan2()函数返回点(x,y)和原点(0,0)之间直线的倾斜角，弧度值
        // 表示斜线和 x=x 这条线(垂直方向的)的夹角

        // 弧度 = (π × 角度) / 180
        // 角度 = (180×弧度) / π
        let angle: number = Math.atan2(p2.y - this.p1.y, p2.x - this.p1.x);

        // JOY Stick 的偏移
        let dist = Math.sqrt((this.p1.x - p2.x) * (this.p1.x - p2.x) + (this.p1.y - p2.y) * (this.p1.y - p2.y));
        let bx: number, by: number; //ball 相对于父容器左上角的偏移

        // 拖动距离在圆圈内的时候
        if (dist <= (this.circleRadius - this.ballRadius)) {
            this._skin.ball.x = bx = this.centerX + p2.x - this._skin.x; //似乎用 this.p1也可以
            this._skin.ball.y = by = this.centerY + p2.y - this._skin.y;
        } else {
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
        let dir: number = this.orientation(bx, by, this.centerX, this.centerY);
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


    public orientation(ballx: number, bally: number, centerx: number, centery: number): number {
        var dx: number = ballx - centerx ;
        var dy: number = -(bally - centery) ;

        // 这里的计算应该以 centerx centery 为圆心
        // 注意2D世界中的坐标系是左上角 0,0   越往下y越大
        // console.log("dx  dy", dx, dy)
        var r: number = Math.atan2(dx, dy) * 180 / Math.PI;  //根据弧度计算角度
        return r;
    }
    private clearMove(): void {
        //	TestGB.Instance.moveByVirtual(-1);
        this.moveByVirtual(9999);
        if (this._skin.parent) {
            this._skin.parent.removeChild(this._skin);
        }
        let root: Laya.Sprite = Laya.stage;

        root.off(Laya.Event.MOUSE_UP, this, this.onTouchEnd);
        root.off(Laya.Event.MOUSE_MOVE, this, this.onTouchMove);
    }

    public moveByVirtual(value: number): void {
        if (GameManager.Instance.sceneData.autoMoveDir != value) {
            // DataManager.Instance.sceneData.sendNotification(constants.E_DATA_NOTIFY_UIVIEW.VIRTUAL_MOVE,value);
            GameManager.Instance.sceneData.autoMoveDir = value;
        }

    }

}