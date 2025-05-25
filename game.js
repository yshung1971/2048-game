// 2048 with Anime.js animation & forest theme
const SIZE = 4;
const BOARD_PADDING = 18; // Matches CSS padding for #board
const COLORS = {
    0: '#355d2d', // Empty cell - darker green
    2: '#4c9a2a', // Light green
    4: '#7cb850',
    8: '#a0d884',
    16: '#b6e19a',
    32: '#d4f5b2', // Lighter green
    64: '#c8e6c9', // Soft mint
    128: '#a5d6a7',
    256: '#81c784',
    512: '#66bb6a',
    1024: '#388e3c', // Darker green
    2048: '#2e7031', // Deep forest green
};

let grid;
let score = 0;
const board = document.getElementById('board');
const scoreValue = document.getElementById('score-value');
const restartBtn = document.getElementById('restart');
const audioStatus = document.getElementById('audioStatus');

// 延遲獲取合併音效元素
let mergeSound = null;

// 播放合併音效
function playMergeSound() {
    // 如果尚未獲取過合併音效元素，則嘗試獲取
    if (!mergeSound) {
        mergeSound = document.getElementById('mergeSound');
        if (!mergeSound) {
            console.error('找不到合併音效元素');
            return;
        }
        
        // 預先載入音效
        mergeSound.load();
        console.log('已載入合併音效元素');
    }
    
    console.log('嘗試播放合併音效...');
    
    console.log('音效元素狀態:', {
        readyState: mergeSound.readyState,
        error: mergeSound.error,
        src: mergeSound.src,
        currentSrc: mergeSound.currentSrc
    });
    
    // 重置音效到開始
    mergeSound.currentTime = 0;
    
    // 設置音量（0.0 到 1.0）
    mergeSound.volume = 0.9;
    
    // 播放音效
    const playPromise = mergeSound.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('合併音效播放成功');
        }).catch(error => {
            console.error('無法播放合併音效:', error);
        });
    }
}

// 創建音頻對象
let bgm = new Audio();
bgm.src = './像素冒險樂園.mp3';
bgm.loop = true;
bgm.volume = 0.1; // 50% 音量

// 顯示音頻狀態
function updateAudioStatus(message, isError = false) {
    console.log(message);
    if (audioStatus) {
        audioStatus.textContent = message;
        audioStatus.style.display = 'block';
        audioStatus.style.color = isError ? 'red' : 'green';
    }
}

// 設置音頻事件監聽
bgm.addEventListener('canplaythrough', function() {
    updateAudioStatus('音頻已準備好播放');
    // 嘗試播放（需要用戶交互）
    const playPromise = bgm.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            updateAudioStatus('自動播放被阻止，請點擊頁面播放音樂', true);
        });
    }
});

bgm.addEventListener('error', function(e) {
    updateAudioStatus('音頻加載錯誤: ' + (bgm.error ? bgm.error.message : '未知錯誤'), true);
});

bgm.addEventListener('play', function() {
    updateAudioStatus('音樂播放中...');
});

bgm.addEventListener('pause', function() {
    updateAudioStatus('音樂已暫停');
});

// 點擊頁面時播放音樂
function handleFirstInteraction() {
    if (bgm.paused) {
        const playPromise = bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                updateAudioStatus('播放失敗: ' + error.message, true);
            });
        }
    }
    // 移除事件監聽器，只執行一次
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
}

document.addEventListener('click', handleFirstInteraction);
document.addEventListener('keydown', handleFirstInteraction);

function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function drawBoard() {
    board.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.gridRowStart = r + 1;
            cell.style.gridColumnStart = c + 1;
            board.appendChild(cell);
        }
    }
}

