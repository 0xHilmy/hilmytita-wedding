// Music Control
let musicToggle, backgroundMusic, playIcon, pauseIcon;
let isPlaying = false;
let musicInitialized = false;

function initMusicControl() {
    if (musicInitialized) return;

    musicToggle = document.getElementById('musicToggle');
    backgroundMusic = document.getElementById('backgroundMusic');
    playIcon = document.querySelector('.play-icon');
    pauseIcon = document.querySelector('.pause-icon');

    if (!musicToggle || !backgroundMusic || !playIcon || !pauseIcon) {
        console.log('Music elements not found, retrying...');
        setTimeout(initMusicControl, 100);
        return;
    }

    musicInitialized = true;

    // Detect Android for special handling
    const isAndroid = /Android/i.test(navigator.userAgent);
    console.log('Is Android:', isAndroid);

    if (isAndroid) {
        // Android-specific audio setup
        backgroundMusic.setAttribute('preload', 'auto');
        backgroundMusic.setAttribute('playsinline', '');
        backgroundMusic.setAttribute('webkit-playsinline', '');
    }

    // Function to play music
    function playMusic() {
        // Load audio first for better Android compatibility
        backgroundMusic.load();

        // Set volume to ensure it's audible
        backgroundMusic.volume = 0.7;

        const playPromise = backgroundMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                console.log('Music playing successfully');
            }).catch(err => {
                console.log('Error playing music:', err);
                console.log('Audio readyState:', backgroundMusic.readyState);
                console.log('Audio networkState:', backgroundMusic.networkState);

                // Try to load and play again after a short delay
                setTimeout(() => {
                    backgroundMusic.load();
                    backgroundMusic.play().then(() => {
                        isPlaying = true;
                        playIcon.style.display = 'none';
                        pauseIcon.style.display = 'block';
                        console.log('Music playing on retry');
                    }).catch(retryErr => {
                        console.log('Retry failed:', retryErr);
                        isPlaying = false;
                        playIcon.style.display = 'block';
                        pauseIcon.style.display = 'none';
                    });
                }, 500);
            });
        }
    }

    // Function to pause music
    function pauseMusic() {
        backgroundMusic.pause();
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        console.log('Music paused');
    }

    // Toggle music on button click
    musicToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Music button clicked, isPlaying:', isPlaying);

        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    // Also handle touch events separately for mobile
    musicToggle.addEventListener('touchend', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Preload audio for better performance on Android
    backgroundMusic.addEventListener('canplaythrough', function () {
        console.log('Audio can play through');
    });

    backgroundMusic.addEventListener('loadeddata', function () {
        console.log('Audio data loaded');
    });

    backgroundMusic.addEventListener('loadstart', function () {
        console.log('Audio load started');
    });

    backgroundMusic.addEventListener('loadedmetadata', function () {
        console.log('Audio metadata loaded');
    });

    backgroundMusic.addEventListener('error', function (e) {
        console.log('Audio error:', e);
        console.log('Audio error code:', backgroundMusic.error ? backgroundMusic.error.code : 'no error code');
    });

    // Try to preload the audio
    backgroundMusic.load();

    // Additional Android compatibility
    if (isAndroid) {
        // Force audio context creation on Android
        backgroundMusic.addEventListener('loadedmetadata', function () {
            console.log('Metadata loaded, duration:', backgroundMusic.duration);
            if (backgroundMusic.duration && backgroundMusic.duration > 0) {
                console.log('Audio file loaded successfully');
            }
        });
    }

    // Expose playMusic function globally for scroll handler
    window.playMusicOnScroll = function () {
        console.log('playMusicOnScroll called, isPlaying:', isPlaying);
        console.log('Audio readyState:', backgroundMusic.readyState);
        console.log('Audio networkState:', backgroundMusic.networkState);
        console.log('Audio paused:', backgroundMusic.paused);
        console.log('Audio currentTime:', backgroundMusic.currentTime);
        console.log('Audio duration:', backgroundMusic.duration);

        if (!isPlaying) {
            // Force reload for Android compatibility
            if (backgroundMusic.readyState < 2) {
                console.log('Audio not ready, forcing load...');
                backgroundMusic.load();
                backgroundMusic.addEventListener('canplay', function () {
                    console.log('Audio can play after load');
                    playMusic();
                }, { once: true });
            } else {
                playMusic();
            }
        }
    };

    console.log('Music control initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicControl);
} else {
    initMusicControl();
}

// Auto-hide address bar and navigation buttons on mobile
window.addEventListener('load', function () {
    // Scroll to hide address bar
    setTimeout(function () {
        window.scrollTo(0, 1);
    }, 0);

    // Request fullscreen on first user interaction
    let hasInteracted = false;
    const requestFullscreen = function () {
        if (hasInteracted) return;
        hasInteracted = true;

        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('Fullscreen request failed:', err);
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    };

    // Trigger on first touch or click
    document.addEventListener('touchstart', requestFullscreen, { once: true });
    document.addEventListener('click', requestFullscreen, { once: true });
});

// Keep address bar hidden on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop) {
        // Scrolling down - hide address bar
        window.scrollTo(0, 1);
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, false);

