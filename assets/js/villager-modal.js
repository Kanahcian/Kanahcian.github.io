// 村民資訊彈窗功能
document.addEventListener("DOMContentLoaded", function() {
    console.log("村民模塊初始化開始");
    
    // 建立彈窗元素
    createVillagerModal();
    
    // 監聽點擊事件（使用事件委派）
    document.addEventListener('click', function(e) {
        // 檢查是否點擊了村民標籤
        if (e.target.classList.contains('participant-tag') && e.target.classList.contains('villager')) {
            console.log("點擊村民標籤:", e.target.textContent);
            handleVillagerClick(e.target);
        }
    });
    
    console.log("村民模塊初始化完成 - 事件監聽器已設置");
});

// 創建村民彈窗
function createVillagerModal() {
    console.log("創建村民彈窗");
    // 檢查彈窗是否已存在
    if (document.getElementById("villager-modal-overlay")) {
        console.log("彈窗已存在，不再創建");
        return;
    }
    
    const modalHTML = `
    <div id="villager-modal-overlay" class="villager-modal-overlay">
        <div id="villager-modal" class="villager-modal">
            <div class="villager-modal-header">
                <h3 id="villager-modal-name">村民資訊</h3>
                <span id="villager-modal-close">&times;</span>
            </div>
            <div class="villager-modal-content">
                <div class="villager-photo-container" id="villager-photo-container">
                    <!-- 照片將由 JavaScript 動態添加 -->
                </div>
                <div class="villager-info">
                    <div class="info-row">
                        <span class="info-label">性別:</span>
                        <span id="villager-gender" class="info-value">-</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">職業:</span>
                        <span id="villager-job" class="info-value">-</span>
                    </div>
                    <div class="info-row" id="villager-url-container">
                        <span class="info-label">相關連結:</span>
                        <a id="villager-url" class="info-value" href="#" target="_blank">
                            <i class="fas fa-external-link-alt"></i> 開啟連結
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // 將彈窗 HTML 添加到頁面
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // 點擊彈窗關閉按鈕或背景時關閉彈窗
    document.getElementById("villager-modal-close").addEventListener("click", closeVillagerModal);
    document.getElementById("villager-modal-overlay").addEventListener("click", function(e) {
        if (e.target === this) {
            closeVillagerModal();
        }
    });
    
    console.log("彈窗創建完成");
}

// 處理村民點擊事件
async function handleVillagerClick(element) {
    console.log("處理村民點擊:", element.textContent);
    
    // 獲取 data-id 屬性和村民名稱
    let villagerID = element.getAttribute('data-id');
    const villagerName = element.textContent.trim();
    
    console.log(`嘗試顯示 "${villagerName}" 的資料，使用 ID: ${villagerID}`);
    
    try {
        if (!villagerID) {
            console.error("沒有找到 data-id 屬性");
            villagerID = 1; // 備用 ID
        }
        
        // 顯示載入中提示
        showLoadingInModal();
        
        // 發送 API 請求
        const url = `${apiBaseUrl}/api/villager/${villagerID}`;
        console.log("請求 URL:", url);
        
        const response = await fetch(url);
        console.log("API 回應狀態:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("API 回應數據:", data);
            
            if (data.status === "success") {
                // 檢查返回的名稱是否與點擊的名稱匹配
                if (data.data.name !== villagerName) {
                    console.warn(`API 返回的村民 (${data.data.name}) 與點擊的村民 (${villagerName}) 不符`);
                    
                    // 嘗試使用名稱查找正確的村民
                    const correctedId = await findVillagerIdByNameViaAPI(villagerName);
                    if (correctedId) {
                        console.log(`找到 "${villagerName}" 的正確 ID: ${correctedId}，重新請求`);
                        // 重新請求正確的 ID
                        const correctedUrl = `${apiBaseUrl}/api/villager/${correctedId}`;
                        const correctedResponse = await fetch(correctedUrl);
                        if (correctedResponse.ok) {
                            const correctedData = await correctedResponse.json();
                            if (correctedData.status === "success") {
                                showVillagerModal(correctedData.data);
                                return;
                            }
                        }
                    }
                }
                
                // 如果沒有修正或修正失敗，顯示原始數據
                showVillagerModal(data.data);
            } else {
                console.warn("API 成功但返回錯誤:", data);
                showVillagerModal({
                    name: villagerName,
                    villagerid: villagerID,
                    gender: "-",
                    job: "API 回應錯誤",
                    locationid: "-"
                });
            }
        } else {
            console.error("API 請求失敗:", response.status);
            showVillagerModal({
                name: villagerName,
                villagerid: villagerID,
                gender: "-",
                job: `請求失敗 (${response.status})`,
                locationid: "-"
            });
        }
    } catch (error) {
        console.error("處理村民點擊事件時出錯:", error);
        showVillagerModal({
            name: villagerName,
            villagerid: villagerID,
            gender: "-",
            job: `發生錯誤: ${error.message}`,
            locationid: "-"
        });
    }
}

// 使用 API 根據名稱查找村民 ID
async function findVillagerIdByNameViaAPI(name) {
    try {
        // 獲取所有村民 ID
        const ids = [1, 2, 3, 4, 5]; // 假設這些是可能的 ID
        
        // 依次嘗試每個 ID
        for (const id of ids) {
            const response = await fetch(`${apiBaseUrl}/api/villager/${id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === "success" && data.data.name === name) {
                    console.log(`找到匹配: ID ${id} => ${name}`);
                    return id;
                }
            }
        }
        
        console.warn(`未找到村民 "${name}" 的匹配 ID`);
        return null;
    } catch (error) {
        console.error("尋找村民 ID 時出錯:", error);
        return null;
    }
}

