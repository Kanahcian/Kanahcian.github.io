// 側邊欄和底部卡片控制
document.addEventListener("DOMContentLoaded", function() {
    // 獲取DOM元素
    const sidebar = document.getElementById("sidebar");
    const sidebarClose = document.getElementById("sidebar-close");
    const bottomCard = document.getElementById("bottom-card");
    const bottomCardClose = document.getElementById("bottom-card-close");
    const dragHandle = document.querySelector(".drag-handle");
    const locateBtn = document.getElementById("locate-btn");
    
    // 導覽按鈕元素
    const prevRecordBtn = document.getElementById("prev-record");
    const nextRecordBtn = document.getElementById("next-record");
    const mobilePrevRecordBtn = document.getElementById("mobile-prev-record");
    const mobileNextRecordBtn = document.getElementById("mobile-next-record");
    
    // 全局變數，用於存儲當前位置的所有紀錄和當前顯示的紀錄索引
    window.currentRecords = [];
    window.currentRecordIndex = 0;
    
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
    }

    // 創建參與者標籤
    function createParticipantTags(participants, type) {
        if (!participants || participants.length === 0) {
            return `<span class="empty-info">無${type === 'student' ? '學生' : '村民'}參與</span>`;
        }
        
        return participants.map(person => 
            `<span class="participant-tag ${type}">${person}</span>`
        ).join('');
    }
    
    // 更新顯示的紀錄內容 - 垂直布局
    window.updateRecordContent = function() {
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
        
        // 保存所有紀錄並重置索引
        if (locationData.records && locationData.records.length > 0) {
            window.currentRecords = locationData.records;
        } else {
            // 如果沒有提供紀錄列表，創建一個單一紀錄
            window.currentRecords = [{
                date: locationData.visitDate || "未記錄",
                visitor: locationData.visitor || "未記錄",
                semester: "未記錄",
                description: locationData.notes || "無訪視筆記",
                photo: locationData.photos && locationData.photos.length > 0 ? locationData.photos[0] : null,
                students: [],
                villagers: []
            }];
        }
        
        // 重置為第一筆紀錄
        window.currentRecordIndex = 0;
        
        // 更新內容
        window.updateRecordContent();
        
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