function drawTiles() {
    const tilesInDomAtStart = {}; // Map 'r-c' to DOM element for tiles existing before this function runs
    document.querySelectorAll('.tile').forEach(t => {
        const rAttr = t.getAttribute('data-row');
        const cAttr = t.getAttribute('data-col');
        if (rAttr != null && cAttr != null) { // Ensure it's a valid game tile with coordinates
            tilesInDomAtStart[`${rAttr}-${cAttr}`] = t;
        }
    });

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const valueInGrid = grid[r][c];
            const tileKey = `${r}-${c}`;
            const domElementForThisPos = tilesInDomAtStart[tileKey];

            if (valueInGrid !== 0) { // There should be a tile here
                if (domElementForThisPos) { // A tile already exists from animateMove
                    // Ensure its value and appearance are correct (animateMove should handle this primarily)
                    if (parseInt(domElementForThisPos.getAttribute('data-value')) !== valueInGrid) {
                        domElementForThisPos.textContent = valueInGrid;
                        domElementForThisPos.setAttribute('data-value', valueInGrid);
                        domElementForThisPos.style.background = COLORS[valueInGrid] || '#fff';
                        domElementForThisPos.style.color = valueInGrid <= 4 ? '#e8f5e9' : '#183c1a';
                    }
                    // Ensure ID is final (animateMove should set this, but good to be sure)
                    if (domElementForThisPos.id !== `tile-${r}-${c}`) {
                         domElementForThisPos.id = `tile-${r}-${c}`;
                    }
                    domElementForThisPos.style.left = `${BOARD_PADDING + c * 76}px`;
                    domElementForThisPos.style.top = `${BOARD_PADDING + r * 76}px`;
                    // This tile was handled by animateMove, no pop-in needed.
                    delete tilesInDomAtStart[tileKey]; // Mark as processed
                } else {
                    // No DOM element here, so this is the new tile added by addRandomTile()
                    const newTile = document.createElement('div');
                    newTile.className = 'tile';
                    newTile.textContent = valueInGrid;
                    newTile.style.background = COLORS[valueInGrid] || '#fff';
                    newTile.style.color = valueInGrid <= 4 ? '#e8f5e9' : '#183c1a';
                    newTile.style.left = `${BOARD_PADDING + c * 76}px`;
                    newTile.style.top = `${BOARD_PADDING + r * 76}px`;
                    newTile.setAttribute('data-row', r);
                    newTile.setAttribute('data-col', c);
                    newTile.setAttribute('data-value', valueInGrid);
                    newTile.id = `tile-${r}-${c}`;
                    board.appendChild(newTile);

                    // Apply pop-in animation ONLY to this new tile
                    anime({ targets: newTile, scale: [0.5, 1.1, 1], duration: 300, easing: 'easeOutElastic(1, .8)' });
                }
            } else { // valueInGrid is 0, cell should be empty
                if (domElementForThisPos) {
                    domElementForThisPos.remove();
                    delete tilesInDomAtStart[tileKey]; // Mark as processed
                }
            }
        }
    }

    // Any elements remaining in tilesInDomAtStart are stray tiles. Remove them.
    Object.values(tilesInDomAtStart).forEach(strayTile => strayTile.remove());
}

function randomEmpty() {
    const empty = [];
    for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
            if (grid[r][c] === 0) empty.push([r, c]);
    return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
}

