var zoomLevel = window.innerWidth < 768 ? 22 : 22;

var map = L.map('map').setView([23.00116136899162, 121.13087331027815], zoomLevel, maxZoom = 22, zoomControl = true);

// // 地圖樣式
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap 貢獻者'
}).addTo(map);

L.control.zoom({
    position: 'bottomright' // 設定縮放控制按鈕的位置（右下角）
}).addTo(map);


// var grayscaleMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//     attribution: '© CartoDB (Grayscale)'
// });

// var darkModeMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
//     attribution: '© CartoDB (Dark Mode)'
// });


// var baseMaps = {
//     "街道圖": streetMap,
//     "灰階圖": grayscaleMap,
//     "夜間模式": darkModeMap
// };

// // 添加地圖圖層控制
// L.control.layers(baseMaps).addTo(map);
// 定位按鈕
document.getElementById("locate-btn").addEventListener("click", function () {
    if (!navigator.geolocation) {
        alert("你的瀏覽器不支援 GPS 定位功能");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var accuracy = position.coords.accuracy; // 取得 GPS 精準度 (誤差範圍)

            // 如果之前有標記，先移除
            if (typeof userMarker !== "undefined") {
                map.removeLayer(userMarker);
                map.removeLayer(userCircle);
            }

            // 標記使用者位置
            userMarker = L.marker([lat, lon]).addTo(map)
                .bindPopup("<b>您的位置</b><br>緯度: " + lat + "<br>經度: " + lon).openPopup();

            // 用圓形顯示誤差範圍
            userCircle = L.circle([lat, lon], { radius: accuracy, color: "blue", fillOpacity: 0.3 }).addTo(map);

            // 自動將地圖縮放到使用者位置
            map.setView([lat, lon], 17);
        },
        function () {
            alert("無法獲取您的位置，請確認已開啟 GPS");
        }
    );
});
