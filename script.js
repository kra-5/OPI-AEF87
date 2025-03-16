let db;

// 📌 Функция инициализации базы данных IndexedDB
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

// 📌 Функция сохранения фото в базу
function savePhoto(year, photo) {
    if (!db) {
        console.error("DB not ready");
        return;
    }

    const transaction = db.transaction("photos", "readwrite");
    const store = transaction.objectStore("photos");
    store.add({ year: year, photo: photo });
}

// 📌 Функция загрузки фото из IndexedDB
function loadPhotos(year, callback) {
    if (!db) {
        console.error("DB not ready");
        return;
    }

    const transaction = db.transaction("photos", "readonly");
    const store = transaction.objectStore("photos");
    const request = store.getAll();

    request.onsuccess = function () {
        const photos = request.result.filter(p => p.year === year).map(p => p.photo);
        callback(photos);
    };
}

// 📌 Отображение галереи с фото
function showGallery(year) {
    if (!db) {
        console.error("DB not ready, retrying...");
        setTimeout(() => showGallery(year), 500);
        return;
    }

    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    loadPhotos(year, function (photos) {
        galleryDiv.innerHTML = ""; // Очистить галерею перед загрузкой фото
        photos.forEach((src, index) => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = `Фото ${index + 1}`;
            img.onclick = () => addComment(img, year, index);
            galleryDiv.appendChild(img);
        });
    });
}

// 📌 Функция массовой загрузки фото
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
            savePhoto(selectedYear, e.target.result);
            loadedCount++;

            // Показываем галерею только когда все фото загружены
            if (loadedCount === input.files.length) {
                alert(`Завантажено ${loadedCount} фото!`);
                showGallery(selectedYear);
            }
        };

        reader.readAsDataURL(file);
    }
}

// 📌 Функция добавления комментариев к фото
function addComment(img, year, index) {
    const commentBox = document.createElement("div");
    commentBox.classList.add("comment-box");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ваш коментар...";
    
    const button = document.createElement("button");
    button.innerText = "Додати";
    button.onclick = () => {
        alert(`Коментар додано до фото ${index + 1} (${year} рік): ${input.value}`);
        commentBox.remove();
    };

    commentBox.appendChild(input);
    commentBox.appendChild(button);
    
    img.parentElement.appendChild(commentBox);
}

// 📌 Показываем список годов с 1990 по 2024
function toggleYears() {
    const extraYears = document.getElementById("extra-years");
    extraYears.classList.toggle("hidden");
}

// 📌 Инициализируем базу данных при загрузке страницы
initDB();