// Text transition on scroll gesture (without viewport movement)
let scrollProgress = 0;
let targetProgress = 0; // Target progress for smooth snapping
const transitionThreshold = 100; // pixels to scroll before transition
const maxScrollProgress = 12; // 0-12 for all sections

// Checkpoints for each section
const CHECKPOINTS = {
    TEXT_CONTENT_1: 0,      // Hari Bahagia Kami
    TEXT_CONTENT_2: 1,      // Pernikahan Hilmy & Tita
    QUOTE_SECTION: 2,       // Quote section
    BRIDE_SECTION: 3,       // Perkenalan Mempelai Wanita
    GROOM_SECTION: 4,       // Perkenalan Mempelai Pria
    AKAD_SECTION: 5,        // Acara Akad
    RESEPSI_SECTION: 6,     // Acara Resepsi
    STORY_1: 7,             // Story 1 - First Meeting
    STORY_2: 8,             // Story 2 - Perpisahan
    STORY_3: 9,             // Story 3 - Pertemuan Kembali
    STORY_4: 10,            // Story 4 - Pernikahan
    INVITATION_SECTION: 11, // Invitation Section
    GIFTS_SECTION: 12       // Gifts Section
};

// Track scroll gesture
let touchStartY = 0;
let touchCurrentY = 0;

function handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY;

    // Determine current checkpoint (snap to nearest)
    const checkpoints = [CHECKPOINTS.TEXT_CONTENT_1, CHECKPOINTS.TEXT_CONTENT_2, CHECKPOINTS.QUOTE_SECTION, CHECKPOINTS.BRIDE_SECTION, CHECKPOINTS.GROOM_SECTION, CHECKPOINTS.AKAD_SECTION, CHECKPOINTS.RESEPSI_SECTION, CHECKPOINTS.STORY_1, CHECKPOINTS.STORY_2, CHECKPOINTS.STORY_3, CHECKPOINTS.STORY_4, CHECKPOINTS.INVITATION_SECTION, CHECKPOINTS.GIFTS_SECTION];
    const currentCheckpoint = checkpoints.reduce((prev, curr) =>
        Math.abs(curr - scrollProgress) < Math.abs(prev - scrollProgress) ? curr : prev
    );

    // Play music on first scroll (any direction from first page)
    if (!hasPlayedMusicOnScroll && currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_1) {
        hasPlayedMusicOnScroll = true;
        console.log('Playing music on first scroll');
        if (window.playMusicOnScroll) {
            window.playMusicOnScroll();
        }
    }

    // Determine next checkpoint based on current checkpoint and direction
    let nextCheckpoint = currentCheckpoint;

    if (delta > 0) {
        // Scrolling down - move to next checkpoint
        if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_1) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_2;
        } else if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_2) {
            nextCheckpoint = CHECKPOINTS.QUOTE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.QUOTE_SECTION) {
            nextCheckpoint = CHECKPOINTS.BRIDE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.BRIDE_SECTION) {
            nextCheckpoint = CHECKPOINTS.GROOM_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.GROOM_SECTION) {
            nextCheckpoint = CHECKPOINTS.AKAD_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.AKAD_SECTION) {
            nextCheckpoint = CHECKPOINTS.RESEPSI_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.RESEPSI_SECTION) {
            nextCheckpoint = CHECKPOINTS.STORY_1;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_1) {
            nextCheckpoint = CHECKPOINTS.STORY_2;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_2) {
            nextCheckpoint = CHECKPOINTS.STORY_3;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_3) {
            nextCheckpoint = CHECKPOINTS.STORY_4;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_4) {
            nextCheckpoint = CHECKPOINTS.INVITATION_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.INVITATION_SECTION) {
            nextCheckpoint = CHECKPOINTS.GIFTS_SECTION;
        } else {
            // Already at max
            nextCheckpoint = CHECKPOINTS.GIFTS_SECTION;
        }
    } else {
        // Scrolling up - move to previous checkpoint
        if (currentCheckpoint === CHECKPOINTS.GIFTS_SECTION) {
            nextCheckpoint = CHECKPOINTS.INVITATION_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.INVITATION_SECTION) {
            nextCheckpoint = CHECKPOINTS.STORY_4;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_4) {
            nextCheckpoint = CHECKPOINTS.STORY_3;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_3) {
            nextCheckpoint = CHECKPOINTS.STORY_2;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_2) {
            nextCheckpoint = CHECKPOINTS.STORY_1;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_1) {
            nextCheckpoint = CHECKPOINTS.RESEPSI_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.RESEPSI_SECTION) {
            nextCheckpoint = CHECKPOINTS.AKAD_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.AKAD_SECTION) {
            nextCheckpoint = CHECKPOINTS.GROOM_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.GROOM_SECTION) {
            nextCheckpoint = CHECKPOINTS.BRIDE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.BRIDE_SECTION) {
            nextCheckpoint = CHECKPOINTS.QUOTE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.QUOTE_SECTION) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_2;
        } else if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_2) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_1;
        } else {
            // Already at min
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_1;
        }
    }

    // Smooth transition to checkpoint
    targetProgress = nextCheckpoint;
    animateToTarget();
}

