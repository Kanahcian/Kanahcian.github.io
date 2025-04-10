// 側邊欄和底部卡片控制
document.addEventListener("DOMContentLoaded", function() {
    // 獲取DOM元素
    const sidebar = document.getElementById("sidebar");
    const sidebarClose = document.getElementById("sidebar-close");
    const bottomCard = document.getElementById("bottom-card");
    const bottomCardClose = document.getElementById("bottom-card-close");
    const dragHandle = document.querySelector(".drag-handle");
    const locateBtn = document.getElementById("locate-btn");
    
    // 家訪紀錄按鈕元素
    const showRecordsBtn = document.getElementById("show-records-btn");
    const mobileShowRecordsBtn = document.getElementById("mobile-show-records-btn");
    
    // 導覽按鈕元素
    const prevRecordBtn = document.getElementById("prev-record");
    const nextRecordBtn = document.getElementById("next-record");
    const mobilePrevRecordBtn = document.getElementById("mobile-prev-record");
    const mobileNextRecordBtn = document.getElementById("mobile-next-record");
    
    // 紀錄內容區塊
    const recordsSectionDesktop = document.getElementById("records-section");
    const recordsSectionMobile = document.getElementById("mobile-records-section");
    
    // 地點基本信息區塊
    const locationInfoDesktop = document.getElementById("location-info");
    const locationInfoMobile = document.getElementById("mobile-location-info");
    
    // 加載動畫區塊
    const loadingIndicatorDesktop = document.getElementById("records-loading-indicator");
    const loadingIndicatorMobile = document.getElementById("mobile-records-loading-indicator");
    
    // 全局變數，用於存儲當前位置的所有紀錄和當前顯示的紀錄索引
    window.currentRecords = [];
    window.currentRecordIndex = 0;
    window.recordsVisible = false; // 追蹤紀錄區塊是否可見
    
    // 切換家訪紀錄顯示狀態
    function toggleRecordsVisibility(visible) {
        window.recordsVisible = visible;
        
        // 更新桌面版顯示
        if (recordsSectionDesktop) {
            recordsSectionDesktop.style.display = visible ? "block" : "none";
        }
        
        // 更新手機版顯示
        if (recordsSectionMobile) {
            recordsSectionMobile.style.display = visible ? "block" : "none";
        }
        
        // 切換地點基本信息的顯示/隱藏狀態（與記錄區塊相反）
        if (locationInfoDesktop) {
            locationInfoDesktop.style.display = visible ? "none" : "block";
        }
        
        if (locationInfoMobile) {
            locationInfoMobile.style.display = visible ? "none" : "block";
        }
        
        // 更新按鈕文字
        if (showRecordsBtn) {
            showRecordsBtn.innerHTML = visible ? 
                '<i class="fas fa-map-marker-alt"></i> 返回地點資訊' : 
                '<i class="fas fa-clipboard-list"></i> 顯示家訪紀錄';
        }
        
        if (mobileShowRecordsBtn) {
            mobileShowRecordsBtn.innerHTML = visible ? 
                '<i class="fas fa-map-marker-alt"></i> 返回地點資訊' : 
                '<i class="fas fa-clipboard-list"></i> 顯示家訪紀錄';
        }
        
        // 如果顯示紀錄，確保更新紀錄內容
        if (visible) {
            window.updateRecordContent();
        }
    }
    
    // 初始隱藏紀錄區塊
    toggleRecordsVisibility(false);
    
    // 顯示/隱藏加載指示器
    function toggleLoadingIndicator(show) {
        // 桌面版加載指示器
        if (loadingIndicatorDesktop) {
            loadingIndicatorDesktop.style.display = show ? "flex" : "none";
        }
        
        // 手機版加載指示器
        if (loadingIndicatorMobile) {
            loadingIndicatorMobile.style.display = show ? "flex" : "none";
        }
        
        // 更新按鈕狀態
        if (showRecordsBtn) {
            if (show) {
                showRecordsBtn.classList.add("loading");
                showRecordsBtn.disabled = true;
                showRecordsBtn.innerHTML = '<i class="fas fa-spinner"></i> 獲取家訪紀錄中...';
            } else {
                showRecordsBtn.classList.remove("loading");
                showRecordsBtn.disabled = false;
                showRecordsBtn.innerHTML = '<i class="fas fa-clipboard-list"></i> 顯示家訪紀錄';
            }
        }
        
        if (mobileShowRecordsBtn) {
            if (show) {
                mobileShowRecordsBtn.classList.add("loading");
                mobileShowRecordsBtn.disabled = true;
                mobileShowRecordsBtn.innerHTML = '<i class="fas fa-spinner"></i> 獲取家訪紀錄中...';
            } else {
                mobileShowRecordsBtn.classList.remove("loading");
                mobileShowRecordsBtn.disabled = false;
                mobileShowRecordsBtn.innerHTML = '<i class="fas fa-clipboard-list"></i> 顯示家訪紀錄';
            }
        }
    }
    
    // 檢查加載狀態的間隔（每200毫秒檢查一次）
    let loadingCheckInterval = null;
    
    // 開始監控記錄加載狀態
    function startLoadingCheck() {
        // 先清除可能存在的舊計時器
        if (loadingCheckInterval) {
            clearInterval(loadingCheckInterval);
        }
        
        // 設置加載狀態
        toggleLoadingIndicator(true);
        
        // 開始定期檢查
        loadingCheckInterval = setInterval(() => {
            if (typeof window.recordsLoading !== 'undefined' && !window.recordsLoading) {
                // 加載完成，停止檢查並更新UI
                clearInterval(loadingCheckInterval);
                loadingCheckInterval = null;
                toggleLoadingIndicator(false);
                updateNavigationState();
            }
        }, 200);
        
        // 設置安全超時（10秒後強制停止等待）
        setTimeout(() => {
            if (loadingCheckInterval) {
                clearInterval(loadingCheckInterval);
                loadingCheckInterval = null;
                toggleLoadingIndicator(false);
                updateNavigationState();
                
                console.warn("記錄加載超時，已停止等待");
            }
        }, 10000);
    }
    
    // 綁定顯示/隱藏家訪紀錄按鈕事件
    if (showRecordsBtn) {
        showRecordsBtn.addEventListener("click", function() {
            toggleRecordsVisibility(!window.recordsVisible);
        });
    }
    
    if (mobileShowRecordsBtn) {
        mobileShowRecordsBtn.addEventListener("click", function() {
            toggleRecordsVisibility(!window.recordsVisible);
        });
    }
    
    // 關閉側邊欄
    sidebarClose.addEventListener("click", function() {
        sidebar.classList.remove("active");
    });
    
    // 點擊底部卡片的拖動把手時收起
    dragHandle.addEventListener("click", function() {
        if (bottomCard.classList.contains("active")) {
            bottomCard.classList.remove("active");
            // 恢復按鈕位置
            adjustButtonPositions(false);
        }
    });
    
    // 調整按鈕位置的函數
    function adjustButtonPositions(isCardActive) {
        if (window.innerWidth <= 1024) {
            const mapSwitchBtn = document.querySelector(".map-switch-button");
    
            if (isCardActive) {
                locateBtn.style.display = "none";  // 隱藏定位按鈕
                if (mapSwitchBtn) {
                    mapSwitchBtn.style.display = "none"; // 隱藏地圖切換按鈕
                }
            } else {
                locateBtn.style.display = "flex";  // 改為 flex 確保重新顯示
                if (mapSwitchBtn) {
                    mapSwitchBtn.style.display = "flex";
                }
            }
        }
    }
    
    // 更新紀錄導覽狀態
    function updateNavigationState() {
        const totalRecords = window.currentRecords.length;
        const currentPosition = window.currentRecordIndex + 1;
        
        // 更新紀錄指示器
        document.getElementById("record-indicator").textContent = `紀錄 ${currentPosition}/${totalRecords}`;
        document.getElementById("mobile-record-indicator").textContent = `紀錄 ${currentPosition}/${totalRecords}`;
        
        // 設置導覽按鈕狀態
        prevRecordBtn.disabled = window.currentRecordIndex === 0;
        nextRecordBtn.disabled = window.currentRecordIndex === totalRecords - 1;
        mobilePrevRecordBtn.disabled = window.currentRecordIndex === 0;
        mobileNextRecordBtn.disabled = window.currentRecordIndex === totalRecords - 1;
        
        // 根據記錄數量和加載狀態顯示或隱藏家訪紀錄按鈕
        const hasRecords = totalRecords > 0;
        
        if (showRecordsBtn) {
            if (window.recordsLoading) {
                // 如果正在加載，顯示加載狀態
                showRecordsBtn.style.display = "block";
            } else {
                // 加載完成，根據是否有記錄決定顯示
                showRecordsBtn.style.display = hasRecords ? "block" : "none";
            }
        }
        
        if (mobileShowRecordsBtn) {
            if (window.recordsLoading) {
                // 如果正在加載，顯示加載狀態
                mobileShowRecordsBtn.style.display = "block";
            } else {
                // 加載完成，根據是否有記錄決定顯示
                mobileShowRecordsBtn.style.display = hasRecords ? "block" : "none";
            }
        }
    }

    // 創建參與者標籤
    function createParticipantTags(participants, type) {
        console.log(`創建${type}標籤，數據:`, participants);
        if (!participants || participants.length === 0) {
            return `<span class="empty-info">無${type === 'student' ? '學生' : '村民'}參與</span>`;
        }
        
        // 為村民標籤添加特殊樣式和提示
        let tags = '';
        
        if (type === 'villager') {
            console.log("創建村民標籤，數據:", participants);
            
            // 檢查是否有村民ID數據
            if (window.villagerIdMap && Object.keys(window.villagerIdMap).length > 0) {
                // 使用緩存的村民ID
                tags = participants.map(person => {
                    const name = typeof person === 'object' ? person.name : person;
                    const id = window.villagerIdMap[name] || 1;
                    return `<span class="participant-tag ${type}" data-id="${id}" title="點擊查看詳細資訊">${name}</span>`;
                }).join('');
            } else {
                // 如果沒有ID緩存，創建臨時映射表
                window.villagerIdMap = {};
                
                // 假設participants可能是對象數組或字符串數組
                tags = participants.map((person, index) => {
                    // 如果是對象並且有id屬性
                    if (typeof person === 'object' && person.id) {
                        // 緩存ID以便後續使用
                        window.villagerIdMap[person.name] = person.id;
                        return `<span class="participant-tag ${type}" data-id="${person.id}" title="點擊查看詳細資訊">${person.name}</span>`;
                    } else {
                        // 如果只是字符串，使用索引+1作為臨時ID
                        // 注意：這可能導致錯誤的ID映射，僅作為後備方案
                        const name = typeof person === 'object' ? person.name : person;
                        const tempId = index + 1; // 臨時ID
                        return `<span class="participant-tag ${type}" data-id="${tempId}" title="點擊查看詳細資訊">${name}</span>`;
                    }
                }).join('');
            }
            
            // 為村民標籤添加提示（如果是桌面版）
            if (window.innerWidth > 1024) {
                tags += `
                <span class="participant-hint">
                    <i class="fas fa-info-circle"></i> 點擊村民名稱查看詳情
                </span>`;
            }
        } else {
            // 學生標籤，普通顯示
            tags = participants.map(person => 
                `<span class="participant-tag ${type}">${typeof person === 'object' ? person.name : person}</span>`
            ).join('');
        }
        
        return tags;
    }
    
    // 更新顯示的紀錄內容 - 垂直布局
    window.updateRecordContent = function() {
        // 如果紀錄不可見，不需要更新內容
        if (!window.recordsVisible) return;
        
        const record = window.currentRecords[window.currentRecordIndex];
        if (!record) return;
        
        // 格式化日期顯示
        const dateText = record.date || "未記錄";
        const semesterText = record.semester || "未記錄";
        
        // ======== 桌面版更新 ========
        
        // 1. 建立垂直布局資訊區塊
        const infoHtml = `
            <div class="record-title">
                <h3>訪視紀錄</h3>
                <span class="record-date">${dateText}</span>
            </div>
            <div class="info-section">
                <!-- 學期 -->
                <div class="info-item semester">
                    <div class="info-item-title">
                        <i class="fas fa-book"></i>
                        <span>學期</span>
                    </div>
                    <div class="info-item-content">
                        ${semesterText}
                    </div>
                </div>
                
                <!-- 參與學生 -->
                <div class="info-item students">
                    <div class="info-item-title">
                        <i class="fas fa-users"></i>
                        <span>參與學生</span>
                    </div>
                    <div class="info-item-content">
                        ${createParticipantTags(record.students, 'student')}
                    </div>
                </div>
                
                <!-- 村民 -->
                <div class="info-item villagers">
                    <div class="info-item-title">
                        <i class="fas fa-home"></i>
                        <span>村民</span>
                    </div>
                    <div class="info-item-content">
                        ${createParticipantTags(record.villagers, 'villager')}
                    </div>
                </div>
            </div>
        `;
        
        // 更新桌面版整合資訊區塊
        document.getElementById("integrated-info").innerHTML = infoHtml;
        
        // 2. 更新照片
        const photosContainer = document.getElementById("location-photos");
        photosContainer.innerHTML = "";
        
        if (record.photo) {
            const img = document.createElement("img");
            img.src = record.photo;
            img.alt = "訪視照片";
            img.onerror = function() {
                this.onerror = null;
                this.src = 'assets/images/photo-error.png';
                console.error("照片載入失敗:", record.photo);
                photosContainer.innerHTML = "<p class='photo-error'>照片載入失敗</p>";
            };
            photosContainer.appendChild(img);
        } else {
            photosContainer.innerHTML = "<p>暫無照片</p>";
        }
        
        // 3. 更新訪視筆記
        document.getElementById("visit-notes").textContent = record.description || "無訪視筆記";
        
        // ======== 手機版更新 ========
        
        // 1. 更新手機版整合資訊區塊
        document.getElementById("mobile-integrated-info").innerHTML = infoHtml;
        
        // 2. 更新手機版照片
        const mobilePhotosContainer = document.getElementById("mobile-location-photos");
        mobilePhotosContainer.innerHTML = "";
        
        if (record.photo) {
            const mobileImg = document.createElement("img");
            mobileImg.src = record.photo;
            mobileImg.alt = "訪視照片";
            mobileImg.onerror = function() {
                this.onerror = null;
                this.src = 'assets/images/photo-error.png';
                console.error("照片載入失敗:", record.photo);
                mobilePhotosContainer.innerHTML = "<p class='photo-error'>照片載入失敗</p>";
            };
            mobilePhotosContainer.appendChild(mobileImg);
        } else {
            mobilePhotosContainer.innerHTML = "<p>暫無照片</p>";
        }
        
        // 3. 更新手機版訪視筆記
        document.getElementById("mobile-visit-notes").textContent = record.description || "無訪視筆記";
        
        // 更新導覽狀態
        updateNavigationState();
    }
    
    // 綁定紀錄導覽按鈕事件
    prevRecordBtn.addEventListener("click", function() {
        if (window.currentRecordIndex > 0) {
            window.currentRecordIndex--;
            window.updateRecordContent();
        }
    });
    
    nextRecordBtn.addEventListener("click", function() {
        if (window.currentRecordIndex < window.currentRecords.length - 1) {
            window.currentRecordIndex++;
            window.updateRecordContent();
        }
    });
    
    mobilePrevRecordBtn.addEventListener("click", function() {
        if (window.currentRecordIndex > 0) {
            window.currentRecordIndex--;
            window.updateRecordContent();
        }
    });
    
    mobileNextRecordBtn.addEventListener("click", function() {
        if (window.currentRecordIndex < window.currentRecords.length - 1) {
            window.currentRecordIndex++;
            window.updateRecordContent();
        }
    });
    
    // 公開更新側邊欄/底部卡片內容的函數
    window.updateSidebarContent = function(locationData) {
        // 更新地點名稱（對所有紀錄都相同）
        document.getElementById("location-name").textContent = locationData.name || "未命名地點";
        document.getElementById("mobile-location-name").textContent = locationData.name || "未命名地點";
        
        // 更新簡介描述（如果有的話）
        if (locationData.brief_description) {
            // 顯示簡介區塊
            document.getElementById("location-brief").style.display = "block";
            document.getElementById("mobile-location-brief").style.display = "block";
            
            // 設定簡介內容
            document.getElementById("brief-description").textContent = locationData.brief_description;
            document.getElementById("mobile-brief-description").textContent = locationData.brief_description;
        } else {
            // 隱藏簡介區塊
            document.getElementById("location-brief").style.display = "none";
            document.getElementById("mobile-location-brief").style.display = "none";
        }
        
        // 如果正在加載記錄，啟動加載檢查
        if (typeof window.recordsLoading !== 'undefined' && window.recordsLoading) {
            startLoadingCheck();
        } else {
            // 沒有加載或加載已完成
            toggleLoadingIndicator(false);
        }
        
        // 保存所有紀錄並重置索引
        if (locationData.records && locationData.records.length > 0) {
            window.currentRecords = locationData.records;
        } else {
            // 如果沒有提供紀錄列表，創建一個空陣列
            window.currentRecords = [];
        }
        
        // 重置為第一筆紀錄
        window.currentRecordIndex = 0;
        
        // 初始顯示地點信息，隱藏紀錄區塊
        toggleRecordsVisibility(false);
        
        // 更新導覽狀態
        updateNavigationState();
        
        // 根據設備顯示相應界面
        if (window.innerWidth <= 1024) {
            bottomCard.classList.add("active");
            adjustButtonPositions(true);
        } else {
            sidebar.classList.add("active");
        }
    }
    
    // 點擊關閉按鈕時隱藏底部卡片並恢復按鈕
    bottomCardClose.addEventListener("click", function() {
        bottomCard.classList.remove("active");
        adjustButtonPositions(false); // 確保按鈕恢復顯示
    });
});
