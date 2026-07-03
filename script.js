// Gregory La Blanc — site interactions

const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav background on scroll
const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
};
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Mobile menu
const closeMenu = () => {
    nav.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
};

navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('.mobile-menu a').forEach((link) => {
    link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

// Reveal-on-scroll with a slight stagger for siblings entering together
const revealEls = document.querySelectorAll('[data-reveal]');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
    let pending = [];
    let flushScheduled = false;

    const flush = () => {
        pending.forEach((el, i) => {
            el.style.setProperty('--reveal-delay', `${Math.min(i * 90, 450)}ms`);
            el.classList.add('is-visible');
        });
        pending = [];
        flushScheduled = false;
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            pending.push(entry.target);
            revealObserver.unobserve(entry.target);
        });
        if (pending.length && !flushScheduled) {
            flushScheduled = true;
            requestAnimationFrame(flush);
        }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
}

// Animated stat counters
const counters = document.querySelectorAll('[data-count]');

const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + (progress === 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.6 });

counters.forEach((el) => counterObserver.observe(el));

// Podcast topic bars fill when scrolled into view
const barsContainer = document.querySelector('.topic-bars');
if (barsContainer) {
    const fillBars = () => {
        barsContainer.querySelectorAll('.bar-fill').forEach((bar, i) => {
            setTimeout(() => {
                bar.style.width = `${bar.dataset.width}%`;
            }, prefersReducedMotion ? 0 : i * 70);
        });
    };
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                fillBars();
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    barObserver.observe(barsContainer);
}

// Highlight the nav link for the section in view
const sectionLinks = new Map();
document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionLinks.set(section, link);
});

if (sectionLinks.size) {
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = sectionLinks.get(entry.target);
            if (!link) return;
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-links a.active').forEach((a) => a.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sectionLinks.forEach((_, section) => activeObserver.observe(section));
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
