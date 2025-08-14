(function () {
  const systemEl = document.getElementById('solarSystem');
  if (!systemEl) return;

  // Config
  const iconAttr = systemEl.getAttribute('data-icons') || '/assets/icons/planet.svg';
  const iconList = iconAttr.split(',').map(s => s.trim()).filter(Boolean);
  const pickIcon = () => iconList[Math.floor(Math.random() * iconList.length)];
  const iconCount = 12;
  const minTiltDeg = -30;
  const maxTiltDeg = 30;
  const minRadiusVmin = 10;
  const radiusStepVmin = 6;
  const radiusJitterVmin = 1.75;
  const minSizeVmin = 3.2;
  const maxSizeVmin = 7.5;
  const minSpeed = 0.4; // deg/sec
  const maxSpeed = 18;  // deg/sec

  // Convert vmin to pixels for stable translate3d positioning
  function vminToPx(v) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const unit = Math.min(vw, vh) / 100;
    return v * unit;
  }

  const items = [];

  for (let i = 0; i < iconCount; i++) {
    const orbit = document.createElement('div');
    orbit.className = 'orbit';

    const tiltX = randBetween(minTiltDeg, maxTiltDeg) * Math.PI / 180;
    const tiltY = 0;

    const start = document.createElement('div');
    start.className = 'start';

    const revolve = document.createElement('div');
    revolve.className = 'revolve';

    const img = document.createElement('img');
    img.className = 'icon';
    img.src = pickIcon();
    img.alt = 'Orbiting icon';

    const radiusVmin = minRadiusVmin + i * radiusStepVmin + randBetween(-radiusJitterVmin, radiusJitterVmin);
    const sizeVmin = randBetween(minSizeVmin, maxSizeVmin);
    img.style.setProperty('--size', `${sizeVmin}vmin`);

    const hue = Math.floor(randBetween(0, 360));
    img.style.filter = `hue-rotate(${hue}deg) drop-shadow(0 0.6vmin 1.2vmin rgba(0,0,0,0.45))`;

    revolve.appendChild(img);
    start.appendChild(revolve);
    orbit.appendChild(start);
    systemEl.appendChild(orbit);

    const speedDegPerSec = randBetween(minSpeed, maxSpeed) * (Math.random() < 0.5 ? 1 : -1);
    const angleDeg = randBetween(0, 360);

    items.push({
      element: img,
      baseAngleDeg: angleDeg,
      speedDegPerSec,
      radiusVmin,
      sizeVmin,
      tiltX,
      tiltY
    });
  }

  // Animate using real 3D orbit math and depth-based brightness
  let lastTs = performance.now();
  function frame(ts) {
    const dt = Math.min(100, ts - lastTs) / 1000; // cap delta to avoid jumps
    lastTs = ts;

    const rect = systemEl.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const vminUnit = vminToPx(1);

    for (const item of items) {
      item.baseAngleDeg += item.speedDegPerSec * dt;
      const a = item.baseAngleDeg * Math.PI / 180;

      const rPx = item.radiusVmin * vminUnit;

      // Base orbit in XZ plane (around Y-axis)
      let x = Math.cos(a) * rPx;
      let z = Math.sin(a) * rPx;
      let y = 0;

      // Tilt plane around X by tiltX
      let y1 = -z * Math.sin(item.tiltX);
      let z1 =  z * Math.cos(item.tiltX);
      let x1 =  x;

      // Map to screen center, use translate3d for proper 3D stacking
      const px = cx + x1;
      const py = cy + y1;
      const pz = z1;

      item.element.style.width = `${item.sizeVmin}vmin`;
      item.element.style.height = `${item.sizeVmin}vmin`;
      item.element.style.transform = `translate3d(${px}px, ${py}px, ${pz}px) translate(-50%, -50%)`;

      // Depth shading: dim when far (negative z), full bright when near (positive z)
      const maxDepth = 400 * vminUnit / 100;
      const depthFactor = clamp(1 - (-pz / maxDepth), 0.55, 1);
      item.element.style.opacity = String(depthFactor);

      // Depth-based blur or size could be added here if desired
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Subtle 3D parallax on pointer move
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    window.addEventListener('pointermove', (e) => {
      const rect = systemEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const maxTilt = 8; // deg
      const rx = clamp(-dy * maxTilt, -maxTilt, maxTilt);
      const ry = clamp(dx * maxTilt, -maxTilt, maxTilt);
      systemEl.style.setProperty('--mouse-tilt-x', `${ry}deg`);
      systemEl.style.setProperty('--mouse-tilt-y', `${rx}deg`);
    });
  }

  function randBetween(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
})();