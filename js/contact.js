// js/contact.js
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        alert('消息已发送！');
    });
});
