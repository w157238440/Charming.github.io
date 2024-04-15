// js/portfolio.js
document.addEventListener("DOMContentLoaded", function() {
    // 在作品集页面的 JavaScript 中可以添加一些动画和效果
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
