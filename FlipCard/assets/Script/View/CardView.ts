import Config from "../Common/Config";
import StateMachine from "../Common/StateMachine";
import SpriteFrameLoader from "../Common/SpriteFrameLoader";
import Card from "./Card";

const {ccclass, property} = cc._decorator;
const LAYOUT_CELL_SIZE = cc.size(50, 80);
const SPRITE_FRAME_FOLDER_PATH = 'card';
const EVENT = {
    READY: "READY",
    CHOSEN_WRIGHT: "CHOSEN_WRIGHT",
    CHOSEN_WRONG: "CHOSEN_WRONG",
};

const enum VIEW_STATE {
    LOADING,
    INIT_VIEW,
    INIT_GAME,
    WAIT_CHOSEN,
    CHECK_CHOSEN,
    CHOSEN_WRONG,
    CHOSEN_WRIGHT,
};

@ccclass
export default class CardView extends cc.Component {
    readonly EVENT = EVENT;
    private _stateMachine: StateMachine;
    private _spriteFrameLoader: SpriteFrameLoader;
    private _cards: Card[];
    private _chosenCards: Card[];
    private _cardAmount: number;
    private _rightAmount: number;
    private _eventDispatcher: Function;

    start(){
        let gridAmount = Config.COL_AMOUNT * Config.ROW_AMOUNT;
        this._cardAmount = gridAmount - gridAmount % Config.CARD_SAME_AMOUNT;
        this._stateMachine = this._createStateMachine();
        this._spriteFrameLoader = new SpriteFrameLoader(SPRITE_FRAME_FOLDER_PATH);
        this._stateMachine.transfer(VIEW_STATE.LOADING);
    };

    onDestroy(){
        this._spriteFrameLoader.realease();
    };

    update(dt: number){
        this._stateMachine.update(dt);
    };

    setEventDispatcher(eventDispatcher: Function){
        this._eventDispatcher = eventDispatcher;
    };

    getRightAmount(): number{
        return this._rightAmount;
    };

    initGame(){
        this._stateMachine.transfer(VIEW_STATE.INIT_GAME);
    };

    isClear(): Boolean{
        return this.getRightAmount() == (this._cardAmount / Config.CARD_SAME_AMOUNT);
    };

    private _onLoadingState(isFirstExec: Boolean){
        if (isFirstExec) {
            this._spriteFrameLoader.start();
            return;
        };

        if (this._spriteFrameLoader.isCompelete())
            this._stateMachine.transfer(VIEW_STATE.INIT_VIEW);
    };

    private _onInitViewState(isFirstExec: Boolean){
        this._resizeLayout();
        this._cards = this._createCards();
        this._eventDispatcher(EVENT.READY);
    };

    private _onInitGameState(isFirstExec: Boolean){
        if (!isFirstExec)
            return;

        let ramdomCards = this._getRandomCards();
        this._cards.forEach((card, idx) => {
            card.init();
            card.setCardType(ramdomCards[idx])
        });
        this._rightAmount = 0;
        this._stateMachine.transfer(VIEW_STATE.WAIT_CHOSEN);
    };

    private _onWaitChoenState(isFirstExec: Boolean){
        if (!isFirstExec)
            return;

        this._chosenCards = [];
        this._setCardsTouchEnabled(true);
    };

    private _onCheckChosenState(isFirstExec: Boolean){
        this._setCardsTouchEnabled(false);
        this._stateMachine.transfer(this._isChosenCardsSame()? VIEW_STATE.CHOSEN_WRIGHT: VIEW_STATE.CHOSEN_WRONG);
    };

    private _onChosenWrongState(isFirstExec: Boolean){
        if (!isFirstExec)
            return;

        let completeCount = Config.CARD_SAME_AMOUNT;
        let onComplete = () => {
            completeCount -= 1;
            if (completeCount > 0)
                return;

            this._stateMachine.transfer(VIEW_STATE.WAIT_CHOSEN);
            this._eventDispatcher(EVENT.CHOSEN_WRONG);
        };
        // TODO 翻错动画先翻回來就好
        this._chosenCards.forEach((card) => card.flipCardAnim(onComplete));
    };

