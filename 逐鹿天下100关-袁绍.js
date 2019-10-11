// 设置必然触发技能及取消
TableGameManager.prototype.onTriggerSpell = function (t, e) {
    this.selfSeatUI && this.selfSeatUI.off(SeatEvent.SWAPSEAT_COMPLETE, this, this.onTriggerSpell),
        e.UpdateCountdownTimer(t.TimeOut),
        e.TriggerSpellMulti(t, this.GetSeat(t.SrcSpellCasterSeat))
    var spellClassName = t.Spell.ClassName
    console.info("onTriggerSpell---" + spellClassName)
    if (spellClassName == 'TalentSkill') {
        var lastUseParamsFromServer = t.Spell.LastUseParamsFromServer;
        if (lastUseParamsFromServer && (lastUseParamsFromServer[0] == 1 || lastUseParamsFromServer[0] == 5)) {
            // 友方不触发天赋增伤
            SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
        } else {
            SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_OK);
        }
    }
    // 发动业炎
    if (spellClassName == 'YeYanJL') {
        PubGsCUseSpell.SendUseSpell(0, 988, [2,3]);
        return;
    }
    // 必然触发技能列表
    var okSkillList = ['JiangLingSkill']
    if (okSkillList.indexOf(spellClassName) > -1) {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_OK);
    }
    // 取消技能
    var cancelSkillList = ['Tao']
    if (cancelSkillList.indexOf(spellClassName) > -1) {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
    }
}
// 取消使用手气卡
LuckCardWindow.prototype.intoEffect = function () {
    this.x = SystemContext.gameWidth,
        this.y = SystemContext.gameHeight - 460,
        Laya.Tween.to(this, {
            x: SystemContext.gameWidth - this.width >> 1
        }, 400)
    ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQCANCELUSEGAMEITEM, {
        itemID: this.sqkItemID
    })
}
// 发动 乱击
function dealCards() {
    var manager = SceneManager.GetInstance().CurrentScene.manager;
    if (!manager || !manager.seats || !manager.SelfSeat) {
        return;
    }
    // 取消无懈可击
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    var selectContext = selfSeat.seatUI.cardContainer.SelectContext;
    if (selectContext && selectContext.message.indexOf('无懈可击') != -1) {
        selfSeat.seatUI.SelectCardResult(ButtonName.BUTTON_IGNORE_WUXIE)
        return;
    }
    var handCards = selfSeat.handCards;
    var fangJianCards = []
    outer:
    for (var card of handCards) {
        var cardId = card.cardId;
        var cardFlower = card.cardFlower;
        for (var other of handCards) {
            if (other.cardId != cardId && other.cardFlower == cardFlower) {
                fangJianCards = [cardId, other.cardId];
                break outer;
            }
        }
    }
    PubGsCUseSpell.SendUseSpell(selfSeat.index, 102, [], fangJianCards, selfSeat.index, 42);
}
// 循环执行
var useCardsInterval = setInterval(dealCards, 300);
// 奖励牌子出现后自动离开
TableGameManager.prototype.onNotifyCompeteworldSweepBattleResult = function (t) {
    if (t && t.Protocol && (this.competeWorldResultItems = t.Protocol.ProtoData.items, WindowManager.GetInstance().hasWindow("GameResultWindow"))) {
        var e = WindowManager.GetInstance().GetWindow("GameResultWindow");
        e.UpdateResultItems(this.competeWorldResultItems);
    }
    GameContext.LeaveGameScene();
}
// 选关
var startInterval = setInterval(function () {
    if (!SceneManager.GetInstance().CurrentScene.manager) {
        // 不在逐鹿天下模式下进入
        if (SceneManager.GetInstance().CurrentScene.sceneName != 'CompeteWorldScene') {
            RoomControler.GetInstance().EnterMode(ModeIDType.MITZhuLuTianXia);
            return;
        }
        // 进入逐鹿天下100关，选将袁绍、筷子、郭图
        var towerLevelID = 100;
        var o1 = new CompeteWorldBattleGeneralInfo;
        o1.generalID = 42;
        o1.location = 1;
        o1.generalTyp = 2;
        var o2 = new CompeteWorldBattleGeneralInfo;
        o2.generalID = 95;
        o2.location = 2;
        o2.generalTyp = 2;
        var o3 = new CompeteWorldBattleGeneralInfo;
        o3.generalID = 342;
        o3.location = 3;
        o3.generalTyp = 2;
        var zhenRong = [o1, o2, o3]
        CompeteWorldManager.GetInstance().ReqCompeteWorldBattle(towerLevelID, zhenRong);
    }
}, 500)

// 停止下一局
// clearInterval(startInterval);