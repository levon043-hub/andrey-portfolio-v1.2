/**
 * hero-shader.js — Three.js WebGL Shader Ring Animation
 * Replaces particles.js for Hero section
 * Version 1.2 — tinted to accent colour #4F8EF7 / #00E5FF
 */

'use strict';

function initHeroShader() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('hero-shader: Three.js not loaded');
    return;
  }

  /* ── Renderer (reuse existing canvas) ─────────────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas:    canvas,
    antialias: true,
    alpha:     true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  /* ── Scene / Camera ────────────────────────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.Camera();
  camera.position.z = 1;

  /* ── Fullscreen quad ───────────────────────────────────── */
  const geometry = new THREE.PlaneGeometry(2, 2);

  /* ── Uniforms ──────────────────────────────────────────── */
  const uniforms = {
    time:       { value: 1.0 },
    resolution: { value: new THREE.Vector2() },
  };

  /* ── Vertex shader ─────────────────────────────────────── */
  const vertexShader = /* glsl */ `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `;

  /* ── Fragment shader ───────────────────────────────────── */
  /* Original ring logic from the prompt, colour-shifted to   */
  /* match the site accent: #4F8EF7 (blue) + #00E5FF (cyan)   */
  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform vec2  resolution;
    uniform float time;

    void main(void) {
      vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
      float t        = time * 0.05;
      float lineWidth = 0.0025;

      /* Accumulate RGB ring channels */
      vec3 raw = vec3(0.0);
      for (int j = 0; j < 3; j++) {
        for (int i = 0; i < 5; i++) {
          raw[j] += lineWidth * float(i * i) / abs(
            fract(t - 0.01 * float(j) + float(i) * 0.012) * 5.0
            - length(uv)
            + mod(uv.x + uv.y, 0.2)
          );
        }
      }

      /* Remap channels toward accent palette:
         raw[0] → purple / violet  (#7C6CF7-ish)
         raw[1] → cyan             (#00E5FF-ish)
         raw[2] → accent blue      (#4F8EF7-ish)     */
      float r = raw[0] * 0.45 + raw[2] * 0.31;
      float g = raw[0] * 0.25 + raw[1] * 0.85 + raw[2] * 0.56;
      float b = raw[0] * 0.90 + raw[1] * 0.95 + raw[2] * 0.97;

      /* Subtle dark vignette toward the edges */
      float vignette = 1.0 - smoothstep(0.5, 1.4, length(uv));

      gl_FragColor = vec4(vec3(r, g, b) * vignette, 1.0);
    }
  `;

  /* ── Material ──────────────────────────────────────────── */
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  /* ── Resize ────────────────────────────────────────────── */
  const onResize = () => {
    const w = canvas.offsetWidth  || 1;
    const h = canvas.offsetHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.resolution.value.set(
      renderer.domElement.width,
      renderer.domElement.height
    );
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);
  onResize();

  /* ── Animation loop ────────────────────────────────────── */
  let animId = null;

  const animate = () => {
    animId = requestAnimationFrame(animate);
    uniforms.time.value += 0.05;
    renderer.render(scene, camera);
  };

  /* ── Pause when Hero is off-screen ─────────────────────── */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const visObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animId) animate();
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      });
    }, { threshold: 0 });
    visObs.observe(heroSection);
  }

  /* ── Pause when tab is hidden ──────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    } else {
      if (!animId) animate();
    }
  });

  animate();
}

document.addEventListener('DOMContentLoaded', initHeroShader);
