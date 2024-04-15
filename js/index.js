// js/index.js
document.addEventListener("DOMContentLoaded", function() {
    const hero = document.querySelector('.hero');
    const btn = document.querySelector('.btn');

    btn.addEventListener('mouseenter', function() {
        hero.style.background = '#555';
    });

    btn.addEventListener('mouseleave', function() {
        hero.style.background = 'url(img/hero-bg.jpg) center/cover';
    });
});
