export default class SpriteFrameLoader{
    private _resources: {};
    private _isCompelete: Boolean;
    private _folderPath: string;

    constructor(path: string){
        this._folderPath = path;
        this._isCompelete = false;
        this._resources = {};
    };

    getSpriteFrame(key: string): cc.SpriteFrame{
        return this._resources[key];
    };

    start(){
        let onLoadComplete = (err: Error, assets: cc.Asset[]) => {
            this._isCompelete = true;
            this._resources = this._getResourcesMap(assets);
        };

        cc.resources.loadDir(this._folderPath, cc.SpriteFrame, onLoadComplete);
    };

    realease(){
        for (let [key, res] of Object.entries(this._resources))
            cc.assetManager.releaseAsset(res as cc.Asset);
    };

    isCompelete(): Boolean{
        return this._isCompelete;
    };

    private _getResourcesMap(assets: cc.Asset[]): {}{
        let map = {};
        assets.forEach((asset) => map[asset.name] = asset);
        return map;
    };
};