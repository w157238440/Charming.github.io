// js/portfolio.js
function showModal(projectId) {
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('modalImg');
    const captionText = document.getElementById('caption');
    const img = document.querySelector(`#${projectId} img`);
    const caption = document.querySelector(`#${projectId} h3`).textContent;

    modal.style.display = 'block';
    modalImg.src = img.src;
    captionText.innerHTML = caption;
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});
