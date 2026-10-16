(function () {
  "use strict";
  const d = window.PrototypeData;
  const byId = id => d.tasks.find(t => t.id === id);
  d.version = "2.3";
  d.prepComposition = ["教学目标（核心素养）", "教学重难点", "学情分析", "教学方法", "教学过程", "课后作业", "教学反思", "自定义"];
  Object.assign(byId("prep").defaults, {
    composition: d.prepComposition.slice(0, 7), customComposition: ""
  });
  Object.assign(byId("quiz"), {
    name: "作业设计", short: "作业设计", action: "设计作业", output: "作业与解析",
    description: "分层作业、题型安排与参考解析", sampleTitle: "一元一次方程 · 作业设计样例"
  });
  Object.assign(byId("quiz").defaults, { questionTypes: ["选择", "填空", "主观"], customQuestionType: "" });
  byId("slides").fields = byId("slides").fields.filter(f => f.key !== "style");
  Object.assign(byId("slides").defaults, { style: "", customStyle: "" });
  d.imageStyles = ["不指定", "写实摄影", "儿童绘本", "科学示意", "扁平插画", "国风", "水彩", "像素", "自定义"];
  d.imageRatios = ["1:1", "3:4", "4:3", "16:9", "9:16", "21:9", "自定义"];
  d.imageSamples = [
    { id: "earth", title: "地球 · 科学课堂配图", image: "assets/earth.jpg", format: "JPG", description: "本地地球照片样例，不会根据输入生成新图片。" },
    { id: "classroom", title: "认识分数 · 页面构图", image: "assets/html.png", format: "PNG", description: "本地课堂页面构图样例，不会根据输入生成新图片。" }
  ];
  const additions = [
    {
      id: "image", name: "图片生成", short: "图片生成", icon: "ImagePlus", color: "rose",
      description: "教学配图、画面描述与参考素材", output: "图片样例与参数", action: "查看图片样例",
      image: "assets/earth.jpg", topic: "科学课堂配图", requirements: "", fields: [],
      defaults: { prompt: "", ratio: "16:9", customWidth: 16, customHeight: 9, style: "不指定", customStyle: "",
        negative: "", quality: "中", outputCount: 1, seed: "", referenceNames: [], sampleId: "earth" },
      sampleTitle: "地球 · 科学课堂配图", sampleMeta: "固定图片样例 · 参数本机保存",
      sections: [{ id: "image", title: "图片样例", text: "查看本地图片，不调用生成服务。" }, { id: "parameters", title: "填写参数", text: "保留画面描述、风格与参考图名称。" }]
    },
    {
      id: "voice", name: "音频克隆", short: "音频克隆", icon: "AudioLines", color: "teal",
      description: "声音意向、参考音频与口播文本", output: "音频参数记录", action: "预览音频参数",
      image: "assets/voice.png", topic: "课堂导入口播", requirements: "", fields: [],
      defaults: { mode: "design", control: "", targetText: "", referenceText: "", audioName: "", authorized: false,
        denoise: false, normalizeText: false, guidance: 2, iterations: 10 },
      sampleTitle: "课堂导入口播 · 参数预览", sampleMeta: "仅参数记录 · 无合成音频",
      sections: [{ id: "voice", title: "声音设置", text: "记录模式、声音描述与参考音频信息。" }, { id: "text", title: "目标文本", text: "不合成声音，不提供虚假试听结果。" }]
    }
  ];
  d.tasks = ["prep", "image", "quiz", "slides", "html", "voice", "avatar", "video", "grade"].map(id => byId(id) || additions.find(t => t.id === id));
  d.pages.forEach(p => { p.title = p.title.replaceAll("练习出题", "作业设计"); });
  additions.forEach(t => {
    d.pages.push({ route: "/tool/" + t.id, title: t.name + " · 填写", group: "任务流程", icon: t.icon });
    d.pages.push({ route: "/result/" + t.id, title: t.name + " · 结果", group: "任务流程", icon: "FileText" });
  });
  d.courses.forEach(c => { if (c.task === "quiz") { c.category = "作业设计"; c.name = "一份作业怎样安排题型与层次"; } });
  d.samples.forEach(w => { if (w.task === "quiz") w.title = "一元一次方程 · 作业设计样例"; });
  d.styleOptions = function (form) {
    const stageThemes = {
      "幼儿园": ["绘本情境", "角色互动", "实物观察", "游戏探究", "图像表达", "生活回顾"],
      "小学": ["情境讲解", "课堂互动", "图解观察", "任务探究", "故事表达", "练习复习"],
      "初中": ["概念讲解", "问题讨论", "证据图解", "探究任务", "结构梳理", "专题复习"],
      "高中": ["专题讲解", "思辨讨论", "模型图解", "研究任务", "体系建构", "综合复习"]
    };
    const subjects = {
      "语文": "文本品读", "语言": "语言表达", "英语": "语言情境", "数学": "数学思维",
      "科学": "科学观察", "物理": "物理建模", "化学": "化学探究", "生物": "生命观察",
      "历史": "史料研读", "地理": "地图探究", "音乐": "音乐感知", "美术": "美术欣赏",
      "体育": "运动示范", "健康": "健康生活", "社会": "社会情境", "艺术": "艺术体验",
      "劳动": "劳动实践", "主题班会": "班级成长", "道德与法治": "法治情境", "思想政治": "议题研学",
      "信息科技": "数字探究", "信息技术": "数字实践", "通用技术": "技术设计"
    };
    const subject = form.subject === "其他" ? (form.subjectOther.trim() || "综合学习") : (subjects[form.subject] || form.subject);
    return (stageThemes[form.stage] || stageThemes["小学"]).map(title => form.grade + " · " + subject + " · " + title);
  };
  const guides = {
    prep: [
      ["教学范围与目标", "选择学段、年级和学科，再填写课题。教学目标应对应所选学科的核心素养及可观察的学习表现，不必把所有维度平均罗列。\n示例：学生能结合两个动作描写，用文本证据解释人物情感。"],
      ["课时与内容组成", "选择课时长度，也可按分钟或课时自定义。按需要勾选教学目标、重难点、学情、方法、过程、作业和反思；自定义可补充评价量规等内容。"],
      ["补充要求与复核", "补充学生已有基础、活动限制和评价方式。润色只提供本地建议稿，采用前可修改。\n结果是固定样稿，请核对目标、活动与评价是否一致。"]
    ],
    image: [
      ["描述教学画面", "先写教学用途、主体、环境和构图，再写风格与排除内容。\n示例：小学科学课配图，地球全景，海洋与陆地边界清晰，画面不含文字与水印。"],
      ["比例、风格与参考图", "课堂大屏可选 16:9，竖版学习单可选 3:4。自定义比例填正数宽高。\n参考图支持 JPG、PNG、WebP，最多 10 张，每张 10 MB。只在本机预览，不识别图中内容。"],
      ["查看样例与保存", "查看样例后可放大和下载实际图片，右侧记录可恢复填写参数。记录留在本版浏览器，不限 24 小时。\n当前不会生成新图片。参考图不随参数永久保存，刷新或恢复记录后需重新选择。"]
    ],
    quiz: [
      ["范围与题型", "选择教学范围、知识点、题目数量与难度。选择、填空、判断用于不同检测任务，主观题观察过程与表达。自定义可写连线、排序、实验设计等题型。"],
      ["配图与答案", "按内容决定是否配图及数量，再选择答案与解析。配图应帮助理解，不作为无关装饰。\n示例：方程作业包含基础运算、情境应用和错例分析，解析说明移项依据。"],
      ["检查后再布置", "结果是固定作业样稿，不会按题型或数量真实生成。布置前独立核算答案，检查歧义、学生负担与层次。"]
    ],
    slides: [
      ["确定页面任务", "先选择教学范围和课题，再确定页数。每页围绕一个问题，教师讲稿不应全部放上屏幕。"],
      ["选择课件风格", "风格随学段、年级和学科推荐，至少六种；自定义可描述颜色、字号、图片比例和课堂节奏。\n示例：五年级科学，白底图解，观察照片为主，关键概念少量强调。"],
      ["核对内容样稿", "补充互动与讲解要求，查看页面内容样例。风格选择只记录参数，当前不会重新设计样稿。\n下载格式为实际 HTML 内容样稿，不是 PPTX。"]
    ],
    html: [
      ["知识点与网页类型", "选择教学范围并填写知识点，再选择教学动画、游戏、互动课件、测验或实验探究。"],
      ["设计互动反馈", "确定互动形式、难度、提示与反馈。补充要求可以写允许重试、逐步引导、解释原因。\n示例：三年级分数选择题，错误时指出分母的含义，允许重新作答。"],
      ["预览与下载", "结果提供固定的认识分数互动样例。可操作答题并下载真实 HTML，双击打开。\n输入不同知识点不会产生新的互动网页。"]
    ],
    voice: [
      ["选择声音模式", "声音设计无需音频，描述声音年龄感、语气和节奏；可控克隆需要授权参考音频，可补充声音描述；精细克隆还需人工填写参考音频文本，声音描述暂不参与。"],
      ["音频与目标文本", "上传本人或已授权的 WAV、MP3、M4A、OGG，最大 20 MB；可试听参考音频。目标文本填写需要朗读的内容。\n声音描述示例：自然清晰的成年女声，语速适中，提问时稍作停顿。\n目标文本示例：同学们，先观察这张图片。你看到了哪些变化？"],
      ["高级参数与边界", "高级设置记录降噪、文本规范化、引导强度和迭代步数，当前不执行音频处理。\n参考音频播放器不是合成结果；预览只展示参数，可导出 JSON。刷新后需重新选择音频，不能凭文件名通过克隆输入检查。"]
    ],
    avatar: [
      ["准备讲稿", "填写主题与口播讲稿，句子尽量短。讲稿可按自然停顿分句，方便检查字幕。"],
      ["形象与画幅", "选择示例形象、声音意向和横竖画幅。照片只用于构图，不代表已取得人物或声音使用授权。"],
      ["检查字幕构图", "结果可逐句查看字幕位置，确保不遮挡面部。当前无语音合成、口型驱动或视频文件。"]
    ],
    video: [
      ["描述镜头", "填写主题和画面描述，明确主体、运动与时长。\n示例：地球全景，缓慢靠近海洋与陆地交界，适合作为科学课导入。"],
      ["参考图与画幅", "可选择一张 10 MB 以内的参考图，使用合适的画幅。图片仅在本机预览，刷新后需重新选择。"],
      ["查看分镜", "结果为固定图片的不同取景与镜头说明，不是视频的真实帧。无视频生成、声音或 MP4 下载。"]
    ],
    grade: [
      ["输入作业", "选择图片或文字输入。图片最多 10 张，每张 10 MB；文字可粘贴题目与学生作答。先移除学生姓名等不必要的个人信息。"],
      ["设置批改规则", "选择教学范围、严格程度、评语语气与模糊字处理。评分开启后可设置满分与扣分，并补充参考答案。"],
      ["教师复核", "结果中的反馈为固定样例，没有识别或批改提交的作业。正式反馈应由教师复核，建议应说明改哪里、怎样改。"]
    ]
  };
  d.toolTutorials = Object.fromEntries(d.tasks.map(t => [t.id, {
    title: t.name + "使用教程", chapters: guides[t.id].map(([title, body]) => ({ title, body }))
  }]));
  d.tasks.forEach(t => {
    let course = d.courses.find(c => c.task === t.id);
    if (!course) {
      course = { id: "tool-" + t.id, name: t.name + "使用教程", category: t.name, task: t.id, minutes: "3 分钟", image: t.image, intro: t.description, chapters: d.toolTutorials[t.id].chapters };
      d.courses.push(course);
      d.pages.push({ route: "/course/" + course.id, title: course.name, group: "学习", icon: "BookOpen" });
    }
    course.chapters = d.toolTutorials[t.id].chapters;
    const page = d.pages.find(p => p.route === "/course/" + course.id);
    if (page) page.title = course.name;
  });
  d.courses.sort((a, b) => d.tasks.findIndex(t => t.id === a.task) - d.tasks.findIndex(t => t.id === b.task));
  d.messages = [
    { id: "notice-guide", tab: "notice", title: "九项教学工具已加入工作台", date: "2026-10-13", body: "图片生成和音频克隆入口已加入，练习出题更名为作业设计。可从工作台、工具侧栏或首页进入对应工具。", sample: true },
    { id: "notice-review", tab: "notice", title: "导航居中与 UI 美化交接", date: "2026-10-16", body: "用户已确认原 33 条批注均已修改。本次只调整顶部导航位置；历史批注保留原始记录，不自动改写状态。浏览器中的新意见仍需单独导出 JSON。", sample: true },
    { id: "announcement-local", tab: "announcement", title: "本地原型服务边界", date: "2026-10-13", body: "本版只提供本地页面和固定样例，不接真实图片生成、音频克隆、账号、支付或比赛发布后台。上传素材只在浏览器本机预览。\n比赛栏目为全国各地比赛通知，真实通知以后由后台维护。", sample: true }
  ];
}());
