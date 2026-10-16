(function () {
  "use strict";
  const { ref, computed, watch, nextTick } = Vue;
  const d = PrototypeData;
  const text = (v, max = 3000) => typeof v === "string" ? v.slice(0, max) : "";
  const list = (key, max = 100) => {
    const v = ReviewStorage.read(key, []);
    return Array.isArray(v) ? v.slice(0, max) : [];
  };
  const clone = v => JSON.parse(JSON.stringify(v));
  window.createV23Features = function (ctx) {
    const menu = ref("");
    const messageOpen = ref(false);
    const messageTab = ref("notice");
    const expandedMessage = ref("");
    const readMessages = ref(list("readMessages").filter(id => d.messages.some(m => m.id === id)));
    const unreadCount = computed(() => d.messages.filter(m => !readMessages.value.includes(m.id)).length);
    const filteredMessages = computed(() => d.messages.filter(m => m.tab === messageTab.value));
    const savedTheme = ReviewStorage.read("appearance", "system");
    const appearance = ref(["light", "dark", "system"].includes(savedTheme) ? savedTheme : "system");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const tutorialOpen = ref(false);
    const tutorialChapter = ref(0);
    const tutorial = computed(() => d.toolTutorials[ctx.task.value.id]);
    const isStudio = computed(() => ["image", "voice"].includes(ctx.task.value.id));
    const imageTab = ref("settings");
    const imageAdvanced = ref(false);
    const imageRefs = ref([]);
    const imageReady = ref(false);
    const imageError = ref("");
    const imageZoom = ref(false);
    const imageSample = computed(() => d.imageSamples.find(s => s.id === ctx.forms.image.sampleId) || d.imageSamples[0]);
    const audio = ref(null);
    const audioError = ref("");
    const voiceAdvanced = ref(false);
    const voiceReady = ref(false);
    const voiceError = ref("");
    const modeNames = { design: "声音设计", controlled: "可控克隆", precise: "精细克隆" };
    function safeParameters(raw) {
      const base = clone(ctx.defaults.image);
      if (!raw || typeof raw !== "object") return base;
      Object.keys(base).forEach(key => {
        const value = raw[key];
        if (typeof base[key] === "string") base[key] = text(value);
        else if (typeof base[key] === "number" && Number.isFinite(value)) base[key] = value;
        else if (Array.isArray(base[key])) base[key] = Array.isArray(value) ? value.filter(v => typeof v === "string").slice(0, 10).map(v => text(v, 160)) : [];
      });
      return base;
    }
    const imageRecords = ref(list("imageRecords", 100).filter(r => r && typeof r.id === "string").map(r => ({
      id: text(r.id, 110), date: text(r.date, 40), title: text(r.title, 100),
      sampleId: d.imageSamples.some(s => s.id === r.sampleId) ? r.sampleId : "earth",
      parameters: safeParameters(r.parameters)
    })));
    let overlayFocus = null;
    let menuFocus = null;
    function applyTheme() {
      const theme = appearance.value === "system" ? (systemTheme.matches ? "dark" : "light") : appearance.value;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
    }
    watch(appearance, value => { applyTheme(); ReviewStorage.write("appearance", value); }, { immediate: true });
    systemTheme.addEventListener("change", applyTheme);
    function toggleMenu(name) {
      menuFocus = document.activeElement;
      menu.value = menu.value === name ? "" : name;
      if (menu.value) nextTick(() => document.querySelector(".v23-header-menu button, .v23-header-menu a")?.focus());
    }
    function closeMenu(restore = false) {
      menu.value = "";
      if (restore) nextTick(() => menuFocus?.isConnected && menuFocus.focus());
    }
    function selectAppearance(value) { appearance.value = value; closeMenu(true); }
    function markRead(id) {
      if (!readMessages.value.includes(id)) readMessages.value.push(id);
    }
    function openMessages() {
      closeMenu();
      if (ctx.modal.value) ctx.closeModal();
      if (ctx.v22.dialog) ctx.v22.closeDialog();
      overlayFocus = document.activeElement;
      messageOpen.value = true;
      nextTick(() => document.querySelector(".v23-message-dialog [data-autofocus]")?.focus());
    }
    function closeMessages() {
      messageOpen.value = false;
      nextTick(() => overlayFocus?.isConnected && overlayFocus.focus());
    }
    function expandMessage(id) { expandedMessage.value = expandedMessage.value === id ? "" : id; markRead(id); }
    function markAllRead() { d.messages.forEach(m => markRead(m.id)); }
    function toggleTutorial() {
      tutorialOpen.value = !tutorialOpen.value;
      if (tutorialOpen.value) nextTick(() => document.querySelector(".v23-tutorial [data-autofocus]")?.focus());
      else nextTick(() => document.querySelector(".tool-tutorial-button")?.focus());
    }
    function slideStyles(form) { return d.styleOptions(form); }
    function normalizeStyle() {
      const f = ctx.forms.slides;
      if (f.style !== "自定义" && !slideStyles(f).includes(f.style)) f.style = slideStyles(f)[0];
    }
    normalizeStyle();
    watch(() => [ctx.forms.slides.stage, ctx.forms.slides.grade, ctx.forms.slides.subject, ctx.forms.slides.subjectOther], normalizeStyle);
    function composed(form, key, custom) {
      return (Array.isArray(form[key]) ? form[key] : []).map(v => v === "自定义" ? text(form[custom]).trim() : v).filter(Boolean);
    }
    function validateExtra(form, id) {
      if (id === "prep" && form.composition.includes("自定义") && !form.customComposition.trim()) return "请填写自定义内容组成，或取消该选项。";
      if (id === "quiz" && form.questionTypes.includes("自定义") && !form.customQuestionType.trim()) return "请填写自定义题型，或取消该选项。";
      if (id === "slides" && form.style === "自定义" && !form.customStyle.trim()) return "请填写自定义课件风格。";
      return "";
    }
    const oldSummary = ctx.v22.taskSummary;
    ctx.v22.taskSummary = function (form, id) {
      if (id === "prep") return (form.duration === "自定义" ? form.customDuration + " " + form.durationUnit : form.duration) + "；" + composed(form, "composition", "customComposition").join("、");
      if (id === "quiz") return form.count + "；" + composed(form, "questionTypes", "customQuestionType").join("、") + "；" + (form.illustrated ? form.imageCount + " 张配图" : "纯文字") + "；" + (form.includeAnswers ? "含答案" : "不含答案") + "；" + (form.includeAnalysis ? "含解析" : "不含解析");
      if (id === "slides") return (form.count === "自定义" ? form.customPages + " 页" : form.count) + "；" + (form.style === "自定义" ? form.customStyle : form.style);
      return oldSummary(form, id);
    };
    function filesFrom(event) {
      const files = Array.from(event.dataTransfer?.files || event.target.files || []);
      if (event.target.type === "file") event.target.value = "";
      return files;
    }
    function attachImages(event) {
      let rejected = 0;
      filesFrom(event).forEach(file => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024 || imageRefs.value.length >= 10) { rejected++; return; }
        imageRefs.value.push({ id: "ir-" + Date.now() + "-" + Math.random().toString(36).slice(2), name: text(file.name, 160), url: URL.createObjectURL(file) });
      });
      ctx.forms.image.referenceNames = imageRefs.value.map(i => i.name);
      if (rejected) ctx.toast("部分图片未添加：最多 10 张，每张 10 MB，支持 JPG、PNG、WebP。");
    }
    function removeImage(id) {
      const item = imageRefs.value.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      imageRefs.value = imageRefs.value.filter(i => i.id !== id);
      ctx.forms.image.referenceNames = imageRefs.value.map(i => i.name);
    }
    function clearImages() { imageRefs.value.forEach(i => URL.revokeObjectURL(i.url)); imageRefs.value = []; }
    function ratioValue(form) { return form.ratio === "自定义" ? form.customWidth + ":" + form.customHeight : form.ratio; }
    function validateImage() {
      const f = ctx.forms.image;
      if (!f.prompt.trim()) return "请填写图片要求。";
      if (!d.imageRatios.includes(f.ratio)) return "请选择有效的画面比例。";
      if (f.ratio === "自定义" && ![f.customWidth, f.customHeight].every(n => Number.isFinite(n) && n > 0 && n <= 10000)) return "自定义宽高请填写大于 0、不超过 10000 的数值。";
      if (f.style === "自定义" && !f.customStyle.trim()) return "请填写自定义画面风格。";
      if (!Number.isInteger(f.outputCount) || f.outputCount < 1 || f.outputCount > 4) return "输出数量请填写 1–4 的整数。";
      if (f.seed && !/^\d{1,10}$/.test(f.seed)) return "种子请填写最多 10 位的非负整数，或留空。";
      return "";
    }
    function previewImage() {
      imageError.value = validateImage();
      if (imageError.value) return;
      imageReady.value = true;
      imageTab.value = "preview";
      const f = ctx.forms.image;
      imageRecords.value.unshift({ id: "image-" + Date.now(), title: text(f.topic || f.prompt, 80), date: new Date().toISOString(), sampleId: imageSample.value.id, parameters: clone(f) });
      imageRecords.value = imageRecords.value.slice(0, 100);
    }
    function recordImage(id) { return d.imageSamples.find(s => s.id === id)?.image || d.imageSamples[0].image; }
    function restoreImage(record) {
      clearImages();
      Object.assign(ctx.forms.image, safeParameters(record.parameters), { sampleId: record.sampleId });
      imageReady.value = true;
      imageTab.value = "preview";
      imageError.value = "";
      ctx.toast("已恢复填写参数；参考图需重新选择。");
    }
    function removeRecord(id) {
      if (!window.confirm("删除这条本机图片参数记录？不会删除作品或批注。")) return;
      imageRecords.value = imageRecords.value.filter(r => r.id !== id);
    }
    function zoomImage() {
      overlayFocus = document.activeElement;
      imageZoom.value = true;
      nextTick(() => document.querySelector(".v23-image-lightbox [data-autofocus]")?.focus());
    }
    function closeZoom() { imageZoom.value = false; nextTick(() => overlayFocus?.isConnected && overlayFocus.focus()); }
    function clearAudio(clearName = true) {
      if (audio.value) URL.revokeObjectURL(audio.value.url);
      audio.value = null;
      audioError.value = "";
      if (clearName) { ctx.forms.voice.audioName = ""; ctx.forms.voice.authorized = false; }
    }
    function attachAudio(event) {
      const files = filesFrom(event);
      if (!files.length) return;
      if (files.length > 1) ctx.toast("参考音频一次只接收一份，已选择第一份文件。");
      const file = files[0];
      if (!/\.(wav|mp3|m4a|ogg)$/i.test(file.name) || !file.size || file.size > 20 * 1024 * 1024) {
        audioError.value = "请选择不超过 20 MB 的 WAV、MP3、M4A 或 OGG 音频。";
        return;
      }
      clearAudio();
      audio.value = { name: text(file.name, 160), size: file.size, url: URL.createObjectURL(file), ready: false };
      ctx.forms.voice.audioName = audio.value.name;
      voiceReady.value = false;
    }
    function audioLoaded() { if (audio.value) audio.value.ready = true; audioError.value = ""; }
    function audioFailed() { if (audio.value) audio.value.ready = false; audioError.value = "浏览器无法读取或播放这份音频，请更换文件。"; }
    function validateVoice() {
      const f = ctx.forms.voice;
      if (!modeNames[f.mode]) return "请选择有效的声音模式。";
      if (!f.targetText.trim()) return "请填写目标文本。";
      if (f.mode === "design" && !f.control.trim()) return "请填写声音描述。";
      if (f.mode !== "design") {
        if (!audio.value?.ready) return "请先选择可播放的参考音频；刷新后需重新选择。";
        if (!f.authorized) return "请确认拥有这份声音的使用授权。";
      }
      if (f.mode === "precise" && !f.referenceText.trim()) return "请手动填写参考音频的文字内容。";
      if (!Number.isFinite(f.guidance) || f.guidance < 1 || f.guidance > 3) return "引导强度应在 1–3 之间。";
      if (!Number.isInteger(f.iterations) || f.iterations < 1 || f.iterations > 50) return "迭代步数应为 1–50 的整数。";
      return "";
    }
    function previewVoice() { voiceError.value = validateVoice(); if (!voiceError.value) voiceReady.value = true; }
    function saveStudioWork() {
      if (ctx.task.value.id === "image") {
        if (!imageReady.value && ctx.route.value.startsWith("/tool/")) { imageError.value = "请先填写要求并查看样例。"; return false; }
        const issue = validateImage();
        if (issue) { imageError.value = issue; ctx.toast(issue); return false; }
      }
      if (ctx.task.value.id === "voice") {
        const issue = validateVoice();
        if (issue) { voiceError.value = issue; ctx.toast(issue); return false; }
      }
      return true;
    }
    function resetVoiceAdvanced() { Object.assign(ctx.forms.voice, { denoise: false, normalizeText: false, guidance: 2, iterations: 10 }); }
    function voiceParameters() {
      const f = ctx.forms.voice;
      return {
        mode: modeNames[f.mode] || modeNames.design,
        referenceAudio: f.mode === "design" ? null : { name: f.audioName, availableInCurrentSession: Boolean(audio.value?.ready) },
        authorized: f.mode === "design" ? null : f.authorized,
        voiceDescription: f.mode === "precise" ? null : f.control,
        referenceText: f.mode === "precise" ? f.referenceText : null,
        targetText: f.targetText, denoise: f.mode !== "design" ? f.denoise : null,
        normalizeText: f.normalizeText, guidance: f.guidance, iterations: f.iterations,
        generatedAudio: false
      };
    }
    function exportVoice() {
      ReviewStorage.download("音频参数记录.json", JSON.stringify({ schema: "teacher-voice-parameters/1", version: ReviewStorage.version, exportedAt: new Date().toISOString(), parameters: voiceParameters() }, null, 2), "application/json;charset=utf-8");
    }
    function prepareAnchor(anchor) {
      if (anchor.startsWith("message-")) openMessages();
      if (anchor === "appearance-menu") menu.value = "appearance";
      if (anchor === "account-menu") menu.value = "account";
      if (anchor.startsWith("tutorial-")) tutorialOpen.value = true;
      if (anchor === "image-settings") imageTab.value = "settings";
      if (anchor === "image-preview") imageTab.value = "preview";
      if (anchor === "image-records") imageTab.value = "records";
      if (anchor === "image-advanced") { imageTab.value = "settings"; imageAdvanced.value = true; }
      if (anchor === "voice-advanced") voiceAdvanced.value = true;
    }
    function getContext() {
      return {
        headerMenu: menu.value, messageOpen: messageOpen.value, messageTab: messageTab.value, expandedMessage: expandedMessage.value,
        tutorialOpen: tutorialOpen.value, tutorialChapter: tutorialChapter.value,
        imageTab: imageTab.value, imageAdvanced: imageAdvanced.value, imageSample: imageSample.value.id, imageReady: imageReady.value,
        voiceMode: ctx.forms.voice.mode, voiceAdvanced: voiceAdvanced.value, voiceReady: voiceReady.value
      };
    }
    function restoreContext(c) {
      menu.value = ["appearance", "account"].includes(c.headerMenu) ? c.headerMenu : "";
      messageTab.value = c.messageTab === "announcement" ? "announcement" : "notice";
      expandedMessage.value = d.messages.some(m => m.id === c.expandedMessage) ? c.expandedMessage : "";
      if (c.messageOpen) openMessages(); else messageOpen.value = false;
      tutorialOpen.value = c.tutorialOpen === true;
      tutorialChapter.value = Math.min(tutorial.value.chapters.length - 1, Math.max(0, c.tutorialChapter || 0));
      imageTab.value = ["settings", "preview", "records"].includes(c.imageTab) ? c.imageTab : "settings";
      imageAdvanced.value = c.imageAdvanced === true;
      imageReady.value = c.imageReady === true;
      if (d.imageSamples.some(s => s.id === c.imageSample)) ctx.forms.image.sampleId = c.imageSample;
      ctx.forms.voice.mode = modeNames[c.voiceMode] ? c.voiceMode : "design";
      voiceAdvanced.value = c.voiceAdvanced === true;
      voiceReady.value = c.voiceReady === true;
    }
    function outside(event) { if (!event.target.closest(".v23-popover-wrap")) closeMenu(); }
    document.addEventListener("click", outside);
    window.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (ctx.modal.value || ctx.v22.dialog) return;
      if (!(imageZoom.value || messageOpen.value || menu.value || tutorialOpen.value)) return;
      event.preventDefault();
      if (imageZoom.value) closeZoom();
      else if (messageOpen.value) closeMessages();
      else if (menu.value) closeMenu(true);
      else if (tutorialOpen.value) { tutorialOpen.value = false; nextTick(() => document.querySelector(".tool-tutorial-button")?.focus()); }
    });
    watch(() => ctx.route.value, () => { closeMenu(); messageOpen.value = false; imageZoom.value = false; tutorialChapter.value = 0; });
    watch(() => ctx.forms.voice.mode, () => { voiceError.value = ""; voiceReady.value = false; });
    watch(readMessages, value => ReviewStorage.write("readMessages", value), { deep: true });
    watch(imageRecords, value => ReviewStorage.write("imageRecords", value), { deep: true });
    window.addEventListener("beforeunload", () => { clearImages(); clearAudio(false); systemTheme.removeEventListener("change", applyTheme); document.removeEventListener("click", outside); });
    return {
      menu, toggleMenu, closeMenu, appearance, selectAppearance, messageOpen, openMessages, closeMessages, messageTab, expandedMessage,
      filteredMessages, readMessages, unreadCount, expandMessage, markAllRead, tutorialOpen, tutorialChapter, tutorial, toggleTutorial,
      isStudio, slideStyles, validateExtra, imageTab, imageAdvanced, imageRefs, imageReady, imageError, imageZoom, imageSample,
      imageRecords, attachImages, removeImage, clearImages, ratioValue, previewImage, recordImage, restoreImage, removeRecord, zoomImage, closeZoom,
      audio, audioError, voiceAdvanced, voiceReady, voiceError, modeNames, attachAudio, clearAudio, audioLoaded, audioFailed,
      previewVoice, saveStudioWork, resetVoiceAdvanced, voiceParameters, exportVoice, prepareAnchor, getContext, restoreContext,
      time: value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    };
  };
}());