function addRandomTile() {
    const pos = randomEmpty();
    if (!pos) return false;
    grid[pos[0]][pos[1]] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function updateScore(val) {
    score += val;
    scoreValue.textContent = score;
}

function move(dir) {
    let moved = false;
    const before = grid.map(row => row.slice());
    let addScore = 0;
    const moveMap = []; // Stores {value, from:[r,c], to:[r,c], mergedToValue?, disappears?}

    function slideRowOrColumn(originalLine, lineIndex, isColumn, isReversed) {
        let line = originalLine.filter(x => x !== 0); // Remove zeros
        let newLine = [];
        let lineMoveMap = [];

        for (let i = 0; i < line.length; i++) {
            let currentValue = line[i];
            let originalPosInFiltered = i;
            let originalGridIndex = -1;
            let count = 0;
            for(let k=0; k<originalLine.length; k++){
                if(originalLine[k] === currentValue){
                    if(count === line.slice(0, originalPosInFiltered + 1).filter(x => x === currentValue).length -1){
                        originalGridIndex = k;
                        break;
                    }
                    count++;
                }
            }

            if (i + 1 < line.length && line[i] === line[i + 1]) {
                const mergedValue = line[i] * 2;
                newLine.push(mergedValue);
                addScore += mergedValue;
                
                // 播放合併音效
                playMergeSound();

                let nextOriginalGridIndex = -1;
                count = 0;
                 for(let k=0; k<originalLine.length; k++){
                    if(originalLine[k] === line[i+1]){
                        if(count === line.slice(0, i + 1 + 1).filter(x => x === line[i+1]).length -1){
                            nextOriginalGridIndex = k;
                            break;
                        }
                        count++;
                    }
                }

                const targetPosInNewLine = newLine.length - 1;

                const finalTargetGridIndexForMerge = isReversed ? (SIZE - 1 - targetPosInNewLine) : targetPosInNewLine;

                const actualOriginalGridIndex = isReversed ? (SIZE - 1 - originalGridIndex) : originalGridIndex;
                const actualNextOriginalGridIndex = isReversed ? (SIZE - 1 - nextOriginalGridIndex) : nextOriginalGridIndex;


                lineMoveMap.push({
                    value: currentValue,
                    from: isColumn ? [actualOriginalGridIndex, lineIndex] : [lineIndex, actualOriginalGridIndex],
                    to: isColumn ? [finalTargetGridIndexForMerge, lineIndex] : [lineIndex, finalTargetGridIndexForMerge],
                    mergedValue: mergedValue
                });
                lineMoveMap.push({
                    value: line[i+1],
                    from: isColumn ? [actualNextOriginalGridIndex, lineIndex] : [lineIndex, actualNextOriginalGridIndex],
                    to: isColumn ? [finalTargetGridIndexForMerge, lineIndex] : [lineIndex, finalTargetGridIndexForMerge],
                    disappears: true
                });
                i++; // Skip next tile as it's merged
            } else {
                newLine.push(line[i]);
                const targetPosInNewLineCompact = newLine.length - 1; // Index in the compacted newLine

                // Determine 'from' and 'to' coordinates in the original grid's orientation
                const actualOriginalGridIndexForMove = isReversed ? (SIZE - 1 - originalGridIndex) : originalGridIndex;
            const fromCoords = isColumn ? [actualOriginalGridIndexForMove, lineIndex] : [lineIndex, actualOriginalGridIndexForMove];
                
                // If isReversed, the newLine was built from a reversed originalLine.
                // targetPosInNewLineCompact is an index from the 'left' (start) of this reversed perspective.
                // We need to map it back to the original grid's coordinate system.
                const finalTargetGridIndex = isReversed ? (SIZE - 1 - targetPosInNewLineCompact) : targetPosInNewLineCompact;
                const toCoords = isColumn ? [finalTargetGridIndex, lineIndex] : [lineIndex, finalTargetGridIndex];

                // Record a move if the absolute grid coordinates have changed.
                if (fromCoords[0] !== toCoords[0] || fromCoords[1] !== toCoords[1]) {
                     lineMoveMap.push({
                        value: currentValue,
                        from: fromCoords,
                        to: toCoords
                    });
                }
            }
        }
        // Pad with zeros
        while (newLine.length < SIZE) newLine.push(0);
        return { processedLine: newLine, moves: lineMoveMap };
    }

    if (dir === 'left') {
        for (let r = 0; r < SIZE; r++) {
            const { processedLine, moves } = slideRowOrColumn(grid[r].slice(), r, false, false);
            if (grid[r].toString() !== processedLine.toString()) moved = true;
            grid[r] = processedLine;
            moveMap.push(...moves);
        }
    } else if (dir === 'right') {
        for (let r = 0; r < SIZE; r++) {
            const originalRow = grid[r].slice();
            const reversedRow = originalRow.slice().reverse();
            const { processedLine: slidReversed, moves: reversedMoves } = slideRowOrColumn(reversedRow, r, false, true);
            const finalRow = slidReversed.slice().reverse();
            if (grid[r].toString() !== finalRow.toString()) moved = true;
            grid[r] = finalRow;
            moveMap.push(...reversedMoves);
        }
    } else if (dir === 'up') {
        for (let c = 0; c < SIZE; c++) {
            const originalCol = grid.map(row => row[c]);
            const { processedLine: newCol, moves } = slideRowOrColumn(originalCol, c, true, false);
            for (let r = 0; r < SIZE; r++) {
                if (grid[r][c] !== newCol[r]) moved = true;
                grid[r][c] = newCol[r];
            }
            moveMap.push(...moves);
        }
    } else if (dir === 'down') {
        for (let c = 0; c < SIZE; c++) {
            const originalCol = grid.map(row => row[c]);
            const reversedCol = originalCol.slice().reverse();
            const { processedLine: slidReversed, moves: reversedMoves } = slideRowOrColumn(reversedCol, c, true, true);
            const finalCol = slidReversed.slice().reverse();
            for (let r = 0; r < SIZE; r++) {
                if (grid[r][c] !== finalCol[r]) moved = true;
                grid[r][c] = finalCol[r];
            }
            moveMap.push(...reversedMoves);
        }
    }

    if (moved) {
        updateScore(addScore);
        animateMove(before, grid, moveMap, () => {
            addRandomTile();
            drawTiles(); 
            if (isGameOver()) showGameOver();
        });
    } else {
        drawTiles(); // Ensure board is consistent even if no move
    }
}

function animateMove(beforeGrid, afterGrid, moves, callback) {
    const animationPromises = [];

    moves.forEach(move => {
        const [fromR, fromC] = move.from;
        const [toR, toC] = move.to;
        
        // Find the ACTUAL tile element that was at fromR, fromC
        // Its ID should be `tile-${fromR}-${fromC}` from the previous drawTiles/animateMove cycle
        const tileElementId = `tile-${fromR}-${fromC}`;
        const tileElement = document.getElementById(tileElementId);

        if (!tileElement) {
            // This can happen if a move object is generated for a non-existent tile (e.g. logic error in slideRowOrColumn)
            // Or if the tile was already removed (e.g. part of a double merge not handled by slideRowOrColumn)
            // console.warn(`animateMove: Tile element not found for ID ${tileElementId} for move from ${fromR},${fromC} to ${toR},${toC}`);
            return; 
        }

        // Ensure moving tiles are visually on top during animation
        tileElement.style.zIndex = 2;

        animationPromises.push(new Promise(resolve => {
            const animOptions = {
                targets: tileElement,
                left: `${BOARD_PADDING + toC * 76}px`,
                top: `${BOARD_PADDING + toR * 76}px`,
                duration: 160,
                easing: 'easeInOutQuad',
                complete: () => {
                    if (move.disappears) {
                        tileElement.remove();
                    } else {
                        // Update the tile to its final state
                        tileElement.id = `tile-${toR}-${toC}`; // Update ID to reflect new position
                        tileElement.setAttribute('data-row', toR);
                        tileElement.setAttribute('data-col', toC);
                        // tileElement.className = 'tile'; // Ensure class is just 'tile'
                        // zIndex will be reset globally after all animations

                        if (move.mergedValue) {
                            // This tile is the target of a merge
                            tileElement.textContent = move.mergedValue;
                            tileElement.setAttribute('data-value', move.mergedValue);
                            tileElement.style.background = COLORS[move.mergedValue] || '#fff';
                            tileElement.style.color = move.mergedValue <= 4 ? '#e8f5e9' : '#183c1a';
                            // Apply merge pop animation
                            anime({
                                targets: tileElement,
                                scale: [1.25, 1],
                                duration: 200,
                                easing: 'easeOutElastic(1, .7)',
                                complete: resolve
                            });
                            return; // Resolve is handled by the inner anime
                        } 
                        // For simple moves, data-value and textContent don't change here,
                        // they were already correct for the tile being moved.
                    }
                    resolve();
                }
            };

            if (move.disappears) {
                animOptions.opacity = [1, 0];
                // Optional: add a slight scale down for disappearing tile
                // animOptions.scale = 0.8;
            }
            
            anime(animOptions);
        })); 
    });

    Promise.all(animationPromises).then(() => {
        // Reset z-index for all tiles to a common layer after animations complete
        document.querySelectorAll('.tile').forEach(t => t.style.zIndex = 1);
        // All animations complete, now call the main callback which will draw the final state
        callback(); 
    });
}

function isGameOver() {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return false; // Empty cell
            if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false; // Can merge right
            if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false; // Can merge down
        }
    }
    return true;
}

