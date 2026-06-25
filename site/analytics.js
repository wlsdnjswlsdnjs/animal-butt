const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

if (!localHosts.has(window.location.hostname)) {
  window.va = window.va || function (...params) {
    window.vaq = window.vaq || [];
    window.vaq.push(params);
  };

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  script.dataset.sdkn = "@vercel/analytics";
  script.dataset.sdkv = "2.0.1";
  document.head.appendChild(script);
}
