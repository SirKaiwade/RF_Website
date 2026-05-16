import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const GLOBE_RADIUS = 100;

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, GLOBE_RADIUS * 2.7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    const globe = new ThreeGlobe()
      .globeImageUrl(
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      )
      .bumpImageUrl(
        'https://unpkg.com/three-globe/example/img/earth-topology.png'
      )
      .showAtmosphere(true)
      .atmosphereColor('#7CB6F2')
      .atmosphereAltitude(0.12);

    scene.add(globe);

    // Lighting — bright daytime earth
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 0.65);
    key.position.set(-100, 220, 360);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9bb8ff, 0.35);
    fill.position.set(220, -120, -260);
    scene.add(fill);

    globe.rotation.y = -Math.PI / 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.minPolarAngle = Math.PI / 2 - 0.4;
    controls.maxPolarAngle = Math.PI / 2 + 0.4;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const setMotionFromPref = () => {
      controls.autoRotate = !mql.matches;
    };
    setMotionFromPref();
    mql.addEventListener('change', setMotionFromPref);

    const onPointerDown = () => {
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerUp = () => {
      renderer.domElement.style.cursor = 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerUp);

    let raf = 0;
    const animate = () => {
      if (!active) return;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    requestAnimationFrame(() => {
      renderer.domElement.style.opacity = '1';
    });

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mql.removeEventListener('change', setMotionFromPref);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointerleave', onPointerUp);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else if (material) material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        userSelect: 'none',
        background: 'transparent',
        WebkitMaskImage:
          'radial-gradient(circle at 50% 50%, black 60%, black 70%, transparent 82%)',
        maskImage:
          'radial-gradient(circle at 50% 50%, black 60%, black 70%, transparent 82%)',
      }}
      aria-label="Rotating globe"
      role="img"
    />
  );
}
