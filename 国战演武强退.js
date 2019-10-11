var startInterval = setInterval(function () {
    if (SceneManager.GetInstance().CurrentScene.sceneName == 'HallScene') {
        // 开始国战
        RoomControler.GetInstance().SendCreateTable({
            "canLookOn": true,
            "cardOutTime": 15,
            "generalIDs": [],
            "isCompetition": false,
            "isDoubleMole": false,
            "isForbiddenChat": false,
            "isForbiddenUseItem": false,
            "minEscapeRate": 0,
            "minJoinLevel": 0,
            "modeID": 19,
            "passward": "sdfa",
            "seatModelType": 3,
            "tableName": "国战演武"
        })
        return;
    }
    if (SceneManager.GetInstance().CurrentScene.sceneName == 'TableScene') {
        if (GameContext.TabbleSeatInfos.count == 8) {
            // 开始
            SceneManager.GetInstance().CurrentScene.startHandler();
        } else {
            // 添加小杀
            SceneManager.GetInstance().CurrentScene.addAiHandler();
        }
    }
}, 200)

// 停止下一局
// clearInterval(startInterval);
SelectCountryWarGeneralWindow.prototype.addEventListener = function () {
    // TableGameScene 强退
    SceneManager.GetInstance().CurrentScene.confirmQuitTbale();
}

var success = GameItemManager.GetInstance().GetItemByID(200010).itemNum;
var fail = GameItemManager.GetInstance().GetItemByID(200011).itemNum;
console.info("胜利箱子个数:"+success+" 失败箱子个数:"+fail);
