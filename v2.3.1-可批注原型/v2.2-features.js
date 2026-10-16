(function () {
  "use strict";
  const { ref, reactive, computed, watch } = Vue;
  const data = PrototypeData;
  const makeId = prefix => prefix + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));
  const now = () => new Date().toISOString();
  const text = (value, limit = 3000) => typeof value === "string" ? value.slice(0, limit) : "";
  const models = ["通用模型", "推理模型", "创作模型"];
  const speeds = ["快速", "均衡", "细致"];
  function subjectsFor(form) {
    const stage = data.education[form.stage] || data.education["小学"];
    const list = [...stage.subjects];
    if (form.stage === "小学" && stage.grades.indexOf(form.grade) >= 2) list.splice(2, 0, "英语");
    if (form.stage === "初中") {
      if (["八年级", "九年级"].includes(form.grade)) list.push("物理");
      if (form.grade === "九年级") list.push("化学");
    }
    return [...list, "其他"];
  }
  function normalizeScope(form) {
    if (!data.education[form.stage]) form.stage = "小学";
    const grades = data.education[form.stage].grades;
    if (!grades.includes(form.grade)) form.grade = grades[0];
    const subjects = subjectsFor(form);
    if (!subjects.includes(form.subject)) form.subject = subjects[0];
  }
  window.createV22Features = function (ctx) {
    const resourceFilter = reactive({ type: "不限", textbook: "不限", grade: "不限", term: "不限" });
    const resourceSearch = ref("");
    const resourceOrder = ref("最新");
    const noticeRegion = ref("全部");
    const noticeSearch = ref("");
    const noticeOrder = ref("最新");
    const resource = computed(() => data.resources.find(r => ctx.route.value === "/resources/" + r.id));
    const notice = computed(() => data.notices.find(n => ctx.route.value === "/notices/" + n.id));
    const filteredResources = computed(() => data.resources.filter(r =>
      Object.entries(resourceFilter).every(([key, value]) => value === "不限" || r[key] === value) &&
      r.title.includes(resourceSearch.value.trim())
    ).slice().sort((a, b) => resourceOrder.value === "标题" ? a.title.localeCompare(b.title, "zh-CN") : b.date.localeCompare(a.date)));
    const filteredNotices = computed(() => data.notices.filter(n =>
      (noticeRegion.value === "全部" || n.region === noticeRegion.value) && n.title.includes(noticeSearch.value.trim())
    ).slice().sort((a, b) => noticeOrder.value === "标题" ? a.title.localeCompare(b.title, "zh-CN") : b.date.localeCompare(a.date)));
    const home = reactive({ draft: "", model: "通用模型", speed: "均衡", attachments: [] });
    function freshSession(title = "新任务会话") {
      return { id: makeId("s-"), title, createdAt: now(), updatedAt: now(), pinned: false, draft: "", model: models[0], speed: speeds[1], attachments: [], messages: [] };
    }
    function fileMeta(file) {
      return { id: makeId("f-"), name: text(file.name, 160), size: file.size, type: text(file.type, 100) };
    }
    function cleanFiles(files) {
      return Array.isArray(files) ? files.filter(f => f && typeof f.name === "string").slice(0, 10).map(f => ({
        id: text(f.id, 100) || makeId("f-"), name: text(f.name, 160),
        size: Number.isFinite(f.size) ? Math.max(0, f.size) : 0, type: text(f.type, 100)
      })) : [];
    }
    function cleanSession(raw) {
      if (!raw || !/^s-[a-zA-Z0-9-]{1,100}$/.test(raw.id)) return null;
      const base = freshSession();
      return {
        ...base, id: raw.id, title: text(raw.title, 100) || base.title,
        createdAt: text(raw.createdAt, 40) || base.createdAt, updatedAt: text(raw.updatedAt, 40) || base.updatedAt,
        pinned: raw.pinned === true, draft: text(raw.draft), model: models.includes(raw.model) ? raw.model : models[0],
        speed: speeds.includes(raw.speed) ? raw.speed : speeds[1], attachments: cleanFiles(raw.attachments),
        messages: Array.isArray(raw.messages) ? raw.messages.filter(m => m && typeof m.text === "string" && ["user", "ai"].includes(m.role)).slice(-500).map(m => ({
          id: text(m.id, 100) || makeId("m-"), role: m.role, text: text(m.text, 10000),
          task: data.tasks.some(t => t.id === m.task) ? m.task : null, attachments: cleanFiles(m.attachments),
          model: text(m.model, 40), speed: text(m.speed, 40)
        })) : []
      };
    }
    const storedHome = ReviewStorage.read("homeTask", {});
    home.draft = text(storedHome?.draft);
    home.model = models.includes(storedHome?.model) ? storedHome.model : models[0];
    home.speed = speeds.includes(storedHome?.speed) ? storedHome.speed : speeds[1];
    home.attachments = cleanFiles(storedHome?.attachments);
    const stored = ReviewStorage.read("sessions", null);
    const initial = Array.isArray(stored) ? stored.map(cleanSession).filter(Boolean) : [];
    if (stored === null && !ReviewStorage.error.value) {
      const sample = freshSession("《背影》教学思路");
      sample.messages = [
        { id: "sample-question", role: "user", text: "帮我梳理《背影》的教学思路。", attachments: [] },
        { id: "sample-answer", role: "ai", text: "教学思路样例：梳理背影出现的位置，品读动作描写，再安排一段细节表达练习。", task: "prep", attachments: [] }
      ];
      initial.push(sample);
    }
    const sessions = ref(initial);
    if (stored === null && !ReviewStorage.error.value) ReviewStorage.write("sessions", initial);
    const savedActive = ReviewStorage.read("activeSession", "");
    const activeId = ref(initial.some(s => s.id === savedActive) ? savedActive : initial[0]?.id || "");
    if (stored === null && !ReviewStorage.error.value) ReviewStorage.write("activeSession", activeId.value);
    const current = computed(() => sessions.value.find(s => s.id === activeId.value) || null);
    const orderedSessions = computed(() => sessions.value.slice().sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));
    const busyIds = reactive(new Set());
    const busy = computed(() => busyIds.has(activeId.value));
    const menuId = ref("");
    const selectionMode = ref(false);
    const selectedIds = ref([]);
    const dialog = ref("");
    const dialogSessionId = ref("");
    const renameText = ref("");
    const dialogError = ref("");
    const sharedText = ref("");
    const polishDraft = ref("");
    const polishTask = ref("");
    const polishOriginal = ref("");
    let dialogFocus = null;
    function openDialog(name) {
      dialogFocus = document.activeElement;
      ctx.modal.value = "";
      dialog.value = name;
      dialogError.value = "";
      menuId.value = "";
      Vue.nextTick(() => document.querySelector(".v22-dialog [data-autofocus]")?.focus());
    }
    function closeDialog() {
      dialog.value = "";
      dialogError.value = "";
      Vue.nextTick(() => dialogFocus?.isConnected && dialogFocus.focus());
    }
    function newSession(navigate = true) {
      const s = freshSession();
      sessions.value.unshift(s);
      activeId.value = s.id;
      menuId.value = "";
      if (navigate) ctx.navigate("/chat");
      return sessions.value.find(item => item.id === s.id);
    }
    function selectSession(s) {
      activeId.value = s.id;
      menuId.value = "";
      ctx.navigate("/chat");
    }
    function pinSession(s) {
      s.pinned = !s.pinned;
      menuId.value = "";
    }
    function beginRename(s) {
      dialogSessionId.value = s.id;
      renameText.value = s.title;
      openDialog("rename");
    }
    function renameSession() {
      const value = renameText.value.trim();
      if (!value) { dialogError.value = "请填写会话名称。"; return; }
      const s = sessions.value.find(s => s.id === dialogSessionId.value);
      if (s) s.title = value.slice(0, 100);
      closeDialog();
    }
    function sessionText(s) {
      return [s.title, "", ...s.messages.flatMap(m => [
        (m.role === "user" ? "我" : "教学助手（样例）") + "：", m.text,
        ...(m.attachments || []).map(f => "附件：" + f.name), ""
      ])].join("\n");
    }
    function beginShare(s) {
      dialogSessionId.value = s.id;
      sharedText.value = sessionText(s);
      openDialog("share");
    }
    async function copyShare() {
      try {
        if (!navigator.clipboard?.writeText) throw new Error();
        await navigator.clipboard.writeText(sharedText.value);
        ctx.toast("已复制会话文本");
      } catch (_) {
        document.getElementById("shared-session-text")?.select();
        ctx.toast("浏览器未允许自动复制，已选中文本，可使用复制操作。");
      }
    }
    function exportSessions(ids) {
      const records = sessions.value.filter(s => ids.includes(s.id));
      if (!records.length) { ctx.toast("请先选择会话。"); return; }
      ReviewStorage.download("任务会话-" + new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" }) + ".json",
        JSON.stringify({ schema: "teacher-task-sessions/1", version: ReviewStorage.version, exportedAt: now(), sessions: records }, null, 2), "application/json;charset=utf-8");
    }
    function deleteSessions(ids) {
      const count = sessions.value.filter(s => ids.includes(s.id)).length;
      if (!count || !window.confirm("删除 " + count + " 个本机会话？此操作不影响已保存作品或批注。")) return;
      sessions.value = sessions.value.filter(s => !ids.includes(s.id));
      if (!sessions.value.some(s => s.id === activeId.value)) activeId.value = orderedSessions.value[0]?.id || "";
      selectedIds.value = [];
      selectionMode.value = false;
      menuId.value = "";
      ctx.toast("已删除所选本机会话");
    }
    function toggleSelection(id) {
      selectedIds.value = selectedIds.value.includes(id) ? selectedIds.value.filter(v => v !== id) : [...selectedIds.value, id];
    }
    function beginSelection(s) {
      selectionMode.value = true;
      selectedIds.value = [s.id];
      menuId.value = "";
    }
    function attachChat(event, target) {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      if (!target) return;
      const rejected = [];
      for (const file of files) {
        if (file.size > 20 * 1024 * 1024 || target.attachments.length >= 10) { rejected.push(file.name); continue; }
        target.attachments.push(fileMeta(file));
      }
      if (rejected.length) ctx.toast("未添加 " + rejected.length + " 个文件：最多 10 个，每个不超过 20 MB。");
    }
    function send(fromHome = false) {
      const source = fromHome ? home : current.value;
      if (!source || (!source.draft.trim() && !source.attachments.length)) return;
      if (!fromHome && busy.value) return;
      const s = fromHome ? newSession(false) : current.value;
      const content = source.draft.trim();
      if (fromHome) { s.model = source.model; s.speed = source.speed; }
      if (!s.messages.length && content) s.title = content.slice(0, 24);
      s.messages.push({ id: makeId("m-"), role: "user", text: content || "查看附件中的教学任务", task: null,
        attachments: structuredClone(Vue.toRaw(source.attachments)), model: source.model, speed: source.speed });
      source.draft = "";
      source.attachments = [];
      s.updatedAt = now();
      const sessionId = s.id;
      busyIds.add(sessionId);
      if (fromHome) ctx.navigate("/chat");
      Vue.nextTick(ctx.scrollChat);
      setTimeout(() => {
        const target = sessions.value.find(v => v.id === sessionId);
        if (target) {
          const matched = /图片|配图|绘画/.test(content) ? "image" : /音频|声音|克隆|配音/.test(content) ? "voice" : /HTML|网页|互动/i.test(content) ? "html" : /数字人|口播/.test(content) ? "avatar"
            : /视频|短片/.test(content) ? "video" : /课件|PPT/i.test(content) ? "slides"
              : /练习|出题|作业设计/.test(content) ? "quiz" : /批改|评语/.test(content) ? "grade" : "prep";
          target.messages.push({ id: makeId("m-"), role: "ai", task: matched, attachments: [],
            text: "流程样例：可以先确定教学范围与作品要求，再到“" + data.tasks.find(t => t.id === matched).name + "”填写具体参数。附件未进行内容识别。" });
          target.updatedAt = now();
        }
        busyIds.delete(sessionId);
        if (activeId.value === sessionId) Vue.nextTick(ctx.scrollChat);
      }, 450);
    }
    function openPolish(form) {
      polishTask.value = ctx.task.value.id;
      polishOriginal.value = form.requirements;
      const base = form.requirements.trim();
      polishDraft.value = (base ? base + "\n\n" : "") + [
        "面向" + form.stage + " " + form.grade + "，围绕“" + form.topic + "”组织" + ctx.task.value.name + "。",
        "要求表达清晰、内容适合学生，突出具体活动与可执行的步骤。",
        ctx.task.value.id === "quiz" ? "安排题型层次，给出参考答案与关键解析。" :
          ctx.task.value.id === "slides" ? "每页围绕一个重点，保留课堂提问与总结。" :
            ctx.task.value.id === "html" ? "交互反馈明确，允许学生重试，避免遮挡关键内容。" : "明确学习目标，安排课堂活动、评价与课后任务。"
      ].join("\n");
      openDialog("polish");
    }
    function adoptPolish() {
      const form = ctx.forms[polishTask.value];
      if (!polishDraft.value.trim()) { dialogError.value = "建议稿不能为空。"; return; }
      if (form.requirements !== polishOriginal.value && !window.confirm("原要求已经改变，仍用当前建议稿替换吗？")) return;
      form.requirements = polishDraft.value.slice(0, 3000);
      closeDialog();
      ctx.toast("已采用建议稿");
    }
    function appendRequirement(value) {
      const f = ctx.forms[ctx.task.value.id];
      if (!f.requirements.includes(value)) f.requirements = (f.requirements + (f.requirements ? "\n" : "") + value).slice(0, 3000);
    }
    const gradeImages = ref([]);
    function removeGradeImage(id) {
      const item = gradeImages.value.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      gradeImages.value = gradeImages.value.filter(i => i.id !== id);
      ctx.forms.grade.imageNames = gradeImages.value.map(i => i.name);
    }
    function clearGradeImages() {
      gradeImages.value.forEach(i => URL.revokeObjectURL(i.url));
      gradeImages.value = [];
    }
    function attachGradeImages(event) {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      let rejected = 0;
      files.forEach(file => {
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024 || gradeImages.value.length >= 10) { rejected++; return; }
        gradeImages.value.push({ ...fileMeta(file), url: URL.createObjectURL(file) });
      });
      ctx.forms.grade.imageNames = gradeImages.value.map(i => i.name);
      if (rejected) ctx.toast("部分图片未添加：最多 10 张，每张不超过 10 MB，支持 JPG、PNG、WebP。");
    }
    function validateForm(form, id) {
      if (id === "grade") {
        if (form.inputMode === "image" && !gradeImages.value.length) return "请先选择作业图片；刷新后需重新选择。";
        if (form.inputMode === "text" && !form.assignmentText.trim()) return "请填写需要批改的作业正文。";
        if (form.scoring && (!Number.isInteger(Number(form.fullScore)) || Number(form.fullScore) < 1 || Number(form.fullScore) > 1000)) return "满分请填写 1-1000 的整数。";
        return "";
      }
      if (!form.topic.trim()) return "请填写课题或知识点。";
      if (id === "prep" && form.duration === "自定义") {
        const n = Number(form.customDuration), max = form.durationUnit === "分钟" ? 480 : 10;
        if (!Number.isInteger(n) || n < 1 || n > max) return "自定义课时请填写 1-" + max + " 的整数。";
      }
      if (id === "prep" && !form.composition.length) return "请至少选择一项内容组成。";
      if (id === "slides" && form.count === "自定义" && (!Number.isInteger(Number(form.customPages)) || Number(form.customPages) < 1 || Number(form.customPages) > 200)) return "自定义页数请填写 1-200 的整数。";
      if (id === "quiz") {
        if (!form.questionTypes.length) return "请至少选择一种题型。";
        if (form.illustrated && (!Number.isInteger(Number(form.imageCount)) || Number(form.imageCount) < 1 || Number(form.imageCount) > 10)) return "图片数量请填写 1-10 的整数。";
      }
      return "";
    }
    function scopeMeta(form) { return [form.stage, form.grade, form.subject === "其他" ? form.subjectOther || "其他" : form.subject].join(" · "); }
    function taskSummary(form, id) {
      if (id === "prep") return (form.duration === "自定义" ? form.customDuration + " " + form.durationUnit : form.duration) + "；" + form.composition.join("、");
      if (id === "quiz") return form.count + "；" + form.questionTypes.join("、") + "；" + (form.illustrated ? form.imageCount + " 张配图" : "纯文字") + "；" + (form.includeAnswers ? "含答案" : "不含答案") + "；" + (form.includeAnalysis ? "含解析" : "不含解析");
      if (id === "slides") return (form.count === "自定义" ? form.customPages + " 页" : form.count) + "；" + form.style;
      if (id === "html") return form.webpageType + "；" + form.interaction + "；" + form.interactionDifficulty + "；" + (form.showHints ? "显示提示" : "不显示提示") + "；" + (form.showFeedback ? "显示反馈" : "不显示反馈");
      if (id === "grade") return form.strictness + "；" + form.tone + "；模糊文字：" + form.blurry + "；" + (form.scoring ? "满分 " + form.fullScore + "，" + (form.deduct ? "启用扣分" : "不扣分") : "不评分") + "；" + (form.suggestions ? "给出修改建议" : "仅批改反馈");
      return "";
    }
    function getContext() {
      return {
        resourceFilter: { ...resourceFilter }, resourceSearch: resourceSearch.value, resourceOrder: resourceOrder.value,
        noticeRegion: noticeRegion.value, noticeSearch: noticeSearch.value, noticeOrder: noticeOrder.value,
        sessionId: activeId.value, gradeInputMode: ctx.forms.grade.inputMode, publicPreview: true
      };
    }
    function restoreContext(context) {
      Object.keys(resourceFilter).forEach(key => {
        const incoming = context.resourceFilter?.[key];
        if (data.resourceFilters.find(f => f.key === key).options.includes(incoming)) resourceFilter[key] = incoming;
      });
      resourceSearch.value = text(context.resourceSearch, 160);
      resourceOrder.value = context.resourceOrder === "标题" ? "标题" : "最新";
      noticeSearch.value = text(context.noticeSearch, 160);
      noticeRegion.value = data.regions.includes(context.noticeRegion) ? context.noticeRegion : "全部";
      noticeOrder.value = context.noticeOrder === "标题" ? "标题" : "最新";
      if (sessions.value.some(s => s.id === context.sessionId)) activeId.value = context.sessionId;
      if (["image", "text"].includes(context.gradeInputMode)) ctx.forms.grade.inputMode = context.gradeInputMode;
    }
    function resetResources() {
      Object.keys(resourceFilter).forEach(key => { resourceFilter[key] = "不限"; });
      resourceSearch.value = "";
    }
    Object.values(ctx.forms).forEach(form => {
      if (!form.subjectOther) form.subjectOther = "";
      normalizeScope(form);
    });
    watch(() => Object.values(ctx.forms).map(f => [f.stage, f.grade]), () => Object.values(ctx.forms).forEach(normalizeScope), { deep: true, flush: "sync" });
    watch(() => ctx.forms.grade.scoring, value => { if (!value) ctx.forms.grade.deduct = false; });
    watch(sessions, value => ReviewStorage.write("sessions", value), { deep: true });
    watch(home, value => ReviewStorage.write("homeTask", value), { deep: true });
    watch(activeId, value => ReviewStorage.write("activeSession", value));
    watch(() => ctx.route.value, () => { menuId.value = ""; });
    function closeOutside(event) {
      if (!event.target.closest(".session-menu-wrap")) menuId.value = "";
    }
    document.addEventListener("click", closeOutside);
    window.addEventListener("keydown", event => { if (event.key === "Escape") { if (dialog.value) closeDialog(); menuId.value = ""; } });
    window.addEventListener("beforeunload", clearGradeImages);
    return {
      data, models, speeds, home, sessions, activeId, current, orderedSessions, busy, menuId, selectionMode, selectedIds,
      dialog, dialogSessionId, renameText, dialogError, sharedText, polishDraft, gradeImages,
      resourceFilter, resourceSearch, resourceOrder, noticeRegion, noticeSearch, noticeOrder,
      resource, notice, filteredResources, filteredNotices,
      newSession, selectSession, pinSession, beginRename, renameSession, beginShare, copyShare,
      exportSessions, deleteSessions, toggleSelection, beginSelection, attachChat, send,
      closeDialog, openPolish, adoptPolish, appendRequirement, attachGradeImages, removeGradeImage, clearGradeImages,
      validateForm, subjectsFor, normalizeScope, scopeMeta, taskSummary, getContext, restoreContext, resetResources,
      fileSize: bytes => bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + " MB" : Math.max(1, Math.ceil(bytes / 1024)) + " KB"
    };
  };
}());
