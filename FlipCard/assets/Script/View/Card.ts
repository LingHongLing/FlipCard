import SpriteFrameLoader from "../Common/SpriteFrameLoader";

const {ccclass, property} = cc._decorator;

const FLIP_TIME = 0.1;
const WIN_SHAKE_TIME = 0.2;
const WIN_SCALE_TIME = 0.3;
const CARD_PATH_PREFIX = "card_";
const CARD_BACK_KEY = "back";

@ccclass
export default class Card extends cc.Component {
    private _isFront: Boolean = false;
    private _spriteFrameLoader: SpriteFrameLoader;
    private _sprite: cc.Sprite;
    private _button: cc.Button;
    private _index: number;
    private _cardType: any;
    private _onClickCallback: Function;
    private _clickEvent: cc.Component.EventHandler;

    start(){
        this._sprite = this.node.addComponent(cc.Sprite);
        this._button = this.node.addComponent(cc.Button);
        this._clickEvent = this._createClickEvent();
        this.init();
    };

    init(){
        this.node.scale = 1;
        this._setFront(false);
        this.setTouchEnabled(false);
    };

    isFront(): Boolean{
        return this._isFront;
    };

    setTouchEnabled(isEnabled: Boolean){
        if (isEnabled)
            this._button.clickEvents.push(this._clickEvent);
        else
            this._button.clickEvents.pop();
    };

    setSpriteFrameLoader(spriteFrameLoader: SpriteFrameLoader){
        this._spriteFrameLoader = spriteFrameLoader;
    };

    setClickCallback(onClickCallback: Function){
        this._onClickCallback = onClickCallback;
    };

    setCardType(type: any){
        this._cardType = type;
    };

    setCardIndex(index: any){
        this._index = index;
    };

    getCardType(): any{
        return this._cardType;
    };

    flipCardAnim(callback: Function){
        cc.tween(this.node)
        .to(FLIP_TIME, {scaleX: 0})
        .call(() => this._setFront(!this.isFront()))
        .to(FLIP_TIME, {scaleX: 1})
        .call(() => callback(this._index))
        .start();
    };

    wrightAnim(callback: Function){
        cc.tween(this.node)
        .to(WIN_SHAKE_TIME, {scale: 1.2})
        .to(WIN_SHAKE_TIME, {scale: 1})
        .to(WIN_SHAKE_TIME, {scale: 1.2})
        .to(WIN_SCALE_TIME, {scale: 0})
        .call(() => callback())
        .start();
    };

    private _onClick(){
        this._onClickCallback(this._index);
    };

    private _registerClickEvent(){
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Card";
        clickEventHandler.handler = "_onClick";
    };

    private _createClickEvent(){
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "Card";
        clickEventHandler.handler = "_onClick";
        return clickEventHandler;
    };

    private _setFront(isFront: Boolean){
        this._isFront = isFront;
        let frameName = CARD_PATH_PREFIX + (isFront? this._cardType: CARD_BACK_KEY); 
        this._sprite.spriteFrame = this._spriteFrameLoader.getSpriteFrame(frameName);
    };
};