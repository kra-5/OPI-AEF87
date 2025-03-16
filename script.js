let db;

// 📌 Функция инициализации IndexedDB
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
        console.error("IndexedDB error:", event.target.error);
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

// 📌 Добавляем кнопки с 1990 по 2021
window.onload = function () {
    const extraYearsDiv = document.getElementById("extra-years");
    for (let year = 1990; year <= 2021; year++) {
        const button = document.createElement("button");
        button.textContent = year;
        button.onclick = () => showGallery(year);
        extraYearsDiv.appendChild(button);
    }
};

// 📌 Показываем галерею с фото
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
            saveUpdatedPhoto(photoData, year);
            showGallery(year);
            commentInput.value = "";
            openModal(photoData, year);
        }
    };
}

// 📌 Закрытие модального окна
function closeModal() {
    document.getElementById("photo-modal").style.display = "none";
}

// 📌 Инициализируем базу данных при загрузке
initDB();
