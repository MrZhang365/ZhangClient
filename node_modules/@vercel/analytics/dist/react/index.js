// src/react.tsx
import { useEffect } from "react";

// src/queue.ts
var initQueue = () => {
  if (window.va)
    return;
  window.va = function a(...params) {
    (window.vaq = window.vaq || []).push(params);
  };
};

// src/utils.ts
function isBrowser() {
  return typeof window !== "undefined";
}
function isDevelopment() {
  if (typeof process === "undefined")
    return false;
  return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
}

// src/generic.ts
var inject = ({ beforeSend, debug } = { debug: isDevelopment() }) => {
  var _a;
  if (!isBrowser())
    return;
  initQueue();
  if (beforeSend) {
    (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", beforeSend);
  }
  const src = isDevelopment() ? "https://cdn.vercel-insights.com/v1/script.debug.js" : "/_vercel/insights/script.js";
  if (document.head.querySelector(`script[src*="${src}"]`))
    return;
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  if (isDevelopment() && debug === false) {
    script.setAttribute("data-debug", "false");
  }
  document.head.appendChild(script);
};

// src/react.tsx
function Analytics({
  beforeSend,
  debug = isDevelopment()
}) {
  useEffect(() => {
    inject({ beforeSend, debug });
  }, [beforeSend, debug]);
  return null;
}
export {
  Analytics
};
//# sourceMappingURL=index.js.map