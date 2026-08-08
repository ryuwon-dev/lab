const dayCount = 90;
const dayMs = 24 * 60 * 60 * 1000;

const services = [
  {
    id: "status",
    name: "status.ryuwon.me",
    label: "서비스 상태",
    componentCount: 1,
    url: window.location.origin
  },
  {
    id: "auth",
    name: "auth.ryuwon.me",
    label: "로그인과 SSO",
    componentCount: 2,
    url: "https://auth.ryuwon.me"
  },
  {
    id: "automation",
    name: "n8n.ryuwon.me",
    label: "자동화 워크플로우",
    componentCount: 1,
    url: "https://n8n.ryuwon.me"
  },
  {
    id: "deploy",
    name: "argo.ryuwon.me",
    label: "Argo CD",
    componentCount: 1,
    url: "https://argo.ryuwon.me"
  }
];

const labels = {
  checking: "확인 중",
  ok: "접속 가능",
  warn: "주의",
  down: "접속 실패",
  unknown: "기록 없음"
};

const serviceList = document.querySelector("#service-list");
const serviceTemplate = document.querySelector("#service-template");
const statusNotice = document.querySelector("#status-notice");
const noticeTitle = document.querySelector("#notice-title");
const noticeCopy = document.querySelector("#notice-copy");
const noticeMeta = document.querySelector("#notice-meta");
const statusRange = document.querySelector("#status-range");
const refreshControl = document.querySelector("#refresh-control");
const tooltip = document.querySelector("#segment-tooltip");

function timeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

async function probeService(service) {
  const timeout = timeoutSignal(4500);

  try {
    await fetch(service.url, {
      cache: "no-store",
      mode: "no-cors",
      signal: timeout.signal
    });
    return { ...service, liveState: "ok" };
  } catch {
    return { ...service, liveState: "down" };
  } finally {
    timeout.done();
  }
}

function setStateClass(element, state) {
  element.classList.remove("checking", "ok", "warn", "down", "unknown");
  element.classList.add(state);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(date) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long"
  }).format(date);
}

function buildDateWindow(referenceDate = new Date()) {
  const end = new Date(referenceDate);
  end.setHours(0, 0, 0, 0);

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(end.getTime() - ((dayCount - index - 1) * dayMs));
    return {
      date,
      iso: formatDateInput(date),
      displayDate: formatFullDate(date),
      isToday: index === dayCount - 1
    };
  });
}

function formatRange(days) {
  const first = days[0].date;
  const last = days[days.length - 1].date;
  return `${formatMonth(first)} - ${formatMonth(last)}`;
}

function publicDefaultEvents(state) {
  if (state === "ok") {
    return [
      "지금 브라우저에서 이 주소에 접속했습니다.",
      "이 페이지는 내부 헬스체크까지 판단하지 않습니다."
    ];
  }
  if (state === "unknown") {
    return [
      "이 날짜에는 남겨둔 상태 기록이 없습니다.",
      "기록이 없다고 해서 정상이나 장애를 뜻하지는 않습니다."
    ];
  }
  if (state === "checking") {
    return ["지금 주소를 확인하고 있습니다."];
  }
  return [
    "지금 브라우저에서 이 주소에 접속하지 못했습니다.",
    "내부 장애 원인은 이 페이지에 공개하지 않습니다."
  ];
}

function historyEntry(service, day) {
  if (day.isToday && service.liveState === "checking") {
    return {
      date: day,
      state: "checking",
      events: publicDefaultEvents("checking")
    };
  }

  if (day.isToday && service.liveState === "down") {
    return {
      date: day,
      state: "down",
      events: publicDefaultEvents("down")
    };
  }

  if (day.isToday && service.liveState === "ok") {
    return {
      date: day,
      state: "ok",
      events: publicDefaultEvents("ok")
    };
  }

  return {
    date: day,
    state: "unknown",
    events: publicDefaultEvents("unknown")
  };
}

function buildHistory(service, days) {
  return days.map((day) => historyEntry(service, day));
}

function currentState(entries) {
  return entries[entries.length - 1]?.state ?? "unknown";
}

function historyLabelForEntries(entries) {
  const state = currentState(entries);
  if (state === "checking") {
    return "확인 중";
  }
  if (state === "down") {
    return "현재 확인 필요";
  }
  return "현재 접속 가능";
}

function componentText(count) {
  return `${count}개 구성요소`;
}

function createEventItem(event, state) {
  const item = document.createElement("li");
  const icon = document.createElement("span");
  const copy = document.createElement("span");
  icon.className = `tooltip-event-icon ${state}`;
  icon.setAttribute("aria-hidden", "true");
  copy.textContent = event;
  item.append(icon, copy);
  return item;
}

