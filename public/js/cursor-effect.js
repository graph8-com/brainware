// cursor-effect.js - Cursor-following animation for Brainware website

document.addEventListener('DOMContentLoaded', function() {
    // Get the animation container or create it if it doesn't exist
    let animationContainer = document.getElementById('cursor-animation-container');
    
    if (!animationContainer) {
        // Create the container if it doesn't exist
        animationContainer = document.createElement('div');
        animationContainer.id = 'cursor-animation-container';
        animationContainer.className = 'fixed inset-0 w-full h-full pointer-events-none z-0';
        document.body.insertBefore(animationContainer, document.body.firstChild);
    }

    // Create a canvas element for particle animation
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    animationContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Mouse tracking
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let lastScrollY = window.scrollY;
    let mouseActive = false;
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = true;
    });
    
    document.addEventListener('mouseleave', () => {
        mouseActive = false;
    });
    
    // Update on scroll
    window.addEventListener('scroll', () => {
        // Calculate how much we've scrolled since last update
        const scrollDelta = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        
        // Only adjust if the mouse is active
        if (mouseActive) {
            // Move particles to follow scroll
            particles.forEach(p => {
                p.y -= scrollDelta;
                
                // Reposition particles that go off-screen due to scrolling
                if (p.y < -50) p.y = canvas.height + 50;
                if (p.y > canvas.height + 50) p.y = -50;
            });
        }
    });
    
    // Touch support for mobile
    document.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        mouseActive = true;
    });
    
    document.addEventListener('touchend', () => {
        mouseActive = false;
    });
    
    // Particle system
    const particles = [];
    const particleCount = 100;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: getRandomColor(),
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            alpha: Math.random() * 0.6 + 0.4,
            pulse: Math.random() * 0.02 + 0.01,
            pulseDelta: 0,
            connectionDistance: Math.random() * 50 + 100
        });
    }
    
    function getRandomColor() {
        const colors = ['#50E3C2', '#4A90E2', '#6C63FF', '#a3a8ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create central sphere effect that follows the cursor
        const centerX = mouseActive ? mouseX : canvas.width / 2;
        const centerY = mouseActive ? mouseY : canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.2;
        
        // Draw glowing central sphere
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(108, 99, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(74, 144, 226, 0.15)');
        gradient.addColorStop(1, 'rgba(80, 227, 194, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Update and draw particles
        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];
            
            // Pulse effect for particles
            p.pulseDelta += p.pulse;
            const pulseScale = 1 + 0.1 * Math.sin(p.pulseDelta);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            
            // Add subtle glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 2 * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * 0.3;
            ctx.fill();
            
            // Update position with gravitational pull to cursor or center
            const dx = centerX - p.x;
            const dy = centerY - p.y;
            const distToCenter = Math.sqrt(dx * dx + dy * dy);
            
            // Apply attraction to center/cursor
            if (distToCenter > radius) {
                // Stronger attraction when mouse is active
                const attractionStrength = mouseActive ? 0.03 : 0.01;
                p.speedX += dx / distToCenter * attractionStrength;
                p.speedY += dy / distToCenter * attractionStrength;
            } else if (mouseActive) {
                // If inside the radius and mouse is active, add some randomness
                // to make particles move more energetically around the cursor
                p.speedX += (Math.random() - 0.5) * 0.3;
                p.speedY += (Math.random() - 0.5) * 0.3;
            }
            
            // Add slight repulsion from cursor when very close to create swirling effect
            if (mouseActive && distToCenter < radius * 0.5) {
                p.speedX -= dx / distToCenter * 0.05;
                p.speedY -= dy / distToCenter * 0.05;
            }
            
            // Limit maximum speed
            const speed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
            if (speed > 1.5) {
                p.speedX = (p.speedX / speed) * 1.5;
                p.speedY = (p.speedY / speed) * 1.5;
            }
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off walls
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            // Draw connections
            for (let j = i + 1; j < particleCount; j++) {
                const p2 = particles[j];
                const distance = Math.sqrt(
                    Math.pow(p.x - p2.x, 2) + 
                    Math.pow(p.y - p2.y, 2)
                );
                
                const connectionDist = (p.connectionDistance + p2.connectionDistance) / 2;
                
                if (distance < connectionDist) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.globalAlpha = 0.2 * (1 - distance / connectionDist);
                    ctx.lineWidth = 0.5 * (1 - distance / connectionDist) * 2;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
