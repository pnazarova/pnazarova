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

// Click-to-play YouTube embeds (nothing loads from YouTube until tapped)
document.querySelectorAll('.video-card[data-video]').forEach((card) => {
    card.addEventListener('click', () => {
        const id = card.dataset.video;
        const iframe = document.createElement('iframe');
        iframe.className = 'video-frame';
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        iframe.title = card.getAttribute('aria-label') || 'Video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        card.replaceChildren(iframe);
    }, { once: true });
});

// Format chooser: recommend an offering and prepare a message the visitor
// can send via Gmail, their mail app, or copy anywhere (mailto alone fails
// silently on machines with no default mail client)
const formatForm = document.getElementById('format-form');
if (formatForm) {
    formatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(formatForm);
        const v = (k) => (f.get(k) || '').toString().trim();
        const note = document.getElementById('form-note');
        if (!v('name') || !v('email')) {
            note.textContent = 'Please add your name and email so Greg can reply.';
            return;
        }
        const time = v('time'), where = v('where'), audience = v('audience');
        let rec = 'Greg will suggest the right format';
        if (time.startsWith('A talk')) {
            rec = audience === 'Conference audience' ? 'Keynote or Fireside Chat' : 'Keynote, or a moderated session';
        } else if (time === 'One day') {
            rec = 'Strategy Sprint';
        } else if (time === 'One week') {
            if (where === 'Berkeley campus') rec = 'Executive Education Week, Berkeley Edition';
            else if (where === 'Silicon Valley') rec = 'Silicon Valley Immersion';
            else rec = 'Executive Education Week, Custom Edition';
        }
        const body = [
            `Name: ${v('name')}`,
            `Email: ${v('email')}`,
            `Organization & role: ${v('org')}`,
            `Phone / WhatsApp: ${v('phone') ? v('cc') + ' ' + v('phone') : ''}`,
            `LinkedIn: ${v('linkedin')}`,
            `Time available: ${time}`,
            `Location: ${where}`,
            `Audience: ${audience} (approx. ${v('size') || '?'} people)`,
            `Timeframe: ${v('when')}`,
            `Desired outcome: ${v('outcome')}`,
            '',
            `Suggested format from the site: ${rec}`
        ].join('\n');
        const subject = `Engagement inquiry from ${v('name')}${v('org') ? ' (' + v('org') + ')' : ''}`;

        document.getElementById('form-rec').textContent = `Suggested format: ${rec}`;
        document.getElementById('form-message').value = `To: glablanc@gmail.com\nSubject: ${subject}\n\n${body}`;
        document.getElementById('gmail-link').href =
            `https://mail.google.com/mail/?view=cm&fs=1&to=glablanc@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.getElementById('mailto-link').href =
            `mailto:glablanc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // primary path: send silently via FormSubmit; fallback panel only if it fails
        const btn = formatForm.querySelector('button[type=submit]');
        btn.disabled = true;
        const btnLabel = btn.textContent;
        btn.textContent = 'Sending…';
        fetch('https://formsubmit.co/ajax/glablanc@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: subject,
                _template: 'table',
                _honey: '',
                name: v('name'),
                email: v('email'),
                organization: v('org'),
                phone: v('phone') ? `${v('cc')} ${v('phone')}` : '',
                linkedin: v('linkedin'),
                time: time,
                location: where,
                audience: `${audience} (approx. ${v('size') || '?'} people)`,
                timeframe: v('when'),
                outcome: v('outcome'),
                suggested_format: rec
            })
        }).then((r) => r.json().then((d) => ({ ok: r.ok, d }))).then(({ ok, d }) => {
            btn.disabled = false;
            btn.textContent = btnLabel;
            if (ok && String(d.success) === 'true') {
                note.textContent = `Sent. Suggested format: ${rec}. Greg will reply to ${v('email')}.`;
                note.classList.add('form-note-ok');
                formatForm.reset();
            } else {
                throw new Error('formsubmit rejected');
            }
        }).catch(() => {
            btn.disabled = false;
            btn.textContent = btnLabel;
            const result = document.getElementById('form-result');
            result.hidden = false;
            note.textContent = 'Direct sending is unavailable right now. Use a button below instead.';
            result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    document.getElementById('copy-btn').addEventListener('click', async () => {
        const text = document.getElementById('form-message').value;
        const btn = document.getElementById('copy-btn');
        try {
            await navigator.clipboard.writeText(text);
            btn.textContent = 'Copied!';
        } catch (err) {
            const ta = document.getElementById('form-message');
            ta.focus(); ta.select();
            document.execCommand('copy');
            btn.textContent = 'Copied!';
        }
        setTimeout(() => { btn.textContent = 'Copy message'; }, 2000);
    });
}

// Contact mini-form: send via FormSubmit
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = new FormData(contactForm);
        const v = (k) => (f.get(k) || '').toString().trim();
        const note = document.getElementById('contact-note');
        if (!v('name') || !v('email')) {
            note.textContent = 'Please add your name and email so Greg can reply.';
            return;
        }
        const btn = contactForm.querySelector('button[type=submit]');
        btn.disabled = true;
        fetch('https://formsubmit.co/ajax/glablanc@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                _subject: `Contact request from ${v('name')}`,
                _template: 'table',
                _honey: '',
                name: v('name'),
                email: v('email'),
                phone: v('phone') ? `${v('cc')} ${v('phone')}` : '',
                linkedin: v('linkedin'),
                message: v('message')
            })
        }).then((r) => r.json().then((d) => ({ ok: r.ok, d }))).then(({ ok, d }) => {
            btn.disabled = false;
            if (ok && String(d.success) === 'true') {
                note.textContent = `Sent. Greg will get in touch with you.`;
                note.classList.add('form-note-ok');
                contactForm.reset();
            } else { throw new Error('rejected'); }
        }).catch(() => {
            btn.disabled = false;
            note.textContent = 'Could not send right now. Email glablanc@gmail.com or call the number below.';
        });
    });
}

// Email button: also copy the address (mailto alone fails without a mail app)
const emailBtn = document.getElementById('email-btn');
if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        const restore = emailBtn.textContent;
        const done = () => {
            emailBtn.textContent = 'Copied: glablanc@gmail.com';
            setTimeout(() => { emailBtn.textContent = restore; }, 2000);
        };
        if (navigator.clipboard) navigator.clipboard.writeText('glablanc@gmail.com').then(done).catch(() => {});
    });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