function animateToTarget() {
    const diff = targetProgress - scrollProgress;
    const step = diff * 0.15; // Smoothing factor

    if (Math.abs(diff) > 0.01) {
        scrollProgress += step;
        updateTextTransition();
        requestAnimationFrame(animateToTarget);
    } else {
        scrollProgress = targetProgress;
        updateTextTransition();
    }
}

// Touch handlers
let touchStartProgress = 0;
let isTouching = false;
let lastTouchCheckpoint = -1; // Track last checkpoint triggered by touch
let hasPlayedMusicOnScroll = false; // Track if music has been played on scroll

function handleTouchStart(e) {
    if (!e.touches || e.touches.length === 0) return;

    touchStartY = e.touches[0].clientY;
    touchStartProgress = scrollProgress;
    isTouching = true;
    lastTouchCheckpoint = -1; // Reset checkpoint tracking
}

function handleTouchMove(e) {
    if (!isTouching) return;

    e.preventDefault();

    if (!e.touches || e.touches.length === 0) return;

    touchCurrentY = e.touches[0].clientY;
    const delta = touchStartY - touchCurrentY;
    // delta > 0: finger moved up = scroll down (next checkpoint)
    // delta < 0: finger moved down = scroll up (previous checkpoint)
    const minScrollDistance = 50; // Minimum distance to trigger checkpoint change

    // Check if we've scrolled enough to trigger checkpoint change
    if (Math.abs(delta) < minScrollDistance) {
        return; // Not enough movement yet
    }

    // Determine direction
    const isScrollingDown = delta > 0;

    // Determine current checkpoint (snap to nearest)
    const checkpoints = [CHECKPOINTS.TEXT_CONTENT_1, CHECKPOINTS.TEXT_CONTENT_2, CHECKPOINTS.QUOTE_SECTION, CHECKPOINTS.BRIDE_SECTION, CHECKPOINTS.GROOM_SECTION, CHECKPOINTS.AKAD_SECTION, CHECKPOINTS.RESEPSI_SECTION, CHECKPOINTS.STORY_1, CHECKPOINTS.STORY_2, CHECKPOINTS.STORY_3, CHECKPOINTS.STORY_4, CHECKPOINTS.INVITATION_SECTION, CHECKPOINTS.GIFTS_SECTION];
    const currentCheckpoint = checkpoints.reduce((prev, curr) =>
        Math.abs(curr - scrollProgress) < Math.abs(prev - scrollProgress) ? curr : prev
    );

    // Determine next checkpoint based on current checkpoint and direction
    let nextCheckpoint = currentCheckpoint;

    if (isScrollingDown) {
        // Scrolling down (swipe up) - move to next checkpoint
        if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_1) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_2;
        } else if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_2) {
            nextCheckpoint = CHECKPOINTS.QUOTE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.QUOTE_SECTION) {
            nextCheckpoint = CHECKPOINTS.BRIDE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.BRIDE_SECTION) {
            nextCheckpoint = CHECKPOINTS.GROOM_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.GROOM_SECTION) {
            nextCheckpoint = CHECKPOINTS.AKAD_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.AKAD_SECTION) {
            nextCheckpoint = CHECKPOINTS.RESEPSI_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.RESEPSI_SECTION) {
            nextCheckpoint = CHECKPOINTS.STORY_1;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_1) {
            nextCheckpoint = CHECKPOINTS.STORY_2;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_2) {
            nextCheckpoint = CHECKPOINTS.STORY_3;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_3) {
            nextCheckpoint = CHECKPOINTS.STORY_4;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_4) {
            nextCheckpoint = CHECKPOINTS.INVITATION_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.INVITATION_SECTION) {
            nextCheckpoint = CHECKPOINTS.GIFTS_SECTION;
        } else {
            nextCheckpoint = CHECKPOINTS.GIFTS_SECTION;
        }
    } else {
        // Scrolling up (swipe down) - move to previous checkpoint
        if (currentCheckpoint === CHECKPOINTS.GIFTS_SECTION) {
            nextCheckpoint = CHECKPOINTS.INVITATION_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.INVITATION_SECTION) {
            nextCheckpoint = CHECKPOINTS.STORY_4;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_4) {
            nextCheckpoint = CHECKPOINTS.STORY_3;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_3) {
            nextCheckpoint = CHECKPOINTS.STORY_2;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_2) {
            nextCheckpoint = CHECKPOINTS.STORY_1;
        } else if (currentCheckpoint === CHECKPOINTS.STORY_1) {
            nextCheckpoint = CHECKPOINTS.RESEPSI_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.RESEPSI_SECTION) {
            nextCheckpoint = CHECKPOINTS.AKAD_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.AKAD_SECTION) {
            nextCheckpoint = CHECKPOINTS.GROOM_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.GROOM_SECTION) {
            nextCheckpoint = CHECKPOINTS.BRIDE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.BRIDE_SECTION) {
            nextCheckpoint = CHECKPOINTS.QUOTE_SECTION;
        } else if (currentCheckpoint === CHECKPOINTS.QUOTE_SECTION) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_2;
        } else if (currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_2) {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_1;
        } else {
            nextCheckpoint = CHECKPOINTS.TEXT_CONTENT_1;
        }
    }

    // Only trigger if checkpoint changed
    if (nextCheckpoint !== lastTouchCheckpoint) {
        lastTouchCheckpoint = nextCheckpoint;
        // Update touch start position to prevent multiple triggers
        touchStartY = touchCurrentY;

        // Play music on first scroll (any direction from first page)
        if (!hasPlayedMusicOnScroll && currentCheckpoint === CHECKPOINTS.TEXT_CONTENT_1) {
            hasPlayedMusicOnScroll = true;
            console.log('Playing music on first swipe');
            if (window.playMusicOnScroll) {
                window.playMusicOnScroll();
            }
        }

        // Smooth transition to checkpoint
        targetProgress = nextCheckpoint;
        animateToTarget();
    }
}

