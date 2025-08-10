// ===================================================================
// CONSTANTS AND CONFIGURATION
// ===================================================================

const ORIGINAL_PINPOINTS = [
    {
        classes: 'pinpoint socials',
        dataset: { realm: 'socials', label: 'Socials' },
        style: { top: '20%', left: '70%' },
        icon: 'fi-ss-share',
        label: 'Socials'
    },
    {
        classes: 'pinpoint shop',
        dataset: { realm: 'shop', label: 'Shop' },
        style: { top: '60%', left: '82%' },
        icon: 'fi-ss-shopping-bag',
        label: 'Shop'
    },
    {
        classes: 'pinpoint cendrial',
        dataset: { label: 'Cendrial' },
        style: { top: '37%', left: '37%' },
        icon: 'fi-ss-crystal-ball',
        label: 'Cendrial'
    },
    {
        classes: 'pinpoint queensrealm',
        dataset: { realm: 'queensrealm', label: 'Queensrealm' },
        style: { top: '30%', left: '58%' },
        icon: 'fi-ss-crown',
        label: 'Queensrealm'
    },
    {
        classes: 'pinpoint dragonrealm',
        dataset: { realm: 'dragonrealm', label: 'Dragonrealm' },
        style: { top: '75%', left: '20%' },
        icon: 'fi-ss-dragon',
        label: 'Dragonrealm'
    },
    {
        classes: 'pinpoint author',
        dataset: { realm: 'author', label: 'R.K. Osborn' },
        style: { top: '15%', left: '15%' },
        icon: 'fi-ss-quill-pen-story',
        label: 'R.K. Osborn'
    },
    {
        classes: 'pinpoint news',
        dataset: { realm: 'news', label: 'News' },
        style: { top: '58%', left: '60%' },
        icon: 'fi-ss-newspaper',
        label: 'News'
    }
];

// Global variables
let currentLevel = 'main';
let navigationHistory = ['Home'];
let currentPanzoomInstance = null;
let panzoomInstance = null;
let isTransitioning = false;
const isDesktop = window.innerWidth > 768;
const ZOOM_STEP = 0.2;
const PAN_STEP = 50;

// DOM elements
const enterBtn = document.getElementById('enter-btn');
const landingScreen = document.getElementById('landing-screen');
const homePage = document.getElementById('home-page');
const portalContainer = document.getElementById('portal-container');
const burstContainer = document.querySelector('.burst-container');

// ===================================================================
// INITIALIZATION AND EVENT LISTENERS
// ===================================================================

// Initialize application
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

function initializeApp() {
    createMagicalParticles();
    initializeMap();
    initializeEventListeners();
    
    if (!portalContainer) {
        initializePinpointInteractions();
    }
}

// Consolidated event listener initialization
function initializeEventListeners() {
    if (enterBtn) {
        enterBtn.addEventListener('click', handleEnterButtonClick);
    }
    
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.map-container')) {
            e.preventDefault();
        }
    });
    
    initializeMobileControls();
}

function initializeMobileControls() {
    const controls = {
        zoomIn: document.getElementById('zoom-in'),
        zoomOut: document.getElementById('zoom-out'),
        panUp: document.getElementById('pan-up'),
        panDown: document.getElementById('pan-down'),
        panLeft: document.getElementById('pan-left'),
        panRight: document.getElementById('pan-right'),
        resetBtn: document.getElementById('reset-btn'),
        toggleBreadcrumb: document.getElementById('toggle-breadcrumb'),
        toggleReturn: document.getElementById('toggle-return')
    };

    if (controls.zoomIn && controls.zoomOut && controls.panUp && controls.panDown && controls.panLeft && controls.panRight) {
        controls.zoomIn.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 1 + ZOOM_STEP);
            }
        });
        
        controls.zoomOut.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 1 - ZOOM_STEP);
            }
        });
        
        controls.panUp.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.moveBy(0, PAN_STEP);
                clampPan();
            }
        });
        
        controls.panDown.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.moveBy(0, -PAN_STEP);
                clampPan();
            }
        });
        
        controls.panLeft.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.moveBy(PAN_STEP, 0);
                clampPan();
            }
        });
        
        controls.panRight.addEventListener('click', () => {
            if (panzoomInstance) {
                panzoomInstance.moveBy(-PAN_STEP, 0);
                clampPan();
            }
        });
        
        if (controls.resetBtn) {
            controls.resetBtn.addEventListener('click', () => {
                if (panzoomInstance) {
                    panzoomInstance.reset();
                }
            });
        }
        
        // Add event listeners for toggle buttons
        if (controls.toggleBreadcrumb) {
            controls.toggleBreadcrumb.addEventListener('click', () => {
                const breadcrumb = document.getElementById('breadcrumb-nav');
                if (breadcrumb) {
                    breadcrumb.classList.toggle('visible');
                    controls.toggleBreadcrumb.classList.toggle('active');
                }
            });
        }
        
        if (controls.toggleReturn) {
            controls.toggleReturn.addEventListener('click', () => {
                const returnBtn = document.getElementById('return-main-btn');
                if (returnBtn) {
                    returnBtn.classList.toggle('visible');
                    controls.toggleReturn.classList.toggle('active');
                }
            });
        }
    }
}

// ===================================================================
// MAP LOGIC AND NAVIGATION
// ===================================================================

function initializeMap() { 
    const mapContainer = document.getElementById('map-container'); 
    const mapWrapper = document.getElementById('map-wrapper'); 
    const isDesktop = window.innerWidth > 768; 

    if (!mapContainer || !mapWrapper) return; 

    const imageWidth = 2560; 
    const imageHeight = 1440; 
    let panzoomInstance; 

    function clampPan() { 
        const transform = panzoomInstance.getTransform(); 
        const zoom = transform.scale; 
        const minX = window.innerWidth - imageWidth * zoom; 
        // Disable vertical movement by setting Y to 0
        const clampedX = Math.min(0, Math.max(minX, transform.x)); 
        const clampedY = 0; // Force Y position to always be 0
        panzoomInstance.moveTo(clampedX, clampedY); 
    } 

    if (!isDesktop) { 
        panzoomInstance = panzoom(mapWrapper, { 
            maxZoom: 3, 
            minZoom: Math.max(window.innerWidth / imageWidth, window.innerHeight / imageHeight), 
            initialZoom: 1, 
            smoothScroll: false, 
            bounds: true, 
            boundsPadding: 0, 
            contain: 'inside',
            // Filter out vertical movement
            filterKey: function(e, dx, dy, dz) {
                // Only allow horizontal movement (dx), block vertical movement (dy)
                return !dy;
            }
        }); 

        panzoomInstance.on('transform', clampPan); 

        // Touch drag support - modified to only allow horizontal movement
        let isDragging = false; 
        let startX, startY; 

        mapContainer.addEventListener('touchstart', (e) => { 
            if (e.touches.length === 1) { 
                isDragging = true; 
                startX = e.touches[0].clientX; 
                startY = e.touches[0].clientY; 
            } 
        }); 

        mapContainer.addEventListener('touchmove', (e) => { 
            if (isDragging && e.touches.length === 1) { 
                const deltaX = e.touches[0].clientX - startX; 
                // Remove deltaY to disable vertical movement
                const deltaY = 0; // Disable vertical movement
                panzoomInstance.moveBy(deltaX, deltaY, false); 
                clampPan(); 
                startX = e.touches[0].clientX; 
                // Don't update startY since we're not using vertical movement
            } 
        }); 

        mapContainer.addEventListener('touchend', () => { 
            isDragging = false; 
        }); 

        // Mobile button controls - remove vertical pan buttons
        const ZOOM_STEP = 0.2; 
        const PAN_STEP = 100; 
        const controls = { 
            zoomIn: document.getElementById('zoom-in'), 
            zoomOut: document.getElementById('zoom-out'), 
            // Remove panUp and panDown from controls
            panLeft: document.getElementById('pan-left'), 
            panRight: document.getElementById('pan-right'), 
        }; 

        if (controls.zoomIn && controls.zoomOut && controls.panLeft && controls.panRight) { 
            controls.zoomIn.addEventListener('click', () => { 
                panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 1 + ZOOM_STEP); 
            }); 
            controls.zoomOut.addEventListener('click', () => { 
                panzoomInstance.smoothZoom(window.innerWidth / 2, window.innerHeight / 2, 1 - ZOOM_STEP); 
            }); 
            // Remove vertical pan button event listeners
            controls.panLeft.addEventListener('click', () => { 
                panzoomInstance.moveBy(PAN_STEP, 0); 
                clampPan(); 
            }); 
            controls.panRight.addEventListener('click', () => { 
                panzoomInstance.moveBy(-PAN_STEP, 0); 
                clampPan(); 
            }); 
        } 
    } 

    // Legacy pinpoint interaction 
    const pinpoints = document.querySelectorAll('.pinpoint'); 
    pinpoints.forEach(pin => { 
        pin.addEventListener('click', () => { 
            const label = pin.dataset.label; 
            createSparkleEffect(pin); 
            console.log(`Navigating to: ${label}`); 
        }); 

        pin.addEventListener('mouseenter', () => { 
            if (typeof gsap !== 'undefined') { 
                gsap.to(pin, { scale: 1.2, duration: 0.3, ease: "back.out(1.7)" }); 
            } 
        }); 

        pin.addEventListener('mouseleave', () => { 
            if (typeof gsap !== 'undefined') { 
                gsap.to(pin, { scale: 1, duration: 0.3, ease: "back.out(1.7)" }); 
            } 
        }); 
    }); 
}

function clampPan() {
    if (!panzoomInstance) return;
    
    const transform = panzoomInstance.getTransform();
    const mapWrapper = document.getElementById('map-wrapper');
    const container = document.getElementById('map-container');
    
    if (!mapWrapper || !container) return;
    
    const mapRect = mapWrapper.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    let { x, y, scale } = transform;
    
    const maxX = (mapRect.width * scale - containerRect.width) / 2;
    const maxY = (mapRect.height * scale - containerRect.height) / 2;
    
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    
    panzoomInstance.moveTo(x, y);
}

// Single reusable function for restoring original pinpoints
function restoreOriginalPinpoints() {
    const mapWrapper = document.getElementById('map-wrapper');
    if (!mapWrapper) return;
    
    ORIGINAL_PINPOINTS.forEach((data, index) => {
        setTimeout(() => {
            const pinpoint = document.createElement('div');
            pinpoint.className = data.classes;
            
            Object.keys(data.dataset).forEach(key => {
                pinpoint.dataset[key] = data.dataset[key];
            });
            
            pinpoint.style.top = data.style.top;
            pinpoint.style.left = data.style.left;
            
            pinpoint.innerHTML = `
                <div class="pin-glow"></div>
                <div class="pin-icon"><i class="fi ${data.icon}"></i></div>
                <div class="pin-label">${data.label}</div>
            `;
            
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 150);
    });
    
    setTimeout(() => {
        initializePinpointInteractions();
    }, ORIGINAL_PINPOINTS.length * 150 + 500);
}

function clearCurrentPinpoints() {
    const pinpoints = document.querySelectorAll('.pinpoint');
    pinpoints.forEach(pin => pin.remove());
}

function createMainMapPinpoints() {
    restoreOriginalPinpoints();
}

// Enhanced transition to second level with mobile responsiveness
function transitionToSecondLevel(realm, label) {
    if (isTransitioning) return;
    isTransitioning = true;

    const mapWrapper = document.getElementById('map-wrapper');
    const mapImage = document.querySelector('#map-wrapper img');

    const isModalOnlyRealm = ['socials', 'author', 'news', 'dragonrealm', 'shop'];

    if (!isModalOnlyRealm.includes(realm)) {
        navigationHistory.push(label);
    }

    currentLevel = 'second';
    createLevelTransitionEffect();
    
    const isMobile = window.innerWidth <= 768;
    const scaleValue = isMobile ? 1.8 : 2.5;
    const xOffset = isMobile ? -150 : -300;
    const yOffset = isMobile ? 150 : 300;
    const duration = isMobile ? 1.2 : 1.5;
    
    if (typeof gsap !== 'undefined') {
        if (realm === 'queensrealm') {
            gsap.timeline()
                .to(mapWrapper, {
                    scale: scaleValue,
                    x: xOffset,
                    y: yOffset,
                    duration: duration,
                    ease: "power2.inOut"
                })
                .call(() => {
                    clearCurrentPinpoints();
                })
                .to(mapWrapper, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Show loading effect
                    showLoadingEffect();
                    
                    // Preload the image
                    const img = new Image();
                    img.onload = () => {
                        // Hide loading effect and switch to Cendrial
                        hideLoadingEffect();
                        mapImage.src = 'assets/Cendrial.png';
                        if (realm === 'queensrealm') {
                            createSecondLevelPinpoints('cendrial');
                        } else {
                            createSecondLevelPinpoints(realm);
                        }
                        showReturnButton();
                        updateBreadcrumb();
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        
                        // Fade in the new map
                        gsap.to(mapWrapper, {
                            opacity: 1,
                            duration: 0.8,
                            ease: "bounce.out",
                            onComplete: () => {
                                // Reset transition flag when complete
                                isTransitioning = false;
                            }
                        });
                    };
                    img.src = 'assets/Cendrial.png';
                });
        } else if (realm === 'socials' || realm === 'author' || realm === 'news' || realm === 'dragonrealm' || realm === 'shop') {
            // Special handling for socials, author, news, dragonrealm, and shop - don't change the map
            handleOtherRealmTransition(realm, mapImage);
            // Reset transition flag when complete
            isTransitioning = false;
        } else {
            gsap.timeline()
                .to(mapWrapper, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .call(() => {
                    handleOtherRealmTransition(realm, mapImage);
                    clearCurrentPinpoints();
                    createSecondLevelPinpoints(realm);
                    showReturnButton();
                    updateBreadcrumb();
                })
                .to(mapWrapper, {
                    scale: 1,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Reset transition flag when complete
                        isTransitioning = false;
                    }
                });
        }
    } else {
        // Fallback without GSAP - reset flag immediately
        isTransitioning = false;
    }
}

