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
    let currentRecords = [];
    let currentRecordIndex = 0;
    
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
        const totalRecords = currentRecords.length;
        const currentPosition = currentRecordIndex + 1;
        
        // 更新紀錄指示器
        document.getElementById("record-indicator").textContent = `紀錄 ${currentPosition}/${totalRecords}`;
        document.getElementById("mobile-record-indicator").textContent = `紀錄 ${currentPosition}/${totalRecords}`;
        
        // 設置導覽按鈕狀態
        prevRecordBtn.disabled = currentRecordIndex === 0;
        nextRecordBtn.disabled = currentRecordIndex === totalRecords - 1;
        mobilePrevRecordBtn.disabled = currentRecordIndex === 0;
        mobileNextRecordBtn.disabled = currentRecordIndex === totalRecords - 1;
    }
    
    // 更新顯示的紀錄內容
    function updateRecordContent() {
        const record = currentRecords[currentRecordIndex];
        
        // 更新桌面版側邊欄
        document.getElementById("visit-date").textContent = record.date || "未記錄";
        document.getElementById("visitor-name").textContent = record.visitor || "未記錄";
        document.getElementById("visit-semester").textContent = record.semester || "未記錄";
        document.getElementById("visit-notes").textContent = record.description || "無訪視筆記";
        
        // 更新手機版底部卡片
        document.getElementById("mobile-visit-date").textContent = record.date || "未記錄";
        document.getElementById("mobile-visitor-name").textContent = record.visitor || "未記錄";
        document.getElementById("mobile-visit-semester").textContent = record.semester || "未記錄";
        document.getElementById("mobile-visit-notes").textContent = record.description || "無訪視筆記";
        
        // 清空並添加照片
        const photosContainer = document.getElementById("location-photos");
        const mobilePhotosContainer = document.getElementById("mobile-location-photos");
        
        photosContainer.innerHTML = "";
        mobilePhotosContainer.innerHTML = "";
        
        if (record.photo) {
            // 桌面版照片
            const img = document.createElement("img");
            img.src = record.photo;
            img.alt = "訪視照片";
            img.onerror = function() {
                // 圖片載入失敗時顯示錯誤訊息
                this.onerror = null; // 防止無限循環
                this.src = 'assets/images/photo-error.png'; // 可以替換為一個錯誤圖片
                console.error("照片載入失敗:", record.photo);
                photosContainer.innerHTML += "<p class='photo-error'>照片載入失敗</p>";
            };
            photosContainer.appendChild(img);
            
            // 手機版照片
            const mobileImg = document.createElement("img");
            mobileImg.src = record.photo;
            mobileImg.alt = "訪視照片";
            mobileImg.onerror = function() {
                this.onerror = null;
                this.src = 'assets/images/photo-error.png';
                console.error("照片載入失敗:", record.photo);
                mobilePhotosContainer.innerHTML += "<p class='photo-error'>照片載入失敗</p>";
            };
            mobilePhotosContainer.appendChild(mobileImg);
        } else {
            // 如果沒有照片，顯示提示訊息
            photosContainer.innerHTML = "<p>暫無照片</p>";
            mobilePhotosContainer.innerHTML = "<p>暫無照片</p>";
        }
        
        // 更新導覽狀態
        updateNavigationState();
    }
    
    // 綁定紀錄導覽按鈕事件
    prevRecordBtn.addEventListener("click", function() {
        if (currentRecordIndex > 0) {
            currentRecordIndex--;
            updateRecordContent();
        }
    });
    
    nextRecordBtn.addEventListener("click", function() {
        if (currentRecordIndex < currentRecords.length - 1) {
            currentRecordIndex++;
            updateRecordContent();
        }
    });
    
    mobilePrevRecordBtn.addEventListener("click", function() {
        if (currentRecordIndex > 0) {
            currentRecordIndex--;
            updateRecordContent();
        }
    });
    
    mobileNextRecordBtn.addEventListener("click", function() {
        if (currentRecordIndex < currentRecords.length - 1) {
            currentRecordIndex++;
            updateRecordContent();
        }
    });
    
    // 公開更新側邊欄/底部卡片內容的函數
    window.updateSidebarContent = function(locationData) {
        // 更新地點名稱（對所有紀錄都相同）
        document.getElementById("location-name").textContent = locationData.name || "未命名地點";
        document.getElementById("mobile-location-name").textContent = locationData.name || "未命名地點";
        
        // 保存所有紀錄並重置索引
        if (locationData.records && locationData.records.length > 0) {
            currentRecords = locationData.records;
        } else {
            // 如果沒有提供紀錄列表，創建一個單一紀錄
            currentRecords = [{
                date: locationData.visitDate || "未記錄",
                visitor: locationData.visitor || "未記錄",
                semester: "未記錄",
                description: locationData.notes || "無訪視筆記",
                photo: locationData.photos && locationData.photos.length > 0 ? locationData.photos[0] : null
            }];
        }
        
        // 重置為第一筆紀錄
        currentRecordIndex = 0;
        
        // 更新內容
        updateRecordContent();
        
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