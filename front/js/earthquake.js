export function earthquakeEffect() {
    // ------------------------------------
    // 1. 地震効果 (陸地タイルの荒地化)
    // ------------------------------------
    const affectedTiles = []; 
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const tile = map[y][x];
            // 陸地タイルかつ石碑ではないことを確認
            if (tile.terrain !== 'sea' && tile.facility !== 'Monument') {
                affectedTiles.push({ x, y });
            }
        }
    }

    const numToDestroy = Math.floor(Math.random() * 8) + 5; // 5から12
    affectedTiles.sort(() => 0.5 - Math.random()); // ランダムにシャッフル
    const landDestroyed = affectedTiles.slice(0, numToDestroy);

    landDestroyed.forEach(({ x, y }) => {
        const tile = map[y][x];
        
        if (tile.facility === 'house') {
            population -= tile.pop;
            if (population < 0) population = 0;
            logAction(`(${x},${y})の住宅が地震により破壊されました。`);
        } else {
            logAction(`(${x},${y})の${tile.facility || tile.terrain}が地震により破壊され荒地になりました。`);
        }

        tile.terrain = 'waste';
        tile.facility = null;
        tile.pop = 0;
        tile.enhanced = false;
    });

    if (landDestroyed.length > 0) {
        logAction(`地震により ${landDestroyed.length} 個の陸地タイルが荒地になりました。`);
    } else {
        logAction(`地震による陸地の直接的な被害はありませんでした。`);
    }

    logAction(`津波が島に押し寄せます...`);

    // ------------------------------------
    // 2. 津波効果
    // ------------------------------------
    let portsDestroyed = 0;
    let oilRigsDestroyed = 0;
    let totalTilesAffected = 0;

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const tile = map[y][x];
            if (tile.facility === 'Monument') continue; // 石碑は例外

            // 海または最外周に隣接する陸地タイルかどうかを判定する
            const isLand = tile.terrain !== 'sea';
            let isAdjacentToSea = false;
            
            // 周囲8マスに海があるかをチェック
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && map[ny][nx].terrain === 'sea') {
                        isAdjacentToSea = true;
                        break;
                    }
                }
                if (isAdjacentToSea) break;
            }

            // A. 油田と港の破壊 (海タイルでも隣接陸地タイルでも全て破壊)
            if (tile.facility === 'oilRig' || tile.facility === 'port') {
                 // 既に津波で破壊される対象なので、以降のランダム破壊は無視される
            } else if (!isLand || !isAdjacentToSea) {
                // 陸地でなく、かつ海に隣接していない陸地でもない（つまり内陸の陸地、または内陸の海）は対象外
                continue;
            }
            if (tile.facility === 'oilRig' || tile.facility === 'port') {
                if (tile.facility === 'oilRig') oilRigsDestroyed++;
                if (tile.facility === 'port') portsDestroyed++;
                logAction(`津波により (${x},${y}) の${tile.facility === 'oilRig' ? '油田' : '港'}が破壊され海になりました。`);
                tile.terrain = 'sea';
                tile.facility = null;
                tile.pop = 0;
                tile.enhanced = false;
                totalTilesAffected++;
            } else if (isAdjacentToSea) { // 海に隣接する陸地タイルに対するランダム破壊
                const r = Math.random();
                if (r < 0.30) { // 30%の確率で荒地
                    if (tile.facility === 'house') {
                        population -= tile.pop;
                        if (population < 0) population = 0;
                        logAction(`津波により (${x},${y})の住宅が破壊され荒地になりました。`);
                    } else {
                        logAction(`津波により (${x},${y})の${tile.facility || tile.terrain}が荒地になりました。`);
                    }
                    tile.terrain = 'waste';
                    tile.facility = null;
                    tile.pop = 0;
                    tile.enhanced = false;
                    totalTilesAffected++;
                } else if (r < 0.30 + 0.20) { // 20%の確率で海
                    if (tile.facility === 'house') {
                        population -= tile.pop;
                        if (population < 0) population = 0;
                        logAction(`津波により (${x},${y})の住宅が破壊され海になりました。`);
                    } else {
                        logAction(`津波により (${x},${y})の${tile.facility || tile.terrain}が海になりました。`);
                    }
                    tile.terrain = 'sea';
                    tile.facility = null;
                    tile.pop = 0;
                    tile.enhanced = false;
                    totalTilesAffected++;
                }
            }
        }
    }
    
    // 滞在中の軍艦へのダメージ
    warships.forEach(ship => {
        // 自島にいて、沈没しておらず、派遣中でない船
        if (ship.homePort === islandName && ship.currentDurability > 0 && !ship.isDispatched) {
            const damage = 2;
            ship.currentDurability -= damage;
            checkAbnormalityOnDamage(ship, damage);
            logAction(`津波により軍艦 ${ship.name} が ${damage} ダメージを受けました。`);
            if (ship.currentDurability <= 0) {
                ship.currentDurability = 0;
                logAction(`軍艦 ${ship.name} は津波により沈没しました。`);
            }
        }
    });

    if (totalTilesAffected > 0 || portsDestroyed > 0 || oilRigsDestroyed > 0) {
        logAction(`津波により沿岸部 ${totalTilesAffected} マスに被害が発生しました。（港 ${portsDestroyed}、油田 ${oilRigsDestroyed} を含む）`);
    } else {
         logAction(`津波はありましたが、沿岸部への被害はありませんでした。`);
    }
}
