// 设置必然触发技能及取消
TableGameManager.prototype.onTriggerSpell = function (t, e) {
    this.selfSeatUI && this.selfSeatUI.off(SeatEvent.SWAPSEAT_COMPLETE, this, this.onTriggerSpell),
        e.UpdateCountdownTimer(t.TimeOut),
        e.TriggerSpellMulti(t, this.GetSeat(t.SrcSpellCasterSeat))
    var spellClassName = t.Spell.ClassName
    // console.info("onTriggerSpell---" + spellClassName)
    // 必然触发技能列表
    var okSkillList = ['TalentSkill', 'JiangLingSkill', 'KuangGu2016']
    if (okSkillList.indexOf(spellClassName) > -1) {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_OK);
        return;
    }
    // 发动业炎
    if (spellClassName == 'YeYanJL') {
        var targetSeatIndex = getTargetSeatIndex();
        PubGsCUseSpell.SendUseSpell(0, 988, [targetSeatIndex,(targetSeatIndex-1)%3+2]);
        return;
    }
    // 非本人取消求桃
    var LastUseTargetFromServer = t.Spell.LastUseTargetFromServer;
    if (spellClassName == 'Tao' && LastUseTargetFromServer && LastUseTargetFromServer[0] != 0) {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
    }
}
// 触发狂骨
KuangGu2016.prototype.BeforeTouchSkillItem = function () {
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    var handCards = selfSeat.handCards;
    var taoNum = 0;
    for (var card of handCards) {
        if (card.cardName == '桃') {
            taoNum++
        }
    }
    var hp = selfSeat.Hp;
    if (5 - hp > taoNum) {
        //损失的血大于手牌中桃的数量，选择回血
        PubGsCUseSpell.SendUseSpell(0, 295, [], [], 0, 28, [1])
    } else {
        // 否则，摸一张牌
        PubGsCUseSpell.SendUseSpell(0, 295, [], [], 0, 28, [2])
    }
    var t = this.GetMultiSelectDatas(null);
    return GameEventDispatcher.GetInstance().event(SkillResponserEvent.APPLYLASTSPELLCONTEXT, new SkillResponserEvent("", null, t.btnDatas, this, t.optMsg, SkillResponserEvent.MULTI_SELECT)),
        !0
}
// 手气卡
LuckCardWindow.prototype.intoEffect = function () {
    this.x = SystemContext.gameWidth,
        this.y = SystemContext.gameHeight - 460,
        Laya.Tween.to(this, {
            x: SystemContext.gameWidth - this.width >> 1
        }, 400)

    var count = 0;
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    var handCards = selfSeat.handCards;
    for (var card of handCards) {
        if (card.cardName.indexOf("杀") != -1) {
            count++;
        } else if (card.cardName == '桃' || card.cardName == '酒') {
            count += 2;
        }
    }
    if (count > 2) {
        //手牌中的杀桃酒总数大于3，不用换牌
        ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQCANCELUSEGAMEITEM, {
            itemID: this.sqkItemID
        })
    } else {
        // 使用脚气卡
        ProtoProxy.GetInstance().SendProto(ProtoBufId.CMSG_CREQUSEGAMEITEM, {
            itemID: this.sqkItemID
        })
    }
}
// 发动奇谋
function qimou() {
    var qimouCount = 4; //失去的体力数
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    var handCards = selfSeat.handCards;
    for (var card of handCards) {
        if (card.cardName == '桃' || card.cardName == '酒') {
            qimouCount = 5;
            break;
        }
    }
    PubGsCUseSpell.SendUseSpell(0, 296, [], [], 0, 28, [qimouCount])

}

