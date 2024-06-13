import CardView from "./CardView";

const {ccclass, property} = cc._decorator;
const HINT_TEXTS = {
    CHOSEN: "請選牌",
    WRONG: "答錯",
    WRIGHT: "答對",
    CLEAR: "恭喜過關"
};

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Label)
    hintLabel: cc.Label = null;

    @property(cc.Label)
    wrightLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Layout)
    cardView: cc.Layout = null;

    @property(cc.Button)
    resetButton: cc.Button = null;

    private _cardView: CardView;
    private _gameTime: number;

    start(){
        this._cardView = this.cardView.getComponent(CardView);
        this._cardView.setEventDispatcher(this._onEventListener.bind(this));
        this.resetButton.node.on("click", this._resetGame.bind(this));
    }

    private _updateTime(){
        this._gameTime += 1;
        this._setTimeText(this._gameTime);
    };

    private _onEventListener(event: any){
        if (event == this._cardView.EVENT.READY){
            this._resetGame();
        }else if (event == this._cardView.EVENT.CHOSEN_WRONG){
            this._setHintText(HINT_TEXTS.WRONG);
        }else if (event == this._cardView.EVENT.CHOSEN_WRIGHT) {
            this._setHintText(HINT_TEXTS.WRIGHT);
            this._setWrightLabel(this._cardView.getRightAmount());
            if (this._cardView.isClear()){
                this.unschedule(this._updateTime);
                this.scheduleOnce(() => this._setHintText(HINT_TEXTS.CLEAR), 1);
            };
        };
    };

    private _resetGame(){
        this._gameTime = 0;
        this.unschedule(this._updateTime)
        this.schedule(this._updateTime, 1);
        this._cardView.initGame();
        this._setHintText(HINT_TEXTS.CHOSEN);
        this._setWrightLabel(0);
        this._setTimeText(0);
    };

    private _setTimeText(time: number){
        let minute = Math.floor(time / 60).toString();
        let sec = (time % 60).toString();
        sec = sec.length == 1? "0" + sec: sec;
        this.timeLabel.string = minute + ':' + sec;
    };

    private _setHintText(text: string){
        this.hintLabel.string = text;
    };

    private _setWrightLabel(amount: number){
        this.wrightLabel.string = "正確:" + amount;
    };
}
