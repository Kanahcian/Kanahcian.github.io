// 搜尋欄功能
(function() {
    // 確保DOM完全加載後再執行
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSearch);
    } else {
        // 如果已經加載完成，立即執行
        initSearch();
    }
    
    // 等待一小段時間確保所有元素都已加載
    setTimeout(initSearch, 500);
    
    function initSearch() {
        console.log("嘗試初始化搜尋功能...");
        
        // 獲取搜尋欄元素（嘗試多種選擇器）
        const searchInput = document.getElementById("search-input") || 
                           document.querySelector(".search-container input") ||
                           document.querySelector("input[placeholder*='搜尋']");
        
        const searchContainer = document.querySelector(".search-container");
        
        // 檢查元素是否存在
        if (!searchInput) {
            console.error("找不到搜尋輸入欄位 - 請確認HTML中有正確的ID或選擇器");
            return;
        }
        
        if (!searchContainer) {
            console.error("找不到搜尋容器 (.search-container)");
            return;
        }
        
        console.log("搜尋元素已找到:", searchInput);
        
        // 全域變數儲存所有地點資料
        let allLocations = [];
        
        // 創建搜尋建議下拉列表元素
        const suggestionsDropdown = document.createElement("div");
        suggestionsDropdown.className = "search-suggestions";
        suggestionsDropdown.style.display = "none";
        searchContainer.appendChild(suggestionsDropdown);
        
        console.log("建議下拉列表已創建");
        
        // 計算字串相似度（使用 Levenshtein 距離算法）
        function levenshteinDistance(a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;
            
            const matrix = [];
            
            // 初始化矩陣
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }
            
            // 填充矩陣
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // 替換
                            matrix[i][j - 1] + 1,     // 插入
                            matrix[i - 1][j] + 1      // 刪除
                        );
                    }
                }
            }
            
            return matrix[b.length][a.length];
        }
        
        // 計算相似度分數（0-100，100為完全匹配）
        function similarityScore(str1, str2) {
            // 轉換為小寫以進行不區分大小寫的比較
            const s1 = str1.toLowerCase();
            const s2 = str2.toLowerCase();
            
            // 檢查包含關係
            if (s1.includes(s2) || s2.includes(s1)) {
                const longer = s1.length > s2.length ? s1 : s2;
                const shorter = s1.length > s2.length ? s2 : s1;
                
                // 如果較短的字符串完全包含在較長的字符串中
                // 給予較高的相似度分數，但仍根據長度差異進行調整
                const lengthRatio = shorter.length / longer.length;
                return 70 + (lengthRatio * 30); // 分數範圍從70到100
            }
            
            // 對於不包含的情況，使用編輯距離
            const longer = s1.length > s2.length ? s1 : s2;
            const shorter = s1.length > s2.length ? s2 : s1;
            const longerLength = longer.length;
            
            if (longerLength === 0) {
                return 100;
            }
            
            // 計算距離
            const distance = levenshteinDistance(longer, shorter);
            
            // 計算相似度分數
            return (longerLength - distance) / longerLength * 100;
        }
        
        // 搜尋地點
        function searchLocations(query) {
            if (!query || query.trim().length < 1) {
                return [];
            }
            
            // 將查詢文字標準化
            query = query.trim().toLowerCase();
            
            // 先嘗試精確匹配、開頭匹配或包含匹配
            const exactMatches = allLocations.filter(location => {
                const name = location.name.toLowerCase();
                return name === query || name.startsWith(query) || name.includes(query);
            });
            
            // 如果有精確匹配，直接返回
            if (exactMatches.length > 0) {
                // 排序：完全匹配 > 開頭匹配 > 包含匹配
                return exactMatches.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    
                    // 完全匹配最優先
                    if (nameA === query && nameB !== query) return -1;
                    if (nameA !== query && nameB === query) return 1;
                    
                    // 其次是開頭匹配
                    if (nameA.startsWith(query) && !nameB.startsWith(query)) return -1;
                    if (!nameA.startsWith(query) && nameB.startsWith(query)) return 1;
                    
                    // 最後按名稱長度排序（較短的名稱可能更相關）
                    return nameA.length - nameB.length;
                });
            }
            
            // 否則進行模糊匹配
            const results = allLocations
                .map(location => {
                    // 計算相似度分數
                    const score = similarityScore(location.name.toLowerCase(), query);
                    
                    // 檢查是否為包含匹配
                    const isContained = location.name.toLowerCase().includes(query);
                    
                    // 計算匹配位置 (用於排序和顯示高亮)
                    const matchPosition = location.name.toLowerCase().indexOf(query);
                    
                    return { 
                        ...location, 
                        score, 
                        isContained,
                        matchPosition
                    };
                })
                .filter(item => item.score > 35 || item.isContained) // 相似度超過35%或包含關鍵字的結果
                .sort((a, b) => {
                    // 優先排序：
                    // 1. 包含關鍵字的結果
                    if (a.isContained && !b.isContained) return -1;
                    if (!a.isContained && b.isContained) return 1;
                    
                    // 2. 如果都包含，則按照匹配位置排序（越早出現越靠前）
                    if (a.isContained && b.isContained) {
                        if (a.matchPosition !== b.matchPosition) {
                            return a.matchPosition - b.matchPosition;
                        }
                    }
                    
                    // 3. 最後按相似度排序
                    return b.score - a.score;
                });
            
            // 只返回前 5 個結果
            return results.slice(0, 5);
        }
        
        // 更新搜尋建議
        function updateSuggestions(query) {
            console.log("更新搜尋建議:", query);
            
            if (!query || query.trim().length === 0) {
                suggestionsDropdown.innerHTML = "";
                suggestionsDropdown.style.display = "none";
                return;
            }
            
            const results = searchLocations(query);
            console.log("搜尋結果:", results.length);
            
            // 清空建議列表
            suggestionsDropdown.innerHTML = "";
            
            if (results.length === 0) {
                // 如果沒有結果但有查詢，顯示無結果提示
                const noResults = document.createElement("div");
                noResults.className = "suggestion-item no-results";
                noResults.textContent = `找不到「${query}」相關地點`;
                suggestionsDropdown.appendChild(noResults);
                suggestionsDropdown.style.display = "block";
                return;
            }
            
            // 創建建議列表項目
            results.forEach(location => {
                const suggestionItem = document.createElement("div");
                suggestionItem.className = "suggestion-item";
                
                // 顯示相似度分數
                const hasScore = typeof location.score !== 'undefined';
                suggestionItem.innerHTML = `
                    <span class="suggestion-name">${location.name}</span>
                    ${hasScore ? `<span class="suggestion-score">${Math.round(location.score)}%</span>` : ''}
                `;
                
                // 點擊建議項目時跳轉到相應地點
                suggestionItem.addEventListener("click", () => {
                    selectLocation(location);
                });
                
                suggestionsDropdown.appendChild(suggestionItem);
            });
            
            // 顯示建議列表，並確保正確的樣式
            suggestionsDropdown.style.display = "block";
            suggestionsDropdown.style.position = "absolute";
            suggestionsDropdown.style.width = "100%";
            suggestionsDropdown.style.zIndex = "1000";
            
            console.log("建議下拉列表已更新並顯示");
        }
        
        // 選擇地點並顯示詳情
        async function selectLocation(location) {
            // 更新搜尋欄文字
            searchInput.value = location.name;
            
            // 隱藏建議列表
            suggestionsDropdown.style.display = "none";
            
            // 移動地圖到該地點並觸發標記點擊事件
            const lat = parseFloat(location.latitude);
            const lon = parseFloat(location.longitude);
            
            if (!isNaN(lat) && !isNaN(lon)) {
                // 移動地圖到該地點
                if (typeof map !== 'undefined' && map) {
                    map.setView([lat, lon], 19);
                } else {
                    console.error("無法找到地圖對象");
                }
                
                try {
                    // 獲取該地點的家訪紀錄
                    const records = await fetchRecords(location.id);
                    
                    // 準備位置資料
                    const locationData = {
                        id: location.id,
                        name: location.name || "未命名地點",
                        brief_description: location.brief_description || "",
                        records: records.map(record => ({
                            recordId: record.recordid,
                            date: typeof formatDate === 'function' ? formatDate(record.date) : record.date,
                            visitor: record.account || "家訪小組",
                            semester: record.semester,
                            description: record.description || "無訪視筆記",
                            photo: typeof convertGoogleDriveLink === 'function' ? 
                                convertGoogleDriveLink(record.photo) : record.photo,
                            students: record.students || [],
                            villagers: record.villagers || []
                        }))
                    };
                    
                    // 更新側邊欄/底部卡片內容
                    if (typeof window.updateSidebarContent === 'function') {
                        window.updateSidebarContent(locationData);
                    } else {
                        console.error("找不到 updateSidebarContent 函數");
                    }
                } catch (error) {
                    console.error("獲取家訪記錄失敗:", error);
                }
            }
        }
        
        // 加載所有地點資料
        async function loadAllLocations() {
            console.log("開始載入地點資料...");
            
            try {
                // 定義 API URL
                let apiUrl;
                if (typeof apiBaseUrl !== 'undefined') {
                    apiUrl = `${apiBaseUrl}/api/locations`;
                } else {
                    console.warn("apiBaseUrl 未定義，使用相對路徑");
                    apiUrl = "/api/locations";
                }
                
                console.log("請求 API:", apiUrl);
                
                const response = await fetch(apiUrl);
                console.log("API 回應狀態:", response.status);
                
                if (!response.ok) {
                    throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log("API 回應資料:", data);
                
                if (data.status === "success") {
                    allLocations = data.data;
                    console.log("成功載入所有地點:", allLocations.length);
                } else {
                    console.error("獲取地點失敗", data);
                    // 加載測試數據作為備用
                    loadFallbackData();
                }
            } catch (error) {
                console.error("API 請求錯誤:", error);
                // 加載測試數據作為備用
                loadFallbackData();
            }
        }
        
        // 加載備用測試數據
        function loadFallbackData() {
            console.log("加載備用測試數據");
            allLocations = [
                { id: 1, name: "長老家", latitude: "23.001243", longitude: "121.116732", brief_description: "加納社區長老家，常有聚會活動" },
                { id: 2, name: "海岸部落", latitude: "23.021243", longitude: "121.226732", brief_description: "靠近海邊的傳統部落" },
                { id: 3, name: "山區學校", latitude: "23.031243", longitude: "121.336732", brief_description: "山區國小，學生較少" },
                { id: 4, name: "教會中心", latitude: "23.041243", longitude: "121.446732", brief_description: "社區重要宗教場所" },
                { id: 5, name: "長者活動中心", latitude: "23.051243", longitude: "121.556732", brief_description: "長者聚會場所" }
            ];
            console.log("已載入備用資料:", allLocations.length);
        }
        
        // 監聽搜尋欄輸入事件
        searchInput.addEventListener("input", () => {
            const query = searchInput.value;
            updateSuggestions(query);
            
            // 切換搜尋欄活動狀態
            if (query.trim().length > 0) {
                searchContainer.classList.add("active");
            } else {
                searchContainer.classList.remove("active");
            }
        });
        
        // 監聽搜尋欄焦點事件
        searchInput.addEventListener("focus", () => {
            searchContainer.classList.add("active");
            if (searchInput.value.trim()) {
                updateSuggestions(searchInput.value);
            }
        });
        
        // 監聽搜尋欄失焦事件
        searchInput.addEventListener("blur", () => {
            // 延遲移除活動狀態，讓使用者有時間點擊建議
            setTimeout(() => {
                if (!suggestionsDropdown.contains(document.activeElement)) {
                    searchContainer.classList.remove("active");
                }
            }, 200);
        });
        
        // 添加清除按鈕功能
        const searchClearBtn = document.getElementById("search-clear");
        if (searchClearBtn) {
            searchClearBtn.addEventListener("click", () => {
                searchInput.value = "";
                suggestionsDropdown.style.display = "none";
                searchContainer.classList.remove("active");
                searchInput.focus();
            });
        }
        
        // 點擊文檔其他地方時隱藏建議列表
        document.addEventListener("click", (e) => {
            // 如果點擊的不是搜尋欄或建議列表
            if (!searchContainer.contains(e.target)) {
                suggestionsDropdown.style.display = "none";
            }
        });
        
        // 監聽搜尋欄按鍵事件（回車鍵）
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (suggestionsDropdown.style.display === "block" && suggestionsDropdown.children.length > 0) {
                    // 選擇第一個建議
                    const firstResult = suggestionsDropdown.children[0];
                    firstResult.click();
                }
            }
        });
        
        // 初始化加載所有地點
        loadAllLocations();
        
        // 調試功能：在搜尋欄點擊三次快速添加測試數據
        let clickCount = 0;
        let lastClickTime = 0;
        
        searchInput.addEventListener("click", () => {
            const now = new Date().getTime();
            if (now - lastClickTime < 300) {
                clickCount++;
                if (clickCount >= 3) {
                    loadFallbackData();
                    // 顯示一個測試查詢的結果
                    searchInput.value = "長";
                    updateSuggestions("長");
                    clickCount = 0;
                }
            } else {
                clickCount = 1;
            }
            lastClickTime = now;
        });
        
        console.log("搜尋功能初始化完成");
    }
})();