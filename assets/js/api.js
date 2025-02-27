const apiBaseUrl = "https://kanahcian-backend.onrender.com"; // Render API URL: https://kanahcian-backend.onrender.com
// 本機測試： http://127.0.0.1:8000

var customIcon = L.icon({
    iconUrl: 'assets/images/logo.png', // 替換成你的圖標路徑
    iconSize: [32, 40], // 設定圖標大小 (寬, 高)
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



// function addMarkersToMap(locations) {
//     locations.forEach(loc => {
//         const lat = parseFloat(loc.lat);
//         const lon = parseFloat(loc.lon);

//         if (!isNaN(lat) && !isNaN(lon)) {
//             L.marker([lat, lon]).addTo(map)
//                 .bindPopup(`<b>${loc.name}</b>`)
//                 .openPopup();
//         }
//     });
// }

function addMarkersToMap(locations) {
    locations.forEach(loc => {
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
            // 自訂圖標
            var customIcon = L.icon({
                iconUrl: 'assets/images/pin.png', // 替換成你的圖標路徑
                iconSize: [40, 40], // (寬, 高)
                iconAnchor: [16, 40], // 讓圖標尖端指向座標
                popupAnchor: [3, -40] // 彈出視窗位置
            });

            // 建立帶有自訂圖標的標記
            L.marker([lat, lon], { icon: customIcon }).addTo(map)
            .bindPopup(`
                <div style="text-align: center;">
                    <h4 style="margin: 1px 0; color: #333;">${loc.name}</h4>
                    <p style="font-size: 12px; color: gray;">${loc.description || "我們的基地"}</p>
                </div>
            `).openPopup();
        }
    });
}


document.addEventListener("DOMContentLoaded", fetchLocations);
