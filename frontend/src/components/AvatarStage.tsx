import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import type { MouthShape } from "../hooks/useVoiceAgent";

type AvatarStageProps = {
  audioLevel: number;
  speaking: boolean;
  mouthShape?: MouthShape;
  modelUrl?: string;
};

type ProceduralAvatar = {
  root: THREE.Group;
  mouth: THREE.Mesh;
  jaw: THREE.Mesh;
  lips: THREE.Mesh;
};

export function AvatarStage({ audioLevel, speaking, mouthShape = "neutral", modelUrl }: AvatarStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioLevelRef = useRef(audioLevel);
  const speakingRef = useRef(speaking);
  const mouthShapeRef = useRef<MouthShape>(mouthShape);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    mouthShapeRef.current = mouthShape;
  }, [mouthShape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const element = container;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.05, 4.15);
    camera.lookAt(0, 0.55, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x07100d, 0.16);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    element.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xcefbe6, 3.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight(0x9ddcff, 0x08100d, 1.8));

    const ring = createEnergyRing();
    scene.add(ring);

    const procedural = createProceduralAvatar();
    scene.add(procedural.root);

    let vrm: VRM | null = null;
    let disposed = false;

    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));
      loader.load(modelUrl, (gltf) => {
        if (disposed) return;
        const loaded = gltf.userData.vrm as VRM | undefined;
        if (!loaded) return;
        VRMUtils.rotateVRM0(loaded);
        procedural.root.visible = false;
        vrm = loaded;
        vrm.scene.position.set(0, -1.15, 0);
        scene.add(vrm.scene);
      });
    }

    const clock = new THREE.Clock();
    let smoothLevel = 0;

    function resize() {
      const width = Math.max(1, element.clientWidth);
      const height = Math.max(1, element.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function animate() {
      if (disposed) return;
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const target = speakingRef.current ? audioLevelRef.current : 0;
      smoothLevel += (target - smoothLevel) * 0.28;
      const shape = mouthShapeRef.current;
      const weights = getMouthWeights(shape, smoothLevel);

      ring.rotation.z += delta * 0.18;
      ring.rotation.y = Math.sin(elapsed * 0.32) * 0.08;

      if (vrm) {
        vrm.expressionManager?.setValue("aa", weights.aa);
        vrm.expressionManager?.setValue("ih", weights.ih);
        vrm.expressionManager?.setValue("ou", weights.ou);
        vrm.expressionManager?.setValue("ee", weights.ee);
        vrm.expressionManager?.setValue("oh", weights.oh);
        vrm.expressionManager?.update();
        vrm.scene.rotation.y = Math.sin(elapsed * 0.55) * 0.04;
        vrm.update(delta);
      } else {
        procedural.root.rotation.y = Math.sin(elapsed * 0.55) * 0.08;
        procedural.root.position.y = Math.sin(elapsed * 1.2) * 0.025;
        procedural.mouth.scale.y = 0.16 + weights.open * 2.55;
        procedural.mouth.scale.x = 0.72 + weights.wide * 0.72;
        procedural.lips.scale.x = 0.72 + weights.round * 0.42 + weights.wide * 0.24;
        procedural.lips.scale.y = 0.18 + weights.open * 1.6;
        procedural.jaw.position.y = -0.31 - weights.open * 0.11;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    animate();

    return () => {
      disposed = true;
      observer.disconnect();
      renderer.dispose();
      element.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) {
          object.geometry.dispose();
        }
        if ("material" in object) {
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else if (material instanceof THREE.Material) material.dispose();
        }
      });
    };
  }, [modelUrl]);

  return (
    <div className="relative h-[360px] min-h-[320px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#07100d]/80 sm:h-[460px] lg:h-[560px]">
      <CssAvatarFallback audioLevel={audioLevel} speaking={speaking} mouthShape={mouthShape} visible={webglFailed} />
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-accent/15 bg-black/25 px-4 py-3 text-xs font-bold text-accent backdrop-blur-xl">
        {webglFailed ? "CSS fallback lip-sync" : modelUrl ? "VRM blendshape lip-sync" : "Procedural 3D lip-sync"}
      </div>
    </div>
  );
}

