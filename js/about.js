// js/about.js
document.addEventListener("DOMContentLoaded", function() {
    const aboutImg = document.querySelector('.about-img img');

    aboutImg.addEventListener('click', function() {
        alert('点击了我的照片！');
    });
});
