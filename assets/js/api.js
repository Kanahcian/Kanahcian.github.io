const apiBaseUrl = "https://kanahcian-backend.onrender.com"; // Render API URL: https://kanahcian-backend.onrender.com
// 本機測試： http://127.0.0.1:8000

var customIcon = L.icon({
    iconUrl: 'assets/images/pin.png', // 替換成你的圖標路徑
    iconSize: [35, 35], // 設定圖標大小 (寬, 高)
    iconAnchor: [16, 40], // 設定圖標的錨點 (讓圖標尖端對準座標)
    popupAnchor: [0, -40] // 設定彈出視窗的位置
});



async function fetchLocations() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/locations`);
        const data = await response.json();

        if (data.status === "success") {
            addMarkersToMap(data.data);
        } else {
            console.error("獲取地點失敗", data);
        }
    } catch (error) {
        console.error("API 請求錯誤:", error);
    }
}

function addMarkersToMap(locations) {
    locations.forEach(loc => {
        const lat = parseFloat(loc.latitude);
        const lon = parseFloat(loc.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
            // 使用自訂圖標
            L.marker([lat, lon], { icon: customIcon }).addTo(map)
                .on('click', function() {
                    // 模擬假資料，實際應用中應從API獲取
                    const locationData = {
                        name: loc.name,
                        visitDate: "2024-03-04",
                        visitor: "王小明",
                        notes: "這是一次訪視的詳細記錄，包含了家庭情況、學習狀態以及後續跟進計劃等信息。",
                        photos: [
                            "assets/images/placeholder1.jpg",
                            "assets/images/placeholder2.jpg"
                        ]
                    };
                    
                    // 更新側邊欄/底部卡片內容
                    if (typeof window.updateSidebarContent === 'function') {
                        window.updateSidebarContent(locationData);
                    }
                });
        }
    });
}

// 當DOM加載完成後獲取位置
document.addEventListener("DOMContentLoaded", fetchLocations);

// 假設你有一個函數可以獲取某個位置的詳細信息
// async function fetchLocationDetails(locationId) {
//     try {
//         const response = await fetch(`${apiBaseUrl}/api/locations/${locationId}`);
//         const data = await response.json();
        
//         if (data.status === "success") {
//             return data.data;
//         } else {
//             console.error("獲取地點詳情失敗", data);
//             return null;
//         }
//     } catch (error) {
//         console.error("API 請求錯誤:", error);
//         return null;
//     }
// }

