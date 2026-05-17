const MODEL_VIEWER_SRC = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
const MODEL_VIEWER_SCRIPT_ID = "model-viewer-runtime";

let loading: Promise<void> | null = null;

export function ensureModelViewerScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.customElements.get("model-viewer")) {
    return Promise.resolve();
  }

  if (loading) return loading;

  const waitForDefinition = () => window.customElements.whenDefined("model-viewer").then(() => undefined);

  loading = new Promise((resolve, reject) => {
    const existing = document.getElementById(MODEL_VIEWER_SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset.loaded === "true") {
        waitForDefinition().then(resolve).catch(reject);
        return;
      }

      existing.addEventListener("load", () => waitForDefinition().then(resolve).catch(reject), { once: true });
      existing.addEventListener("error", () => reject(new Error("model-viewer failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = MODEL_VIEWER_SCRIPT_ID;
    script.type = "module";
    script.async = true;
    script.src = MODEL_VIEWER_SRC;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        waitForDefinition().then(resolve).catch(reject);
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error("model-viewer failed to load")), { once: true });
    document.head.appendChild(script);
  });

  return loading.catch(() => {
    loading = null;
  });
}