function showTooltip(button) {
  const events = JSON.parse(button.dataset.events);
  const title = document.createElement("strong");
  const list = document.createElement("ul");
  const viewportPadding = 14;

  title.className = "tooltip-date";
  title.textContent = button.dataset.displayDate;
  list.className = "tooltip-events";
  list.replaceChildren(...events.map((event) => createEventItem(event, button.dataset.state)));
  tooltip.replaceChildren(title, list);

  tooltip.hidden = false;
  tooltip.classList.add("visible");

  const buttonRect = button.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const centeredLeft = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);
  const left = Math.max(
    viewportPadding,
    Math.min(centeredLeft, window.innerWidth - tooltipRect.width - viewportPadding)
  );
  let top = buttonRect.bottom + 10;

  if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
    top = buttonRect.top - tooltipRect.height - 10;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.max(viewportPadding, top)}px`;
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTooltip() {
  tooltip.classList.remove("visible");
  tooltip.setAttribute("aria-hidden", "true");
  tooltip.hidden = true;
}

function renderSegments(container, service, entries) {
  const buttons = entries.map((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `segment-button ${entry.state}`;
    button.dataset.serviceId = service.id;
    button.dataset.date = entry.date.iso;
    button.dataset.state = entry.state;
    button.dataset.displayDate = entry.date.displayDate;
    button.dataset.events = JSON.stringify(entry.events);
    button.setAttribute("aria-describedby", "segment-tooltip");
    button.setAttribute(
      "aria-label",
      `${service.name} ${entry.date.displayDate}: ${labels[entry.state]}. ${entry.events.join(" ")}`
    );
    button.addEventListener("mouseenter", () => showTooltip(button));
    button.addEventListener("focus", () => showTooltip(button));
    button.addEventListener("mouseleave", hideTooltip);
    button.addEventListener("blur", hideTooltip);
    button.addEventListener("click", () => showTooltip(button));
    return button;
  });

  container.replaceChildren(...buttons);
}

function renderRows(results, days) {
  serviceList.replaceChildren(...results.map((service) => {
    const entries = buildHistory(service, days);
    const state = currentState(entries);
    const node = serviceTemplate.content.cloneNode(true);
    const row = node.querySelector(".service-row");
    const name = node.querySelector(".service-name");
    const label = node.querySelector(".service-label");
    const componentCount = node.querySelector(".component-count");
    const historyLabel = node.querySelector(".history-value");
    const strip = node.querySelector(".availability-strip");

    row.classList.add(state);
    name.textContent = service.name;
    label.textContent = service.label;
    componentCount.textContent = componentText(service.componentCount);
    historyLabel.textContent = historyLabelForEntries(entries);
    strip.setAttribute("aria-label", `${service.name} 최근 ${dayCount}일 상태 막대`);
    renderSegments(strip, service, entries);
    return node;
  }));
}

function renderSummary(results, days) {
  const rows = results.map((service) => ({
    ...service,
    state: currentState(buildHistory(service, days))
  }));
  const down = rows.filter((service) => service.state === "down");
  const noticeState = down.length > 0 ? "down" : "ok";

  statusRange.textContent = formatRange(days);
  setStateClass(statusNotice, noticeState);

  if (down.length > 0) {
    noticeTitle.textContent = "일부 서비스에 연결할 수 없습니다";
    noticeCopy.textContent = `${down.map((service) => service.name).join(", ")}에 접속하지 못했습니다.`;
    noticeMeta.textContent = "브라우저에서 보이는 접속 상태만 표시합니다. 내부 장애 원인은 공개하지 않습니다.";
    return;
  }

  noticeTitle.textContent = "공개 주소에 접속할 수 있습니다";
  noticeCopy.textContent = "status.ryuwon.me, auth.ryuwon.me, n8n.ryuwon.me, argo.ryuwon.me를 확인했습니다.";
  noticeMeta.textContent = "브라우저에서 보이는 접속 상태만 표시합니다. 과거 기록이 없으면 회색으로 둡니다.";
}

function renderChecking(days) {
  const checking = services.map((service) => ({ ...service, liveState: "checking" }));
  renderRows(checking, days);
  setStateClass(statusNotice, "checking");
  statusRange.textContent = formatRange(days);
  noticeTitle.textContent = "주소를 확인하는 중입니다";
  noticeCopy.textContent = "밖에서 열어볼 수 있는 주소만 확인합니다.";
  noticeMeta.textContent = "잠시만 기다려 주세요.";
  hideTooltip();
}

async function refresh() {
  const days = buildDateWindow();
  refreshControl.disabled = true;
  renderChecking(days);

  const results = await Promise.all(services.map(probeService));
  renderRows(results, days);
  renderSummary(results, days);
  refreshControl.disabled = false;
}

refreshControl.addEventListener("click", refresh);
window.addEventListener("resize", hideTooltip);
document.addEventListener("scroll", hideTooltip, { passive: true });

refresh();
setInterval(refresh, 60_000);
