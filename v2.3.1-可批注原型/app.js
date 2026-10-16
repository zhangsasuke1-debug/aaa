(function () {
  "use strict";
  const { createApp, ref, reactive, computed, watch, onMounted, onUpdated, nextTick, h } = Vue;
  const data = PrototypeData;
  const initialForms = Object.fromEntries(data.tasks.map(t => [t.id, {
    stage: t.id === "slides" || t.id === "grade" ? "小学" : "初中",
    grade: t.id === "quiz" ? "七年级" : t.id === "slides" ? "五年级" : t.id === "grade" ? "六年级" : "八年级",
    subject: t.id === "quiz" ? "数学" : t.id === "slides" ? "主题班会" : "语文",
    topic: t.topic, requirements: t.requirements, fileName: "", subjectOther: "",
    ...Object.fromEntries(t.fields.map(f => [f.key, f.options[0]])),
    ...t.defaults
  }]));
  const defaultForms = JSON.parse(JSON.stringify(initialForms));
  const storedForms = ReviewStorage.read("forms", {});
  Object.keys(initialForms).forEach(key => {
    const incoming = storedForms?.[key];
    if (!incoming || typeof incoming !== "object") return;
    Object.keys(initialForms[key]).forEach(field => {
      const value = incoming[field], fallback = initialForms[key][field];
      if (typeof value === "string" && typeof fallback === "string") initialForms[key][field] = value.slice(0, field === "assignmentText" ? 10000 : field === "answer" ? 5000 : 3000);
      else if (typeof value === "boolean" && typeof fallback === "boolean") initialForms[key][field] = value;
      else if (typeof value === "number" && Number.isFinite(value) && typeof fallback === "number") initialForms[key][field] = value;
      else if (Array.isArray(value) && Array.isArray(fallback)) initialForms[key][field] = value.filter(v => typeof v === "string").slice(0, 20).map(v => v.slice(0, 160));
    });
  });
  const savedList = (key, fallback) => {
    const list = ReviewStorage.read(key, fallback);
    return Array.isArray(list) ? list : fallback;
  };
  const app = createApp({
    setup() {
      const knownRoute = raw => data.pages.some(p => p.route === raw) ? raw : /^\/(?:resources|notices)\//.test(raw) ? "/not-found" : "/welcome";
      const route = ref(knownRoute(location.hash.slice(1)));
      const page = computed(() => data.pages.find(p => p.route === route.value));
      const pageTitle = computed(() => page.value?.title || "工作台");
      const kind = computed(() => route.value.split("/")[1]);
      const showSidebar = computed(() => ["home", "tool", "result", "chat", "library"].includes(kind.value));
      const task = computed(() => data.tasks.find(t => t.id === route.value.split("/")[2]) || data.tasks[0]);
      const course = computed(() => data.courses.find(c => c.id === route.value.split("/")[2]) || data.courses[0]);
      const forms = reactive(initialForms);
      const form = computed(() => forms[task.value.id]);
      const formError = ref("");
      const mediaTask = computed(() => ["avatar", "video"].includes(task.value.id));
      const resultTitle = computed(() => task.value.id === "image" ? (data.imageSamples.find(s => s.id === forms.image.sampleId) || data.imageSamples[0]).title
        : task.value.id === "voice" ? (forms.voice.topic || "音频克隆") + " · 参数预览" : mediaTask.value
        ? `${form.value.topic} · ${task.value.id === "avatar" ? "口播构图" : "短片分镜"}`
        : task.value.sampleTitle);
      const persona = computed(() => data.personas.find(p => p.id === forms.avatar.persona) || data.personas[0]);
      const captionIndex = ref(0);
      const captions = computed(() => (forms.avatar.script.match(/[^。！？\n]+[。！？]?/g) || [])
        .map(line => line.trim()).filter(Boolean).flatMap(line => Array.from({ length: Math.ceil(line.length / 28) }, (_, i) => line.slice(i * 28, (i + 1) * 28))));
      const activeCaption = computed(() => captions.value[captionIndex.value] || captions.value[0] || "讲稿字幕示例");
      const previewRatio = computed(() => ["16:9", "9:16", "1:1"].includes(form.value.ratio) ? form.value.ratio.replace(":", "/") : "16/9");
      const videoShotIndex = ref(0);
      const activeShot = computed(() => data.videoShots[videoShotIndex.value]);
      const referenceImage = ref("");
      const htmlPreviewMode = ref("desktop");
      const todayLabel = new Date().toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "long", day: "numeric", weekday: "long" });
      const navOpen = ref(false);
      const modal = ref("");
      const courseChapter = ref(0);
      const fileInput = ref(null);
      const search = ref("");
      const workFilter = ref("all");
      const works = ref(savedList("works", []).filter(w => w && data.tasks.some(t => t.id === w.task) && typeof w.title === "string"));
      const hiddenSamples = ref(savedList("hiddenSamples", []).filter(v => typeof v === "string"));
      const loggedIn = ref(ReviewStorage.read("loggedIn", false) === true);
      const preferences = reactive({ watermark: true, autoSave: true, ...ReviewStorage.read("preferences", {}) });
      const toastText = ref("");
      const projectPrefix = decodeURIComponent(location.pathname).includes("/版本档案/") ? "../../" : "../";
      let toastTimer;
      let previousFocus = null;
      function toast(message) {
        toastText.value = message;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastText.value = ""; }, 4200);
      }
      function navigate(path) {
        const next = knownRoute(path);
        navOpen.value = false;
        modal.value = "";
        if (route.value !== next) {
          route.value = next;
          courseChapter.value = 0;
          formError.value = "";
          location.hash = next;
        }
        return nextTick(() => {
          document.querySelector(".page-scroll")?.scrollTo(0, 0);
          document.title = pageTitle.value + " | 教师 AI · V2.3.1";
        });
      }
      const v22 = reactive(createV22Features({ forms, task, route, navigate, toast, modal, scrollChat }));
      const v23 = reactive(createV23Features({ forms, defaults: defaultForms, task, route, navigate, toast, modal, v22, closeModal }));
      const messages = computed(() => v22.current?.messages || []);
      const chatInput = computed({ get: () => v22.current?.draft || "", set: value => { if (v22.current) v22.current.draft = value; } });
      const chatBusy = computed(() => v22.busy);
      const homePrompt = computed({ get: () => v22.home.draft, set: value => { v22.home.draft = value; } });
      const review = reactive(createReview({
        route, title: pageTitle, navigate, toast,
        prepareAnchor: anchor => {
          if (["tool-navigation", "recent-sidebar", "new-chat"].includes(anchor)) navOpen.value = true;
          if (anchor === "polish-preview") v22.openPolish(form.value);
          v23.prepareAnchor(anchor);
        },
        getContext: () => ({
          ...v22.getContext(),
          ...v23.getContext(),
          chapter: courseChapter.value, workFilter: workFilter.value, search: search.value,
          captionIndex: captionIndex.value, videoShotIndex: videoShotIndex.value, htmlPreviewMode: htmlPreviewMode.value
        }),
        restoreContext: context => {
          if (!context) return;
          v22.restoreContext(context);
          v23.restoreContext(context);
          courseChapter.value = Math.min(course.value.chapters.length - 1, context.chapter || 0);
          workFilter.value = data.tasks.some(t => t.id === context.workFilter) ? context.workFilter : "all";
          search.value = context.search || "";
          captionIndex.value = Math.min(Math.max(0, captions.value.length - 1), context.captionIndex || 0);
          videoShotIndex.value = Math.min(data.videoShots.length - 1, context.videoShotIndex || 0);
          htmlPreviewMode.value = context.htmlPreviewMode === "mobile" ? "mobile" : "desktop";
        }
      }));
      const allWorks = computed(() => [...works.value, ...data.samples.filter(w => !hiddenSamples.value.includes(w.id))]);
      const filteredWorks = computed(() => allWorks.value.filter(w =>
        (workFilter.value === "all" || w.task === workFilter.value) &&
        (!search.value.trim() || `${w.title} ${w.subject} ${w.grade}`.toLowerCase().includes(search.value.trim().toLowerCase()))
      ));
      const groups = computed(() => [...new Set(data.pages.map(p => p.group))]);
      const taskById = id => data.tasks.find(t => t.id === id) || data.tasks[0];
      const sameWork = w => w.task === task.value.id && JSON.stringify(w.parameters) === JSON.stringify(form.value);
      const hasSaved = computed(() => works.value.some(sameWork));
      function previewResult() {
        const issue = v22.validateForm(form.value, task.value.id);
        if (issue) { formError.value = issue; return; }
        const extra = v23.validateExtra(form.value, task.value.id);
        if (extra) { formError.value = extra; return; }
        if (task.value.id === "avatar" && !form.value.script.trim()) { formError.value = "请填写口播讲稿。"; return; }
        if (task.value.id === "video" && !form.value.prompt.trim()) { formError.value = "请填写画面描述。"; return; }
        formError.value = "";
        captionIndex.value = 0;
        videoShotIndex.value = 0;
        navigate("/result/" + task.value.id);
      }
      function attachFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        form.value.fileName = file.name;
        event.target.value = "";
        toast("已展示文件名称；原型不会读取或上传文件内容。");
      }
      function clearReference() {
        if (referenceImage.value) URL.revokeObjectURL(referenceImage.value);
        referenceImage.value = "";
        forms.video.fileName = "";
      }
      function attachReference(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
          toast("请选择不超过 10 MB 的 JPG、PNG 或 WebP 图片。");
          return;
        }
        clearReference();
        forms.video.fileName = file.name;
        referenceImage.value = URL.createObjectURL(file);
        toast("参考图仅在本页本地预览，不会上传；刷新后需重新选择。");
      }
      function openWork(work) {
        if (work.task === "video") clearReference();
        if (work.task === "grade") v22.clearGradeImages();
        if (work.task === "image") { v23.clearImages(); v23.imageReady = true; }
        if (work.task === "voice") { v23.clearAudio(); v23.voiceReady = false; }
        Object.assign(forms[work.task], JSON.parse(JSON.stringify(defaultForms[work.task])), work.parameters || {});
        v22.normalizeScope(forms[work.task]);
        captionIndex.value = 0;
        navigate("/result/" + work.task);
      }
      function saveWork() {
        const t = task.value;
        if (v23.isStudio && !v23.saveStudioWork()) return;
        const existing = works.value.find(sameWork);
        if (existing) { toast("这份示例已在我的作品中。"); return; }
        works.value.unshift({
          id: "work-" + Date.now(), task: t.id, title: resultTitle.value,
          subject: v23.isStudio ? "本地参数" : mediaTask.value ? "构图 / 分镜" : form.value.subject === "其他" ? form.value.subjectOther || "其他" : form.value.subject,
          grade: v23.isStudio ? "未生成" : mediaTask.value ? "静态样稿" : form.value.grade,
          date: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" }), sample: false,
          parameters: JSON.parse(JSON.stringify(form.value)),
          image: t.id === "image" ? v23.imageSample.image : t.id === "avatar" ? persona.value.image : t.image
        });
        toast("已保存到本机作品");
      }
      function removeWork(work) {
        if (!window.confirm(`从作品列表移除“${work.title}”？`)) return;
        if (work.sample) hiddenSamples.value.push(work.id);
        else works.value = works.value.filter(w => w.id !== work.id);
        toast("已从本机列表移除");
      }
      function resultText(t) {
        return [t.sampleTitle, t.sampleMeta, "", "排版示例，未调用真实 AI。", "",
          ...t.sections.flatMap(s => [s.title,
            s.text || (s.steps ? s.steps.map(v => `${v.time} ${v.title}\n${v.text}`).join("\n\n")
              : s.slides ? s.slides.map(v => `${v.no} ${v.title}\n${v.lines.join("\n")}`).join("\n\n")
                : (s.rubric || []).map(v => `${v.name}：${v.level}\n${v.note}`).join("\n\n")), ""])
        ].join("\n");
      }
      function exportResult() {
        ReviewStorage.download(task.value.sampleTitle.replace(/[\\/:*?"<>|]/g, "-") + "-示例.txt", resultText(task.value), "text/plain;charset=utf-8");
        toast("已发起文本示例下载");
      }
      function sendChat(fromHome = false) { v22.send(fromHome); }
      function scrollChat() {
        const el = document.getElementById("chat-messages");
        if (el) el.scrollTop = el.scrollHeight;
      }
      function newChat() { v22.newSession(); }
      function login() {
        loggedIn.value = true;
        navigate("/mine");
        toast("已进入演示账号，没有连接真实账号系统。");
      }
      function logout() {
        loggedIn.value = false;
        toast("已退出演示账号");
      }
      function openModal(name) {
        if (v23.messageOpen) v23.closeMessages();
        if (v23.imageZoom) v23.closeZoom();
        v23.closeMenu();
        if (v22.dialog) v22.closeDialog();
        previousFocus = document.activeElement;
        review.exportMenu = false;
        modal.value = name;
      }
      function closeModal() {
        modal.value = "";
        nextTick(() => previousFocus?.focus());
      }
      function dialogKeys(event) {
        if (event.key === "Escape") { if (v23.imageZoom) v23.closeZoom(); else if (v23.messageOpen) v23.closeMessages(); else if (v22.dialog) v22.closeDialog(); else closeModal(); return; }
        if (review.mode && event.currentTarget.classList.contains("v23-message-dialog")) return;
        if (event.key !== "Tab") return;
        const focusables = Array.from(event.currentTarget.querySelectorAll("button:not(:disabled), a[href], select, input, textarea, [tabindex='0']"))
          .filter(el => el.getClientRects().length);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      watch(modal, async value => {
        if (value) { await nextTick(); document.querySelector(".modal [data-autofocus]")?.focus(); }
      });
      window.addEventListener("hashchange", async () => {
        const next = knownRoute(location.hash.slice(1));
        if (route.value !== next) {
          route.value = next;
          courseChapter.value = 0;
          navOpen.value = false;
        }
        if (location.hash.slice(1) !== route.value) history.replaceState(null, "", "#" + route.value);
        formError.value = "";
        await nextTick();
        document.querySelector(".page-scroll")?.scrollTo(0, 0);
        document.title = pageTitle.value + " | 教师 AI · V2.3.1";
        review.schedule();
      });
      window.addEventListener("keydown", event => {
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          if (modal.value) closeModal();
          else if (review.exportMenu) review.exportMenu = false;
          else if (navOpen.value) navOpen.value = false;
          else if (review.panel) review.panel = false;
        }
      });
      watch(forms, value => ReviewStorage.write("forms", value), { deep: true });
      watch(works, value => ReviewStorage.write("works", value), { deep: true });
      watch(hiddenSamples, value => ReviewStorage.write("hiddenSamples", value), { deep: true });
      watch(preferences, value => ReviewStorage.write("preferences", value), { deep: true });
      watch(loggedIn, value => ReviewStorage.write("loggedIn", value));
      onMounted(() => {
        if (!location.hash || location.hash.slice(1) !== route.value) history.replaceState(null, "", "#" + route.value);
        document.title = pageTitle.value + " | 教师 AI · V2.3.1";
        review.schedule();
        new ResizeObserver(review.schedule).observe(document.querySelector(".website-surface"));
      });
      onUpdated(review.schedule);
      return {
        ...data, v22, v23, route, page, pageTitle, kind, task, course, forms, form, formError, navOpen, showSidebar,
        mediaTask, resultTitle, persona, captions, captionIndex, activeCaption, previewRatio,
        videoShotIndex, activeShot, referenceImage, htmlPreviewMode, todayLabel,
        attachReference, clearReference, openWork,
        modal, courseChapter, homePrompt, chatInput, chatBusy, messages, search, workFilter,
        works, filteredWorks, allWorks, loggedIn, preferences, toastText, groups, hasSaved,
        review, fileInput, projectPrefix, navigate, taskById, previewResult, attachFile, saveWork, removeWork,
        exportResult, sendChat, newChat, login, logout, openModal, closeModal, dialogKeys, toast,
        documentSection: id => document.getElementById("doc-" + id)?.scrollIntoView({ block: "start", behavior: "instant" })
      };
    }
  });
  app.component("ui-icon", {
    props: { name: { type: String, default: "Circle" }, size: { type: [String, Number], default: 20 } },
    setup(props) {
      return () => {
        const nodes = lucide.icons?.[props.name] || lucide[props.name] || lucide.icons?.Circle || [];
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", width: props.size, height: props.size,
          viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7,
          "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false", class: "icon"
        }, Array.isArray(nodes) ? nodes.map(([tag, attributes]) => h(tag, attributes)) : []);
      };
    }
  });
  registerV22Components(app);
  registerV23Components(app);
  app.mount("#app");
}());
