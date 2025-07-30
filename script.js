document.addEventListener('DOMContentLoaded', () => {
    const darkOverlay = document.getElementById('darkOverlay');
    const initialScene = document.getElementById('initialScene');
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
    
    const controlsContainer = document.getElementById('controlsContainer');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const restartCakeBtn = document.getElementById('restartCakeBtn');
    const swipeInstruction = document.getElementById('swipeInstruction');

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
        const totalImages = imageUrls.length; 

        if (totalImages === 0) {
            if (callback) callback();
            return;
        }

        imageUrls.forEach(url => {
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

    // --- Preload images as soon as the DOM is ready ---
    preloadImages([...cakeAnimationFrames, cakeBlownOutFrame]);

    // Cake Animation
    function startCakeAnimation() {
        if (cakeAnimationInterval) clearInterval(cakeAnimationInterval);
        // Reset to initial state before starting
        candlesBlown = false;
        animatedCake.src = cakeAnimationFrames[0];
        blowCandlesText.classList.remove('faded');

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

        darkOverlay.classList.add('fade-out');
        darkOverlay.addEventListener('transitionend', () => {
            darkOverlay.classList.add('hidden');
            initialScene.classList.remove('hidden');
            initialScene.classList.add('visible');
            startCakeAnimation();
            toggleMusic(true);
            controlsContainer.classList.remove('hidden');
        }, { once: true });
    }

    function blowCandles() {
        if (candlesBlown) return;
        candlesBlown = true;

        stopCakeAnimation();
        animatedCake.src = cakeBlownOutFrame;
        blowCandlesText.classList.add('faded');
        
        triggerConfetti();

        setTimeout(() => {
            // This ensures the cake scene STAYS visible and the cards appear
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
        const isLastCard = currentCardIndex === allCards.length - 1;
        nextCardBtn.classList.toggle('hidden', isLastCard);
        
        // Toggle instructions
        swipeInstruction.classList.toggle('hidden', isLastCard);
        const enterInstruction = document.querySelector('.enter-instruction');
        if (enterInstruction) {
            // This needs to hide the parent form, not just the text
            const wishForm = document.getElementById('wishCardModal');
            wishForm.classList.toggle('hidden', !isLastCard);
        }
        
        if (isLastCard) {
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
        const wishForm = document.getElementById('wishCardModal');
        const wishInput = document.getElementById('wishInput');
        const userWish = wishInput.value.trim();

        if (userWish === "") return;

        const formData = new FormData(wishForm);

        fetch(wishForm.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                console.log("Wish sent!");
                // Add the sending class to the whole container to trigger the animation
                cardStackContainer.classList.add('sending');
            } else {
                console.error("Form submission failed.");
                alert("Sorry, your wish couldn't be sent right now.");
            }
        })
        .catch(error => {
            console.error("An error occurred:", error);
            alert("An error occurred while sending your wish.");
        });
    }

    // Swipe Gesture Handling
    function handleGesture() {
        const swipedX = touchendX - touchstartX;
        const swipedY = touchendY - touchstartY;
        const thresholdX = 50;
        const thresholdY = 100;

        if (Math.abs(swipedX) > Math.abs(swipedY) && Math.abs(swipedX) > thresholdX && Math.abs(swipedY) < thresholdY) {
            if (swipedX < 0) {
                navigateCard(1);
            } else {
                navigateCard(-1);
            }
        }
    }

    // --- Event Listeners ---
    darkOverlay.addEventListener('click', turnOnLight);
    initialScene.addEventListener('click', () => {
        if (isLightOn && !candlesBlown) blowCandles();
    });

    musicToggleBtn.addEventListener('click', () => toggleMusic(!isMusicPlaying));
    
    restartCakeBtn.addEventListener('click', () => {
        // Hide message cards, show initial scene, and restart animation
        cardStackContainer.classList.add('hidden');
        cardStackContainer.classList.remove('visible', 'sending');
        initialScene.classList.remove('hidden');
        startCakeAnimation();
    });

    prevCardBtn.addEventListener('click', () => navigateCard(-1));
    nextCardBtn.addEventListener('click', () => navigateCard(1));

    // The "tap to advance" code has been removed.

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
