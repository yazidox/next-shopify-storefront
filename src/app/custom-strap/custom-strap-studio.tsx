"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@shopify/hydrogen-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Check, Loader2, RotateCcw, ShoppingBag, Upload } from "@esmate/shadcn/pkgs/lucide-react";

type HeroTextureStyle = "hero-pink" | "hero-white" | "hero-orange" | "hero-black" | "hero-green" | "hero-yellow";
type TextureStyle = HeroTextureStyle | "smooth" | "saffiano" | "rally" | "checker" | "wave" | "uploaded";
type Finish = "matte" | "satin" | "gloss";

type StrapConfig = {
  baseHeroStyle: HeroTextureStyle;
  textureStyle: TextureStyle;
  baseColor: string;
  accentColor: string;
  initialsColor: string;
  finish: Finish;
  textureScale: number;
  emboss: string;
  uploadedTexture?: string;
};

type SceneParts = {
  renderer: any;
  scene: any;
  camera: any;
  controls: any;
  modelRoot: any;
  decalGroup: any;
  modelMaterials: { material: any; original: any }[];
  accentLight: any;
  texture?: any;
};

type InitialsPlacement = {
  mesh: any;
  meshName: string;
  position: any;
  normal: any;
  orientation: any;
  size: any;
};

type InitialsPlacementSnapshot = {
  model: {
    id: HeroTextureStyle;
    src: string;
  };
  mesh: {
    name: string;
  };
  mark: {
    text: string;
    color: string;
  };
  position: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  size: { x: number; y: number; z: number };
};

type StudioView = {
  camera: {
    position: { x: number; y: number; z: number };
    fov: number;
  };
  target: { x: number; y: number; z: number };
  model: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
  };
};

const INITIAL_CONFIG: StrapConfig = {
  baseHeroStyle: "hero-white",
  textureStyle: "hero-white",
  baseColor: "#f4efe6",
  accentColor: "#e5e2e5",
  initialsColor: "#e5e2e5",
  finish: "matte",
  textureScale: 1,
  emboss: "CS",
};

const HERO_TEXTURE_OPTIONS: {
  id: HeroTextureStyle;
  name: string;
  src: string;
  colors: string[];
  detail: string;
  shopify: {
    handle: string;
    variantId: string;
  };
}[] = [
  {
    id: "hero-pink",
    name: "Royal Purple",
    src: "/wristwatch.opt.glb",
    colors: ["#f15bb5", "#941843"],
    detail: "Official case color",
    shopify: {
      handle: "chronostrap-case-royal-purple",
      variantId: "gid://shopify/ProductVariant/52654604943584",
    },
  },
  {
    id: "hero-white",
    name: "Arctic White",
    src: "/huit-blanc.opt.glb",
    colors: ["#f4efe6", "#e5e2e5"],
    detail: "Official case color",
    shopify: {
      handle: "chronostrap-case-arctic-white",
      variantId: "gid://shopify/ProductVariant/52654605009120",
    },
  },
  {
    id: "hero-orange",
    name: "Hyper Yellow",
    src: "/orenji-hachi.opt.glb",
    colors: ["#ff7a1a", "#cd3c30"],
    detail: "Official strap color",
    shopify: {
      handle: "chronostrap-strap-hyper-yellow",
      variantId: "gid://shopify/ProductVariant/52654605107424",
    },
  },
  {
    id: "hero-black",
    name: "Stealth Black",
    src: "/black.opt.glb",
    colors: ["#0a0a0a", "#ffffff"],
    detail: "Official case color",
    shopify: {
      handle: "chronostrap-case-stealth-black",
      variantId: "gid://shopify/ProductVariant/52654604976352",
    },
  },
  {
    id: "hero-green",
    name: "Teal",
    src: "/green.opt.glb",
    colors: ["#10b981", "#ecf0c2"],
    detail: "Official strap color",
    shopify: {
      handle: "chronostrap-strap-teal",
      variantId: "gid://shopify/ProductVariant/52654605074656",
    },
  },
  {
    id: "hero-yellow",
    name: "Sky Blue",
    src: "/yellow-sky.opt.glb",
    colors: ["#fde047", "#dae8ea"],
    detail: "Official case color",
    shopify: {
      handle: "chronostrap-case-sky-blue",
      variantId: "gid://shopify/ProductVariant/52654605041888",
    },
  },
];

const CUSTOM_TEXTURE_OPTIONS: { id: TextureStyle; name: string; colors: string[]; detail: string }[] = [
  { id: "smooth", name: "Daily Smooth", colors: ["#ff3b30", "#f6d7cf"], detail: "Clean solid strap" },
  { id: "saffiano", name: "Solana Fade", colors: ["#111827", "#14f195"], detail: "Black mint violet fade" },
  { id: "rally", name: "Bitcoin Noir", colors: ["#0a0a0a", "#f7931a"], detail: "Black with amber edge" },
  { id: "checker", name: "Campus Check", colors: ["#f4efe6", "#1f6f8b"], detail: "Small clean check" },
  { id: "wave", name: "Neon Pulse", colors: ["#151225", "#9945ff"], detail: "Thin electric lines" },
  { id: "uploaded", name: "Upload Image", colors: ["#f4efe6", "#7c3aed"], detail: "PNG or JPG from your device" },
];

const COLOR_PRESETS = ["#ff3b30", "#0a0a0a", "#f4efe6", "#1f6f8b", "#f7931a", "#9945ff", "#14f195", "#f15bb5"];

