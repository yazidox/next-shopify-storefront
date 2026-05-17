"use client";

import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Check, Palette, RotateCcw, ShoppingBag, Sparkles, Type, Upload } from "@esmate/shadcn/pkgs/lucide-react";

type HeroTextureStyle = "hero-pink" | "hero-white" | "hero-orange" | "hero-black" | "hero-green" | "hero-yellow";
type TextureStyle = HeroTextureStyle | "smooth" | "saffiano" | "rally" | "checker" | "wave" | "uploaded";
type Finish = "matte" | "satin" | "gloss";

type StrapConfig = {
  baseHeroStyle: HeroTextureStyle;
  textureStyle: TextureStyle;
  baseColor: string;
  accentColor: string;
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
  baseHeroStyle: "hero-green",
  textureStyle: "hero-green",
  baseColor: "#10b981",
  accentColor: "#ecf0c2",
  finish: "matte",
  textureScale: 1,
  emboss: "CS",
};

const HERO_TEXTURE_OPTIONS: { id: HeroTextureStyle; name: string; src: string; colors: string[] }[] = [
  { id: "hero-pink", name: "Pink Pop", src: "/wristwatch.opt.glb", colors: ["#f15bb5", "#941843"] },
  { id: "hero-white", name: "Huit Blanc", src: "/huit-blanc.opt.glb", colors: ["#f4efe6", "#e5e2e5"] },
  { id: "hero-orange", name: "Orenji Hachi", src: "/orenji-hachi.opt.glb", colors: ["#ff7a1a", "#cd3c30"] },
  { id: "hero-black", name: "Noir", src: "/black.opt.glb", colors: ["#0a0a0a", "#ffffff"] },
  { id: "hero-green", name: "Vert", src: "/green.opt.glb", colors: ["#10b981", "#ecf0c2"] },
  { id: "hero-yellow", name: "Yellow Sky", src: "/yellow-sky.opt.glb", colors: ["#fde047", "#dae8ea"] },
];

const CUSTOM_TEXTURE_OPTIONS: { id: TextureStyle; name: string; colors: string[] }[] = [
  { id: "smooth", name: "Smooth", colors: ["#f04f42", "#f6d7cf"] },
  { id: "saffiano", name: "Saffiano", colors: ["#101820", "#d8dee5"] },
  { id: "rally", name: "Rally", colors: ["#0a0a0a", "#ff3b30"] },
  { id: "checker", name: "Checker", colors: ["#f4efe6", "#1f6f8b"] },
  { id: "wave", name: "Wave", colors: ["#3349ff", "#fbdb52"] },
  { id: "uploaded", name: "Upload", colors: ["#c8f7dc", "#7c3aed"] },
];

const COLOR_PRESETS = ["#ff3b30", "#0a0a0a", "#f4efe6", "#1f6f8b", "#f7c948", "#5a3bff", "#0fa36b", "#f15bb5"];

