document.addEventListener('DOMContentLoaded', function() {
    // Lấy tọa độ từ thuộc tính data của #map
    const mapElement = document.getElementById('map');
    const lat = parseFloat(mapElement.dataset.lat);
    const lng = parseFloat(mapElement.dataset.lng);
    const title = mapElement.dataset.title;
    const location = mapElement.dataset.location;

    // Kiểm tra tọa độ hợp lệ, nếu không thì dùng mặc định
    const postLat = isNaN(lat) ? 10.7769 : lat; // TP.HCM mặc định
    const postLng = isNaN(lng) ? 106.7009 : lng;

    // Khởi tạo bản đồ
    const map = L.map('map').setView([postLat, postLng], 15);

    // Thêm lớp bản đồ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Thêm marker
    L.marker([postLat, postLng]).addTo(map)
        .bindPopup(`<b>${title}</b><br>${location}`)
        .openPopup();
});