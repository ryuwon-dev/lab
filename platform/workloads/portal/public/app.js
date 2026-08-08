const state = {
  services: [],
  health: {
    checkedAt: null,
    services: {}
  },
  query: "",
  category: "all",
  status: "all",
  loadError: ""
};

const serviceGridEl = document.querySelector("#service-grid");
const template = document.querySelector("#service-card-template");
const searchEl = document.querySelector("#service-search");
const categoryFilterEl = document.querySelector("#category-filter");
const statusFilterEl = document.querySelector("#status-filter");
const serviceCountEl = document.querySelector("#service-count");
const systemSummaryEl = document.querySelector("#system-summary");
const recentActivityEl = document.querySelector("#recent-activity");

const healthLabels = {
  ok: "정상",
  degraded: "경고",
  down: "장애",
  unknown: "미확인"
};

const stageLabels = {
  live: "운영",
  gated: "제한",
  planned: "예정"
};

const serviceDescriptions = {
  "lab-portal": "서비스 포털 및 대시보드",
  authentik: "로그인과 접근 제어",
  argocd: "GitOps 배포 콘솔",
  n8n: "워크플로우 자동화",
  status: "공개 상태 페이지",
  grafana: "메트릭과 로그 시각화",
  vaultwarden: "비밀번호 관리자",
  docs: "운영 문서와 런북",
  go: "짧은 링크와 북마크",
  "kospi-dashboard": "시장 지표 대시보드"
};

const serviceIcons = {
  "lab-portal": `<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 9h16M8 13h4M8 16h7"></path></svg>`,
  authentik: `<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6zM9 12l2 2 4-5"></path></svg>`,
  argocd: `<svg viewBox="0 0 24 24"><path d="M12 3 4 8l8 5 8-5zM4 12l8 5 8-5M4 16l8 5 8-5"></path></svg>`,
  n8n: `<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="7" r="3"></circle><circle cx="18" cy="17" r="3"></circle><path d="M9 12h4l2-3M13 12l2 3"></path></svg>`,
  status: `<svg viewBox="0 0 24 24"><path d="M4 14h4l2-7 4 11 2-6h4"></path></svg>`,
  grafana: `<svg viewBox="0 0 24 24"><path d="M12 21a8 8 0 1 1 7.5-10.7M12 17a4 4 0 1 1 3.5-5.9M12 13a1 1 0 1 1 1-1"></path></svg>`,
  vaultwarden: `<svg viewBox="0 0 24 24"><path d="M12 3 5 7v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V7zM9 12h6M12 9v6"></path></svg>`,
  docs: `<svg viewBox="0 0 24 24"><path d="M6 4h9l3 3v13H6zM15 4v4h4M9 12h6M9 16h5"></path></svg>`,
  go: `<svg viewBox="0 0 24 24"><path d="M10 7h4a5 5 0 0 1 0 10h-4M14 12H7M8 8l-4 4 4 4"></path></svg>`,
  "kospi-dashboard": `<svg viewBox="0 0 24 24"><path d="M4 19h16M5 16l4-5 4 3 5-8M5 8h3M5 12h2"></path></svg>`
};

function normalize(value) {
  return String(value || "").toLowerCase();
}

