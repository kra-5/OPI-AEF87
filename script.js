const galleryData = {
    "2024": ["https://via.placeholder.com/200", "https://via.placeholder.com/200"],
    "2023": ["https://via.placeholder.com/200"],
    "2022": ["https://via.placeholder.com/200", "https://via.placeholder.com/200"]
};

function showGallery(year) {
    const container = document.getElementById("gallery-container");
    container.innerHTML = `<h2>Фото зустрічі ${year} року</h2><div class="gallery"></div>`;

    const galleryDiv = container.querySelector(".gallery");

    galleryData[year].forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Фото ${index + 1}`;
        img.onclick = () => addComment(img, year, index);
        galleryDiv.appendChild(img);
    });
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

function uploadPhoto() {
    const input = document.getElementById("photoUpload");
    if (input.files.length > 0) {
        alert("Фото успішно завантажене!");
    } else {
        alert("Будь ласка, оберіть фото.");
    }
}
