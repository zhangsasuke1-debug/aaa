(function () {
  "use strict";
  window.registerV22Components = function (app) {
    app.component("scope-fields", {
      props: ["form", "state"],
      template: `<div>
        <div class="field-grid three">
          <label>学段<select v-model="form.stage" @change="state.normalizeScope(form)"><option v-for="(_,stage) in state.data.education" :key="stage">{{ stage }}</option></select></label>
          <label>年级<select v-model="form.grade" @change="state.normalizeScope(form)"><option v-for="g in state.data.education[form.stage].grades" :key="g">{{ g }}</option></select></label>
          <label>学科<select v-model="form.subject"><option v-for="s in state.subjectsFor(form)" :key="s">{{ s }}</option></select></label>
        </div>
        <label v-if="form.subject==='其他'" class="spaced-field">其他学科<input v-model="form.subjectOther" maxlength="80"></label>
      </div>`
    });
    app.component("task-options", {
      props: ["form", "task", "state"],
      template: `<div class="task-options">
        <div class="field-grid two"><label v-for="field in task.fields" :key="field.key">{{ field.label }}<select v-model="form[field.key]"><option v-for="option in field.options" :key="option">{{ option }}</option></select></label></div>
        <div v-if="task.id==='prep'&&form.duration==='自定义'" class="field-grid two">
          <label>自定义时长<input type="number" v-model.number="form.customDuration" min="1" :max="form.durationUnit==='分钟'?480:10" step="1" required></label>
          <label>单位<select v-model="form.durationUnit"><option>分钟</option><option>课时</option></select></label>
        </div>
        <fieldset v-if="task.id==='prep'" class="option-fieldset"><legend>内容组成</legend><div class="checkbox-options"><label v-for="item in ['学习目标','教学流程','课堂练习','分层作业','板书设计']" :key="item"><input type="checkbox" v-model="form.composition" :value="item">{{ item }}</label></div></fieldset>
        <template v-if="task.id==='quiz'">
          <fieldset class="option-fieldset"><legend>题型</legend><div class="checkbox-options"><label v-for="item in ['选择','填空','判断','简答']" :key="item"><input type="checkbox" v-model="form.questionTypes" :value="item">{{ item }}</label></div></fieldset>
          <div class="option-setting"><label><span>图文并茂</span><input class="switch" type="checkbox" v-model="form.illustrated"></label><label v-if="form.illustrated" class="inline-number">图片数量<input type="number" v-model.number="form.imageCount" min="1" max="10" step="1" required></label></div>
          <div class="checkbox-options"><label><input type="checkbox" v-model="form.includeAnswers">参考答案</label><label><input type="checkbox" v-model="form.includeAnalysis">题目解析</label></div>
        </template>
        <label v-if="task.id==='slides'&&form.count==='自定义'" class="spaced-field">自定义页数<input type="number" v-model.number="form.customPages" min="1" max="200" step="1" required></label>
        <template v-if="task.id==='html'">
          <label class="spaced-field">交互难度<select v-model="form.interactionDifficulty"><option>简单</option><option>适中</option><option>进阶</option></select></label>
          <div class="checkbox-options spaced-field"><label><input type="checkbox" v-model="form.showHints">显示提示</label><label><input type="checkbox" v-model="form.showFeedback">显示反馈与解析</label></div>
        </template>
      </div>`
    });
    app.component("requirement-tools", {
      props: ["form", "task", "state"],
      template: `<div class="requirement-tools">
        <div v-if="task.id==='html'" class="requirement-choices">
          <button type="button" @click="state.appendRequirement('允许重新开始和反复练习。')"><ui-icon name="RotateCcw" size="15"></ui-icon>允许重试</button>
          <button type="button" @click="state.appendRequirement('步骤清晰，给出逐步引导。')"><ui-icon name="ListChecks" size="15"></ui-icon>逐步引导</button>
          <button type="button" @click="state.appendRequirement('反馈中解释原因，不只显示对错。')"><ui-icon name="MessageSquare" size="15"></ui-icon>解释原因</button>
        </div>
        <button v-if="['prep','quiz','slides','html'].includes(task.id)" type="button" class="text-button polish-button" @click="state.openPolish(form)"><ui-icon name="WandSparkles" size="16"></ui-icon>AI 润色</button>
      </div>`
    });
    app.component("chat-controls", {
      props: ["state", "review", "home"],
      computed: { target() { return this.home ? this.state.home : this.state.current; } },
      template: `<div v-if="target" class="composer-controls">
        <div v-if="target.attachments.length" class="composer-files"><div v-for="file in target.attachments" :key="file.id"><ui-icon name="File" size="15"></ui-icon><span :title="file.name">{{ file.name }}</span><small>{{ state.fileSize(file.size) }}</small><button type="button" class="icon-button small" @click="target.attachments=target.attachments.filter(f=>f.id!==file.id)" :aria-label="'移除'+file.name" title="移除附件"><ui-icon name="X" size="14"></ui-icon></button></div></div>
        <div class="composer-bottom" v-bind="review.attrs(home?'home-chat-options':'chat-options','附件、模型与速度')">
          <div class="composer-option-group">
            <label class="attachment-button composer-attach" title="选择本地附件"><ui-icon name="Paperclip" size="18"></ui-icon><input type="file" multiple aria-label="选择本地附件" @change="state.attachChat($event,target)"></label>
            <label class="compact-select"><span class="sr-only">模型</span><ui-icon name="Sparkles" size="15"></ui-icon><select v-model="target.model"><option v-for="m in state.models" :key="m">{{ m }}</option></select></label>
            <label class="compact-select"><span class="sr-only">速度</span><ui-icon name="Gauge" size="15"></ui-icon><select v-model="target.speed"><option v-for="s in state.speeds" :key="s">{{ s }}</option></select></label>
          </div>
          <button type="submit" class="send-button" :disabled="(!target.draft.trim()&&!target.attachments.length)||(!home&&state.busy)" aria-label="发送任务" title="发送任务"><ui-icon name="ArrowUp" size="18"></ui-icon></button>
        </div>
      </div>`
    });
    app.component("session-sidebar", {
      props: ["state", "review"],
      template: `<div class="v22-session-list" v-bind="review.attrs('recent-sidebar','最近使用与会话菜单')">
        <div class="session-section-heading"><strong>最近使用</strong><button v-if="state.selectionMode" class="icon-button small" @click="state.selectionMode=false;state.selectedIds=[]" title="退出多选" aria-label="退出多选"><ui-icon name="X" size="16"></ui-icon></button></div>
        <div v-if="state.selectionMode" class="session-bulk"><span>已选 {{ state.selectedIds.length }}</span><button class="icon-button small" @click="state.selectedIds=state.sessions.map(s=>s.id)" title="全选会话" aria-label="全选会话"><ui-icon name="ListChecks" size="16"></ui-icon></button><button class="icon-button small" @click="state.exportSessions(state.selectedIds)" :disabled="!state.selectedIds.length" title="导出所选会话" aria-label="导出所选会话"><ui-icon name="Download" size="16"></ui-icon></button><button class="icon-button small" @click="state.deleteSessions(state.selectedIds)" :disabled="!state.selectedIds.length" title="删除所选会话" aria-label="删除所选会话"><ui-icon name="Trash2" size="16"></ui-icon></button></div>
        <div v-for="s in state.orderedSessions" :key="s.id" class="session-row" :class="{active:state.activeId===s.id}">
          <input v-if="state.selectionMode" type="checkbox" :checked="state.selectedIds.includes(s.id)" @change="state.toggleSelection(s.id)" :aria-label="'选择'+s.title">
          <button class="session-title" @click="state.selectionMode?state.toggleSelection(s.id):state.selectSession(s)" :title="s.title"><ui-icon v-if="s.pinned" name="Pin" size="13"></ui-icon><span>{{ s.title }}</span></button>
          <div v-if="!state.selectionMode" class="session-menu-wrap">
            <button class="icon-button small session-more" @click.stop="state.menuId=state.menuId===s.id?'':s.id" :aria-expanded="state.menuId===s.id" :aria-label="s.title+'的会话操作'" title="会话操作"><ui-icon name="Ellipsis" size="18"></ui-icon></button>
            <div v-if="state.menuId===s.id" class="session-menu" role="group" aria-label="会话操作">
              <button @click="state.pinSession(s)"><ui-icon name="Pin" size="15"></ui-icon>{{ s.pinned?'取消置顶':'置顶' }}</button>
              <button @click="state.beginRename(s)"><ui-icon name="Pencil" size="15"></ui-icon>重命名</button>
              <button @click="state.beginSelection(s)"><ui-icon name="ListChecks" size="15"></ui-icon>多选</button>
              <button @click="state.beginShare(s)"><ui-icon name="Share2" size="15"></ui-icon>分享</button>
              <button class="danger-text" @click="state.deleteSessions([s.id])"><ui-icon name="Trash2" size="15"></ui-icon>删除</button>
            </div>
          </div>
        </div>
        <p v-if="!state.sessions.length" class="session-empty">暂无任务会话</p>
      </div>`
    });
    app.component("grading-form", {
      props: ["form", "state", "review"],
      template: `<div>
        <section class="form-section" v-bind="review.attrs('task-parameters','作业图片与正文')"><h2><span class="section-index">01</span>作业内容</h2>
          <div class="segmented-control"><button type="button" :class="{active:form.inputMode==='image'}" :aria-pressed="form.inputMode==='image'" @click="form.inputMode='image'"><ui-icon name="Images" size="17"></ui-icon>图片作业</button><button type="button" :class="{active:form.inputMode==='text'}" :aria-pressed="form.inputMode==='text'" @click="form.inputMode='text'"><ui-icon name="FileText" size="17"></ui-icon>文字作业</button></div>
          <div v-if="form.inputMode==='image'" class="grading-input">
            <div class="reference-upload"><label class="attachment-button"><ui-icon name="ImagePlus" size="18"></ui-icon>选择作业图片<input type="file" accept="image/jpeg,image/png,image/webp" multiple @change="state.attachGradeImages"></label><span class="subtle">JPG / PNG / WebP · 每张不超过 10 MB</span></div>
            <div class="assignment-images"><figure v-for="item in state.gradeImages" :key="item.id"><img :src="item.url" :alt="item.name"><figcaption :title="item.name">{{ item.name }}</figcaption><button type="button" class="icon-button small" @click="state.removeGradeImage(item.id)" :aria-label="'移除'+item.name" title="移除图片"><ui-icon name="X" size="16"></ui-icon></button></figure></div>
            <p v-if="!state.gradeImages.length&&form.imageNames.length" class="field-caption">已保存文件名：{{ form.imageNames.join('、') }}。请重新选择图片。</p>
          </div>
          <label v-else class="spaced-field">作业正文 <span class="required">*</span><textarea v-model="form.assignmentText" rows="9" maxlength="10000" required placeholder="粘贴学生作业或题目与作答内容"></textarea></label>
        </section>
        <section class="form-section" v-bind="review.attrs('basic-information','批改的教学范围')"><h2><span class="section-index">02</span>教学范围</h2><scope-fields :form="form" :state="state"></scope-fields></section>
        <section class="form-section" v-bind="review.attrs('grading-settings','严格程度、评语与模糊文字处理')"><h2><span class="section-index">03</span>批改设置</h2>
          <div class="field-grid two">
            <label>严格程度<select v-model="form.strictness"><option>宽松</option><option>标准</option><option>严格</option></select></label>
            <label>评语语气<select v-model="form.tone"><option>温和鼓励</option><option>客观直接</option></select></label>
            <label>模糊文字<select v-model="form.blurry"><option>标为待确认</option><option>跳过不识别</option></select></label>
          </div>
          <div class="option-setting"><label><span>评分</span><input type="checkbox" class="switch" v-model="form.scoring"></label><label v-if="form.scoring" class="inline-number">满分<input type="number" v-model.number="form.fullScore" min="1" max="1000" step="1" required></label></div>
          <div class="checkbox-options"><label><input type="checkbox" v-model="form.deduct" :disabled="!form.scoring">按错误扣分</label><label><input type="checkbox" v-model="form.suggestions">给出修改建议</label></div>
        </section>
        <section class="form-section" v-bind="review.attrs('extra-requirements','参考答案与补充批改要求')"><h2><span class="section-index">04</span>参考与补充</h2><label>参考答案<textarea v-model="form.answer" rows="3" maxlength="5000"></textarea></label><label class="spaced-field">补充批改要求<textarea v-model="form.requirements" rows="3" maxlength="3000"></textarea></label></section>
      </div>`
    });
    app.component("grading-result", {
      props: ["form", "state", "review", "task"],
      template: `<div>
        <div class="grading-result-layout">
          <section class="assignment-source" v-bind="review.attrs('grading-source','原作业内容')"><div class="section-heading"><h2>原作业</h2><span>{{ form.inputMode==='image'?'图片':'文字' }}</span></div>
            <div v-if="form.inputMode==='image'" class="source-images"><img v-for="image in state.gradeImages" :key="image.id" :src="image.url" :alt="image.name"><p v-if="!state.gradeImages.length">图片需重新选择后才能预览。</p></div>
            <p v-else class="document-text assignment-text">{{ form.assignmentText||'尚未填写作业正文' }}</p>
          </section>
          <section class="grading-feedback" v-bind="review.attrs('result-document','批改反馈样例')"><div class="section-heading"><h2>批改反馈</h2><span class="example-label">反馈样例</span></div><p class="feedback-notice">以下是固定反馈样例，未识别或批改左侧作业。</p>
            <section v-for="s in task.sections" :key="s.id" class="feedback-section" v-bind="review.attrs('result-'+s.id,s.title)">
              <h3>{{ s.title }}</h3><p v-if="s.text" class="document-text">{{ s.text }}</p>
              <div v-if="s.rubric" class="feedback-rubric"><div v-for="row in s.rubric" :key="row.name"><strong>{{ row.name }}</strong><span>{{ row.level }}</span><p>{{ row.note }}</p></div></div>
            </section>
          </section>
        </div>
        <section class="parameter-section" v-bind="review.attrs('grading-parameters','本次批改设置')"><h2>本次设置</h2><dl class="parameter-list"><div><dt>教学范围</dt><dd>{{ state.scopeMeta(form) }}</dd></div><div class="wide"><dt>批改规则</dt><dd>{{ state.taskSummary(form,'grade') }}</dd></div><div class="wide"><dt>参考答案</dt><dd>{{ form.answer||'未填写' }}</dd></div><div class="wide"><dt>补充要求</dt><dd>{{ form.requirements||'未填写' }}</dd></div></dl></section>
      </div>`
    });
    app.component("public-pages", {
      props: ["state", "review", "route"],
      computed: { detail() { return this.state.resource || this.state.notice; }, isResources() { return this.route.startsWith("/resources"); } },
      template: `<div class="public-page">
        <template v-if="route==='/resources'">
          <div class="public-heading" v-bind="review.attrs('resources-heading','资源广场标题与搜索')"><h1>资源广场</h1><label class="search-field"><ui-icon name="Search" size="18"></ui-icon><input v-model="state.resourceSearch" placeholder="搜索资源" aria-label="搜索资源" maxlength="160"></label></div>
          <section class="public-filters" v-bind="review.attrs('resource-filters','资源类型、教材、年级与期次')">
            <div class="public-filter-row" v-for="filter in state.data.resourceFilters" :key="filter.key" role="group" :aria-label="filter.label"><span class="filter-label">{{ filter.label }}</span><div class="filter-choices"><label v-for="item in filter.options" :key="item" :class="{active:state.resourceFilter[filter.key]===item}"><input type="radio" v-model="state.resourceFilter[filter.key]" :value="item" :name="'resource-'+filter.key"><span>{{ item }}</span></label></div></div>
          </section>
          <div class="results-toolbar"><span>{{ state.filteredResources.length }} 份资源</span><div><button class="text-button" @click="state.resetResources"><ui-icon name="RotateCcw" size="15"></ui-icon>重置</button><label>排序<select v-model="state.resourceOrder"><option>最新</option><option>标题</option></select></label></div></div>
          <div class="resource-grid" v-bind="review.attrs('resource-list','资源卡片列表')"><article v-for="r in state.filteredResources" :key="r.id" class="resource-card" v-bind="review.attrs('resource-'+r.id,r.title)">
            <a :href="'#/resources/'+r.id"><div class="resource-cover"><img :src="r.image" :alt="r.title+'内容预览'" width="640" height="400"></div><div class="resource-card-body"><span class="resource-type">{{ r.type }}</span><h2>{{ r.title }}</h2><p>{{ r.grade }} · {{ r.textbook }} · {{ r.term }}</p><div class="resource-card-meta"><span>{{ r.author }}</span><time>{{ r.date }}</time></div></div></a>
          </article></div>
          <div v-if="!state.filteredResources.length" class="empty-state"><ui-icon name="SearchX" size="36"></ui-icon><h2>没有符合条件的资源</h2><button class="text-button" @click="state.resetResources">清空筛选</button></div>
        </template>
        <template v-else-if="route==='/notices'">
          <div class="public-heading" v-bind="review.attrs('notices-heading','全国各地比赛通知标题与搜索')"><h1>全国各地比赛通知</h1><label class="search-field"><ui-icon name="Search" size="18"></ui-icon><input v-model="state.noticeSearch" placeholder="搜索比赛通知" aria-label="搜索比赛通知" maxlength="160"></label></div>
          <div class="notice-toolbar" v-bind="review.attrs('notice-filters','地区与排序筛选')"><label>地区<select v-model="state.noticeRegion"><option v-for="r in state.data.regions" :key="r">{{ r }}</option></select></label><span>{{ state.filteredNotices.length }} 条通知</span><label>排序<select v-model="state.noticeOrder"><option>最新</option><option>标题</option></select></label><button class="text-button" @click="state.noticeRegion='全部';state.noticeSearch=''"><ui-icon name="RotateCcw" size="15"></ui-icon>重置</button></div>
          <div class="notice-grid" v-bind="review.attrs('notice-list','比赛通知列表')"><article v-for="n in state.filteredNotices" :key="n.id" class="notice-card" v-bind="review.attrs('notice-'+n.id,n.title)"><a :href="'#/notices/'+n.id"><img :src="n.image" :alt="n.title+'封面'" width="480" height="640"><div><div class="notice-card-meta"><span>{{ n.region }}</span><time>{{ n.date }}</time></div><h2>{{ n.title }}</h2><p>{{ n.summary }}</p><span class="notice-read">查看通知<ui-icon name="ArrowUpRight" size="15"></ui-icon></span></div></a></article></div>
          <div v-if="!state.filteredNotices.length" class="empty-state"><ui-icon name="SearchX" size="36"></ui-icon><h2>没有符合条件的通知</h2><button class="text-button" @click="state.noticeRegion='全部';state.noticeSearch=''">清空筛选</button></div>
        </template>
        <template v-else-if="detail">
          <a class="back-link" :href="isResources?'#/resources':'#/notices'"><ui-icon name="ArrowLeft" size="15"></ui-icon>{{ isResources?'资源广场':'全部比赛通知' }}</a>
          <header class="public-detail-heading" v-bind="review.attrs('public-detail-heading','内容标题与信息')"><span class="resource-type">{{ isResources?detail.type:detail.region }}</span><h1>{{ detail.title }}</h1><p>{{ isResources?(detail.author+' · '+detail.grade+' · '+detail.term):detail.publisher }} · {{ detail.date }}</p><p v-if="isResources">{{ detail.intro }}</p><a :href="detail.file" download class="secondary-button"><ui-icon name="Download" size="17"></ui-icon>{{ isResources?'下载 '+detail.format+' 样例':'下载通知样例（HTML）' }}</a></header>
          <template v-if="isResources"><section class="resource-preview" v-bind="review.attrs('resource-preview','资源内容预览')"><h2>资源预览</h2><div class="public-iframe"><iframe :src="detail.file" :title="detail.title+'预览'" :inert="review.mode" :tabindex="review.mode?-1:0" sandbox="allow-scripts allow-downloads"></iframe><div v-if="review.mode" class="iframe-annotation-cover" aria-hidden="true"></div></div></section></template>
          <article v-else class="notice-detail" v-bind="review.attrs('notice-detail','通知正文与附件')"><img :src="detail.image" :alt="detail.title+'封面'"><div class="notice-detail-body"><section v-for="s in detail.sections" :key="s.title"><h2>{{ s.title }}</h2><p>{{ s.text }}</p></section><section class="notice-attachments"><h2>附件</h2><a :href="detail.file" download><ui-icon name="FileText" size="18"></ui-icon>{{ detail.title }}.html<ui-icon name="Download" size="17"></ui-icon></a></section></div></article>
        </template>
        <div v-else class="empty-state"><ui-icon name="FileSearch" size="36"></ui-icon><h1>未找到这份内容</h1><div class="empty-actions"><a href="#/resources" class="secondary-button">资源广场</a><a href="#/notices" class="secondary-button">比赛通知</a></div></div>
      </div>`
    });
    app.component("v22-dialog", {
      props: ["state", "review", "keys"],
      template: `<div v-if="state.dialog" class="v22-modal-backdrop" @click.self="state.closeDialog">
        <section class="v22-dialog" role="dialog" aria-modal="true" aria-labelledby="v22-dialog-title" @keydown="keys">
          <header><h2 id="v22-dialog-title">{{ state.dialog==='rename'?'重命名会话':state.dialog==='share'?'分享会话':'AI 润色 · 建议稿样例' }}</h2><button class="icon-button" @click="state.closeDialog" aria-label="关闭窗口" title="关闭"><ui-icon name="X" size="20"></ui-icon></button></header>
          <form v-if="state.dialog==='rename'" @submit.prevent="state.renameSession"><label>会话名称<input data-autofocus v-model="state.renameText" maxlength="100" required></label><p v-if="state.dialogError" role="alert" class="field-error">{{ state.dialogError }}</p><footer><button type="button" class="secondary-button" @click="state.closeDialog">取消</button><button type="submit" class="primary-button">保存名称</button></footer></form>
          <div v-else-if="state.dialog==='share'"><label>会话文本<textarea id="shared-session-text" data-autofocus :value="state.sharedText" readonly rows="12"></textarea></label><footer><button class="secondary-button" @click="state.exportSessions([state.dialogSessionId])"><ui-icon name="Download" size="16"></ui-icon>下载记录</button><button class="primary-button" @click="state.copyShare"><ui-icon name="Copy" size="16"></ui-icon>复制文本</button></footer></div>
          <div v-else v-bind="review.attrs('polish-preview','润色建议稿与采用操作')"><label>建议稿<textarea data-autofocus v-model="state.polishDraft" rows="10" maxlength="3000"></textarea></label><p v-if="state.dialogError" role="alert" class="field-error">{{ state.dialogError }}</p><footer><button class="secondary-button" @click="state.closeDialog">取消</button><button class="primary-button" @click="state.adoptPolish"><ui-icon name="Check" size="16"></ui-icon>采用建议稿</button></footer></div>
        </section>
      </div>`
    });
  };
}());
