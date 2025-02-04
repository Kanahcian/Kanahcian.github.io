const apiBaseUrl = "https://kanahcian-backend.onrender.com";  // 部署到 Render 後改成你的 API 網址
// http://127.0.0.1:8000
async function fetchLocations() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/locations`);
        const data = await response.json();
        
        if (data.status === "success") {
            console.log("獲取地點數據:", data.data);
            addMarkersToMap(data.data);
        } else {
            console.error("獲取地點失敗");
        }
    } catch (error) {
        console.error("API 請求錯誤:", error);
    }
}

// 把 API 返回的地點標記在地圖上
function addMarkersToMap(locations) {
    locations.forEach(loc => {
        L.marker([loc.lat, loc.lon]).addTo(map)
            .bindPopup(`<b>${loc.name}</b>`)
            .openPopup();
    });
}

// 當頁面載入時請求 API
document.addEventListener("DOMContentLoaded", fetchLocations);
