import { app, auth, analytics } from "./firebase-config.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
// Web Client ID: 770270512130-d6etuadjka1r619n9gg0cvrig0na3ao0.apps.googleusercontent.com

function logPortalAccess(location) {
    logEvent(analytics, 'portal_access_click', {
        click_location: location,
        timestamp: new Date().toISOString()
    });
}

// Authentication Logic
async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log('User signed in:', result.user);
    } catch (error) {
        console.error('Error during login:', error);
        alert('Failed to sign in. Please check if Google is enabled in your Firebase Console.');
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');

    if (user) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userAvatar.src = user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        userName.textContent = user.displayName;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('hero-lightpass');
    const context = canvas.getContext('2d');
    
    // Total frames defined by user request
    const frameCount = 232;
    
    // The path pattern for the images based on the provided directory listing
    // ezgif-frame-001.png to ezgif-frame-232.png
    const currentFrame = index => (
      `./assets/frames/ezgif-frame-${index.toString().padStart(3, '0')}.png`
    );

    const images = [];
    const airpods = {
        frame: 0
    };

    // --- 1. Preload Images ---
    let imagesLoaded = 0;
    
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i + 1);
        images.push(img);
        
        // Tracking load progress (optional: could add a loader UI here)
        img.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === 1) {
                // Determine size based on viewport
                resizeCanvas();
                // Draw first frame as soon as it's ready
                render();
            }
        };
    }

    // --- 2. Resize Canvas Handling ---
    function resizeCanvas() {
        // Set canvas internal resolution to match screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render(); // redraw on resize
    }
    
    window.addEventListener('resize', resizeCanvas);


    // --- 3. Render Function ---
    function render() {
        // Only render if image is present and loaded
        if (images[airpods.frame] && images[airpods.frame].complete) {
            
            // To ensure image covers the screen (object-fit: cover behavior in JS)
            const img = images[airpods.frame];
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio  = Math.max ( hRatio, vRatio );
            const centerShift_x = ( canvas.width - img.width*ratio ) / 2;
            const centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
            
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width*ratio, img.height*ratio);  
        }
    }


    // --- 4. Scroll Tracking & Animation Logic ---
    const scrollytellingContainer = document.querySelector('.scrollytelling-container');
    const sections = document.querySelectorAll('.scroll-section');
    const navbar = document.getElementById('navbar');
    
    // We update the positions based on container height
    let maxScroll = 0;
    
    function updateMaxScroll() {
        // Max scrollable area within the scrollytelling container
        // We subtract the window height because we stop scrolling when the bottom of the container hits the bottom of viewport
        maxScroll = scrollytellingContainer.offsetHeight - window.innerHeight;
    }
    
    window.addEventListener('resize', updateMaxScroll);
    updateMaxScroll();

    // Map scroll percentage to frame and section activations
    window.addEventListener('scroll', () => {
        // Need to calculate position relative to the scrollytelling container
        const containerRect = scrollytellingContainer.getBoundingClientRect();
        
        // If container is below viewport, we are at 0%. If it's above viewport completely, we're at 100%.
        // The effective scroll is how much of the container has passed the top of the viewport.
        let scrollY = -containerRect.top;
        
        // Clamp scrollY between 0 and maxScroll
        if (scrollY < 0) scrollY = 0;
        if (scrollY > maxScroll) scrollY = maxScroll;

        // Calculate scroll percentage (0 to 1)
        const scrollFraction = scrollY / maxScroll;
        
        // 1. Calculate frame index based on total frames (0 to 231)
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );
        
        // Update frame and render
        if(airpods.frame !== frameIndex) {
            airpods.frame = frameIndex;
            requestAnimationFrame(render);
        }

        // 2. Navigation bar logic (fades in after slight scroll)
        // Check window.scrollY for navbar regardless of container position
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 3. Section activation logic based on percentage mapped in HTML data attributes
        const percentage = scrollFraction * 100;
        
        sections.forEach(section => {
            const start = parseFloat(section.getAttribute('data-start'));
            const end = parseFloat(section.getAttribute('data-end'));
            
            // Set fixed positions for sections so they overlap in the center of the viewport
            // The sections are fixed to the viewport when within their range
            if (percentage >= start && percentage < end) {
                if(!section.classList.contains('active')) {
                   section.classList.add('active');
                   // Trigger stats fetch specifically when the stats section becomes active
                   if (section.id === 'section-2') {
                       fetchStats();
                   }
                }
                // Center the section on screen
                section.style.position = 'fixed';
                section.style.top = '0';
                section.style.left = '0';
            } else {
                if(section.classList.contains('active')) {
                    section.classList.remove('active');
                }
                
                // Position logic when not active
                if(percentage < start) {
                    section.style.position = 'absolute';
                    // Position at the top edge of its logical segment
                    section.style.top = `${(start / 100) * scrollytellingContainer.offsetHeight}px`;
                } else if (percentage >= end) {
                    section.style.position = 'absolute';
                     // Position at the bottom edge of its logical segment
                    section.style.top = `${(end / 100) * scrollytellingContainer.offsetHeight}px`;
                }
            }
        });
        
    });

    // --- 5. CDMS Integration & Live Stats ---
    function animateValue(obj, start, end, duration, suffix = "") {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;
            
            if (suffix === ' Days') {
                obj.innerHTML = value.toFixed(1) + suffix;
            } else {
                obj.innerHTML = Math.floor(value) + suffix;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    let statsFetched = false;

    async function fetchStats() {
        if (statsFetched) return;
        
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            const totalE = document.getElementById('stat-total');
            const activeE = document.getElementById('stat-active');
            const closedE = document.getElementById('stat-closed');
            const resE = document.getElementById('stat-resolution');

            animateValue(totalE, 0, stats.total || 0, 1500);
            animateValue(activeE, 0, stats.active || 0, 1500);
            animateValue(closedE, 0, stats.closed || 0, 1500);
            animateValue(resE, 0, parseFloat(stats.avg_resolution) || 61.3, 1500, " Days");
            
            statsFetched = true;
        } catch (error) {
            console.error('Error fetching stats from CDMS:', error);
            // Fallback with animation
            const totalE = document.getElementById('stat-total');
            const activeE = document.getElementById('stat-active');
            const closedE = document.getElementById('stat-closed');
            const resE = document.getElementById('stat-resolution');

            animateValue(totalE, 0, 20, 1500);
            animateValue(activeE, 0, 16, 1500);
            animateValue(closedE, 0, 4, 1500);
            animateValue(resE, 0, 61.3, 1500, " Days");
            
            statsFetched = true;
        }
    }

    // Portal Redirection
    document.querySelectorAll('.portal-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const location = link.innerText || 'button';
            logPortalAccess(location);
            window.location.href = 'portal.html';
        });
    });

    // Authentication Listeners
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Initial load
    fetchStats();
    window.dispatchEvent(new Event('scroll'));

});
