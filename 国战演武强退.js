var modeId = 19; //19国战演武 20欢乐演武
var seatNum = modeId==20?4:8;//总人数
// 不在指定模式下先进入
if (modeId != GameContext.GetModeType() && SceneManager.GetInstance().CurrentScene.sceneName != 'HallScene') {
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQLOBBYJOIN, {
        modeID: modeId
    })
}
var count = 0; //执行次数
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
            "modeID": modeId,
            "passward": "sdfa",
            "seatModelType": 3
        })
        return;
    }
    if (SceneManager.GetInstance().CurrentScene.sceneName == 'TableScene') {
        if (GameContext.TabbleSeatInfos.count == seatNum) {
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

// TableGameScene 强退
SelectFunGeneralWindow.prototype.addEventListener = function () {
    SceneManager.GetInstance().CurrentScene.confirmQuitTbale();
    count++;
}
SelectCountryWarGeneralWindow.prototype.addEventListener = function () {
    SceneManager.GetInstance().CurrentScene.confirmQuitTbale();
    count++;
}

var formatDate = function (date) {  
    var y = date.getFullYear();  
    var m = date.getMonth() + 1;  
    m = m < 10 ? ('0' + m) : m;  
    var d = date.getDate();  
    d = d < 10 ? ('0' + d) : d;  
    var h = date.getHours();  
    var minute = date.getMinutes();  
    minute = minute < 10 ? ('0' + minute) : minute; 
    var second= date.getSeconds();  
    second = second < 10 ? ('0' + second) : second;  
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+ second;  
};
function show() {
    GameItemManager.GetInstance().ReqqueryCurrency();
    var success = GameItemManager.GetInstance().GetItemByID(200010).itemNum;
    var fail = GameItemManager.GetInstance().GetItemByID(200011).itemNum;
    console.info(formatDate(new Date())+" 执行次数:"+count+" 胜利箱子个数:" + success + " 失败箱子个数:" + fail);
}
show();
var showInterval = setInterval(show, 10000);
