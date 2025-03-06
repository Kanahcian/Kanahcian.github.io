// 側邊欄和底部卡片控制
document.addEventListener("DOMContentLoaded", function() {
    // 獲取DOM元素
    const sidebar = document.getElementById("sidebar");
    const sidebarClose = document.getElementById("sidebar-close");
    const bottomCard = document.getElementById("bottom-card");
    const bottomCardClose = document.getElementById("bottom-card-close");
    const dragHandle = document.querySelector(".drag-handle");
    const locateBtn = document.getElementById("locate-btn");
    
    
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
                locateBtn.style.display = "flex";  // **改為 flex 確保重新顯示**
                if (mapSwitchBtn) {
                    mapSwitchBtn.style.display = "flex";
                }
            }
        }
    }
    
    
    
    // 公開更新側邊欄/底部卡片內容的函數
    window.updateSidebarContent = function(locationData) {
        // 更新桌面版側邊欄
        document.getElementById("location-name").textContent = locationData.name || "未命名地點";
        document.getElementById("visit-date").textContent = locationData.visitDate || "未記錄";
        document.getElementById("visitor-name").textContent = locationData.visitor || "未記錄";
        document.getElementById("visit-notes").textContent = locationData.notes || "無訪視筆記";
        
        // 更新手機版底部卡片
        document.getElementById("mobile-location-name").textContent = locationData.name || "未命名地點";
        document.getElementById("mobile-visit-date").textContent = locationData.visitDate || "未記錄";
        document.getElementById("mobile-visitor-name").textContent = locationData.visitor || "未記錄";
        document.getElementById("mobile-visit-notes").textContent = locationData.notes || "無訪視筆記";
        
        // 清空並添加照片
        const photosContainer = document.getElementById("location-photos");
        const mobilePhotosContainer = document.getElementById("mobile-location-photos");
        
        photosContainer.innerHTML = "";
        mobilePhotosContainer.innerHTML = "";
        
        if (locationData.photos && locationData.photos.length > 0) {
            locationData.photos.forEach(photo => {
                // 桌面版照片
                const img = document.createElement("img");
                img.src = photo;
                img.alt = locationData.name;
                photosContainer.appendChild(img);
                
                // 手機版照片
                const mobileImg = document.createElement("img");
                mobileImg.src = photo;
                mobileImg.alt = locationData.name;
                mobilePhotosContainer.appendChild(mobileImg);
            });
        } else {
            // 如果沒有照片，顯示提示訊息
            photosContainer.innerHTML = "<p>暫無照片</p>";
            mobilePhotosContainer.innerHTML = "<p>暫無照片</p>";
        }
        
        // 根據設備顯示相應界面
        if (window.innerWidth <= 1024) {
            bottomCard.classList.add("active");
            adjustButtonPositions(true);
        } else {
            sidebar.classList.add("active");
        }
    }
    
    // 點擊關閉按鈕時隱藏底部卡片
    // 點擊關閉按鈕時隱藏底部卡片並恢復按鈕
    bottomCardClose.addEventListener("click", function() {
        bottomCard.classList.remove("active");
        adjustButtonPositions(false); // 確保按鈕恢復顯示
    });

});