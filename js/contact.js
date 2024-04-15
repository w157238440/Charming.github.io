$(document).ready(function() {
    // Add animation to contact section
    $("#contact").addClass("fadeInUp");

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

    // Contact form submission
    $("#contact-form").submit(function(event) {
        event.preventDefault();
        // Here you can write code to handle form submission, like sending an AJAX request
        alert("您的留言已发送！");
        $(this)[0].reset();
    });
});