function showGameOver() {
    // 暫停背景音樂
    if (bgm) {
        bgm.pause();
    }
    
    let over = document.getElementById('gameover');
    if (!over) {
        over = document.createElement('div');
        over.id = 'gameover';
        over.textContent = 'Game Over!';
        // Center it on the board
        over.style.position = 'absolute';
        over.style.top = '50%';
        over.style.left = '50%';
        over.style.transform = 'translate(-50%, -50%)';
        over.style.width = '200px'; 
        over.style.height = '100px';
        over.style.backgroundColor = 'rgba(0,0,0,0.7)';
        over.style.color = 'white';
        over.style.fontSize = '24px';
        over.style.display = 'flex';
        over.style.alignItems = 'center';
        over.style.justifyContent = 'center';
        over.style.borderRadius = '5px';
        over.style.zIndex = 100; // Ensure it's on top
        board.appendChild(over);
    }
    over.style.display = 'flex';
}

function startGame() {
    // 重置並播放背景音樂
    if (bgm) {
        bgm.currentTime = 0; // 重設音樂到開頭
        bgm.volume = 0.1; // 設置音量為 30%
        const playPromise = bgm.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('自動播放被阻止，請點擊頁面播放音樂');
            });
        }
    }

    grid = emptyGrid();
    score = 0;
    scoreValue.textContent = '0';
    drawBoard();
    addRandomTile();
    addRandomTile();
    drawTiles();
    document.getElementById('gameover')?.remove();
}

// 點擊頁面時播放音樂（解決自動播放限制）
document.addEventListener('click', function playMusic() {
    if (bgm && bgm.paused) {
        bgm.play().catch(e => console.log('播放音樂失敗'));
    }
    // 移除事件監聽器，只執行一次
    document.removeEventListener('click', playMusic);
}, { once: true });

window.addEventListener('keydown', e => {
    if (document.getElementById('gameover')?.style.display === 'flex') return;

    // Standard arrow keys
    if (e.key === "ArrowLeft") move('left');
    if (e.key === "ArrowRight") move('right');
    if (e.key === "ArrowUp") move('up');
    if (e.key === "ArrowDown") move('down');

    // WASD keys
    if (e.key === "a" || e.key === "A") move('left');
    if (e.key === "d" || e.key === "D") move('right');
    if (e.key === "w" || e.key === "W") move('up');
    if (e.key === "s" || e.key === "S") move('down');
});

restartBtn.onclick = startGame;
window.onload = startGame;
