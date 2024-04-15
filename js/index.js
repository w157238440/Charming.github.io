// js/index.js
document.addEventListener("DOMContentLoaded", function() {
    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    // Add event listeners to navigation links
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').slice(1);
            scrollToSection(sectionId);
        });
    });

    // Add event listener to "了解更多" button
    document.querySelector('.btn').addEventListener('click', function() {
        scrollToSection('about');
    });
});
