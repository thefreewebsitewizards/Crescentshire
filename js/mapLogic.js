// Map initialization and navigation logic

function initializeMap() {
    const mapWrapper = document.getElementById('map-wrapper');
    
    if (!mapWrapper) return;
    
    if (!isDesktop) {
        panzoomInstance = panzoom(mapWrapper, {
            maxZoom: 3,
            minZoom: 0.5,
            bounds: true,
            boundsPadding: 0.1,
            contain: 'outside',
            smoothScroll: false,
            zoomDoubleClickSpeed: 1,
            beforeWheel: function(e) {
                const shouldIgnore = !e.ctrlKey;
                return shouldIgnore;
            },
            beforeMouseDown: function(e) {
                return e.shiftKey;
            }
        });
        
        currentPanzoomInstance = panzoomInstance;
        
        // Double-click zoom
        mapWrapper.addEventListener('dblclick', (e) => {
            panzoomInstance.zoomIn({ focal: { x: e.clientX, y: e.clientY } });
        });
    }
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
            
            // Set dataset attributes
            Object.keys(data.dataset).forEach(key => {
                pinpoint.dataset[key] = data.dataset[key];
            });
            
            // Set style
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

// Clear current pinpoints
function clearCurrentPinpoints() {
    const pinpoints = document.querySelectorAll('.pinpoint');
    pinpoints.forEach(pin => pin.remove());
}

// Create main map pinpoints
function createMainMapPinpoints() {
    restoreOriginalPinpoints();
}

// Enhanced transition to second level with mobile responsiveness
function transitionToSecondLevel(realm, label) {
    const mapContainer = document.getElementById('map-container');
    const mapWrapper = document.getElementById('map-wrapper');
    const mapImage = document.querySelector('#map-wrapper img');
    
    // Update navigation history
    navigationHistory.push(label);
    currentLevel = 'second';
    
    // Create magical transition
    createLevelTransitionEffect();
    
    // Mobile-responsive animation values
    const isMobile = window.innerWidth <= 768;
    const scaleValue = isMobile ? 1.8 : 2.5;
    const xOffset = isMobile ? -150 : -300;
    const yOffset = isMobile ? 150 : 300;
    const duration = isMobile ? 1.2 : 1.5;
    
    if (typeof gsap !== 'undefined') {
        if (realm === 'queensrealm') {
            // Special smooth zoom-in transition for Queensrealm
            gsap.timeline()
                .to(mapWrapper, {
                    scale: scaleValue,
                    x: xOffset,
                    y: yOffset,
                    duration: duration,
                    ease: "power2.inOut"
                })
                .to(mapWrapper, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Switch to Queensrealm map
                    mapImage.src = 'assets/Cendrial.png';
                    
                    // Clear current pinpoints
                    clearCurrentPinpoints();
                    
                    // Create second level pinpoints
                    createSecondLevelPinpoints(realm);
                    
                    // Show return button and update breadcrumb
                    showReturnButton();
                    updateBreadcrumb();
                    
                    // Reset transform for new map
                    gsap.set(mapWrapper, { scale: 1, x: 0, y: 0 });
                })
                .to(mapWrapper, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "bounce.out"
                });
        } else {
            // Standard transition for other realms
            gsap.timeline()
                .to(mapWrapper, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .call(() => {
                    // Handle other realm transitions
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
                    ease: "power2.inOut"
                });
        }
    }
}

function handleOtherRealmTransition(realm, mapImage) {
    switch(realm) {
        case 'dragonrealm':
            // Keep main map for now, could add specific dragon realm map later
            break;
        case 'socials':
            // Keep main map for socials
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

// Return to main map function
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
                // Reset to main map image
                mapImage.src = 'assets/home-map (1).png';
                
                // Remove any themes
                removeTheme();
                
                // Clear current pinpoints
                clearCurrentPinpoints();
                
                // Restore original HTML pinpoints
                restoreOriginalPinpoints();
                
                // Reset navigation
                navigationHistory = ['Home'];
                currentLevel = 'main';
                updateBreadcrumb();
                hideReturnButton();
                
                // Reset any zoom/pan transformations
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
    }
    
    breadcrumb.innerHTML = navigationHistory.map((item, index) => {
        const isLast = index === navigationHistory.length - 1;
        return `
            <span class="breadcrumb-item ${isLast ? 'active' : 'clickable'}" 
                  data-level="${index}">${item}</span>
        `;
    }).join(' > ');
    
    // Add click handlers for breadcrumb navigation
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
    }
    // Add more level navigation logic as needed
}

function showReturnButton() {
    let returnBtn = document.getElementById('return-main-btn');
    
    if (!returnBtn) {
        returnBtn = document.createElement('button');
        returnBtn.id = 'return-main-btn';
        returnBtn.className = 'return-button';
        returnBtn.innerHTML = '<i class="fi fi-ss-arrow-left"></i> Return to Main Map';
        document.body.appendChild(returnBtn);
        
        // Add click handler
        returnBtn.addEventListener('click', returnToMainMap);
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

// Consolidated pinpoint interactions
function initializePinpointInteractions() {
    const pinpoints = document.querySelectorAll('.pinpoint');
    
    pinpoints.forEach(pin => {
        // Remove any existing listeners to prevent duplicates
        pin.replaceWith(pin.cloneNode(true));
    });
    
    // Re-select pinpoints after cloning
    const freshPinpoints = document.querySelectorAll('.pinpoint');
    
    freshPinpoints.forEach(pin => {
        pin.addEventListener('click', (e) => {
            e.preventDefault();
            
            const realm = pin.dataset.realm;
            const label = pin.dataset.label;
            
            createMagicalSparkles(pin);
            createPinpointBurst(pin);
            
            handleMainLevelClick(pin, realm, label);
        });
        
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

// Handle main level clicks
function handleMainLevelClick(pin, realm, label) {
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

// Create second level pinpoints
function createSecondLevelPinpoints(realm) {
    // Implementation depends on your specific second level data
    // This is a placeholder that you can customize
    console.log(`Creating second level pinpoints for: ${realm}`);
}

// Transition to third level
function transitionToThirdLevel(realm) {
    console.log(`Transitioning to third level: ${realm}`);
    // Add your third level transition logic here
}

// Handle sub-level clicks
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