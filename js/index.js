// js/index.js
$(document).ready(function() {
    // Direct scroll to section
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        const sectionId = $(this).attr('href');
        const targetOffsetTop = $(sectionId).offset().top;
        $('html, body').scrollTop(targetOffsetTop);
    });
});
