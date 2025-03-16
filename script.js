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

// 📌 Массовая загрузка фото
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
        const reader = new FileReader();

        reader.onload = function (e) {
            savePhoto(selectedYear, e.target.result, () => {
                loadedCount++;
                if (loadedCount === input.files.length) {
                    alert(`Завантажено ${loadedCount} фото!`);
                    showGallery(selectedYear);
                }
            });
        };

        reader.readAsDataURL(file);
    }
}

// 📌 Запускаем базу данных при загрузке
initDB();
