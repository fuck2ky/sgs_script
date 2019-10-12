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
    // 取消将灵连营
    if (spellClassName == 'LianYingJL') {
        SceneManager.GetInstance().CurrentScene.SelfSeatUi.buttonBar.ApplyButton(ButtonName.BUTTON_CANCEL);
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

// 获取要杀的人
function getTargetSeatIndex() {
    var seats = SceneManager.GetInstance().CurrentScene.manager.seats;
    var targetSeatIndex = 2;
    var excludeNames = ['曹植', '荀攸', '曹叡', '曹冲', '满宠', '王异'] //威胁程度由小到大
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
    var cardList = [[], [], []];
    for (var card of handCards) {
        if (['杀', '火杀', '雷杀'].indexOf(card.cardName) != -1) {
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

    if (!fuhunFirst) {
        // 第一次发动父魂杀2号位
        shaDuiYou = true;
        fuhunFirst = true;
        var cards = [];
        if (cardList[1].length >= 2) {
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

    var targetSeatIndex = getTargetSeatIndex();
    // 剩余可出杀不足时杀荀彧补牌
    if (cardList[0].length + (cardList[1].length >= 2 ? 1 : 0) + cardList[2].length <= 1) {
        shaDuiYou = true;
        targetSeatIndex = 5;
        var cards = [];
        if (cardList[1].length >= 2) {
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
        // 120关，选将关张299、荀彧36、李典411
        var towerLevelID = 120;
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
}, 300)
// 停止下一局
// clearInterval(startInterval);