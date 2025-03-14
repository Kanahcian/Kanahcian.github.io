// 滑動記錄導航功能
document.addEventListener("DOMContentLoaded", function() {
    // 等待原始sidebar.js完全加載（使用短延遲確保DOM元素已初始化）
    setTimeout(initSwipeNavigation, 500);
    
    function initSwipeNavigation() {
        console.log("初始化滑動導航...");
        
        // 獲取底部卡片元素
        const bottomCard = document.getElementById("bottom-card");
        if (!bottomCard) {
            console.warn("找不到底部卡片元素，無法初始化滑動功能");
            return;
        }
        
        // 將原始sidebar.js中的局部變數暴露到window對象
        // 這樣我們的滑動功能可以訪問這些變數
        exposeOriginalVariables();
        
        // 變數用於追蹤觸摸事件
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50; // 最小滑動距離（像素）
        
        // 為整個底部卡片添加觸摸事件
        bottomCard.addEventListener("touchstart", handleTouchStart, false);
        bottomCard.addEventListener("touchend", handleTouchEnd, false);
        
        // 處理觸摸開始事件
        function handleTouchStart(event) {
            touchStartX = event.changedTouches[0].screenX;
        }
        
        // 處理觸摸結束事件
        function handleTouchEnd(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        }
        
        // 處理滑動方向並相應地導航
        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            
            // 檢查滑動是否足夠長
            if (Math.abs(swipeDistance) < minSwipeDistance) {
                return;
            }
            
            if (swipeDistance > 0) {
                // 向右滑動（上一條記錄）
                const mobilePrevBtn = document.getElementById("mobile-prev-record");
                if (mobilePrevBtn && !mobilePrevBtn.disabled) {
                    animateContent('right');
                    mobilePrevBtn.click();
                }
            } else {
                // 向左滑動（下一條記錄）
                const mobileNextBtn = document.getElementById("mobile-next-record");
                if (mobileNextBtn && !mobileNextBtn.disabled) {
                    animateContent('left');
                    mobileNextBtn.click();
                }
            }
        }
        
        // 為內容切換添加動畫效果
        function animateContent(direction) {
            const contentElements = [
                document.getElementById("mobile-location-photos"),
                bottomCard.querySelector(".visit-info"),
                bottomCard.querySelector(".location-notes")
            ];
            
            const translateValue = direction === 'left' ? '-15px' : '15px';
            
            // 應用過渡效果
            contentElements.forEach(element => {
                if (element) {
                    element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                    element.style.opacity = '0.5';
                    element.style.transform = `translateX(${translateValue})`;
                    
                    // 動畫完成後重置樣式
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateX(0)';
                    }, 250);
                }
            });
        }
        
        // 添加圓點指示器
        function addIndicatorDots() {
            // 建立指示器容器
            const indicatorContainer = document.createElement("div");
            indicatorContainer.className = "swipe-indicators";
            
            // 加入到記錄指示器下方
            const recordIndicator = document.getElementById("mobile-record-indicator");
            if (recordIndicator && recordIndicator.parentNode) {
                // 檢查是否已存在指示器
                if (!document.querySelector(".swipe-indicators")) {
                    recordIndicator.parentNode.insertBefore(indicatorContainer, recordIndicator.nextSibling);
                    
                    // 添加滑動提示
                    const swipeHint = document.createElement("div");
                    swipeHint.className = "swipe-hint";
                    swipeHint.textContent = "← 左右滑動切換紀錄 →";
                    indicatorContainer.parentNode.insertBefore(swipeHint, indicatorContainer.nextSibling);
                    
                    // 5秒後淡出提示
                    setTimeout(() => {
                        swipeHint.style.opacity = "0";
                    }, 5000);
                }
            }

            // 更新指示器圓點
            function updateDots() {
                const container = document.querySelector(".swipe-indicators");
                if (!container) return;
                
                // 從sidebar.js獲取最新數據
                const records = window.currentRecords || [];
                const currentIndex = window.currentRecordIndex || 0;
                
                // 清空容器
                container.innerHTML = "";
                
                // 建立新的圓點
                for (let i = 0; i < records.length; i++) {
                    const dot = document.createElement("div");
                    dot.className = "swipe-indicator" + (i === currentIndex ? " active" : "");
                    container.appendChild(dot);
                }
            }
            
            // 初始更新
            updateDots();
            
            // 監聽記錄變化
            const originalUpdateRecordContent = window.updateRecordContent;
            if (originalUpdateRecordContent && typeof originalUpdateRecordContent === 'function') {
                window.updateRecordContent = function() {
                    originalUpdateRecordContent.apply(this, arguments);
                    updateDots();
                };
            }
        }
        
        // 添加樣式
        function addSwipeStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .swipe-indicators {
                    display: flex;
                    justify-content: center;
                    margin: 5px 0;
                }
                .swipe-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #ddd;
                    margin: 0 4px;
                    transition: background-color 0.3s ease;
                }
                .swipe-indicator.active {
                    background-color: #4a8fe7;
                }
                .swipe-hint {
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                    margin: 5px 0;
                    opacity: 1;
                    transition: opacity 5s ease;
                }
                
                /* 確保底部卡片能夠捕獲觸摸事件 */
                .bottom-card {
                    touch-action: pan-y; /* 允許垂直滾動但捕獲水平滑動 */
                }
                .card-content {
                    touch-action: pan-y;
                }
                
                /* 內容過渡效果 */
                #mobile-location-photos, 
                .visit-info, 
                .location-notes {
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // 暴露原始sidebar.js中的變數到全局範圍
        function exposeOriginalVariables() {
            // 監視updateRecordContent函數
            if (typeof window.updateRecordContent !== 'function') {
                // 等待原始函數出現
                const checkInterval = setInterval(() => {
                    if (typeof window.updateRecordContent === 'function') {
                        clearInterval(checkInterval);
                        setupGlobalVariables();
                    }
                }, 100);
                
                // 5秒後如果仍未找到，則停止嘗試
                setTimeout(() => clearInterval(checkInterval), 5000);
            } else {
                setupGlobalVariables();
            }
        }
        
        function setupGlobalVariables() {
            // 監視updateSidebarContent函數
            const originalUpdateSidebarContent = window.updateSidebarContent;
            if (originalUpdateSidebarContent && typeof originalUpdateSidebarContent === 'function') {
                window.updateSidebarContent = function(locationData) {
                    // 調用原始函數
                    originalUpdateSidebarContent.apply(this, arguments);
                    
                    // 從原始sidebar.js中讀取變數
                    // 注意：這裡使用setTimeout確保我們能訪問到更新後的變數
                    setTimeout(() => {
                        // 從DOM讀取數據更新指示點
                        const dotsContainer = document.querySelector(".swipe-indicators");
                        if (dotsContainer) {
                            const recordIndicator = document.getElementById("mobile-record-indicator");
                            if (recordIndicator) {
                                const text = recordIndicator.textContent || "";
                                const match = text.match(/(\d+)\/(\d+)/);
                                if (match && match.length === 3) {
                                    const currentPos = parseInt(match[1], 10) - 1;
                                    const total = parseInt(match[2], 10);
                                    
                                    // 清除現有點
                                    dotsContainer.innerHTML = "";
                                    
                                    // 創建新點
                                    for (let i = 0; i < total; i++) {
                                        const dot = document.createElement("div");
                                        dot.className = "swipe-indicator" + (i === currentPos ? " active" : "");
                                        dotsContainer.appendChild(dot);
                                    }
                                }
                            }
                        }
                    }, 100);
                };
            }
        }
        
        // 初始化功能
        addSwipeStyles();
        addIndicatorDots();
        console.log("滑動導航初始化完成");
    }
});