const DEFAULT_MODEL_VIEW = {
  maxAxis: 1.65,
  offset: { x: -0.0001, y: 1.34, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
};

const DEFAULT_CAMERA_VIEW = {
  position: { x: 5.6992, y: 0.8756, z: 3.7065 },
  target: { x: 0, y: 0.45, z: 0 },
};

const CUSTOM_TEXTURE_MODEL_ID: HeroTextureStyle = "hero-yellow";
const MAX_INITIALS_LENGTH = 2;

const INITIALS_PLACEMENTS: Record<HeroTextureStyle, InitialsPlacementSnapshot> = {
  "hero-pink": {
    model: {
      id: "hero-pink",
      src: "/wristwatch.opt.glb",
    },
    mesh: {
      name: "tripo_node_d87b70e4-0b56-478c-a0bb-4a2197301324",
    },
    mark: {
      text: "CS",
      color: "#941843",
    },
    position: {
      x: 0.5214,
      y: 0.9009,
      z: 0.0119,
    },
    normal: {
      x: 0.8,
      y: -0.6,
      z: -0.0096,
    },
    rotation: {
      x: 1.5868,
      y: 0.9272,
      z: -1.5908,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
  "hero-white": {
    model: {
      id: "hero-white",
      src: "/huit-blanc.opt.glb",
    },
    mesh: {
      name: "tripo_node_4ff0f721-99b9-4eef-9224-691b4eb4f00a",
    },
    mark: {
      text: "CS",
      color: "#e5e2e5",
    },
    position: {
      x: 0.5814,
      y: 0.8799,
      z: 0.0173,
    },
    normal: {
      x: 0.7318,
      y: -0.6814,
      z: 0.0124,
    },
    rotation: {
      x: 1.5527,
      y: 0.821,
      z: -1.546,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
  "hero-orange": {
    model: {
      id: "hero-orange",
      src: "/orenji-hachi.opt.glb",
    },
    mesh: {
      name: "tripo_node_8f68349c-c1b1-4ec0-bbf8-71d874f6077c",
    },
    mark: {
      text: "CS",
      color: "#cd3c30",
    },
    position: {
      x: 0.6237,
      y: 0.8967,
      z: 0.0204,
    },
    normal: {
      x: 0.7522,
      y: -0.6589,
      z: -0.0041,
    },
    rotation: {
      x: 1.577,
      y: 0.8514,
      z: -1.5791,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
  "hero-black": {
    model: {
      id: "hero-black",
      src: "/black.opt.glb",
    },
    mesh: {
      name: "tripo_node_63088077-1cbd-45c8-b7a9-2c73885959d4",
    },
    mark: {
      text: "CS",
      color: "#ffffff",
    },
    position: {
      x: 0.558,
      y: 0.8733,
      z: 0.0191,
    },
    normal: {
      x: 0.8229,
      y: -0.5682,
      z: 0,
    },
    rotation: {
      x: 1.5708,
      y: 0.9665,
      z: -1.5708,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
  "hero-green": {
    model: {
      id: "hero-green",
      src: "/green.opt.glb",
    },
    mesh: {
      name: "tripo_node_da36bf1e-766b-451a-92e3-019e5886a652",
    },
    mark: {
      text: "CS",
      color: "#ecf0c2",
    },
    position: {
      x: 0.6951,
      y: 1.0824,
      z: 0.0024,
    },
    normal: {
      x: 0.971,
      y: -0.2387,
      z: 0.0099,
    },
    rotation: {
      x: 1.5292,
      y: 1.3296,
      z: -1.528,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
  "hero-yellow": {
    model: {
      id: "hero-yellow",
      src: "/yellow-sky.opt.glb",
    },
    mesh: {
      name: "tripo_node_bbed0092-3315-44aa-8167-0ac233dbf967",
    },
    mark: {
      text: "CS",
      color: "#dae8ea",
    },
    position: {
      x: 0.6197,
      y: 0.9143,
      z: 0.021,
    },
    normal: {
      x: 0.818,
      y: -0.5751,
      z: 0.0128,
    },
    rotation: {
      x: 1.5486,
      y: 0.9579,
      z: -1.5436,
    },
    size: {
      x: 0.2,
      y: 0.105,
      z: 0.085,
    },
  },
};

export function CustomStrapStudio() {
  const cart = useCart();
  const router = useRouter();
  const [config, setConfig] = useState<StrapConfig>(INITIAL_CONFIG);
  const [uploadName, setUploadName] = useState("");
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [initialsPlaced, setInitialsPlaced] = useState(false);
  const [addingBuild, setAddingBuild] = useState(false);
  const [debug, setDebug] = useState(false);
  const [debugSnapshot, setDebugSnapshot] = useState<StudioView | null>(null);
  const [copiedDebug, setCopiedDebug] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sceneRef = useRef<SceneParts | null>(null);
  const configRef = useRef(INITIAL_CONFIG);
  const debugRef = useRef(false);
  const initialsPlacedRef = useRef(false);
  const initialsPlacementRef = useRef<InitialsPlacement | null>(null);

  const selectedModel = useMemo(
    () => HERO_TEXTURE_OPTIONS.find((model) => model.id === config.baseHeroStyle) ?? HERO_TEXTURE_OPTIONS[0],
    [config.baseHeroStyle],
  );

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    debugRef.current = debug;
    const parts = sceneRef.current;
    if (!parts) return;

    parts.controls.enablePan = debug;
    parts.controls.screenSpacePanning = debug;
    parts.controls.update();
  }, [debug]);

  useEffect(() => {
    initialsPlacedRef.current = initialsPlaced;
  }, [initialsPlaced]);

  useEffect(() => {
    const parts = sceneRef.current;
    const placement = initialsPlacementRef.current;
    if (!parts || !placement) return;

    if (!config.emboss.trim()) {
      clearInitialsDecal(parts);
      initialsPlacedRef.current = false;
      setInitialsPlaced(false);
      return;
    }

    applyInitialsDecal(parts, placement, config.emboss, config.initialsColor);
    setInitialsPlaced(true);
  }, [config.emboss, config.initialsColor]);

  useEffect(() => {
    if (!debug) return;

    const updateDebugSnapshot = () => {
      const parts = sceneRef.current;
      if (!parts) return;
      setDebugSnapshot(readStudioView(parts));
    };

    updateDebugSnapshot();
    const id = window.setInterval(updateDebugSnapshot, 150);
    return () => window.clearInterval(id);
  }, [debug, modelStatus]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(DEFAULT_CAMERA_VIEW.position.x, DEFAULT_CAMERA_VIEW.position.y, DEFAULT_CAMERA_VIEW.position.z);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("data-custom-strap-canvas", "true");
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = debugRef.current;
    controls.screenSpacePanning = debugRef.current;
    controls.minDistance = 3.7;
    controls.maxDistance = 8.2;
    controls.rotateSpeed = 0.7;
    controls.target.set(DEFAULT_CAMERA_VIEW.target.x, DEFAULT_CAMERA_VIEW.target.y, DEFAULT_CAMERA_VIEW.target.z);

    scene.add(new THREE.HemisphereLight("#ffffff", "#27313d", 1.15));

    const keyLight = new THREE.DirectionalLight("#fff2de", 3.4);
    keyLight.position.set(2.8, -3.4, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#d5f7ff", 1.8);
    rimLight.position.set(-3.6, 2.4, 3.4);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(INITIAL_CONFIG.baseColor, 3.2, 8);
    accentLight.position.set(-2.6, 2.2, 2.6);
    scene.add(accentLight);

    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const decalGroup = new THREE.Group();
    scene.add(decalGroup);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      controls,
      modelRoot,
      decalGroup,
      modelMaterials: [],
      accentLight,
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      clearGroup(modelRoot);
      clearInitialsDecal(sceneRef.current);
      sceneRef.current?.texture?.dispose();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const parts = sceneRef.current;
    if (!parts) return;

    let cancelled = false;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/gltf/");
    loader.setDRACOLoader(dracoLoader);
    setModelStatus("loading");

    loader.load(
      selectedModel.src,
      (gltf: any) => {
        if (cancelled) {
          disposeObject(gltf.scene);
          return;
        }

        const shouldRestoreInitials = initialsPlacedRef.current;
        clearInitialsDecal(parts);
        initialsPlacementRef.current = null;
        setInitialsPlaced(false);
        clearGroup(parts.modelRoot);
        parts.modelMaterials = [];

        const model = gltf.scene;
        model.traverse((object: any) => {
          if (!object.isMesh) return;

          object.castShadow = true;
          object.receiveShadow = true;

          const originalMaterials = Array.isArray(object.material) ? object.material : [object.material];
          const materialEntries = originalMaterials.map((material: any) => ({
            material: material.clone(),
            original: material.clone(),
          }));
          object.material = Array.isArray(object.material)
            ? materialEntries.map((entry: { material: any }) => entry.material)
            : materialEntries[0].material;
          parts.modelMaterials.push(...materialEntries);
        });

        fitModelToStudio(model);
        parts.modelRoot.add(model);
        setModelStatus("ready");
        if (shouldRestoreInitials) {
          applySavedInitialsPlacement(parts, configRef.current);
        }
      },
      undefined,
      (error: unknown) => {
        if (!cancelled) {
          console.error("Failed to load custom strap GLB", error);
          setModelStatus("error");
        }
      },
    );

    return () => {
      cancelled = true;
      dracoLoader.dispose();
    };
  }, [selectedModel.id, selectedModel.src]);

  useEffect(() => {
    const parts = sceneRef.current;
    if (!parts || !parts.modelMaterials.length) return;

    let cancelled = false;

    async function updateMaterials(activeParts: SceneParts) {
      const heroTexture = HERO_TEXTURE_OPTIONS.find((texture) => texture.id === config.textureStyle);

      if (heroTexture) {
        activeParts.texture?.dispose();
        activeParts.texture = undefined;
        activeParts.accentLight.color.set(heroTexture.colors[0]);

        const finish = getFinish(config.finish);
        activeParts.modelMaterials.forEach(({ material, original }) => {
          material.copy(original);
          applyFinish(material, finish);
          material.needsUpdate = true;
        });
        return;
      }

      const texture = await createModelTexture(config);
      if (cancelled) {
        texture.dispose();
        return;
      }

      activeParts.texture?.dispose();
      activeParts.texture = texture;
      activeParts.accentLight.color.set(config.baseColor);

      const finish = getFinish(config.finish);
      activeParts.modelMaterials.forEach(({ material }) => {
        material.map = texture;
        material.color?.set(config.textureStyle === "uploaded" ? config.baseColor : "#ffffff");

        applyFinish(material, finish);
        material.needsUpdate = true;
      });
    }

    updateMaterials(parts);

    return () => {
      cancelled = true;
    };
  }, [config, modelStatus]);

  const summary = useMemo(() => {
    const textureName =
      HERO_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle)?.name ??
      CUSTOM_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle)?.name ??
      "Custom";
    const source = isHeroTextureStyle(config.textureStyle) ? "Official GLB" : "Atelier";

    return `${textureName} / ${source} / ${config.finish}`;
  }, [config.finish, config.textureStyle]);

  const activeTexture =
    HERO_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle) ??
    CUSTOM_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle);
  const activeTextureName = activeTexture?.name ?? "Custom";
  const activeSource = isHeroTextureStyle(config.textureStyle) ? "Official reference" : "Atelier material";
  const activeColors = isHeroTextureStyle(config.textureStyle)
    ? (activeTexture?.colors ?? [config.baseColor, config.accentColor])
    : [config.baseColor, config.accentColor];

  function updateConfig(next: Partial<StrapConfig>) {
    setConfig((current) => ({ ...current, ...next }));
  }

  function resetStudio() {
    const parts = sceneRef.current;
    if (parts) clearInitialsDecal(parts);

    initialsPlacementRef.current = null;
    initialsPlacedRef.current = false;
    setInitialsPlaced(false);
    setUploadName("");
    setConfig(INITIAL_CONFIG);
  }

  function clearInitialsMark() {
    const parts = sceneRef.current;
    if (parts) clearInitialsDecal(parts);

    initialsPlacementRef.current = null;
    initialsPlacedRef.current = false;
    setInitialsPlaced(false);
  }

  function addInitialsMark() {
    const parts = sceneRef.current;
    if (!parts || modelStatus !== "ready") return;
    applySavedInitialsPlacement(parts, config);
  }

  function applySavedInitialsPlacement(activeParts: SceneParts, activeConfig: StrapConfig) {
    const text = activeConfig.emboss.trim().slice(0, MAX_INITIALS_LENGTH);
    if (!text) return;

    const placementSnapshot = getInitialsPlacementSnapshot(activeConfig);
    const targetMesh = findInitialsTargetMesh(activeParts, placementSnapshot.mesh.name);
    if (!targetMesh) return;

    const placement = placementFromSnapshot(placementSnapshot, targetMesh);
    initialsPlacementRef.current = placement;
    applyInitialsDecal(activeParts, placement, text, activeConfig.initialsColor || placementSnapshot.mark.color);
    initialsPlacedRef.current = true;
    setInitialsPlaced(true);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setUploadName(file.name);
      updateConfig({
        baseHeroStyle: CUSTOM_TEXTURE_MODEL_ID,
        uploadedTexture: reader.result,
        textureStyle: "uploaded",
        initialsColor: configRef.current.initialsColor,
      });
    };
    reader.readAsDataURL(file);
  }

  function reviewCustomBuild() {
    if (addingBuild || !selectedModel.shopify.variantId) return;

    const activeMaterial =
      HERO_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle) ??
      CUSTOM_TEXTURE_OPTIONS.find((item) => item.id === config.textureStyle);
    const initials = config.emboss.trim().slice(0, MAX_INITIALS_LENGTH) || "None";
    const attributes = [
      { key: "Build", value: "Custom Strap Studio" },
      { key: "Reference", value: selectedModel.name },
      { key: "Material", value: activeMaterial?.name ?? "Custom" },
      { key: "Material source", value: isHeroTextureStyle(config.textureStyle) ? "Official GLB" : "Atelier" },
      { key: "Base color", value: config.baseColor.toUpperCase() },
      { key: "Accent color", value: config.accentColor.toUpperCase() },
      { key: "Initials", value: initials },
      { key: "Initials color", value: config.initialsColor.toUpperCase() },
      { key: "Finish", value: "Matte" },
      ...(config.textureStyle === "uploaded"
        ? [{ key: "Uploaded artwork", value: uploadName || "Customer upload" }]
        : []),
    ];

    setAddingBuild(true);
    cart.linesAdd([
      {
        merchandiseId: selectedModel.shopify.variantId,
        quantity: 1,
        attributes,
      },
    ]);

    window.setTimeout(() => {
      setAddingBuild(false);
      router.push("/cart");
    }, 650);
  }

  async function copyDebugView() {
    if (!debugSnapshot) return;

    await navigator.clipboard.writeText(JSON.stringify(debugSnapshot, null, 2));
    setCopiedDebug(true);
    window.setTimeout(() => setCopiedDebug(false), 1400);
  }

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-cream text-ink">
      <section className="grid min-h-[100svh] grid-cols-1 lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_560px] xl:grid-cols-[minmax(0,1fr)_620px] 2xl:grid-cols-[minmax(0,1fr)_660px]">
        <div className="relative h-[58svh] max-h-[620px] min-h-[430px] overflow-hidden bg-[#e9edf0] sm:h-[64svh] sm:max-h-[720px] sm:min-h-[560px] lg:h-auto lg:max-h-none lg:min-h-screen">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 45% 42%, rgba(255,255,255,0.78), rgba(255,255,255,0) 62%), linear-gradient(135deg, #f4efe6 0%, #d8edf1 45%, #f7dd80 100%)",
            }}
          />
          <div ref={mountRef} className="absolute inset-y-10 left-0 w-full sm:inset-y-6 lg:inset-y-0 lg:w-[62%]" />

          <div className="pointer-events-none absolute top-20 left-4 max-w-[320px] sm:top-24 sm:left-8 sm:max-w-[420px] lg:top-28 lg:left-12">
            <p className="tracking-luxury text-[10px] font-bold text-ink/55 uppercase">Live customizer</p>
            <h1 className="mt-3 text-4xl leading-[0.95] font-black tracking-normal text-ink uppercase sm:mt-4 sm:text-6xl lg:text-7xl">
              Custom
              <br />
              Strap
            </h1>
          </div>

          <div className="pointer-events-none absolute right-4 bottom-4 left-4 flex flex-wrap items-center gap-1.5 sm:right-5 sm:bottom-5 sm:left-5 sm:gap-2 lg:right-auto lg:left-12">
            <BuildChip label={summary} />
            {modelStatus !== "ready" && <BuildChip label={modelStatus} />}
            <BuildChip
              label={
                config.emboss.trim()
                  ? `${initialsPlaced ? "Placed" : "Mark"} ${config.emboss.trim().slice(0, 10)}`
                  : "No mark"
              }
            />
            {debug && <BuildChip label="Debug Camera" />}
          </div>

          {debug && <CameraDebugPanel snapshot={debugSnapshot} copied={copiedDebug} onCopy={copyDebugView} />}
        </div>

        <aside className="border-t border-ink/10 bg-cream px-4 pt-5 pb-0 lg:max-h-screen lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-8 lg:pt-28 2xl:px-10">
          <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col">
            <div className="mb-5 flex items-start justify-between gap-6 sm:mb-7">
              <div>
                <p className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">ChronoStrap Studio</p>
                <h2 className="mt-2 text-2xl leading-none font-black tracking-normal uppercase sm:text-3xl">
                  Configure
                </h2>
              </div>
              <button
                type="button"
                onClick={resetStudio}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-white"
                aria-label="Reset design"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="mb-5 rounded-[8px] border border-ink/10 bg-white/55 p-3 shadow-[0_18px_45px_rgba(10,10,10,0.04)] sm:mb-7 sm:p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="tracking-luxury text-[10px] font-bold text-ink/42 uppercase">Current build</p>
                  <h3 className="mt-2 text-lg leading-none font-black tracking-normal text-ink uppercase sm:text-xl">
                    {activeTextureName}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-ink/55">{activeSource} / Matte finish</p>
                </div>
                <SwatchStack colors={activeColors} />
              </div>
            </div>

            <ConfigSection step="01" title="Reference" meta="Official GLB models">
              <div className="grid grid-cols-2 gap-2">
                {HERO_TEXTURE_OPTIONS.map((look) => {
                  const active = config.baseHeroStyle === look.id && config.textureStyle === look.id;
                  return (
                    <TextureChoiceButton
                      key={look.id}
                      option={look}
                      active={active}
                      source="Official reference"
                      onClick={() =>
                        updateConfig({
                          baseHeroStyle: look.id,
                          textureStyle: look.id,
                          baseColor: look.colors[0],
                          accentColor: look.colors[1] ?? config.accentColor,
                          initialsColor: look.colors[1] ?? config.initialsColor,
                        })
                      }
                    />
                  );
                })}
              </div>
            </ConfigSection>

            <ConfigSection step="02" title="Material" meta="Atelier textures">
              <div className="grid grid-cols-2 gap-2">
                {CUSTOM_TEXTURE_OPTIONS.map((texture) => {
                  const active = config.textureStyle === texture.id;
                  if (texture.id === "uploaded") {
                    return (
                      <div key={texture.id} className="col-span-2 sm:col-span-1">
                        <UploadTextureButton
                          active={active}
                          fileName={uploadName}
                          onClick={() => fileInputRef.current?.click()}
                        />
                      </div>
                    );
                  }

                  return (
                    <TextureChoiceButton
                      key={texture.id}
                      option={texture}
                      active={active}
                      source="Atelier surface"
                      onClick={() =>
                        updateConfig({
                          baseHeroStyle: CUSTOM_TEXTURE_MODEL_ID,
                          textureStyle: texture.id,
                          baseColor: texture.colors[0],
                          accentColor: texture.colors[1] ?? config.accentColor,
                          initialsColor: texture.colors[1] ?? config.initialsColor,
                        })
                      }
                    />
                  );
                })}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
            </ConfigSection>

            <ConfigSection step="03" title="Tone" meta="For atelier materials">
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      updateConfig({ baseHeroStyle: CUSTOM_TEXTURE_MODEL_ID, baseColor: color, textureStyle: "smooth" })
                    }
                    className={`aspect-square rounded-full border transition-transform hover:scale-105 ${
                      config.baseColor === color ? "border-ink ring-2 ring-ink/20" : "border-ink/15"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Use ${color} base colour`}
                    title={color}
                  />
                ))}
              </div>

              <div className="mt-4">
                <ColorInput
                  label="Exact color"
                  value={config.baseColor}
                  onChange={(baseColor) =>
                    updateConfig({ baseHeroStyle: CUSTOM_TEXTURE_MODEL_ID, baseColor, textureStyle: "smooth" })
                  }
                />
              </div>
            </ConfigSection>

            <ConfigSection step="04" title="Monogram" meta="Two letters max">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                <label>
                  <span className="tracking-luxury mb-2 block text-[10px] font-bold text-ink/45 uppercase">
                    Initials
                  </span>
                  <input
                    value={config.emboss}
                    onChange={(event) =>
                      updateConfig({ emboss: event.target.value.slice(0, MAX_INITIALS_LENGTH).toUpperCase() })
                    }
                    className="h-12 w-full rounded-[8px] border border-ink/15 bg-white px-4 text-sm font-bold tracking-[0.22em] text-ink uppercase transition-colors outline-none focus:border-ink"
                    placeholder="CS"
                    maxLength={MAX_INITIALS_LENGTH}
                    aria-label="Texture mark"
                  />
                </label>
                <ColorInput
                  label="Initials color"
                  value={config.initialsColor}
                  onChange={(initialsColor) => updateConfig({ initialsColor })}
                />
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <button
                  type="button"
                  onClick={addInitialsMark}
                  disabled={!config.emboss.trim() || modelStatus !== "ready"}
                  className="tracking-luxury inline-flex h-12 items-center justify-center rounded-[8px] bg-ink px-4 text-[10px] font-bold text-cream uppercase transition-colors hover:bg-pop disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {initialsPlaced ? "Update Monogram" : "Apply Monogram"}
                </button>
                <button
                  type="button"
                  onClick={clearInitialsMark}
                  disabled={!initialsPlaced}
                  className="tracking-luxury inline-flex h-12 items-center justify-center rounded-[8px] border border-ink/10 bg-white px-4 text-[10px] font-bold text-ink/60 uppercase transition-colors hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Clear
                </button>
              </div>
            </ConfigSection>

            <div className="sticky bottom-0 z-40 -mx-4 mt-auto border-t border-ink/10 bg-cream/95 px-4 pt-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-16px_38px_rgba(10,10,10,0.08)] backdrop-blur-xl lg:-mx-8 lg:px-8">
              <button
                type="button"
                onClick={reviewCustomBuild}
                disabled={addingBuild || cart.status === "creating" || cart.status === "updating"}
                className="tracking-luxury inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 py-4 text-[10px] font-bold text-cream uppercase transition-colors hover:bg-pop active:bg-pop disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingBuild || cart.status === "creating" || cart.status === "updating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
                ) : (
                  <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
                )}
                {addingBuild ? "Preparing Build" : "Review Custom Build"}
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function BuildChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/45 bg-white/35 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.16em] text-ink uppercase shadow-[0_8px_24px_rgba(10,10,10,0.08)] backdrop-blur-xl sm:px-3 sm:py-2 sm:text-[10px]">
      {label}
    </span>
  );
}

