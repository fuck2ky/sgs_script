console.log = function (...data) {
    // 过滤一些日志
    var filterIds = [
        1843119829,//cmsg.CNotifyChatMessage 聊天消息
        1259047180,//cmsg.CNotifyGuildGameStatus
        2351489107
    ]
    if (data.length > 2) {
        for (var id in filterIds) {
            if (data[1].indexOf(id) > -1) {
                return
            }
        }
    }
    console.info(...data)
    // console.trace()
}

ProtoProxy.GetInstance().SendProto = function (t, e) {
    var n = new ProtoVO;
    n.protoID = t,
    n.protoData = e,
    console.info("%o", "--------[SendProto][  Sent  ] ID:" + n.protoID + " name:" + n.ProtoName + " detail:", n.protoData)
    // console.trace()
    ProtoProxy.GetInstance().SendProtocol(n)
}

// 签到
DailySignManager.GetInstance().ReqGetSignInReward(1, DailySignManager.GetInstance().initSignDate);

// 公会敲鼓3次
for (var i = 0; i < 3; i++) {
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGUILDBEATTHEDRUMS, {
        gold: 0
    })
}

// 领取公会任务奖励
var taskIDList = [401, 402, 403];
for (var taskID of taskIDList) {
    console.log(taskID)
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGETTASKREWARD, {
        taskID: taskID,
        itemID: []
    })
}

// 每日免费抽取一次将印
ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGENERALSEALCHESTOPEN, { type: 1 })

// 每日免费秀坊
ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQDRESSOPEN, {})

// 领取活跃值
for (var taskID = 1101; taskID < 1120; taskID++) {
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGETTASKREWARD, {
        taskID: taskID,
        itemID: []
    })
}

// 领取活跃奖励
var taskIDList = [1001, 1002, 1003, 1004]
for (taskID of taskIDList) {
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGETTASKREWARD, {
        taskID: taskID,
        itemID: []
    })
}

// 领取工会战奖励
GameGuildManager.GetInstance().ReqGuildBattleUserWinTimesReward();


// 领取将灵聚宝盆和出征奖励
var CornucopiaElfInfo = GeneralElfManager.GetInstance().CornucopiaElfInfo;
var pkID = CornucopiaElfInfo.pkID;
var cornucopiaCount = CornucopiaElfInfo.cornucopiaCount;
ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGENERALSPRITECORNUCOPIA, {
    pkID: pkID,
    count: cornucopiaCount
})
ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQGENERALSPRITETASKREWARDGET, {
    pkID: pkID
})
