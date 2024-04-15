// js/contact.js
document.addEventListener("DOMContentLoaded", function() {
    // 在联系页面的 JavaScript 中可以添加表单验证等功能
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        alert('消息已发送！');
    });
});
