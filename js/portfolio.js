$(document).ready(function() {
    // Add animation to portfolio section
    $("#portfolio").addClass("fadeInUp");

    // Smooth scrolling
    $("nav a").on("click", function(event) {
        if (this.hash !== "") {
            event.preventDefault();
            const hash = this.hash;
            $("html, body").animate(
                {
                    scrollTop: $(hash).offset().top
                },
                800
            );
        }
    });
});
