# 2048 Game (v0.1)

一個基於瀏覽器的 2048 益智遊戲。合併相同數字的方塊，目標是獲得 2048 方塊！

![Game Screenshot](screenshot.png)  
*遊戲截圖*

## 功能特點 (v0.1)

- 🎮 流暢的遊戲動畫效果
- 📊 分數計算與顯示
- 🎵 背景音樂與音效
  - 遊戲背景音樂
  - 方塊合併音效
- 🎮 遊戲控制
  - 鍵盤方向鍵（↑, →, ↓, ←）控制方塊移動
  - 重新開始按鈕
- 📱 響應式設計，支援各種裝置
- 🎨 簡潔直觀的使用者介面

## 遊戲規則

1. 使用 **方向鍵** 移動所有方塊
2. 當兩個相同數字的方塊相撞時，它們會合併成一個
3. 每次移動後，會隨機在空白處出現一個新方塊（2 或 4）
4. 當沒有移動空間時遊戲結束
5. 目標是獲得 2048 方塊！

## 操作說明

- **方向鍵 (↑, →, ↓, ←)**: 移動方塊
- **重新開始按鈕**: 開始新遊戲

## 開始遊戲

### 環境需求

- 現代網頁瀏覽器 (Chrome, Firefox, Safari, Edge 等)

### 安裝步驟

1. 複製儲存庫：
   ```bash
   git clone https://github.com/yshung1971/2048-game.git
   ```
2. 進入專案目錄
3. 用瀏覽器開啟 `index.html` 檔案

## 音效設定

- 背景音樂會在遊戲開始時自動播放
- 若瀏覽器阻止自動播放，請點擊遊戲畫面以啟用音效
- 合併方塊時會播放音效

## Game Controls

- **Arrow Keys (↑, →, ↓, ←)**: Move tiles in the corresponding direction
- **Restart Button**: Start a new game

## 專案結構

- `index.html` - 主 HTML 檔案
- `game.js` - 遊戲邏輯與渲染
- `merged.mp3` - 方塊合併音效
- `像素冒險樂園.mp3` - 背景音樂

## 未來更新計畫

- [ ] 添加更多音效（移動、遊戲結束等）
- [ ] 實現最高分記錄功能
- [ ] 添加動畫效果
- [ ] 增加遊戲難度選擇
- [ ] 支援觸控操作
- [ ] 添加成就系統

## 貢獻指南

歡迎提交問題和拉取請求！請確保您的代碼符合專案的編碼風格。

## 授權

[MIT License](LICENSE)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Original game by Gabriele Cirulli
- Inspired by 1024 by Veewo Studio
