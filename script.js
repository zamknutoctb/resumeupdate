const sectionsContainer = document.getElementById('sections');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
const character = document.getElementById('character');
const menuLinks = document.querySelectorAll('.nav-menu a');

const frontLayers = document.querySelectorAll('.parallax-front');
const PARALLAX_SPEED = 0.5;

let isRunning = false;
let currentRunDirection = null;
let scrollTimeout = null;
let lastScrollLeft = 0;
let lastActiveIndex = 0;

// Горизонтальная прокрутка колёсиком мыши
sectionsContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    sectionsContainer.scrollLeft += e.deltaY;
});

function updateParallax() {
    if (!sectionsContainer) return;
    const scrollLeft = sectionsContainer.scrollLeft;
    frontLayers.forEach(layer => {
        const section = layer.closest('.section');
        if (!section) return;
        const sectionLeft = section.offsetLeft;
        const delta = (scrollLeft - sectionLeft) * PARALLAX_SPEED;
        layer.style.transform = `translateX(${-delta}px)`;
    });
}

function startRun(direction) {
    if (!character) return;
    if (isRunning && currentRunDirection === direction) return;
    character.classList.remove('idle', 'run-right', 'run-left');
    if (direction === 'left') {
        character.classList.add('run-left');
    } else if (direction === 'right') {
        character.classList.add('run-right');
    }
    isRunning = true;
    currentRunDirection = direction;
}

function stopRun() {
    if (!character) return;
    if (isRunning) {
        character.classList.remove('run-right', 'run-left');
        character.classList.add('idle');
        isRunning = false;
        currentRunDirection = null;
    }
}

function getScrollDirection() {
    if (!sectionsContainer) return null;
    const currentScroll = sectionsContainer.scrollLeft;
    if (currentScroll > lastScrollLeft) {
        return 'right';
    } else if (currentScroll < lastScrollLeft) {
        return 'left';
    }
    return null;
}

function getCurrentSectionIndex() {
    if (!sectionsContainer) return 0;
    const scrollLeft = sectionsContainer.scrollLeft;
    const sectionWidth = window.innerWidth;
    return Math.round(scrollLeft / sectionWidth);
}

function updateCharacterPosition() {
    if (!character) return;
    const activeIndex = getCurrentSectionIndex();
    const totalSections = document.querySelectorAll('.section').length;

    character.classList.remove('corner', 'center-bottom', 'right-bottom');

    if (activeIndex === 0) {
        character.classList.add('corner');
    } else if (activeIndex === totalSections - 1) {
        character.classList.add('right-bottom');
    } else {
        character.classList.add('center-bottom');
    }
}

function scrollToSection(index) {
    if (!sectionsContainer) return;
    const sectionWidth = window.innerWidth;
    sectionsContainer.scrollTo({
        left: index * sectionWidth,
        behavior: 'smooth'
    });
}

function onScroll() {
    if (!sectionsContainer) return;

    requestAnimationFrame(updateParallax);

    const direction = getScrollDirection();
    lastScrollLeft = sectionsContainer.scrollLeft;

    if (direction) {
        startRun(direction);
    }

    const currentIndex = getCurrentSectionIndex();
    if (currentIndex !== lastActiveIndex) {
        updateCharacterPosition();
        lastActiveIndex = currentIndex;
    }

    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
        stopRun();
        const finalIndex = getCurrentSectionIndex();
        if (finalIndex !== lastActiveIndex) {
            updateCharacterPosition();
            lastActiveIndex = finalIndex;
        }
    }, 150);
}

sectionsContainer.addEventListener('scroll', onScroll);

arrowLeft.addEventListener('click', () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
        startRun('left');
        scrollToSection(currentIndex - 1);
    }
});

arrowRight.addEventListener('click', () => {
    const currentIndex = getCurrentSectionIndex();
    const totalSections = document.querySelectorAll('.section').length;
    if (currentIndex < totalSections - 1) {
        startRun('right');
        scrollToSection(currentIndex + 1);
    }
});

menuLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const currentIndex = getCurrentSectionIndex();
        if (index > currentIndex) {
            startRun('right');
        } else if (index < currentIndex) {
            startRun('left');
        }
        scrollToSection(index);
    });
});

function updateActiveMenu() {
    if (!sectionsContainer) return;
    const scrollLeft = sectionsContainer.scrollLeft;
    const sectionWidth = window.innerWidth;
    const activeIndex = Math.round(scrollLeft / sectionWidth);

    menuLinks.forEach((link, index) => {
        if (index === activeIndex) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

sectionsContainer.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveMenu);
});

character.classList.add('idle', 'corner');
character.classList.remove('center-bottom', 'right-bottom');
lastActiveIndex = 0;

window.addEventListener('load', () => {
    updateActiveMenu();
    sectionsContainer.scrollLeft = 0;
    updateParallax();
    lastScrollLeft = 0;
    updateCharacterPosition();
});

window.addEventListener('resize', () => {
    updateParallax();
});