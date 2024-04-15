// js/index.js
$(document).ready(function() {
    // Smooth scroll to section
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        const sectionId = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(sectionId).offset().top
        }, 1000);
    });

    // Add event listener to "了解更多" button
    $('.btn').click(function() {
        const sectionId = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(sectionId).offset().top
        }, 1000);
    });
});
