const apiBaseUrl = "http://127.0.0.1:8000";  // Render API URL: https://kanahcian-backend.onrender.com
// 本機測試： http://127.0.0.1:8000
async function fetchLocations() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/locations`);
        const data = await response.json();
        
        console.log("API 返回的數據:", data);  // 🔍 檢查 API 回應的原始數據

        if (data.status === "success") {
            console.log("獲取地點數據:", data.data);
            addMarkersToMap(data.data);
        } else {
            console.error("獲取地點失敗，API 回應:", data);
        }
    } catch (error) {
        console.error("API 請求錯誤:", error);
    }
}

// 把 API 返回的地點標記在地圖上
function addMarkersToMap(locations) {
    locations.forEach(loc => {
        // 確保 lat 和 lon 是數字
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
            console.log(`新增標記: ${loc.name} (${lat}, ${lon})`); // 確認資料
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${loc.name}</b>`)
                .openPopup();
        } else {
            console.error("無效的座標:", loc);
        }
    });
}

// 當頁面載入時請求 API
document.addEventListener("DOMContentLoaded", fetchLocations);