function createProceduralAvatar(): ProceduralAvatar {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xd7f4e8, roughness: 0.48, metalness: 0.05 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x07100d, roughness: 0.7 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x5cf2b2, roughness: 0.35, emissive: 0x133d2c });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 48), skin);
  head.scale.set(0.86, 1.05, 0.78);
  head.position.y = 1.08;
  root.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.42, 32), skin);
  neck.position.y = 0.22;
  root.add(neck);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 0.9, 12, 36), dark);
  body.position.y = -0.62;
  body.scale.set(1.05, 0.95, 0.62);
  root.add(body);

  const visor = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.018, 12, 80), accent);
  visor.position.set(0, 1.2, 0.62);
  visor.scale.set(1.25, 0.22, 0.08);
  root.add(visor);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), accent);
  leftEye.position.set(-0.24, 1.23, 0.66);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.24;
  root.add(leftEye, rightEye);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.055, 0.03), dark);
  mouth.position.set(0, 0.88, 0.71);
  root.add(mouth);

  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 10, 48), accent);
  lips.position.set(0, 0.88, 0.725);
  lips.scale.set(1, 0.2, 0.18);
  root.add(lips);

  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 16), skin);
  jaw.scale.set(1, 0.22, 0.5);
  jaw.position.set(0, 0.62, 0.36);
  root.add(jaw);

  const core = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.025, 12, 80), accent);
  core.position.y = -0.6;
  core.rotation.x = Math.PI / 2;
  root.add(core);

  root.scale.setScalar(1.22);
  root.position.set(0, -0.48, 0);
  return { root, mouth, jaw, lips };
}

function createEnergyRing() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x5cf2b2, transparent: true, opacity: 0.28 });
  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45 + index * 0.22, 0.006, 8, 120), material.clone());
    ring.rotation.x = Math.PI / 2 + index * 0.18;
    ring.rotation.y = index * 0.35;
    group.add(ring);
  }
  group.position.y = 0.35;
  return group;
}

function CssAvatarFallback({ audioLevel, speaking, mouthShape, visible }: { audioLevel: number; speaking: boolean; mouthShape: MouthShape; visible: boolean }) {
  const mouthScale = 0.35 + (speaking ? audioLevel : 0) * 2.5;
  const width = mouthShape === "ee" || mouthShape === "ih" ? 1.35 : mouthShape === "ou" || mouthShape === "oh" ? 0.75 : 1;

  return (
    <div className={`absolute inset-0 grid place-items-center transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      <div className="relative h-64 w-56 rounded-[44%] border border-accent/25 bg-gradient-to-b from-emerald-100 to-zinc-400 shadow-[0_0_80px_rgba(92,242,178,0.24)]">
        <div className="absolute left-1/2 top-20 h-8 w-36 -translate-x-1/2 rounded-full border border-accent/40 bg-[#06110e] shadow-[0_0_28px_rgba(92,242,178,0.25)]">
          <span className="absolute right-8 top-1/2 size-3 -translate-y-1/2 rounded-full bg-accent" />
          <span className="absolute left-8 top-1/2 size-3 -translate-y-1/2 rounded-full bg-accent" />
        </div>
        <div
          className="absolute left-1/2 top-36 h-3 w-20 -translate-x-1/2 rounded-full bg-[#06110e] transition-transform duration-75"
          style={{ transform: `translateX(-50%) scale(${width}, ${mouthScale})` }}
        />
        <div className="absolute -bottom-24 left-1/2 h-36 w-64 -translate-x-1/2 rounded-t-[4rem] border border-white/10 bg-[#101820]" />
      </div>
    </div>
  );
}

function getMouthWeights(shape: MouthShape, level: number) {
  const open = Math.min(1, level * 1.18);
  const weights = { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0, open, wide: 0.62, round: 0.25 };

  if (shape === "aa") {
    weights.aa = open;
    weights.wide = 0.82;
  } else if (shape === "ih") {
    weights.ih = open * 0.9;
    weights.wide = 1;
    weights.open = open * 0.72;
  } else if (shape === "ee") {
    weights.ee = open * 0.85;
    weights.wide = 1.12;
    weights.open = open * 0.62;
  } else if (shape === "ou") {
    weights.ou = open;
    weights.round = 1.1;
    weights.wide = 0.42;
    weights.open = open * 0.82;
  } else if (shape === "oh") {
    weights.oh = open;
    weights.round = 1;
    weights.wide = 0.52;
    weights.open = open * 0.95;
  }

  return weights;
}
