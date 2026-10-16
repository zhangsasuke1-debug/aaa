(function () {
  "use strict";
  const { ref, computed, watch, nextTick } = Vue;
  const VERSION = "v2.3.1-20261016";
  const PREFIX = "teacher-workspace." + VERSION + ".";
  const categories = ["内容", "排版", "跳转", "其他"];
  const storageError = ref("");
  const storage = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (_) {
        storageError.value = "本机存储不可用或数据无法读取，请及时导出批注。";
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        storageError.value = "";
        return true;
      } catch (_) {
        storageError.value = "未能写入本机存储。当前内容仍在，请立即导出备份。";
        return false;
      }
    }
  };
  function download(name, body, mime) {
    const url = URL.createObjectURL(new Blob([body], { type: mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
  const id = () => "n-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));
  const iso = () => new Date().toISOString();
  const stamp = () => new Date().toLocaleString("sv-SE", { timeZone: "Asia/Shanghai" }).replace(/[: ]/g, "-");
  const safeString = (value, max = 5000) => typeof value === "string" ? value.slice(0, max) : "";
  function validContext(raw = {}) {
    if (!raw || typeof raw !== "object") raw = {};
    return {
      chapter: Number.isInteger(raw.chapter) ? Math.max(0, Math.min(2, raw.chapter)) : 0,
      workFilter: PrototypeData.tasks.some(t => t.id === raw.workFilter) ? raw.workFilter : "all",
      search: safeString(raw.search, 160),
      captionIndex: Number.isInteger(raw.captionIndex) ? Math.max(0, Math.min(3000, raw.captionIndex)) : 0,
      videoShotIndex: Number.isInteger(raw.videoShotIndex) ? Math.max(0, Math.min(2, raw.videoShotIndex)) : 0,
      htmlPreviewMode: raw.htmlPreviewMode === "mobile" ? "mobile" : "desktop",
      resourceFilter: raw.resourceFilter && typeof raw.resourceFilter === "object"
        ? Object.fromEntries(["type", "textbook", "grade", "term"].map(key => [key, safeString(raw.resourceFilter[key], 40)])) : {},
      resourceSearch: safeString(raw.resourceSearch, 160), resourceOrder: raw.resourceOrder === "标题" ? "标题" : "最新",
      noticeRegion: safeString(raw.noticeRegion, 40), noticeSearch: safeString(raw.noticeSearch, 160),
      noticeOrder: raw.noticeOrder === "标题" ? "标题" : "最新", sessionId: safeString(raw.sessionId, 110),
      gradeInputMode: raw.gradeInputMode === "text" ? "text" : "image",
      headerMenu: ["appearance", "account"].includes(raw.headerMenu) ? raw.headerMenu : "",
      messageOpen: raw.messageOpen === true, messageTab: raw.messageTab === "announcement" ? "announcement" : "notice",
      expandedMessage: safeString(raw.expandedMessage, 100), tutorialOpen: raw.tutorialOpen === true,
      tutorialChapter: Number.isInteger(raw.tutorialChapter) ? Math.max(0, Math.min(2, raw.tutorialChapter)) : 0,
      imageTab: ["settings", "preview", "records"].includes(raw.imageTab) ? raw.imageTab : "settings",
      imageAdvanced: raw.imageAdvanced === true, imageSample: raw.imageSample === "classroom" ? "classroom" : "earth",
      imageReady: raw.imageReady === true, voiceMode: ["design", "controlled", "precise"].includes(raw.voiceMode) ? raw.voiceMode : "design",
      voiceAdvanced: raw.voiceAdvanced === true, voiceReady: raw.voiceReady === true
    };
  }
  function validNote(raw) {
    if (!raw || typeof raw !== "object" || !/^n-[a-zA-Z0-9-]{1,100}$/.test(raw.id)) throw new Error("批注编号无效");
    if (!PrototypeData.pages.some(p => p.route === raw.page)) throw new Error("包含无法识别的页面");
    if (typeof raw.body !== "string" || !raw.body.trim() || raw.body.length > 5000) throw new Error("批注正文为空或过长");
    const date = value => typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : iso();
    return {
      id: raw.id, page: raw.page, pageTitle: safeString(raw.pageTitle, 100),
      anchor: safeString(raw.anchor, 100) || "page-root", label: safeString(raw.label, 120) || "页面整体",
      excerpt: safeString(raw.excerpt, 240), body: raw.body,
      category: categories.includes(raw.category) ? raw.category : "其他",
      status: raw.status === "resolved" ? "resolved" : "open",
      deleted: raw.deleted === true,
      x: Number.isFinite(raw.x) ? Math.max(0, Math.min(1, raw.x)) : 0.95,
      y: Number.isFinite(raw.y) ? Math.max(0, Math.min(1, raw.y)) : 0.08,
      originVersion: safeString(raw.originVersion, 80) || VERSION,
      sourceExport: raw.sourceExport && typeof raw.sourceExport === "object" ? {
        file: safeString(raw.sourceExport.file, 180), version: safeString(raw.sourceExport.version, 80),
        exportedAt: safeString(raw.sourceExport.exportedAt, 50), sha256: safeString(raw.sourceExport.sha256, 64)
      } : null,
      originalLocation: raw.originalLocation && typeof raw.originalLocation === "object" ? {
        page: safeString(raw.originalLocation.page, 120),
        pageTitle: safeString(raw.originalLocation.pageTitle, 100),
        anchor: safeString(raw.originalLocation.anchor, 100),
        label: safeString(raw.originalLocation.label, 120),
        excerpt: safeString(raw.originalLocation.excerpt, 240),
        x: Number.isFinite(raw.originalLocation.x) ? raw.originalLocation.x : 0.92,
        y: Number.isFinite(raw.originalLocation.y) ? raw.originalLocation.y : 0.08,
        context: validContext(raw.originalLocation.context)
      } : null,
      implementation: Array.isArray(raw.implementation) ? raw.implementation.slice(0, 200).map(entry => ({
        version: safeString(entry.version, 80), at: date(entry.at),
        summary: safeString(entry.summary), state: "pending-user-review",
        files: Array.isArray(entry.files) ? entry.files.filter(f => typeof f === "string").slice(0, 20).map(f => safeString(f, 160)) : [],
        anchor: safeString(entry.anchor, 100)
      })) : [],
      context: validContext(raw.context),
      createdAt: date(raw.createdAt), updatedAt: date(raw.updatedAt),
      history: Array.isArray(raw.history) ? raw.history.slice(0, 200).map(h => ({
        action: safeString(h.action, 40), at: date(h.at), body: safeString(h.body),
        category: categories.includes(h.category) ? h.category : "其他",
        status: h.status === "resolved" ? "resolved" : "open"
      })) : []
    };
  }

  window.ReviewStorage = { ...storage, error: storageError, download, version: VERSION };
  window.createReview = function (ctx) {
    let initial = [];
    try {
      const saved = storage.read("notes", null);
      if (saved === null) {
        initial = (window.ReviewSeed?.notes || []).map(validNote);
        if (!storageError.value) storage.write("notes", initial);
      } else {
      if (!Array.isArray(saved)) throw new Error();
      initial = saved.map(validNote);
      }
    } catch (_) {
      storageError.value = "已有批注数据格式异常。未自动清除，请保留原浏览器数据。";
    }
    const notes = ref(initial);
    const initialDraft = storage.read("draft", null);
    const draft = ref(initialDraft && typeof initialDraft.body === "string" &&
      PrototypeData.pages.some(p => p.route === initialDraft.page) ? initialDraft : null);
    const mode = ref(false);
    const panel = ref(Boolean(draft.value && draft.value.body));
    const scope = ref("page");
    const status = ref("active");
    const selected = ref(null);
    const pins = ref([]);
    const outline = ref(null);
    const exportMenu = ref(false);
    const savedAt = ref("");
    const error = ref("");
    const historyId = ref(null);
    const total = computed(() => notes.value.filter(n => !n.deleted).length);
    const pending = computed(() => notes.value.filter(n => !n.deleted && n.status === "open").length);
    const visible = computed(() => notes.value.filter(n =>
      (scope.value === "all" || n.page === ctx.route.value) &&
      (status.value === "trash" ? n.deleted : !n.deleted && (status.value === "active" || n.status === status.value))
    ).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    const countOnPage = computed(() => notes.value.filter(n => !n.deleted && n.page === ctx.route.value).length);
    function anchorFor(name) {
      return Array.from(document.querySelectorAll(".website-surface [data-review]")).find(el => el.dataset.review === name);
    }
    let frame = 0;
    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const surface = document.querySelector(".website-surface");
        if (!surface) return;
        const bounds = surface.getBoundingClientRect();
        const positions = [];
        notes.value.filter(n => n.page === ctx.route.value && !n.deleted).forEach(n => {
          const el = anchorFor(n.anchor);
          if (!el || !el.getClientRects().length) return;
          const rect = el.getBoundingClientRect();
          if (rect.right <= bounds.left || rect.left >= bounds.right) return;
          const clip = (el.closest(".page-scroll") || surface).getBoundingClientRect();
          const x = Math.min(bounds.right - 15, Math.max(bounds.left + 15, rect.left + rect.width * n.x));
          const y = rect.top + rect.height * n.y;
          if (y < Math.max(bounds.top, clip.top) + 12 || y > Math.min(bounds.bottom, clip.bottom) - 12) return;
          positions.push({ id: n.id, x, y, number: notes.value.indexOf(n) + 1, status: n.status, label: n.label });
        });
        const nextPins = mode.value || panel.value ? positions : [];
        if (JSON.stringify(pins.value) !== JSON.stringify(nextPins)) pins.value = nextPins;
        const current = draft.value || notes.value.find(n => n.id === selected.value);
        const target = current && current.page === ctx.route.value ? anchorFor(current.anchor) : null;
        if (target && target.getClientRects().length && (mode.value || panel.value)) {
          const r = target.getBoundingClientRect();
          const clip = (target.closest(".page-scroll") || surface).getBoundingClientRect();
          const top = Math.max(r.top, bounds.top, clip.top);
          const bottom = Math.min(r.bottom, bounds.bottom, clip.bottom);
          const nextOutline = bottom > top ? {
            left: Math.max(r.left, bounds.left), top,
            width: Math.min(r.right, bounds.right) - Math.max(r.left, bounds.left),
            height: bottom - top
          } : null;
          if (JSON.stringify(outline.value) !== JSON.stringify(nextOutline)) outline.value = nextOutline;
        } else if (outline.value) outline.value = null;
      });
    }
    function focusEditor() {
      nextTick(() => document.getElementById("note-body")?.focus());
    }
    function abandonDraft() {
      if (draft.value?.body.trim() && !window.confirm("当前批注还未保存。放弃这段草稿并选择其他批注位置吗？")) return false;
      draft.value = null;
      error.value = "";
      return true;
    }
    function selectRegion(el, event) {
      if (!abandonDraft()) return;
      const rect = el.getBoundingClientRect();
      draft.value = {
        id: null, page: ctx.route.value, pageTitle: ctx.title.value,
        anchor: el.dataset.review, label: el.dataset.reviewLabel || "页面整体",
        excerpt: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 180),
        context: ctx.getContext(),
        x: event && rect.width ? Math.max(0.02, Math.min(0.98, (event.clientX - rect.left) / rect.width)) : 0.92,
        y: event && rect.height ? Math.max(0.02, Math.min(0.98, (event.clientY - rect.top) / rect.height)) : 0.08,
        category: "排版", body: ""
      };
      selected.value = null;
      panel.value = true;
      focusEditor();
      schedule();
    }
    function capture(event) {
      if (!mode.value) return;
      const target = event.target.closest("[data-review]");
      if (!target || !target.closest(".website-surface")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      selectRegion(target, event.detail === 0 ? null : event);
    }
    function captureKey(event) {
      if (mode.value && (event.key === "Enter" || event.key === " ") && event.target.matches("[data-review]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        selectRegion(event.target);
      }
    }
    function attrs(key, label) {
      return { "data-review": key, "data-review-label": label,
        tabindex: mode.value ? 0 : undefined };
    }
    function setMode(value) {
      mode.value = value;
      if (value) panel.value = window.innerWidth > 760;
      else if (!draft.value?.body) panel.value = false;
      schedule();
    }
    function save() {
      if (!draft.value?.body.trim()) {
        error.value = "请先写下你的意见。";
        focusEditor();
        return;
      }
      const d = draft.value;
      if (d.body.length > 5000) { error.value = "批注最多 5000 字。"; return; }
      const existing = notes.value.find(n => n.id === d.id);
      const when = iso();
      if (existing) {
        existing.body = d.body.trim();
        existing.category = d.category;
        existing.updatedAt = when;
        existing.history.push({ action: "编辑", at: when, body: existing.body, category: existing.category, status: existing.status });
        selected.value = existing.id;
      } else {
        const n = { ...d, id: id(), body: d.body.trim(), createdAt: when, updatedAt: when,
          originVersion: VERSION, status: "open", deleted: false, history: [] };
        n.history.push({ action: "创建", at: when, body: n.body, category: n.category, status: n.status });
        notes.value.push(n);
        selected.value = n.id;
      }
      draft.value = null;
      status.value = "active";
      error.value = "";
      ctx.toast("批注已记录");
      schedule();
    }
    function edit(note) {
      if (!abandonDraft()) return;
      draft.value = { ...note };
      panel.value = true;
      focusEditor();
    }
    function revise(note, action) {
      const when = iso();
      note.updatedAt = when;
      note.history.push({ action, at: when, body: note.body, category: note.category, status: note.status });
    }
    function toggle(note) {
      note.status = note.status === "open" ? "resolved" : "open";
      revise(note, note.status === "resolved" ? "用户确认已调整" : "重新打开");
    }
    function remove(note) {
      if (!window.confirm("将这条批注移入回收站？可在回收站恢复。")) return;
      if (draft.value?.id === note.id) draft.value = null;
      note.deleted = true;
      revise(note, "移入回收站");
    }
    function restore(note) { note.deleted = false; revise(note, "恢复"); }
    async function locate(note) {
      if (draft.value && !abandonDraft()) return;
      panel.value = true;
      selected.value = note.id;
      await ctx.navigate(note.page);
      ctx.restoreContext(note.context);
      ctx.prepareAnchor?.(note.anchor);
      await nextTick();
      const target = anchorFor(note.anchor);
      if (target) {
        target.scrollIntoView({ block: "center", behavior: "instant" });
        target.focus({ preventScroll: true });
      } else ctx.toast("原批注区域未找到，已定位到对应页面。");
      schedule();
    }
    function pageNote() {
      selectRegion(anchorFor("page-root"));
    }
    function exportNotes(format = "json") {
      exportMenu.value = false;
      if (draft.value?.body.trim()) {
        ctx.toast("还有未保存的批注，请先保存或取消草稿。");
        panel.value = true;
        focusEditor();
        return;
      }
      const payload = {
        schema: "teacher-review-notes/1", projectId: PrototypeData.projectId,
        reviewVersion: VERSION, exportedAt: iso(), timezone: "Asia/Shanghai",
        pages: PrototypeData.pages.map(p => ({ route: p.route, title: p.title })),
        notes: notes.value
      };
      if (format === "json") download(`页面批注-${VERSION}-${stamp()}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
      else {
        const lines = ["# 页面评审批注", "", `评审版本：${VERSION}`, `导出时间：${stamp()}（北京时间）`,
          "", "本文件仅供阅读；恢复批注请使用 JSON 版。", ""];
        notes.value.forEach((n, index) => {
          lines.push(`## ${index + 1}. ${n.pageTitle} / ${n.label}`, "",
            `状态：${n.deleted ? "回收站" : n.status === "resolved" ? "用户已确认" : n.implementation?.length ? "已调整，待用户复核" : "待调整"} | 类别：${n.category}`,
            `批注编号：${n.id}`, `来源版本：${n.originVersion}`, `页面：${n.page} | 区域：${n.anchor}`, "",
            "意见：", n.body, "");
          if (n.originalLocation) lines.push(`原始位置：${n.originalLocation.page} | ${n.originalLocation.anchor}`, "");
          (n.implementation || []).forEach(entry => lines.push(`调整记录：${entry.version} / ${entry.at}`, entry.summary,
            ...(entry.files?.length ? ["对应文件：" + entry.files.join("、")] : []), ""));
          lines.push("历史：");
          n.history.forEach(h => lines.push(`- ${h.at} ${h.action}：${h.body.replace(/\n/g, " / ")}`));
          lines.push("");
        });
        download(`页面批注-${VERSION}-${stamp()}.md`, lines.join("\n"), "text/markdown;charset=utf-8");
      }
      ctx.toast("已发起批注下载，请保留导出文件。");
    }
    async function importNotes(event) {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      try {
        if (file.size > 5 * 1024 * 1024) throw new Error("文件不能超过 5 MB");
        const data = JSON.parse(await file.text());
        if (data.schema !== "teacher-review-notes/1" || data.projectId !== PrototypeData.projectId || !Array.isArray(data.notes))
          throw new Error("这不是本原型导出的批注 JSON");
        if (data.notes.length > 1000) throw new Error("单次最多导入 1000 条批注");
        const incoming = data.notes.map(validNote);
        const known = new Set(notes.value.map(n => n.id));
        const fresh = incoming.filter(n => {
          if (known.has(n.id)) return false;
          known.add(n.id);
          return true;
        });
        if (!fresh.length) { ctx.toast("没有新批注；已有编号未被覆盖。"); return; }
        const source = safeString(data.reviewVersion, 80) || "未知版本";
        if (!window.confirm(`从 ${source} 合并 ${fresh.length} 条新批注？已有编号保留，不会被覆盖。`)) return;
        notes.value.push(...fresh);
        scope.value = "all";
        status.value = "active";
        panel.value = true;
        ctx.toast(`已导入 ${fresh.length} 条批注`);
      } catch (err) {
        ctx.toast("导入失败：" + (err.message || "文件格式错误"));
      }
    }
    watch(notes, () => {
      if (storage.write("notes", notes.value)) savedAt.value = new Date().toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit" });
      schedule();
    }, { deep: true });
    watch(draft, value => { storage.write("draft", value); schedule(); }, { deep: true });
    watch([ctx.route, mode, panel], () => nextTick(schedule));
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, true);
    document.addEventListener("transitionend", schedule, true);
    window.addEventListener("beforeunload", event => {
      if (storageError.value && (notes.value.length || draft.value?.body.trim())) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
    return {
      mode, panel, notes, draft, total, pending, visible, countOnPage, scope, status,
      selected, pins, outline, exportMenu, savedAt, error, historyId, storageError,
      categories, version: VERSION, capture, captureKey, attrs, setMode, save, edit, toggle,
      remove, restore, locate, pageNote, exportNotes, importNotes, abandonDraft, schedule,
      number: note => notes.value.findIndex(n => n.id === note.id) + 1,
      time: value => new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    };
  };
}());
