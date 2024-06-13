const {ccclass, property} = cc._decorator;

@ccclass
export default class Loader extends cc.Component {
    private resources: {} = undefined;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.resources.loadDir('card', cc.SpriteFrame, (err: Error, assets: cc.Asset[]) => this.resources = this._getResourcesMap(assets));

    };

    start () {
        let infos = cc.resources.getDirWithPath('card', cc.SpriteFrame);
        let paths = infos.map((info) => info.path);
        let res = {};

        // console.log(paths);

    };

    private _getResourcesMap(assets: cc.Asset[]): {}{
        let map = {};
        assets.forEach((asset) => map[asset.name] = asset);
        return map;
    };

    // update (dt) {}
}
