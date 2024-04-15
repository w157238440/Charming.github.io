// script.js

$(document).ready(function() {
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('header').addClass('nav-scrolled');
        } else {
            $('header').removeClass('nav-scrolled');
        }
    });

    $('a').on('click', function(event) {
        if (this.hash !== '') {
            event.preventDefault();

            const hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function() {
                window.location.hash = hash;
            });
        }
    });

    $('#contact-form').submit(function(event) {
        event.preventDefault();
        // 假设这里发送表单数据给服务器
        alert('表单已提交！');
    });
});