function handleTouchEnd() {
    touchStartY = 0;
    touchCurrentY = 0;
    isTouching = false;
    // Snap to nearest checkpoint
    const checkpoints = [CHECKPOINTS.TEXT_CONTENT_1, CHECKPOINTS.TEXT_CONTENT_2, CHECKPOINTS.QUOTE_SECTION, CHECKPOINTS.BRIDE_SECTION, CHECKPOINTS.GROOM_SECTION, CHECKPOINTS.AKAD_SECTION, CHECKPOINTS.RESEPSI_SECTION, CHECKPOINTS.STORY_1, CHECKPOINTS.STORY_2, CHECKPOINTS.STORY_3, CHECKPOINTS.STORY_4, CHECKPOINTS.INVITATION_SECTION, CHECKPOINTS.GIFTS_SECTION];
    const nearestCheckpoint = checkpoints.reduce((prev, curr) =>
        Math.abs(curr - scrollProgress) < Math.abs(prev - scrollProgress) ? curr : prev
    );
    targetProgress = nearestCheckpoint;
    animateToTarget();
}

// Update text transition based on scroll progress
function updateTextTransition() {
    const textContent1 = document.querySelector('.text-content-1');
    const textContent2 = document.querySelector('.text-content-2');
    const dateBackground = document.querySelector('.date-background');
    const section2QuoteOverlay = document.querySelector('.section-2-quote-overlay');
    const section3BrideOverlay = document.querySelector('.section-3-bride-overlay');
    const section4GroomOverlay = document.querySelector('.section-4-groom-overlay');
    const section5AkadOverlay = document.querySelector('.section-5-akad-overlay');
    const section6ResepsiOverlay = document.querySelector('.section-6-resepsi-overlay');
    const section7StoryOverlay = document.querySelector('.section-7-story-overlay');
    const section8InvitationOverlay = document.querySelector('.section-8-invitation-overlay');
    const section9GiftsOverlay = document.querySelector('.section-9-gifts-overlay');

    if (!textContent1 || !textContent2) return;

    // Phase 1: text-content-1 to text-content-2 (scrollProgress 0-1)
    if (scrollProgress <= 1) {
        // Hide all other sections
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = '0';
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = '0';
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = '0';
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }

        // Transition between text-content-1 and text-content-2
        if (scrollProgress <= 0.5) {
            const fadeOutProgress = Math.min(1, (scrollProgress / 0.5));
            textContent1.style.opacity = Math.max(0, 1 - fadeOutProgress);
            textContent1.style.transform = `translate(-50%, calc(-35% - ${fadeOutProgress * 20}px))`;

            textContent2.style.opacity = 0;
            textContent2.style.transform = `translate(-50%, calc(-50% + 20px))`;
            textContent2.classList.remove('active');

            if (dateBackground) {
                dateBackground.style.opacity = 0.4 * Math.max(0, 1 - fadeOutProgress);
                if (fadeOutProgress > 0.5) {
                    dateBackground.style.visibility = 'hidden';
                    dateBackground.classList.add('hidden');
                } else {
                    dateBackground.style.visibility = 'visible';
                    dateBackground.classList.remove('hidden');
                }
            }
        } else {
            const fadeInProgress = Math.min(1, (scrollProgress - 0.5) / 0.5);
            textContent2.style.opacity = fadeInProgress;
            textContent2.style.transform = `translate(-50%, calc(-50% + ${(1 - fadeInProgress) * 20}px))`;

            textContent1.style.opacity = 0;
            textContent1.style.transform = `translate(-50%, calc(-35% - 20px))`;

            if (dateBackground) {
                dateBackground.style.opacity = 0;
                dateBackground.style.visibility = 'hidden';
                dateBackground.classList.add('hidden');
            }

            if (fadeInProgress > 0.3) {
                textContent2.classList.add('active');
            } else {
                textContent2.classList.remove('active');
            }
        }
    }
    // Phase 2: text-content-2 to quote section (scrollProgress 1-2)
    else if (scrollProgress <= 2) {
        // Hide text-content-1, bride and groom sections
        if (textContent1) {
            textContent1.style.opacity = 0;
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = '0';
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = '0';
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }

        const section2Progress = Math.min(1, (scrollProgress - 1) / 1);

        if (textContent2) {
            textContent2.style.opacity = Math.max(0, 1 - section2Progress);
            if (section2Progress > 0.3) {
                textContent2.classList.remove('active');
            }
        }

        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }

        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = section2Progress;
            if (section2Progress > 0.1) {
                section2QuoteOverlay.style.visibility = 'visible';
                section2QuoteOverlay.classList.add('active');
            } else {
                section2QuoteOverlay.style.visibility = 'hidden';
                section2QuoteOverlay.classList.remove('active');
            }
        }
    }
    // Phase 3: quote section to bride section (scrollProgress 2-3)
    else if (scrollProgress <= 3) {
        // Hide text-content-1, text-content-2, and groom section
        if (textContent1) {
            textContent1.style.opacity = 0;
        }
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = '0';
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }

        const section3Progress = Math.min(1, (scrollProgress - 2) / 1);

        // Fade out quote section
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = Math.max(0, 1 - section3Progress);
            if (section3Progress > 0.3) {
                section2QuoteOverlay.classList.remove('active');
                section2QuoteOverlay.style.visibility = 'hidden';
            }
        }

        // Fade in bride section
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = section3Progress;
            if (section3Progress > 0.1) {
                section3BrideOverlay.style.visibility = 'visible';
                section3BrideOverlay.classList.add('active');
            } else {
                section3BrideOverlay.style.visibility = 'hidden';
                section3BrideOverlay.classList.remove('active');
            }
        }
    }
    // Phase 4: bride section to groom section (scrollProgress 3-4)
    else if (scrollProgress <= 4) {
        // Hide all previous sections
        if (textContent1) {
            textContent1.style.opacity = 0;
        }
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = '0';
            section5AkadOverlay.style.visibility = 'hidden';
            section5AkadOverlay.classList.remove('active');
        }
        if (section6ResepsiOverlay) {
            section6ResepsiOverlay.style.opacity = '0';
            section6ResepsiOverlay.style.visibility = 'hidden';
            section6ResepsiOverlay.classList.remove('active');
        }

        const section4Progress = Math.min(1, (scrollProgress - 3) / 1);

        // Fade out bride section
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = Math.max(0, 1 - section4Progress);
            if (section4Progress > 0.3) {
                section3BrideOverlay.classList.remove('active');
                section3BrideOverlay.style.visibility = 'hidden';
            }
        }

        // Fade in groom section
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = section4Progress;
            if (section4Progress > 0.1) {
                section4GroomOverlay.style.visibility = 'visible';
                section4GroomOverlay.classList.add('active');
            } else {
                section4GroomOverlay.style.visibility = 'hidden';
                section4GroomOverlay.classList.remove('active');
            }
        }
    }
    // Phase 5: groom section to akad section (scrollProgress 4-5)
    else if (scrollProgress <= 5) {
        // Hide all previous sections
        if (textContent1) {
            textContent1.style.opacity = 0;
        }
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = 0;
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section6ResepsiOverlay) {
            section6ResepsiOverlay.style.opacity = '0';
            section6ResepsiOverlay.style.visibility = 'hidden';
            section6ResepsiOverlay.classList.remove('active');
        }

        const section5Progress = Math.min(1, (scrollProgress - 4) / 1);

        // Fade out groom section
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = Math.max(0, 1 - section5Progress);
            if (section5Progress > 0.3) {
                section4GroomOverlay.classList.remove('active');
                section4GroomOverlay.style.visibility = 'hidden';
            }
        }

        // Fade in akad section
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = section5Progress;
            if (section5Progress > 0.1) {
                section5AkadOverlay.style.visibility = 'visible';
                section5AkadOverlay.classList.add('active');
            } else {
                section5AkadOverlay.style.visibility = 'hidden';
                section5AkadOverlay.classList.remove('active');
            }
        }
    }
    // Phase 6: akad section to resepsi section (scrollProgress 5-6)
    else if (scrollProgress <= 6) {
        // Hide all previous sections
        if (textContent1) {
            textContent1.style.opacity = 0;
        }
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = 0;
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = 0;
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }
        if (section7StoryOverlay) {
            section7StoryOverlay.style.opacity = '0';
            section7StoryOverlay.style.visibility = 'hidden';
            section7StoryOverlay.classList.remove('active');
        }

        const section6Progress = Math.min(1, (scrollProgress - 5) / 1);

        // Fade out akad section
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = Math.max(0, 1 - section6Progress);
            if (section6Progress > 0.3) {
                section5AkadOverlay.classList.remove('active');
                section5AkadOverlay.style.visibility = 'hidden';
            }
        }

        // Fade in resepsi section
        if (section6ResepsiOverlay) {
            section6ResepsiOverlay.style.opacity = section6Progress;
            if (section6Progress > 0.1) {
                section6ResepsiOverlay.style.visibility = 'visible';
                section6ResepsiOverlay.classList.add('active');
            } else {
                section6ResepsiOverlay.style.visibility = 'hidden';
                section6ResepsiOverlay.classList.remove('active');
            }
        }
    }
    // Phase 7-10: Story sections (scrollProgress 6-10)
    else if (scrollProgress <= 10) {
        // Hide all previous sections
        if (textContent1) textContent1.style.opacity = 0;
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = 0;
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = 0;
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = 0;
            section5AkadOverlay.style.visibility = 'hidden';
            section5AkadOverlay.classList.remove('active');
        }

        // Show story section
        if (section7StoryOverlay) {
            section7StoryOverlay.style.opacity = 1;
            section7StoryOverlay.style.visibility = 'visible';
            section7StoryOverlay.classList.add('active');
        }

        // Fade out resepsi when entering story
        if (scrollProgress <= 7) {
            const fadeOutProgress = Math.min(1, (scrollProgress - 6) / 1);
            if (section6ResepsiOverlay) {
                section6ResepsiOverlay.style.opacity = Math.max(0, 1 - fadeOutProgress);
                if (fadeOutProgress > 0.3) {
                    section6ResepsiOverlay.classList.remove('active');
                    section6ResepsiOverlay.style.visibility = 'hidden';
                }
            }
        } else {
            if (section6ResepsiOverlay) {
                section6ResepsiOverlay.style.opacity = 0;
                section6ResepsiOverlay.style.visibility = 'hidden';
                section6ResepsiOverlay.classList.remove('active');
            }
        }

        // Show/hide story items based on scroll progress
        const storyItems = document.querySelectorAll('.timeline-item');

        if (scrollProgress >= 7 && scrollProgress < 8) {
            // Story 1 visible
            if (storyItems[0]) storyItems[0].style.opacity = 1;
            if (storyItems[1]) storyItems[1].style.opacity = 0;
            if (storyItems[2]) storyItems[2].style.opacity = 0;
            if (storyItems[3]) storyItems[3].style.opacity = 0;
        } else if (scrollProgress >= 8 && scrollProgress < 9) {
            // Story 1 & 2 visible
            if (storyItems[0]) storyItems[0].style.opacity = 1;
            if (storyItems[1]) storyItems[1].style.opacity = 1;
            if (storyItems[2]) storyItems[2].style.opacity = 0;
            if (storyItems[3]) storyItems[3].style.opacity = 0;
        } else if (scrollProgress >= 9 && scrollProgress < 10) {
            // Story 1, 2 & 3 visible
            if (storyItems[0]) storyItems[0].style.opacity = 1;
            if (storyItems[1]) storyItems[1].style.opacity = 1;
            if (storyItems[2]) storyItems[2].style.opacity = 1;
            if (storyItems[3]) storyItems[3].style.opacity = 0;
        } else if (scrollProgress >= 10) {
            // All stories visible
            if (storyItems[0]) storyItems[0].style.opacity = 1;
            if (storyItems[1]) storyItems[1].style.opacity = 1;
            if (storyItems[2]) storyItems[2].style.opacity = 1;
            if (storyItems[3]) storyItems[3].style.opacity = 1;
        }

        // Hide invitation section when in story
        if (section8InvitationOverlay) {
            section8InvitationOverlay.style.opacity = 0;
            section8InvitationOverlay.style.visibility = 'hidden';
            section8InvitationOverlay.classList.remove('active');
        }
    }
    // Phase 11: Invitation section (scrollProgress 10-11)
    else if (scrollProgress <= 11) {
        // Hide all previous sections
        if (textContent1) textContent1.style.opacity = 0;
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = 0;
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = 0;
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = 0;
            section5AkadOverlay.style.visibility = 'hidden';
            section5AkadOverlay.classList.remove('active');
        }
        if (section6ResepsiOverlay) {
            section6ResepsiOverlay.style.opacity = 0;
            section6ResepsiOverlay.style.visibility = 'hidden';
            section6ResepsiOverlay.classList.remove('active');
        }

        // Fade out story when entering invitation
        const fadeOutProgress = Math.min(1, (scrollProgress - 10) / 1);
        if (section7StoryOverlay) {
            section7StoryOverlay.style.opacity = Math.max(0, 1 - fadeOutProgress);
            if (fadeOutProgress > 0.3) {
                section7StoryOverlay.classList.remove('active');
                section7StoryOverlay.style.visibility = 'hidden';
            }
        }

        // Show invitation section
        if (section8InvitationOverlay) {
            section8InvitationOverlay.style.opacity = fadeOutProgress;
            if (fadeOutProgress > 0.1) {
                section8InvitationOverlay.style.visibility = 'visible';
                section8InvitationOverlay.classList.add('active');
            } else {
                section8InvitationOverlay.style.visibility = 'hidden';
                section8InvitationOverlay.classList.remove('active');
            }
        }

        // Hide gifts section
        if (section9GiftsOverlay) {
            section9GiftsOverlay.style.opacity = 0;
            section9GiftsOverlay.style.visibility = 'hidden';
            section9GiftsOverlay.classList.remove('active');
        }
    }
    // Phase 12: Gifts section (scrollProgress 11-12)
    else {
        // Hide all previous sections
        if (textContent1) textContent1.style.opacity = 0;
        if (textContent2) {
            textContent2.style.opacity = 0;
            textContent2.classList.remove('active');
        }
        if (dateBackground) {
            dateBackground.style.opacity = 0;
            dateBackground.style.visibility = 'hidden';
            dateBackground.classList.add('hidden');
        }
        if (section2QuoteOverlay) {
            section2QuoteOverlay.style.opacity = 0;
            section2QuoteOverlay.style.visibility = 'hidden';
            section2QuoteOverlay.classList.remove('active');
        }
        if (section3BrideOverlay) {
            section3BrideOverlay.style.opacity = 0;
            section3BrideOverlay.style.visibility = 'hidden';
            section3BrideOverlay.classList.remove('active');
        }
        if (section4GroomOverlay) {
            section4GroomOverlay.style.opacity = 0;
            section4GroomOverlay.style.visibility = 'hidden';
            section4GroomOverlay.classList.remove('active');
        }
        if (section5AkadOverlay) {
            section5AkadOverlay.style.opacity = 0;
            section5AkadOverlay.style.visibility = 'hidden';
            section5AkadOverlay.classList.remove('active');
        }
        if (section6ResepsiOverlay) {
            section6ResepsiOverlay.style.opacity = 0;
            section6ResepsiOverlay.style.visibility = 'hidden';
            section6ResepsiOverlay.classList.remove('active');
        }
        if (section7StoryOverlay) {
            section7StoryOverlay.style.opacity = 0;
            section7StoryOverlay.style.visibility = 'hidden';
            section7StoryOverlay.classList.remove('active');
        }

        // Fade out invitation when entering gifts
        const fadeOutProgress = Math.min(1, (scrollProgress - 11) / 1);
        if (section8InvitationOverlay) {
            section8InvitationOverlay.style.opacity = Math.max(0, 1 - fadeOutProgress);
            if (fadeOutProgress > 0.3) {
                section8InvitationOverlay.classList.remove('active');
                section8InvitationOverlay.style.visibility = 'hidden';
            }
        }

        // Show gifts section
        if (section9GiftsOverlay) {
            section9GiftsOverlay.style.opacity = fadeOutProgress;
            if (fadeOutProgress > 0.1) {
                section9GiftsOverlay.style.visibility = 'visible';
                section9GiftsOverlay.classList.add('active');
            } else {
                section9GiftsOverlay.style.visibility = 'hidden';
                section9GiftsOverlay.classList.remove('active');
            }
        }
    }
}

