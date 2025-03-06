var zoomLevel = window.innerWidth < 768 ? 22 : 22;

// 地圖初始化（移除預設縮放按鈕）
var map = L.map('map', {
    zoomControl: false // 禁用預設的縮放按鈕
}).setView([23.00116, 121.1308733], 20);

// 定義不同模式的底圖
var layers = [
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CartoDB'
    }),
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB (Dark Mode)'
    }),
];

// 設定初始底圖
var currentLayerIndex = 0;
layers[currentLayerIndex].addTo(map);

// 新增切換地圖模式的按鈕
var switchButton = L.control({ position: 'bottomright' });

switchButton.onAdd = function(map) {
    var button = L.DomUtil.create('button', 'map-switch-button');
    // 插入圖片作為圖示
    button.innerHTML = '<img src="assets/images/layers.png" class="map-switch-icon">';
    
    button.onclick = function() {
        map.removeLayer(layers[currentLayerIndex]);
        currentLayerIndex = (currentLayerIndex + 1) % layers.length;
        map.addLayer(layers[currentLayerIndex]);
    };
    return button;
};

switchButton.addTo(map);

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
