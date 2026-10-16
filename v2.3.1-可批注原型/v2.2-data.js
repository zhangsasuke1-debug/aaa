(function () {
  "use strict";
  const d = window.PrototypeData;
  d.version = "2.2";
  d.tasks[0].name = "教学设计";
  d.tasks[0].short = "教学设计";
  d.tasks[0].action = "开始设计";
  d.tasks[0].fields = [{ key: "duration", label: "课时长度", options: ["40 分钟", "45 分钟", "2 课时", "自定义"] }];
  d.tasks[0].defaults = { customDuration: 40, durationUnit: "分钟", composition: ["学习目标", "教学流程", "课堂练习", "分层作业"] };
  d.tasks[1].defaults = { illustrated: false, imageCount: 3, questionTypes: ["选择", "填空", "简答"], includeAnswers: true, includeAnalysis: true };
  d.tasks[2].fields[0].options = ["10-20 页", "20-30 页", "自定义"];
  d.tasks[2].defaults = { customPages: 20 };
  d.tasks[3].fields = [{ key: "interaction", label: "互动形式", options: ["课堂选择题", "知识卡片", "步骤探究"] }];
  Object.assign(d.tasks[3].defaults, { webpageType: "课堂测验", interactionDifficulty: "简单", showHints: true, showFeedback: true });
  Object.assign(d.tasks[6], { description: "图片与文字作业、逐项反馈与修改建议", fields: [], sampleTitle: "作业批改反馈", sampleMeta: "原作业 · 固定反馈样例" });
  d.tasks[6].defaults = {
    inputMode: "image", assignmentText: "", answer: "", strictness: "标准", tone: "温和鼓励",
    blurry: "标为待确认", scoring: false, fullScore: 100, deduct: false, suggestions: true, imageNames: []
  };
  d.courses.forEach(c => { if (c.category === "教学备课") c.category = "教学设计"; });
  d.pages.forEach(p => { p.title = p.title.replace("教学备课", "教学设计"); });
  d.topLinks = [
    { route: "/welcome", label: "首页" }, { route: "/home", label: "工作台" },
    { route: "/resources", label: "资源广场" }, { route: "/notices", label: "全国各地比赛通知" },
    { route: "/course", label: "使用教程" }
  ];
  d.education = {
    "幼儿园": { grades: ["小班", "中班", "大班"], subjects: ["语言", "健康", "科学", "社会", "艺术"] },
    "小学": { grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"], subjects: ["语文", "数学", "科学", "道德与法治", "音乐", "美术", "体育", "劳动", "主题班会"] },
    "初中": { grades: ["七年级", "八年级", "九年级"], subjects: ["语文", "数学", "英语", "道德与法治", "历史", "地理", "生物", "音乐", "美术", "体育", "劳动", "信息科技", "主题班会"] },
    "高中": { grades: ["高一", "高二", "高三"], subjects: ["语文", "数学", "英语", "思想政治", "历史", "地理", "物理", "化学", "生物", "音乐", "美术", "体育", "信息技术", "通用技术", "主题班会"] }
  };
  d.resourceFilters = [
    { key: "type", label: "资源类型", options: ["不限", "HTML", "PPT课件", "作业设计", "教学设计"] },
    { key: "textbook", label: "教材", options: ["不限", "统编版"] },
    { key: "grade", label: "年级", options: ["不限", ...d.education["小学"].grades, ...d.education["初中"].grades, "高中"] },
    { key: "term", label: "期次", options: ["不限", "上册", "下册"] }
  ];
  d.regions = ["全部", "全国", "北京", "天津", "河北", "山西", "内蒙古", "辽宁", "吉林", "黑龙江", "上海", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西", "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏", "新疆", "香港", "澳门", "台湾"];
  d.resources = [
    { id: "fractions", title: "认识分数 · 课堂互动", type: "HTML", grade: "三年级", term: "上册", textbook: "统编版", image: "assets/html.png", task: "html", intro: "通过三道选择题练习分子与分母，包含答题反馈和解析。", file: "samples/classroom-quiz.html", format: "HTML" },
    { id: "low-carbon", title: "低碳生活主题班会", type: "PPT课件", grade: "五年级", term: "下册", textbook: "统编版", image: "assets/slides.png", task: "slides", intro: "以观察、讨论和班级行动组织低碳主题班会，展示课件内容节选。", file: "samples/resource-low-carbon.html", format: "HTML 内容样稿" },
    { id: "back", title: "《背影》教学设计", type: "教学设计", grade: "八年级", term: "上册", textbook: "统编版", image: "assets/prep.png", task: "prep", intro: "围绕细节描写、人物形象与表达迁移，组织一课时学习活动。", file: "samples/resource-back.html", format: "HTML" },
    { id: "equation", title: "一元一次方程分层作业", type: "作业设计", grade: "七年级", term: "上册", textbook: "统编版", image: "assets/quiz.png", task: "quiz", intro: "基础练习、应用任务与易错点整理，包含参考答案。", file: "samples/resource-equation.html", format: "HTML" },
    { id: "reading", title: "阅读观察记录单", type: "作业设计", grade: "二年级", term: "下册", textbook: "统编版", image: "assets/grade.png", task: "prep", intro: "记录阅读中的人物、事件与感受，可作为课堂交流的素材。", file: "samples/resource-reading.html", format: "HTML" },
    { id: "exploration", title: "科学探究活动设计", type: "教学设计", grade: "高中", term: "下册", textbook: "统编版", image: "assets/prep.png", task: "prep", intro: "从提出问题到记录观察，组织可讨论、可复盘的探究活动。", file: "samples/resource-exploration.html", format: "HTML" }
  ].map((r, i) => ({ ...r, author: "教学资源样例", date: "2026-10-" + String(13 - i).padStart(2, "0") }));
  d.notices = [
    { id: "digital", title: "教师数字素养实践活动通知样例", region: "全国", summary: "展示参赛对象、作品类型与材料提交要求的通知排版。" },
    { id: "integration", title: "信息技术与教学融合课例通知样例", region: "河北", summary: "展示教学课例、课堂实践与说明材料的通知结构。" },
    { id: "micro", title: "教师微课作品征集通知样例", region: "广东", summary: "展示微课选题、视频材料和作品说明的栏目。" },
    { id: "assignment", title: "作业设计交流活动通知样例", region: "浙江", summary: "展示单元作业设计、评价说明和提交清单。" },
    { id: "ai", title: "人工智能教学应用案例通知样例", region: "四川", summary: "展示课堂应用情境、实践过程与成果说明。" },
    { id: "lesson", title: "教学设计与课堂展示通知样例", region: "北京", summary: "展示教学设计材料、课堂展示及附件入口。" }
  ].map((n, i) => ({
    ...n, date: "2026-10-" + String(13 - i).padStart(2, "0"), publisher: "通知发布单位（样例）",
    image: "assets/notice-" + n.id + ".png", file: "samples/notice-" + n.id + ".html",
    sections: [
      { title: "活动对象", text: "本栏目展示教师比赛通知的正文组织方式。实际参赛对象以将来上传的正式通知为准。" },
      { title: "作品与材料", text: "可在此展示作品类别、材料清单、格式要求和报送方式，并附正式文件。" },
      { title: "时间安排", text: "本样例未设报名或截止时间，不构成真实比赛信息。正式通知上传后在此展示时间安排。" },
      { title: "联系与说明", text: "发布单位、联系方式及具体要求以正式通知为准。本页仅保留通知阅读与附件入口。" }
    ]
  }));
  d.pages.push(
    { route: "/not-found", title: "未找到内容", group: "公共内容", icon: "FileSearch" },
    { route: "/resources", title: "资源广场", group: "公共内容", icon: "LibraryBig" },
    ...d.resources.map(r => ({ route: "/resources/" + r.id, title: r.title, group: "公共内容", icon: "FileText" })),
    { route: "/notices", title: "全国各地比赛通知", group: "公共内容", icon: "Megaphone" },
    ...d.notices.map(n => ({ route: "/notices/" + n.id, title: n.title, group: "公共内容", icon: "FileText" }))
  );
}());
