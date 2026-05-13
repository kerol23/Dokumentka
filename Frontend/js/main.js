// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = href === '#'
            ? document.documentElement
            : document.querySelector(href);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVBAR - aktivní sekce při scrollování =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.scrollY;

    if (scrollY > 50) {
        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
        navbar.style.padding = '10px 0';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.padding = '16px 0';
    }

    // Zvýraznění aktivního odkazu v navbaru
    const sections = ['features', 'pricing'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (section && link) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                link.style.color = 'var(--primary)';
            } else {
                link.style.color = 'rgba(255,255,255,0.8)';
            }
        }
    });
});

// ===== ANIMACE PŘI SCROLLOVÁNÍ =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
    card.classList.add('fade-up');
    observer.observe(card);
});

// ===== NAVBAR TRANSITION =====
const navbar = document.querySelector('.navbar');
navbar.style.transition = 'all 0.3s ease';

// ===== ANIMACE HERO KARET PŘI NÁVRATU =====
// ===== ANIMACE HERO KARET PŘI NÁVRATU =====
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animace hero karet
            document.querySelectorAll('.hero-card').forEach((card, index) => {
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = '';
                card.style.animationDelay = `${0.2 + index * 0.2}s`;
            });

            // Animace hero content
            const heroContent = document.querySelector('.hero-content');
            heroContent.classList.remove('visible');
            heroContent.offsetHeight;
            setTimeout(() => {
                heroContent.classList.add('visible');
            }, 50);

        } else {
            document.querySelector('.hero-content').classList.remove('visible');
        }
    });
}, { threshold: 0.05 }); // změněno z 0.3 na 0.05

// Zobraz hero content hned při načtení
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.classList.add('visible');
    }
});

// Sleduj hero sekci
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}