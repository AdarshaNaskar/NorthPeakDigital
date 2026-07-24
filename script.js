/**
 * NorthPeak Digital - Core Interactive JavaScript
 * High-Performance, Vanilla JS optimized for 60 FPS, zero reflows & WCAG AA accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* --------------------------------------------------------------------------
       1. STICKY HEADER & ACTIVE NAV TRACKING (CACHED REFOW-FREE SCROLL)
       -------------------------------------------------------------------------- */
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    let sectionPositions = [];

    function cacheSectionPositions() {
        sectionPositions = Array.from(sections).map((current) => ({
            id: current.getAttribute('id'),
            top: current.offsetTop - 120,
            height: current.offsetHeight,
        }));
    }

    // Cache initial section positions
    cacheSectionPositions();

    // Recalculate section positions on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(cacheSectionPositions, 150);
    }, { passive: true });

    function handleHeaderScroll() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    function updateActiveNavLink() {
        const scrollY = window.pageYOffset;

        for (let i = 0; i < sectionPositions.length; i++) {
            const sec = sectionPositions[i];
            if (scrollY > sec.top && scrollY <= sec.top + sec.height) {
                navLinks.forEach((link) => {
                    const isTarget = link.getAttribute('href') === `#${sec.id}`;
                    link.classList.toggle('active', isTarget);
                });
                break;
            }
        }
    }

    // RequestAnimationFrame Scroll Lock to eliminate layout thrashing & main-thread blocking
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                handleHeaderScroll();
                updateActiveNavLink();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    handleHeaderScroll();

    /* --------------------------------------------------------------------------
       2. MOBILE NAVIGATION DRAWER & ACCESSIBILITY
       -------------------------------------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta a');

    function toggleMobileMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNav.setAttribute('aria-hidden', isExpanded);

        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');

        // Prevent background scrolling when drawer is open
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    /* --------------------------------------------------------------------------
       3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
       -------------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-revealed');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
    });

    revealElements.forEach((el) => revealObserver.observe(el));

    /* --------------------------------------------------------------------------
       4. ANIMATED STATISTICS COUNTER
       -------------------------------------------------------------------------- */
    const statNumbers = document.querySelectorAll('[data-counter-target]');
    let hasAnimatedCounters = false;

    function animateCounters() {
        statNumbers.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-counter-target'), 10);
            const duration = 1500; // ms
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimatedCounters) {
                    hasAnimatedCounters = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(aboutSection);
    }

    /* --------------------------------------------------------------------------
       5. HERO MOUSE PARALLAX TILT EFFECT (rAF THROTTLED)
       -------------------------------------------------------------------------- */
    const heroSection = document.getElementById('home');
    const heroMockup = document.getElementById('heroMockup');

    if (heroSection && heroMockup && window.innerWidth > 991) {
        let isMouseMoving = false;
        let lastEvent = null;

        heroSection.addEventListener('mousemove', (e) => {
            lastEvent = e;
            if (!isMouseMoving) {
                requestAnimationFrame(() => {
                    if (lastEvent) {
                        const rect = heroSection.getBoundingClientRect();
                        const x = lastEvent.clientX - rect.left - rect.width / 2;
                        const y = lastEvent.clientY - rect.top - rect.height / 2;

                        const tiltX = (y / (rect.height / 2)) * -4; // Max 4deg subtle tilt
                        const tiltY = (x / (rect.width / 2)) * 4;

                        heroMockup.style.transform = `rotateY(${tiltY - 5}deg) rotateX(${tiltX + 3}deg)`;
                    }
                    isMouseMoving = false;
                });
                isMouseMoving = true;
            }
        }, { passive: true });

        heroSection.addEventListener('mouseleave', () => {
            heroMockup.style.transform = 'rotateY(-5deg) rotateX(3deg)';
        });
    }

    /* --------------------------------------------------------------------------
       6. FAQ ACCORDION INTERACTION & ACCESSIBILITY
       -------------------------------------------------------------------------- */
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const contentId = trigger.getAttribute('aria-controls');
            const contentEl = document.getElementById(contentId);

            // Close other accordion items for clean accordion UX
            faqTriggers.forEach((otherTrigger) => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherId = otherTrigger.getAttribute('aria-controls');
                    const otherContent = document.getElementById(otherId);
                    if (otherContent) otherContent.setAttribute('aria-hidden', 'true');
                }
            });

            trigger.setAttribute('aria-expanded', !isExpanded);
            if (contentEl) {
                contentEl.setAttribute('aria-hidden', isExpanded);
            }
        });
    });

    /* --------------------------------------------------------------------------
       7. CONTACT FORM VALIDATION & SUBMISSION
       -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successToast = document.getElementById('formSuccessToast');

    const fields = {
        name: {
            input: document.getElementById('contactName'),
            error: document.getElementById('nameError'),
            validate: (val) => val.trim().length >= 2,
        },
        company: {
            input: document.getElementById('contactCompany'),
            error: null,
            validate: () => true,
        },
        email: {
            input: document.getElementById('contactEmail'),
            error: document.getElementById('emailError'),
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        },
        phone: {
            input: document.getElementById('contactPhone'),
            error: null,
            validate: () => true,
        },
        service: {
            input: document.getElementById('contactService'),
            error: document.getElementById('serviceError'),
            validate: (val) => val !== '',
        },
        budget: {
            input: document.getElementById('contactBudget'),
            error: document.getElementById('budgetError'),
            validate: (val) => val !== '',
        },
        message: {
            input: document.getElementById('contactMessage'),
            error: document.getElementById('messageError'),
            validate: (val) => val.trim().length >= 10,
        },
    };

    // Real-time blur validation
    Object.keys(fields).forEach((key) => {
        const field = fields[key];
        if (field.input) {
            field.input.addEventListener('blur', () => {
                validateField(field);
            });
            field.input.addEventListener('input', () => {
                if (field.input.parentElement.classList.contains('has-error')) {
                    validateField(field);
                }
            });
        }
    });

    function validateField(field) {
        const isValid = field.validate(field.input.value);
        const container = field.input.parentElement;

        if (!isValid) {
            container.classList.add('has-error');
        } else {
            container.classList.remove('has-error');
        }
        return isValid;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isFormValid = true;
            Object.keys(fields).forEach((key) => {
                const field = fields[key];
                if (!validateField(field)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) return;

            // Simulate API submit request
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;

                // Show success state
                successToast.classList.add('active');
                contactForm.reset();

                // Hide success toast after 6s
                setTimeout(() => {
                    successToast.classList.remove('active');
                }, 6000);
            }, 1200);
        });
    }

    /* --------------------------------------------------------------------------
       8. NEWSLETTER FORM HANDLING
       -------------------------------------------------------------------------- */
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterBtn = document.getElementById('newsletterBtn');
    const newsletterToast = document.getElementById('newsletterToast');

    if (newsletterForm && newsletterEmail) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = newsletterEmail.value.trim();
            if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                newsletterEmail.style.borderColor = '#f87171';
                return;
            }

            newsletterEmail.style.borderColor = '';
            if (newsletterBtn) {
                newsletterBtn.classList.add('btn-loading');
                newsletterBtn.disabled = true;
            }

            setTimeout(() => {
                if (newsletterBtn) {
                    newsletterBtn.classList.remove('btn-loading');
                    newsletterBtn.disabled = false;
                }
                if (newsletterToast) {
                    newsletterToast.classList.add('active');
                }
                newsletterEmail.value = '';

                setTimeout(() => {
                    if (newsletterToast) {
                        newsletterToast.classList.remove('active');
                    }
                }, 4000);
            }, 800);
        });
    }

    /* --------------------------------------------------------------------------
       9. PRICING BILLING TOGGLE SWITCH (PROJECT VS ANNUAL CARE SLA)
       -------------------------------------------------------------------------- */
    const pricingToggle = document.getElementById('pricingToggle');
    const labelMonthly = document.getElementById('labelMonthly');
    const labelAnnual = document.getElementById('labelAnnual');

    const pricingData = {
        monthly: {
            starter: { price: '4,999', period: '/ project' },
            growth: { price: '8,999', period: '/ project' },
            enterprise: { price: '14,999', period: '+ / custom' }
        },
        annual: {
            starter: { price: '3,999', period: '/ project (20% off)' },
            growth: { price: '7,199', period: '/ project (20% off)' },
            enterprise: { price: '11,999', period: '+ / custom (20% off)' }
        }
    };

    if (pricingToggle) {
        pricingToggle.addEventListener('change', () => {
            const isAnnual = pricingToggle.checked;
            const mode = isAnnual ? 'annual' : 'monthly';

            if (labelMonthly && labelAnnual) {
                labelMonthly.classList.toggle('active', !isAnnual);
                labelAnnual.classList.toggle('active', isAnnual);
            }

            const amounts = [
                { el: document.getElementById('priceStarter'), val: pricingData[mode].starter.price },
                { el: document.getElementById('priceGrowth'), val: pricingData[mode].growth.price },
                { el: document.getElementById('priceEnterprise'), val: pricingData[mode].enterprise.price }
            ];

            const periods = [
                { el: document.getElementById('periodStarter'), val: pricingData[mode].starter.period },
                { el: document.getElementById('periodGrowth'), val: pricingData[mode].growth.period },
                { el: document.getElementById('periodEnterprise'), val: pricingData[mode].enterprise.period }
            ];

            amounts.forEach((item) => {
                if (item.el) {
                    item.el.classList.add('price-updating');
                    setTimeout(() => {
                        item.el.textContent = item.val;
                        item.el.classList.remove('price-updating');
                    }, 150);
                }
            });

            periods.forEach((item) => {
                if (item.el) {
                    item.el.textContent = item.val;
                }
            });
        });
    }

    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});
