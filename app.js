document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       Header Scroll Effect
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    /* ==========================================================================
       Mobile Menu Toggle
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.textContent = navMenu.classList.contains('active') ? 'close' : 'menu';
            }
        });

        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.textContent = 'menu';
            });
        });
    }

    /* ==========================================================================
       Dynamic Background Particles Spawner (Strengthened & Visible)
       ========================================================================== */
    const particlesContainer = document.getElementById('particlesContainer');
    const particleCount = 60;

    if (particlesContainer) {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('bg-particle');
            
            const size = Math.random() * 6 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            
            particle.style.animationDuration = `${Math.random() * 25 + 20}s`;
            particle.style.animationDelay = `${Math.random() * -45}s`;
            
            // Set dynamic opacity variable for keyframe override
            const opacityVal = Math.random() * 0.3 + 0.15;
            particle.style.setProperty('--p-opacity', opacityVal);
            
            particlesContainer.appendChild(particle);
        }
    }

    /* ==========================================================================
       Scroll Parallax Effect (High-Performance requestAnimationFrame)
       ========================================================================== */
    let scrollY = window.scrollY;
    let ticking = false;

    const blobPurple = document.getElementById('blobPurple');
    const blobPink = document.getElementById('blobPink');
    const phoneMockup = document.querySelector('.phone-mockup');

    function updateParallax() {
        if (blobPurple) {
            blobPurple.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
        }
        if (blobPink) {
            blobPink.style.transform = `translate3d(0, ${scrollY * -0.08}px, 0)`;
        }
        
        if (phoneMockup) {
            const tilt = -3 + scrollY * 0.005;
            const cappedTilt = Math.max(-6, Math.min(6, tilt));
            const yOffset = scrollY * -0.05;
            phoneMockup.style.transform = `rotate(${cappedTilt}deg) translate3d(0, ${yOffset}px, 0)`;
        }
    }

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });

    /* ==========================================================================
       Paywall Pricing CTA Interaction
       ========================================================================== */
    const paywallSubmitBtns = document.querySelectorAll('.paywallSubmitBtn');
    
    paywallSubmitBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `
                <div class="spinner"></div>
                <span>მიმდინარეობს კავშირი...</span>
            `;
            
            setTimeout(() => {
                alert("✦ კავშირი წარმატებით დამყარდა!\n\nპრემიუმის გასააქტიურებლად და გადახდის დასასრულებლად გთხოვთ გახსნათ LOTUS აპლიკაცია თქვენს ტელეფონში.");
                
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }, 2000);
        });
    });

    /* ==========================================================================
       Scroll Reveal Animations
       ========================================================================== */
    const revealElements = document.querySelectorAll('.editorial-card, .rhythm-info, .progress-chart-card, .paywall-card, .download-content-centered, .download-portal');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.88;
        
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);
});
