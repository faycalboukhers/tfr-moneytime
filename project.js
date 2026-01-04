// ============================================
// Configuration et Variables Globales
// ============================================

const CONFIG = {
    videoAutoplay: true,
    transitionDuration: 450,
    videoMovementScale: {
        x: 0.03, // 3% de mouvement horizontal
        y: 0.03  // 3% de mouvement vertical
    }
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
// Effet Parallaxe sur les Vidéos
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
        
        // Recalculer le centre lors du redimensionnement
        window.addEventListener('resize', this.debounce(() => {
            this.updateCenter();
        }, 250));
    }

    updateCenter() {
        const rect = this.container.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
    }

    setupEventListeners() {
        // Mouvement de la souris
        this.container.addEventListener('mousemove', (evt) => {
            this.handleMouseMove(evt);
        });

        // Transition temporaire lors de l'entrée de la souris
        this.container.addEventListener('mouseenter', () => {
            this.applyTemporaryTransition();
        });
    }

    handleMouseMove(evt) {
        // Obtenir la position de la souris relative au conteneur
        const rect = this.container.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;

        // Calculer le décalage par rapport au centre (en pourcentage)
        const offsetX = ((x - this.centerX) / this.centerX) * CONFIG.videoMovementScale.x * 100;
        const offsetY = ((y - this.centerY) / this.centerY) * CONFIG.videoMovementScale.y * 100;

        // Appliquer les transformations (inverser pour effet parallaxe)
        const translateX = 50 - offsetX;
        const translateY = 50 - offsetY;

        this.videos.forEach(video => {
            video.style.top = `${translateY}%`;
            video.style.left = `${translateX}%`;
        });
    }

    applyTemporaryTransition() {
        clearTimeout(this.tempTransitionTimeout);

        this.videos.forEach(video => {
            video.style.transition = `top ${CONFIG.transitionDuration}ms ease-out, left ${CONFIG.transitionDuration}ms ease-out`;
        });

        this.tempTransitionTimeout = setTimeout(() => {
            this.videos.forEach(video => {
                video.style.transition = '';
            });
        }, CONFIG.transitionDuration + 50);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// ============================================
// Gestion de la Boucle Vidéo
// ============================================

class VideoLoop {
    constructor(video1, video2) {
        this.video1 = video1;
        this.video2 = video2;
        this.currentVideo = 1;
        
        this.init();
    }

    init() {
        // Événements de fin de lecture
        this.video1.addEventListener('ended', () => this.switchToVideo(2));
        this.video2.addEventListener('ended', () => this.switchToVideo(1));

        // Démarrage automatique
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
            
            this.video2.play().catch(err => console.warn('Erreur lecture vidéo 2:', err));
            this.video1.currentTime = 0;
            this.currentVideo = 2;
        } else {
            this.video2.classList.remove('videoshowed');
            this.video2.classList.add('videohidden');
            this.video1.classList.remove('videohidden');
            this.video1.classList.add('videoshowed');
            
            this.video1.play().catch(err => console.warn('Erreur lecture vidéo 1:', err));
            this.video2.currentTime = 0;
            this.currentVideo = 1;
        }
    }

    startPlayback() {
        // Démarrer avec une promesse pour gérer les erreurs d'autoplay
        const playPromise = this.video1.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Autoplay bloqué par le navigateur:', error);
                // On pourrait afficher un bouton play ici si nécessaire
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
        // Désactiver les touches de navigation standard
        this.disableKeyboardScroll();
        
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

    disableKeyboardScroll() {
        const keysToDisable = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
        
        window.addEventListener('keydown', (e) => {
            if (keysToDisable.includes(e.key)) {
                e.preventDefault();
            }
        });
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
            // Ici vous pouvez ajouter votre logique d'envoi
            console.log('Newsletter inscription:', email);
            alert('Merci pour votre inscription ! Vous recevrez bientôt nos meilleures opportunités.');
            form.reset();
        } else {
            alert('Veuillez entrer une adresse email valide.');
        }
    }

    handleContactSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (this.validateContactForm(data)) {
            // Ici vous pouvez ajouter votre logique d'envoi
            console.log('Contact form data:', data);
            alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
            form.reset();
        } else {
            alert('Veuillez remplir tous les champs correctement.');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
// Performance Optimization
// ============================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy loading pour les images de fond des formules
        this.setupIntersectionObserver();
        
        // Précharger les assets critiques
        this.preloadCriticalAssets();
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            // Observer les cartes de formule
            document.querySelectorAll('.formula').forEach(formula => {
                observer.observe(formula);
            });
        }
    }

    preloadCriticalAssets() {
        // Cette fonction peut être étendue pour précharger des images critiques
        const criticalImages = [
            'assets/formule1.jpg',
            'assets/formule2.jpg',
            'assets/formule3.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
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
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            // Initialiser les différents modules
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
            this.performanceOptimizer = new PerformanceOptimizer();

            console.log('✓ Application Moneytime initialisée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }
}

// ============================================
// Lancement de l'Application
// ============================================

const app = new App();