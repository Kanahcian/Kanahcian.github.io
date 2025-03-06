const apiBaseUrl = "http://127.0.0.1:8000"; // Render API URL: https://kanahcian-backend.onrender.com
// 本機測試： http://127.0.0.1:8000

var customIcon = L.icon({
    iconUrl: 'assets/images/pin.png', // 替換成你的圖標路徑
    iconSize: [35, 35], // 設定圖標大小 (寬, 高)
    iconAnchor: [16, 40], // 設定圖標的錨點 (讓圖標尖端對準座標)
    popupAnchor: [0, -40] // 設定彈出視窗的位置
});


// GET/location API
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
            L.marker([lat, lon], { icon: customIcon }).addTo(map)
                .on('click', async function() {
                    const records = await fetchRecords(loc.id);  // 呼叫 fetchRecords 取得訪視紀錄

                    const locationData = {
                        id: loc.id,
                        name: loc.name || "未命名地點",
                        visitDate: records.length > 0 ? records[0].date : "未記錄",
                        visitor: "王小明", // 這裡應該從 API 取得真實資料
                        notes: records.length > 0 ? records[0].description : "無訪視筆記",
                        photos: records.map(record => record.photo) // 轉換後的照片
                    };

                    if (typeof window.updateSidebarContent === 'function') {
                        window.updateSidebarContent(locationData);
                    }
                });
        }
    });
}

// POST/records API
async function fetchRecords(locationId) {
    try {
        const payload = { locationid: Number(locationId) }; // 確保是數字
        console.log("發送請求: ", payload); // 🛠️ DEBUG: 確保請求正確

        const response = await fetch(`${apiBaseUrl}/api/records?locationid=${locationId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API 回應錯誤:", errorData); // 🛠️ DEBUG: 顯示錯誤資訊
            return [];
        }

        const data = await response.json();
        return data.status === "success" ? data.data.map(record => ({
            recordId: record.recordid,
            semester: record.semester,
            date: record.date,
            description: record.description,
            photo: record.photo ? convertGoogleDriveLink(record.photo) : null
        })) : [];

    } catch (error) {
        console.error("API 請求錯誤:", error);
        return [];
    }
}

function convertGoogleDriveLink(url) {
    const match = url.match(/file\/d\/(.*?)\//);
    return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}


// 當DOM加載完成後獲取位置
document.addEventListener("DOMContentLoaded", fetchLocations);