// Event listeners
window.addEventListener('wheel', handleWheel, { passive: false });
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    const textContent1 = document.querySelector('.text-content-1');
    const textContent2 = document.querySelector('.text-content-2');
    const dateBackground = document.querySelector('.date-background');
    const section2QuoteOverlay = document.querySelector('.section-2-quote-overlay');
    const section3BrideOverlay = document.querySelector('.section-3-bride-overlay');
    const section4GroomOverlay = document.querySelector('.section-4-groom-overlay');
    const section5AkadOverlay = document.querySelector('.section-5-akad-overlay');
    const section6ResepsiOverlay = document.querySelector('.section-6-resepsi-overlay');
    const section7StoryOverlay = document.querySelector('.section-7-story-overlay');
    const section8InvitationOverlay = document.querySelector('.section-8-invitation-overlay');
    const section9GiftsOverlay = document.querySelector('.section-9-gifts-overlay');

    if (textContent1) {
        textContent1.style.opacity = '1';
        textContent1.style.transform = 'translate(-50%, -35%)';
    }

    if (textContent2) {
        textContent2.style.opacity = '0';
        textContent2.style.transform = 'translate(-50%, calc(-50% + 20px))';
    }

    // Set initial opacity for date background
    if (dateBackground) {
        dateBackground.style.opacity = '0.4';
        dateBackground.style.visibility = 'visible';
    }

    // Hide section 2 quote overlay initially
    if (section2QuoteOverlay) {
        section2QuoteOverlay.style.opacity = '0';
        section2QuoteOverlay.style.visibility = 'hidden';
    }

    // Hide section 3 bride overlay initially
    if (section3BrideOverlay) {
        section3BrideOverlay.style.opacity = '0';
        section3BrideOverlay.style.visibility = 'hidden';
    }

    // Hide section 4 groom overlay initially
    if (section4GroomOverlay) {
        section4GroomOverlay.style.opacity = '0';
        section4GroomOverlay.style.visibility = 'hidden';
    }

    // Hide section 5 akad overlay initially
    if (section5AkadOverlay) {
        section5AkadOverlay.style.opacity = '0';
        section5AkadOverlay.style.visibility = 'hidden';
    }

    // Hide section 6 resepsi overlay initially
    if (section6ResepsiOverlay) {
        section6ResepsiOverlay.style.opacity = '0';
        section6ResepsiOverlay.style.visibility = 'hidden';
    }

    // Hide section 7 story overlay initially
    if (section7StoryOverlay) {
        section7StoryOverlay.style.opacity = '0';
        section7StoryOverlay.style.visibility = 'hidden';
    }

    // Hide section 8 invitation overlay initially
    if (section8InvitationOverlay) {
        section8InvitationOverlay.style.opacity = '0';
        section8InvitationOverlay.style.visibility = 'hidden';
    }

    // Hide section 9 gifts overlay initially
    if (section9GiftsOverlay) {
        section9GiftsOverlay.style.opacity = '0';
        section9GiftsOverlay.style.visibility = 'hidden';
    }

    // Initialize Leaflet maps with error handling
    try {
        // Map for Akad
        const mapAkadElement = document.getElementById('map-akad');
        if (mapAkadElement) {
            const mapAkad = L.map('map-akad').setView([-6.274257086583583, 106.69220286678616], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapAkad);
            L.marker([-6.274257086583583, 106.69220286678616]).addTo(mapAkad)
                .bindPopup('Kantor Kecamatan Pondok Aren')
                .openPopup();
        }

        // Map for Resepsi
        const mapResepsiElement = document.getElementById('map-resepsi');
        if (mapResepsiElement) {
            const mapResepsi = L.map('map-resepsi').setView([-6.237496005663578, 106.7351319519027], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapResepsi);
            L.marker([-6.237496005663578, 106.7351319519027]).addTo(mapResepsi)
                .bindPopup('Jl. Sdn Cipadu I No.12')
                .openPopup();
        }
    } catch (error) {
        console.error('Error initializing maps:', error);
    }

    // Lock scroll - all transitions through animation
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Background music handling
    const backgroundMusic = document.getElementById('backgroundMusic');

    if (backgroundMusic) {
        // Try to play music automatically
        const playPromise = backgroundMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Music started playing automatically');
            }).catch(error => {
                console.log('Autoplay prevented, waiting for user interaction:', error);
                // If autoplay is blocked, play on first user interaction
                const playOnInteraction = () => {
                    backgroundMusic.play().then(() => {
                        console.log('Music started after user interaction');
                    }).catch(err => {
                        console.error('Error playing music:', err);
                    });
                    // Remove listeners after first interaction
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                    document.removeEventListener('wheel', playOnInteraction);
                };

                document.addEventListener('click', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
                document.addEventListener('wheel', playOnInteraction);
            });
        }

        // Reload page when music ends (if not looping)
        backgroundMusic.addEventListener('ended', () => {
            console.log('Music ended, reloading page');
            location.reload();
        });
    }
});
