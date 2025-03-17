let db;
const IMGUR_CLIENT_ID = "your-client-id"; // 🔹 Замените на свой ID с https://api.imgur.com/oauth2/addclient

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

// 📌 Сохранение ссылки на фото в IndexedDB
function savePhoto(year, photoUrl, callback) {
    if (!db) return;

    const transaction = db.transaction("photos", "readwrite");
    const store = transaction.objectStore("photos");
    store.add({ year: year, photo: photoUrl, comments: [] });

    transaction.oncomplete = function () {
        console.log(`Фото сохранено: ${photoUrl}`);
        if (callback) callback();
    };

    transaction.onerror = function (event) {
        console.error("Ошибка сохранения фото:", event.target.error);
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

// 📌 Открытие фото в модальном окне
function openModal(photoData, year) {
    const modal = document.getElementById("photo-modal");
    const modalImg = document.getElementById("modal-img");
    const commentList = document.getElementById("comment-list");
    const commentInput = document.getElementById("comment-input");

    modal.style.display = "block";
    modalImg.src = photoData.photo;

    commentList.innerHTML = "";
    photoData.comments.forEach(comment => {
        const li = document.createElement("li");
        li.textContent = comment;
        commentList.appendChild(li);
    });

    document.getElementById("add-comment-btn").onclick = function () {
        const newComment = commentInput.value.trim();
        if (newComment) {
            photoData.comments.push(newComment);
            savePhoto(year, photoData.photo, () => {
                showGallery(year);
                openModal(photoData, year);
            });
            commentInput.value = "";
        }
    };
}

// 📌 Закрытие модального окна
function closeModal() {
    document.getElementById("photo-modal").style.display = "none";
}

// 📌 Массовая загрузка фото (на Imgur)
function uploadPhoto() {
    const input = document.getElementById("photoUpload");
    if (input.files.length === 0) {
        alert("Будь ласка, оберіть фото.");
        return;
    }

    const selectedYear = prompt("Введіть рік зустрічі (наприклад, 2024 або 1982-1987):");
    if (!selectedYear) return;

    let loadedCount = 0;

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        uploadToImgur(file, function (imgUrl) {
            savePhoto(selectedYear, imgUrl, () => {
                loadedCount++;
                if (loadedCount === input.files.length) {
                    alert(`Завантажено ${loadedCount} фото!`);
                    showGallery(selectedYear);
                }
            });
        });
    }
}

// 📌 Загрузка фото на Imgur
function uploadToImgur(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        const formData = new FormData();
        formData.append("image", reader.result.split(",")[1]);

        fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${441e221ed4af46a}`,
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    callback(data.data.link);
                } else {
                    alert("Ошибка загрузки на Imgur");
                }
            })
            .catch((error) => console.error("Ошибка Imgur:", error));
    };
}

// 📌 Функция раскрытия списка годов
function toggleYears() {
    const extraYears = document.getElementById("extra-years");
    extraYears.style.display = extraYears.style.display === "none" ? "block" : "none";
}

// 📌 Автоматически создаём кнопки годов
window.onload = function () {
    initDB(() => {
        const extraYearsDiv = document.getElementById("extra-years");
        for (let year = 1990; year <= new Date().getFullYear(); year++) {
            const button = document.createElement("button");
            button.textContent = year;
            button.onclick = () => showGallery(year);
            extraYearsDiv.appendChild(button);
        }
    });
};

// 📌 Запускаем базу данных при загрузке
initDB();
