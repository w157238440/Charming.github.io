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

    // Add dynamic background effect
    let colors = ['#007bff', '#ff00ff', '#00ff00', '#ff0000'];
    let currentIndex = 0;

    function changeBackground() {
        $('.hero-bg').animate({opacity: 0}, function() {
            $(this).css('background-color', colors[currentIndex]);
            $(this).animate({opacity: 1});
        });

        currentIndex = (currentIndex + 1) % colors.length;
    }

    // Decreased background change interval to 5000ms (5 seconds)
    setInterval(changeBackground, 20000);
});
