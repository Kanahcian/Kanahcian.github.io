const apiBaseUrl = "https://kanahcian-backend.onrender.com";
// 本機測試： http://127.0.0.1:8000
// 部署到 Render： https://kanahcian-backend.onrender.com
var customIcon = L.icon({
    iconUrl: 'assets/images/pin.png',
    iconSize: [35, 35],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
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
                        brief_description: loc.brief_description || "",
                        records: records.map(record => ({
                            recordId: record.recordid,
                            date: formatDate(record.date),
                            visitor: record.account || "家訪小組",
                            semester: record.semester,
                            description: record.description || "無訪視筆記",
                            photo: convertGoogleDriveLink(record.photo),
                            students: record.students || [],
                            villagers: record.villagers || []
                        }))
                    };

                    if (typeof window.updateSidebarContent === 'function') {
                        window.updateSidebarContent(locationData);
                    }
                });
        }
    });
}

// 日期格式化函數
function formatDate(dateString) {
    if (!dateString) return "未記錄";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // 如果日期無效，返回原始字符串
        
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error("日期格式化錯誤:", error);
        return dateString;
    }
}

// POST/records API
async function fetchRecords(locationId) {
    try {
        // 嘗試方法1：作為查詢參數發送
        let apiUrl = `${apiBaseUrl}/api/records?locationid=${locationId}`;
        console.log("嘗試使用查詢參數請求:", apiUrl);
        
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        // 如果第一種方法失敗，嘗試方法2：作為請求體發送
        if (!response.ok) {
            const payload = { locationid: Number(locationId) };
            console.log("嘗試使用請求體發送:", payload);
            
            response = await fetch(`${apiBaseUrl}/api/records`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }
        
        console.log("回應狀態:", response.status, response.statusText);
        
        // 如果仍然失敗，記錄錯誤並返回空數組
        if (!response.ok) {
            let errorText = "";
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
            } catch (e) {
                errorText = await response.text();
            }
            console.error("API 回應錯誤:", errorText);
            return [];
        }

        const data = await response.json();
        console.log("API 回應資料:", data);
        
        // 直接返回格式化後的資料
        if (data.status === "success" && Array.isArray(data.data)) {
            return data.data.map(record => ({
                recordId: record.recordid,
                semester: record.semester,
                date: record.date,
                description: record.description || "無訪視筆記",
                photo: convertGoogleDriveLink(record.photo),
                account: record.account,
                students: record.students || [],
                villagers: record.villagers || []
            }));
        } else {
            console.error("API 回應格式不符預期:", data);
            return [];
        }
    } catch (error) {
        console.error("API 請求錯誤:", error);
        return [];
    }
}

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

// 當DOM加載完成後獲取位置
document.addEventListener("DOMContentLoaded", fetchLocations);

