// js/index.js
$(document).ready(function() {
    // Smooth scroll to section
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        const sectionId = $(this).attr('href');
        console.log('Clicked link:', sectionId); // 输出点击的链接
        console.log('Target section:', $(sectionId)); // 输出目标部分元素
        $('html, body').animate({
            scrollTop: $(sectionId).offset().top
        }, 1000);
    });
});