function handleOtherRealmTransition(realm, mapImage) {
    switch(realm) {
        case 'dragonrealm':
            // Create Dragonrealm modal
            createDragonrealmModal();
            break;
        case 'socials':
            // Create a social media popup
            createSocialMediaPopup();
            break;
        case 'author':
            // Create author info popup
            createAuthorModal();
            break;
        case 'news':
            // Create news modal
            createNewsModal();
            break;
        case 'cendrial':
            // Create Cendrial modal
            createCendrialModal();
            break;
        case 'shop':
            // Redirect to shop page
            window.location.href = 'shop.html';
            break;
        default:
            // Keep main map for other realms
            break;
    }
}

function createSocialMediaPopup() {
    // Remove existing modal if any
    const existingModal = document.getElementById('socials-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'socials-modal';
    modal.className = 'placeholder-modal';
    
    // Create modal content with Font Awesome icons
    modal.innerHTML = `
        <div class="modal-content socials-modal-content">
            <div class="modal-header">
                <h2>SOCIALS</h2>
                <button class="close-modal" onclick="document.getElementById('socials-modal').remove()">&times;</button>
            </div>
            <div class="social-icons-container">
                <a href="https://www.instagram.com/crescentshire/" target="_blank" class="social-icon-link">
                    <div class="social-icon instagram">
                        <i class="fab fa-instagram"></i>
                    </div>
                    <span>@crescentshire</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61558488253523&ref=pl_edit_xav_ig_profile_page_web#" target="_blank" class="social-icon-link">
                    <div class="social-icon facebook">
                        <i class="fab fa-facebook-f"></i>
                    </div>
                    <span>Crescentshire Publishing Co.</span>
                </a>
                <a href="#" class="social-icon-link">
                    <div class="social-icon youtube">
                        <i class="fab fa-youtube"></i>
                    </div>
                    <span>Crescentshire Publishing Co.</span>
                </a>
                <a href="#" class="social-icon-link">
                    <div class="social-icon tiktok">
                        <i class="fab fa-tiktok"></i>
                    </div>
                    <span>@crescentshire</span>
                </a>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add click event to close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
        
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function returnToMainMap() {
    const mapImage = document.querySelector('#map-wrapper img');
    const mapWrapper = document.getElementById('map-wrapper');
    
    createLevelTransitionEffect();
    
    if (typeof gsap !== 'undefined') {
        gsap.timeline()
            .to(mapWrapper, {
                scale: 0.8,
                opacity: 0,
                duration: 1,
                ease: "power2.inOut"
            })
            .call(() => {
                mapImage.src = 'assets/home-map (1).png';
                removeTheme();
                clearCurrentPinpoints();
                restoreOriginalPinpoints();
                navigationHistory = ['Home'];
                currentLevel = 'main';
                updateBreadcrumb();
                hideReturnButton();
                
                if (currentPanzoomInstance) {
                    currentPanzoomInstance.reset();
                }
            })
            .to(mapWrapper, {
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "power2.inOut"
            });
    }
}

// Navigation and breadcrumb functions
function updateBreadcrumb() {
    let breadcrumb = document.getElementById('breadcrumb-nav');
    
    if (!breadcrumb) {
        breadcrumb = document.createElement('div');
        breadcrumb.id = 'breadcrumb-nav';
        breadcrumb.className = 'breadcrumb-navigation';
        document.body.appendChild(breadcrumb);
        
        // Check if we should show it on mobile
        const isDesktop = window.innerWidth > 768;
        const toggleBreadcrumb = document.getElementById('toggle-breadcrumb');
        if (!isDesktop && toggleBreadcrumb && !toggleBreadcrumb.classList.contains('active')) {
            breadcrumb.classList.remove('visible');
        } else if (!isDesktop) {
            breadcrumb.classList.add('visible');
        }
    }
    
    breadcrumb.innerHTML = navigationHistory.map((item, index) => {
        const isLast = index === navigationHistory.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : 'clickable'}" 
                  data-level="${index}">${item}</span>
        `;
    }).join(' > ');
    
    const clickableItems = breadcrumb.querySelectorAll('.breadcrumb-item.clickable');
    clickableItems.forEach(item => {
        item.addEventListener('click', () => {
            const level = parseInt(item.dataset.level);
            navigateToLevel(level);
        });
    });
}

function navigateToLevel(level) {
    if (level === 0) {
        returnToMainMap();
    } else if (level === 1) {
        // Navigate back to second level (Queensrealm)
        navigateToSecondLevel();
    }
}

// Add this new function to handle navigation back to second level
function navigateToSecondLevel() {
    const mapWrapper = document.getElementById('map-wrapper');
    const mapImage = document.querySelector('#map-wrapper img');
    
    // Reset navigation history to second level
    navigationHistory = ['Home', 'Queensrealm'];
    currentLevel = 'second';
    
    // Remove current theme and pinpoints
    removeTheme();
    clearCurrentPinpoints();
    
    createLevelTransitionEffect();
    
    if (typeof gsap !== 'undefined') {
        gsap.timeline()
            .to(mapWrapper, {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            })
            .call(() => {
                // Switch to Cendrial map (second level map for Queensrealm)
                mapImage.src = 'assets/Cendrial.png';
                document.getElementById('map-wrapper').classList.add('cendrial-map');
                // Create second level pinpoints for queensrealm
                createSecondLevelPinpoints('cendrial');
                
                // Update navigation
                updateBreadcrumb();
                showReturnButton();
                
                // Reset map transform
                gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
            })
            .to(mapWrapper, {
                scale: 1,
                opacity: 1,
                duration: 0.8,
                ease: "power2.inOut"
            });
    } else {
        // Fallback without GSAP
        mapImage.src = 'assets/Cendrial.png';
        clearCurrentPinpoints();
        createSecondLevelPinpoints('cendrial');
        updateBreadcrumb();
        showReturnButton();
    }
}

function showReturnButton() {
    let returnBtn = document.getElementById('return-main-btn');
    
    if (!returnBtn) {
        returnBtn = document.createElement('button');
        returnBtn.id = 'return-main-btn';
        returnBtn.className = 'return-button';
        returnBtn.innerHTML = '<i class="fi fi-ss-arrow-left"></i> Return to Main Map';
        document.body.appendChild(returnBtn);
        
        returnBtn.addEventListener('click', returnToMainMap);
        
        // Check if we should show it on mobile
        const isDesktop = window.innerWidth > 768;
        const toggleReturn = document.getElementById('toggle-return');
        if (!isDesktop && toggleReturn && !toggleReturn.classList.contains('active')) {
            returnBtn.classList.remove('visible');
        } else if (!isDesktop) {
            returnBtn.classList.add('visible');
        }
    }
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(returnBtn, 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function hideReturnButton() {
    const returnBtn = document.getElementById('return-main-btn');
    const breadcrumb = document.getElementById('breadcrumb-nav');
    
    if (returnBtn) {
        if (typeof gsap !== 'undefined') {
            gsap.to(returnBtn, {
                opacity: 0,
                y: 50,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => returnBtn.remove()
            });
        } else {
            returnBtn.remove();
        }
    }
    
    if (breadcrumb) {
        if (typeof gsap !== 'undefined') {
            gsap.to(breadcrumb, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => breadcrumb.remove()
            });
        } else {
            breadcrumb.remove();
        }
    }
}

// ===================================================================
// PINPOINT INTERACTIONS
// ===================================================================

function initializePinpointInteractions() {
    const pinpoints = document.querySelectorAll('.pinpoint');
    
    pinpoints.forEach(pin => {
        pin.replaceWith(pin.cloneNode(true));
    });
    
    const freshPinpoints = document.querySelectorAll('.pinpoint');
    
    freshPinpoints.forEach(pin => {
        // Add touch event support for mobile
        let touchStartTime = 0;
        let touchMoved = false;
        
        // Touch events for mobile
        pin.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
            e.stopPropagation(); // Prevent map panning
        });
        
        pin.addEventListener('touchmove', (e) => {
            touchMoved = true;
            e.stopPropagation(); // Prevent map panning
        });
        
        pin.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only trigger if it was a quick tap (not a long press or drag)
            const touchDuration = Date.now() - touchStartTime;
            if (!touchMoved && touchDuration < 500) {
                const realm = pin.dataset.realm;
                const label = pin.dataset.label;
                
                createMagicalSparkles(pin);
                createPinpointBurst(pin);
                
                handleMainLevelClick(pin, realm, label);
            }
        });
        
        // Keep click event for desktop
        pin.addEventListener('click', (e) => {
            e.preventDefault();
            
            const realm = pin.dataset.realm;
            const label = pin.dataset.label;
            
            createMagicalSparkles(pin);
            createPinpointBurst(pin);
            
            handleMainLevelClick(pin, realm, label);
        });
        
        // Mouse events for desktop hover effects
        pin.addEventListener('mouseenter', () => {
            createMagicalSparkles(pin);
            if (typeof gsap !== 'undefined') {
                gsap.to(pin, { scale: 1.2, duration: 0.3, ease: "back.out(1.7)" });
            }
        });
        
        pin.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(pin, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
            }
        });
    });
}

function handleMainLevelClick(pin, realm, label) {
    // Prevent clicks during transition
    if (isTransitioning) {
        return;
    }
    
    switch(realm) {
        case 'queensrealm':
            transitionToSecondLevel('queensrealm', label);
            break;
        case 'cendrial':
            transitionToThirdLevel('cendrial');
            break;
        case 'dragonrealm':
            transitionToSecondLevel('dragonrealm', label);
            break;
        case 'socials':
            transitionToSecondLevel('socials', label);
            break;
        case 'shop':
            transitionToSecondLevel('shop', label);
            break;
        case 'author':
            transitionToSecondLevel('author', label);
            break;
        case 'news':
            transitionToSecondLevel('news', label);
            break;
        default:
            handleSubLevelClick(pin, realm, label);
    }
}

