export function getActionName(action, x, y, extraData) {
    let name = '';
    const actionNames = {
        buildFarm: '農場建設', buildFactory: '工場建設', enhanceFacility: '設備強化', buildPort: '港建設',
        buildGun: '砲台建設', buildDefenseFacility: '防衛施設建設', flatten: '整地', landfill: '埋め立て',
        dig: '掘削', cutForest: '伐採', plantForest: '植林', exportFood: '食料輸出',
        bombard: '砲撃', spreadBombard: '拡散弾砲撃', ppBombard: 'PP弾砲撃', selfDestructMilitaryFacility: '軍事施設自爆',
        goToOtherIsland: '他の島に行く', returnToMyIsland: '自島に戻る', buildWarship: '軍艦建造',
        refuelWarship: '燃料補給', resupplyWarshipAmmo: '弾薬補給', repairWarship: '軍艦修理',
        enhanceWarship: '軍艦増強', decommissionWarship: '軍艦除籍', dispatchWarship: '軍艦派遣',
        requestWarshipReturn: '軍艦帰還要請', buildMonument: '石碑建設', upgradeMonument: '石碑強化',
        sellMonument: '石碑売却', initializeIsland: '島の初期化', delayAction: '遅延行動' 
    };
    name = actionNames[action] || action;
    // 計画の詳細情報を名前に組み込む
    if (action === 'exportFood' && extraData && extraData.amount) {
        name += ` (${extraData.amount * 20} 食料)`;
    } else if ((action === 'bombard' || action === 'spreadBombard' || action === 'ppBombard') && extraData && extraData.count) {
        name += ` (${extraData.count} 発)`;
    } else if (action === 'refuelWarship' && extraData && extraData.amount) {
        name += ` (${extraData.amount} 燃料)`;
    } else if (action === 'resupplyWarshipAmmo' && extraData && extraData.amount) {
        name += ` (${extraData.amount} 弾薬)`;
    } else if (action === 'repairWarship' && extraData && extraData.amount) {
        name += ` (${extraData.amount} 耐久回復)`;
    } else if (action === 'buildWarship' && extraData && extraData.name) {
        name += ` (${extraData.name})`;
    } else if ((action === 'dispatchWarship' || action === 'requestWarshipReturn') && extraData && extraData.name) {
        name += ` (${extraData.name})`;
    } else if (action === 'goToOtherIsland' && extraData && extraData.code) {
        name += ` (コード: ${extraData.code.substring(0, 10)}...)`;
    } else if (action === 'dig' && extraData && extraData.oilFactor && extraData.oilFactor > 1) {
        let cost = 300;
        cost = cost = 300 * extraData.oilFactor ** 2;
    name += ` (予算:${cost} レベル:${extraData.oilFactor})`;
    }
    
    // 座標の表示
    let coord = (x !== null && y !== null) ? `(${x},${y})` : '';

    return { name, coord };
}

// 計画キューの表示を更新する関数
export function renderActionQueue() {
    const list = document.getElementById('actionQueueList');
    if (!list) return;
    list.innerHTML = '';
    const MAX_QUEUE_SIZE = 20; 
    for (let index = 0; index < MAX_QUEUE_SIZE; index++) {
        const listItem = document.createElement('li');
        const task = actionQueue[index]; // キューから計画を取得
        // 2桁の番号を先頭に追加
        const displayIndex = (index + 1).toString().padStart(2, '0');
        if (task) {
            // 計画が設定されている場合
            const { name, coord } = getActionName(task.action, task.x, task.y, task);
            let classList = "action-link";
            if (index < 2) {
                classList += " next-action";
            }
            listItem.innerHTML = `
                ${displayIndex} 
                <span class="${classList}" onclick="cancelAction(${index})">
                    ${coord} ${name}
                </span>
            `;
        } else {
            listItem.innerHTML = `${displayIndex} 計画無し`;
        }       
        list.appendChild(listItem);
    }
}
