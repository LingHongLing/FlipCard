const {ccclass, property} = cc._decorator;

@ccclass
export default class StateMachine {
    private _nextState: any;
    private _currentState: any;
    private _stateFuncs: {};

    constructor(){
        this._nextState = null;
        this._currentState = null;
        this._stateFuncs = {};
    };

    addState(state: any, func: Function){
        this._stateFuncs[state] = func;
    };

    transfer(state: any){
        this._nextState = state;
    };

    update(dt: Number){
        let isNextState = this._nextState != null;
        if (isNextState) {
            this._currentState = this._nextState;
            this._nextState = null;
        };

        let func = this._stateFuncs[this._currentState];
        if (func)
            // 有下一个 state == 第一次进入该阶段的函数
            func(isNextState);
    };
}
