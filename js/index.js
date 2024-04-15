// js/index.js
document.addEventListener("DOMContentLoaded", function() {
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');

    // Smooth scroll to about section
    const scrollToAbout = () => {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Smooth scroll to contact section
    const scrollToContact = () => {
        contactSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Add event listeners to buttons
    document.getElementById('scrollToAbout').addEventListener('click', scrollToAbout);
    document.getElementById('scrollToContact').addEventListener('click', scrollToContact);

    // Typewriter effect
    const typewriter = document.getElementById('typewriter');
    const words = ['全栈工程师', '设计师', '创作者'];
    let wordIndex = 0;
    let charIndex = 0;

    const type = () => {
        if (charIndex < words[wordIndex].length) {
            typewriter.textContent += words[wordIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 1500);
        }
    };

    const erase = () => {
        if (charIndex > 0) {
            typewriter.textContent = words[wordIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 1000);
        }
    };

    setTimeout(type, 1000);
});

// Parallax effect
document.addEventListener("scroll", function() {
    const parallax = document.querySelectorAll(".parallax");
    let scrollPosition = window.pageYOffset;

    parallax.forEach(function(element) {
        element.style.transform = "translateY(" + scrollPosition * 0.4 + "px)";
    });
});
