// 📌 Открываем базу данных
let db;
const request = indexedDB.open("photoGalleryDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
};

// 📌 Функция сохранения фото в IndexedDB
function savePhoto(year, photo) {
    const transaction = db.transaction("photos", "readwrite");
    const store = transaction.objectStore("photos");
    store.add({ year: year, photo: photo });
}

// 📌 Функция загрузки фото из IndexedDB
function loadPhotos(year, callback) {
    const transaction = db.transaction("photos", "readonly");
    const store = transaction.objectStore("photos");
    const request = store.getAll();

    request.onsuccess = function () {
        const photos = request.result.filter(p => p.year === year).map(p => p.photo);
        callback(photos);
    };
}

// 📌 Отображение галереи
function showGallery(year) {
    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    loadPhotos(year, function (photos) {
        photos.forEach((src, index) => {
            const img = document.createElement("img");
            img.src = src;
            img.alt = `Фото ${index + 1}`;
            img.onclick = () => addComment(img, year, index);
            galleryDiv.appendChild(img);
        });
    });
}

// 📌 Функция загрузки фото (и сохранения в IndexedDB)
function uploadPhoto() {
    const input = document.getElementById("photoUpload");
    if (input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const selectedYear = prompt("Введіть рік зустрічі (наприклад, 2024 або 1982-1987):");
            if (!selectedYear) return;

            savePhoto(selectedYear, e.target.result);
            alert("Фото успішно завантажене!");
            showGallery(selectedYear);
        };

        reader.readAsDataURL(file);
    } else {
        alert("Будь ласка, оберіть фото.");
    }
}

// 📌 Функция добавления комментариев
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
