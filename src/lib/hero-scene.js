import * as THREE from 'three';

const isStaticTier = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || window.matchMedia('(max-width: 899px)').matches
    || window.matchMedia('(pointer: coarse)').matches
    || Boolean(connection?.saveData);
};

export class HeroScene {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector('#hero-canvas');
    this.inView = false;
    this.running = false;
    this.disposed = false;
    this.frame = 0;
    this.pointer = { x: 0, y: 0 };
    this.targetPointer = { x: 0, y: 0 };
    this.onVisibility = this.onVisibility.bind(this);
    this.onContextLost = this.onContextLost.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
  }

  mount() {
    if (isStaticTier() || !this.canvas) return this.fallback();

    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      this.camera.position.set(0, 0, 9.5);
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.createRings();
      this.createOrbits();
      this.resize();
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.root);
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.inView = entry.isIntersecting;
        if (this.inView && !document.hidden) this.start();
        else this.pause();
      }, { threshold: 0.08 });
      this.intersectionObserver.observe(this.root);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.canvas.addEventListener('webglcontextlost', this.onContextLost, { once: true });
      if (window.matchMedia('(pointer: fine)').matches) this.root.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.root.classList.add('is-webgl-ready');
    } catch {
      this.fallback();
    }
  }

  createRings() {
    const ribbons = [
      { color: 0x2174ff, radius: 2.65, tube: 0.25, arc: Math.PI * 1.42, rotation: [0.54, -0.34, -0.78], position: [-0.08, 0.08, 0.1] },
      { color: 0x20b6ff, radius: 2.12, tube: 0.15, arc: Math.PI * 1.08, rotation: [1.28, 0.64, 0.44], position: [0.12, -0.06, 0.42] },
      { color: 0x7865ff, radius: 1.66, tube: 0.18, arc: Math.PI * 1.36, rotation: [2.18, -0.42, 0.78], position: [0.02, 0.08, -0.25] }
    ];
    this.rings = ribbons.map((ribbon) => {
      const geometry = new THREE.TorusGeometry(ribbon.radius, ribbon.tube, 20, 120, ribbon.arc);
      const material = new THREE.MeshPhysicalMaterial({ color: ribbon.color, emissive: ribbon.color, emissiveIntensity: 0.17, transparent: true, opacity: 0.86, roughness: 0.13, metalness: 0.58, clearcoat: 1, clearcoatRoughness: 0.08 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(...ribbon.rotation);
      mesh.position.set(...ribbon.position);
      this.group.add(mesh);
      return mesh;
    });
    const light = new THREE.PointLight(0x4acfff, 22, 20, 2);
    light.position.set(3, 3, 4);
    this.scene.add(light);
    const violetLight = new THREE.PointLight(0x795eff, 11, 16, 2);
    violetLight.position.set(-3, -2, 3);
    this.scene.add(violetLight);
    this.scene.add(new THREE.AmbientLight(0x6075bf, 1.85));
  }

  createOrbits() {
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x4d9dff, transparent: true, opacity: 0.36 });
    this.orbits = [];
    for (let index = 0; index < 3; index += 1) {
      const curve = new THREE.EllipseCurve(0, 0, 3.15 + index * 0.36, 1.55 + index * 0.22, 0, Math.PI * 2, false, 0);
      const points = curve.getPoints(96).map((point) => new THREE.Vector3(point.x, point.y, -1.2 - index * 0.12));
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial.clone());
      line.rotation.set(index * 0.56, index * 0.28, -0.38 + index * 0.47);
      this.group.add(line);
      this.orbits.push(line);
    }
    const nodeGeometry = new THREE.SphereGeometry(0.075, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xd8f8ff });
    this.nodes = Array.from({ length: 12 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 12;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      node.userData.angle = angle;
      const scale = 0.55 + (index % 4) * 0.24;
      node.scale.setScalar(scale);
      node.position.set(Math.cos(angle) * (3.05 + (index % 3) * 0.22), Math.sin(angle) * (1.62 + (index % 2) * 0.22), -0.5);
      this.group.add(node);
      return node;
    });
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const { width, height } = this.root.getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  onPointerMove(event) {
    const bounds = this.root.getBoundingClientRect();
    this.targetPointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.08;
    this.targetPointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.06;
  }

  onVisibility() {
    if (document.hidden) this.pause();
    else if (this.inView) this.start();
  }

  onContextLost(event) {
    event.preventDefault();
    this.fallback();
  }

  start() {
    if (this.running || this.disposed || !this.renderer) return;
    this.running = true;
    this.startTime = performance.now();
    this.render();
  }

  pause() {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  render() {
    if (!this.running || !this.renderer) return;
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.045;
    this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.045;
    this.group.rotation.x = this.pointer.y + Math.sin(elapsed * 0.24) * 0.025;
    this.group.rotation.y = this.pointer.x + Math.cos(elapsed * 0.19) * 0.05;
    this.rings.forEach((ring, index) => { ring.rotation.z += (index % 2 ? -1 : 1) * 0.0016; });
    this.orbits.forEach((orbit, index) => { orbit.rotation.z += (index % 2 ? -1 : 1) * 0.0008; });
    this.nodes.forEach((node, index) => {
      const angle = node.userData.angle + elapsed * (0.09 + (index % 3) * 0.015);
      node.position.x = Math.cos(angle) * (3.05 + (index % 3) * 0.22);
      node.position.y = Math.sin(angle) * (1.62 + (index % 2) * 0.22);
    });
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(() => this.render());
  }

  fallback() {
    this.pause();
    this.root?.classList.remove('is-webgl-ready');
    this.dispose();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.pause();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.root?.removeEventListener('pointermove', this.onPointerMove);
    if (this.scene) {
      this.scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material?.dispose?.());
      });
    }
    this.renderer?.dispose();
  }
}
