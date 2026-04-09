/**
 * mesh-gradient.js — WebGL mesh gradient effect for Hero + About sections
 * Lightweight vanilla implementation inspired by @paper-design/shaders
 */

'use strict';

function initMeshGradient() {
  // Skip on reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('meshGradientCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  // --- Shaders ---
  const vertSrc = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2 u_resolution;

    // Simplex-like hash
    vec3 hash3(vec2 p) {
      vec3 q = vec3(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3)),
        dot(p, vec2(419.2, 371.9))
      );
      return fract(sin(q) * 43758.5453);
    }

    // Smooth noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = dot(hash3(i + vec2(0.0, 0.0)).xy, f - vec2(0.0, 0.0));
      float b = dot(hash3(i + vec2(1.0, 0.0)).xy, f - vec2(1.0, 0.0));
      float c = dot(hash3(i + vec2(0.0, 1.0)).xy, f - vec2(0.0, 1.0));
      float d = dot(hash3(i + vec2(1.0, 1.0)).xy, f - vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float val = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        val += amp * noise(p);
        p *= 2.0;
        amp *= 0.5;
      }
      return val;
    }

    void main() {
      vec2 uv = v_uv;
      float t = u_time * 0.15;

      // Animated domain warping
      vec2 q = vec2(
        fbm(uv * 2.0 + vec2(t * 0.7, t * 0.3)),
        fbm(uv * 2.0 + vec2(t * 0.4, t * 0.8))
      );

      vec2 r = vec2(
        fbm(uv * 2.0 + 4.0 * q + vec2(1.7, 9.2) + t * 0.3),
        fbm(uv * 2.0 + 4.0 * q + vec2(8.3, 2.8) + t * 0.2)
      );

      float f = fbm(uv * 2.0 + 4.0 * r);

      // Color palette: dark blues, accent blue, subtle cyan
      vec3 col1 = vec3(0.035, 0.035, 0.055);   // Near black-blue
      vec3 col2 = vec3(0.051, 0.059, 0.118);    // Dark navy
      vec3 col3 = vec3(0.310, 0.557, 0.969);    // Accent blue (#4F8EF7)
      vec3 col4 = vec3(0.000, 0.898, 1.000);    // Cyan (#00E5FF)

      vec3 color = mix(col1, col2, clamp(f * 2.0, 0.0, 1.0));
      color = mix(color, col3, clamp(length(q) * 0.4, 0.0, 1.0) * 0.15);
      color = mix(color, col4, clamp(r.x * 0.3, 0.0, 1.0) * 0.06);

      // Subtle vignette
      float vignette = 1.0 - length(uv - 0.5) * 0.6;

      // Output with low opacity for subtle effect
      float alpha = 0.55 * vignette;
      gl_FragColor = vec4(color * vignette, alpha);
    }
  `;

  // --- Compile shaders ---
  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vert = createShader(gl.VERTEX_SHADER, vertSrc);
  const frag = createShader(gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return;

  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // --- Geometry: fullscreen quad ---
  const posAttr = gl.getAttribLocation(program, 'a_position');
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  // --- Uniforms ---
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes  = gl.getUniformLocation(program, 'u_resolution');

  // --- Resize ---
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5); // limit for perf
    canvas.width  = canvas.clientWidth  * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // --- Render loop ---
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let animId = null;
  const startTime = performance.now();

  function render() {
    const elapsed = (performance.now() - startTime) / 1000;
    gl.uniform1f(uTime, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animId = requestAnimationFrame(render);
  }

  // --- Visibility: stop when off-screen ---
  const heroSection = document.getElementById('hero');
  const aboutSection = document.getElementById('about');

  function isAnyVisible(entries) {
    return entries.some(e => e.isIntersecting);
  }

  let heroVisible = true, aboutVisible = false;

  const visObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.target.id === 'hero') heroVisible = e.isIntersecting;
      if (e.target.id === 'about') aboutVisible = e.isIntersecting;
    });

    if (heroVisible || aboutVisible) {
      if (!animId) render();
    } else {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    }
  }, { threshold: 0 });

  if (heroSection) visObs.observe(heroSection);
  if (aboutSection) visObs.observe(aboutSection);

  render();
}

document.addEventListener('DOMContentLoaded', initMeshGradient);
