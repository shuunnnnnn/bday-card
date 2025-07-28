document.addEventListener('DOMContentLoaded', () => {
    const darkOverlay = document.getElementById('darkOverlay');
    const cardContent = document.getElementById('cardContent');
    const birthdaySong = document.getElementById('birthdaySong');
    const blowCandlesText = document.getElementById('blowCandlesText');
    const animatedCake = document.getElementById('animatedCake');
    
    const cardStackContainer = document.getElementById('cardStackContainer');
    const allCards = document.querySelectorAll('.card-item'); 
    let currentCardIndex = 0; 

    const wishInput = document.getElementById('wishInput');
    const confettiContainer = document.getElementById('confettiContainer');

    const prevCardBtn = document.getElementById('prevCardBtn');
    const nextCardBtn = document.getElementById('nextCardBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');

    let isLightOn = false;
    let candlesBlown = false;
    let cakeAnimationInterval;
    let isMusicPlaying = false;
    
    // Variables for swipe controls
    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;
    let touchendY = 0;

    // Cake Animation Configuration
    const cakeAnimationFrames = ['part_1.png', 'part_2.png', 'part_3.png']; 
    const cakeBlownOutFrame = 'part_4.png'; 
    let currentFrameIndex = 0;
    const frameSpeed = 250;

    // Image Preloading
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        const allImagesToPreload = [...imageUrls, animatedCake.src]; 
        const totalImages = allImagesToPreload.length; 

        allImagesToPreload.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    if (callback) callback();
                }
            };
            img.src = url;
        });
    }

    // Cake Animation
    function startCakeAnimation() {
        if (cakeAnimationInterval) clearInterval(cakeAnimationInterval);
        cakeAnimationInterval = setInterval(() => {
            currentFrameIndex = (currentFrameIndex + 1) % cakeAnimationFrames.length;
            animatedCake.src = cakeAnimationFrames[currentFrameIndex];
        }, frameSpeed);
    }

    function stopCakeAnimation() {
        if (cakeAnimationInterval) {
            clearInterval(cakeAnimationInterval);
            cakeAnimationInterval = null;
        }
    }

    // Main Flow
    function turnOnLight() {
        if (isLightOn) return;
        isLightOn = true;

        preloadImages([...cakeAnimationFrames, cakeBlownOutFrame], () => {
            darkOverlay.classList.add('fade-out');
            darkOverlay.addEventListener('transitionend', () => {
                darkOverlay.classList.add('hidden');
                cardContent.classList.remove('hidden');
                cardContent.classList.add('visible');
                startCakeAnimation();
                toggleMusic(true);
                musicToggleBtn.classList.remove('hidden');
            }, { once: true });
        });
    }

    function blowCandles() {
        if (candlesBlown) return;
        candlesBlown = true;

        stopCakeAnimation();
        animatedCake.src = cakeBlownOutFrame;
        // Apply a fade effect instead of hiding to prevent layout shift
        blowCandlesText.classList.add('faded');
        
        triggerConfetti();

        setTimeout(() => {
            cardStackContainer.classList.remove('hidden'); 
            cardStackContainer.classList.add('visible');
            showCard(0);
        }, 1500); 
    }

    // Music Controls
    function toggleMusic(play) {
        const icon = musicToggleBtn.querySelector('i');
        birthdaySong.volume = 0.3; // Set fixed volume

        if (play) {
            isMusicPlaying = true;
            birthdaySong.play().catch(e => console.log("Audio play failed:", e));
            icon.classList.remove('fa-volume-off');
            icon.classList.add('fa-volume-up');
        } else {
            isMusicPlaying = false;
            birthdaySong.pause();
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-off');
        }
    }

    birthdaySong.addEventListener('ended', function() {
        if (isMusicPlaying) {
            this.currentTime = 0;
            this.play();
        }
    });

    // High-Contrast Confetti Logic
    function triggerConfetti() {
        const vibrantColors = ['#FFC700', '#FF003D', '#FF7A00', '#00A3FF', '#00C4A7'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.backgroundColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
            confettiContainer.appendChild(confetti);
        }
    }

    // Card Navigation
    function showCard(index) {
        allCards.forEach((card) => {
            card.classList.add('hidden');
            card.classList.remove('visible', 'card-exit-left', 'card-exit-right', 'card-enter-left', 'card-enter-right');
        });

        const currentCard = allCards[index];
        currentCard.classList.remove('hidden');
        currentCard.classList.add('visible');
        
        currentCardIndex = index;
        updateNavButtons();
    }

    function updateNavButtons() {
        prevCardBtn.classList.toggle('hidden', currentCardIndex === 0);
        nextCardBtn.classList.toggle('hidden', currentCardIndex === allCards.length - 1);
        const enterInstruction = document.querySelector('.enter-instruction');
        if (enterInstruction) {
            enterInstruction.classList.toggle('hidden', currentCardIndex !== allCards.length - 1);
        }
        if (currentCardIndex === allCards.length - 1) {
            wishInput.focus();
        }
    }

    function navigateCard(direction) {
        const newIndex = currentCardIndex + direction;
        if (newIndex < 0 || newIndex >= allCards.length) return;

        const currentCard = allCards[currentCardIndex];
        const nextCard = allCards[newIndex];

        currentCard.classList.add(direction === 1 ? 'card-exit-left' : 'card-exit-right');
        nextCard.classList.remove('hidden');
        nextCard.classList.add(direction === 1 ? 'card-enter-right' : 'card-enter-left');

        currentCard.addEventListener('animationend', () => {
            currentCard.classList.add('hidden');
        }, { once: true });

        currentCardIndex = newIndex;
        updateNavButtons();
    }
    
    // Send Wish
    function sendWish() {
        const userWish = wishInput.value.trim();
        console.log("[Flow] Wish submitted: " + userWish);

        const wishCard = document.getElementById('wishCardModal');
        wishCard.classList.add('sending');
        
        const enterInstruction = document.querySelector('.enter-instruction');
        if (enterInstruction) enterInstruction.classList.add('hidden'); 

        wishCard.addEventListener('animationend', () => {
            cardStackContainer.classList.add('hidden');
        }, { once: true });
    }

    // Swipe Gesture Handling
    function handleGesture() {
        const swipedX = touchendX - touchstartX;
        const swipedY = touchendY - touchstartY;
        const thresholdX = 50; // Minimum horizontal swipe distance
        const thresholdY = 100; // Maximum vertical swipe distance to avoid conflict with scrolling

        if (Math.abs(swipedX) > Math.abs(swipedY) && Math.abs(swipedX) > thresholdX && Math.abs(swipedY) < thresholdY) {
            if (swipedX < 0) {
                navigateCard(1); // Swiped left
            } else {
                navigateCard(-1); // Swiped right
            }
        }
    }

    // --- Event Listeners ---
    darkOverlay.addEventListener('click', turnOnLight);
    cardContent.addEventListener('click', () => {
        if (isLightOn && !candlesBlown) blowCandles();
    });

    musicToggleBtn.addEventListener('click', () => toggleMusic(!isMusicPlaying));
    prevCardBtn.addEventListener('click', () => navigateCard(-1));
    nextCardBtn.addEventListener('click', () => navigateCard(1));

    allCards.forEach((card, index) => {
        if (index < allCards.length - 1) { // Not for the last card
            card.addEventListener('click', (event) => {
                if (event.target === card || event.target.classList.contains('card-title') || event.target.classList.contains('card-message')) {
                     navigateCard(1);
                }
            });
        }
    });

    wishInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendWish();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!isLightOn && !darkOverlay.classList.contains('hidden')) {
            turnOnLight();
        }
    });
    
    // Add touch listeners for swipe
    cardStackContainer.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    }, false);

    cardStackContainer.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        handleGesture();
    }, false);
});