function TextureChoiceButton({
  option,
  active,
  source,
  onClick,
}: {
  option: { id: TextureStyle; name: string; colors: string[]; detail: string };
  active: boolean;
  source: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative grid min-h-[86px] grid-cols-[8px_minmax(0,1fr)] overflow-hidden rounded-[8px] border text-left transition-all sm:min-h-[92px] sm:grid-cols-[10px_minmax(0,1fr)] ${
        active
          ? "border-ink bg-white shadow-[0_10px_26px_rgba(10,10,10,0.08)]"
          : "border-ink/10 bg-white/45 hover:border-ink/25 hover:bg-white"
      }`}
      aria-pressed={active}
    >
      <span aria-hidden className="block h-full w-full border-r border-ink/10" style={getTexturePreviewStyle(option)} />
      <span className="flex min-w-0 flex-col justify-between gap-2 p-2.5 pr-8 sm:gap-3 sm:p-3 sm:pr-10">
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-black tracking-normal text-ink uppercase sm:text-sm">
            {option.name}
          </span>
          <span className="mt-1 block truncate text-[10px] font-medium text-ink/52 sm:text-xs">{option.detail}</span>
        </span>
        <span className="flex items-center justify-between gap-3">
          <SwatchLine colors={option.colors} />
          <span className="hidden truncate text-[10px] font-bold text-ink/38 sm:block">{source}</span>
        </span>
      </span>
      {active && (
        <span className="absolute top-2 right-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-cream sm:top-3 sm:right-3 sm:h-6 sm:w-6">
          <Check className="h-3 w-3" strokeWidth={2.4} />
        </span>
      )}
    </button>
  );
}

function UploadTextureButton({
  active,
  fileName,
  onClick,
}: {
  active: boolean;
  fileName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex min-h-[86px] w-full items-center gap-3 rounded-[8px] border border-dashed px-3 text-left transition-all sm:min-h-[92px] sm:gap-4 sm:px-4 ${
        active
          ? "border-ink bg-white shadow-[0_10px_26px_rgba(10,10,10,0.08)]"
          : "border-ink/25 bg-white/45 hover:border-ink/45 hover:bg-white"
      }`}
      aria-pressed={active}
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-cream sm:h-12 sm:w-12">
        <Upload className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-black tracking-normal text-ink uppercase sm:text-sm">
          Upload Image
        </span>
        <span className="mt-1 block truncate text-[11px] font-medium text-ink/52 sm:text-xs">
          {fileName || "PNG or JPG from your device"}
        </span>
        <span className="tracking-luxury mt-3 inline-flex rounded-full border border-ink/15 px-3 py-1.5 text-[9px] font-bold text-ink uppercase">
          {fileName ? "Change file" : "Choose file"}
        </span>
      </span>
      {active && (
        <span className="absolute top-3 right-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-cream">
          <Check className="h-3 w-3" strokeWidth={2.4} />
        </span>
      )}
    </button>
  );
}

