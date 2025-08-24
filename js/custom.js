/**
 * 处理上传的自定义卡包数据。
 * @param {Array<Object>} packData - 从JSON文件解析出的卡牌对象数组。
 */
function processUploadedPack(packData) {
    let addedCounts = {
        domain: 0,
        class: 0,
        subclass: 0,
        race: 0,
        community: 0,
        other: 0
    };

    if (!Array.isArray(packData)) {
        console.error("提供的卡包資料不是一個陣列:", packData);
        alert("錯誤：卡包檔案格式不正確，需要一個卡牌數組。");
        return;
    }

    packData.forEach(card => {
        if (!card || typeof card !== 'object') {
            console.warn("在卡包資料中發現無效的卡牌條目:", card);
            return; // 跳过无效的条目
        }

        const cardType = card.类型;

        switch (cardType) {
            case '领域卡':
                if (DOMAIN_CARDS && !DOMAIN_CARDS.some(c => c.名称 === card.名称)) {
                    DOMAIN_CARDS.push(card);
                    addedCounts.domain++;
                }
                break;
            case '主职':
                if (MAIN_CLASS && !MAIN_CLASS.some(c => c.名称 === card.名称)) {
                    MAIN_CLASS.push(card);
                    addedCounts.class++;
                }
                break;
            case '子职':
                if (SUB_CLASS && !SUB_CLASS.some(c => c.名称 === card.名称)) {
                    SUB_CLASS.push(card);
                    addedCounts.subclass++;
                }
                break;
            case '种族':
                if (typeof RACES_DATA !== 'undefined' && RACES_DATA && !RACES_DATA.some(c => c.名称 === card.名称)) {
                    RACES_DATA.push(card);
                    addedCounts.race++;
                }
                break;
            case '社群':
                if (typeof COMM_DATA !== 'undefined' && COMM_DATA && !COMM_DATA.some(c => c.名称 === card.名称)) {
                    COMM_DATA.push(card);
                    addedCounts.community++;
                }
                break;
            default:
                // 如果类型不匹配或不存在，则直接创建卡牌
                if (typeof createCard === 'function') {
                    createCard(card);
                    addedCounts.other++;
                } else {
                    console.warn("createCard 函數未定義，無法建立卡牌:", card);
                }
                break;
        }
    });

    let messageParts = [];
    if (addedCounts.domain > 0) {
        messageParts.push(`- 新增領域卡: ${addedCounts.domain}`);
    }
    if (addedCounts.class > 0) {
        messageParts.push(`- 新增職業: ${addedCounts.class}`);
    }
    if (addedCounts.subclass > 0) {
        messageParts.push(`- 新增子職: ${addedCounts.subclass}`);
    }
    if (addedCounts.race > 0) {
        messageParts.push(`- 新增種族: ${addedCounts.race}`);
    }
    if (addedCounts.community > 0) {
        messageParts.push(`- 新增社群: ${addedCounts.community}`);
    }
    if (addedCounts.other > 0) {
        messageParts.push(`- 直接創建到頁面的其他卡牌: ${addedCounts.other}`);
    }

    if (messageParts.length > 0) {
        alert("處理完成！\n" + messageParts.join("\n"));
    } else {
        alert("沒有新的卡牌被新增或創建。");
    }
}
