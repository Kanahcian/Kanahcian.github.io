const apiBaseUrl = "https://kanahcian-backend.onrender.com"; // Render API URL: https://kanahcian-backend.onrender.com
// 本機測試： http://127.0.0.1:8000

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
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${loc.name}</b>`)
                .openPopup();
        }
    });
}

document.addEventListener("DOMContentLoaded", fetchLocations);
