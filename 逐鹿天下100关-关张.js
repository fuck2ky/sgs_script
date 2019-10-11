// 设置必然触发技能及取消
var shaDuiYou = false; //是否杀队友
TableGameManager.prototype.onTriggerSpell = function (t, e) {
    this.selfSeatUI && this.selfSeatUI.off(SeatEvent.SWAPSEAT_COMPLETE, this, this.onTriggerSpell),
        e.UpdateCountdownTimer(t.TimeOut),
        e.TriggerSpellMulti(t, this.GetSeat(t.SrcSpellCasterSeat))
    var spellClassName = t.Spell.ClassName
    // console.info("onTriggerSpell---" + spellClassName)
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
    // 将灵武圣技能
    if (spellClassName == 'JiangLingSkill') {
        if (shaDuiYou) {
            // 杀队友取消
            SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
        } else {
            SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_OK);
        }
        return;
    }
    // 发动业炎
    if (spellClassName == 'YeYanJL') {
        var targetSeatIndex = getTargetSeatIndex();
        PubGsCUseSpell.SendUseSpell(0, 988, [targetSeatIndex]);
        return;
    }
    // 非本人取消求桃
    var LastUseTargetFromServer = t.Spell.LastUseTargetFromServer;
    if (spellClassName == 'Tao' && LastUseTargetFromServer && LastUseTargetFromServer[0] != 0) {
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
// 拆仁王盾
TableGameManager.prototype.ServerProxy_GsCRoleOptTargetNtf = function (t) {
    var e, n = t.Protocol;
    e = this.GetSeat(n.SeatID),
    null != e && (this.HideOtherSeatsCountDowntimer(), this.gameControler.RefreshLastDeactivateTimestamp(), GameContext.NextSpellTargets = n.Spell ? n.Spell.GetNextTargetIDs(n) : [n.TargetSeatID], e.IsSelfTS ? (this.selfSeatUI.on(SeatEvent.SWAPSEAT_COMPLETE, this, this.onRoleOptTargetNtf, [n, e]), this.selfSeatUI.SwapSeat(e)) : this.onRoleOptTargetNtf(n, e), GuideManager.GetInstance().NeedYingJi ? e == GameContext.SelfSeat && n.Type == GsCRoleOptTargetNtf.OPT_SHA ? GuideManager.GetInstance().PrepareYingJi(!1, SkillId.SHA) : e == GameContext.SelfSeat && n.Type == GsCRoleOptTargetNtf.OPT_SHAN ? GuideManager.GetInstance().PrepareYingJi(!1, SkillId.SHAN) : GuideManager.GetInstance().StopYingJi() : this.aiHelpEnabled && this.requestAiHelpData())
    var spellId = t.Protocol.SpellID;
    if ([5].indexOf(spellId) != -1) {
        PubGsCMoveCard.SendMoveCard([107])
    }
}

// 获取要杀的人
function getTargetSeatIndex() {
    return 3;
}
// 是否使用过父魂
var fuhunFirst = false;
// 关张出牌逻辑
function dealCards() {
    var manager = SceneManager.GetInstance().CurrentScene.manager;
    if (!manager || !manager.seats || !manager.selfSeatUI.cardContainer.SelectContext) {
        return;
    }
    shaDuiYou = false;
    var selfSeat = SceneManager.GetInstance().CurrentScene.manager.SelfSeat;
    var handCards = selfSeat.handCards;
    // 将手牌分组，0不含杀的红色牌 1不含杀的黑色牌 2所有的杀
    var cardList = [[],[],[]];
    var cardMap = {}
    for (var card of handCards) {
        if (cardMap[card.cardName]) {
            cardMap[card.cardName].push(card)
        } else {
            cardMap[card.cardName] = [card]
        }
        if (['杀','火杀','雷杀'].indexOf(card.cardName) != -1) {
            cardList[2].push(card);
            continue;
        }
        if (card.Color == 1) {
            // 红色牌
            cardList[0].push(card);
        } else if (card.Color == 2) {
            // 黑色牌
            cardList[1].push(card);
        }
    }

    var targetSeatIndex = getTargetSeatIndex();

    var renwang = false; //是否有仁王盾
    var seats = SceneManager.GetInstance().CurrentScene.manager.seats;
    for (var card of seats[3].equipCards) {
        if (card.cardName == '仁王盾') {
            renwang = true;
            break;
        }
    }
    // 自己装备数>0，说明有青釭剑
    if (selfSeat.equipCards.length > 0) {
        renwang = false;
    }
    if (renwang) {
        // 有仁王盾的话
        // 有青釭剑就装
        if (cardMap['青釭剑']) {
            selfSeat.Deal(cardMap['青釭剑'][0].cardId, [0]);
            return;
        }
        var uses = ['引蜂甲','女装','驽马','过河拆桥','解甲归田'];
        for (var name of uses) {
            if (cardMap[name]) {
                selfSeat.Deal(cardMap[name][0].cardId, [targetSeatIndex]);
                return;
            }
        }
    }

    if (!fuhunFirst) {
        // 第一次发动父魂杀2号位
        shaDuiYou = true;
        fuhunFirst = true;
        shaDuiYou = false;
        var cards = [];
        if (cardList[1].length >=2 ) {
            // 黑色牌数量大于2
            cards = [cardList[1][0].cardId, cardList[1][1].cardId];
        } else if (cardList[1].length == 1) {
            var concats = cardList[0].concat(cardList[2]);
            cards = [cardList[1][0].cardId, concats[0].cardId];
        } else if (cardList[1].length == 0) {
            var concats = cardList[0].concat(cardList[2]);
            cards = [concats[0].cardId, concats[1].cardId];
        }
        PubGsCUseSpell.SendUseSpell(0, 473, [1], cards, 0, 299);
        return;
    }

    // 剩余可出杀不足时杀荀彧补牌
    if (cardList[0].length + (cardList[1].length >= 2 ? 1 : 0) + cardList[2].length <= 1) {
        shaDuiYou = true;
        targetSeatIndex = 5;
        var cards = [];
        if (cardList[1].length >=2 ) {
            // 黑色牌数量大于2
            cards = [cardList[1][0].cardId, cardList[1][1].cardId];
        } else if (cardList[1].length == 1) {
            var concats = cardList[0].concat(cardList[2]);
            if (concats.length > 0) {
                cards = [cardList[1][0].cardId, concats[0].cardId];
            }
        }
        if (cards.length == 2) {
            PubGsCUseSpell.SendUseSpell(0, 473, [targetSeatIndex], cards, 0, 299);
            return;
        }
    }
    // 优先出杀
    if (cardList[2].length > 0) {
        selfSeat.Deal(cardList[2][0].cardId, [targetSeatIndex]);
        return;
    }
    // 没有杀使用武圣，红色牌
    if (cardList[0].length > 0) {
        PubGsCUseSpell.SendUseSpell(0, 685, [targetSeatIndex], [cardList[0][0].cardId], 0, 299);
        return;
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
        // 进入逐鹿天下100关，选将关张、荀彧36、李典411、曹操75
        var towerLevelID = 100;
        var o1 = new CompeteWorldBattleGeneralInfo;
        o1.generalID = 299;
        o1.location = 1;
        o1.generalTyp = 2;
        var o2 = new CompeteWorldBattleGeneralInfo;
        o2.generalID = 36;
        o2.location = 2;
        o2.generalTyp = 2;
        var o3 = new CompeteWorldBattleGeneralInfo;
        o3.generalID = 411;
        o3.location = 3;
        o3.generalTyp = 2;
        var zhenRong = [o1, o2, o3];
        CompeteWorldManager.GetInstance().ReqCompeteWorldBattle(towerLevelID, zhenRong);
        fuhunFirst = false; //重置
    }
}, 500)
// 停止下一局
// clearInterval(startInterval);