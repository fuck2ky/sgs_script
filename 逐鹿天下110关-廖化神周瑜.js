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
        return;
    }
    // 发动业炎
    if (spellClassName == 'YeYanJL') {
        PubGsCUseSpell.SendUseSpell(0, 988, [1,2]);
        return;
    }
    // 发动琴音
    if (spellClassName == 'QinYinJL') {
        PubGsCUseSpell.SendUseSpell(0, 970, [1,2]);
        return;
    }
    // 非本人取消求桃
    var LastUseTargetFromServer = t.Spell.LastUseTargetFromServer;
    if (spellClassName == 'Tao' && LastUseTargetFromServer && LastUseTargetFromServer[0] != 0) {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
    }
}

TableGameManager.prototype.onRoleOptTargetNtf = function (t, e) {
    this.selfSeatUI && this.selfSeatUI.off(SeatEvent.SWAPSEAT_COMPLETE, this, this.onRoleOptTargetNtf),
    e.UpdateCountdownTimer(t.Timeout);
    if (t.SpellID == 970) {
        // 琴音流失体力
        ProtoProxy.GetInstance().SendProto(ProtoBufId.LOGICMSG_MSGROLESPELLOPTREP, {
            "datas": [1],
            "optType": 0,
            "seat": 0,
            "spellId": 970,
        })        
    }
    this.skillResponseManager.Response(t)
}

function dealCards() {
    var manager = SceneManager.GetInstance().CurrentScene.manager;
    if (!manager || !manager.seats || !manager.SelfSeat) {
        return;
    }
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    if (selfSeat.roundState == 5) {
        //弃牌阶段
        var num = selfSeat.CurrentCardSelector.selectCountMax;
        if (num > 0) {
            var cardIds = [];
            for (var i = 0; i < num; i++) {
                cardIds.push(selfSeat.handCards[i].cardId)
            }
            selfSeat.Discard(cardIds);
            return;
        }
    }
    // 结束当前回合
    if (GameContext.SelfSeat.skillUseCountInGame.getNumberKey(426)) {
        GameContext.Seat_Discard(0)
    }
}
// 循环执行
var useCardsInterval = setInterval(dealCards, 300);

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
        // 进入逐鹿天下110关，选将廖化
        var towerLevelID = 110;
        var o1 = new CompeteWorldBattleGeneralInfo;
        o1.generalID = 300;
        o1.location = 1;
        o1.generalTyp = 2;
        var zhenRong = [o1]
        CompeteWorldManager.GetInstance().ReqCompeteWorldBattle(towerLevelID, zhenRong);
    }
}, 300)

// 停止下一局
// clearInterval(startInterval);