    private _onChosenWrightState(isFirstExec: Boolean){
        if (!isFirstExec)
            return;

        let completeCount = Config.CARD_SAME_AMOUNT;
        let onComplete = () => {
            completeCount -= 1;
            if (completeCount > 0)
                return;

            this._rightAmount += 1;
            this._stateMachine.transfer(VIEW_STATE.WAIT_CHOSEN);
            this._eventDispatcher(EVENT.CHOSEN_WRIGHT);
        };

        this._chosenCards.forEach((card) => card.wrightAnim(onComplete));
    };

    private _setCardsTouchEnabled(isEnabled: Boolean){
        this._cards.forEach((card) => card.setTouchEnabled(isEnabled));
    };

    private _onCardClick(cardIndex: number){
        // console.log("_onCardClick")
        this._cards[cardIndex].flipCardAnim(this._onCardFlipComplete.bind(this));
    };

    private _onCardFlipComplete(cardIndex: number){
        let card = this._cards[cardIndex];
        // 卡牌不是正面就删除资料
        if (!card.isFront()){
            let removeIdx = this._chosenCards.indexOf(card);
            if (removeIdx > -1)
                this._chosenCards.splice(removeIdx);
            return;
        };

        this._chosenCards.push(card);
        // 选了 Config.CARD_SAME_AMOUNT 张进入比对阶段
        if (this._chosenCards.length == Config.CARD_SAME_AMOUNT)
            this._stateMachine.transfer(VIEW_STATE.CHECK_CHOSEN);
    };

    private _isChosenCardsSame(): Boolean{
        let cardType = this._chosenCards[0].getCardType();
        for (let i = 0; i < Config.CARD_SAME_AMOUNT; i++)
            if (cardType != this._chosenCards[i].getCardType())
                return false;
        return true;
    };

    private _resizeLayout(){
        let layout = this.node.getComponent(cc.Layout);
        this.node.getComponent(cc.Layout).cellSize = LAYOUT_CELL_SIZE;
        this.node.setContentSize(
            (LAYOUT_CELL_SIZE.width + layout.spacingX) * Config.COL_AMOUNT,
            (LAYOUT_CELL_SIZE.height + layout.spacingY) * Config.COL_AMOUNT
        );
    };

    private _getRandomCards(): number[]{
        let cards = [];
        for (let i = 0; i < this._cardAmount; i++)
            // 图片索引从 1 开始
            cards[i] = Math.floor(i / Config.CARD_SAME_AMOUNT) + 1;

        // 随机打乱
        cards.sort(() => 0.5 - Math.random());
        return cards;
    };

    private _createCards(){
        let cards = [];
        for (let i = 0; i < this._cardAmount; i++)
            cards[i] = this._createCard(i);
        return cards;
    };

    private _createCard(index: number): Card{
        let node = new cc.Node("card" + index.toString());
        let card = node.addComponent(Card);
        card.setCardIndex(index);
        card.setSpriteFrameLoader(this._spriteFrameLoader);
        card.setClickCallback(this._onCardClick.bind(this));
        this.node.addChild(node);
        return card;
    };

    private _createStateMachine(): StateMachine{
        let stateMachine = new StateMachine();
        stateMachine.addState(VIEW_STATE.LOADING, this._onLoadingState.bind(this));
        stateMachine.addState(VIEW_STATE.INIT_VIEW, this._onInitViewState.bind(this));
        stateMachine.addState(VIEW_STATE.INIT_GAME, this._onInitGameState.bind(this));
        stateMachine.addState(VIEW_STATE.WAIT_CHOSEN, this._onWaitChoenState.bind(this));
        stateMachine.addState(VIEW_STATE.CHECK_CHOSEN, this._onCheckChosenState.bind(this));
        stateMachine.addState(VIEW_STATE.CHOSEN_WRONG, this._onChosenWrongState.bind(this));
        stateMachine.addState(VIEW_STATE.CHOSEN_WRIGHT, this._onChosenWrightState.bind(this));

        return stateMachine;
    };
};