const DEFAULT_MODEL_VIEW = {
  maxAxis: 1.65,
  offset: { x: -0.0001, y: 1.34, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
};

const DEFAULT_CAMERA_VIEW = {
  position: { x: 5.6992, y: 0.8756, z: 3.7065 },
  target: { x: 0, y: 0.45, z: 0 },
};

export function CustomStrapStudio() {
  const [config, setConfig] = useState<StrapConfig>(INITIAL_CONFIG);
  const [uploadName, setUploadName] = useState("");
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
  const [placementMode, setPlacementMode] = useState(false);
  const [initialsPlaced, setInitialsPlaced] = useState(false);
  const [placementSnapshot, setPlacementSnapshot] = useState<InitialsPlacementSnapshot | null>(null);
  const [copiedPlacement, setCopiedPlacement] = useState(false);
  const [debug, setDebug] = useState(false);
  const [debugSnapshot, setDebugSnapshot] = useState<StudioView | null>(null);
  const [copiedDebug, setCopiedDebug] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sceneRef = useRef<SceneParts | null>(null);
  const configRef = useRef(INITIAL_CONFIG);
  const debugRef = useRef(false);
  const placementModeRef = useRef(false);
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
    placementModeRef.current = placementMode;
    const parts = sceneRef.current;
    if (!parts) return;

    parts.controls.enabled = !placementMode;
    parts.controls.update();
  }, [placementMode]);

  useEffect(() => {
    const parts = sceneRef.current;
    const placement = initialsPlacementRef.current;
    if (!parts || !placement) return;

    if (!config.emboss.trim()) {
      clearInitialsDecal(parts);
      setInitialsPlaced(false);
      setPlacementSnapshot(null);
      setCopiedPlacement(false);
      return;
    }

    applyInitialsDecal(parts, placement, config.emboss, config.accentColor);
    setPlacementSnapshot(createPlacementSnapshot(placement, config));
    setInitialsPlaced(true);
  }, [config.accentColor, config.emboss]);

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

    const handlePointerDown = (event: PointerEvent) => {
      if (!placementModeRef.current) return;

      const activeParts = sceneRef.current;
      if (!activeParts || !configRef.current.emboss.trim()) return;

      event.preventDefault();
      event.stopPropagation();

      const hit = findModelHit(activeParts, event);
      if (!hit) return;

      const placement = createInitialsPlacement(hit, configRef.current.emboss);
      initialsPlacementRef.current = placement;
      applyInitialsDecal(activeParts, placement, configRef.current.emboss, configRef.current.accentColor);
      setPlacementSnapshot(createPlacementSnapshot(placement, configRef.current));
      setInitialsPlaced(true);
      setPlacementMode(false);
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
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

        clearInitialsDecal(parts);
        initialsPlacementRef.current = null;
        setInitialsPlaced(false);
        setPlacementSnapshot(null);
        setCopiedPlacement(false);
        setPlacementMode(false);
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
    const source = isHeroTextureStyle(config.textureStyle) ? "Official" : "Custom";

    return `${textureName} / ${source} / ${config.finish}`;
  }, [config.finish, config.textureStyle]);

  function updateConfig(next: Partial<StrapConfig>) {
    setConfig((current) => ({ ...current, ...next }));
  }

  function resetStudio() {
    const parts = sceneRef.current;
    if (parts) clearInitialsDecal(parts);

    initialsPlacementRef.current = null;
    setInitialsPlaced(false);
    setPlacementSnapshot(null);
    setCopiedPlacement(false);
    setPlacementMode(false);
    setUploadName("");
    setConfig(INITIAL_CONFIG);
  }

  function clearInitialsMark() {
    const parts = sceneRef.current;
    if (parts) clearInitialsDecal(parts);

    initialsPlacementRef.current = null;
    setInitialsPlaced(false);
    setPlacementSnapshot(null);
    setCopiedPlacement(false);
    setPlacementMode(false);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setUploadName(file.name);
      updateConfig({ uploadedTexture: reader.result, textureStyle: "uploaded" });
    };
    reader.readAsDataURL(file);
  }

  async function copyDebugView() {
    if (!debugSnapshot) return;

    await navigator.clipboard.writeText(JSON.stringify(debugSnapshot, null, 2));
    setCopiedDebug(true);
    window.setTimeout(() => setCopiedDebug(false), 1400);
  }

  async function copyPlacementJson() {
    if (!placementSnapshot) return;

    await navigator.clipboard.writeText(JSON.stringify(placementSnapshot, null, 2));
    setCopiedPlacement(true);
    window.setTimeout(() => setCopiedPlacement(false), 1400);
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_500px] xl:grid-cols-[minmax(0,1fr)_560px] 2xl:grid-cols-[minmax(0,1fr)_600px]">
        <div className="relative min-h-[620px] overflow-hidden bg-[#e9edf0] sm:min-h-[680px] lg:min-h-screen">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 45% 42%, rgba(255,255,255,0.78), rgba(255,255,255,0) 62%), linear-gradient(135deg, #f4efe6 0%, #d8edf1 45%, #f7dd80 100%)",
            }}
          />
          <div
            ref={mountRef}
            className={`absolute inset-y-0 left-0 w-full lg:w-[62%] ${placementMode ? "cursor-crosshair" : ""}`}
          />

          <div className="pointer-events-none absolute top-24 left-5 max-w-[420px] sm:left-8 lg:top-28 lg:left-12">
            <p className="tracking-luxury text-[10px] font-bold text-ink/55 uppercase">Live customizer</p>
            <h1 className="mt-4 text-4xl leading-[0.95] font-black tracking-normal text-ink uppercase sm:text-6xl lg:text-7xl">
              Custom
              <br />
              Strap
            </h1>
          </div>

          <div className="pointer-events-none absolute right-5 bottom-5 left-5 flex flex-wrap items-center gap-2 lg:right-auto lg:left-12">
            <BuildChip label={summary} />
            {modelStatus !== "ready" && <BuildChip label={modelStatus} />}
            <BuildChip
              label={
                config.emboss.trim()
                  ? `${initialsPlaced ? "Placed" : "Mark"} ${config.emboss.trim().slice(0, 10)}`
                  : "No mark"
              }
            />
            {placementMode && <BuildChip label="Click strap" />}
            {debug && <BuildChip label="Debug Camera" />}
          </div>

          {debug && <CameraDebugPanel snapshot={debugSnapshot} copied={copiedDebug} onCopy={copyDebugView} />}
        </div>

        <aside className="border-t border-ink/10 bg-cream px-5 py-7 lg:max-h-screen lg:overflow-y-auto lg:border-t-0 lg:border-l lg:px-8 lg:pt-28 2xl:px-10">
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <p className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">ChronoStrap</p>
              <h2 className="mt-2 text-3xl leading-none font-black tracking-normal uppercase">Customize</h2>
              <p className="mt-3 text-sm leading-relaxed font-medium text-ink/55">{summary}</p>
            </div>
            <button
              type="button"
              onClick={resetStudio}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-white"
              aria-label="Reset design"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <ControlGroup icon={<Sparkles className="h-4 w-4" />} title="Texture">
            <OptionSetLabel label="Official models" count={HERO_TEXTURE_OPTIONS.length} />
            <div className="grid grid-cols-2 gap-3">
              {HERO_TEXTURE_OPTIONS.map((look) => {
                const active = config.baseHeroStyle === look.id && config.textureStyle === look.id;
                return (
                  <TextureChoiceButton
                    key={look.id}
                    option={look}
                    active={active}
                    badge="OFFICIAL"
                    compact
                    onClick={() =>
                      updateConfig({
                        baseHeroStyle: look.id,
                        textureStyle: look.id,
                        baseColor: look.colors[0],
                        accentColor: look.colors[1] ?? config.accentColor,
                      })
                    }
                  />
                );
              })}
            </div>

            <OptionSetLabel label="Custom textures" count={CUSTOM_TEXTURE_OPTIONS.length} className="mt-5" />
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
              {CUSTOM_TEXTURE_OPTIONS.map((texture) => {
                const active = config.textureStyle === texture.id;
                return (
                  <TextureChoiceButton
                    key={texture.id}
                    option={texture}
                    active={active}
                    badge="CUSTOM"
                    compact
                    onClick={() =>
                      texture.id === "uploaded"
                        ? fileInputRef.current?.click()
                        : updateConfig({
                            textureStyle: texture.id,
                            baseColor: texture.colors[0],
                            accentColor: texture.colors[1] ?? config.accentColor,
                          })
                    }
                  />
                );
              })}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleUpload} />
          </ControlGroup>

          <ControlGroup icon={<Palette className="h-4 w-4" />} title="Color">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateConfig({ baseColor: color, textureStyle: "smooth" })}
                  className={`h-10 rounded-full border transition-transform hover:scale-105 ${
                    config.baseColor === color ? "border-ink ring-2 ring-ink/20" : "border-ink/15"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Use ${color} base colour`}
                  title={color}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <ColorInput
                label="Custom color"
                value={config.baseColor}
                onChange={(baseColor) => updateConfig({ baseColor, textureStyle: "smooth" })}
              />
              {uploadName && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-12 w-full items-center justify-between rounded-[8px] border border-ink/10 bg-white px-4 text-left transition-colors hover:border-ink/25"
                >
                  <span className="truncate text-sm font-semibold">{uploadName}</span>
                  <Upload className="h-4 w-4 shrink-0 text-ink/55" strokeWidth={2.2} />
                </button>
              )}
            </div>
          </ControlGroup>

          <ControlGroup icon={<Type className="h-4 w-4" />} title="Initials">
            <input
              value={config.emboss}
              onChange={(event) => updateConfig({ emboss: event.target.value.slice(0, 4).toUpperCase() })}
              className="h-12 w-full rounded-[8px] border border-ink/15 bg-white px-4 text-sm font-bold tracking-[0.22em] text-ink uppercase transition-colors outline-none focus:border-ink"
              placeholder="CS"
              maxLength={4}
              aria-label="Texture mark"
            />
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button
                type="button"
                onClick={() => setPlacementMode(true)}
                disabled={!config.emboss.trim() || modelStatus !== "ready"}
                className="tracking-luxury inline-flex h-12 items-center justify-center rounded-[8px] border border-ink/10 bg-white px-4 text-[10px] font-bold text-ink uppercase transition-colors hover:border-ink/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {placementMode ? "Click Strap" : initialsPlaced ? "Move Mark" : "Place Mark"}
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
            {placementSnapshot && (
              <div className="mt-3 rounded-[8px] border border-ink/10 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">Placement JSON</span>
                  <button
                    type="button"
                    onClick={copyPlacementJson}
                    className="tracking-luxury rounded-[6px] bg-ink px-3 py-2 text-[9px] font-bold text-cream uppercase transition-colors hover:bg-pop"
                  >
                    {copiedPlacement ? "Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre className="max-h-32 overflow-auto rounded-[6px] bg-ink p-3 font-mono text-[10px] leading-relaxed text-cream">
                  {JSON.stringify(placementSnapshot, null, 2)}
                </pre>
              </div>
            )}
          </ControlGroup>

          <div className="sticky bottom-0 mt-8 border-t border-ink/10 bg-cream pt-5 pb-2">
            <a
              href="/products?tag=strap"
              className="tracking-luxury inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-ink px-5 py-4 text-[10px] font-bold text-cream uppercase transition-colors hover:bg-pop active:bg-pop"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
              Review Custom Build
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}

function BuildChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/45 bg-white/35 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-ink uppercase shadow-[0_8px_24px_rgba(10,10,10,0.08)] backdrop-blur-xl">
      {label}
    </span>
  );
}

function TextureChoiceButton({
  option,
  active,
  badge,
  compact,
  onClick,
}: {
  option: { id: TextureStyle; name: string; colors: string[] };
  active: boolean;
  badge: "OFFICIAL" | "CUSTOM";
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-[8px] border px-3 py-2 pr-10 text-left transition-all ${
        compact ? "min-h-[106px] flex-col items-start gap-3" : "min-h-14"
      } ${
        active
          ? "border-ink bg-white shadow-[0_10px_26px_rgba(10,10,10,0.08)]"
          : "border-ink/10 bg-white/45 hover:bg-white"
      }`}
      aria-pressed={active}
    >
      <span
        aria-hidden
        className={`${compact ? "h-10 w-full rounded-[6px]" : "h-9 w-9 rounded-full"} block shrink-0 border border-ink/10`}
        style={getTexturePreviewStyle(option)}
      />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="min-w-0 truncate text-xs font-bold tracking-[0.14em] uppercase">{option.name}</span>
        <span
          className={`rounded-full px-2 py-1 text-[8px] font-black tracking-[0.14em] uppercase ${
            badge === "OFFICIAL" ? "bg-ink text-cream" : "bg-pop/10 text-pop"
          }`}
        >
          {badge}
        </span>
      </span>
      {active && (
        <span
          className={`absolute right-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-cream ${
            compact ? "top-3" : "top-1/2 -translate-y-1/2"
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={2.4} />
        </span>
      )}
    </button>
  );
}