function SwatchLine({ colors }: { colors: string[] }) {
  return (
    <span className="flex items-center">
      {colors.slice(0, 3).map((color) => (
        <span
          key={color}
          className="-ml-1 block h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgba(10,10,10,0.12)] first:ml-0 sm:h-4 sm:w-4"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

function SwatchStack({ colors }: { colors: string[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {colors.slice(0, 3).map((color) => (
        <span
          key={color}
          className="-ml-2 block h-8 w-8 rounded-full border-2 border-white shadow-[0_8px_18px_rgba(10,10,10,0.12)] first:ml-0 sm:h-10 sm:w-10"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function getTexturePreviewStyle(option: { id: TextureStyle; colors: string[] }) {
  if (option.id === "smooth") {
    return {
      background: `linear-gradient(135deg, ${option.colors[0]} 0 78%, ${option.colors[1]} 78% 100%)`,
    };
  }

  if (option.id === "saffiano") {
    return {
      background: "linear-gradient(135deg, #111827 0 42%, #14f195 42% 50%, #9945ff 50% 58%, #111827 58% 100%)",
    };
  }

  if (option.id === "rally") {
    return {
      background: "linear-gradient(90deg, #0a0a0a 0 64%, #f7931a 64% 76%, #211406 76% 100%)",
    };
  }

  if (option.id === "checker") {
    return {
      background: `linear-gradient(45deg, ${option.colors[0]} 25%, ${option.colors[1]} 25% 50%, ${option.colors[0]} 50% 75%, ${option.colors[1]} 75%)`,
      backgroundSize: "14px 14px",
    };
  }

  if (option.id === "wave") {
    return {
      background:
        "repeating-linear-gradient(0deg, transparent 0 10px, rgba(20,241,149,0.52) 10px 12px, transparent 12px 22px), linear-gradient(135deg, #151225, #26154d 48%, #111827)",
    };
  }

  return {
    background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]})`,
  };
}

function CameraDebugPanel({
  snapshot,
  copied,
  onCopy,
}: {
  snapshot: StudioView | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="absolute top-24 right-5 z-30 w-[340px] max-w-[calc(100vw-2.5rem)] rounded-[8px] border border-ink/10 bg-white/80 p-4 text-ink shadow-[0_18px_50px_rgba(10,10,10,0.14)] backdrop-blur-2xl lg:top-28 lg:right-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">Debug Camera</p>
          <h3 className="mt-1 text-sm font-black tracking-normal uppercase">Position View</h3>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!snapshot}
          className="tracking-luxury rounded-full bg-ink px-3 py-2 text-[10px] font-bold text-cream uppercase transition-colors hover:bg-pop disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-ink/55">
        Drag to rotate, scroll to zoom, right-drag or shift-drag to pan.
      </p>
      <pre className="max-h-64 overflow-auto rounded-[8px] border border-ink/10 bg-ink p-3 font-mono text-[10px] leading-relaxed text-cream">
        {snapshot ? JSON.stringify(snapshot, null, 2) : "Waiting for scene..."}
      </pre>
    </div>
  );
}

function ConfigSection({
  step,
  title,
  meta,
  children,
}: {
  step: string;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-ink/10 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-[11px] text-ink/32">{step}</span>
          <h3 className="text-sm font-black tracking-normal text-ink uppercase">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-ink/42">{meta}</span>
      </div>
      {children}
    </section>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="tracking-luxury mb-2 block text-[10px] font-bold text-ink/45 uppercase">{label}</span>
      <span className="flex h-12 items-center justify-between rounded-[8px] border border-ink/10 bg-white px-3">
        <span className="text-sm font-semibold text-ink/70">{value.toUpperCase()}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 cursor-pointer rounded-[8px] border border-ink/15 bg-transparent p-1"
          aria-label={`${label} picker`}
        />
      </span>
    </label>
  );
}

function readStudioView(parts: SceneParts): StudioView {
  const model = parts.modelRoot.children[0] ?? parts.modelRoot;

  return {
    camera: {
      position: vectorToObject(parts.camera.position),
      fov: round(parts.camera.fov),
    },
    target: vectorToObject(parts.controls.target),
    model: {
      position: vectorToObject(model.position),
      rotation: vectorToObject(model.rotation),
      scale: round(model.scale?.x ?? 1),
    },
  };
}

function vectorToObject(vector: any) {
  return {
    x: round(vector.x),
    y: round(vector.y),
    z: round(vector.z),
  };
}

function isHeroTextureStyle(style: TextureStyle): style is HeroTextureStyle {
  return HERO_TEXTURE_OPTIONS.some((texture) => texture.id === style);
}

function round(value: number) {
  return Number(value.toFixed(4));
}

function fitModelToStudio(model: any) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = maxAxis > 0 ? DEFAULT_MODEL_VIEW.maxAxis / maxAxis : 1;
  model.scale.setScalar(scale);
  model.position.set(
    -center.x * scale + DEFAULT_MODEL_VIEW.offset.x,
    -center.y * scale + DEFAULT_MODEL_VIEW.offset.y,
    -center.z * scale + DEFAULT_MODEL_VIEW.offset.z,
  );
  model.rotation.set(DEFAULT_MODEL_VIEW.rotation.x, DEFAULT_MODEL_VIEW.rotation.y, DEFAULT_MODEL_VIEW.rotation.z);
}

function clearGroup(group: any) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    disposeObject(child);
  }
}

function disposeObject(object: any) {
  object.traverse?.((child: any) => {
    if (!child.isMesh) return;
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material: any) => {
      material?.map?.dispose?.();
      material?.dispose?.();
    });
  });
}

function getInitialsPlacementSnapshot(config: StrapConfig) {
  const placementId = isHeroTextureStyle(config.textureStyle) ? config.baseHeroStyle : CUSTOM_TEXTURE_MODEL_ID;
  return INITIALS_PLACEMENTS[placementId];
}

function findInitialsTargetMesh(parts: SceneParts, preferredMeshName: string) {
  let preferred: any = null;
  let largest: any = null;
  let largestVolume = -1;

  parts.modelRoot.traverse((object: any) => {
    if (!object.isMesh) return;

    if (object.name === preferredMeshName || object.parent?.name === preferredMeshName) {
      preferred = object;
      return;
    }

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (volume > largestVolume) {
      largest = object;
      largestVolume = volume;
    }
  });

  return preferred ?? largest;
}

function placementFromSnapshot(snapshot: InitialsPlacementSnapshot, mesh: any): InitialsPlacement {
  return {
    mesh,
    meshName: mesh.name || mesh.parent?.name || snapshot.mesh.name,
    position: new THREE.Vector3(snapshot.position.x, snapshot.position.y, snapshot.position.z),
    normal: new THREE.Vector3(snapshot.normal.x, snapshot.normal.y, snapshot.normal.z),
    orientation: new THREE.Euler(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z),
    size: new THREE.Vector3(snapshot.size.x, snapshot.size.y, snapshot.size.z),
  };
}

function applyInitialsDecal(parts: SceneParts, placement: InitialsPlacement, text: string, accentColor: string) {
  clearInitialsDecal(parts);

  const trimmed = text.trim().slice(0, MAX_INITIALS_LENGTH);
  if (!trimmed) return;

  const texture = createInitialsDecalTexture(trimmed, accentColor);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.08,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -6,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const decal = new THREE.Mesh(
    new DecalGeometry(placement.mesh, placement.position, placement.orientation, placement.size),
    material,
  );
  decal.renderOrder = 20;
  parts.decalGroup.add(decal);
}

function clearInitialsDecal(parts?: SceneParts | null) {
  if (!parts) return;

  while (parts.decalGroup.children.length) {
    const child = parts.decalGroup.children[0];
    parts.decalGroup.remove(child);
    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material: any) => {
      material?.map?.dispose?.();
      material?.dispose?.();
    });
  }
}

function createInitialsDecalTexture(text: string, accentColor: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);

  const fillColor = getReadableInitialsColor(accentColor);
  const strokeColor = fillColor === "#0a0a0a" ? "rgba(244, 239, 230, 0.84)" : "rgba(10, 10, 10, 0.74)";

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.font = '700 142px "Bodoni 72 Smallcaps", "Bodoni 72", "Didot", "Libre Bodoni", "Times New Roman", serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = text.length <= 2 ? "16px" : "8px";
  context.lineWidth = 8;
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.strokeText(text, 0, 6);
  context.fillText(text, 0, 6);

  const underlineWidth = Math.min(180, Math.max(88, text.length * 52));
  context.globalAlpha = 0.82;
  context.lineWidth = 5;
  context.lineCap = "round";
  context.strokeStyle = fillColor;
  context.beginPath();
  context.moveTo(-underlineWidth / 2, 84);
  context.lineTo(underlineWidth / 2, 84);
  context.stroke();
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function getReadableInitialsColor(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "#0a0a0a" : "#f4efe6";
}

async function createModelTexture(config: StrapConfig) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.fillStyle = config.baseColor;
  context.fillRect(0, 0, size, size);

  if (config.textureStyle === "uploaded" && config.uploadedTexture) {
    const image = await loadImage(config.uploadedTexture);
    drawCoverImage(context, image, size, size);
    context.globalCompositeOperation = "multiply";
    context.globalAlpha = 0.28;
    context.fillStyle = config.baseColor;
    context.fillRect(0, 0, size, size);
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
  } else if (config.textureStyle === "saffiano") {
    drawSolanaAurora(context, config.baseColor, config.accentColor, size);
  } else if (config.textureStyle === "rally") {
    drawBitcoinEmber(context, config.baseColor, config.accentColor, size);
  } else if (config.textureStyle === "checker") {
    drawChecker(context, config.baseColor, config.accentColor, size);
  } else if (config.textureStyle === "wave") {
    drawSolanaPulse(context, config.baseColor, config.accentColor, size);
  }

  drawGrain(context, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(config.textureScale, config.textureScale);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function drawSolanaAurora(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#111827");
  gradient.addColorStop(0.44, baseColor);
  gradient.addColorStop(0.58, accentColor);
  gradient.addColorStop(0.72, "#9945ff");
  gradient.addColorStop(1, "#111827");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.globalCompositeOperation = "screen";
  context.lineWidth = 28;
  context.strokeStyle = withAlpha("#14f195", 0.22);
  context.beginPath();
  context.moveTo(size * 0.1, size);
  context.lineTo(size * 0.56, 0);
  context.stroke();

  context.lineWidth = 18;
  context.strokeStyle = withAlpha("#9945ff", 0.24);
  context.beginPath();
  context.moveTo(size * 0.36, size);
  context.lineTo(size * 0.82, 0);
  context.stroke();

  context.globalCompositeOperation = "multiply";
  context.fillStyle = withAlpha("#0a0a0a", 0.18);
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = "source-over";
}

function drawBitcoinEmber(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(0.72, "#0a0a0a");
  gradient.addColorStop(1, "#1f1406");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.globalCompositeOperation = "screen";
  context.fillStyle = withAlpha(accentColor, 0.82);
  context.fillRect(size * 0.73, 0, size * 0.075, size);
  context.fillStyle = withAlpha("#ffcf70", 0.24);
  context.fillRect(size * 0.82, 0, size * 0.025, size);
  context.globalCompositeOperation = "source-over";
}

function drawChecker(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  const alternate = withAlpha(accentColor, 0.82);
  const square = 84;
  for (let y = 0; y < size; y += square) {
    for (let x = 0; x < size; x += square) {
      context.fillStyle = (x / square + y / square) % 2 === 0 ? baseColor : alternate;
      context.fillRect(x, y, square, square);
    }
  }

  context.strokeStyle = withAlpha("#ffffff", 0.28);
  context.lineWidth = 2;
  for (let line = 0; line <= size; line += square) {
    context.beginPath();
    context.moveTo(line, 0);
    context.lineTo(line, size);
    context.moveTo(0, line);
    context.lineTo(size, line);
    context.stroke();
  }
}

function drawSolanaPulse(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  const gradient = context.createLinearGradient(size, 0, 0, size);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(0.56, "#151225");
  gradient.addColorStop(1, "#111827");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  context.globalCompositeOperation = "screen";
  for (let row = -40; row < size + 80; row += 118) {
    context.lineWidth = 7;
    context.strokeStyle = withAlpha(accentColor, 0.64);
    context.beginPath();
    for (let x = 0; x <= size; x += 16) {
      const y = row + Math.sin(x / 54) * 16;
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }

  context.lineWidth = 3;
  context.strokeStyle = withAlpha("#14f195", 0.5);
  for (let row = 24; row < size + 80; row += 118) {
    context.beginPath();
    context.moveTo(0, row);
    context.lineTo(size, row + 34);
    context.stroke();
  }
  context.globalCompositeOperation = "source-over";
}

function drawGrain(context: CanvasRenderingContext2D, size: number) {
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.07;
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.fillRect(x, y, 1, 1);
  }
}

function getFinish(finish: Finish) {
  if (finish === "matte") {
    return { roughness: 0.88, metalness: 0.02, clearcoat: 0.04, clearcoatRoughness: 0.82 };
  }
  if (finish === "gloss") {
    return { roughness: 0.2, metalness: 0.04, clearcoat: 0.75, clearcoatRoughness: 0.16 };
  }
  return { roughness: 0.48, metalness: 0.03, clearcoat: 0.24, clearcoatRoughness: 0.34 };
}

function applyFinish(material: any, finish: ReturnType<typeof getFinish>) {
  if ("roughness" in material) material.roughness = finish.roughness;
  if ("metalness" in material) material.metalness = finish.metalness;
  if ("clearcoat" in material) material.clearcoat = finish.clearcoat;
  if ("clearcoatRoughness" in material) material.clearcoatRoughness = finish.clearcoatRoughness;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
) {
  const ratio = Math.max(targetWidth / image.width, targetHeight / image.height);
  const width = image.width * ratio;
  const height = image.height * ratio;
  const x = (targetWidth - width) / 2;
  const y = (targetHeight - height) / 2;
  context.drawImage(image, x, y, width, height);
}

function shadeColor(hex: string, amount: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function withAlpha(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = num >> 16;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
