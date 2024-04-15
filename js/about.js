// js/about.js
document.addEventListener("DOMContentLoaded", function() {
    // 在关于页面的 JavaScript 中可以添加一些交互功能
    const aboutImg = document.querySelector('.about-img img');

    aboutImg.addEventListener('click', function() {
        alert('点击了我的照片！');
    });
});
