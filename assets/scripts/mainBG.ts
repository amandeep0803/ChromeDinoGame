
import { _decorator, Component, Node, Prefab, instantiate, UITransform, tween, Vec3, input, Input, EventKeyboard, KeyCode, Animation, Sprite, SpriteFrame, TweenSystem, EditBox, easing, director, PhysicsSystem2D, Collider2D, Intersection2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mainBG')
export class mainBG extends Component {

    @property({type:Prefab})
    ground:Prefab
    @property({type:Prefab})
    dino:Prefab
    @property({type:SpriteFrame})
    dinoJump:SpriteFrame
    @property({type:SpriteFrame})
    dinoDead:SpriteFrame
    @property({type:Prefab})
    gameOver:Prefab
    @property({ type: [Prefab]})
    smallCactus = [];
    @property({type:[Prefab]})
    largeCactus=[];
    unused:any=[];
    used:any=[];
    dinoGroundPosition:number;
    groundWidth:number;
    groundHeight:number;
    mainBGWidth:number;
    mainBGHeight:number;
    flag:boolean=false;
    running:boolean=false;
    jumping:boolean=false;
    jumpingTween:any;
    score:number=0;
    speed:number=20;
    speedFlag:number=0;
    scheduler:boolean=true;
    start () {
        let currGroundChild=instantiate(this.ground);
        let nextGroundChild=instantiate(this.ground);
        let dinoChild=instantiate(this.dino);
        let dinoChildHeight=this.dino.data.height;
        let dinoChildWidth=this.dino.data.width;
        this.node.addChild(dinoChild);
        this.node.addChild(currGroundChild);
        this.node.addChild(nextGroundChild);
        this.groundWidth=this.ground.data.width;
        this.groundHeight=this.ground.data.height;
        this.mainBGWidth=this.node.getComponent(UITransform).width;
        this.mainBGHeight=this.node.getComponent(UITransform).height;
        dinoChild.name='dinoChild';
        dinoChild.setPosition(dinoChildWidth-this.mainBGWidth*0.5,dinoChildHeight*0.5+5,0)
        this.dinoGroundPosition=dinoChildHeight*0.5+5;
        currGroundChild.name='currChild'
        nextGroundChild.name='nextChild';
        currGroundChild.setPosition(this.groundWidth*0.5-this.mainBGWidth*0.5,0,0);
        nextGroundChild.setPosition(this.groundWidth*1.5-this.mainBGWidth*0.5,0,0);
        input.on(Input.EventType.KEY_DOWN,this.keyDown,this);
        input.on(Input.EventType.KEY_UP,this.keyUp,this);
        input.on(Input.EventType.KEY_PRESSING,this.keyPressing,this);
        this.jumpingTween=tween(this.node.getChildByName('dinoChild'))
                            .by(0.25,{position:new Vec3(0,300,0)},{easing:'smooth'})
                            .by(0.25 ,{position:new Vec3(0,-300,0)})
        this.node.getChildByName('score').getComponent(EditBox).enabled=false;
        for(let i=0;i<this.smallCactus.length;i++){
            let temp:Node=instantiate(this.smallCactus[i]);
            this.node.addChild(temp);
            temp.name=i+'';
            temp.setPosition(this.mainBGWidth/2+this.smallCactus[i].data.width,this.smallCactus[i].data.height/2,0);
            this.unused.push(temp);
        }
        for(let i=0;i<this.largeCactus.length;i++){
            let temp=instantiate(this.largeCactus[i]);
            this.node.addChild(temp)
            temp.name=3+i+'';
            temp.setPosition(this.mainBGWidth/2+this.largeCactus[i].data.width,this.largeCactus[i].data.height/2,0);
            this.unused.push(temp);
        }
        
    }
    generateCactusNode(){
        console.log(this.unused);
        let cactusNumber=Math.floor(Math.random()*this.unused.length);
        let cactusNode=this.unused.splice(cactusNumber,1);
        this.used.push(...cactusNode);
        console.log(this.used);
    }
    keyDown(event:EventKeyboard){
        switch(event.keyCode){
            case KeyCode.SPACE:
                if(!this.flag){
                    this.flag=true;
                    this.changeAnimation();
                }
                else if(this.flag){
                    this.jumpAnimation();
                }
                break;
            case KeyCode.ARROW_DOWN:
                if(this.flag){
                    let animationComponent=this.node.getChildByName('dinoChild').getComponent(Animation);
                    let currPosition=this.node.getChildByName('dinoChild').position;
                    if(!this.jumping){
                        this.node.getChildByName('dinoChild').getComponent(UITransform).height=80;
                        this.node.getChildByName('dinoChild').setPosition(currPosition.x,this.dinoGroundPosition-10,0)
                        animationComponent.play(animationComponent.clips[1].name);
                    }
                }
                break;
        }
    }
    keyUp(event:EventKeyboard){
        if(this.flag){
            let currPosition=this.node.getChildByName('dinoChild').position;
            let animationComponent=this.node.getChildByName('dinoChild').getComponent(Animation);
            if(event.keyCode==KeyCode.ARROW_DOWN){
                this.node.getChildByName('dinoChild').getComponent(UITransform).height=100;
                this.node.getChildByName('dinoChild').setPosition(currPosition.x,this.dinoGroundPosition,0)
                animationComponent.stop();
                animationComponent.play(animationComponent.clips[0].name);
            }
        }
    }
    keyPressing(event:EventKeyboard){
        switch(event.keyCode){
            case KeyCode.SPACE:
                this.jumpAnimation();
                break;
        }
    }
    jumpAnimation(){
        let dinoChild=this.node.getChildByName('dinoChild');
        dinoChild.getComponent(Animation).stop();
        dinoChild.getComponent(Sprite).spriteFrame=this.dinoJump;
        if(!this.jumping){
            this.jumping=true;
            this.jumpingTween
                .call(()=>{
                    this.jumping=false;
                    dinoChild.getComponent(Animation).play(dinoChild.getComponent(Animation).clips[0].name);
                })
                .start();
        }
    }
    changeAnimation(){
        if(!this.running){
            this.running=true;
            let animationComponent=this.node.getChildByName('dinoChild').getComponent(Animation);
            animationComponent.play(animationComponent.clips[0].name);
        }
    }
    collisionCheck(colider1 : Node , colider2 : Node ) : boolean
    {
        if(colider1 != undefined || colider2 != undefined)
        {
            var colide : boolean = Intersection2D.rectRect( colider1.getComponent(UITransform)?.getBoundingBoxToWorld(),colider2.getComponent(UITransform)?.getBoundingBoxToWorld());
            return colide;
        }
    }
    onGameOver(){
        this.flag=false;
        this.jumpingTween.stop();
        let dinoChild=this.node.getChildByName('dinoChild');
        dinoChild.getComponent(Animation).stop();
        let temp=instantiate(this.gameOver);
        this.node.addChild(temp);
        temp.setPosition(0,250,0);
        input.off(Input.EventType.KEY_DOWN,this.keyDown,this);
        input.off(Input.EventType.KEY_UP,this.keyUp,this);
        input.off(Input.EventType.KEY_PRESSING,this.keyPressing,this);
        input.on(Input.EventType.KEY_DOWN,this.reloadScene,this);
        this.unschedule(this.generateCactusNode);
    }
    reloadScene(){
        director.loadScene('scene-2d');
    }
    update(deltaTime: number){
        if(this.flag){
            if(this.scheduler){
                this.scheduler=false;
                this.schedule(this.generateCactusNode,1.5-this.speed/35);
            }
            let scoreEditBox=this.node.getChildByName('score');
            this.score+=(this.speed/100);
            this.speedFlag+=(this.speed/100);
            scoreEditBox.getComponent(EditBox).string=Math.floor(this.score)+"";
            if(this.speedFlag>=100){
                this.speed+=2;
                this.speedFlag=0;
                console.log(this.speed);
                this.unschedule(this.generateCactusNode);
                this.schedule(this.generateCactusNode,1.5-this.speed/35);
            }
            let dinoChild=this.node.getChildByName('dinoChild');
            let currChild:any=this.node.getChildByName('currChild');
            let nextChild:any=this.node.getChildByName('nextChild');
            let addChildThreshold = this.mainBGWidth*0.5-this.groundWidth*0.5;
            if(nextChild.position.x<=-addChildThreshold){
                nextChild.name='currChild';
                currChild.name='nextChild';
                currChild.setPosition(this.groundWidth*1.5-this.mainBGWidth*0.5,0,0)
            }
            else{
                currChild.setPosition(currChild.position.x-this.speed,0,0);
                nextChild.setPosition(nextChild.position.x-this.speed,0,0);
            }
            for(let i=0;i<this.used.length;i++){
                this.used[i].setPosition(this.used[i].position.x-this.speed,this.used[i].getComponent(UITransform).height/2,0);
            }
            if(this.used.length>0){
                if(this.used[0].getComponent(UITransform).getBoundingBoxToWorld().x<=-this.used[0].getComponent(UITransform).width){
                    let unusedNode=this.used.shift();
                    unusedNode.setPosition(this.mainBGWidth/2+unusedNode.getComponent(UITransform).width,unusedNode.getComponent(UITransform).height/2,0)
                    this.unused.push(unusedNode);
                }
            }
            for(let i=0;i<6;i++){
                if(this.collisionCheck(dinoChild.getChildByName('collider'),this.node.getChildByName(i+''))){
                    this.onGameOver();
                    break;
                }
            }
        }
    }
}