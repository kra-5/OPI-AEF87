let db;
const IMGUR_CLIENT_ID = "your-client-id"; // Замените на ваш Client-ID с https://api.imgur.com/oauth2/addclient

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
        console.log("IndexedDB готова!");
        if (callback) callback();
    };

    request.onerror = function (event) {
        console.error("Ошибка IndexedDB:", event.target.error);
    };
}

// 📌 Функция раскрытия списка годов
function toggleYears() {
    const extraYears = document.getElementById("extra-years");
    if (extraYears.style.display === "none" || extraYears.style.display === "") {
        extraYears.style.display = "block";
    } else {
        extraYears.style.display = "none";
    }
}

// 📌 Создание кнопок для годов (1990 - текущий год)
function createYearButtons() {
    const extraYearsDiv = document.getElementById("extra-years");
    extraYearsDiv.innerHTML = ""; // Очищаем старые кнопки
    for (let year = 1990; year <= new Date().getFullYear(); year++) {
        const button = document.createElement("button");
        button.textContent = year;
        button.onclick = () => showGallery(year);
        extraYearsDiv.appendChild(button);
    }
}

// 📌 Отображение галереи
function showGallery(year) {
    if (!db) {
        console.error("База данных еще не загружена");
        return;
    }

    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    loadPhotos(year, function (photos) {
        galleryDiv.innerHTML = "";
        if (photos.length === 0) {
            galleryDiv.innerHTML = "<p>Немає завантажених фото.</p>";
        }
        photos.forEach((photoData, index) => {
            const img = document.createElement("img");
            img.src = photoData.photo;
            img.alt = `Фото ${index + 1}`;
            img.onclick = () => openModal(photoData, year);
            galleryDiv.appendChild(img);
        });
    });
}

// 📌 Автоматически создаём кнопки годов при загрузке страницы
window.onload = function () {
    initDB(() => {
        createYearButtons(); // Создаём кнопки для годов
    });
};

// 📌 Запускаем базу данных при загрузке
initDB();