function createSecondLevelPinpoints(realm) {
    const data = getSecondLevelData(realm);
    const mapWrapper = document.getElementById('map-wrapper');
    
    data.forEach((pinData, index) => {
        setTimeout(() => {
            const pinpoint = createPinpointElement(pinData);
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 150);
    });
    
    setTimeout(() => {
        initializeDetailedPinpointInteractions();
    }, data.length * 150 + 500);
}

function createPinpointElement(data) {
    const pinpoint = document.createElement('div');
    pinpoint.className = `pinpoint ${data.realm}`;
    pinpoint.dataset.realm = data.realm;
    pinpoint.dataset.label = data.label;
    
    if (data.url) pinpoint.dataset.url = data.url;
    
    pinpoint.style.top = data.position.top;
    pinpoint.style.left = data.position.left;
    
    // Check if custom image is provided, otherwise use icon
    let iconContent;
    if (data.customImage) {
        iconContent = `<img src="${data.customImage}" alt="${data.label}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">`;  
    } else {
        const iconClass = getIconClass(data.realm);
        iconContent = `<i class="fi ${iconClass}"></i>`;
    }
    
    pinpoint.innerHTML = `
        <div class="pin-glow"></div>
        <div class="pin-icon">${iconContent}</div>
        <div class="pin-label">${data.label}</div>
    `;
    
    return pinpoint;
}

function transitionToThirdLevel(realm) {
    if (realm === 'lunas-kingdom') {
        const mapWrapper = document.getElementById('map-wrapper');
        const mapImage = document.querySelector('#map-wrapper img');
        
        navigationHistory.push('Lunas Kingdom');
        currentLevel = 'third';
        
        createLevelTransitionEffect();
        
        if (typeof gsap !== 'undefined') {
            gsap.timeline()
                .to(mapWrapper, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Clear current pinpoints first
                    clearCurrentPinpoints();
                    
                    // Show loading effect with Lunas Kingdom theme
                    showLunasKingdomLoadingEffect();
                    
                    // Preload Lunas Kingdom image
                    const img = new Image();
                    img.onload = () => {
                        // Hide loading effect and switch to Lunas Kingdom
                        hideLunasKingdomLoadingEffect();
                        
                        // Apply Lunas Kingdom theme
                        applyLunasKingdomTheme();
                        
                        // Switch to Lunas Kingdom map
                        mapImage.src = 'assets/Lunas Kingdom.png';
                        
                        // Create Lunas Kingdom regions
                        createLunasKingdomRegions();
                        
                        // Update navigation
                        updateBreadcrumb();
                        showReturnButton();
                        
                        // Reset map transform and fade in
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.onerror = () => {
                        console.error('Failed to load Lunas Kingdom map');
                        hideLunasKingdomLoadingEffect();
                        // Fallback: continue without image change
                        applyLunasKingdomTheme();
                        createLunasKingdomRegions();
                        updateBreadcrumb();
                        showReturnButton();
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.src = 'assets/Lunas Kingdom.png';
                });
        }
    } else if (realm === 'cendrial') {
        // Create Cendrial modal instead of transitioning to a new map
        createCendrialModal();
        // Reset transition flag
        isTransitioning = false;
    } else if (realm === 'silmaas-empire') {
        const mapWrapper = document.getElementById('map-wrapper');
        const mapImage = document.querySelector('#map-wrapper img');
        
        navigationHistory.push('Sil\'maas Empire');
        currentLevel = 'third';
        
        createLevelTransitionEffect();
        
        if (typeof gsap !== 'undefined') {
            gsap.timeline()
                .to(mapWrapper, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Clear current pinpoints first
                    clearCurrentPinpoints();
                    
                    // Show loading effect with Sil'maas Empire theme
                    showSilmaasEmpireLoadingEffect();
                    
                    // Preload Sil'maas Empire image (using same image as Lunas Kingdom for now)
                    const img = new Image();
                    img.onload = () => {
                        // Hide loading effect and switch to Sil'maas Empire
                        hideSilmaasEmpireLoadingEffect();
                        
                        // Apply Sil'maas Empire theme
                        applySilmaasEmpireTheme();
                        
                        // Switch to Sil'maas Empire map (using same image as Lunas Kingdom)
                        mapImage.src = 'assets/Silmaas Empire.png';

                        
                        // Create Sil'maas Empire regions
                        createSilmaasEmpireRegions();
                        
                        // Update navigation
                        updateBreadcrumb();
                        showReturnButton();
                        
                        // Reset map transform and fade in
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.onerror = () => {
                        console.error('Failed to load Silmaas Empire map');
                        hideSilmaasEmpireLoadingEffect();
                        // Fallback: continue without image change
                        applySilmaasEmpireTheme();
                        createSilmaasEmpireRegions();
                        updateBreadcrumb();
                        showReturnButton();
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.src = 'assets/Silmaas Empire.png';

                });
        }
    } else if (realm === 'southern-isles') {
        const mapWrapper = document.getElementById('map-wrapper');
        const mapImage = document.querySelector('#map-wrapper img');
        
        navigationHistory.push('Southern Isles');
        currentLevel = 'third';
        
        createLevelTransitionEffect();
        
        if (typeof gsap !== 'undefined') {
            gsap.timeline()
                .to(mapWrapper, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Clear current pinpoints first
                    clearCurrentPinpoints();
                    
                    // Show loading effect with Southern Isles theme
                    showSouthernIslesLoadingEffect();
                    
                    // Preload Southern Isles image
                    const img = new Image();
                    img.onload = () => {
                        // Hide loading effect and switch to Southern Isles
                        hideSouthernIslesLoadingEffect();
                        
                        // Apply Southern Isles theme
                        applySouthernIslesTheme();
                        
                        // Switch to Southern Isles map
                        mapImage.src = 'assets/Southern Isles.png';
                        
                        // Create Southern Isles regions
                        createSouthernIslesRegions();
                        
                        // Update navigation
                        updateBreadcrumb();
                        showReturnButton();
                        
                        // Reset map transform and fade in
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.onerror = () => {
                        console.error('Failed to load Southern Isles map');
                        hideSouthernIslesLoadingEffect();
                        // Fallback: continue without image change
                        applySouthernIslesTheme();
                        createSouthernIslesRegions();
                        updateBreadcrumb();
                        showReturnButton();
                        gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                        gsap.to(mapWrapper, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.8,
                            ease: "power2.inOut"
                        });
                    };
                    
                    img.src = 'assets/Southern Isles.png';
                });
        }
    } else if (realm === 'republic-kiona') {
    const mapWrapper = document.getElementById('map-wrapper');
    const mapImage = document.querySelector('#map-wrapper img');
    
    navigationHistory.push('Republic of Kiona');
    currentLevel = 'third';
    
    createLevelTransitionEffect();
    
    if (typeof gsap !== 'undefined') {
        gsap.timeline()
            .to(mapWrapper, {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut"
            })
            .call(() => {
                // Clear current pinpoints first
                clearCurrentPinpoints();
                
                // Show loading effect with Republic of Kiona theme
                showRepublicKionaLoadingEffect();
                
                // Preload Republic of Kiona image
                const img = new Image();
                img.onload = () => {
                    // Hide loading effect and switch to Republic of Kiona
                    hideRepublicKionaLoadingEffect();
                    
                    // Apply Republic of Kiona theme
                    applyRepublicKionaTheme();
                    
                    // Switch to Republic of Kiona map
                    mapImage.src = 'assets/The Republic of Kiona.png';
                    
                    // Create Republic of Kiona regions
                    createRepublicKionaRegions();
                    
                    // Update navigation
                    updateBreadcrumb();
                    showReturnButton();
                    
                    // Reset map transform and fade in
                    gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                    gsap.to(mapWrapper, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                };
                
                img.onerror = () => {
                    console.error('Failed to load Republic of Kiona map');
                    hideRepublicKionaLoadingEffect();
                    // Fallback: continue without image change
                    applyRepublicKionaTheme();
                    createRepublicKionaRegions();
                    updateBreadcrumb();
                    showReturnButton();
                    gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                    gsap.to(mapWrapper, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                };
                
                img.src = 'assets/The Republic of Kiona.png';
            });
        }
    } else {
        // Handle other third level transitions
        console.log(`Transitioning to third level: ${realm}`);
    }
}

function applyRepublicKionaTheme() {
    // Apply Republic of Kiona theme with Emerald, Gold, Black colors and Cinzel Decorative font
    const themeStyle = document.createElement('style');
    themeStyle.id = 'republic-kiona-theme';
    themeStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap');
        
        .republic-kiona-theme {
            font-family: 'Cinzel Decorative', cursive !important;
        }
        
        .republic-kiona-theme .pinpoint {
            background: linear-gradient(45deg, #50C878, #FFD700);
            border: 2px solid #000;
            box-shadow: 0 0 20px rgba(80, 200, 120, 0.6);
        }
        
        .republic-kiona-theme .pinpoint:hover {
            background: linear-gradient(45deg, #66CDAA, #FFF8DC);
            box-shadow: 0 0 30px rgba(80, 200, 120, 0.8);
        }
        
        .republic-kiona-theme .pin-label {
            color: #FFD700;
            text-shadow: 2px 2px 4px #000;
            font-family: 'Cinzel Decorative', cursive;
            border: 1px solid #FFD700;
        }
        
        .republic-kiona-modal {
            background: linear-gradient(135deg, #000 0%, #50C878 50%, #000 100%);
            border: 3px solid #FFD700;
            color: #FFD700;
            font-family: 'Cinzel Decorative', cursive;
        }
        
        .republic-kiona-modal h2 {
            color: #FFD700;
            text-shadow: 2px 2px 4px #50C878;
        }
        
        .republic-kiona-modal .close-btn {
            background: #FFD700;
            color: #000;
            border: 2px solid #50C878;
            font-family: 'Cinzel Decorative', cursive;
        }
        
        .republic-kiona-modal .close-btn:hover {
            background: #FFF8DC;
            box-shadow: 0 0 10px #FFD700;
        }
    `;
    
    document.head.appendChild(themeStyle);
    document.body.classList.add('republic-kiona-theme');
}

function createRepublicKionaRegions() {
    const regions = getRepublicKionaData();
    const mapWrapper = document.getElementById('map-wrapper');
    
    regions.forEach((regionData, index) => {
        setTimeout(() => {
            const pinpoint = createRepublicKionaRegionPinpoint(regionData);
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0, y: -50 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 100);
    });
}

function createRepublicKionaRegionPinpoint(regionData) {
    const pinpoint = document.createElement('div');
    pinpoint.className = 'pinpoint republic-kiona-region';
    pinpoint.style.cssText = `
        position: absolute;
        top: ${regionData.position.top};
        left: ${regionData.position.left};
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #0F52BA, #C0C0C0);
        border: 2px solid #C0C0C0;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(15, 82, 186, 0.5);
        z-index: 10;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'pin-label';
    label.textContent = regionData.name;
    label.style.cssText = `
        position: absolute;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #C0C0C0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        font-family: 'Cormorant Unicase', serif;
        text-shadow: 1px 1px 2px #000;
        border: 1px solid #C0C0C0;
    `;
    
    pinpoint.appendChild(label);
    
    // Add click handler
    pinpoint.addEventListener('click', () => {
        showRepublicKionaRegionModal(regionData);
        createMagicalSparkles(pinpoint);
    });
    
    // Add hover effects
    pinpoint.addEventListener('mouseenter', () => {
        createMagicalSparkles(pinpoint);
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1.3, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    pinpoint.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    return pinpoint;
}

function showRepublicKionaRegionModal(regionData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('republic-kiona-region-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'republic-kiona-region-modal';
    modal.className = 'republic-kiona-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #000 0%, #0F52BA 50%, #000 100%);
        border: 3px solid #C0C0C0;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        color: #C0C0C0;
        font-family: 'Cormorant Unicase', serif;
        box-shadow: 0 0 50px rgba(15, 82, 186, 0.8);
        z-index: 1000;
        animation: modalFadeIn 0.5s ease-out;
    `;
    
    modal.innerHTML = `
        <div style="position: relative;">
            <button class="close-btn" style="
                position: absolute;
                top: -10px;
                right: -10px;
                background: #C0C0C0;
                color: #000;
                border: 2px solid #0F52BA;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                font-family: 'Cormorant Unicase', serif;
                transition: all 0.3s ease;
            ">×</button>
            
            <h2 style="
                margin: 0 0 20px 0;
                color: #C0C0C0;
                text-align: center;
                font-size: 28px;
                text-shadow: 2px 2px 4px #0F52BA;
                font-family: 'Cormorant Unicase', serif;
            ">${regionData.name}</h2>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #C0C0C0;">Population:</strong> ${regionData.population}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #C0C0C0;">Primary Exports:</strong> ${regionData.export}
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #C0C0C0;">Trade Partners:</strong> ${regionData.trade}
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #C0C0C0;">Description:</strong>
                <p style="margin: 10px 0; line-height: 1.6; color: #E6E6FA;">${regionData.description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

function showRepublicKionaLoadingEffect() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'republic-kiona-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000 0%, #0F52BA 50%, #000 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: 'Cormorant Unicase', serif;
    `;
    
    loadingDiv.innerHTML = `
        <div style="text-align: center; color: #C0C0C0;">
            <div style="
                width: 60px;
                height: 60px;
                border: 4px solid #C0C0C0;
                border-top: 4px solid #0F52BA;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h2 style="
                margin: 0;
                font-size: 24px;
                text-shadow: 2px 2px 4px #0F52BA;
                font-family: 'Cormorant Unicase', serif;
            ">Loading Republic of Kiona...</h2>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideRepublicKionaLoadingEffect() {
    const loadingDiv = document.getElementById('republic-kiona-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function getRepublicKionaData() {
    return [
        {
            name: "Eon",
            population: "328",
            export: "Aristocrats",
            trade: "Global",
            description: "Eon is an exclusive aristocratic society. Residents are called the Radiant, known for their long, pointed ears that denote nobility and status across Cendrial. The Radiant are entitled, believing themselves superior to all in Cendrial. Dignitaries produced here go on to advise powerful leaders, including Queen Isadora and Emperor Raz'lun. Their fortress in the sky is only accessible through wayportals, locked for any who do not possess Radiant qualities or the password.",
            position: { top: "22%", left: "46%" }
        },
        {
            name: "Kiona Desert",
            population: "Unknown",
            export: "-",
            trade: "-",
            description: "A scorching desert perched upon a seaside cliff, the Kiona Desert serves as a habitat for criminals banished from New Kiona City.",
            position: { top: "87%", left: "45%" }
        },
        {
            name: "Kionan Provinces",
            population: "20,384",
            export: "-",
            trade: "-",
            description: "The Kionan Provinces are an archipelago of privately-owned islands across the continent.",
            position: { top: "13%", left: "50%" }
        },
        {
            name: "Kionan Provinces",
            population: "20,384",
            export: "-",
            trade: "-",
            description: "The Kionan Provinces are an archipelago of privately-owned islands across the continent.",
            position: { top: "32%", left: "56%" }
        },
        {
            name: "The Great Deep Shallows",
            population: "-",
            export: "-",
            trade: "-",
            description: "The largest ocean that spans across most of Cendrial's surface. It is rumored there are two footprints in the middle of the ocean, where a Dragon walked across the surface of Cendrial.",
            position: { top: "87%", left: "60%" }
        },
        {
            name: "The Library of Dragons",
            population: "-",
            export: "-",
            trade: "-",
            description: "A canyon between the southern border of New Kiona City and the northern border of the Kionan Desert, the Library of Dragons is a canyon where ancient Dragons would flock to exchange ideas.",
            position: { top: "66%", left: "38%" }
        },
        {
            name: "The Outer Ring",
            population: "-",
            export: "-",
            trade: "-",
            description: "An amoebic border, the Outer Ring contains a barrier spell keeping out any who are not welcome in New Kiona City. The border was created by a Dragon whose flames turned silver sands to black glass.",
            position: { top: "78%", left: "50%" }
        },
        {
            name: "The Presidential Palace",
            population: "295",
            export: "-",
            trade: "-",
            description: "President Wolas Westerfield XXII rules over New Kiona City from a fortress in the sky. It was originally an active volcano that is now used as a power source for Kionan technologies.",
            position: { top: "32%", left: "46%" }
        },
        {
            name: "The Silver Sands",
            population: "2,500",
            export: "-",
            trade: "-",
            description: "A seaside resort, the Silver Sands is a luxurious destination for those who have won the yearly Silver Sands lottery. Residents are provided a suite and daily rations of delicacies and magical water.",
            position: { top: "55%", left: "60%" }
        },
        {
            name: "The Spires",
            population: "100,125",
            export: "-",
            trade: "-",
            description: "A majority of Kiona's residents reside in The Spires, skyscraping towers that function as their own cities. Each is ruled over by its own Spiremaster. The gardens within the Spires territory provide food for all of Kiona.",
            position: { top: "27%", left: "37%" }
        },
        {
            name: "The Tunnels",
            population: "40,237",
            export: "-",
            trade: "-",
            description: "An underground shanty town, The Tunnels are populated by those known as the Obscura – peoples who have had their long ears clipped at birth due to a number of circumstances, including orphans, children born as a result of assault, and those who are given up by their parents. Those born underground are brandished with face tattoos to indicate their status as Tunnelers.",
            position: { top: "55%", left: "44%" }
        },
        {
            name: "Wester",
            population: "5,204",
            export: "Goods",
            trade: "The Bazaar",
            description: "The original human city in Kiona, Wester continues to produce goods such as wine, leather, and gems, though the quality has changed significantly since New Kiona City was founded.",
            position: { top: "23%", left: "56%" }
        }
    ];
}

function applySouthernIslesTheme() {
    // Apply Southern Isles theme with Amethyst, Silver, Gold, Black colors and Vollkorn SC font
    const themeStyle = document.createElement('style');
    themeStyle.id = 'southern-isles-theme';
    themeStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Vollkorn+SC:wght@400;600;700;900&display=swap');
        
        .southern-isles-theme {
            font-family: 'Vollkorn SC', serif !important;
        }
        
        .southern-isles-theme .pinpoint {
            background: linear-gradient(45deg, #9966CC, #C0C0C0);
            border: 2px solid #FFD700;
            box-shadow: 0 0 20px rgba(153, 102, 204, 0.6);
        }
        
        .southern-isles-theme .pinpoint:hover {
            background: linear-gradient(45deg, #BA55D3, #E6E6FA);
            box-shadow: 0 0 30px rgba(153, 102, 204, 0.8);
        }
        
        .southern-isles-theme .pin-label {
            color: #FFD700;
            text-shadow: 2px 2px 4px #000;
            font-family: 'Vollkorn SC', serif;
            border: 1px solid #FFD700;
        }
        
        .southern-isles-modal {
            background: linear-gradient(135deg, #000 0%, #9966CC 50%, #000 100%);
            border: 3px solid #FFD700;
            color: #C0C0C0;
            font-family: 'Vollkorn SC', serif;
        }
        
        .southern-isles-modal h2 {
            color: #FFD700;
            text-shadow: 2px 2px 4px #9966CC;
        }
        
        .southern-isles-modal .close-btn {
            background: #FFD700;
            color: #000;
            border: 2px solid #9966CC;
            font-family: 'Vollkorn SC', serif;
        }
        
        .southern-isles-modal .close-btn:hover {
            background: #FFF8DC;
            box-shadow: 0 0 10px #FFD700;
        }
    `;
    
    document.head.appendChild(themeStyle);
    document.body.classList.add('southern-isles-theme');
}

function createSouthernIslesRegions() {
    const regions = getSouthernIslesData();
    const mapWrapper = document.getElementById('map-wrapper');
    
    regions.forEach((regionData, index) => {
        setTimeout(() => {
            const pinpoint = createSouthernIslesRegionPinpoint(regionData);
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0, y: -50 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 100);
    });
}

function createSouthernIslesRegionPinpoint(regionData) {
    const pinpoint = document.createElement('div');
    pinpoint.className = 'pinpoint southern-isles-region';
    pinpoint.style.cssText = `
        position: absolute;
        top: ${regionData.position.top};
        left: ${regionData.position.left};
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #9966CC, #C0C0C0);
        border: 2px solid #FFD700;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(153, 102, 204, 0.5);
        z-index: 10;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'pin-label';
    label.textContent = regionData.name;
    label.style.cssText = `
        position: absolute;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #FFD700;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        font-family: 'Vollkorn SC', serif;
        text-shadow: 1px 1px 2px #000;
        border: 1px solid #FFD700;
    `;
    
    pinpoint.appendChild(label);
    
    // Add click handler
    pinpoint.addEventListener('click', () => {
        showSouthernIslesRegionModal(regionData);
        createMagicalSparkles(pinpoint);
    });
    
    // Add hover effects
    pinpoint.addEventListener('mouseenter', () => {
        createMagicalSparkles(pinpoint);
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1.3, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    pinpoint.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    return pinpoint;
}

function showSouthernIslesRegionModal(regionData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('southern-isles-region-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'southern-isles-region-modal';
    modal.className = 'southern-isles-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #000 0%, #9966CC 50%, #000 100%);
        border: 3px solid #FFD700;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 2000;
        color: #C0C0C0;
        font-family: 'Vollkorn SC', serif;
        box-shadow: 0 0 50px rgba(153, 102, 204, 0.3);
    `;
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; margin: 0 0 10px 0; font-size: 28px; text-shadow: 2px 2px 4px #9966CC;">${regionData.name}</h2>
            <div style="height: 2px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 10px 0;"></div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <strong style="color: #FFD700;">Population:</strong><br>
                    <span style="color: #C0C0C0;">${regionData.population}</span>
                </div>
                <div>
                    <strong style="color: #FFD700;">Export/Resource:</strong><br>
                    <span style="color: #C0C0C0;">${regionData.export}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #FFD700;">Trade Partners:</strong><br>
                <span style="color: #C0C0C0;">${regionData.trade}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #FFD700;">Description:</strong><br>
                <p style="color: #C0C0C0; line-height: 1.6; margin: 10px 0;">${regionData.description}</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="close-btn" onclick="document.getElementById('southern-isles-region-modal').remove()" style="
                background: #FFD700;
                color: #000;
                border: 2px solid #9966CC;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Vollkorn SC', serif;
                font-size: 16px;
                transition: all 0.3s ease;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
}

function showSouthernIslesLoadingEffect() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'southern-isles-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        text-align: center;
        color: #C0C0C0;
        font-family: 'Cormorant Unicase', serif;
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 15px;
        border: 2px solid #C0C0C0;
        box-shadow: 0 0 30px rgba(192, 192, 192, 0.3);
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 3px solid rgba(192, 192, 192, 0.3);
            border-top: 3px solid #C0C0C0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <div style="font-size: 18px; text-shadow: 2px 2px 4px rgba(15, 82, 186, 0.8);">Loading Southern Isles...</div>
    `;
    
    document.body.appendChild(loadingDiv);
    
    // Fade in the loading effect
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(loadingDiv, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
    }
}

function hideSouthernIslesLoadingEffect() {
    const loadingDiv = document.getElementById('southern-isles-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function applySilmaasEmpireTheme() {
    // Apply Sil'maas Empire theme with Sapphire, Silver, Black colors and Cormorant Unicase font
    const themeStyle = document.createElement('style');
    themeStyle.id = 'silmaas-empire-theme';
    themeStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Unicase:wght@400;500;600;700&display=swap');
        
        .silmaas-theme {
            font-family: 'Cormorant Unicase', serif !important;
        }
        
        .silmaas-theme .pinpoint {
            background: linear-gradient(45deg, #0F52BA, #C0C0C0);
            border: 2px solid #C0C0C0;
            box-shadow: 0 0 20px rgba(15, 82, 186, 0.6);
        }
        
        .silmaas-theme .pinpoint:hover {
            background: linear-gradient(45deg, #1E90FF, #E6E6FA);
            box-shadow: 0 0 30px rgba(15, 82, 186, 0.8);
        }
        
        .silmaas-theme .pin-label {
            color: #C0C0C0;
            text-shadow: 2px 2px 4px #000;
            font-family: 'Cormorant Unicase', serif;
        }
        
        .silmaas-modal {
            background: linear-gradient(135deg, #000 0%, #0F52BA 50%, #000 100%);
            border: 3px solid #C0C0C0;
            color: #C0C0C0;
            font-family: 'Cormorant Unicase', serif;
        }
        
        .silmaas-modal h2 {
            color: #C0C0C0;
            text-shadow: 2px 2px 4px #0F52BA;
        }
        
        .silmaas-modal .close-btn {
            background: #C0C0C0;
            color: #000;
            border: 2px solid #0F52BA;
            font-family: 'Cormorant Unicase', serif;
        }
        
        .silmaas-modal .close-btn:hover {
            background: #E6E6FA;
            box-shadow: 0 0 10px #C0C0C0;
        }
    `;
    
    document.head.appendChild(themeStyle);
    document.body.classList.add('silmaas-theme');
}

function createSilmaasEmpireRegions() {
    const regions = getSilmaasEmpireData();
    const mapWrapper = document.getElementById('map-wrapper');
    
    regions.forEach((regionData, index) => {
        setTimeout(() => {
            const pinpoint = createSilmaasRegionPinpoint(regionData);
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0, y: -50 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 100);
    });
}

function createSilmaasRegionPinpoint(regionData) {
    const pinpoint = document.createElement('div');
    pinpoint.className = 'pinpoint silmaas-region';
    pinpoint.style.cssText = `
        position: absolute;
        top: ${regionData.position.top};
        left: ${regionData.position.left};
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #0F52BA, #C0C0C0);
        border: 2px solid #C0C0C0;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(15, 82, 186, 0.5);
        z-index: 10;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'pin-label';
    label.textContent = regionData.name;
    label.style.cssText = `
        position: absolute;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #C0C0C0;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        font-family: 'Cormorant Unicase', serif;
        text-shadow: 1px 1px 2px #000;
        border: 1px solid #C0C0C0;
    `;
    
    pinpoint.appendChild(label);
    
    // Add click handler
    pinpoint.addEventListener('click', () => {
        showSilmaasRegionModal(regionData);
        createMagicalSparkles(pinpoint);
    });
    
    // Add hover effects
    pinpoint.addEventListener('mouseenter', () => {
        createMagicalSparkles(pinpoint);
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1.3, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    pinpoint.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    return pinpoint;
}

function showSilmaasRegionModal(regionData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('silmaas-region-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'silmaas-region-modal';
    modal.className = 'silmaas-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #000 0%, #0F52BA 50%, #000 100%);
        border: 3px solid #C0C0C0;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 2000;
        color: #C0C0C0;
        font-family: 'Cormorant Unicase', serif;
        box-shadow: 0 0 50px rgba(15, 82, 186, 0.3);
    `;
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #C0C0C0; margin: 0 0 10px 0; font-size: 28px; text-shadow: 2px 2px 4px #0F52BA;">${regionData.name}</h2>
            <div style="height: 2px; background: linear-gradient(90deg, transparent, #C0C0C0, transparent); margin: 10px 0;"></div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <strong style="color: #E6E6FA;">Population:</strong><br>
                    <span style="color: #C0C0C0;">${regionData.population}</span>
                </div>
                <div>
                    <strong style="color: #E6E6FA;">Export/Resource:</strong><br>
                    <span style="color: #C0C0C0;">${regionData.export}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #E6E6FA;">Trade Partners:</strong><br>
                <span style="color: #C0C0C0;">${regionData.trade}</span>
            </div>
            
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #E6E6FA;">Description:</strong><br>
                <p style="color: #C0C0C0; line-height: 1.6; margin: 10px 0;">${regionData.description}</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button class="close-btn" onclick="document.getElementById('silmaas-region-modal').remove()" style="
                background: #C0C0C0;
                color: #000;
                border: 2px solid #0F52BA;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Cormorant Unicase', serif;
                font-size: 16px;
                transition: all 0.3s ease;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
}

function getSouthernIslesData() {
    return [
        {
            name: "Alemoore",
            population: "4,293",
            export: "Ale, Wine, Mead, Rum",
            trade: "The Bazaar",
            description: "A fortress with several distilleries, Alemoore is the leading distributor of alcohol in Cendrial.",
            position: { top: "85%", left: "29%" }
        },
        {
            name: "Beggar's Isle",
            population: "20,231",
            export: "-",
            trade: "-",
            description: "Capital of the Southern Isles, Beggar's Isle houses most of the isle's population and processes refugees from across Cendrial, mostly from Sil'maas and Kiona.",
            position: { top: "44%", left: "59%" }
        },
        {
            name: "Cinderwood",
            population: "10,374",
            export: "Goods",
            trade: "The Bazaar",
            description: "A thriving shipping town, Cinderwood is constantly receiving shipments from across the globe and delivering goods to the Bazaar in Sil'maas Empire.",
            position: { top: "47%", left: "35%" }
        },
        {
            name: "Ettim",
            population: "2,190",
            export: "Whiskey, Gin, Wine",
            trade: "The Bazaar",
            description: "Settled by distillery rivals, Ettim produces quality whiskies, gin, and wine utilizing resources gathered from the Bazaar.",
            position: { top: "59%", left: "46%" }
        },
        {
            name: "Frostwind",
            population: "3,405",
            export: "-",
            trade: "-",
            description: "Frostwind is an archipelago of private islands owned by the Pirates of the Brother Moons, who protect the Isles from invaders.",
            position: { top: "20%", left: "36%" }
        },
        {
            name: "King's Hollow",
            population: "5",
            export: "-",
            trade: "-",
            description: "The private residence of the Pirate King and their family. (The Pirate King is elected by the people, and can be either a woman or man.)",
            position: { top: "44%", left: "75%" }
        },
        {
            name: "The Frozen Wastes",
            population: "100,234 (deceased)",
            export: "-",
            trade: "-",
            description: "A graveyard of those whose bodies have been recovered from battle. Most perish at sea.",
            position: { top: "73%", left: "75%" }
        },
        {
            name: "The Great Deep Shallows",
            population: "-",
            export: "-",
            trade: "-",
            description: "The largest ocean that spans across most of Cendrial's surface. It is rumored there are two footprints in the middle of the ocean, where a Dragon walked across the surface of Cendrial.",
            position: { top: "3%", left: "46%" }
        },
        {
            name: "The Halls of Heroes",
            population: "50,302 (deceased)",
            export: "-",
            trade: "-",
            description: "A mausoleum filled with fallen heroes who achieved good deeds. It also serves as the island's library, housing the history of the Isles and the Gods of Cendrial. The fortress is heavily guarded.",
            position: { top: "37%", left: "19%" }
        },
        {
            name: "The Lost Isles",
            population: "Unknown",
            export: "-",
            trade: "-",
            description: "Legends say the Lost Isles are a paradise, others say they are desolate wastelands filled with the spirits of angry Dragons. None have come back alive; folk tales told to children include the Sirens of the Lost Isles who lure sailors to their deaths at sea.",
            position: { top: "85%", left: "75%" }
        },
        {
            name: "Woodmore Bay",
            population: "200",
            export: "Goods",
            trade: "-",
            description: "Port Woodmoore is active year round, shipping and receiving goods. It is also where tourists stay during their stay in the Isles.",
            position: { top: "64%", left: "29%" }
        }
    ];
}

function closeSilmaasRegionModal() {
    const modal = document.getElementById('silmaas-region-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal && backdrop) {
        if (typeof gsap !== 'undefined') {
            gsap.to([modal, backdrop], {
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    modal.remove();
                    backdrop.remove();
                }
            });
            gsap.to(modal, {
                scale: 0.8,
                y: -50,
                duration: 0.3,
                ease: "power2.inOut"
            });
        } else {
            modal.remove();
            backdrop.remove();
        }
    }
}

function showSilmaasEmpireLoadingEffect() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'silmaas-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        text-align: center;
        color: #C0C0C0;
        font-family: 'Jim Nightshade', cursive;
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 15px;
        border: 2px solid #C0C0C0;
        box-shadow: 0 0 30px rgba(192, 192, 192, 0.3);
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 3px solid rgba(192, 192, 192, 0.3);
            border-top: 3px solid #C0C0C0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <div style="font-size: 18px; text-shadow: 2px 2px 4px rgba(75, 0, 130, 0.8);">Loading Sil'maas Empire...</div>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingDiv);
    
    // Fade in the loading effect
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(loadingDiv, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
    }
}

function hideSilmaasEmpireLoadingEffect() {
    const loadingDiv = document.getElementById('silmaas-loading');
    if (loadingDiv) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingDiv, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingDiv.remove();
                }
            });
        } else {
            loadingDiv.remove();
        }
    }
}

function getSilmaasEmpireData() {
    return [
        {
            name: "Bludmoore",
            population: "10,326",
            export: "Military",
            trade: "-",
            description: "A military outpost, potential soldiers from around the world come for combat training, mission control, and Dragonslaying training.",
            position: { top: "66%", left: "50%" }
        },
        {
            name: "Herris Mines",
            population: "2,391",
            export: "Minerals",
            trade: "The Bazaar, Cinderwood",
            description: "The Herris Mines are the largest source of export in Sil'maas behind food, providing high quality stone that is used around the world to build.",
            position: { top: "62%", left: "33%" }
        },
        {
            name: "Mount Vesuvin",
            population: "-",
            export: "-",
            trade: "-",
            description: "A volcano that overlooks the Crystal Palaces. It is believed that if Mount Vesuvin erupts, it will bury everything in Sil'maas.",
            position: { top: "17%", left: "58%" }
        },
        {
            name: "Nil'ifaas",
            population: "18,120",
            export: "Fabric, Ink",
            trade: "The Bazaar, Cinderwood",
            description: "The largest exporter of textiles in the world, Nil'faas villagers work year round. Their ink has been heralded as the best in Cendrial (their secret: they use minerals from Pallis).",
            position: { top: "42%", left: "44%" }
        },
        {
            name: "Nil'ifaas Crossing",
            population: "7,257",
            export: "Commodities",
            trade: "The Bazaar, Cinderwood",
            description: "The twin village endeavors to process food for the entire empire. Any excess is traded to Cinderwood.",
            position: { top: "61%", left: "43%" }
        },
        {
            name: "Nil'ifaas Fields",
            population: "4,295",
            export: "Commodities",
            trade: "The Bazaar, Cinderwood",
            description: "The twin village endeavors to process food for the entire empire. Any excess is traded to Cinderwood.",
            position: { top: "43%", left: "32%" }
        },
        {
            name: "Opulence",
            population: "55,203",
            export: "Knowledge",
            trade: "Global",
            description: "Scribes work tirelessly to collect, process, and distribute knowledge of Cendrial across the globe.",
            position: { top: "28%", left: "42%" }
        },
        {
            name: "Southshore",
            population: "61,185",
            export: "Goods",
            trade: "Global",
            description: "Known as the \"seaside kingdom,\" Southshore is a relatively independent city in Sil'maas. Merchants from around the world have developed a thriving economy, ruling as a democratic republic.",
            position: { top: "70%", left: "45%" }
        },
        {
            name: "The Bazaar",
            population: "9,204",
            export: "Goods",
            trade: "Global",
            description: "Functioning as an anarchistic capitalist society, The Bazaar is not ruled by the Emperor. The city won its freedom in a coup during the First Age, establishing itself as the heart of free trade. Emperor Raz'lun is not welcome in the city.",
            position: { top: "50%", left: "49%" }
        },
        {
            name: "The Crystal Palaces",
            population: "420,146 (deceased)",
            export: "-",
            trade: "-",
            description: "Built after humans discovered Sil'maas, the Crystal Palaces houses the world's deceased. They serve as the inspiration for The Astas in Lunas Kingdom.",
            position: { top: "35%", left: "60%" }
        },
        {
            name: "The Emerald Glades",
            population: "114,104",
            export: "-",
            trade: "-",
            description: "The Emerald Glades is a tranquil, self-sufficient city state that welcomes any to retire there. Once there, one may never leave. Known as \"the quiet death,\" Sil'maans question its existence.",
            position: { top: "62%", left: "62%" }
        },
        {
            name: "The Great Deep Shallows",
            population: "-",
            export: "-",
            trade: "-",
            description: "The largest ocean that spans across most of Cendrial's surface. It is rumored there are two footprints in the middle of the ocean, where a Dragon walked across the surface of Cendrial.",
            position: { top: "17%", left: "32%" }
        },
        {
            name: "The Septagon Pits",
            population: "-",
            export: "Warcraft",
            trade: "Global",
            description: "A stage for war, fighters from around the world gather to test their strength against captured beasts, and each other. Champions are given housing and treated as kings for the rest of their lives. Countries settle disputes in the pits.",
            position: { top: "75%", left: "56%" }
        },
        {
            name: "The Serpent's Sea",
            population: "-",
            export: "-",
            trade: "-",
            description: "The Serpents of Sil'maas are a military force that traverse the world at the behest of Emperor Raz'lun, who never wants any to forget his power.",
            position: { top: "85%", left: "35%" }
        },
        {
            name: "Vesuvin Canal",
            population: "-",
            export: "-",
            trade: "-",
            description: "Known as the Ferry of the Dead, ships from around the world continuously deliver their deceased to be buried within the Crystal Palaces.",
            position: { top: "23%", left: "48%" }
        }
    ];
}

function applyLunasKingdomTheme() {
    // Apply Lunas Kingdom theme with Ruby, Gold, Black colors and Jim Nightshade font
    const themeStyle = document.createElement('style');
    themeStyle.id = 'lunas-kingdom-theme';
    themeStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Jim+Nightshade&display=swap');
        
        .lunas-theme {
            font-family: 'Jim Nightshade', cursive !important;
        }

        .lunas-theme .pinpoint {
            background: linear-gradient(45deg, #8B0000, #FFD700);
            border: 2px solid #FFD700;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }
        
        .lunas-theme .pinpoint:hover {
            background: linear-gradient(45deg, #A0001A, #FFF700);
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
        }
        
        .lunas-theme .pin-label {
            color: #FFD700;
            text-shadow: 2px 2px 4px #000;
            font-family: 'Jim Nightshade', cursive;
        }
        
        .lunas-modal {
            background: linear-gradient(135deg, #000 0%, #8B0000 50%, #000 100%);
            border: 3px solid #FFD700;
            color: #FFD700;
            font-family: 'Jim Nightshade', cursive;
        }
        
        .lunas-modal h2 {
            color: #FFD700;
            text-shadow: 2px 2px 4px #8B0000;
        }
        
        .lunas-modal .close-btn {
            background: #FFD700;
            color: #000;
            border: 2px solid #8B0000;
            font-family: 'Jim Nightshade', cursive;
        }
        
        .lunas-modal .close-btn:hover {
            background: #FFF700;
            box-shadow: 0 0 10px #FFD700;
        }
    `;
    
    document.head.appendChild(themeStyle);
    document.body.classList.add('lunas-theme');
}

function createLunasKingdomRegions() {
    const regions = getLunasKingdomData();
    const mapWrapper = document.getElementById('map-wrapper');
    
    regions.forEach((regionData, index) => {
        setTimeout(() => {
            const pinpoint = createLunasRegionPinpoint(regionData);
            mapWrapper.appendChild(pinpoint);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(pinpoint, 
                    { scale: 0, opacity: 0, y: -50 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                );
            }
        }, index * 100);
    });
}

function createLunasRegionPinpoint(regionData) {
    const pinpoint = document.createElement('div');
    pinpoint.className = 'pinpoint lunas-region';
    pinpoint.style.cssText = `
        position: absolute;
        top: ${regionData.position.top};
        left: ${regionData.position.left};
        width: 20px;
        height: 20px;
        background: linear-gradient(45deg, #8B0000, #FFD700);
        border: 2px solid #FFD700;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        z-index: 10;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.className = 'pin-label';
    label.textContent = regionData.name;
    label.style.cssText = `
        position: absolute;
        top: 25px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: #FFD700;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        font-family: 'Jim Nightshade', cursive;
        text-shadow: 1px 1px 2px #000;
        border: 1px solid #FFD700;
    `;
    
    pinpoint.appendChild(label);
    
    // Add touch event support for mobile
    let touchStartTime = 0;
    let touchMoved = false;
    
    // Touch events for mobile
    pinpoint.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchMoved = false;
        e.stopPropagation();
    });
    
    pinpoint.addEventListener('touchmove', (e) => {
        touchMoved = true;
        e.stopPropagation();
    });
    
    pinpoint.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const touchDuration = Date.now() - touchStartTime;
        if (!touchMoved && touchDuration < 500) {
            showLunasRegionModal(regionData);
            createMagicalSparkles(pinpoint);
        }
    });
    
    // Keep click handler for desktop
    pinpoint.addEventListener('click', () => {
        showLunasRegionModal(regionData);
        createMagicalSparkles(pinpoint);
    });
    
    // Add hover effects for desktop
    pinpoint.addEventListener('mouseenter', () => {
        createMagicalSparkles(pinpoint);
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1.3, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    pinpoint.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(pinpoint, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
        }
    });
    
    return pinpoint;
}

function showLunasKingdomLoadingEffect() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'lunas-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #FFD700;
        font-family: 'Jim Nightshade', cursive;
        font-size: 24px;
        text-align: center;
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 15px;
        border: 2px solid #FFD700;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
        z-index: 1000;
        opacity: 0;
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 3px solid rgba(255, 215, 0, 0.3);
            border-top: 3px solid #FFD700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <div>Loading Lunas Kingdom...</div>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('lunas-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'lunas-loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingDiv);
    
    // Animate loading appearance
    if (typeof gsap !== 'undefined') {
        gsap.to(loadingDiv, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" });
    } else {
        loadingDiv.style.opacity = '1';
    }
}

function hideLunasKingdomLoadingEffect() {
    const loadingDiv = document.getElementById('lunas-loading');
    if (loadingDiv) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingDiv, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingDiv.remove();
                }
            });
        } else {
            loadingDiv.remove();
        }
    }
}

function handleSubLevelClick(pin, realm, label) {
    const url = pin.dataset.url;
    
    if (url) {
        createMagicalSparkles(pin);
        setTimeout(() => {
            window.open(url, '_blank');
        }, 500);
    } else {
        console.log(`Sub-level click: ${realm} - ${label}`);
    }
}

function initializeDetailedPinpointInteractions() {
    const pinpoints = document.querySelectorAll('.pinpoint');
    
    pinpoints.forEach(pin => {
        // Add touch event support for mobile
        let touchStartTime = 0;
        let touchMoved = false;
        
        // Touch events for mobile
        pin.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
            e.stopPropagation(); // Prevent map panning
        });
        
        pin.addEventListener('touchmove', (e) => {
            touchMoved = true;
            e.stopPropagation(); // Prevent map panning
        });
        
        pin.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only trigger if it was a quick tap (not a long press or drag)
            const touchDuration = Date.now() - touchStartTime;
            if (!touchMoved && touchDuration < 500) {
                const realm = pin.dataset.realm;
                const label = pin.dataset.label;
                
                if (currentLevel === 'second') {
                    transitionToThirdLevel(realm);
                } else {
                    handleMainLevelClick(pin, realm, label);
                }
                
                createMagicalSparkles(pin);
                createPinpointBurst(pin);
            }
        });
        
        // Keep click event for desktop
        pin.addEventListener('click', (e) => {
            e.preventDefault();
            
            const realm = pin.dataset.realm;
            const label = pin.dataset.label;
            
            if (currentLevel === 'second') {
                transitionToThirdLevel(realm);
            } else {
                handleMainLevelClick(pin, realm, label);
            }
            
            createMagicalSparkles(pin);
            createPinpointBurst(pin);
        });
        
        // Mouse events for desktop hover effects
        pin.addEventListener('mouseenter', () => {
            createMagicalSparkles(pin);
            if (typeof gsap !== 'undefined') {
                gsap.to(pin, { scale: 1.2, duration: 0.3, ease: "back.out(1.7)" });
            }
        });
        
        pin.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(pin, { scale: 1, duration: 0.3, ease: "back.out(1.7)" });
            }
        });
    });
}

// ===================================================================
// DATA FUNCTIONS
// ===================================================================

function getSecondLevelData(realm) {
    const data = {
        queensrealm: [
            { realm: 'lunas-kingdom', label: 'Lunas Kingdom', position: { top: '25%', left: '30%' } },
            { realm: 'silmaas-empire', label: 'Sil\'maas Empire', position: { top: '45%', left: '60%' } },
            { realm: 'southern-isles', label: 'Southern Isles', position: { top: '70%', left: '40%' } },
            { realm: 'republic-kiona', label: 'Republic of Kiona', position: { top: '50%', left: '70%' } }
        ],
        cendrial: [
            { realm: 'lunas-kingdom', label: 'Lunas Kingdom', position: { top: '10%', left: '55%' }, customImage: 'assets/1.png' },
            { realm: 'silmaas-empire', label: 'Sil\'maas Empire', position: { top: '38%', left: '72%' }, customImage: 'assets/4.png' },
            { realm: 'southern-isles', label: 'The Southern Isles of the Brother Moons', position: { top: '80%', left: '49%' }, customImage: 'assets/2.png' },
            { realm: 'republic-kiona', label: 'The Republic of Kiona', position: { top: '40%', left: '23%' }, customImage: 'assets/3.png' }
        ],
    };
    
    return data[realm] || [];
}

// ===================================================================
// UI EFFECTS AND ANIMATIONS
// ===================================================================

function showLoadingEffect() {
    // Remove any existing loading effect first
    const existingLoading = document.getElementById('map-loading');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'map-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        text-align: center;
        color: #9966CC;
        font-family: 'Cinzel Decorative', cursive;
        font-size: 24px;
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 15px;
        border: 2px solid #9966CC;
        box-shadow: 0 0 30px rgba(153, 102, 204, 0.7);
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 3px solid rgba(153, 102, 204, 0.3);
            border-top: 3px solid #9966CC;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <div>Loading Queensrealm...</div>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingDiv);
    
    // Animate loading appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(loadingDiv, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
    }
}

function hideLoadingEffect() {
    const loadingDiv = document.getElementById('map-loading');
    if (loadingDiv) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingDiv, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => loadingDiv.remove()
            });
        } else {
            loadingDiv.remove();
        }
    }
}

function handleEnterButtonClick() {
    if (!enterBtn || !landingScreen || !homePage) return;
    
    enterBtn.style.pointerEvents = 'none';
    triggerEnhancedBurstEffect();
    
    setTimeout(() => {
        if (typeof gsap !== 'undefined') {
            gsap.timeline()
                .to(landingScreen, {
                    scale: 1.1,
                    opacity: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                })
                .to(homePage, {
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out",
                    onStart: () => {
                        homePage.style.display = 'block';
                    },
                    onComplete: () => {
                        landingScreen.style.display = 'none';
                        initializePinpointInteractions();
                    }
                });
        } else {
            landingScreen.style.display = 'none';
            homePage.style.display = 'block';
            initializePinpointInteractions();
        }
    }, 2000);
}

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
    // Remove Lunas Kingdom theme
    const lunasThemeStyle = document.getElementById('lunas-kingdom-theme');
    if (lunasThemeStyle) {
        lunasThemeStyle.remove();
    }
    document.body.classList.remove('lunas-theme');
    
    // Remove Sil'maas Empire theme
    const silmaasThemeStyle = document.getElementById('silmaas-empire-theme');
    if (silmaasThemeStyle) {
        silmaasThemeStyle.remove();
    }
    document.body.classList.remove('silmaas-theme');
    
    // Remove Southern Isles theme
    const southernIslesThemeStyle = document.getElementById('southern-isles-theme');
    if (southernIslesThemeStyle) {
        southernIslesThemeStyle.remove();
    }
    document.body.classList.remove('southern-isles-theme');

    const republicKionaThemeStyle = document.getElementById('republic-kiona-theme');
    if (republicKionaThemeStyle) {
        republicKionaThemeStyle.remove();
    }
    document.body.classList.remove('republic-kiona-theme');
}

function showLunasRegionModal(regionData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('lunas-region-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'lunas-region-modal';
    modal.className = 'lunas-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #000 0%, #8B0000 50%, #000 100%);
        border: 3px solid #FFD700;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 2000;
        color: #FFD700;
        font-family: 'Jim Nightshade', cursive;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
    `;
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; margin: 0 0 10px 0; font-size: 28px; text-shadow: 2px 2px 4px #8B0000;">${regionData.name}</h2>
            <div style="height: 2px; background: linear-gradient(90deg, transparent, #FFD700, transparent); margin: 10px 0;"></div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <strong style="color: #FFF700;">Population:</strong><br>
                    <span style="color: #FFD700;">${regionData.population}</span>
                </div>
                <div>
                    <strong style="color: #FFF700;">Export/Resource:</strong><br>
                    <span style="color: #FFD700;">${regionData.export}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: #FFF700;">Trade Partners:</strong><br>
                <span style="color: #FFD700;">${regionData.trade}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <strong style="color: #FFF700;">Description:</strong><br>
                <p style="color: #FFD700; line-height: 1.6; margin: 10px 0;">${regionData.description}</p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button onclick="closeLunasRegionModal()" class="close-btn" style="
                background: #FFD700;
                color: #000;
                border: 2px solid #8B0000;
                padding: 10px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-family: 'Jim Nightshade', cursive;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
            ">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1999;
    `;
    backdrop.onclick = closeLunasRegionModal;
    document.body.appendChild(backdrop);
    
    // Animate in
    if (typeof gsap !== 'undefined') {
        gsap.fromTo([modal, backdrop], 
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        gsap.fromTo(modal, 
            { scale: 0.8, y: -50 },
            { scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
    }
}

function closeLunasRegionModal() {
    const modal = document.getElementById('lunas-region-modal');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (modal && backdrop) {
        if (typeof gsap !== 'undefined') {
            gsap.to([modal, backdrop], {
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    modal.remove();
                    backdrop.remove();
                }
            });
            gsap.to(modal, {
                scale: 0.8,
                y: -50,
                duration: 0.3,
                ease: "power2.inOut"
            });
        } else {
            modal.remove();
            backdrop.remove();
        }
    }
}

function getLunasKingdomData() {
    return [
        {
            name: "Astaire",
            population: "450",
            export: "Silk",
            trade: "The Bazaar, Detora, Crescentshire Court",
            description: "Astaire is an island owned by the Astaire family, who have lived on the island for seven generations. Founded as a silk textile mill, Astaire silk is considered the highest quality in the world. Fashion mogul Mossfawn covets Astairean Silk.",
            position: { top: "55%", left: "21%" }
        },
        {
            name: "Crescent Bay",
            population: "250",
            export: "Resources",
            trade: "The Bazaar",
            description: "Ships from Crescent Bay ship out regularly to deliver goods to the Bazaar in Sil'maas Empire, where merchants sell their goods globally.",
            position: { top: "65%", left: "50%" }
        },
        {
            name: "Crescentshire Court",
            population: "2,200",
            export: "Aristocrats",
            trade: "-",
            description: "Crescentshire Court is an aristocratic society. Companions are trained to care for Coins; arts, diplomatics, sciences, and magics are taught at both Sil'maas University and Lunas Academy. Students and residents are given access to the Library of Cendrial, knowledge curated by the Scribes of Sil'maas for centuries.",
            position: { top: "44%", left: "63%" }
        },
        {
            name: "Crescentshire",
            population: "3,485",
            export: "Fabrics",
            trade: "The Bazaar, Crescentshire Court, Detora",
            description: "Crescentshire prides itself on the quality of its wool and cotton, providing much of the world's textiles. Crescentshire is called the 'Jewel of the North' to honor its beauty and charm.",
            position: { top: "56%", left: "62%" }
        },
        {
            name: "Detora",
            population: "5,320",
            export: "Weapons, Leather, Armor",
            trade: "The Bazaar",
            description: "Artisans across the globe immigrate to Detora to learn from legendary craftsmen heralded as the best in Cendrial. Armor bearing the Detora crest are revered amongst Lunar Knights, Sil'maan Serpents, and Pirates of the Brother Moons alike.",
            position: { top: "81%", left: "47%" }
        },
        {
            name: "Estill",
            population: "12,753",
            export: "Lumber, Parchment, Ink",
            trade: "The Bazaar, Cinderwood",
            description: "Estillans have cultivated a technique for rapidly producing lumber, and thus are known as masters of the forests. Paper and ink from Estill are prized for their quality, coveted by Scribes in Opulence.",
            position: { top: "72%", left: "62%" }
        },
        {
            name: "Kyzan",
            population: "11,520",
            export: "Commodities",
            trade: "Lunas Castle",
            description: "A small but mighty village, the fields of Kyzan feed the kingdom; fresh fruits, vegetables, and livestock are grown and shipped to the castle to be processed and distributed amongst the Lunas Commonwealth. \"The Heartbeat of Lunas.\"",
            position: { top: "45%", left: "41%" }
        },
        {
            name: "Lunas Castle",
            population: "2,222",
            export: "-",
            trade: "-",
            description: "King Jal'ek and Queen Isadora rule the Lunas Commonwealth from Lunas Castle. The Seven Princes, Potwashers, dignitaries, and guests from around the world also reside there.",
            position: { top: "50%", left: "53%" }
        },
        {
            name: "Oful",
            population: "10,230",
            export: "-",
            trade: "-",
            description: "Oful is a prison colony settled in a harsh tundra.",
            position: { top: "15%", left: "80%" }
        },
        {
            name: "Pallis",
            population: "3,820",
            export: "Minerals",
            trade: "The Bazaar, Detora, Estill, Crescentshire Court",
            description: "Pallis is a mining town nestled in the Pallis Gorge. Miners have discovered a way to replenish resources from the mountains, producing most of the world's stone, precious metals, and gems.",
            position: { top: "63%", left: "62%" }
        },
        {
            name: "Queen's Cottage",
            population: "22",
            export: "-",
            trade: "-",
            description: "The personal home of Queen Isadora, Queen's Cottage functions year-round as her residence.",
            position: { top: "82%", left: "31%" }
        },
        {
            name: "Queenswater",
            population: "-",
            export: "-",
            trade: "-",
            description: "Queenswater are highly patrolled waters; the Lunas Armada regularly practices maneuvers and readies ships to defend Lunas against invaders.",
            position: { top: "88%", left: "21%" }
        },
        {
            name: "Restin",
            population: "3,778",
            export: "Fish",
            trade: "Lunas Castle",
            description: "Restin is a fishing town where sailors travel to nearby waters to fish, including deep sea fishing in the largest ocean, the Great Deep Shallows. They provide fish for the Lunas Commonwealth.",
            position: { top: "79%", left: "58%" }
        },
        {
            name: "The Astas",
            population: "2 (deceased)",
            export: "-",
            trade: "-",
            description: "The Astas are crystal mausoleums that house the first King and Queen of Lunas, who were both beheaded during the Potwasher Rebellion. The palaces transform to crystal at night, so that the lovers may gaze upon the stars for all of eternity.",
            position: { top: "33%", left: "72%" }
        },
        {
            name: "The Dragonrealm",
            population: "Unknown",
            export: "Unknown",
            trade: "Unknown",
            description: "The Dragonrealm is a mystery to modern Cendrians. Nothing is known of its denizens, few Dragons have been sighted for over twenty years, since the Betrayal that sealed the region behind a banishing spell cast in the Everwood.",
            position: { top: "10%", left: "50%" }
        },
        {
            name: "The Everwood",
            population: "Unknown",
            export: "Unknown",
            trade: "Unknown",
            description: "Bordering the Queensrealm, the Everwood contains a powerful spell that keeps any without Dragonsblood from entering the Dragonrealm.",
            position: { top: "33%", left: "50%" }
        },
        {
            name: "The Starfallen Sea",
            population: "-",
            export: "-",
            trade: "-",
            description: "The Starfallen Sea is often called \"The Sea of Falling Stars,\" as on clear nights the stars can be seen vividly. Sailors describe the waters as looking into all galaxies of the universe.",
            position: { top: "62%", left: "80%" }
        },
        {
            name: "Thornwall",
            population: "12,120",
            export: "Ships",
            trade: "-",
            description: "Thornwall is a shipyard where Lunas Kingdom ships are built. Many of the residents are Deaf or Blind, the largest known population in Cendrial.",
            position: { top: "45%", left: "27%" }
        },
        {
            name: "Urit",
            population: "Unknown",
            export: "-",
            trade: "-",
            description: "Urit is a people, not a place. Uritan nomads travel across Cendrial to collect information, exchange ideas, and enjoy local cuisines.",
            position: { top: "75%", left: "39%" }
        },
        {
            name: "Vern",
            population: "1",
            export: "-",
            trade: "-",
            description: "A lone resident of the island called Vern, a man named Vern has served as Lunas Kingdom's guardian for centuries. There is only ever one.",
            position: { top: "50%", left: "74%" }
        },
        {
            name: "Windwhistle",
            population: "3,515",
            export: "Commodities",
            trade: "The Bazaar, Cinderwood",
            description: "Settled by sailors, Windwhistle is a serene village where many come to rest after travels at sea.",
            position: { top: "62%", left: "38%" }
        }
    ];
}

// ===================================================================
// START APPLICATION
// ===================================================================

// Initialize the application
init();

// Enhanced fire burst effect for portal entry
function triggerEnhancedBurstEffect() {
    if (burstContainer) {
        burstContainer.classList.add('burst-active');
        
        const fireBurst = burstContainer.querySelector('.fire-burst');
        if (fireBurst) fireBurst.classList.add('fire-burst-active');
        
        const magicParticles = burstContainer.querySelectorAll('.magic-particle');
        magicParticles.forEach((particle, index) => {
            setTimeout(() => {
                particle.classList.add('magic-particle-active');
            }, index * 100);
        });
    }
    
    createEnhancedBurningFragments();
    
    // Enhanced button destruction effect
    if (enterBtn) {
        enterBtn.style.transition = 'all 0.8s ease-out';
        enterBtn.style.transform = 'scale(1.4) rotate(8deg)';
        enterBtn.style.opacity = '0.95';
        enterBtn.style.filter = 'blur(3px) brightness(1.8)';
        
        setTimeout(() => {
            enterBtn.style.transform = 'scale(0.7) rotate(-5deg)';
            enterBtn.style.opacity = '0.4';
            enterBtn.style.filter = 'blur(6px) brightness(0.6)';
        }, 400);
        
        setTimeout(() => {
            enterBtn.style.transform = 'scale(0) rotate(15deg)';
            enterBtn.style.opacity = '0';
            enterBtn.style.filter = 'blur(12px) brightness(0.2)';
        }, 800);
    }
}

function showRepublicKionaLoadingEffect() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'republic-kiona-loading';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        text-align: center;
        color: #C0C0C0;
        font-family: 'Cormorant Unicase', serif;
        background: rgba(0, 0, 0, 0.9);
        padding: 40px;
        border-radius: 15px;
        border: 2px solid #C0C0C0;
        box-shadow: 0 0 30px rgba(192, 192, 192, 0.3);
    `;
    
    loadingDiv.innerHTML = `
        <div style="
            width: 60px;
            height: 60px;
            border: 3px solid rgba(192, 192, 192, 0.3);
            border-top: 3px solid #C0C0C0;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        "></div>
        <div style="font-size: 18px; text-shadow: 2px 2px 4px rgba(15, 82, 186, 0.8);">Loading Republic of Kiona...</div>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loadingDiv);
    
    // Fade in the loading effect
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(loadingDiv, 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
    }
}

function hideRepublicKionaLoadingEffect() {
    const loadingDiv = document.getElementById('republic-kiona-loading');
    if (loadingDiv) {
        if (typeof gsap !== 'undefined') {
            gsap.to(loadingDiv, {
                opacity: 0,
                scale: 0.8,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingDiv.remove();
                }
            });
        } else {
            loadingDiv.remove();
        }
    }
}

function createEnhancedBurningFragments() {
    const fragmentCount = 18;
    
    for (let i = 0; i < fragmentCount; i++) {
        const fragment = document.createElement('div');
        fragment.style.cssText = `
            position: absolute;
            width: ${Math.random() * 12 + 6}px;
            height: ${Math.random() * 18 + 8}px;
            background: linear-gradient(45deg,
                #ffd700 0%,
                #ff8c00 25%,
                #ff4500 55%,
                #8b0000 100%);
            border-radius: 50% 20% 50% 80%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            pointer-events: none;
            z-index: 150;
            filter: blur(1.5px);
            box-shadow: 0 0 12px rgba(255, 140, 0, 1);
        `;
        
        document.body.appendChild(fragment);
        
        const angle = (i / fragmentCount) * 360;
        const distance = Math.random() * 300 + 100;
        const duration = Math.random() * 1000 + 1500;
        
        fragment.animate([
            {
                transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
                opacity: 1
            },
            {
                transform: `translate(-50%, -50%) translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) scale(1.2) rotate(${angle}deg)`,
                opacity: 0.8,
                offset: 0.3
            },
            {
                transform: `translate(-50%, -50%) translate(${Math.cos(angle * Math.PI / 180) * distance * 1.5}px, ${Math.sin(angle * Math.PI / 180) * distance * 1.5}px) scale(0.6) rotate(${angle * 2}deg)`,
                opacity: 0.4,
                offset: 0.7
            },
            {
                transform: `translate(-50%, -50%) translate(${Math.cos(angle * Math.PI / 180) * distance * 2}px, ${Math.sin(angle * Math.PI / 180) * distance * 2}px) scale(0) rotate(${angle * 3}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        setTimeout(() => {
            fragment.remove();
        }, duration);
    }
}

function createAuthorModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('author-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'author-modal';
    modal.className = 'placeholder-modal';
    
    // Create modal content with author information
    modal.innerHTML = `
        <div class="modal-content author-modal-content">
            <div class="modal-header">
                <h2>R.K. OSBORN</h2>
                <button class="close-modal" onclick="document.getElementById('author-modal').remove()">&times;</button>
            </div>
            
            <!-- About The Author Section -->
            <div class="author-section">
                <h3>About The Author</h3>
                <div class="author-info">
                    <div class="author-image-container">
                        <img src="assets/author.jpg" alt="R.K. Osborn" class="author-image">
                    </div>
                    <div class="author-bio">
                        <p>R. K. Osborn is an author from Central Texas pouring her lifelong passion of storytelling into stories about characters who feel like old friends.</p>
                        <p>She is focused on writing an epic adventure, The Collective Libraries of Cendrial, with themes of resilience, transformation, and answering the call of destiny.</p>
                        <div class="author-badge">Writing</div>
                    </div>
                </div>
            </div>
            
            <!-- Project Feather Section -->
            <div class="author-section">
                <h3>Project Feather</h3>
                <div class="project-info">
                    <p>Project Feather is an innovative storytelling initiative that combines traditional fantasy elements with interactive digital experiences. This groundbreaking approach allows readers to explore the world of Cendrial beyond the pages of the books.</p>
                    <br><p>Through Project Feather, fans can discover hidden lore, character backgrounds, and immersive content that enhances the main storyline of The Collective Libraries of Cendrial.</p>
                    <div class="project-features">
                        <div class="feature">Interactive Maps</div>
                        <div class="feature">Character Journals</div>
                        <div class="feature">Exclusive Artwork</div>
                    </div>
                </div>
            </div>
            
            <!-- Kickstarter Section -->
            <div class="author-section">
                <h3>Kickstarter</h3>
                <div class="kickstarter-info">
                    <p>Join us on our upcoming Kickstarter campaign to bring the world of Cendrial to life! Your support will help fund professional editing, stunning cover art, and expanded distribution of The Collective Libraries series.</p>
                    <br><p>Backers will receive exclusive rewards including limited edition hardcovers, character artwork, personalized bookplates, and early access to Project Feather content.</p>
                    <div class="kickstarter-details">
                        <div class="detail"><span>Launch Date:</span> Coming Soon</div>
                        <div class="detail"><span>Goal:</span> 4,000</div>
                        <div class="detail"><span>Duration:</span> 30 Days</div>
                    </div>
                    <button class="kickstarter-notify">Get Notified</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add click event to close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add click event for the notification button
    const notifyButton = modal.querySelector('.kickstarter-notify');
    if (notifyButton) {
        notifyButton.addEventListener('click', () => {
            showCustomAlert('Thank you for your interest! We will notify you when the Kickstarter launches.');
        });
    }
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
        
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function createNewsModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('news-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'news-modal';
    modal.className = 'placeholder-modal';
    
    // Create modal content with news sections
    modal.innerHTML = `
        <div class="modal-content news-modal-content">
            <div class="modal-header">
                <h2>NEWS</h2>
                <button class="close-modal" onclick="document.getElementById('news-modal').remove()">&times;</button>
            </div>
            
            <!-- Blog Section -->
            <div class="news-section">
                <h3>Blog</h3>
                <div class="news-content">
                    <div class="blog-post">
                        <h4>The World of Cendrial: Origin Stories</h4>
                        <div class="post-meta">
                            <span class="post-date">March 15, 2023</span>
                            <span class="post-category">Worldbuilding</span>
                        </div>
                        <p>Explore the rich history behind the creation of Cendrial and how the four major kingdoms came to be. This deep dive into the lore reveals secrets about the ancient magic that shaped the land.</p>
                        <a href="#" class="read-more-btn">Read More</a>
                    </div>
                    
                    <div class="blog-post">
                        <h4>Character Spotlight: The Librarians of Lunas</h4>
                        <div class="post-meta">
                            <span class="post-date">February 28, 2023</span>
                            <span class="post-category">Characters</span>
                        </div>
                        <p>Meet the mysterious keepers of knowledge who maintain the grand libraries of Lunas Kingdom. Learn about their traditions, magical abilities, and the sacred oath they take to protect the written word.</p>
                        <a href="#" class="read-more-btn">Read More</a>
                    </div>
                </div>
            </div>
            
            <!-- Substack Section -->
            <div class="news-section">
                <h3>Substack</h3>
                <div class="news-content">
                    <div class="substack-info">
                        <p>Subscribe to our Substack newsletter for exclusive content, behind-the-scenes looks at the creative process, and early access to new chapters and artwork.</p>
                        <div class="substack-features">
                            <div class="feature">Weekly Updates</div>
                            <div class="feature">Exclusive Content</div>
                            <div class="feature">Author Notes</div>
                        </div>
                        <div class="substack-cta">
                            <p>Join our growing community of readers and get notified when new content is available.</p>
                            <button class="subscribe-btn">Subscribe Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add click event to close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add click event for the subscribe button
    const subscribeButton = modal.querySelector('.subscribe-btn');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', () => {
            window.open('https://crescentshire.substack.com/', '_blank');
        });
    }
    
    // Add click events for read more buttons
    const readMoreButtons = modal.querySelectorAll('.read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const postTitle = e.target.closest('.blog-post').querySelector('h4').textContent;
            showCustomAlert(`Full blog post "${postTitle}" coming soon!`);
        });
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
        
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

// Custom alert function
function showCustomAlert(message) {
    // Remove existing alert if any
    const existingAlert = document.getElementById('custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.id = 'custom-alert';
    alertElement.className = 'custom-alert';
    
    // Create alert content
    alertElement.innerHTML = `
        <div class="alert-content">
            <div class="alert-message">${message}</div>
            <button class="alert-button">OK</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(alertElement);
    
    // Add click event to close alert
    const okButton = alertElement.querySelector('.alert-button');
    okButton.addEventListener('click', () => {
        alertElement.remove();
    });
    
    // Close on click outside content
    alertElement.addEventListener('click', (e) => {
        if (e.target === alertElement) {
            alertElement.remove();
        }
    });
    
    // Animate alert appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(alertElement, 
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.inOut" }
        );
        
        const alertContent = alertElement.querySelector('.alert-content');
        gsap.fromTo(alertContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
        );
    }
}

function createCendrialModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('cendrial-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'cendrial-modal';
    modal.className = 'placeholder-modal';
    
    // Create modal content with Cendrial sections
    modal.innerHTML = `
        <div class="modal-content news-modal-content">
            <div class="modal-header">
                <h2>CENDRIAL</h2>
                <button class="close-modal" onclick="document.getElementById('cendrial-modal').remove()">&times;</button>
            </div>
            
            <!-- The Infernum Section -->
            <div class="news-section">
                <h3>The Infernum</h3>
                <div class="news-content">
                    <p>The Infernum is the fiery core of Cendrial, a realm of eternal flame and molten landscapes. Ancient beings of pure fire energy known as the Flamebringers dwell here, guarding the primordial heat that fuels the magical currents throughout all of Crescentshire.</p>
                    <p>Visitors to the Infernum must wear special enchanted garments to withstand the extreme temperatures. The rare minerals found in this region are highly sought after by alchemists and craftsmen for their unique magical properties.</p>
                </div>
            </div>
            
            <!-- The Wrath Section -->
            <div class="news-section">
                <h3>The Wrath</h3>
                <div class="news-content">
                    <p>The Wrath is a tempestuous region of violent storms and unpredictable weather patterns. Lightning strikes illuminate the perpetually dark skies, while powerful winds reshape the landscape daily. The Storm Callers, an ancient order of weather mages, have established their sanctuary at the eye of the eternal hurricane.</p>
                    <p>Despite its dangers, The Wrath is home to unique flora that thrive on electrical energy, producing luminescent fruits with remarkable healing properties.</p>
                </div>
            </div>
            
            <!-- Zi'ril Section -->
            <div class="news-section">
                <h3>Zi'ril</h3>
                <div class="news-content">
                    <p>Zi'ril is a crystalline forest where massive formations of living crystal grow and evolve over centuries. The crystals resonate with harmonic frequencies that can be heard as haunting melodies throughout the region. The Crystal Singers, a secretive society, have learned to communicate with these sentient formations.</p>
                    <p>The reflective surfaces of Zi'ril create dazzling light displays when touched by the sun, and it's said that those who meditate among the crystals can glimpse possible futures in their facets.</p>
                </div>
            </div>
            
            <!-- Vir'anaar Section -->
            <div class="news-section">
                <h3>Vir'anaar</h3>
                <div class="news-content">
                    <p>Vir'anaar is a vast floating archipelago of islands suspended in the sky by ancient magic. The inhabitants have developed a unique society centered around wind magic and aerial navigation. Massive airships travel between the floating islands, carrying goods and travelers.</p>
                    <p>The soil of Vir'anaar is infused with levitation magic, allowing for the cultivation of floating gardens and orchards. The Sky Wardens patrol the boundaries of this realm, protecting it from those who would exploit its resources.</p>
                </div>
            </div>
            
            <!-- Eris Section -->
            <div class="news-section">
                <h3>Eris</h3>
                <div class="news-content">
                    <p>Eris is a mysterious realm of shifting shadows and whispers, where reality itself seems malleable. The boundaries between dreams and waking life blur here, and visitors often report experiencing visions of their deepest desires or fears.</p>
                    <p>The Shadow Weavers, masters of illusion magic, make their home in Eris, studying the nature of perception and consciousness. It's rumored that hidden within the heart of Eris lies a library containing knowledge from all possible realities.</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add click event to close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
        
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function createDragonrealmModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('dragonrealm-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'dragonrealm-modal';
    modal.className = 'placeholder-modal';
    
    // Create modal content with Dragonrealm sections
    modal.innerHTML = `
        <div class="modal-content news-modal-content">
            <div class="modal-header">
                <h2>DRAGONREALM</h2>
                <button class="close-modal" onclick="document.getElementById('dragonrealm-modal').remove()">&times;</button>
            </div>
            
            <!-- Unknown Section -->
            <div class="news-section">
                <h3>Unknown</h3>
                <div class="news-content">
                    <p>The Unknown is a mysterious region of the Dragonrealm shrouded in perpetual mist. Ancient legends speak of lost civilizations and forgotten magic hidden within its boundaries. Few explorers have ventured into this enigmatic territory, and even fewer have returned with their sanity intact.</p>
                    <p>The mists are said to shift and change, revealing different landscapes each time one enters. Some scholars believe the Unknown exists partially in another dimension, explaining its ever-changing nature and the strange temporal anomalies experienced by those who wander too deep.</p>
                </div>
            </div>
            
            <!-- Disciples of Magic Section -->
            <div class="news-section">
                <h3>Disciples of Magic</h3>
                <div class="news-content">
                    <p>The Disciples of Magic are an ancient order of spellcasters who have formed a sacred covenant with the dragons of the realm. Through centuries of study and communion with these magnificent creatures, they have developed unique forms of magic that blend human ingenuity with draconic power.</p>
                    <p>Their grand academy, the Spire of Scaled Wisdom, rises from the center of a volcanic caldera. Here, promising students from across Crescentshire come to learn the secrets of draconic magic, elemental manipulation, and the ancient language of dragons. The Disciples maintain the delicate balance between human kingdoms and dragon territories, serving as diplomats and peacekeepers.</p>
                </div>
            </div>
            
            <!-- Dragon King Raz'lun Section -->
            <div class="news-section">
                <h3>Dragon King Raz'lun</h3>
                <div class="news-content">
                    <p>Raz'lun the Eternal Flame is the ancient Dragon King who rules over the Dragonrealm with wisdom and fierce protection. His scales shimmer with the colors of molten gold and ruby, and his eyes hold the knowledge of millennia. Born from the first volcanic eruption of Crescentshire, Raz'lun is said to be as old as the land itself.</p>
                    <p>From his throne atop Mount Cinderspire, Raz'lun oversees the council of Elder Dragons who govern the various dragon flights. Though rarely seen by human eyes, his decisions influence the entire continent. Once every century, he grants audience to worthy seekers, bestowing gifts of knowledge or enchanted dragon scales that can be forged into artifacts of immense power.</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add click event to close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Animate modal appearance
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.inOut" }
        );
        
        const modalContent = modal.querySelector('.modal-content');
        gsap.fromTo(modalContent,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}