// 顯示載入中提示
function showLoadingInModal() {
    console.log("显示加载中提示");
    
    // 创建或显示弹窗
    document.getElementById("villager-modal-overlay").classList.add("active");
    
    // 设置加载中状态
    document.getElementById("villager-modal-name").textContent = "加载中...";
    document.getElementById("villager-gender").textContent = "-";
    document.getElementById("villager-job").textContent = "-";
    // 移除这一行
    // document.getElementById("villager-location").textContent = "-";
    document.getElementById("villager-url-container").style.display = "none";
    
    // 清空照片容器并显示加载中
    const photoContainer = document.getElementById("villager-photo-container");
    photoContainer.innerHTML = "<p>资料加载中...</p>";
}

// 顯示村民彈窗
function showVillagerModal(villagerInfo) {
    // console.log("顯示村民資訊:", villagerInfo);
    
    // 設置彈窗標題
    document.getElementById("villager-modal-name").textContent = villagerInfo.name;
    
    // 設置基本資訊
    document.getElementById("villager-gender").textContent = formatGender(villagerInfo.gender);
    document.getElementById("villager-job").textContent = villagerInfo.job || "無資料";
    // document.getElementById("villager-location").textContent = `地點 ID: ${villagerInfo.locationid}`;
    
    // 設置連結
    const urlContainer = document.getElementById("villager-url-container");
    const urlElement = document.getElementById("villager-url");
    
    if (villagerInfo.url) {
        urlContainer.style.display = "flex";
        urlElement.href = villagerInfo.url;
    } else {
        urlContainer.style.display = "none";
    }
    
    // 設置照片
    const photoContainer = document.getElementById("villager-photo-container");
    photoContainer.innerHTML = ""; // 清空容器
    
    if (villagerInfo.photo) {
        const convertedPhotoUrl = convertGoogleDriveLink(villagerInfo.photo);
        const img = document.createElement("img");
        img.src = convertedPhotoUrl;
        img.alt = `${villagerInfo.name} 的照片`;
        img.onerror = function() {
            this.onerror = null;
            this.src = 'assets/images/photo-error.png';
            console.error("照片載入失敗:", convertedPhotoUrl);
        };
        photoContainer.appendChild(img);
    } else {
        photoContainer.innerHTML = "<p>暫無照片</p>";
    }
    
    // 顯示彈窗
    document.getElementById("villager-modal-overlay").classList.add("active");
}

// 關閉村民彈窗
function closeVillagerModal() {
    console.log("關閉村民彈窗");
    document.getElementById("villager-modal-overlay").classList.remove("active");
}

// 格式化性別顯示
function formatGender(gender) {
    if (gender === "M") return "男";
    if (gender === "F") return "女";
    return gender;
}

// 轉換 Google Drive 連結為可顯示的照片 URL
function convertGoogleDriveLink(url) {
    if (!url) return null;

    // 解析 Google Drive 連結的 FILE_ID
    const match = url.match(/file\/d\/(.*?)(\/|$)/);
    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`; // 1000px 縮圖
    }

    return url; // 如果無法解析，返回原始URL
}

console.log("村民模塊腳本載入完成");