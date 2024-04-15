// js/index.js
document.addEventListener("DOMContentLoaded", function() {
    // 在主页的 JavaScript 中可以添加一些特效和动画
    const hero = document.querySelector('.hero');
    const btn = document.querySelector('.btn');

    btn.addEventListener('mouseenter', function() {
        hero.style.background = '#555';
    });

    btn.addEventListener('mouseleave', function() {
        hero.style.background = 'url(img/hero-bg.jpg) center/cover';
    });
});
