// UI Effects and Animations

// Enhanced portal entry functionality
function handleEnterButtonClick() {
    if (!enterBtn || !landingScreen || !homePage) return;
    
    // Create enhanced portal effect
    createEnhancedPortalEffect();
    
    // Animate landing screen out
    if (typeof gsap !== 'undefined') {
        gsap.timeline()
            .to(landingScreen, {
                scale: 1.1,
                opacity: 0,
                duration: 1.5,
                ease: "power2.inOut"
            })
            .set(landingScreen, { display: 'none' })
            .set(homePage, { display: 'block', opacity: 0 })
            .to(homePage, {
                opacity: 1,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    // Initialize pinpoint interactions after transition
                    initializePinpointInteractions();
                }
            });
    } else {
        landingScreen.style.display = 'none';
        homePage.style.display = 'block';
        initializePinpointInteractions();
    }
}

// Enhanced magical particles
function createMagicalParticles() {
    const particles = document.querySelectorAll('.magic-particle');
    particles.forEach((particle, index) => {
        if (typeof gsap !== 'undefined') {
            gsap.set(particle, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
            });
            
            gsap.to(particle, {
                x: `+=${Math.random() * 200 - 100}`,
                y: `+=${Math.random() * 200 - 100}`,
                rotation: 360,
                duration: Math.random() * 10 + 5,
                repeat: -1,
                yoyo: true,
                ease: "none"
            });
        }
    });
}

// Enhanced magical sparkles
function createMagicalSparkles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 4px;
            height: 4px;
            background: ${['#FFD700', '#F8F8FF', '#9966CC'][Math.floor(Math.random() * 3)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 8px currentColor;
        `;
        
        document.body.appendChild(sparkle);
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(sparkle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                scale: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => sparkle.remove()
            });
        }
    }
}

// Create pinpoint burst effect
function createPinpointBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const burst = document.createElement('div');
        burst.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 2px;
            height: 2px;
            background: #FFD700;
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
        `;
        
        document.body.appendChild(burst);
        
        const angle = (i / 12) * Math.PI * 2;
        const distance = 30;
        
        if (typeof gsap !== 'undefined') {
            gsap.to(burst, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => burst.remove()
            });
        }
    }
}

// Create level transition effect
function createLevelTransitionEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, transparent 0%, rgba(138, 43, 226, 0.3) 100%);
        pointer-events: none;
        z-index: 998;
    `;
    
    document.body.appendChild(effect);
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(effect, 
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.5,
                onComplete: () => {
                    gsap.to(effect, {
                        opacity: 0,
                        duration: 0.5,
                        delay: 0.3,
                        onComplete: () => effect.remove()
                    });
                }
            }
        );
    }
}

// Enhanced portal effect
function createEnhancedPortalEffect() {
    if (!portalContainer) return;
    
    const portal = document.createElement('div');
    portal.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border: 3px solid #9966CC;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 50px #9966CC, inset 0 0 50px #9966CC;
    `;
    
    portalContainer.appendChild(portal);
    
    if (typeof gsap !== 'undefined') {
        gsap.to(portal, {
            scale: 20,
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => portal.remove()
        });
    }
}

// Placeholder functions for compatibility
function createSparkleEffect(element) {
    createMagicalSparkles(element);
}

function createMagicalSpawnEffect(element) {
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(element, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

// Theme functions
function applyLunasKingdomTheme() {
    document.body.classList.add('lunas-kingdom-theme');
}

function removeTheme() {
    document.body.classList.remove('lunas-kingdom-theme');
}