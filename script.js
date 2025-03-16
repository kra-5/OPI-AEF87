function toggleYears() {
    const extraYears = document.getElementById("extra-years");
    extraYears.classList.toggle("hidden");
}

function showGallery(year) {
    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    const storedPhotos = JSON.parse(localStorage.getItem(`photos_${year}`)) || [];

    storedPhotos.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Фото ${index + 1}`;
        img.onclick = () => addComment(img, year, index);
        galleryDiv.appendChild(img);
    });
}

function uploadPhoto() {
    const input = document.getElementById("photoUpload");
    if (input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const selectedYear = prompt("Введіть рік зустрічі (наприклад, 2024 або 1982-1987):");
            if (!selectedYear) return;

            let storedPhotos = JSON.parse(localStorage.getItem(`photos_${selectedYear}`)) || [];
            storedPhotos.push(e.target.result);
            localStorage.setItem(`photos_${selectedYear}`, JSON.stringify(storedPhotos));

            alert("Фото успішно завантажене!");
            showGallery(selectedYear);
        };

        reader.readAsDataURL(file);
    } else {
        alert("Будь ласка, оберіть фото.");
    }
}

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
