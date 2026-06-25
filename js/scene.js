/* ============================================================
   THREE.JS 3D BACKGROUND — FLOWING PARTICLE OCEAN
   Scroll-reactive journey through a luminous particle sea
   Camera orbits • Colors shift • Waves morph • Bokeh drifts
   Simple • Elegant • Mesmerizing • Scroll + Cursor reactive
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ---- Scene & Camera ----
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 25, 55);
  camera.lookAt(0, 0, 0);

  // ---- Mouse ----
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // ---- Scroll ----
  let scrollY = 0;
  let smoothScroll = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // Cache max scroll — recalculate only on resize, not every frame
  let cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  window.addEventListener('resize', () => {
    cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }, { passive: true });

  // ===========================================================
  // COLOR PALETTES PER SECTION (smooth transitions)
  // Hero=blue/cyan, About=purple/pink, Skills=teal/green,
  // Education=indigo/blue, Certificates=violet/rose,
  // Projects=cyan/emerald, Contact=warm purple/amber
  // ===========================================================

  const palettes = [
    // 0: Hero — cool electric blue + cyan
    { c1: new THREE.Color(0x38bdf8), c2: new THREE.Color(0x8b5cf6), c3: new THREE.Color(0x06b6d4), c4: new THREE.Color(0xc084fc) },
    // 1: About — deep purple + magenta
    { c1: new THREE.Color(0xa78bfa), c2: new THREE.Color(0xec4899), c3: new THREE.Color(0x8b5cf6), c4: new THREE.Color(0xf472b6) },
    // 2: Skills — teal + emerald
    { c1: new THREE.Color(0x06b6d4), c2: new THREE.Color(0x22c55e), c3: new THREE.Color(0x14b8a6), c4: new THREE.Color(0x38bdf8) },
    // 3: Education — indigo + blue
    { c1: new THREE.Color(0x6366f1), c2: new THREE.Color(0x38bdf8), c3: new THREE.Color(0x818cf8), c4: new THREE.Color(0x06b6d4) },
    // 4: Certificates — violet + rose
    { c1: new THREE.Color(0x8b5cf6), c2: new THREE.Color(0xf43f5e), c3: new THREE.Color(0xa78bfa), c4: new THREE.Color(0xfb7185) },
    // 5: Projects — cyan + emerald
    { c1: new THREE.Color(0x22d3ee), c2: new THREE.Color(0x10b981), c3: new THREE.Color(0x06b6d4), c4: new THREE.Color(0x34d399) },
    // 6: Contact — warm purple + amber
    { c1: new THREE.Color(0xc084fc), c2: new THREE.Color(0xf59e0b), c3: new THREE.Color(0xa78bfa), c4: new THREE.Color(0xfbbf24) },
  ];

  // ===========================================================
  // CAMERA KEYFRAMES — cinematic scroll journey
  // Each stop: { posX, posY, posZ, lookX, lookY, lookZ }
  // ===========================================================

  const cameraStops = [
    // Hero: overhead angled view
    { px: 0, py: 25, pz: 55, lx: 0, ly: 0, lz: 0 },
    // About: swing right, lower angle
    { px: 30, py: 18, pz: 45, lx: 5, ly: -2, lz: -10 },
    // Skills: orbit left, bird's eye
    { px: -25, py: 35, pz: 40, lx: -5, ly: 0, lz: -5 },
    // Education: zoom in, dramatic tilt
    { px: 10, py: 12, pz: 35, lx: 0, ly: -3, lz: -15 },
    // Certificates: wide sweep right
    { px: 35, py: 28, pz: 50, lx: 10, ly: 2, lz: 0 },
    // Projects: close and centered
    { px: -15, py: 15, pz: 30, lx: -5, ly: -5, lz: -20 },
    // Contact: grand pull-back overview
    { px: 0, py: 40, pz: 60, lx: 0, ly: 0, lz: -10 },
  ];

  // ===========================================================
  // WAVE PRESETS — different wave character per section
  // { speed, amplitude, frequency, turbulence }
  // ===========================================================

  const wavePresets = [
    // Hero: calm gentle ocean
    { speed: 0.3, amp: 1.8, freq: 0.06, turb: 0.5 },
    // About: slightly more active
    { speed: 0.35, amp: 2.0, freq: 0.07, turb: 0.7 },
    // Skills: energetic, tighter waves
    { speed: 0.45, amp: 2.2, freq: 0.08, turb: 0.9 },
    // Education: deep slow swells
    { speed: 0.2, amp: 2.5, freq: 0.05, turb: 0.4 },
    // Certificates: playful ripples
    { speed: 0.5, amp: 1.9, freq: 0.09, turb: 1.0 },
    // Projects: dynamic, fast
    { speed: 0.55, amp: 2.1, freq: 0.07, turb: 1.2 },
    // Contact: serene and grand
    { speed: 0.25, amp: 2.8, freq: 0.04, turb: 0.3 },
  ];

  // ===========================================================
  // PARTICLE WAVE GRID
  // ===========================================================

  // Reduce particle count on mobile for smooth performance
  const isMobile = window.innerWidth <= 768;
  const COLS = isMobile ? 60 : 120;
  const ROWS = isMobile ? 40 : 80;
  const SPACING = isMobile ? 2.0 : 1.0;
  const COUNT = COLS * ROWS;

  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const baseColors = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  const halfW = (COLS - 1) * SPACING * 0.5;
  const halfH = (ROWS - 1) * SPACING * 0.5;

  // Store grid coordinates for color recalculation
  const gridCoords = new Float32Array(COUNT * 2);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      
      // Add random jitter to prevent Moire/overlapping grid patterns when camera orbits
      const jitterX = (Math.random() - 0.5) * SPACING * 0.8;
      const jitterZ = (Math.random() - 0.5) * SPACING * 0.8;

      const x = col * SPACING - halfW + jitterX;
      const z = row * SPACING - halfH + jitterZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = z;

      gridCoords[i * 2] = col / COLS;
      gridCoords[i * 2 + 1] = row / ROWS;

      sizes[i] = 1.2 + Math.random() * 0.8;
    }
  }

  // Pre-allocate reusable THREE.Color objects to avoid GC pressure
  // (Previously created ~COUNT new Color objects per frame = massive GC stalls)
  const _tmpA = new THREE.Color();
  const _tmpB = new THREE.Color();
  const _botA = new THREE.Color();
  const _botB = new THREE.Color();

  // Track current section to skip redundant color recalculations
  let _lastSectionIndex = -1;
  let _lastSectionT = -1;

  // Initial colors
  updateColors(palettes[0]);

  function updateColors(pal) {
    for (let i = 0; i < COUNT; i++) {
      const tx = gridCoords[i * 2];
      const tz = gridCoords[i * 2 + 1];

      const top = _tmpA.copy(pal.c1).lerp(pal.c2, tx);
      _botA.copy(pal.c3).lerp(pal.c4, tx);
      top.lerp(_botA, tz);

      colors[i * 3] = top.r;
      colors[i * 3 + 1] = top.g;
      colors[i * 3 + 2] = top.b;
    }
  }

  // Blend between two palettes — zero allocations per call
  function blendColors(palA, palB, t) {
    for (let i = 0; i < COUNT; i++) {
      const tx = gridCoords[i * 2];
      const tz = gridCoords[i * 2 + 1];

      // Palette A
      const topA = _tmpA.copy(palA.c1).lerp(palA.c2, tx);
      _botA.copy(palA.c3).lerp(palA.c4, tx);
      topA.lerp(_botA, tz);

      // Palette B
      const topB = _tmpB.copy(palB.c1).lerp(palB.c2, tx);
      _botB.copy(palB.c3).lerp(palB.c4, tx);
      topB.lerp(_botB, tz);

      // Blend
      colors[i * 3] = topA.r + (topB.r - topA.r) * t;
      colors[i * 3 + 1] = topA.g + (topB.g - topA.g) * t;
      colors[i * 3 + 2] = topA.b + (topB.b - topA.b) * t;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // ---- Shaders (now with scroll-driven uniforms) ----
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uWaveSpeed;
    uniform float uWaveAmp;
    uniform float uWaveFreq;
    uniform float uTurbulence;
    uniform float uScrollRotation;

    void main() {
      vColor = color;

      vec3 pos = position;

      // ---- Scroll-driven rotation of the grid ----
      float angle = uScrollRotation;
      float cosA = cos(angle);
      float sinA = sin(angle);
      vec2 rotated = vec2(
        pos.x * cosA - pos.z * sinA,
        pos.x * sinA + pos.z * cosA
      );
      pos.x = rotated.x;
      pos.z = rotated.y;

      // ---- Wave displacement (scroll-reactive) ----
      float wave1 = sin(pos.x * uWaveFreq + uTime * uWaveSpeed) * uWaveAmp;
      float wave2 = cos(pos.z * (uWaveFreq * 0.75) + uTime * (uWaveSpeed * 0.7)) * (uWaveAmp * 0.8);
      float wave3 = sin((pos.x + pos.z) * (uWaveFreq * 0.6) + uTime * (uWaveSpeed * 0.5)) * (uWaveAmp * 0.6);
      float ripple = sin(length(pos.xz) * (uWaveFreq * 1.25) - uTime * (uWaveSpeed * 1.3)) * (uWaveAmp * 0.4);

      // Turbulence adds chaotic detail
      float turb = sin(pos.x * 0.3 + pos.z * 0.2 + uTime * 1.5) * uTurbulence * 0.3;

      pos.y = wave1 + wave2 + wave3 + ripple + turb;

      // ---- Mouse influence ----
      float mx = uMouse.x * 40.0;
      float mz = -uMouse.y * 25.0;
      float mouseDist = length(vec2(pos.x - mx, pos.z - mz));
      float mouseEffect = exp(-mouseDist * mouseDist * 0.003) * 5.0;
      pos.y += mouseEffect;

      // ---- Project ----
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      float dist = -mvPosition.z;

      float heightFactor = (pos.y + 5.0) / 14.0;
      vAlpha = clamp(heightFactor, 0.12, 1.0);

      float dynamicSize = size * (1.0 + heightFactor * 0.5);
      gl_PointSize = dynamicSize * (120.0 / dist);
      gl_PointSize = clamp(gl_PointSize, 0.5, 7.0);

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;

      float core = smoothstep(0.5, 0.0, dist);
      float glow = exp(-dist * dist * 8.0);
      float alpha = (core * 0.6 + glow * 0.4) * vAlpha;

      vec3 col = vColor * (0.8 + core * 0.7);

      gl_FragColor = vec4(col, alpha * 0.85);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uWaveSpeed: { value: 0.6 },
      uWaveAmp: { value: 2.5 },
      uWaveFreq: { value: 0.08 },
      uTurbulence: { value: 1.0 },
      uScrollRotation: { value: 0 },
    },
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ===========================================================
  // SOFT BOKEH LIGHTS
  // ===========================================================

  const bokehColors = [
    new THREE.Color(0x38bdf8),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0x06b6d4),
    new THREE.Color(0xa78bfa),
    new THREE.Color(0xf0abfc),
  ];

  const bokehData = [];

  for (let i = 0; i < 5; i++) {
    const sGeo = new THREE.SphereGeometry(3 + Math.random() * 4, 20, 20);
    const sMat = new THREE.MeshBasicMaterial({
      color: bokehColors[i],
      transparent: true,
      opacity: 0.015 + Math.random() * 0.015,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.set(
      (Math.random() - 0.5) * 80,
      3 + Math.random() * 8,
      (Math.random() - 0.5) * 50 - 10
    );
    scene.add(sphere);

    bokehData.push({
      mesh: sphere,
      baseX: sphere.position.x,
      baseY: sphere.position.y,
      baseZ: sphere.position.z,
      driftSpeedX: 0.1 + Math.random() * 0.3,
      driftSpeedY: 0.2 + Math.random() * 0.4,
      ampX: 5 + Math.random() * 10,
      ampY: 2 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: sMat.opacity,
      pulseSpeed: 0.5 + Math.random() * 1.0,
    });
  }

  // ===========================================================
  // INTERPOLATION HELPERS
  // ===========================================================

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstepJS(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  // ===========================================================
  // ANIMATION LOOP
  // ===========================================================

  const clock = new THREE.Clock();

  // Smooth values for scroll-driven params
  let sWaveSpeed = 0.6, sWaveAmp = 2.5, sWaveFreq = 0.08, sTurb = 1.0;
  let sCamPx = 0, sCamPy = 25, sCamPz = 55, sLookX = 0, sLookY = 0, sLookZ = 0;
  let sScrollRot = 0;

  // Framerate-independent adaptive lerp:
  // - baseFactor: minimum smoothing speed (gentle scrolling)
  // - Adapts faster when the gap is large (rapid scrolling)
  // - dt normalizes to ~60fps so behavior is consistent at any framerate
  function adaptiveLerp(current, target, baseFactor, dt) {
    const gap = Math.abs(target - current);
    // Scale factor up when gap is large (fast scroll), down when small (gentle)
    const adaptive = baseFactor + Math.min(gap * 0.15, 0.35);
    // Framerate-independent: 1 - (1-factor)^(dt*60) approximation
    const factor = 1 - Math.pow(1 - adaptive, dt * 60);
    return current + (target - current) * factor;
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05); // Cap dt to prevent huge jumps after tab switch

    // Smooth mouse (adaptive — snappy response to fast movement)
    mouse.sx = adaptiveLerp(mouse.sx, mouse.x, 0.06, dt);
    mouse.sy = adaptiveLerp(mouse.sy, mouse.y, 0.06, dt);

    // Smooth scroll — adaptive: gentle for slow scrolling, responsive for fast
    const scrollGap = Math.abs(scrollY - smoothScroll);
    const scrollFactor = 0.04 + Math.min(scrollGap * 0.00008, 0.25);
    const scrollLerp = 1 - Math.pow(1 - scrollFactor, dt * 60);
    smoothScroll += (scrollY - smoothScroll) * scrollLerp;

    // Snap if close enough (prevents infinite tiny updates)
    if (Math.abs(scrollY - smoothScroll) < 0.5) smoothScroll = scrollY;

    // ---- Scroll progress (0..1 over full page) ----
    const scrollProgress = Math.max(0, Math.min(1, smoothScroll / cachedMaxScroll));

    // ---- Map scroll to section index (0..6) ----
    const numSections = palettes.length;
    const sectionFloat = scrollProgress * (numSections - 1);
    const sectionIndex = Math.floor(sectionFloat);
    const sectionT = sectionFloat - sectionIndex;
    const nextIndex = Math.min(sectionIndex + 1, numSections - 1);

    // Smooth eased transition
    const easedT = smoothstepJS(sectionT);

    // ---- COLORS: only recalculate when section or blend factor actually changes ----
    const quantizedT = Math.round(easedT * 200) / 200; // 0.5% granularity for smooth fast-scroll
    if (sectionIndex !== _lastSectionIndex || quantizedT !== _lastSectionT) {
      _lastSectionIndex = sectionIndex;
      _lastSectionT = quantizedT;
      blendColors(palettes[sectionIndex], palettes[nextIndex], easedT);
      geo.attributes.color.needsUpdate = true;
    }

    // ---- WAVE PARAMS: interpolate between presets ----
    const wA = wavePresets[sectionIndex];
    const wB = wavePresets[nextIndex];
    const targetSpeed = lerp(wA.speed, wB.speed, easedT);
    const targetAmp = lerp(wA.amp, wB.amp, easedT);
    const targetFreq = lerp(wA.freq, wB.freq, easedT);
    const targetTurb = lerp(wA.turb, wB.turb, easedT);

    // Adaptive smooth approach — responds faster to rapid changes
    sWaveSpeed = adaptiveLerp(sWaveSpeed, targetSpeed, 0.04, dt);
    sWaveAmp = adaptiveLerp(sWaveAmp, targetAmp, 0.04, dt);
    sWaveFreq = adaptiveLerp(sWaveFreq, targetFreq, 0.04, dt);
    sTurb = adaptiveLerp(sTurb, targetTurb, 0.04, dt);

    mat.uniforms.uWaveSpeed.value = sWaveSpeed;
    mat.uniforms.uWaveAmp.value = sWaveAmp;
    mat.uniforms.uWaveFreq.value = sWaveFreq;
    mat.uniforms.uTurbulence.value = sTurb;

    // ---- SCROLL ROTATION: gentle grid rotation as you scroll ----
    // Set to 0 to completely prevent the waves from overlapping visually (Moire effect)
    const targetScrollRot = 0;
    sScrollRot += (targetScrollRot - sScrollRot) * 0.01;
    mat.uniforms.uScrollRotation.value = sScrollRot;

    // ---- CAMERA: interpolate between keyframe stops ----
    const cA = cameraStops[sectionIndex];
    const cB = cameraStops[nextIndex];
    const targetPx = lerp(cA.px, cB.px, easedT);
    const targetPy = lerp(cA.py, cB.py, easedT);
    const targetPz = lerp(cA.pz, cB.pz, easedT);
    const targetLx = lerp(cA.lx, cB.lx, easedT);
    const targetLy = lerp(cA.ly, cB.ly, easedT);
    const targetLz = lerp(cA.lz, cB.lz, easedT);

    // Adaptive camera smoothing — responsive to fast scrolls, silky for gentle ones
    sCamPx = adaptiveLerp(sCamPx, targetPx, 0.04, dt);
    sCamPy = adaptiveLerp(sCamPy, targetPy, 0.04, dt);
    sCamPz = adaptiveLerp(sCamPz, targetPz, 0.04, dt);
    sLookX = adaptiveLerp(sLookX, targetLx, 0.04, dt);
    sLookY = adaptiveLerp(sLookY, targetLy, 0.04, dt);
    sLookZ = adaptiveLerp(sLookZ, targetLz, 0.04, dt);

    camera.position.set(
      sCamPx + mouse.sx * 3,
      sCamPy + mouse.sy * 2,
      sCamPz
    );
    camera.lookAt(sLookX, sLookY, sLookZ);

    // ---- Time & mouse uniforms ----
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.set(mouse.sx, mouse.sy);

    // ---- BOKEH: drift + scroll-reactive opacity ----
    for (const b of bokehData) {
      b.mesh.position.x = b.baseX + Math.sin(t * b.driftSpeedX + b.phase) * b.ampX;
      b.mesh.position.y = b.baseY + Math.cos(t * b.driftSpeedY + b.phase) * b.ampY;
      // Pulse brighter during fast scroll
      const scrollVel = Math.abs(scrollY - smoothScroll) * 0.001;
      b.mesh.material.opacity = b.baseOpacity * (0.6 + Math.sin(t * b.pulseSpeed + b.phase) * 0.4) + scrollVel * 0.02;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ---- Resize ----
  // Debounce resize to avoid excessive recalculations during drag-resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  }, { passive: true });
})();
