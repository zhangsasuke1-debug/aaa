(function () {
  "use strict";
  const tasks = [
    {
      id: "prep", name: "教学备课", short: "备课", icon: "BookOpen", color: "green",
      description: "教学目标、课堂活动与课时安排", action: "开始备课",
      output: "教学设计", image: "assets/prep.png", topic: "背影",
      fields: [
        { key: "duration", label: "课时长度", options: ["40 分钟", "45 分钟", "2 课时"] },
        { key: "focus", label: "设计重点", options: ["阅读与表达", "知识理解", "探究与实践", "复习巩固"] }
      ],
      requirements: "聚焦细节描写，安排一次小组讨论，保留课堂评价与分层作业。",
      sampleTitle: "《背影》教学设计",
      sampleMeta: "初中 · 八年级 · 语文 · 40 分钟",
      sections: [
        { id: "goals", title: "教学目标", text: "1. 梳理文章的叙事线索，辨认四次“背影”出现的语境。\n2. 从动作、外貌与语言描写中，感受父亲形象和作者的情感变化。\n3. 结合生活经验，写出一段有具体细节的亲情片段。" },
        { id: "focus", title: "重点与难点", text: "重点：品读买橘子片段，用文本中的动词解释人物形象。\n难点：理解作者从“不理解”到“体谅”的情感变化，避免空泛地概括父爱。" },
        { id: "process", title: "教学过程", steps: [
          { time: "5 分钟", title: "情境导入", text: "回忆一个让你记住家人的瞬间。先说看到了什么，再说自己的感受。" },
          { time: "8 分钟", title: "初读与梳理", text: "独立阅读，标注四次背影。按“时间、事件、情感”整理文章线索。" },
          { time: "15 分钟", title: "细读与讨论", text: "圈画买橘子片段中的动词。小组选择两个词，说明为什么不能换成近义词。" },
          { time: "8 分钟", title: "表达与迁移", text: "用一个具体动作描写熟悉的人。同伴检查是否写出了可感知的细节。" },
          { time: "4 分钟", title: "总结与评价", text: "用一句话说明今天对父亲形象的新理解，并写出一处文本依据。" }
        ] },
        { id: "homework", title: "分层作业", text: "基础任务：整理三处人物描写，写出表达效果。\n拓展任务：写一段 150 字的亲情片段，至少包含两个具体动作。\n自评标准：细节真实、叙述连贯、感受有依据。" }
      ]
    },
    {
      id: "quiz", name: "练习出题", short: "出题", icon: "FileQuestion", color: "blue",
      description: "随堂练习、单元检测与参考解析", action: "创建练习",
      output: "练习与解析", image: "assets/quiz.png", topic: "一元一次方程",
      fields: [
        { key: "count", label: "题目数量", options: ["10 题", "15 题", "20 题"] },
        { key: "difficulty", label: "整体难度", options: ["基础巩固", "能力提升", "综合运用"] }
      ],
      requirements: "包含选择题、填空题与解答题，提供参考答案和易错点。",
      sampleTitle: "一元一次方程 · 随堂练习",
      sampleMeta: "初中 · 七年级 · 数学 · 示例节选",
      sections: [
        { id: "questions", title: "一、选择与填空", text: "1. 方程 3x + 2 = 11 的解是（ ）。\nA. x = 2    B. x = 3    C. x = 4    D. x = 5\n\n2. 解方程 2(x - 3) = 8，得 x = ______。\n\n3. 当 x = ______ 时，代数式 5x - 7 的值是 18。" },
        { id: "application", title: "二、应用与探究", text: "4. 某班购买一批练习本。每本 3 元，加上 6 元运费共支付 66 元。购买了多少本练习本？请列出方程并求解。\n\n5. 小明解方程 4x - 5 = 7 时，写出了 4x = 7 - 5。指出错误，并写出正确的解题过程。" },
        { id: "answers", title: "参考答案", text: "1. B。移项得 3x = 9，所以 x = 3。\n2. 7。两边同除以 2，得 x - 3 = 4，所以 x = 7。\n3. 5。由 5x - 7 = 18 得 5x = 25，所以 x = 5。\n4. 设购买 x 本。3x + 6 = 66，解得 x = 20。\n5. 移项没有改变符号。应写为 4x = 7 + 5，所以 x = 3。" },
        { id: "mistakes", title: "易错点与评价", text: "关注移项变号和去括号。检查学生能否先找到等量关系，再设未知数。\n本页展示 5 题排版节选，不代表已按所选数量完成整份试卷。" }
      ]
    },
    {
      id: "slides", name: "课件制作", short: "课件", icon: "Presentation", color: "amber",
      description: "课件大纲、页面内容与讲解提示", action: "规划课件",
      output: "课件内容", image: "assets/slides.png", topic: "低碳生活，从我做起",
      fields: [
        { key: "count", label: "目标页数", options: ["8 页", "12 页", "16 页"] },
        { key: "style", label: "课件风格", options: ["清晰简洁", "活泼互动", "图文讲解"] }
      ],
      requirements: "安排一个课堂互动问题，最后一页给出可以执行的班级行动。",
      sampleTitle: "低碳生活，从我做起",
      sampleMeta: "小学 · 五年级 · 主题班会 · 页面节选",
      sections: [
        { id: "outline", title: "课件大纲", text: "01 低碳生活，从我做起\n02 看见身边的能源消耗\n03 给一天的生活做选择\n04 从一个小行动开始\n05 我们的班级低碳约定" },
        { id: "pages", title: "页面内容", slides: [
          { no: "01", title: "低碳生活，从我做起", kicker: "五年级主题班会", lines: ["把一个小习惯", "变成每天的好行动"], theme: "green" },
          { no: "02", title: "你的一天，用了多少能源？", kicker: "观察与讨论", lines: ["离开教室时，灯关了吗？", "短距离出行，还有哪些选择？", "午餐后，餐盘里剩下了什么？"], theme: "blue" },
          { no: "03", title: "这个星期，我们一起做到", kicker: "班级行动", lines: ["随手关灯，节约一度电", "自带水杯，减少一次性用品", "光盘行动，珍惜每一份食物"], theme: "amber" }
        ] },
        { id: "notes", title: "讲解提示", text: "先请学生描述自己观察到的现象，再讨论可行的行动。不比较家庭条件，不将出行方式简单评价为好或坏。\n课堂结束前，每组选择一项能够坚持一周的行动，并明确记录方式。" }
      ]
    },
    {
      id: "html", name: "HTML 制作", short: "HTML", icon: "CodeXml", color: "teal",
      description: "知识点互动、课堂测验与教学网页", action: "制作互动网页",
      output: "互动网页", image: "assets/html.png", topic: "认识分数",
      defaults: { stage: "小学", grade: "三年级", subject: "数学" },
      fields: [
        { key: "interaction", label: "互动形式", options: ["课堂选择题", "知识卡片", "步骤探究"] },
        { key: "audience", label: "使用场景", options: ["课堂大屏", "学生自主练习", "课后巩固"] }
      ],
      requirements: "围绕认识分数设计课堂互动，答题后显示解析，允许重新作答。",
      sampleTitle: "认识分数 · 课堂互动",
      sampleMeta: "小学 · 三年级 · 数学 · 选择题样例",
      sections: [
        { id: "interactive", title: "课堂选择题", text: "围绕分子与分母设置三道选择题，提交后查看答案与解析。" },
        { id: "preview", title: "页面预览", text: "本页为固定的认识分数样例，不会根据填写内容自动生成。" },
        { id: "download", title: "HTML 样例文件", text: "下载后可直接使用浏览器打开；不依赖网络或额外运行库。" }
      ]
    },
    {
      id: "avatar", name: "AI 数字人", short: "数字人", icon: "UserRound", color: "rose",
      description: "讲稿口播、人物构图与字幕编排", action: "规划口播",
      output: "口播构图样稿", image: "assets/presenter-a.jpg", topic: "认识我们的地球",
      defaults: {
        persona: "a", ratio: "16:9",
        script: "同学们好，今天我们一起认识地球。\n从太空看，地球上有蓝色的海洋、大片陆地，还有白色的云。\n想一想：为什么人们常把地球称作蓝色星球？"
      },
      fields: [
        { key: "voice", label: "声音意向", options: ["清晰女声", "温和男声", "自然中性声"] }
      ],
      requirements: "自然平视镜头，人物居中；字幕放在下方，不遮挡面部。",
      sampleTitle: "认识我们的地球 · 口播构图",
      sampleMeta: "人物照片 · 讲稿 · 字幕排版样例",
      sections: [
        { id: "composition", title: "人物构图", text: "照片仅用于形象与构图示例，不代表已生成数字人或取得人物声音授权。" },
        { id: "script", title: "口播讲稿", text: "展示本机填写的讲稿内容，没有语音合成、口型驱动或视频文件。" },
        { id: "subtitles", title: "字幕排版", text: "可逐句选择字幕，查看字幕在画面中的位置。" }
      ]
    },
    {
      id: "video", name: "AI 视频", short: "视频", icon: "Clapperboard", color: "sky",
      description: "教学短片素材、镜头画面与参数", action: "规划短片",
      output: "短片分镜样稿", image: "assets/earth.jpg", topic: "从太空看地球",
      defaults: { ratio: "16:9", prompt: "从太空中的地球全景开始，镜头缓慢靠近，突出海洋、陆地与云层，适合作为小学科学课导入素材。" },
      fields: [
        { key: "duration", label: "目标时长", options: ["6 秒", "10 秒", "15 秒"] }
      ],
      requirements: "画面清晰，镜头运动平缓，不添加文字，不包含人物。",
      sampleTitle: "从太空看地球 · 短片分镜",
      sampleMeta: "教学短片素材 · 静态分镜样例",
      sections: [
        { id: "frames", title: "示例画面", text: "使用同一张地球照片的不同取景，展示全景、推进与细节三个镜头。" },
        { id: "shots", title: "镜头描述", text: "示例镜头未按输入内容生成；图片不是已生成视频的真实帧。" },
        { id: "parameters", title: "参数摘要", text: "记录画面描述、参考图、时长和画幅，没有视频生成服务。" }
      ]
    },
    {
      id: "grade", name: "作业批改", short: "批改", icon: "ClipboardCheck", color: "coral",
      description: "评价维度、改进建议与个性评语", action: "查看批改",
      output: "评价反馈", image: "assets/grade.png", topic: "一次难忘的经历",
      fields: [
        { key: "type", label: "作业类型", options: ["习作评价", "主观题评价", "项目作业评价"] },
        { key: "tone", label: "评语语气", options: ["鼓励与建议并重", "简洁直接", "分项详细"] }
      ],
      requirements: "先指出值得保留的细节，再提出两条可以具体执行的修改建议。",
      sampleTitle: "《一次难忘的经历》评价反馈",
      sampleMeta: "小学 · 六年级 · 语文 · 匿名示例",
      sections: [
        { id: "overview", title: "整体反馈", text: "这篇习作写清楚了事情的起因、经过和结果。第二段的动作描写比较具体，让读者看到了“紧张”而不只是读到这个词。结尾可以回到故事中的一个细节，减少空泛的感想。" },
        { id: "rubric", title: "分项评价", rubric: [
          { name: "内容与选材", level: "表现较好", note: "事件具体，围绕一次经历展开。" },
          { name: "结构与详略", level: "继续完善", note: "准备过程略长，可把篇幅留给关键转折。" },
          { name: "语言与细节", level: "表现较好", note: "动作描写有效，部分句子还可以更简练。" },
          { name: "感受与表达", level: "继续完善", note: "用事件中的细节支撑结尾的感受。" }
        ] },
        { id: "suggestions", title: "两条修改建议", text: "1. 将第一段的准备过程压缩到两三句，保留与后文最相关的信息。\n2. 在结尾加一个具体画面，例如再次看到某件物品时的反应，让变化自然地显现。" },
        { id: "comment", title: "给学生的评语", text: "你写出了事情发生时的紧张，也让读者看到了你认真尝试的过程。特别是第二段的动作细节，值得保留。下次可以把准备过程写得更短一些，再用一个小画面收尾。期待读到你的修改稿！" }
      ]
    }
  ];
  const courses = [
    { id: "1", name: "从教材内容到一份教学设计", category: "教学备课", task: "prep", minutes: "6 分钟", image: "assets/prep.png",
      intro: "以《背影》为例，整理教学目标、学习活动和课堂评价。",
      chapters: [
        { title: "先确定学习任务", body: "不要先写完整流程。先明确学生学完这一课，需要能够完成什么。\n例如：学生能够从买橘子片段中选出两个动词，并用自己的话解释人物形象。这个任务同时限定了文本范围和可观察的学习表现。" },
        { title: "把目标落实到活动", body: "将目标对应到独立阅读、小组讨论和书面表达。每个活动都留下可观察的产出，例如标注、表格或一段短文。\n时间分配需要考虑阅读速度和交流人数，不能只把各环节的数字凑满。" },
        { title: "最后检查评价与作业", body: "检查课堂评价是否真正对应教学目标。若目标是用细节分析人物，评价就应检查文本依据和解释过程，而不是只问是否感动。\n作业可以提供基础与拓展两种任务，但应避免把层次变成机械的题量差异。" }
      ] },
    { id: "2", name: "一份随堂练习怎样安排题型", category: "练习出题", task: "quiz", minutes: "4 分钟", image: "assets/quiz.png",
      intro: "围绕一个知识点组织基础题、应用题和错例分析。",
      chapters: [
        { title: "明确检测范围", body: "一份随堂练习不必覆盖整章内容。以一元一次方程为例，可以先检查移项、去括号与等量关系三个重点。\n每个重点对应一两道题，比没有目标地增加数量更便于判断学生的困难。" },
        { title: "让题型承担不同任务", body: "选择题用于辨认常见错误，填空题用于查看基本运算，解答题用于观察完整过程。\n保留一道错例分析题，请学生说明错误发生在哪里，而不是只给出正确答案。" },
        { title: "先核对答案再布置", body: "逐题独立核算，检查题干是否有歧义、选项是否存在多个正确答案、单位和符号是否一致。\n自动工具提供的答案只能作为草稿，不能替代教师审核。" }
      ] },
    { id: "3", name: "把班会大纲整理成课件页面", category: "课件制作", task: "slides", minutes: "5 分钟", image: "assets/slides.png",
      intro: "围绕一个主题，区分页面内容与教师讲解。",
      chapters: [
        { title: "每页只有一个中心", body: "先把主题拆成问题，再将每个问题分配到一页。封面明确主题，正文依次呈现观察、讨论和行动。\n不要把完整讲稿直接搬上屏幕。" },
        { title: "给互动留出位置", body: "互动页应写出具体问题和可用时间。教师的补充解释放在讲解提示里，学生看到的页面只保留任务与必要材料。" },
        { title: "用可执行的行动收尾", body: "总结页不必再重复所有知识点。可以让学生选择一个能够实践的行动，并约定时间和记录方式。" }
      ] },
    { id: "4", name: "让评语变成具体的修改建议", category: "作业批改", task: "grade", minutes: "5 分钟", image: "assets/grade.png",
      intro: "从作业证据出发，写出学生能够执行的下一步。",
      chapters: [
        { title: "先描述，再判断", body: "先指出作业中实际出现的表现，再给出评价。用“第二段用动作表现了紧张”代替“写得很好”。" },
        { title: "一次聚焦一两处", body: "建议过多可能让学生无从下手。优先选择最影响表达的一两处，写清楚改哪里、怎样改。" },
        { title: "注意匿名与复核", body: "使用辅助工具前，移除学生姓名、联系方式和其他不必要的个人信息。所有反馈在提供给学生前都应由教师复核。" }
      ] }
  ];
  const pages = [
    { route: "/welcome", title: "展示首页", group: "入口", icon: "Globe" },
    { route: "/home", title: "工作台", group: "入口", icon: "LayoutDashboard" },
    ...tasks.flatMap(t => [
      { route: `/tool/${t.id}`, title: `${t.name} · 填写`, group: "任务流程", icon: t.icon },
      { route: `/result/${t.id}`, title: `${t.name} · 结果`, group: "任务流程", icon: "FileText" }
    ]),
    { route: "/chat", title: "AI 对话", group: "内容与作品", icon: "MessagesSquare" },
    { route: "/library", title: "我的作品", group: "内容与作品", icon: "FolderOpen" },
    { route: "/course", title: "使用教程", group: "学习", icon: "GraduationCap" },
    ...courses.map(c => ({ route: `/course/${c.id}`, title: c.name, group: "学习", icon: "BookOpen" })),
    { route: "/mine", title: "个人中心", group: "账户", icon: "UserRound" },
    { route: "/membership", title: "会员权益", group: "账户", icon: "BadgeCheck" },
    { route: "/orders", title: "订单记录", group: "账户", icon: "ReceiptText" },
    { route: "/login", title: "演示登录", group: "账户", icon: "LogIn" }
  ];
  const samples = [
    { id: "sample-prep", task: "prep", title: "《背影》教学设计", subject: "语文", grade: "八年级", date: "2026-10-09", sample: true },
    { id: "sample-quiz", task: "quiz", title: "一元一次方程 · 随堂练习", subject: "数学", grade: "七年级", date: "2026-10-08", sample: true },
    { id: "sample-slides", task: "slides", title: "低碳生活主题班会", subject: "主题班会", grade: "五年级", date: "2026-10-08", sample: true },
    { id: "sample-html", task: "html", title: "认识分数 · 课堂互动", subject: "数学", grade: "三年级", date: "2026-10-12", sample: true },
    { id: "sample-avatar", task: "avatar", title: "认识我们的地球 · 口播构图", subject: "科学", grade: "小学", date: "2026-10-12", sample: true },
    { id: "sample-video", task: "video", title: "从太空看地球 · 短片分镜", subject: "科学", grade: "小学", date: "2026-10-12", sample: true }
  ];
  const topLinks = [
    { route: "/welcome", label: "首页" }, { route: "/home", label: "工作台" },
    { route: "/chat", label: "AI 对话" }, { route: "/library", label: "我的作品" },
    { route: "/course", label: "使用教程" }
  ];
  const personas = [
    { id: "a", name: "形象 A", description: "正面近景", image: "assets/presenter-a.jpg" },
    { id: "b", name: "形象 B", description: "自然近景", image: "assets/presenter-b.jpg" }
  ];
  const videoShots = [
    { name: "地球全景", description: "地球位于画面中央，先建立整体印象。", scale: 1, position: "50% 50%" },
    { name: "缓慢推进", description: "镜头靠近海洋和陆地的交界，保持平稳。", scale: 1.45, position: "50% 50%" },
    { name: "云层细节", description: "聚焦云层与海洋，留出课堂提问的停顿。", scale: 2.1, position: "60% 35%" }
  ];
  window.PrototypeData = { tasks, courses, pages, samples, topLinks, personas, videoShots,
    projectId: "teacher-workspace-review", version: "2.1" };
}());
