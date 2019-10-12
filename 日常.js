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
