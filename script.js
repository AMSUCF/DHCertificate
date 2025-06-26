// Tron-style interactive canvas animation
class TronCanvas {
    constructor() {
        this.canvas = document.getElementById('tron-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.lines = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.createLines();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                glowIntensity: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    createLines() {
        const lineCount = 8;
        
        for (let i = 0; i < lineCount; i++) {
            this.lines.push({
                startX: Math.random() * this.canvas.width,
                startY: Math.random() * this.canvas.height,
                endX: Math.random() * this.canvas.width,
                endY: Math.random() * this.canvas.height,
                progress: 0,
                speed: Math.random() * 0.005 + 0.002,
                opacity: Math.random() * 0.3 + 0.1,
                width: Math.random() * 2 + 1
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.lines = [];
            this.createParticles();
            this.createLines();
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Touch support
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });
    }
    
    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
        );
        
        gradient.addColorStop(0, `rgba(255, 201, 4, ${particle.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 201, 4, 0)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core particle
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 201, 4, ${particle.opacity * 2})`;
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawLine(line) {
        const currentX = line.startX + (line.endX - line.startX) * line.progress;
        const currentY = line.startY + (line.endY - line.startY) * line.progress;
        
        const gradient = this.ctx.createLinearGradient(
            line.startX, line.startY, currentX, currentY
        );
        
        gradient.addColorStop(0, 'rgba(255, 201, 4, 0)');
        gradient.addColorStop(0.5, `rgba(255, 201, 4, ${line.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 201, 4, 0)');
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = line.width;
        this.ctx.moveTo(line.startX, line.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        // Glow effect
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(255, 201, 4, ${line.opacity * 0.3})`;
        this.ctx.lineWidth = line.width * 3;
        this.ctx.moveTo(line.startX, line.startY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
    }
    
    drawMouseInteraction() {
        const maxDistance = 150;
        
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.5;
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(255, 201, 4, ${opacity})`;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
                
                // Glow effect for connection
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(255, 201, 4, ${opacity * 0.3})`;
                this.ctx.lineWidth = 3;
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x <= 0 || particle.x >= this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y <= 0 || particle.y >= this.canvas.height) {
                particle.vy *= -1;
            }
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Slight opacity variation for organic feel
            particle.opacity += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
            particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
        });
    }
    
    updateLines() {
        this.lines.forEach(line => {
            line.progress += line.speed;
            
            if (line.progress >= 1) {
                line.progress = 0;
                line.startX = Math.random() * this.canvas.width;
                line.startY = Math.random() * this.canvas.height;
                line.endX = Math.random() * this.canvas.width;
                line.endY = Math.random() * this.canvas.height;
                line.opacity = Math.random() * 0.3 + 0.1;
            }
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.updateParticles();
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Update and draw lines
        this.updateLines();
        this.lines.forEach(line => this.drawLine(line));
        
        // Draw mouse interactions
        this.drawMouseInteraction();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Smooth scrolling functionality
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Intersection Observer for animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all content cards and sections
    const elementsToAnimate = document.querySelectorAll(
        '.content-card, .outcome-item, .prerequisite-card, .course-card, .section-header'
    );
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Parallax effect for hero section
function setupParallax() {
    const hero = document.querySelector('.hero-section');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Dynamic text glow effect
function setupTextGlow() {
    const glowElements = document.querySelectorAll('.hero-title h1, .section-title');
    
    glowElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.textShadow = '0 0 30px #FFC904, 0 0 60px rgba(255, 201, 4, 0.8), 0 0 90px rgba(255, 201, 4, 0.6)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.textShadow = '';
        });
    });
}

// Course card hover effects
function setupCourseCardEffects() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add pulse effect to course code
            const courseCode = card.querySelector('.course-code');
            if (courseCode) {
                courseCode.style.animation = 'pulse 0.5s ease-in-out';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const courseCode = card.querySelector('.course-code');
            if (courseCode) {
                courseCode.style.animation = '';
            }
        });
    });
}

// Add pulse animation to CSS dynamically
function addPulseAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes animate-in {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-in {
            animation: animate-in 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}

// Loading screen
function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <div class="loading-logo">
                <div class="loading-text">DIGITAL HUMANITIES</div>
                <div class="loading-subtext">INITIALIZING...</div>
            </div>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
        </div>
    `;
    
    const loadingStyles = `
        #loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.5s ease-out;
        }
        
        .loading-content {
            text-align: center;
        }
        
        .loading-text {
            font-family: 'Orbitron', monospace;
            font-size: 2rem;
            font-weight: 700;
            color: #FFC904;
            text-shadow: 0 0 20px #FFC904;
            margin-bottom: 1rem;
            letter-spacing: 0.2em;
        }
        
        .loading-subtext {
            font-family: 'Exo 2', sans-serif;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            margin-bottom: 2rem;
            letter-spacing: 0.1em;
        }
        
        .loading-bar {
            width: 300px;
            height: 2px;
            background: rgba(255, 201, 4, 0.2);
            margin: 0 auto;
            overflow: hidden;
        }
        
        .loading-progress {
            height: 100%;
            background: linear-gradient(90deg, transparent, #FFC904, transparent);
            width: 100px;
            animation: loading 2s ease-in-out infinite;
        }
        
        @keyframes loading {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(300px); }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = loadingStyles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(loadingScreen);
    
    return loadingScreen;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create loading screen
    const loadingScreen = createLoadingScreen();
    
    // Initialize components after a delay
    setTimeout(() => {
        // Remove loading screen
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
        
        // Initialize Tron canvas
        const tronCanvas = new TronCanvas();
        
        // Setup other features
        addPulseAnimation();
        setupScrollAnimations();
        setupParallax();
        setupTextGlow();
        setupCourseCardEffects();
        
        // Add scroll-based opacity changes
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroHeight = window.innerHeight;
            const opacity = Math.max(0, 1 - (scrolled / heroHeight) * 1.5);
            
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = opacity;
            }
        });
        
    }, 2000);
});

// Handle window resize for canvas
window.addEventListener('resize', () => {
    // Canvas resize is handled in the TronCanvas class
});

// Add click handlers for CTA buttons
document.addEventListener('DOMContentLoaded', () => {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = button.querySelector('span').textContent;
            
            if (buttonText === 'EXPLORE PROGRAM') {
                scrollToSection('about');
            } else if (buttonText === 'APPLY NOW') {
                // UCF Graduate Admissions
                window.open('https://graduate.ucf.edu/applying-to-ucf/', '_blank');
            } else if (buttonText === 'LEARN MORE') {
                // Replace with actual program information URL
                window.open('https://www.ucf.edu/academics/', '_blank');
            }
        });
    });
});