function serviceId(service) {
  if (service.id) return service.id;
  return normalize(service.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalizedHealth(value) {
  if (["ok", "degraded", "down", "unknown"].includes(value)) return value;
  return "unknown";
}

function healthFor(service) {
  const record = state.health.services?.[serviceId(service)] || {};
  return {
    health: normalizedHealth(record.health),
    latencyMs: Number.isFinite(record.latencyMs) ? Math.round(record.latencyMs) : null,
    message: record.message || "점검 전",
    checkedAt: record.checkedAt || state.health.checkedAt || null
  };
}

function messageText(message) {
  if (message === "planned") return "서비스 준비중";
  if (message === "check disabled") return "점검 제외";
  if (message === "not checked") return "점검 전";
  if (message === "no check url") return "점검 주소 없음";
  if (message === "timeout") return "응답 시간 초과";
  if (message === "unreachable") return "접속 실패";
  if (/^HTTP \d+/.test(message)) return message.replace("HTTP", "응답");
  return message;
}

function formatCheckedAt(value, latencyMs) {
  if (!value) return "미확인";

  const checkedAt = new Date(value);
  if (Number.isNaN(checkedAt.getTime())) return "미확인";

  const seconds = Math.max(0, Math.round((Date.now() - checkedAt.getTime()) / 1000));
  let text = `${seconds}초 전`;
  if (seconds >= 3600) text = `${Math.round(seconds / 3600)}시간 전`;
  else if (seconds >= 60) text = `${Math.round(seconds / 60)}분 전`;

  return latencyMs === null ? text : `${text} / ${latencyMs}ms`;
}

function visibleServices() {
  return state.services.filter((service) => {
    const health = healthFor(service);
    const haystack = [
      service.name,
      service.url,
      service.access,
      service.stage,
      service.owner,
      health.health,
      health.message
    ].map(normalize).join(" ");

    if (state.category !== "all" && service.group !== state.category) return false;
    if (state.status !== "all" && health.health !== state.status) return false;
    return haystack.includes(normalize(state.query));
  });
}

function counts() {
  return state.services.reduce((acc, service) => {
    const health = healthFor(service).health;
    acc.total += 1;
    acc[health] += 1;
    return acc;
  }, { total: 0, ok: 0, degraded: 0, down: 0, unknown: 0 });
}

function averageLatency() {
  const latencies = state.services
    .map((service) => healthFor(service).latencyMs)
    .filter((value) => Number.isFinite(value));

  if (latencies.length === 0) return "미확인";
  return `${Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)}ms`;
}

function uptimeText(summary) {
  const checked = summary.ok + summary.degraded + summary.down;
  if (checked === 0) return "미확인";
  return `${((summary.ok / checked) * 100).toFixed(2)}%`;
}

function renderSystemSummary() {
  const summary = counts();
  const rows = [
    ["전체 서비스", summary.total, "neutral"],
    ["정상", summary.ok, "ok"],
    ["경고", summary.degraded, "warn"],
    ["장애", summary.down, "down"],
    ["업타임", uptimeText(summary), "neutral"],
    ["평균 응답 시간", averageLatency(), "neutral"]
  ];

  systemSummaryEl.replaceChildren(...rows.map(([label, value, tone]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    const dot = document.createElement("span");
    dot.className = `summary-dot ${tone}`;
    dt.append(dot, document.createTextNode(label));
    dd.textContent = value;
    wrapper.append(dt, dd);
    return wrapper;
  }));
}

function renderActivities() {
  const live = state.services
    .filter((service) => service.stage !== "planned")
    .slice(0, 3);

  const activities = live.length > 0
    ? live.map((service) => {
      const health = healthFor(service);
      return [
        `${service.name} ${messageText(health.message)}`,
        formatCheckedAt(health.checkedAt, null)
      ];
    })
    : [["서비스 목록 갱신", "방금 전"]];

  recentActivityEl.replaceChildren(...activities.map(([label, time]) => {
    const item = document.createElement("li");
    const dot = document.createElement("span");
    const text = document.createElement("strong");
    const meta = document.createElement("em");
    dot.setAttribute("aria-hidden", "true");
    text.textContent = label;
    meta.textContent = time;
    item.append(dot, text, meta);
    return item;
  }));
}

function renderServices() {
  const services = visibleServices();
  serviceGridEl.innerHTML = "";
  serviceCountEl.textContent = String(services.length);

  if (services.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = state.loadError || "조건에 맞는 서비스가 없습니다.";
    serviceGridEl.append(empty);
    return;
  }

  for (const service of services) {
    const health = healthFor(service);
    const node = template.content.cloneNode(true);
    const link = node.querySelector("a");
    const icon = node.querySelector(".service-card__icon");
    const title = node.querySelector("strong");
    const owner = node.querySelector("em");
    const desc = node.querySelector(".service-card__desc");
    const status = node.querySelector(".service-card__status");

    link.href = service.url;
    icon.innerHTML = serviceIcons[serviceId(service)] || serviceIcons["lab-portal"];
    title.textContent = service.name;
    owner.textContent = service.owner;
    desc.textContent = serviceDescriptions[serviceId(service)] || `${stageLabels[service.stage] || "서비스"} 서비스`;
    status.textContent = healthLabels[health.health];
    status.classList.add(health.health);
    link.classList.add(health.health);

    serviceGridEl.append(node);
  }
}

function render() {
  renderServices();
  renderSystemSummary();
  renderActivities();
}

async function loadServices() {
  const response = await fetch("./services.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load services.json: ${response.status}`);
  const data = await response.json();
  if (Array.isArray(data.services)) state.services = data.services;
}

async function loadHealth() {
  const response = await fetch("./health.json", { cache: "no-store" });
  if (!response.ok) return;

  const data = await response.json();
  state.health = {
    checkedAt: data.checkedAt || null,
    services: data.services || {}
  };
}

searchEl.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

categoryFilterEl.addEventListener("change", (event) => {
  state.category = event.target.value;
  render();
});

statusFilterEl.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});

async function boot() {
  try {
    await loadServices();
    await loadHealth();
  } catch {
    state.loadError = "서비스 목록을 불러오지 못했습니다.";
  } finally {
    render();
  }
}

boot();
setInterval(() => loadHealth().then(render).catch(() => {}), 60_000);
