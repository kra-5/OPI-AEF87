let db;

// 📌 Инициализация базы данных IndexedDB
function initDB(callback) {
    const request = indexedDB.open("photoGalleryDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("photos")) {
            db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        if (callback) callback();
    };

    request.onerror = function (event) {
        console.error("Ошибка IndexedDB:", event.target.error);
    };
}

// 📌 Сохранение фото в IndexedDB
function savePhoto(year, photo, callback) {
    if (!db) return;

    const transaction = db.transaction("photos", "readwrite");
    const store = transaction.objectStore("photos");
    store.add({ year: year, photo: photo, comments: [] });

    transaction.oncomplete = function () {
        if (callback) callback();
    };
}

// 📌 Загрузка фото из IndexedDB
function loadPhotos(year, callback) {
    if (!db) return;

    const transaction = db.transaction("photos", "readonly");
    const store = transaction.objectStore("photos");
    const request = store.getAll();

    request.onsuccess = function () {
        const photos = request.result.filter(p => p.year === year);
        callback(photos);
    };
}

// 📌 Отображение галереи
function showGallery(year) {
    if (!db) return;

    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    loadPhotos(year, function (photos) {
        galleryDiv.innerHTML = "";
        photos.forEach((photoData, index) => {
            const img = document.createElement("img");
            img.src = photoData.photo;
            img.alt = `Фото ${index + 1}`;
            img.onclick = () => openModal(photoData, year);
            galleryDiv.appendChild(img);
        });
    });
}

// 📌 Открытие списка годов
function toggleYears() {
    const extraYears = document.getElementById("extra-years");
    extraYears.style.display = extraYears.style.display === "none" ? "block" : "none";
}

// 📌 Автоматически создаём кнопки годов
window.onload = function () {
    const extraYearsDiv = document.getElementById("extra-years");
    for (let year = 1990; year <= new Date().getFullYear(); year++) {
        const button = document.createElement("button");
        button.textContent = year;
        button.onclick = () => showGallery(year);
        extraYearsDiv.appendChild(button);
    }
};

// 📌 Запускаем базу данных при загрузке
initDB();
