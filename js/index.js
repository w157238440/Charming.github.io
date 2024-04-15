// js/index.js
$(document).ready(function() {
    // Smooth scroll to section
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        const sectionId = $(this).attr('href');
        console.log('Clicked link:', sectionId); // 输出点击的链接
        const $targetSection = $(sectionId);
        console.log('Target section:', $targetSection); // 输出目标部分元素
        console.log('Target section content:', $targetSection.html()); // 输出目标部分内容
        $('html, body').animate({
            scrollTop: $targetSection.offset().top
        }, 1000);
    });
});
