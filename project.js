// ============================================
// Configuration et Variables Globales
// ============================================

const CONFIG = {
    videoAutoplay: true,
    transitionDuration: 450,
    // Réduire l'effet de mouvement pour plus de subtilité
    videoMovementIntensity: 15 // pixels de mouvement maximum
};

// ============================================
// Sélection des Éléments DOM
// ============================================

const elements = {
    video1: document.getElementById('vidbackground1'),
    video2: document.getElementById('vidbackground2'),
    section1: document.getElementById('section1'),
    btnDecouvrir: document.getElementById('decouvrir'),
    btnContact: document.querySelector('header > button'),
    section2: document.getElementById('section2'),
    section3: document.getElementById('section3')
};

// ============================================
// Effet Parallaxe sur les Vidéos (Simplifié)
// ============================================

class VideoParallax {
    constructor(container, videos) {
        this.container = container;
        this.videos = videos;
        this.centerX = 0;
        this.centerY = 0;
        this.tempTransitionTimeout = null;
        
        this.init();
    }

    init() {
        this.updateCenter();
        this.setupEventListeners();
        
        window.addEventListener('resize', () => {
            this.updateCenter();
        });
    }

    updateCenter() {
        const rect = this.container.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
    }

    setupEventListeners() {
        this.container.addEventListener('mousemove', (evt) => {
            this.handleMouseMove(evt);
        });

        this.container.addEventListener('mouseenter', () => {
            this.applyTemporaryTransition();
        });
    }

    handleMouseMove(evt) {
        const rect = this.container.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;

        // Calculer le pourcentage de déplacement (-1 à 1)
        const percentX = (x - this.centerX) / this.centerX;
        const percentY = (y - this.centerY) / this.centerY;

        // Appliquer le mouvement en pixels (inversé pour effet parallaxe)
        const moveX = -percentX * CONFIG.videoMovementIntensity;
        const moveY = -percentY * CONFIG.videoMovementIntensity;

        // Utiliser transform au lieu de top/left pour meilleures performances
        this.videos.forEach(video => {
            video.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
    }

    applyTemporaryTransition() {
        clearTimeout(this.tempTransitionTimeout);

        this.videos.forEach(video => {
            video.style.transition = `transform ${CONFIG.transitionDuration}ms ease-out`;
        });

        this.tempTransitionTimeout = setTimeout(() => {
            this.videos.forEach(video => {
                video.style.transition = 'none';
            });
        }, CONFIG.transitionDuration + 50);
    }
}

// ============================================
// Gestion de la Boucle Vidéo
// ============================================

class VideoLoop {
    constructor(video1, video2) {
        this.video1 = video1;
        this.video2 = video2;
        
        this.init();
    }

    init() {
        this.video1.addEventListener('ended', () => this.switchToVideo(2));
        this.video2.addEventListener('ended', () => this.switchToVideo(1));

        if (CONFIG.videoAutoplay) {
            this.startPlayback();
        }
    }

    switchToVideo(videoNumber) {
        if (videoNumber === 2) {
            this.video1.classList.remove('videoshowed');
            this.video1.classList.add('videohidden');
            this.video2.classList.remove('videohidden');
            this.video2.classList.add('videoshowed');
            
            this.video2.play().catch(err => console.warn('Lecture vidéo 2:', err));
            this.video1.currentTime = 0;
        } else {
            this.video2.classList.remove('videoshowed');
            this.video2.classList.add('videohidden');
            this.video1.classList.remove('videohidden');
            this.video1.classList.add('videoshowed');
            
            this.video1.play().catch(err => console.warn('Lecture vidéo 1:', err));
            this.video2.currentTime = 0;
        }
    }

    startPlayback() {
        const playPromise = this.video1.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Autoplay bloqué:', error);
            });
        }
    }
}

// ============================================
// Navigation et Scroll
// ============================================

class SmoothNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Bouton "Découvrir"
        if (elements.btnDecouvrir) {
            elements.btnDecouvrir.addEventListener('click', () => {
                this.scrollToSection(elements.section2);
            });
        }

        // Bouton "Contact" dans le header
        if (elements.btnContact) {
            elements.btnContact.addEventListener('click', () => {
                this.scrollToSection(elements.section3);
            });
        }
    }

    scrollToSection(targetSection) {
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ============================================
// Gestion des Formulaires
// ============================================

class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        // Newsletter
        const newsletterForm = document.querySelector('.newsletter');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(e.target);
            });
        }

        // Contact
        const contactForm = document.querySelector('.section3 form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit(e.target);
            });
        }
    }

    handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value : '';

        if (this.validateEmail(email)) {
            console.log('Newsletter:', email);
            alert('Merci pour votre inscription ! 🎉');
            form.reset();
        } else {
            alert('Veuillez entrer une adresse email valide.');
        }
    }

    handleContactSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (this.validateContactForm(data)) {
            console.log('Contact:', data);
            alert('Message envoyé ! Nous vous répondrons rapidement. 📧');
            form.reset();
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validateContactForm(data) {
        return data.name && 
               data.email && 
               this.validateEmail(data.email) && 
               data.message && 
               data.message.length > 10;
    }
}

// ============================================
// Initialisation de l'Application
// ============================================

class App {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            this.videoParallax = new VideoParallax(
                elements.section1, 
                [elements.video1, elements.video2]
            );
            
            this.videoLoop = new VideoLoop(
                elements.video1, 
                elements.video2
            );
            
            this.navigation = new SmoothNavigation();
            this.formHandler = new FormHandler();

            console.log('✓ Moneytime initialisé');
        } catch (error) {
            console.error('Erreur initialisation:', error);
        }
    }
}

// ============================================
// Lancement
// ============================================

const app = new App();