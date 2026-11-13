document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==========================================================================
       0. Helper: Reusable Ambient Zen Sound Synthesizer (Web Audio API)
       ========================================================================== */
    const playZenTone = (frequency = 432, duration = 1.2, type = 'sine') => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            // Smooth gentle attack & exponential decay
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context silently falls back if not supported
        }
    };

    /* ==========================================================================
       1. Toast Notification System
       ========================================================================== */
    const toastNotification = document.getElementById('toastNotification');
    let toastTimeout = null;

    const showToast = (title, desc, icon = 'stars') => {
        if (!toastNotification) return;

        const titleEl = toastNotification.querySelector('.toast-title');
        const descEl = toastNotification.querySelector('.toast-desc');
        const iconEl = toastNotification.querySelector('.toast-icon');

        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = desc;
        if (iconEl) iconEl.textContent = icon;

        toastNotification.classList.add('visible', 'show');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('visible', 'show');
        }, 4500);
    };

    /* ==========================================================================
       2. Header Scroll Effect & Navigation Menu
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.textContent = isOpen ? 'close' : 'menu';
            }
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.textContent = 'menu';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.textContent = 'menu';
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ==========================================================================
       3. Dynamic Background Particles Spawner
       ========================================================================== */
    const particlesContainer = document.getElementById('particlesContainer');
    const particleCount = 45;

    if (particlesContainer) {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('bg-particle');

            const size = Math.random() * 5 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;

            particle.style.animationDuration = `${Math.random() * 25 + 20}s`;
            particle.style.animationDelay = `${Math.random() * -35}s`;

            const opacityVal = Math.random() * 0.25 + 0.1;
            particle.style.setProperty('--p-opacity', opacityVal);

            particlesContainer.appendChild(particle);
        }
    }

    /* ==========================================================================
       4. Scroll Parallax Effect
       ========================================================================== */
    let scrollY = window.scrollY;
    let ticking = false;

    const blobPurple = document.getElementById('blobPurple');
    const blobPink = document.getElementById('blobPink');
    const phoneMockup = document.querySelector('.phone-mockup');

    function updateParallax() {
        if (blobPurple) {
            blobPurple.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
        }
        if (blobPink) {
            blobPink.style.transform = `translate3d(0, ${scrollY * -0.06}px, 0)`;
        }
        if (phoneMockup) {
            const tilt = -3 + scrollY * 0.004;
            const cappedTilt = Math.max(-6, Math.min(6, tilt));
            const yOffset = scrollY * -0.04;
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
       5. Interactive Practices Slider (Carousel Component)
       ========================================================================== */
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderViewport = document.getElementById('sliderViewport');
    const sliderPrevBtn = document.getElementById('sliderPrevBtn');
    const sliderNextBtn = document.getElementById('sliderNextBtn');
    const sliderDotsContainer = document.getElementById('sliderDots');
    const sliderStatus = document.getElementById('sliderStatus');
    const filterChips = document.querySelectorAll('.filter-chip');

    if (sliderTrack && sliderViewport) {
        let currentSlideIndex = 0;
        let activeCategory = 'all';
        let autoplayTimer = null;
        let touchStartX = 0;
        let touchEndX = 0;

        const getAllSlides = () => Array.from(sliderTrack.querySelectorAll('.practice-slide'));
        const getVisibleSlides = () => getAllSlides().filter(slide => !slide.classList.contains('filtered-out'));

        // Calculate how many slides can fit in the viewport
        const getVisibleSlidesPerView = () => {
            const width = window.innerWidth;
            if (width < 640) return 1;
            if (width < 992) return 2;
            return 3;
        };

        // Render Dots Pagination
        const renderDots = () => {
            if (!sliderDotsContainer) return;
            sliderDotsContainer.innerHTML = '';
            const visible = getVisibleSlides();
            const perView = getVisibleSlidesPerView();
            const maxIndex = Math.max(0, visible.length - perView);

            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `სლაიდი ${i + 1}`);
                if (i === currentSlideIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.setAttribute('aria-selected', 'false');
                }

                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });

                sliderDotsContainer.appendChild(dot);
            }
        };

        const updateSliderPosition = () => {
            const visible = getVisibleSlides();
            const perView = getVisibleSlidesPerView();
            const maxIndex = Math.max(0, visible.length - perView);

            if (currentSlideIndex > maxIndex) {
                currentSlideIndex = maxIndex;
            }
            if (currentSlideIndex < 0) {
                currentSlideIndex = 0;
            }

            if (visible.length > 0) {
                const firstVisible = visible[0];
                const slideWidth = firstVisible.getBoundingClientRect().width;
                const gap = 24; // matching CSS gap
                const offset = currentSlideIndex * (slideWidth + gap);
                sliderTrack.style.transform = `translateX(-${offset}px)`;
            } else {
                sliderTrack.style.transform = `translateX(0px)`;
            }

            // Update dots
            if (sliderDotsContainer) {
                const dots = sliderDotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((dot, idx) => {
                    if (idx === currentSlideIndex) {
                        dot.classList.add('active');
                        dot.setAttribute('aria-selected', 'true');
                    } else {
                        dot.classList.remove('active');
                        dot.setAttribute('aria-selected', 'false');
                    }
                });
            }

            // Update Status text
            if (sliderStatus) {
                const total = visible.length;
                sliderStatus.textContent = total > 0 ? `სლაიდი ${currentSlideIndex + 1} / ${total}` : 'შედეგი ვერ მოიძებნა';
            }

            // Update Nav buttons
            if (sliderPrevBtn) sliderPrevBtn.disabled = currentSlideIndex === 0;
            if (sliderNextBtn) sliderNextBtn.disabled = currentSlideIndex >= maxIndex;
        };

        const goToSlide = (index) => {
            currentSlideIndex = index;
            updateSliderPosition();
        };

        const nextSlide = () => {
            const visible = getVisibleSlides();
            const perView = getVisibleSlidesPerView();
            const maxIndex = Math.max(0, visible.length - perView);

            if (currentSlideIndex < maxIndex) {
                currentSlideIndex++;
            } else {
                currentSlideIndex = 0; // loop back
            }
            updateSliderPosition();
        };

        const prevSlide = () => {
            const visible = getVisibleSlides();
            const perView = getVisibleSlidesPerView();
            const maxIndex = Math.max(0, visible.length - perView);

            if (currentSlideIndex > 0) {
                currentSlideIndex--;
            } else {
                currentSlideIndex = maxIndex;
            }
            updateSliderPosition();
        };

        // Navigation button listeners
        if (sliderNextBtn) {
            sliderNextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoplay();
            });
        }

        if (sliderPrevBtn) {
            sliderPrevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoplay();
            });
        }

        // Category Filtering
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-selected', 'true');

                activeCategory = chip.getAttribute('data-category');
                const allSlides = getAllSlides();

                allSlides.forEach(slide => {
                    const slideCat = slide.getAttribute('data-category');
                    if (activeCategory === 'all' || slideCat === activeCategory) {
                        slide.classList.remove('filtered-out');
                    } else {
                        slide.classList.add('filtered-out');
                    }
                });

                currentSlideIndex = 0;
                renderDots();
                updateSliderPosition();
                resetAutoplay();
            });
        });

        // Touch & Swipe Support
        sliderViewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderViewport.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            resetAutoplay();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 40;
            if (touchStartX - touchEndX > threshold) {
                nextSlide();
            } else if (touchEndX - touchStartX > threshold) {
                prevSlide();
            }
        };

        // Keyboard navigation
        sliderViewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoplay();
            }
        });

        // Autoplay management
        const startAutoplay = () => {
            autoplayTimer = setInterval(() => {
                nextSlide();
            }, 6000);
        };

        const stopAutoplay = () => {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        sliderViewport.addEventListener('mouseenter', stopAutoplay);
        sliderViewport.addEventListener('mouseleave', startAutoplay);

        // Resize handler
        window.addEventListener('resize', () => {
            renderDots();
            updateSliderPosition();
        });

        // Init Slider
        renderDots();
        updateSliderPosition();
        startAutoplay();
    }

    /* ==========================================================================
       6. Interactive Breathing Ritual Widget (With Native App Sounds)
       ========================================================================== */
    const startBreathingBtn = document.getElementById('startBreathingBtn');
    const stopBreathingBtn = document.getElementById('stopBreathingBtn');
    const breathingAudioToggle = document.getElementById('breathingAudioToggle');
    const breathingOrb = document.getElementById('breathingOrb');
    const breathingPhase = document.getElementById('breathingPhase');
    const breathingTimer = document.getElementById('breathingTimer');
    const breathingSubtext = document.getElementById('breathingSubtext');
    const breathingCycleBadge = document.getElementById('breathingCycleBadge');

    // Audio elements loaded directly from app assets
    const bgAudio = new Audio('assets/audio/Sub-Bass Hiss.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.35;

    const breathInAudio = new Audio('assets/audio/breath-in.wav');
    breathInAudio.volume = 0.75;

    const breathOutAudio = new Audio('assets/audio/breath-out.wav');
    breathOutAudio.volume = 0.75;

    if (startBreathingBtn && stopBreathingBtn && breathingOrb) {
        let isBreathingActive = false;
        let isMusicEnabled = true;
        let breathingInterval = null;
        let countdownSeconds = 4;
        let currentStepIndex = 0;
        let completedCycles = 0;
        const totalTargetCycles = 4;

        // Audio toggle handler
        if (breathingAudioToggle) {
            breathingAudioToggle.addEventListener('click', () => {
                isMusicEnabled = !isMusicEnabled;
                const icon = breathingAudioToggle.querySelector('i');
                const text = breathingAudioToggle.querySelector('.audio-toggle-text');
                
                if (isMusicEnabled) {
                    breathingAudioToggle.classList.remove('muted');
                    if (icon) icon.textContent = 'volume_up';
                    if (text) text.textContent = 'მუსიკა: ჩართულია';
                    if (isBreathingActive) bgAudio.play().catch(() => {});
                } else {
                    breathingAudioToggle.classList.add('muted');
                    if (icon) icon.textContent = 'volume_off';
                    if (text) text.textContent = 'მუსიკა: გამორთულია';
                    bgAudio.pause();
                }
            });
        }

        // 4-4-4 Box Breathing Phases
        const phases = [
            { name: 'ჩაისუნთქე', class: 'inhale', sub: 'ნაზად ცხვირით' },
            { name: 'შეიკავე', class: 'hold', sub: 'დააკავე ფილტვებში' },
            { name: 'ამოისუნთქე', class: 'exhale', sub: 'სრულად პირით' },
            { name: 'შეიკავე', class: 'hold', sub: 'დაისვენე მომდევნო ციკლამდე' }
        ];

        const setBreathingPhase = (index) => {
            const phase = phases[index];
            breathingOrb.className = `breathing-orb ${phase.class}`;
            if (breathingPhase) breathingPhase.textContent = phase.name;
            if (breathingSubtext) breathingSubtext.textContent = phase.sub;

            // Trigger voice cues from app assets
            if (phase.class === 'inhale') {
                breathInAudio.currentTime = 0;
                breathInAudio.play().catch(() => {});
            } else if (phase.class === 'exhale') {
                breathOutAudio.currentTime = 0;
                breathOutAudio.play().catch(() => {});
            }
        };

        const tickBreathing = () => {
            countdownSeconds--;
            if (breathingTimer) breathingTimer.textContent = countdownSeconds;

            if (countdownSeconds <= 0) {
                currentStepIndex++;
                if (currentStepIndex >= phases.length) {
                    currentStepIndex = 0;
                    completedCycles++;
                    if (breathingCycleBadge) {
                        breathingCycleBadge.textContent = `ციკლი: ${completedCycles} / ${totalTargetCycles}`;
                    }

                    if (completedCycles >= totalTargetCycles) {
                        finishBreathingSession();
                        return;
                    }
                }
                countdownSeconds = 4;
                if (breathingTimer) breathingTimer.textContent = countdownSeconds;
                setBreathingPhase(currentStepIndex);
            }
        };

        const startBreathingSession = () => {
            isBreathingActive = true;
            completedCycles = 0;
            currentStepIndex = 0;
            countdownSeconds = 4;

            startBreathingBtn.style.display = 'none';
            stopBreathingBtn.style.display = 'inline-flex';
            if (breathingCycleBadge) breathingCycleBadge.textContent = `ციკლი: 0 / ${totalTargetCycles}`;

            // Play background music if enabled
            if (isMusicEnabled) {
                bgAudio.currentTime = 0;
                bgAudio.play().catch((e) => console.log('Background music autoplay prevented', e));
            }

            setBreathingPhase(0);
            if (breathingTimer) breathingTimer.textContent = countdownSeconds;

            breathingInterval = setInterval(tickBreathing, 1000);
            showToast('სუნთქვის რიტუალი დაიწყო', 'მიჰყევით ხმოვან მითითებებსა და წრის პულსაციას.', 'spa');
        };

        const stopBreathingSession = () => {
            isBreathingActive = false;
            if (breathingInterval) clearInterval(breathingInterval);

            // Pause and reset all audio
            bgAudio.pause();
            bgAudio.currentTime = 0;
            breathInAudio.pause();
            breathInAudio.currentTime = 0;
            breathOutAudio.pause();
            breathOutAudio.currentTime = 0;

            breathingOrb.className = 'breathing-orb';
            if (breathingPhase) breathingPhase.textContent = 'მზად ხარ?';
            if (breathingTimer) breathingTimer.textContent = '4';
            if (breathingSubtext) breathingSubtext.textContent = 'დააჭირე დაწყებას';

            startBreathingBtn.style.display = 'inline-flex';
            stopBreathingBtn.style.display = 'none';
        };

        const finishBreathingSession = () => {
            stopBreathingSession();
            playZenTone(660, 2.0, 'sine');
            showToast('რიტუალი დასრულდა!', 'თქვენ წარმატებით დაასრულეთ 4 სრული სუნთქვითი ციკლი.', 'emoji_events');
        };

        startBreathingBtn.addEventListener('click', startBreathingSession);
        stopBreathingBtn.addEventListener('click', stopBreathingSession);
    }

    /* ==========================================================================
       7. Plan Selection Modal
       ========================================================================== */
    const planModal = document.getElementById('planModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalProceedBtn = document.getElementById('modalProceedBtn');
    const modalPlanName = document.getElementById('modalPlanName');
    const modalPlanPrice = document.getElementById('modalPlanPrice');
    const modalPlanDesc = document.getElementById('modalPlanDesc');
    const paywallSubmitBtns = document.querySelectorAll('.paywallSubmitBtn');

    if (planModal) {
        const openModal = (planName, planPrice, planDesc) => {
            if (modalPlanName) modalPlanName.textContent = planName;
            if (modalPlanPrice) modalPlanPrice.textContent = planPrice;
            if (modalPlanDesc) modalPlanDesc.textContent = `არჩეულია: ${planName}`;
            planModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            planModal.style.display = 'none';
            document.body.style.overflow = '';
        };

        paywallSubmitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-plan-name') || 'პრემიუმ პაკეტი';
                const price = btn.getAttribute('data-plan-price') || '₾59.99';
                openModal(name, price, name);
            });
        });

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

        planModal.addEventListener('click', (e) => {
            if (e.target === planModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && planModal.style.display === 'flex') {
                closeModal();
            }
        });

        if (modalProceedBtn) {
            modalProceedBtn.addEventListener('click', () => {
                closeModal();
            });
        }
    }

    /* ==========================================================================
       8. FAQ Accordion Component
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all others
                faqItems.forEach(other => {
                    other.classList.remove('active');
                    const otherBtn = other.querySelector('.faq-question');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    /* ==========================================================================
       9. Registration & Free Trial Form Validation (Client-Side Validation)
       ========================================================================== */
    const registrationForm = document.getElementById('registrationForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const primaryGoalSelect = document.getElementById('primaryGoal');
    const termsCheck = document.getElementById('termsCheck');
    const submitFormBtn = document.getElementById('submitFormBtn');

    // Error containers
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const goalError = document.getElementById('goalError');
    const termsError = document.getElementById('termsError');

    const setError = (input, errorEl, message) => {
        if (input) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
        }
        if (errorEl) errorEl.textContent = message;
    };

    const clearError = (input, errorEl) => {
        if (input) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
        if (errorEl) errorEl.textContent = '';
    };

    // Validation functions
    const validateName = () => {
        if (!fullNameInput) return true;
        const val = fullNameInput.value.trim();
        if (val.length === 0) {
            setError(fullNameInput, nameError, 'გთხოვთ მიუთითოთ თქვენი სახელი და გვარი');
            return false;
        } else if (val.length < 3) {
            setError(fullNameInput, nameError, 'სახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს');
            return false;
        }
        clearError(fullNameInput, nameError);
        return true;
    };

    const validateEmail = () => {
        if (!emailInput) return true;
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val.length === 0) {
            setError(emailInput, emailError, 'გთხოვთ მიუთითოთ ელფოსტის მისამართი');
            return false;
        } else if (!emailRegex.test(val)) {
            setError(emailInput, emailError, 'გთხოვთ შეიყვანოთ სწორი ელფოსტა (მაგ. name@domain.com)');
            return false;
        }
        clearError(emailInput, emailError);
        return true;
    };

    const validatePhone = () => {
        if (!phoneInput) return true;
        const val = phoneInput.value.trim().replace(/[\s-]/g, '');
        const phoneRegex = /^[0-9+]{9,15}$/;
        if (val.length === 0) {
            setError(phoneInput, phoneError, 'გთხოვთ მიუთითოთ ტელეფონის ნომერი');
            return false;
        } else if (!phoneRegex.test(val)) {
            setError(phoneInput, phoneError, 'გთხოვთ შეიყვანოთ ვალიდური ნომერი (მინ. 9 ციფრი)');
            return false;
        }
        clearError(phoneInput, phoneError);
        return true;
    };

    const validateGoal = () => {
        if (!primaryGoalSelect) return true;
        if (!primaryGoalSelect.value) {
            setError(primaryGoalSelect, goalError, 'გთხოვთ აირჩიოთ თქვენი ძირითადი მიზანი');
            return false;
        }
        clearError(primaryGoalSelect, goalError);
        return true;
    };

    const validateTerms = () => {
        if (!termsCheck) return true;
        if (!termsCheck.checked) {
            if (termsError) termsError.textContent = 'რეგისტრაციისთვის აუცილებელია წესებზე დათანხმება';
            return false;
        }
        if (termsError) termsError.textContent = '';
        return true;
    };

    // Real-time input listeners
    if (fullNameInput) {
        fullNameInput.addEventListener('input', () => { if (fullNameInput.classList.contains('is-invalid')) validateName(); });
        fullNameInput.addEventListener('blur', validateName);
    }
    if (emailInput) {
        emailInput.addEventListener('input', () => { if (emailInput.classList.contains('is-invalid')) validateEmail(); });
        emailInput.addEventListener('blur', validateEmail);
    }
    if (phoneInput) {
        phoneInput.addEventListener('input', () => { if (phoneInput.classList.contains('is-invalid')) validatePhone(); });
        phoneInput.addEventListener('blur', validatePhone);
    }
    if (primaryGoalSelect) {
        primaryGoalSelect.addEventListener('change', validateGoal);
    }
    if (termsCheck) {
        termsCheck.addEventListener('change', validateTerms);
    }

    // Form Submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isNameValid = validateName();
            const isEmailValid = validateEmail();
            const isPhoneValid = validatePhone();
            const isGoalValid = validateGoal();
            const isTermsValid = validateTerms();

            if (!isNameValid || !isEmailValid || !isPhoneValid || !isGoalValid || !isTermsValid) {
                showToast('შეცდომა ფორმაში', 'გთხოვთ შეასწოროთ მითითებული ველები.', 'error_outline');
                return;
            }

            // Simulated asynchronous submission with loading animation
            const originalBtnHTML = submitFormBtn ? submitFormBtn.innerHTML : '';
            if (submitFormBtn) {
                submitFormBtn.disabled = true;
                submitFormBtn.innerHTML = `
                    <div class="spinner"></div>
                    <span>მუშავდება მონაცემები...</span>
                `;
            }

            setTimeout(() => {
                const name = fullNameInput.value.trim();
                const email = emailInput.value.trim();

                // Reset button state
                if (submitFormBtn) {
                    submitFormBtn.disabled = false;
                    submitFormBtn.innerHTML = originalBtnHTML;
                }

                // Reset form inputs & validation classes
                registrationForm.reset();
                [fullNameInput, emailInput, phoneInput, primaryGoalSelect].forEach(input => {
                    if (input) input.classList.remove('is-valid');
                });

                playZenTone(587, 1.8, 'sine');
                showToast('რეგისტრაცია წარმატებულია!', `მადლობა ${name}, 7-დღიანი წვდომის კოდი გაგზავნილია: ${email}`, 'check_circle');
            }, 1400);
        });
    }

    /* ==========================================================================
       10. Scroll Reveal Animations
       ========================================================================== */
    const revealElements = document.querySelectorAll(
        '.editorial-card, .rhythm-info, .progress-chart-card, .paywall-card, .download-content-centered, .download-portal, .slide-card, .breathing-content, .breathing-widget-display, .trial-info-panel, .trial-form-card'
    );

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;
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
        el.style.transition = 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);
});
