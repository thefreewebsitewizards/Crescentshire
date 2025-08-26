// Constants and Configuration
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
        dataset: { realm: 'cendrial', label: 'Cendrial' },
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
const isDesktop = window.innerWidth > 768;
const ZOOM_STEP = 0.2;
const PAN_STEP = 50;

// DOM elements
const enterBtn = document.getElementById('enter-btn');
const landingScreen = document.getElementById('landing-screen');
const homePage = document.getElementById('home-page');
const portalContainer = document.getElementById('portal-container');
const burstContainer = document.querySelector('.burst-container');

// Initialize application
function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

function initializeApp() {
    // Initialize UI effects
    createMagicalParticles();
    
    // Initialize map logic
    initializeMap();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize pinpoint interactions if not using enhanced portal
    if (!portalContainer) {
        initializePinpointInteractions();
    }
}

// Consolidated event listener initialization
function initializeEventListeners() {
    // Landing screen enter button
    if (enterBtn) {
        enterBtn.addEventListener('click', handleEnterButtonClick);
    }
    
    // Prevent right-click on map
    document.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.map-container')) {
            e.preventDefault();
        }
    });
    
    // Mobile controls (if they exist)
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
        resetBtn: document.getElementById('reset-btn')
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
    }
}

// Start the application
init();