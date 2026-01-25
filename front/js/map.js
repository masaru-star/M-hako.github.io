export function initMap() {
  map = Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => {
      // 周囲4マスを海にする
      if (x < 4 || y < 4 || x >= SIZE - 4 || y >= SIZE - 4) {
        return { terrain: 'sea', facility: null, pop: 0, enhanced: false };
      }
      // ランダムな陸地配置（森、平地、荒地）と海
      const terrain = randTerrain();
      return { terrain, facility: null, pop: 0, enhanced: false };
    })
  );
  let placed = 0;
  // 初期住宅を2つ配置
  // 平地を探し、すでに施設がない場所に配置する
  const possibleHouseLocations = [];
  for (let y = 4; y < SIZE - 4; y++) {
    for (let x = 4; x < SIZE - 4; x++) {
      const tile = map[y][x];
      if (tile.terrain === 'plain' && !tile.facility) {
        possibleHouseLocations.push({ x, y });
      }
    }
  }

  // シャッフルしてランダムに2つ選択
  possibleHouseLocations.sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(2, possibleHouseLocations.length); i++) {
    const { x, y } = possibleHouseLocations[i];
    const tile = map[y][x];
    tile.facility = 'house';
    tile.pop = 25;
    population += 25;
    placed++;
  }
document.getElementById('islandNameInput').value = islandName; // UIに初期値を反映
    renderActionQueue();
}
export function renderMap() {
  const table = document.getElementById('map');
  table.innerHTML = '';
  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement('tr');
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement('td');
      const tile = map[y][x];
      const displayFacility = (isViewingOtherIsland && (tile.facility === 'gun' || tile.facility === 'defenseFacility' || tile.facility === 'Monument')) ? 'forest' : tile.facility;
      const displayTerrain = (isViewingOtherIsland && (tile.facility === 'gun' || tile.facility === 'defenseFacility' || tile.facility === 'Monument')) ? 'forest' : tile.terrain;

      cell.className = displayTerrain; // 地形クラス
      if (displayFacility) cell.classList.add(displayFacility); // 施設クラス

      // 強化施設のクラスを追加
      if (tile.enhanced) {
          if (tile.facility === 'farm') cell.classList.add('enhancedFarm');
          if (tile.facility === 'factory') cell.classList.add('enhancedFactory');
          if (tile.facility === 'oilRig') cell.classList.add('enhancedOilRig');
      }
      // 軍艦の表示
      const warshipAtTile = warships.find(ship => ship.x === x && ship.y === y);
      if (warshipAtTile && !isViewingOtherIsland) { // 自分の島を見ているときのみ軍艦を表示
          if (warshipAtTile.currentDurability <= 0) { // 沈没している場合
              cell.classList.add('warship-wreckage');
              cell.textContent = 'x'; // 残骸アイコン
          } else {
              cell.classList.add('warship');
              if (warshipAtTile.isDispatched) {
                  cell.classList.add('warship-dispatched'); // 派遣中のスタイル
                  cell.textContent = '⛶'; // 派遣中アイコン
              } else {
                  cell.textContent = '🚢';
              }
          }
      } else {
          cell.textContent = displayFacility === 'farm' ? '🌾' :
                             displayFacility === 'house' ? '🏠' :
                             displayFacility === 'factory' ? '🏭' :
                             displayFacility === 'gun' ? '🔫' :
                             displayFacility === 'port' ? '⚓' :
                             displayFacility === 'Monument' ? '🗿' :
                             displayFacility === 'defenseFacility' ? '🛡️' :
                             displayFacility === 'oilRig' ? '🛢️' :'';
                             displayTerrain === 'mountain' ? '⛰️' : '';
      }

      // 強化施設のアイコンはそのまま
      if (tile.enhanced) {
          if (tile.facility === 'farm') cell.textContent = '🌾';
          if (tile.facility === 'factory') cell.textContent = '🏭';
          if (tile.facility === 'oilRig') cell.textContent = '🛢️';
      }

      if (selectedX === x && selectedY === y) cell.classList.add('selected');
      cell.onmouseover = () => showTileInfo(x, y);
      cell.onclick = () => selectTile(x, y);
      row.appendChild(cell);
      const monsterAtTile = monsters.find(m => m.x === x && m.y === y);
      if (monsterAtTile) {
        cell.textContent = '👾';
      }
    }
    table.appendChild(row);
  }
}