function OptionSetLabel({ label, count, className = "" }: { label: string; count: number; className?: string }) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-4 ${className}`}>
      <span className="tracking-luxury text-[10px] font-bold text-ink/45 uppercase">{label}</span>
      <span className="text-[10px] font-bold text-ink/35">{count}</span>
    </div>
  );
}

function getTexturePreviewStyle(option: { id: TextureStyle; colors: string[] }) {
  if (option.id === "checker") {
    return {
      background: `linear-gradient(45deg, ${option.colors[0]} 25%, ${option.colors[1]} 25% 50%, ${option.colors[0]} 50% 75%, ${option.colors[1]} 75%)`,
      backgroundSize: "18px 18px",
    };
  }

  if (option.id === "rally") {
    return {
      background: `linear-gradient(90deg, ${option.colors[0]} 0 34%, ${option.colors[1]} 34% 44%, ${option.colors[0]} 44% 56%, ${option.colors[1]} 56% 66%, ${option.colors[0]} 66%)`,
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

function ControlGroup({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-ink/10 py-6">
      <div className="mb-4 flex items-center gap-2 text-ink">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-pop">{icon}</span>
        <h3 className="tracking-luxury text-[11px] font-bold uppercase">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-12 items-center justify-between rounded-[8px] border border-ink/10 bg-white px-4">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-10 cursor-pointer rounded-[8px] border border-ink/15 bg-transparent p-1"
        aria-label={`${label} picker`}
      />
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

function findModelHit(parts: SceneParts, event: PointerEvent) {
  const rect = parts.renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, parts.camera);

  const meshes: any[] = [];
  parts.modelRoot.traverse((object: any) => {
    if (object.isMesh) meshes.push(object);
  });

  return raycaster.intersectObjects(meshes, true)[0];
}

function createInitialsPlacement(hit: any, text: string): InitialsPlacement {
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
  const normal = hit.face.normal.clone().applyNormalMatrix(normalMatrix).normalize();
  const position = hit.point.clone().add(normal.clone().multiplyScalar(0.006));

  const helper = new THREE.Object3D();
  helper.position.copy(position);
  helper.lookAt(position.clone().add(normal));

  const initials = text.trim().slice(0, 4);
  const width = Math.min(0.34, Math.max(0.2, initials.length * 0.085));

  return {
    mesh: hit.object,
    meshName: hit.object.name || hit.object.parent?.name || "unnamed-mesh",
    position,
    normal,
    orientation: helper.rotation.clone(),
    size: new THREE.Vector3(width, 0.105, 0.085),
  };
}

function createPlacementSnapshot(placement: InitialsPlacement, config: StrapConfig): InitialsPlacementSnapshot {
  const model = HERO_TEXTURE_OPTIONS.find((option) => option.id === config.baseHeroStyle) ?? HERO_TEXTURE_OPTIONS[0];

  return {
    model: {
      id: model.id,
      src: model.src,
    },
    mesh: {
      name: placement.meshName,
    },
    mark: {
      text: config.emboss.trim().slice(0, 4),
      color: config.accentColor,
    },
    position: vectorToObject(placement.position),
    normal: vectorToObject(placement.normal),
    rotation: vectorToObject(placement.orientation),
    size: vectorToObject(placement.size),
  };
}

function applyInitialsDecal(parts: SceneParts, placement: InitialsPlacement, text: string, accentColor: string) {
  clearInitialsDecal(parts);

  const trimmed = text.trim().slice(0, 4);
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
  const strokeColor = fillColor === "#0a0a0a" ? "rgba(244, 239, 230, 0.95)" : "rgba(10, 10, 10, 0.8)";

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.font = "900 136px Inter, Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = text.length <= 2 ? "22px" : "12px";
  context.lineWidth = 12;
  context.strokeStyle = strokeColor;
  context.fillStyle = fillColor;
  context.strokeText(text, 0, 8);
  context.fillText(text, 0, 8);
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
    drawSaffiano(context, config.baseColor, config.accentColor, size);
  } else if (config.textureStyle === "rally") {
    drawRally(context, config.baseColor, config.accentColor, size);
  } else if (config.textureStyle === "checker") {
    drawChecker(context, config.baseColor, size);
  } else if (config.textureStyle === "wave") {
    drawWave(context, config.baseColor, config.accentColor, size);
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

function drawSaffiano(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  context.fillStyle = baseColor;
  context.fillRect(0, 0, size, size);
  context.lineWidth = 3;

  for (let i = -size; i < size * 2; i += 22) {
    context.strokeStyle = withAlpha("#ffffff", 0.16);
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + size, size);
    context.stroke();

    context.strokeStyle = withAlpha(accentColor, 0.18);
    context.beginPath();
    context.moveTo(i + 12, size);
    context.lineTo(i + size + 12, 0);
    context.stroke();
  }
}

function drawRally(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  context.fillStyle = baseColor;
  context.fillRect(0, 0, size, size);
  context.fillStyle = withAlpha(accentColor, 0.88);
  context.fillRect(size * 0.44, 0, size * 0.045, size);
  context.fillRect(size * 0.515, 0, size * 0.045, size);
  context.fillStyle = withAlpha("#ffffff", 0.14);
  context.fillRect(size * 0.34, 0, size * 0.02, size);
  context.fillRect(size * 0.64, 0, size * 0.02, size);
}

function drawChecker(context: CanvasRenderingContext2D, baseColor: string, size: number) {
  const alternate = shadeColor(baseColor, -34);
  const square = 96;
  for (let y = 0; y < size; y += square) {
    for (let x = 0; x < size; x += square) {
      context.fillStyle = (x / square + y / square) % 2 === 0 ? baseColor : alternate;
      context.fillRect(x, y, square, square);
    }
  }
}

function drawWave(context: CanvasRenderingContext2D, baseColor: string, accentColor: string, size: number) {
  context.fillStyle = baseColor;
  context.fillRect(0, 0, size, size);
  context.lineWidth = 7;
  context.strokeStyle = withAlpha(accentColor, 0.45);

  for (let row = -40; row < size + 80; row += 70) {
    context.beginPath();
    for (let x = 0; x <= size; x += 16) {
      const y = row + Math.sin(x / 52) * 18;
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }
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
