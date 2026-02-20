import { useEffect, useRef } from "react";
import * as THREE from "three";

const U_SPEED = 0.001;
const FOG_COLOR = 0xf02050;

function mathRandom(num = 8) {
  return -Math.random() * num + Math.random() * num;
}

export function LoginBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cityRef = useRef<THREE.Object3D | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const carsRef = useRef<Array<{ mesh: THREE.Mesh; axis: "x" | "z"; from: number; to: number; duration: number; startTime: number }>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setClearColor(FOG_COLOR, 1);
    if (width > 800) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.domElement.className = "login-bg-canvas";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(20, width / height, 1, 500);
    camera.position.set(0, 2, 14);
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(FOG_COLOR);
    scene.fog = new THREE.Fog(FOG_COLOR, 10, 16);
    sceneRef.current = scene;

    const city = new THREE.Object3D();
    const smoke = new THREE.Object3D();
    const town = new THREE.Object3D();

    let setTintNum = true;
    function setTintColor() {
      setTintNum = !setTintNum;
      return 0x000000;
    }

    const segments = 2;
    for (let i = 1; i < 100; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
      const material = new THREE.MeshStandardMaterial({
        color: setTintColor(),
        wireframe: false,
        side: THREE.DoubleSide,
      });
      const wmaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.03,
        side: THREE.DoubleSide,
      });

      const cube = new THREE.Mesh(geometry, material);
      const floor = new THREE.Mesh(geometry, material);
      const wfloor = new THREE.Mesh(geometry, wmaterial);

      cube.add(wfloor);
      cube.castShadow = true;
      cube.receiveShadow = true;

      floor.scale.y = 0.05;
      cube.scale.y = 0.1 + Math.abs(mathRandom(8));
      const cubeWidth = 0.9;
      cube.scale.x = cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth);
      cube.position.x = Math.round(mathRandom());
      cube.position.z = Math.round(mathRandom());
      floor.position.set(cube.position.x, 0, cube.position.z);

      town.add(floor);
      town.add(cube);
    }

    const gmaterial = new THREE.MeshToonMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const gparticular = new THREE.CircleGeometry(0.01, 3);
    const aparticular = 5;
    for (let h = 1; h < 300; h++) {
      const particular = new THREE.Mesh(gparticular, gmaterial);
      particular.position.set(mathRandom(aparticular), mathRandom(aparticular), mathRandom(aparticular));
      particular.rotation.set(mathRandom(), mathRandom(), mathRandom());
      smoke.add(particular);
    }

    const pmaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      shininess: 30,
      specular: 0x222222,
      opacity: 0.9,
      transparent: true,
    });
    const pgeometry = new THREE.PlaneGeometry(60, 60);
    const pelement = new THREE.Mesh(pgeometry, pmaterial);
    pelement.rotation.x = (-90 * Math.PI) / 180;
    pelement.position.y = -0.001;
    pelement.receiveShadow = true;

    city.add(pelement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    const lightFront = new THREE.SpotLight(0xffffff, 20, 10);
    const lightBack = new THREE.PointLight(0xffffff, 0.5);

    lightFront.rotation.x = (45 * Math.PI) / 180;
    lightFront.rotation.z = (-45 * Math.PI) / 180;
    lightFront.position.set(5, 5, 5);
    lightFront.castShadow = true;
    lightFront.shadow.mapSize.width = 6000;
    lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width;
    lightFront.penumbra = 0.1;
    lightBack.position.set(0, 6, 0);

    smoke.position.y = 2;

    scene.add(ambientLight);
    city.add(lightFront);
    scene.add(lightBack);
    scene.add(city);
    city.add(smoke);
    city.add(town);

    const gridHelper = new THREE.GridHelper(60, 120, 0xff0000, 0x000000);
    city.add(gridHelper);

    function createCar(cScale = 2, cPos = 20, cColor = 0xffff00) {
      const cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide });
      const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40);
      const cElem = new THREE.Mesh(cGeo, cMat);
      const cAmp = 3;

      if (Math.random() > 0.5) {
        cElem.position.x = -cPos;
        cElem.position.z = mathRandom(cAmp);
        carsRef.current.push({
          mesh: cElem,
          axis: "x",
          from: -cPos,
          to: cPos,
          duration: 3000,
          startTime: Date.now() + mathRandom(3000),
        });
      } else {
        cElem.position.x = mathRandom(cAmp);
        cElem.position.z = -cPos;
        cElem.rotation.y = (90 * Math.PI) / 180;
        carsRef.current.push({
          mesh: cElem,
          axis: "z",
          from: -cPos,
          to: cPos,
          duration: 5000,
          startTime: Date.now() + mathRandom(3000),
        });
      }
      cElem.receiveShadow = true;
      cElem.castShadow = true;
      cElem.position.y = Math.abs(mathRandom(5));
      city.add(cElem);
    }

    for (let i = 0; i < 60; i++) {
      createCar(0.1, 20, i % 3 === 0 ? 0xffffff : 0xffff00);
    }

    cityRef.current = city;

    function onWindowResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function onMouseMove(event: MouseEvent) {
      event.preventDefault();
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length === 1) {
        event.preventDefault();
        mouseRef.current.x = (event.touches[0].pageX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseRef.current.y = (event.touches[0].pageY - window.innerHeight / 2) / (window.innerHeight / 2);
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (event.touches.length === 1) {
        event.preventDefault();
        mouseRef.current.x = (event.touches[0].pageX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouseRef.current.y = (event.touches[0].pageY - window.innerHeight / 2) / (window.innerHeight / 2);
      }
    }

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("touchstart", onTouchStart, false);
    window.addEventListener("touchmove", onTouchMove, false);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      const mouse = mouseRef.current;

      city.rotation.y -= (mouse.x * 8 - camera.rotation.y) * U_SPEED;
      city.rotation.x -= (-(mouse.y * 2) - camera.rotation.x) * U_SPEED;
      city.rotation.x = Math.max(-0.05, Math.min(1, city.rotation.x));

      smoke.rotation.y += 0.01;
      smoke.rotation.x += 0.01;

      const now = Date.now();
      for (const car of carsRef.current) {
        const elapsed = (now - car.startTime) % (car.duration * 2);
        const t = elapsed < car.duration ? elapsed / car.duration : 2 - elapsed / car.duration;
        const pos = car.from + t * (car.to - car.from);
        if (car.axis === "x") car.mesh.position.x = pos;
        else car.mesh.position.z = pos;
      }

      camera.lookAt(city.position);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      cityRef.current = null;
      carsRef.current = [];
    };
  }, []);

  return (
    <div className="login-bg login-bg-three disable-selection" aria-hidden ref={containerRef} />
  );
}
