/**
 * particles.js — анимированные частицы на canvas в секции Hero
 */

function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  // Не запускаем при prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const CONFIG = {
    count:          isMobile ? 30  : 60,
    maxDist:        isMobile ? 80  : 130,
    speed:          0.4,
    dotRadius:      1.5,
    dotColor:       '79,142,247',
    lineColor:      '79,142,247',
    dotOpacity:     0.6,
    lineOpacityMax: 0.15,
  };

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = initial
        ? Math.random() * canvas.height
        : Math.random() < 0.5 ? 0 : canvas.height;
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      // Минимальная скорость чтобы частицы не замирали
      if (Math.abs(this.vx) < 0.1) this.vx = 0.1 * Math.sign(this.vx || 1);
      if (Math.abs(this.vy) < 0.1) this.vy = 0.1 * Math.sign(this.vy || 1);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // Выход за границы — появляемся с другой стороны
      if (this.x < 0)              this.x = canvas.width;
      if (this.x > canvas.width)   this.x = 0;
      if (this.y < 0)              this.y = canvas.height;
      if (this.y > canvas.height)  this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, CONFIG.dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.dotColor}, ${CONFIG.dotOpacity})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: CONFIG.count }, () => new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDist) {
          const opacity = CONFIG.lineOpacityMax * (1 - dist / CONFIG.maxDist);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${opacity})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Пересчитываем при изменении размера секции
  const ro = new ResizeObserver(() => {
    resize();
    init();
  });
  ro.observe(canvas);

  resize();
  init();
  animate();

  // Останавливаем анимацию когда Hero не виден — экономия ресурсов
  const heroSection = document.getElementById('hero');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  }, { threshold: 0 });

  observer.observe(heroSection);
}

document.addEventListener('DOMContentLoaded', initParticles);