var shaCount = 0 //出杀次数
// 获取要杀的人
function getTargetSeatIndex() {
    var seats = SceneManager.GetInstance().CurrentScene.manager.seats;
    var targetSeatIndex = 2;
    var excludeNames = ['曹植','荀攸','曹叡','曹冲','满宠','王异'] //威胁程度由小到大
    for (; targetSeatIndex < 5; targetSeatIndex++) {
        if (excludeNames.indexOf(seats[targetSeatIndex].SeatName) == -1) {
            break;
        }
    }
    //都在黑名单里，挑选威胁小的
    if (targetSeatIndex == 5) {
        for (var i = 0; i < excludeNames.length; i++) {
            for (var targetSeatIndex = 2; targetSeatIndex < 5; targetSeatIndex++) {
                if (seats[targetSeatIndex].SeatName == excludeNames[i]) {
                    return targetSeatIndex;
                }
            }
        }
    }
    return targetSeatIndex;
}
// 魏延出牌逻辑
function dealCards() {
    var manager = SceneManager.GetInstance().CurrentScene.manager;
    if (!manager || !manager.seats || !manager.selfSeatUI.cardContainer.SelectContext) {
        return;
    }
    var targetSeatIndex = getTargetSeatIndex();
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    if (!selfSeat.skillUseInRound.Maps[296]) {
        // 发动奇谋
        qimou()
        return;
    }
    // 取消无懈可击
    var selectContext = selfSeat.seatUI.cardContainer.SelectContext
    if (selectContext && selectContext.message.indexOf('无懈可击') != -1) {
        selfSeat.seatUI.SelectCardResult(ButtonName.BUTTON_IGNORE_WUXIE)
        return
    }
    var handCards = selfSeat.handCards;
    var cardMap = {}
    for (var card of handCards) {
        if (cardMap[card.cardName]) {
            cardMap[card.cardName].push(card)
        } else {
            cardMap[card.cardName] = [card]
        }
    }
    // 发动奇谋进入濒死时优先吃酒
    if (selfSeat.Hp < 1) {
        if(cardMap['酒']) {
            selfSeat.Deal(cardMap['酒'][0].cardId, [0])
            return
        }
        if(cardMap['桃']) {
            selfSeat.Deal(cardMap['桃'][0].cardId, [0])
            return
        }
    }
    // 出杀次数>2使用酒
    if (shaCount > 2 && cardMap['酒']) {
        if(cardMap['酒']) {
            selfSeat.Deal(cardMap['酒'][0].cardId, [0])
            return;
        }
    }
    // 优先出杀
    var shas = ['杀','雷杀','火杀']
    for (var name of shas) {
        if (cardMap[name]) {
            shaCount++;//出杀次数+1
            selfSeat.Deal(cardMap[name][0].cardId, [targetSeatIndex]);
            return;
        }
    }
    // 剩余直接出的牌
    var temps = ['桃','铁索连环','无中生有','南蛮入侵','万箭齐发']
    for (var name of temps) {
        if (cardMap[name]) {
            selfSeat.Deal(cardMap[name][0].cardId, [0]);
        }
    }
}
// 循环执行
var useCardsInterval = setInterval(dealCards, 300);

// 奖励牌子出现后自动离开
TableGameManager.prototype.onNotifyCompeteworldSweepBattleResult = function (t) {
    if (t && t.Protocol && (this.competeWorldResultItems = t.Protocol.ProtoData.items, WindowManager.GetInstance().hasWindow("GameResultWindow"))) {
        var e = WindowManager.GetInstance().GetWindow("GameResultWindow");
        e.UpdateResultItems(this.competeWorldResultItems)
    }
    GameContext.LeaveGameScene()
}
var startInterval = setInterval(function () {
    if (!SceneManager.GetInstance().CurrentScene.manager) {
        // 不在逐鹿天下模式下进入
        if (SceneManager.GetInstance().CurrentScene.sceneName != 'CompeteWorldScene') {
            RoomControler.GetInstance().EnterMode(ModeIDType.MITZhuLuTianXia);
            return;
        }
        // 进入逐鹿天下120关，选将魏延、蜀香、关平
        var towerLevelID = 120;
        var o1 = new CompeteWorldBattleGeneralInfo;
        o1.generalID = 28;
        o1.location = 1;
        o1.generalTyp = 2;
        var o2 = new CompeteWorldBattleGeneralInfo;
        o2.generalID = 424;
        o2.location = 2;
        o2.generalTyp = 2;
        var o3 = new CompeteWorldBattleGeneralInfo;
        o3.generalID = 313;
        o3.location = 3;
        o3.generalTyp = 2;
        var zhenRong = [o1, o2, o3];
        CompeteWorldManager.GetInstance().ReqCompeteWorldBattle(towerLevelID, zhenRong);
        //出杀次数清零
        shaCount = 0;
    }
}, 500)
// 停止下一局
// clearInterval(startInterval);