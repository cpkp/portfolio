(function () {
  const systemEl = document.getElementById('solarSystem');
  if (!systemEl) return;

  // Config
  const iconAttr = systemEl.getAttribute('data-icons') || '/assets/icons/planet.svg';
  const iconList = iconAttr.split(',').map(s => s.trim()).filter(Boolean);
  const pickIcon = () => iconList[Math.floor(Math.random() * iconList.length)];
  const iconCount = 10;
  const minTilt = -30; // deg
  const maxTilt = 30; // deg
  const minRadius = 10; // vmin
  const radiusStep = 6; // vmin
  const radiusJitter = 1.75; // vmin
  const minSize = 3.2; // vmin
  const maxSize = 7.5; // vmin
  const minDuration = 14; // s
  const maxDuration = 60; // s

  // Build orbits
  for (let i = 0; i < iconCount; i++) {
    const orbit = document.createElement('div');
    orbit.className = 'orbit';

    // Keep the orbit planes not too vertical: limit tilts to ±30°
    const tiltX = randBetween(minTilt, maxTilt);
    const tiltY = randBetween(minTilt, maxTilt);

    orbit.style.setProperty('--tilt-x', `${tiltX}deg`);
    orbit.style.setProperty('--tilt-y', `${tiltY}deg`);

    const start = document.createElement('div');
    start.className = 'start';
    const startRot = randBetween(0, 360);
    start.style.setProperty('--start-rot', `${startRot}deg`);

    const revolve = document.createElement('div');
    revolve.className = 'revolve';

    const duration = randBetween(minDuration, maxDuration);
    revolve.style.setProperty('--duration', `${duration}s`);
    if (Math.random() < 0.5) revolve.style.animationDirection = 'reverse';

    const img = document.createElement('img');
    img.className = 'icon';
    img.src = pickIcon();
    img.alt = 'Orbiting icon';

    const radius = minRadius + i * radiusStep + randBetween(-radiusJitter, radiusJitter);
    const size = randBetween(minSize, maxSize);
    img.style.setProperty('--radius', `${radius}vmin`);
    img.style.setProperty('--size', `${size}vmin`);

    // Give each icon a slightly different hue to distinguish them
    const hue = Math.floor(randBetween(0, 360));
    img.style.filter = `hue-rotate(${hue}deg) drop-shadow(0 0.6vmin 1.2vmin rgba(0,0,0,0.45))`;

    revolve.appendChild(img);
    start.appendChild(revolve);
    orbit.appendChild(start);
    systemEl.appendChild(orbit);
  }

  // Subtle 3D parallax on pointer move
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    window.addEventListener('pointermove', (e) => {
      const rect = systemEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width; // ~[-0.5, 0.5]
      const dy = (e.clientY - cy) / rect.height;
      const maxTilt = 8; // deg
      const rx = clamp(-dy * maxTilt, -maxTilt, maxTilt);
      const ry = clamp(dx * maxTilt, -maxTilt, maxTilt);
      systemEl.style.setProperty('--mouse-tilt-x', `${ry}deg`);
      systemEl.style.setProperty('--mouse-tilt-y', `${rx}deg`);
    });
  }

  function randBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }
})();