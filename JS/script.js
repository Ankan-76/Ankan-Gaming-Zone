$(function () {

    // 1. Header Loading, Active Link & Sticky Navbar
    // Attempt to load header dynamically
    $("#header-placeholder").load("include/header.html", function () {
        // Auto-highlight active link
        const path = window.location.pathname;
        const page = path.split("/").pop() || "index.html";

        if (page === "index.html" || page === "") {
            $('.nav-link[href="index.html"]').addClass('active').attr('href', '#hero');
        } else {
            $('.nav-link[href="' + page + '"]').addClass('active');
        }

        // Initialize sticky navbar for dynamic header
        const navbar = document.getElementById('mainNav');
        if (navbar) {
            window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
        }
    });

    // Fallback: Initialize sticky navbar for static headers (e.g., template.html)
    const staticNavbar = document.getElementById('mainNav');
    if (staticNavbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                staticNavbar.classList.add('scrolled');
            } else {
                staticNavbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Game Filtering Logic
    const filterButtons = document.querySelectorAll('.btn-filter');
    const gameItems = document.querySelectorAll('.game-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            gameItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Add a small fade-in animation
                    item.classList.add('animate__fadeIn');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 3. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Dynamic "Glitch" Text Effect
    const glitchText = document.querySelector('.glitch-effect');
    if (glitchText) {
        setInterval(() => {
            const random = Math.random();
            if (random > 0.95) {
                glitchText.style.textShadow = '2px 2px 0px #ff0055, -2px -2px 0px #00f3ff';
                setTimeout(() => {
                    glitchText.style.textShadow = 'none';
                }, 100);
            }
        }, 2000);
    }
});