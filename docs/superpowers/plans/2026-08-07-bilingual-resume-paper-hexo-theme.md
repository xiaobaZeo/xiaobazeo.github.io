# Bilingual Resume-Paper Hexo Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Butterfly presentation with a custom paper-inspired bilingual resume homepage while preserving all 67 existing Chinese posts, their URLs, and the essential article experience.

**Architecture:** Keep `/Users/pengzihao/blog` as the only authoring source and add an independent `themes/resume-paper` theme. The root index generator renders the English resume, `source/zh-cn/index.md` renders the Chinese resume, and both consume one bilingual JSON data contract plus pure route/content helpers; existing posts continue through Hexo's unchanged permalink pipeline. Verification is split into Node unit tests, clean-build output contracts, local browser QA, and a final static-output sync that preserves the deployment repository's `docs/` directory.

**Tech Stack:** Node.js 22 LTS, npm lockfile, Hexo 5.4.2, Pug, plain CSS, dependency-free browser JavaScript, Node's built-in `node:test`, Valine on post pages only.

## Global Constraints

- Treat `/Users/pengzihao/blog` as the source project and `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io` as generated-output deployment storage; never reconstruct source from generated HTML.
- Do not edit, rename, re-date, translate, or re-slug any of the 67 files under `source/_posts/`.
- Preserve `permalink: :year/:month/:day/:title/` and compare the complete frozen set of 67 legacy article routes after every clean build.
- Keep global `language: zh-CN`; calculate the two resume locales from routes so `/` is English and `/zh-cn/` is Chinese.
- The language switch must be ordinary links, must work without JavaScript, and must never appear on a Chinese article as if an English translation exists.
- Neither resume page may render a job title, department, technology-stack/skills section, location, availability, or employment-status label in visible content or metadata.
- Use only the approved resume facts and wording from `docs/superpowers/specs/2026-08-07-bilingual-resume-blog-design.md`; do not infer new claims from the PDF.
- Preserve archive, tags, category-generator compatibility, Atom feed, sitemap, JSON/search outputs, code highlighting, code copy, responsive images, TOC, tags, previous/next navigation, and post comments.
- Load Valine configuration and scripts on post pages only; never serialize comment configuration into `/` or `/zh-cn/`.
- Use the approved colors exactly: `#F7F4ED`, `#20201D`, `#68655F`, `#7A2026`, `#AAA49A`, `#1D5FD1`; do not add remote fonts, gradients, shadows, portraits, hero images, cards, badges, visitor counters, rewards, or Butterfly effects.
- Keep the existing Butterfly and Yilia directories during this migration as local rollback material; cleanup is a separate change.
- Run generated-output tests only after `hexo clean`; old `public/` files must never make a missing route appear to pass.
- Use Node 22 for the reproducible build and keep Hexo at 5.4.2; do not combine the theme migration with a Hexo major-version upgrade.
- Install `fnm` with Homebrew once, then run every Node/npm/npx command through `fnm exec --using=22` so the machine's Node 25 cannot enter the build.
- Do not print existing Valine client values in tests, logs, this plan, or either resume homepage; migrate them byte-for-byte from the old theme configuration.
- Publishing and `git push` are outside scope. The final task may create local commits in the source and deployment repositories but must stop before any remote mutation.

---

## File Structure

### Source project: `/Users/pengzihao/blog`

- `.gitignore` — excludes build caches, local dependencies, macOS metadata, and QA screenshots.
- `.nvmrc` — selects Node 22.
- `package.json`, `package-lock.json` — pin the existing Hexo dependency graph and expose separate unit/generated/full verification commands.
- `_config.yml` — changes site identity, canonical domain, root pagination, and active theme while preserving permalink and Chinese article language.
- `scripts/capture-legacy-routes.cjs` — one-time extraction of the pre-migration route fixture from the existing `public/content.json`.
- `scripts/migrate-valine-config.cjs` — exact one-time migration of existing Valine client configuration without duplicating values in this plan.
- `scripts/verify-generated-site.cjs` — validates local `href`/`src` targets in a generated site.
- `tests/fixtures/legacy-post-routes.json` — immutable list of the 67 pre-migration post routes.
- `tests/support/site.cjs` — shared output-path, HTML-reading, visible-text, and link helpers.
- `tests/source-baseline.test.cjs` — source count and frozen-route assertions.
- `tests/config.test.cjs` — Hexo route/theme configuration contract.
- `tests/resume-data.test.cjs` — bilingual copy, fact, privacy, and featured-slug contract.
- `tests/resume-helpers.test.cjs` — pure locale, canonical URL, post-resolution, and failure-behavior tests.
- `tests/site-js.test.cjs` — mobile-menu state and code-copy-label unit tests.
- `tests/theme-css.test.cjs` — visual-token, breakpoint, focus, and remote-font contract.
- `tests/generated-home.test.cjs` — English/Chinese resume HTML, metadata, links, and forbidden-content tests.
- `tests/generated-site.test.cjs` — all legacy routes plus archive/tag/post capability tests.
- `tests/generated-integrations.test.cjs` — PDF, comments, feed, sitemap, CNAME, and privacy-boundary tests.
- `tests/site-verifier.test.cjs` — generated-link mapper unit tests.
- `source/_data/resume.json` — the only bilingual resume-content contract.
- `source/_data/comments.json` — migrated Valine client configuration consumed only by the post partial.
- `source/zh-cn/index.md` — Chinese resume route declaration.
- `source/files/peng-zihao-resume.pdf` — byte-for-byte copy of the user-provided PDF.
- `themes/resume-paper/_config.yml` — small theme feature configuration.
- `themes/resume-paper/package.json` — theme identity.
- `themes/resume-paper/lib/resume.js` — pure route, locale, canonical, and featured-post functions.
- `themes/resume-paper/scripts/register.js` — Hexo helper registration only.
- `themes/resume-paper/languages/en.yml`, `themes/resume-paper/languages/zh-CN.yml` — compact non-resume shell labels.
- `themes/resume-paper/layout/layout.pug` — shared document shell.
- `themes/resume-paper/layout/index.pug`, `layout/resume.pug` — English root and Chinese resume entry templates.
- `themes/resume-paper/layout/post.pug` — long-form article layout.
- `themes/resume-paper/layout/archive.pug`, `layout/tag.pug`, `layout/category.pug`, `layout/page.pug` — chronological and taxonomy routes.
- `themes/resume-paper/layout/_partials/head.pug` — title, description, canonical, feed, and resume `hreflang` metadata.
- `themes/resume-paper/layout/_partials/site-header.pug` — resume navigation/language switch or neutral article navigation.
- `themes/resume-paper/layout/_partials/resume-home.pug` — semantic resume sections and data-driven writing links.
- `themes/resume-paper/layout/_partials/post-list.pug`, `post-navigation.pug`, `comments.pug`, `footer.pug` — focused shared units.
- `themes/resume-paper/source/css/main.css` — complete paper visual system and responsive article styles.
- `themes/resume-paper/source/img/favicon.png` — copied from the existing source favicon so the new theme has no missing local asset.
- `themes/resume-paper/source/js/site.js` — accessible mobile navigation and code copy.
- `themes/resume-paper/source/js/comments.js` — post-only Valine loader.
- `docs/qa/2026-08-07-resume-paper.md` — completed browser and visual QA record.

### Deployment repository: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io`

- `docs/superpowers/specs/2026-08-07-bilingual-resume-blog-design.md` — approved product/design contract.
- `docs/superpowers/design-assets/2026-08-07-bilingual-resume-blog-home-en.png` — approved 1487 × 1058 visual reference.
- `docs/superpowers/plans/2026-08-07-bilingual-resume-paper-hexo-theme.md` — this implementation plan.
- All other generated files — replaced from a verified `public/` build while `docs/` and `.git/` are explicitly excluded from deletion.

---

### Task 1: Establish a Recoverable Source Baseline and Freeze Legacy Routes

**Files:**
- Create: `/Users/pengzihao/blog/.gitignore`
- Create: `/Users/pengzihao/blog/.nvmrc`
- Create: `/Users/pengzihao/blog/scripts/capture-legacy-routes.cjs`
- Create: `/Users/pengzihao/blog/tests/source-baseline.test.cjs`
- Create: `/Users/pengzihao/blog/tests/fixtures/legacy-post-routes.json`
- Modify: `/Users/pengzihao/blog/package.json:1-34`
- Create: `/Users/pengzihao/blog/package-lock.json`

**Interfaces:**
- Consumes: Existing `public/content.json`, 67 Markdown files, Hexo 5.4.2 `package.json`, and the unchanged permalink rule.
- Produces: `legacy-post-routes.json: string[]` with exactly 67 unique trailing-slash routes; `npm run test:baseline`; a clean local Git baseline and lockfile.

- [ ] **Step 1: Create and verify a full pre-change archive**

Run:

```bash
mkdir -p /Users/pengzihao/Desktop/pzh/backups
tar -czf /Users/pengzihao/Desktop/pzh/backups/xiaobazeo-hexo-before-resume-paper-2026-08-07.tgz -C /Users/pengzihao blog
tar -tzf /Users/pengzihao/Desktop/pzh/backups/xiaobazeo-hexo-before-resume-paper-2026-08-07.tgz | sed -n '1,20p'
```

Expected: the archive lists `blog/_config.yml`, `blog/package.json`, `blog/source/_posts/`, and `blog/themes/`.

- [ ] **Step 2: Add repository hygiene and pin the build runtime**

Create `.gitignore`:

```gitignore
node_modules/
public/
.deploy_git/
db.json
.DS_Store
artifacts/qa/
npm-debug.log*
```

Create `.nvmrc`:

```text
22
```

Initialize and preserve the untouched source:

```bash
cd /Users/pengzihao/blog
git init -b main
git add .gitignore .nvmrc _config.yml package.json scaffolds source themes
git commit -m "chore: preserve Hexo source baseline"
```

Expected: the initial commit excludes `public/`, `.deploy_git/`, `db.json`, and `node_modules/`.

- [ ] **Step 3: Write the failing frozen-route test**

Create the implementation directories:

```bash
mkdir -p /Users/pengzihao/blog/scripts /Users/pengzihao/blog/tests/fixtures
```

Create `tests/source-baseline.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const fixturePath = path.join(root, 'tests/fixtures/legacy-post-routes.json');

test('source and frozen manifest contain the same 67 legacy posts', () => {
  const sourcePosts = fs.readdirSync(path.join(root, 'source/_posts'))
    .filter((name) => name.endsWith('.md'));
  const routes = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  assert.equal(sourcePosts.length, 67);
  assert.equal(routes.length, 67);
  assert.equal(new Set(routes).size, 67);
  assert.ok(routes.includes('2024/03/10/Java-Deque/'));
  assert.ok(routes.includes('2023/12/19/MySQL-summaryTwo/'));
  assert.ok(routes.includes('2023/08/26/Spring-IOC-SourceCodeAnalysis/'));
  for (const route of routes) {
    assert.match(route, /^\d{4}\/\d{2}\/\d{2}\/.+\/$/u);
  }
});
```

- [ ] **Step 4: Run the test and verify the missing fixture fails**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/source-baseline.test.cjs`

Expected: FAIL with `ENOENT` for `tests/fixtures/legacy-post-routes.json`.

- [ ] **Step 5: Implement the one-time route capture**

Create `scripts/capture-legacy-routes.cjs`:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const contentPath = path.join(root, 'public/content.json');
const outputPath = path.join(root, 'tests/fixtures/legacy-post-routes.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const posts = Array.isArray(content) ? content : content.posts;

if (!Array.isArray(posts)) {
  throw new TypeError('public/content.json must be an array or contain a posts array');
}

const routes = posts
  .map((post) => post.path)
  .filter((route) => /^\d{4}\/\d{2}\/\d{2}\/.+\/$/u.test(route))
  .sort((left, right) => left.localeCompare(right, 'en'));

if (routes.length !== 67 || new Set(routes).size !== 67) {
  throw new Error(`Expected 67 unique legacy post routes, received ${routes.length}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(routes, null, 2)}\n`);
console.log(`Captured ${routes.length} legacy post routes`);
```

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node scripts/capture-legacy-routes.cjs`

Expected: `Captured 67 legacy post routes`.

- [ ] **Step 6: Add reproducible package commands and install the locked graph**

Replace `package.json` with this complete file so the existing dependency set is retained exactly while scripts and the Node engine become reproducible:

```json
{
  "name": "hexo-site",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "hexo generate",
    "clean": "hexo clean",
    "deploy": "hexo deploy",
    "server": "hexo server",
    "test:baseline": "node --test tests/source-baseline.test.cjs"
  },
  "engines": {
    "node": ">=22 <23"
  },
  "hexo": {
    "version": "5.4.2"
  },
  "dependencies": {
    "express": "^4.17.1",
    "hexo-algolia": "^1.3.2",
    "hexo-asset-image": "github:CodeFalling/hexo-asset-image",
    "hexo-generator-archive": "^1.0.0",
    "hexo-generator-category": "^1.0.0",
    "hexo-generator-feed": "^3.0.0",
    "hexo-generator-index": "^2.0.0",
    "hexo-generator-json-content": "^4.2.3",
    "hexo-generator-search": "^2.4.3",
    "hexo-generator-searchdb": "^1.4.0",
    "hexo-generator-sitemap": "^3.0.1",
    "hexo-generator-tag": "^1.0.0",
    "hexo-git-backup": "^0.1.3",
    "hexo-renderer-ejs": "^2.0.0",
    "hexo-renderer-marked": "^4.0.0",
    "hexo-renderer-pug": "^2.0.0",
    "hexo-renderer-stylus": "^2.0.1",
    "hexo-server": "^2.0.0",
    "hexo-theme-butterfly": "^3.8.4",
    "hexo-theme-landscape": "^0.0.3",
    "hexo-wordcount": "^6.0.1"
  }
}
```

Then run:

```bash
cd /Users/pengzihao/blog
brew list fnm >/dev/null 2>&1 || brew install fnm
fnm install 22
fnm exec --using=22 node --version
fnm exec --using=22 npm install
fnm exec --using=22 npx hexo version
```

Expected: Node reports `v22.x`, `package-lock.json` is created, and Hexo reports `5.4.2`.

- [ ] **Step 7: Verify the fixture and a clean baseline build**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run test:baseline
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
test "$(find public -type f -path 'public/20??/??/??/*/index.html' | wc -l | tr -d ' ')" = "67"
```

Expected: the test passes, the current Butterfly site builds under Node 22, and exactly 67 date-based article pages exist. If the unmodified baseline cannot build on Node 22, stop before theme work and record the exact dependency failure; do not silently switch runtimes or upgrade Hexo.

- [ ] **Step 8: Commit the reproducible baseline**

```bash
cd /Users/pengzihao/blog
git add package.json package-lock.json scripts/capture-legacy-routes.cjs tests/source-baseline.test.cjs tests/fixtures/legacy-post-routes.json
git commit -m "test: freeze legacy Hexo routes"
```

---

### Task 2: Add the Bilingual Resume Content Contract

**Files:**
- Create: `/Users/pengzihao/blog/tests/resume-data.test.cjs`
- Create: `/Users/pengzihao/blog/source/_data/resume.json`
- Create: `/Users/pengzihao/blog/source/zh-cn/index.md`
- Modify: `/Users/pengzihao/blog/package.json:5-11`

**Interfaces:**
- Consumes: Exact approved English and Chinese copy plus the three case-sensitive post slugs.
- Produces: `site.data.resume.shared`, `site.data.resume.locales.en`, `site.data.resume.locales['zh-CN']`; `/zh-cn/index.md` with `layout: resume`.

- [ ] **Step 1: Write the failing data-contract test**

Create `tests/resume-data.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'source/_data/resume.json');

function visitKeys(value, callback) {
  if (Array.isArray(value)) return value.forEach((item) => visitKeys(item, callback));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    callback(key);
    visitKeys(child, callback);
  }
}

test('resume data contains the approved bilingual facts and no identity labels', () => {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const en = data.locales.en;
  const zh = data.locales['zh-CN'];

  assert.deepEqual(data.shared.sectionOrder, ['profile', 'experience', 'impact', 'educationWriting']);
  assert.deepEqual(data.shared.featuredPostSlugs, [
    'Java-Deque',
    'MySQL-summaryTwo',
    'Spring-IOC-SourceCodeAnalysis'
  ]);
  assert.equal(en.statement, 'I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.');
  assert.equal(zh.statement, '我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。');
  assert.equal(en.sections.experience.company, 'Xiaomi Corporation');
  assert.equal(en.sections.experience.dates, 'Jul 2024 — Present');
  assert.equal(zh.sections.experience.company, '小米科技有限责任公司');
  assert.equal(zh.sections.experience.dates, '2024.07 — 至今');
  assert.equal(en.sections.experience.bullets.length, 2);
  assert.equal(zh.sections.experience.bullets.length, 2);
  assert.equal(en.sections.impact.items.length, 3);
  assert.equal(zh.sections.impact.items.length, 3);
  assert.match(JSON.stringify(en), /2M\+.*1M\+.*40\+.*10\+.*70\+/s);
  assert.match(JSON.stringify(en), /40%.*50%.*95%\+.*one minute.*10 seconds.*3 seconds/s);
  assert.match(JSON.stringify(zh), /200 万\+.*100 万\+.*40\+.*10\+.*70\+/s);
  assert.match(JSON.stringify(zh), /40%.*50%.*95%\+.*1 分钟.*10 秒.*3 秒/s);
  assert.equal(en.sections.educationWriting.education.school, 'Hunan University of Technology');
  assert.equal(zh.sections.educationWriting.education.school, '湖南工业大学');

  const forbiddenKeys = new Set(['role', 'position', 'department', 'techStack', 'skills', 'headline', 'location', 'availability', 'employmentStatus']);
  visitKeys(data.locales, (key) => assert.equal(forbiddenKeys.has(key), false, `Forbidden resume key: ${key}`));
  assert.doesNotMatch(JSON.stringify(data.locales), /Backend Engineer|Automotive Department|Autonomous Driving and Robotics Department|后端开发工程师|汽车部|自动驾驶与机器人部|Tech Stack|技术栈|技能清单/iu);
  assert.doesNotMatch(JSON.stringify(data.locales), /166918502@qq\.com/u);
});

test('every featured slug exists as a source post', () => {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const available = new Set(fs.readdirSync(path.join(root, 'source/_posts'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.basename(name, '.md')));

  for (const slug of data.shared.featuredPostSlugs) assert.ok(available.has(slug), slug);
});
```

- [ ] **Step 2: Run the test and verify the data file is missing**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/resume-data.test.cjs`

Expected: FAIL with `ENOENT` for `source/_data/resume.json`.

- [ ] **Step 3: Create the complete bilingual JSON contract**

Create the content directories:

```bash
mkdir -p /Users/pengzihao/blog/source/_data /Users/pengzihao/blog/source/zh-cn
```

Create `source/_data/resume.json`:

```json
{
  "shared": {
    "githubHref": "https://github.com/xiaobazeo",
    "emailHref": "mailto:166918502@qq.com",
    "pdfHref": "/files/peng-zihao-resume.pdf",
    "sectionOrder": ["profile", "experience", "impact", "educationWriting"],
    "featuredPostSlugs": ["Java-Deque", "MySQL-summaryTwo", "Spring-IOC-SourceCodeAnalysis"]
  },
  "locales": {
    "en": {
      "htmlLang": "en",
      "seo": {
        "title": "Peng Zihao — Resume and Writing",
        "description": "Peng Zihao's resume, selected production-system outcomes, education, and technical writing."
      },
      "brand": "PENG ZIHAO / XIAOBA",
      "skipLink": "Skip to content",
      "primaryNavLabel": "Primary navigation",
      "languageNavLabel": "Language",
      "menuLabel": "Menu",
      "nav": [
        {"id": "resume", "label": "Resume"},
        {"id": "experience", "label": "Experience"},
        {"id": "projects", "label": "Projects"},
        {"id": "writing", "label": "Writing"},
        {"id": "contact", "label": "Contact"}
      ],
      "name": "PENG ZIHAO",
      "statement": "I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.",
      "actions": {"github": "GitHub", "email": "Email", "pdf": "Download PDF"},
      "sections": {
        "profile": {
          "number": "01",
          "title": "Profile",
          "body": "Focused on production orchestration, distributed scheduling, and AI-agent workflows with measurable operational impact."
        },
        "experience": {
          "number": "02",
          "title": "Experience",
          "company": "Xiaomi Corporation",
          "dates": "Jul 2024 — Present",
          "bullets": [
            "Led a five-person team building a production collaboration and workflow platform supporting 2M+ monthly process instances, 1M+ daily algorithm tasks, and 40+ business lines.",
            "Helped build an internal AI-agent platform with 10+ reusable workflows serving 70+ users."
          ]
        },
        "impact": {
          "number": "03",
          "title": "Selected Impact",
          "items": [
            {"name": "Process Engine", "summary": "Self-built DAG orchestration; onboarding time reduced 40%, staffing effort reduced 50%."},
            {"name": "Distributed Task Scheduler", "summary": "Database queries reduced 95%+; failed tasks recover within one minute on average."},
            {"name": "AI-Agent Workflow Platform", "summary": "Pod initialization reduced from about 10 seconds to about 3 seconds."}
          ]
        },
        "educationWriting": {
          "number": "04",
          "title": "Education & Writing",
          "educationTitle": "Education",
          "writingTitle": "Selected Writing",
          "education": {
            "school": "Hunan University of Technology",
            "degree": "B.S. in Computer Science and Technology",
            "dates": "Sep 2020 — Jun 2024"
          },
          "archivePrefix": "Browse all",
          "archiveSuffix": "posts"
        }
      },
      "metadata": {
        "quote": "I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.",
        "updatedLabel": "Last updated",
        "updatedValue": "Aug 2026",
        "articleCountLabel": "Articles"
      },
      "footer": {"feed": "Atom feed"}
    },
    "zh-CN": {
      "htmlLang": "zh-CN",
      "seo": {
        "title": "彭子豪 — 个人简历与文章",
        "description": "彭子豪的个人简历、生产系统代表成果、教育经历与技术文章。"
      },
      "brand": "彭子豪 / XIAOBA",
      "skipLink": "跳到正文",
      "primaryNavLabel": "主导航",
      "languageNavLabel": "语言",
      "menuLabel": "菜单",
      "nav": [
        {"id": "resume", "label": "简历"},
        {"id": "experience", "label": "经历"},
        {"id": "projects", "label": "项目"},
        {"id": "writing", "label": "文章"},
        {"id": "contact", "label": "联系"}
      ],
      "name": "彭子豪",
      "statement": "我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。",
      "actions": {"github": "GitHub", "email": "邮件", "pdf": "下载 PDF"},
      "sections": {
        "profile": {
          "number": "01",
          "title": "个人简介",
          "body": "关注生产流程编排、分布式任务调度与 AI Agent 工作流，并以可量化结果持续改善生产效率。"
        },
        "experience": {
          "number": "02",
          "title": "工作经历",
          "company": "小米科技有限责任公司",
          "dates": "2024.07 — 至今",
          "bullets": [
            "带领 5 人团队建设生产协作与任务流转平台，支撑月均 200 万+ 流程实例、日均 100 万+ 算法任务，覆盖 40+ 业务线。",
            "参与内部 AI Agent 工程平台建设，落地 10+ 可复用工作流，服务 70+ 用户。"
          ]
        },
        "impact": {
          "number": "03",
          "title": "代表成果",
          "items": [
            {"name": "流程引擎", "summary": "自研 DAG 编排；新业务接入周期缩短 40%，人力投入降低 50%。"},
            {"name": "分布式任务调度中心", "summary": "DB 查询量下降 95%+；异常任务平均 1 分钟内恢复。"},
            {"name": "AI Agent 工作流平台", "summary": "Pod 初始化由约 10 秒降至约 3 秒。"}
          ]
        },
        "educationWriting": {
          "number": "04",
          "title": "教育与写作",
          "educationTitle": "教育经历",
          "writingTitle": "精选文章",
          "education": {
            "school": "湖南工业大学",
            "degree": "计算机科学与技术 本科",
            "dates": "2020.09 — 2024.06"
          },
          "archivePrefix": "查看全部",
          "archiveSuffix": "篇文章"
        }
      },
      "metadata": {
        "quote": "我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。",
        "updatedLabel": "最近更新",
        "updatedValue": "2026 年 8 月",
        "articleCountLabel": "文章"
      },
      "footer": {"feed": "Atom 订阅"}
    }
  }
}
```

- [ ] **Step 4: Declare the Chinese resume route**

Create `source/zh-cn/index.md`:

```markdown
---
title: 彭子豪
layout: resume
lang: zh-CN
comments: false
---
```

- [ ] **Step 5: Run the focused tests**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/resume-data.test.cjs tests/source-baseline.test.cjs`

Expected: 3 tests pass; the 67 post files remain untouched.

- [ ] **Step 6: Expose the unit-test script and commit**

Add this script to `package.json`:

```json
"test:data": "node --test tests/resume-data.test.cjs"
```

Then commit:

```bash
cd /Users/pengzihao/blog
git add package.json source/_data/resume.json source/zh-cn/index.md tests/resume-data.test.cjs
git commit -m "feat: add bilingual resume content"
```

---

### Task 3: Add Locale, Canonical, and Featured-Post Helpers

**Files:**
- Create: `/Users/pengzihao/blog/tests/config.test.cjs`
- Create: `/Users/pengzihao/blog/tests/resume-helpers.test.cjs`
- Create: `/Users/pengzihao/blog/themes/resume-paper/package.json`
- Create: `/Users/pengzihao/blog/themes/resume-paper/_config.yml`
- Create: `/Users/pengzihao/blog/themes/resume-paper/lib/resume.js`
- Create: `/Users/pengzihao/blog/themes/resume-paper/scripts/register.js`
- Create: `/Users/pengzihao/blog/themes/resume-paper/languages/en.yml`
- Create: `/Users/pengzihao/blog/themes/resume-paper/languages/zh-CN.yml`
- Create: `/Users/pengzihao/blog/themes/resume-paper/source/img/favicon.png`
- Modify: `/Users/pengzihao/blog/_config.yml:1-75`

**Interfaces:**
- Consumes: `resume.json`, Hexo page paths, `site.posts` as either an array or Hexo `Query` with `toArray()`.
- Produces: `normalizeRoute(string): string`, `localeForPath(string): 'en'|'zh-CN'`, `isResumePath(string): boolean`, `canonicalPath(string): string`, `absoluteUrl(string,string): string`, `profileForLocale(object,string): object`, `featuredPosts(array|Query,string[]): FeaturedPost[]`, and Hexo helpers `page_locale`, `is_resume_page`, `canonical_url`, `absolute_site_url`, `resume_context`.

- [ ] **Step 1: Write failing configuration and pure-helper tests**

Create `tests/config.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8').replace(/\r\n?/gu, '\n');

test('Hexo config selects the custom theme without changing legacy routes', () => {
  assert.match(config, /^title: PENG ZIHAO \/ XIAOBA$/m);
  assert.match(config, /^language: zh-CN$/m);
  assert.match(config, /^url: https:\/\/xiaobazeo\.com$/m);
  assert.match(config, /^permalink: :year\/:month\/:day\/:title\/$/m);
  assert.match(config, /^theme: resume-paper$/m);
  assert.match(config, /index_generator:\n  path: ''\n  per_page: 0\n  order_by: -date/m);
  assert.equal(fs.existsSync(path.join(root, 'source/index.md')), false);
});
```

Create `tests/resume-helpers.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../themes/resume-paper/lib/resume');

test('locale and canonical helpers normalize Hexo routes', () => {
  assert.equal(helpers.localeForPath('/'), 'en');
  assert.equal(helpers.localeForPath('index.html'), 'en');
  assert.equal(helpers.localeForPath('/zh-cn/'), 'zh-CN');
  assert.equal(helpers.localeForPath('zh-cn/index.html'), 'zh-CN');
  assert.equal(helpers.localeForPath('/archives/'), 'zh-CN');
  assert.equal(helpers.localeForPath('/2024/03/10/Java-Deque/'), 'zh-CN');
  assert.equal(helpers.isResumePath('/'), true);
  assert.equal(helpers.isResumePath('/zh-cn/'), true);
  assert.equal(helpers.isResumePath('/archives/'), false);
  assert.equal(helpers.canonicalPath('index.html'), '/');
  assert.equal(helpers.canonicalPath('zh-cn/index.html'), '/zh-cn/');
  assert.equal(helpers.canonicalPath('2024/03/10/Java-Deque/index.html'), '/2024/03/10/Java-Deque/');
  assert.equal(helpers.absoluteUrl('https://xiaobazeo.com', 'zh-cn/index.html'), 'https://xiaobazeo.com/zh-cn/');
});

test('featuredPosts preserves requested order and supports Hexo Query shape', () => {
  const posts = [
    { slug: 'Second', title: 'Second title', path: '2024/01/02/Second/', date: new Date('2024-01-02T00:00:00Z') },
    { slug: 'First', title: 'First title', path: '2024/01/01/First/', date: { format: () => '2024-01-01' } }
  ];
  const result = helpers.featuredPosts({ toArray: () => posts }, ['First', 'Second']);

  assert.deepEqual(result, [
    { slug: 'First', title: 'First title', path: '2024/01/01/First/', date: '2024-01-01' },
    { slug: 'Second', title: 'Second title', path: '2024/01/02/Second/', date: '2024-01-02' }
  ]);
  assert.throws(() => helpers.featuredPosts(posts, ['Missing']), /Missing/);
  assert.throws(() => helpers.featuredPosts(posts, ['First', 'First']), /Duplicate featured slug/);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/config.test.cjs tests/resume-helpers.test.cjs`

Expected: config assertions fail on the old Butterfly values and the helper test fails with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Create the pure helper module**

Create the theme module directories:

```bash
mkdir -p /Users/pengzihao/blog/themes/resume-paper/lib /Users/pengzihao/blog/themes/resume-paper/scripts /Users/pengzihao/blog/themes/resume-paper/languages /Users/pengzihao/blog/themes/resume-paper/source/img
```

Create `themes/resume-paper/lib/resume.js`:

```js
'use strict';

const path = require('node:path');

function normalizeRoute(input = '') {
  let route = String(input).split(/[?#]/u, 1)[0].replace(/^\/+/, '');
  if (route === '') return 'index.html';
  if (route.endsWith('/')) route += 'index.html';
  return route;
}

function localeForPath(input) {
  const route = normalizeRoute(input);
  if (route === 'index.html') return 'en';
  if (route === 'zh-cn/index.html') return 'zh-CN';
  return 'zh-CN';
}

function isResumePath(input) {
  const route = normalizeRoute(input);
  return route === 'index.html' || route === 'zh-cn/index.html';
}

function canonicalPath(input) {
  const route = normalizeRoute(input);
  if (route === 'index.html') return '/';
  return `/${route.replace(/index\.html$/u, '')}`;
}

function absoluteUrl(siteUrl, input) {
  const base = String(siteUrl).endsWith('/') ? String(siteUrl) : `${siteUrl}/`;
  return new URL(canonicalPath(input), base).toString();
}

function profileForLocale(resumeData, locale) {
  const profile = resumeData && resumeData.locales && resumeData.locales[locale];
  if (!profile) throw new Error(`Missing resume locale: ${locale}`);
  return profile;
}

function postSlug(post) {
  if (post.slug) return post.slug;
  const source = post.source || '';
  return path.basename(source, path.extname(source));
}

function postDate(post) {
  if (post.date && typeof post.date.format === 'function') return post.date.format('YYYY-MM-DD');
  const value = new Date(post.date);
  if (Number.isNaN(value.getTime())) throw new Error(`Invalid date for featured post: ${postSlug(post)}`);
  return value.toISOString().slice(0, 10);
}

function featuredPosts(posts, slugs) {
  if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate featured slug');
  const list = posts && typeof posts.toArray === 'function' ? posts.toArray() : Array.from(posts || []);

  return slugs.map((slug) => {
    const matches = list.filter((post) => postSlug(post) === slug);
    if (matches.length !== 1) throw new Error(`Expected one featured post for slug: ${slug}`);
    const post = matches[0];
    return { slug, title: post.title, path: post.path, date: postDate(post) };
  });
}

module.exports = {
  normalizeRoute,
  localeForPath,
  isResumePath,
  canonicalPath,
  absoluteUrl,
  profileForLocale,
  featuredPosts
};
```

- [ ] **Step 4: Register thin Hexo helpers**

Create `themes/resume-paper/scripts/register.js`:

```js
'use strict';

const {
  localeForPath,
  isResumePath,
  absoluteUrl,
  profileForLocale,
  featuredPosts
} = require('../lib/resume');

hexo.extend.helper.register('page_locale', localeForPath);
hexo.extend.helper.register('is_resume_page', isResumePath);
hexo.extend.helper.register('canonical_url', function canonicalUrl(page) {
  return absoluteUrl(this.config.url, page.path);
});
hexo.extend.helper.register('absolute_site_url', function absoluteSiteUrl(route) {
  return absoluteUrl(this.config.url, route);
});
hexo.extend.helper.register('resume_context', function resumeContext(page) {
  const data = this.site.data.resume;
  const locale = localeForPath(page.path);
  return {
    locale,
    profile: profileForLocale(data, locale),
    shared: data.shared,
    featuredPosts: featuredPosts(this.site.posts, data.shared.featuredPostSlugs),
    postCount: this.site.posts.length
  };
});
```

- [ ] **Step 5: Create the theme identity and article-shell labels**

Create `themes/resume-paper/package.json`:

```json
{
  "name": "hexo-theme-resume-paper",
  "version": "1.0.0",
  "private": true
}
```

Create `themes/resume-paper/_config.yml`:

```yaml
favicon: /img/favicon.png
toc:
  minHeadings: 3
comments:
  enable: false
```

Create `themes/resume-paper/languages/en.yml`:

```yaml
nav:
  home: Resume
  archives: Writing
  tags: Tags
post:
  contents: Contents
  comments: Comments
  previous: Previous
  next: Next
```

Create `themes/resume-paper/languages/zh-CN.yml`:

```yaml
nav:
  home: 简历
  archives: 文章
  tags: 标签
post:
  contents: 目录
  comments: 评论
  previous: 上一篇
  next: 下一篇
```

Copy the existing favicon into the new theme and verify it is byte-identical:

```bash
mkdir -p /Users/pengzihao/blog/themes/resume-paper/source/img
cp /Users/pengzihao/blog/themes/butterfly/source/img/favicon.png /Users/pengzihao/blog/themes/resume-paper/source/img/favicon.png
shasum -a 256 /Users/pengzihao/blog/themes/butterfly/source/img/favicon.png /Users/pengzihao/blog/themes/resume-paper/source/img/favicon.png
```

Expected: both SHA-256 values are identical.

- [ ] **Step 6: Switch only the required Hexo configuration values**

Apply these exact changes to `_config.yml` and leave `permalink`, `language`, generator dependencies, `source_dir`, `post_asset_folder`, highlight settings, feed, sitemap, JSON, search, and deploy settings unchanged:

```yaml
title: PENG ZIHAO / XIAOBA
subtitle: ''
description: 彭子豪的个人简历与技术文章归档
keywords: resume,engineering,technical writing
author: Peng Zihao
language: zh-CN

url: https://xiaobazeo.com
permalink: :year/:month/:day/:title/

index_generator:
  path: ''
  per_page: 0
  order_by: -date

theme: resume-paper
```

- [ ] **Step 7: Run focused tests and commit**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 node --test tests/config.test.cjs tests/resume-helpers.test.cjs tests/resume-data.test.cjs tests/source-baseline.test.cjs
```

Expected: all tests pass.

Commit:

```bash
cd /Users/pengzihao/blog
git add _config.yml themes/resume-paper tests/config.test.cjs tests/resume-helpers.test.cjs
git commit -m "feat: add resume theme data helpers"
```

---

### Task 4: Render Both Resume Routes with Semantic HTML and Correct Metadata

**Files:**
- Create: `/Users/pengzihao/blog/tests/support/site.cjs`
- Create: `/Users/pengzihao/blog/tests/generated-home.test.cjs`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/layout.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/index.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/resume.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/post.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/archive.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/tag.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/category.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/page.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/head.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/site-header.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/resume-home.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/footer.pug`

**Interfaces:**
- Consumes: Hexo helpers from Task 3 and `ResumeContext = { locale, profile, shared, featuredPosts, postCount }`.
- Produces: `public/index.html` in English, `public/zh-cn/index.html` in Chinese, semantic IDs `resume`, `profile`, `experience`, `projects`, `writing`, `contact`, and correct canonical/alternate metadata.

- [ ] **Step 1: Add shared generated-site test helpers**

Create `tests/support/site.cjs`:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const outputRoot = path.resolve(process.env.SITE_OUTPUT_DIR || path.join(root, 'public'));

function publicFileForRoute(route) {
  let clean = String(route).split(/[?#]/u, 1)[0].replace(/^\/+/, '');
  if (clean === '') clean = 'index.html';
  else if (clean.endsWith('/')) clean += 'index.html';
  return path.join(outputRoot, decodeURIComponent(clean));
}

function readPublic(route) {
  return fs.readFileSync(publicFileForRoute(route), 'utf8');
}

function assertRouteExists(assert, route) {
  assert.equal(fs.existsSync(publicFileForRoute(route)), true, `Missing generated route: ${route}`);
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&#39;/gu, "'")
    .replace(/&mdash;/gu, '—')
    .replace(/\s+/gu, ' ')
    .trim();
}

function extractHrefs(html) {
  return [...html.matchAll(/\bhref="([^"]+)"/gu)].map((match) => match[1]);
}

module.exports = { root, outputRoot, publicFileForRoute, readPublic, assertRouteExists, visibleText, extractHrefs };
```

- [ ] **Step 2: Write the failing generated-home contract**

Create `tests/generated-home.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { root, readPublic, publicFileForRoute, visibleText, extractHrefs } = require('./support/site');

const forbidden = /Backend Engineer|Automotive Department|Autonomous Driving and Robotics Department|后端开发工程师|汽车部|自动驾驶与机器人部|Tech Stack|技术栈|技能清单|Availability|Employment Status|Location|可入职|在职状态|所在地/iu;

test('root resume is English, static, complete, and private by design', () => {
  const html = readPublic('/');
  const text = visibleText(html);

  assert.match(html, /<html[^>]+lang="en"/u);
  assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/xiaobazeo\.com\/"/u);
  assert.match(html, /hreflang="en"[^>]+href="https:\/\/xiaobazeo\.com\/"/u);
  assert.match(html, /hreflang="zh-CN"[^>]+href="https:\/\/xiaobazeo\.com\/zh-cn\/"/u);
  assert.match(html, /hreflang="x-default"[^>]+href="https:\/\/xiaobazeo\.com\/"/u);
  assert.match(html, /<a[^>]+href="\/zh-cn\/"[^>]*>中文<\/a>/u);
  assert.match(html, /aria-current="page"[^>]*>EN<\/a>/u);
  assert.match(html, /<main[^>]+id="main-content"/u);
  assert.equal((html.match(/<h1\b/gu) || []).length, 1);
  assert.match(text, /Xiaomi Corporation/u);
  assert.match(text, /Jul 2024 — Present/u);
  assert.match(text, /2M\+ monthly process instances/u);
  assert.match(text, /Database queries reduced 95%\+/u);
  assert.match(text, /Hunan University of Technology/u);
  assert.doesNotMatch(text, forbidden);
  assert.doesNotMatch(html, forbidden);
  assert.doesNotMatch(text, /166918502@qq\.com/u);
  assert.doesNotMatch(text, /\b1[3-9]\d{9}\b/u);
  assert.doesNotMatch(html, /navigator\.language|location\.replace|http-equiv="refresh"/iu);
  assert.doesNotMatch(html, /Valine|vcomments|butterfly|ribbon|canvas-nest/iu);
  assert.equal(fs.existsSync(publicFileForRoute('/page/2/')), false);
});

test('Chinese resume mirrors the approved structure and links back without JavaScript', () => {
  const html = readPublic('/zh-cn/');
  const text = visibleText(html);

  assert.match(html, /<html[^>]+lang="zh-CN"/u);
  assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/xiaobazeo\.com\/zh-cn\/"/u);
  assert.match(html, /<a[^>]+href="\/"[^>]*>EN<\/a>/u);
  assert.match(html, /aria-current="page"[^>]*>中文<\/a>/u);
  assert.match(text, /小米科技有限责任公司/u);
  assert.match(text, /2024\.07 — 至今/u);
  assert.match(text, /月均 200 万\+ 流程实例/u);
  assert.match(text, /DB 查询量下降 95%\+/u);
  assert.match(text, /湖南工业大学/u);
  assert.doesNotMatch(text, forbidden);
  assert.doesNotMatch(html, forbidden);
  assert.doesNotMatch(text, /166918502@qq\.com/u);
  assert.doesNotMatch(text, /\b1[3-9]\d{9}\b/u);
});

test('featured writing links resolve from Hexo posts with their real dates', () => {
  const html = readPublic('/');
  const hrefs = extractHrefs(html);
  const expected = [
    ['2024/03/10/Java-Deque/', '2024-03-10'],
    ['2023/12/19/MySQL-summaryTwo/', '2023-12-19'],
    ['2023/08/26/Spring-IOC-SourceCodeAnalysis/', '2023-08-26']
  ];

  for (const [route, date] of expected) {
    assert.ok(hrefs.includes(`/${route}`), route);
    assert.match(html, new RegExp(`<time[^>]+datetime="${date}"[^>]*>${date}<\\/time>`, 'u'));
    assert.equal(fs.existsSync(path.join(root, 'source/_posts', `${route.split('/').at(-2)}.md`)), true);
  }
});
```

- [ ] **Step 3: Run a clean build and verify the missing theme layouts fail**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: the build reports missing layouts or produces no homepage, and the test fails because `public/index.html` is absent.

- [ ] **Step 4: Create the shared document shell and metadata partial**

Create the layout directories:

```bash
mkdir -p /Users/pengzihao/blog/themes/resume-paper/layout/_partials
```

Create `themes/resume-paper/layout/layout.pug`:

```pug
doctype html
- const pageLocale = page_locale(page.path)
html(lang=pageLocale)
  head
    != partial('_partials/head', { pageLocale: pageLocale }, { cache: false })
  body(class=is_resume_page(page.path) ? 'resume-page' : (is_post() ? 'post-page' : 'listing-page'))
    - const skipLabel = is_resume_page(page.path) ? resume_context(page).profile.skipLink : '跳到正文'
    a.skip-link(href='#main-content')= skipLabel
    != partial('_partials/site-header', { pageLocale: pageLocale }, { cache: false })
    block content
    != partial('_partials/footer', { pageLocale: pageLocale }, { cache: false })
    script(src=url_for('/js/site.js') defer)
```

Create `themes/resume-paper/layout/_partials/head.pug`:

```pug
- const resumePage = is_resume_page(page.path)
- const context = resumePage ? resume_context(page) : null
- const pageTitle = resumePage ? context.profile.seo.title : (page.title ? `${page.title} — ${config.title}` : config.title)
- const description = resumePage ? context.profile.seo.description : (page.description || config.description)
meta(charset='utf-8')
meta(name='viewport' content='width=device-width, initial-scale=1')
meta(name='theme-color' content='#F7F4ED')
meta(name='author' content=config.author)
title= pageTitle
meta(name='description' content=description)
link(rel='canonical' href=canonical_url(page))
link(rel='alternate' type='application/atom+xml' title=`${config.title} Atom Feed` href=absolute_site_url('atom.xml'))
if resumePage
  link(rel='alternate' hreflang='en' href=absolute_site_url('index.html'))
  link(rel='alternate' hreflang='zh-CN' href=absolute_site_url('zh-cn/index.html'))
  link(rel='alternate' hreflang='x-default' href=absolute_site_url('index.html'))
  meta(property='og:type' content='profile')
  meta(property='og:title' content=pageTitle)
  meta(property='og:description' content=description)
  meta(property='og:url' content=canonical_url(page))
link(rel='icon' href=url_for(theme.favicon))
link(rel='stylesheet' href=url_for('/css/main.css'))
```

- [ ] **Step 5: Create the responsive header and language links**

Create `themes/resume-paper/layout/_partials/site-header.pug`:

```pug
header.site-header
  .site-header__inner
    if is_resume_page(page.path)
      - const context = resume_context(page)
      - const profile = context.profile
      a.site-brand(href=url_for(context.locale === 'en' ? '/' : '/zh-cn/'))= profile.brand
      nav.primary-nav(aria-label=profile.primaryNavLabel)
        button.menu-toggle(type='button' aria-expanded='false' aria-controls='primary-menu' aria-label=profile.menuLabel)
          span.menu-toggle__line
          span.menu-toggle__line
        ul#primary-menu.primary-nav__list
          each item in profile.nav
            li
              a(href=`#${item.id}`)= item.label
      nav.language-switch(aria-label=profile.languageNavLabel)
        a(href=url_for('/') aria-current=context.locale === 'en' ? 'page' : null) EN
        span(aria-hidden='true') /
        a(href=url_for('/zh-cn/') aria-current=context.locale === 'zh-CN' ? 'page' : null) 中文
    else
      a.site-brand(href=url_for('/')) PENG ZIHAO / XIAOBA
      nav.primary-nav.primary-nav--article(aria-label='文章导航')
        ul.primary-nav__list
          li: a(href=url_for('/')) 简历
          li: a(href=url_for('/archives/')) 文章
          li: a(href=url_for('/tags/')) 标签
```

- [ ] **Step 6: Create the complete resume partial**

Create `themes/resume-paper/layout/_partials/resume-home.pug`:

```pug
- const context = resume_context(page)
- const profile = context.profile
- const shared = context.shared
main#main-content.resume-shell
  .resume-grid
    header#resume.identity-header
      p.identity-header__eyebrow= profile.brand
      h1= profile.name
      p.identity-header__statement= profile.statement
      nav#contact.identity-actions(aria-label=profile.nav.find((item) => item.id === 'contact').label)
        a.action-link(href=shared.githubHref target='_blank' rel='noopener noreferrer')= profile.actions.github
        a.action-link(href=shared.emailHref)= profile.actions.email
        a.action-link(href=url_for(shared.pdfHref) download)= profile.actions.pdf
    aside.metadata-rail(aria-label=profile.metadata.articleCountLabel)
      blockquote= profile.metadata.quote
      dl
        div
          dt= profile.metadata.updatedLabel
          dd= profile.metadata.updatedValue
        div
          dt= profile.metadata.articleCountLabel
          dd= context.postCount
    .resume-main
      section#profile.numbered-section(aria-labelledby='profile-title')
        .section-heading
          span.section-number= profile.sections.profile.number
          h2#profile-title= profile.sections.profile.title
        p.section-lead= profile.sections.profile.body
      section#experience.numbered-section(aria-labelledby='experience-title')
        .section-heading
          span.section-number= profile.sections.experience.number
          h2#experience-title= profile.sections.experience.title
        .experience-entry
          .experience-entry__heading
            h3= profile.sections.experience.company
            time= profile.sections.experience.dates
          ul
            each bullet in profile.sections.experience.bullets
              li= bullet
      section#projects.numbered-section(aria-labelledby='projects-title')
        .section-heading
          span.section-number= profile.sections.impact.number
          h2#projects-title= profile.sections.impact.title
        ol.impact-list
          each item in profile.sections.impact.items
            li
              h3= item.name
              p= item.summary
      section#writing.numbered-section(aria-labelledby='writing-title')
        .section-heading
          span.section-number= profile.sections.educationWriting.number
          h2#writing-title= profile.sections.educationWriting.title
        .education-writing
          .education-block
            h3= profile.sections.educationWriting.educationTitle
            p.education-block__school= profile.sections.educationWriting.education.school
            p= profile.sections.educationWriting.education.degree
            time= profile.sections.educationWriting.education.dates
          .writing-block
            h3= profile.sections.educationWriting.writingTitle
            ol.writing-list
              each post in context.featuredPosts
                li
                  a(href=url_for(`/${post.path}`))= post.title
                  time(datetime=post.date)= post.date
            a.archive-link(href=url_for('/archives/'))= `${profile.sections.educationWriting.archivePrefix} ${context.postCount} ${profile.sections.educationWriting.archiveSuffix}`
```

- [ ] **Step 7: Add entry layouts, footer, and temporary content fallbacks**

Create `themes/resume-paper/layout/index.pug` and `themes/resume-paper/layout/resume.pug` with the same complete content:

```pug
extends layout

block content
  != partial('_partials/resume-home', {}, { cache: false })
```

Create `themes/resume-paper/layout/_partials/footer.pug`:

```pug
- const resumePage = is_resume_page(page.path)
- const feedLabel = resumePage ? resume_context(page).profile.footer.feed : 'Atom 订阅'
footer.site-footer
  p © 2026 Peng Zihao
  a(href=url_for('/atom.xml'))= feedLabel
```

Create the temporary `post.pug` and `page.pug` fallbacks:

```pug
extends layout

block content
  main#main-content.article-shell
    article.post-content!= page.content
```

Create the temporary `archive.pug`:

```pug
extends layout

block content
  main#main-content.listing-shell
    h1 文章归档
    ul
      each post in page.posts.data
        li: a(href=url_for(post.path))= post.title
```

Create `tag.pug` and `category.pug`:

```pug
extends archive
```

- [ ] **Step 8: Clean-build and run the homepage contract**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: the build succeeds; all three homepage tests pass; `public/page/2/` is absent.

- [ ] **Step 9: Commit the semantic resume output**

```bash
cd /Users/pengzihao/blog
git add themes/resume-paper/layout tests/support/site.cjs tests/generated-home.test.cjs
git commit -m "feat: render bilingual resume homepages"
```

---

### Task 5: Apply the Approved Paper Visual System and Accessible Interactions

**Files:**
- Create: `/Users/pengzihao/blog/tests/theme-css.test.cjs`
- Create: `/Users/pengzihao/blog/tests/site-js.test.cjs`
- Create: `/Users/pengzihao/blog/themes/resume-paper/source/css/main.css`
- Create: `/Users/pengzihao/blog/themes/resume-paper/source/js/site.js`

**Interfaces:**
- Consumes: Semantic classes and IDs from Task 4, Hexo `<figure class="highlight language-name">` markup, `<html lang>`.
- Produces: CSS token/breakpoint contract; CommonJS/browser API `{ setMenuState, handleMenuEscape, languageForClasses, copyLabelForLocale, init }`; 44px contact targets; menu Escape/focus behavior; visible code-language labels; dynamic code-copy buttons.

- [ ] **Step 1: Write failing CSS and JavaScript contracts**

Create `tests/theme-css.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cssPath = path.resolve(__dirname, '../themes/resume-paper/source/css/main.css');

test('theme CSS implements the approved token and responsive contract', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  for (const color of ['#F7F4ED', '#20201D', '#68655F', '#7A2026', '#AAA49A', '#1D5FD1']) {
    assert.ok(css.includes(color), color);
  }
  assert.match(css, /@media \(min-width: 1200px\)/u);
  assert.match(css, /@media \(min-width: 768px\) and \(max-width: 1199px\)/u);
  assert.match(css, /@media \(max-width: 767px\)/u);
  assert.match(css, /:focus-visible/u);
  assert.match(css, /prefers-reduced-motion/u);
  assert.match(css, /min-height:\s*44px/u);
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com|@import\s+url\(https?:/iu);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|box-shadow|background-image/iu);
});
```

Create `tests/site-js.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../themes/resume-paper/source/js/site');

function fakeElement() {
  const attributes = new Map();
  return {
    hidden: false,
    focused: false,
    setAttribute(name, value) { attributes.set(name, String(value)); },
    getAttribute(name) { return attributes.get(name); },
    focus() { this.focused = true; }
  };
}

test('menu state exposes ARIA, visibility, and Escape focus return', () => {
  const button = fakeElement();
  const menu = fakeElement();
  api.setMenuState(button, menu, true);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.hidden, false);
  api.handleMenuEscape({ key: 'Escape' }, button, menu);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(menu.hidden, true);
  assert.equal(button.focused, true);
});

test('copy labels are localized without adding language redirects', () => {
  assert.equal(api.languageForClasses(['highlight', 'java']), 'java');
  assert.equal(api.languageForClasses(['highlight']), '');
  assert.equal(api.copyLabelForLocale('en', false), 'Copy');
  assert.equal(api.copyLabelForLocale('en', true), 'Copied');
  assert.equal(api.copyLabelForLocale('zh-CN', false), '复制');
  assert.equal(api.copyLabelForLocale('zh-CN', true), '已复制');
  const source = fs.readFileSync(path.resolve(__dirname, '../themes/resume-paper/source/js/site.js'), 'utf8');
  assert.doesNotMatch(source, /navigator\.language|location\.replace|localStorage|meta refresh/iu);
});
```

- [ ] **Step 2: Run tests and verify both assets are missing**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/theme-css.test.cjs tests/site-js.test.cjs`

Expected: FAIL with missing `main.css` and `site.js`.

- [ ] **Step 3: Implement the complete paper CSS**

Create the asset directories:

```bash
mkdir -p /Users/pengzihao/blog/themes/resume-paper/source/css /Users/pengzihao/blog/themes/resume-paper/source/js
```

Create `themes/resume-paper/source/css/main.css`:

```css
:root {
  --paper: #F7F4ED;
  --ink: #20201D;
  --muted: #68655F;
  --burgundy: #7A2026;
  --rule: #AAA49A;
  --focus: #1D5FD1;
  --serif: "Songti SC", "STSong", Georgia, serif;
  --sans: "Helvetica Neue", "PingFang SC", Arial, sans-serif;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-18: 72px;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.65;
  text-rendering: optimizeLegibility;
}
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration-color: var(--burgundy); text-underline-offset: 0.2em; }
a:hover { color: var(--burgundy); }
button, a { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.skip-link {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 20;
  padding: var(--space-2) var(--space-4);
  color: white;
  background: var(--focus);
  transform: translateY(-180%);
}
.skip-link:focus { transform: translateY(0); }

.site-header, .site-footer { border-color: var(--rule); border-style: solid; }
.site-header { border-width: 0 0 1px; }
.site-header__inner, .site-footer, .resume-shell, .article-shell, .listing-shell {
  width: min(100% - 96px, 1360px);
  margin-inline: auto;
}
.site-header__inner {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: var(--space-8);
}
.site-brand {
  flex: 0 0 auto;
  font-family: var(--serif);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
}
.primary-nav { margin-left: auto; }
.primary-nav__list {
  display: flex;
  align-items: center;
  gap: clamp(16px, 2vw, 32px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.primary-nav a, .language-switch a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  text-decoration: none;
}
.language-switch { display: flex; align-items: center; gap: var(--space-2); white-space: nowrap; }
.language-switch [aria-current="page"] { color: var(--burgundy); font-weight: 700; }
.menu-toggle { display: none; }

.resume-shell { padding-block: var(--space-18); }
.identity-header { max-width: 960px; padding-bottom: var(--space-18); }
.identity-header__eyebrow, .post-kicker {
  margin: 0 0 var(--space-4);
  color: var(--burgundy);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h1, h2, h3 { font-family: var(--serif); line-height: 1.15; }
.identity-header h1 { margin: 0; font-size: clamp(3.2rem, 7vw, 7.5rem); letter-spacing: -0.045em; }
.identity-header__statement { max-width: 66ch; margin: var(--space-6) 0 0; font-size: clamp(1.15rem, 2vw, 1.55rem); }
.identity-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-8); }
.action-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-4);
  border: 1px solid var(--ink);
  text-decoration: none;
}
.action-link:hover { color: var(--paper); background: var(--burgundy); border-color: var(--burgundy); }

.resume-grid { display: grid; column-gap: clamp(48px, 7vw, 112px); row-gap: 0; }
.identity-header { grid-area: identity; }
.resume-main { grid-area: main; }
.metadata-rail { grid-area: metadata; }
.numbered-section { padding-block: var(--space-12); border-top: 1px solid var(--rule); }
.section-heading { display: grid; grid-template-columns: 48px 1fr; align-items: baseline; gap: var(--space-4); margin-bottom: var(--space-8); }
.section-heading h2 { margin: 0; font-size: clamp(1.8rem, 3vw, 2.7rem); }
.section-number { color: var(--burgundy); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; }
.section-lead { max-width: 68ch; margin: 0; font-size: 1.1rem; }
.experience-entry__heading { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-6); }
.experience-entry h3, .education-writing h3 { margin: 0; font-size: 1.25rem; }
.experience-entry time, .education-block time, .writing-list time { color: var(--muted); white-space: nowrap; }
.experience-entry ul { max-width: 72ch; margin: var(--space-6) 0 0; padding-left: 1.25rem; }
.experience-entry li + li { margin-top: var(--space-3); }
.impact-list, .writing-list { margin: 0; padding: 0; list-style: none; }
.impact-list li { display: grid; grid-template-columns: minmax(180px, 0.35fr) minmax(0, 1fr); gap: var(--space-8); padding-block: var(--space-6); border-top: 1px solid var(--rule); }
.impact-list li:last-child { border-bottom: 1px solid var(--rule); }
.impact-list h3, .impact-list p { margin: 0; }
.education-writing { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--space-12); }
.education-block p { margin: var(--space-2) 0; }
.education-block__school { font-weight: 700; }
.writing-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-4); padding-block: var(--space-3); border-bottom: 1px solid var(--rule); }
.archive-link { display: inline-block; margin-top: var(--space-6); }
.metadata-rail { align-self: start; color: var(--muted); }
.metadata-rail blockquote { margin: 0 0 var(--space-12); padding-left: var(--space-4); border-left: 2px solid var(--burgundy); font-family: var(--serif); font-size: 1.1rem; }
.metadata-rail dl, .metadata-rail dd { margin: 0; }
.metadata-rail dl > div { padding-block: var(--space-4); border-top: 1px solid var(--rule); }
.metadata-rail dt { font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; }
.metadata-rail dd { color: var(--ink); font-family: var(--serif); font-size: 1.2rem; }

.article-shell, .listing-shell { padding-block: var(--space-18); }
.article-layout { display: grid; gap: var(--space-12); }
.post { min-width: 0; }
.post-header { margin-bottom: var(--space-12); }
.post-header h1, .listing-shell h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 4.5rem); }
.post-meta { color: var(--muted); }
.post-content { max-width: 760px; overflow-wrap: anywhere; }
.post-content h2, .post-content h3 { margin-top: 2.2em; scroll-margin-top: 24px; }
.post-content p, .post-content li { max-width: 70ch; }
.post-content table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; }
.post-content th, .post-content td { padding: var(--space-2) var(--space-3); border: 1px solid var(--rule); }
figure.highlight, .post-content pre {
  position: relative;
  max-width: 100%;
  overflow-x: auto;
  color: #F7F4ED;
  background: #20201D;
  font-size: 0.9rem;
}
figure.highlight { margin: var(--space-8) 0; }
figure.highlight table { width: max-content; min-width: 100%; }
figure.highlight td { border: 0; }
figure.highlight .gutter { color: var(--rule); border-right: 1px solid var(--muted); user-select: none; }
figure.highlight pre, .post-content pre { margin: 0; padding: var(--space-4); }
.code-language { position: absolute; top: var(--space-2); left: var(--space-3); z-index: 2; color: var(--rule); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; }
.copy-code { position: absolute; top: var(--space-2); right: var(--space-2); z-index: 2; min-height: 36px; color: var(--paper); background: var(--ink); border: 1px solid var(--rule); }
.post-toc { border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding-block: var(--space-3); }
.post-toc summary { cursor: pointer; font-weight: 700; }
.post-tags, .post-navigation { display: flex; flex-wrap: wrap; gap: var(--space-4); margin-top: var(--space-12); }
.article-list { margin: var(--space-12) 0 0; padding: 0; list-style: none; }
.article-list li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--space-6); padding-block: var(--space-4); border-top: 1px solid var(--rule); }
.tag-list { display: flex; flex-wrap: wrap; gap: var(--space-3); padding: 0; list-style: none; }
.tag-list a { display: inline-flex; min-height: 44px; align-items: center; border-bottom: 1px solid var(--rule); }
.site-footer { min-height: 96px; border-width: 1px 0 0; display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); color: var(--muted); }

@media (min-width: 1200px) {
  .resume-grid {
    grid-template-columns: minmax(0, 920px) minmax(240px, 300px);
    grid-template-areas:
      "identity metadata"
      "main metadata";
    justify-content: space-between;
  }
  .article-layout.has-toc { grid-template-columns: minmax(0, 760px) minmax(220px, 280px); justify-content: center; }
  .article-layout.has-toc .post-toc { position: sticky; top: 24px; align-self: start; }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .site-header__inner, .site-footer, .resume-shell, .article-shell, .listing-shell { width: min(100% - 64px, 1040px); }
  .resume-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "identity"
      "metadata"
      "main";
  }
  .metadata-rail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.5fr); gap: var(--space-8); }
  .metadata-rail blockquote { margin-bottom: 0; }
}

@media (max-width: 767px) {
  body { font-size: 15px; }
  .site-header__inner, .site-footer, .resume-shell, .article-shell, .listing-shell { width: calc(100% - 40px); }
  .site-header__inner { min-height: 68px; gap: var(--space-3); }
  .site-brand { max-width: 48vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .primary-nav { order: 3; margin-left: 0; }
  .js .menu-toggle { width: 44px; height: 44px; display: grid; place-content: center; gap: 5px; padding: 0; color: var(--ink); background: transparent; border: 1px solid var(--rule); }
  .menu-toggle__line { width: 18px; border-top: 1px solid currentColor; }
  .primary-nav__list { flex-wrap: wrap; }
  .js .primary-nav__list { position: absolute; top: 68px; right: 20px; left: 20px; z-index: 10; display: grid; gap: 0; padding: var(--space-3) var(--space-4); background: var(--paper); border: 1px solid var(--rule); }
  .js .primary-nav__list[hidden] { display: none; }
  .primary-nav--article .primary-nav__list { position: static; display: flex; padding: 0; border: 0; }
  .language-switch { margin-left: auto; }
  .resume-shell { padding-block: var(--space-12); }
  .identity-header { padding-bottom: var(--space-12); }
  .identity-header h1 { font-size: clamp(2.7rem, 17vw, 5rem); overflow-wrap: anywhere; }
  .resume-grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "identity"
      "metadata"
      "main";
    row-gap: var(--space-8);
  }
  .numbered-section { padding-block: var(--space-8); }
  .section-heading { grid-template-columns: 36px 1fr; margin-bottom: var(--space-6); }
  .experience-entry__heading, .impact-list li, .education-writing, .writing-list li { display: grid; grid-template-columns: 1fr; gap: var(--space-2); }
  .experience-entry time, .writing-list time { white-space: normal; }
  .article-shell, .listing-shell { padding-block: var(--space-12); }
  .article-list li { grid-template-columns: 1fr; gap: var(--space-2); }
  .site-footer { min-height: 120px; align-items: flex-start; justify-content: center; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 4: Implement the dependency-free menu and copy API**

Create `themes/resume-paper/source/js/site.js`:

```js
(function attach(root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) {
    root.ResumePaper = api;
    if (root.document) {
      root.document.documentElement.classList.add('js');
      root.addEventListener('DOMContentLoaded', () => api.init(root.document, root));
    }
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createApi() {
  'use strict';

  function setMenuState(button, menu, open) {
    button.setAttribute('aria-expanded', String(Boolean(open)));
    menu.hidden = !open;
  }

  function handleMenuEscape(event, button, menu) {
    if (event.key !== 'Escape' || menu.hidden) return;
    setMenuState(button, menu, false);
    button.focus();
  }

  function languageForClasses(classes) {
    return Array.from(classes || []).find((name) => name !== 'highlight') || '';
  }

  function copyLabelForLocale(locale, copied) {
    const chinese = String(locale).toLowerCase().startsWith('zh');
    if (chinese) return copied ? '已复制' : '复制';
    return copied ? 'Copied' : 'Copy';
  }

  async function copyText(text, documentRef, navigatorRef) {
    if (navigatorRef.clipboard && navigatorRef.clipboard.writeText) {
      await navigatorRef.clipboard.writeText(text);
      return;
    }
    const field = documentRef.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    documentRef.body.appendChild(field);
    field.select();
    documentRef.execCommand('copy');
    field.remove();
  }

  function initMenu(documentRef, windowRef) {
    const button = documentRef.querySelector('.menu-toggle');
    const menu = documentRef.getElementById('primary-menu');
    if (!button || !menu) return;
    const media = windowRef.matchMedia('(max-width: 767px)');
    const sync = () => setMenuState(button, menu, media.matches ? false : true);
    sync();
    button.addEventListener('click', () => setMenuState(button, menu, button.getAttribute('aria-expanded') !== 'true'));
    documentRef.addEventListener('keydown', (event) => handleMenuEscape(event, button, menu));
    menu.addEventListener('click', (event) => {
      if (media.matches && event.target.closest('a')) setMenuState(button, menu, false);
    });
    if (media.addEventListener) media.addEventListener('change', sync);
    else media.addListener(sync);
  }

  function initCodeCopy(documentRef, windowRef) {
    const locale = documentRef.documentElement.lang || 'zh-CN';
    for (const figure of documentRef.querySelectorAll('figure.highlight')) {
      const code = figure.querySelector('.code pre') || figure.querySelector('pre');
      if (!code || figure.querySelector('.copy-code')) continue;
      const language = languageForClasses(figure.classList);
      if (language) {
        const label = documentRef.createElement('span');
        label.className = 'code-language';
        label.textContent = language;
        figure.prepend(label);
      }
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = copyLabelForLocale(locale, false);
      button.addEventListener('click', async () => {
        await copyText(code.textContent, documentRef, windowRef.navigator);
        button.textContent = copyLabelForLocale(locale, true);
        windowRef.setTimeout(() => { button.textContent = copyLabelForLocale(locale, false); }, 1200);
      });
      figure.prepend(button);
    }
  }

  function init(documentRef, windowRef) {
    initMenu(documentRef, windowRef);
    initCodeCopy(documentRef, windowRef);
  }

  return { setMenuState, handleMenuEscape, languageForClasses, copyLabelForLocale, init };
}));
```

- [ ] **Step 5: Run unit, syntax, and generated-home checks**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 node --check themes/resume-paper/source/js/site.js
fnm exec --using=22 node --test tests/theme-css.test.cjs tests/site-js.test.cjs
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: all tests pass; `public/css/main.css` and `public/js/site.js` exist.

- [ ] **Step 6: Commit the visual system and interactions**

```bash
cd /Users/pengzihao/blog
git add themes/resume-paper/source tests/theme-css.test.cjs tests/site-js.test.cjs
git commit -m "feat: apply resume paper visual system"
```

---

### Task 6: Restore the Archive, Taxonomy, and Long-Form Article Experience

**Files:**
- Create: `/Users/pengzihao/blog/tests/generated-site.test.cjs`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/post-list.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/post-navigation.pug`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/layout/post.pug`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/layout/archive.pug`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/layout/tag.pug`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/layout/category.pug`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/layout/page.pug`

**Interfaces:**
- Consumes: Frozen `legacy-post-routes.json`, Hexo Query `.data`, `url_for(post.path)`, built-in `toc(page.content)`, and the Task 5 site JavaScript.
- Produces: 67 unchanged post routes; chronological archives; tag/category lists; post body, TOC, tags, previous/next links, responsive images, syntax-highlight markup, and code-copy initialization.

- [ ] **Step 1: Write the failing full-site output contract**

Create `tests/generated-site.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { root, outputRoot, readPublic, assertRouteExists, extractHrefs } = require('./support/site');

const legacyRoutes = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/legacy-post-routes.json'), 'utf8'));

test('every frozen legacy post route is generated after a clean build', () => {
  assert.equal(legacyRoutes.length, 67);
  for (const route of legacyRoutes) assertRouteExists(assert, route);

  const generatedContent = JSON.parse(fs.readFileSync(path.join(outputRoot, 'content.json'), 'utf8'));
  const posts = Array.isArray(generatedContent) ? generatedContent : generatedContent.posts;
  const generatedRoutes = new Set(posts.map((post) => post.path));
  for (const route of legacyRoutes) assert.ok(generatedRoutes.has(route), route);
});

test('representative long article keeps code, TOC, images, tags, and navigation', () => {
  const route = '/2023/08/26/Spring-IOC-SourceCodeAnalysis/';
  const html = readPublic(route);

  assert.match(html, /<html[^>]+lang="zh-CN"/u);
  assert.match(html, /<article[^>]+class="post"/u);
  assert.match(html, /class="post-content"/u);
  assert.match(html, /<figure class="highlight[^"]*java/u);
  assert.match(html, /class="gutter"|class="code"/u);
  assert.match(html, /class="post-toc"/u);
  assert.match(html, /href="\/tags\/Spring\/"/u);
  assert.match(html, /class="post-navigation"/u);
  assert.match(html, /<img[^>]+alt="[^"]+"/u);
  assert.match(html, /src="\/js\/site\.js"/u);
  assert.doesNotMatch(html, /class="language-switch"/u);
  assert.doesNotMatch(html, /reward|addtoany|sharejs|canvas-nest|ribbon|leancloud-visitors-count/iu);
});

test('archives and tag pages use generated Hexo paths instead of guessed slugs', () => {
  assertRouteExists(assert, '/archives/');
  assertRouteExists(assert, '/tags/');
  assertRouteExists(assert, '/tags/Java/');
  assertRouteExists(assert, '/tags/C-笔记/');
  const archiveHrefs = extractHrefs(readPublic('/archives/'));
  const tagHrefs = extractHrefs(readPublic('/tags/'));

  assert.ok(archiveHrefs.includes('/2024/03/10/Java-Deque/'));
  assert.ok(tagHrefs.includes('/tags/Java/'));
  assert.ok(tagHrefs.includes('/tags/C-笔记/') || tagHrefs.includes('/tags/C-%E7%AC%94%E8%AE%B0/'));
});
```

- [ ] **Step 2: Run the test against the temporary fallbacks**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-site.test.cjs
```

Expected: the 67-route assertion passes, while the article TOC/tags/navigation and tag-index assertions fail.

- [ ] **Step 3: Implement the shared chronological post list**

Create `themes/resume-paper/layout/_partials/post-list.pug`:

```pug
- const postList = Array.isArray(posts) ? posts : posts.data
ol.article-list
  each post in postList
    li
      time(datetime=date_xml(post.date))= date(post.date, 'YYYY-MM-DD')
      a(href=url_for(post.path))= post.title
```

Replace `themes/resume-paper/layout/archive.pug` with:

```pug
extends layout

block content
  main#main-content.listing-shell
    p.identity-header__eyebrow Writing / 文章
    h1 文章归档
    != partial('_partials/post-list', { posts: page.posts }, { cache: false })
    if page.total > 1
      nav.pagination(aria-label='归档分页')!= paginator({ prev_text: '上一页', next_text: '下一页' })
```

Replace `themes/resume-paper/layout/tag.pug` with:

```pug
extends layout

block content
  main#main-content.listing-shell
    p.identity-header__eyebrow Tag / 标签
    h1= page.tag
    != partial('_partials/post-list', { posts: page.posts }, { cache: false })
    if page.total > 1
      nav.pagination(aria-label='标签分页')!= paginator({ prev_text: '上一页', next_text: '下一页' })
```

Replace `themes/resume-paper/layout/category.pug` with:

```pug
extends layout

block content
  main#main-content.listing-shell
    p.identity-header__eyebrow Category / 分类
    h1= page.category
    != partial('_partials/post-list', { posts: page.posts }, { cache: false })
    if page.total > 1
      nav.pagination(aria-label='分类分页')!= paginator({ prev_text: '上一页', next_text: '下一页' })
```

- [ ] **Step 4: Implement the tag index and normal standalone page layout**

Replace `themes/resume-paper/layout/page.pug` with:

```pug
extends layout

block content
  if page.type === 'tags'
    main#main-content.listing-shell
      p.identity-header__eyebrow Taxonomy / 分类索引
      h1 标签
      ul.tag-list
        each tag in site.tags.data
          li
            a(href=url_for(tag.path))= `${tag.name} · ${tag.length}`
  else
    main#main-content.article-shell
      article.post
        header.post-header
          h1= page.title
        .post-content!= page.content
```

- [ ] **Step 5: Implement article navigation**

Create `themes/resume-paper/layout/_partials/post-navigation.pug`:

```pug
if page.prev || page.next
  nav.post-navigation(aria-label='文章翻页')
    if page.prev
      a.post-navigation__previous(href=url_for(page.prev.path))
        span 上一篇
        strong= page.prev.title
    if page.next
      a.post-navigation__next(href=url_for(page.next.path))
        span 下一篇
        strong= page.next.title
```

- [ ] **Step 6: Replace the article fallback with the full long-form layout**

Replace `themes/resume-paper/layout/post.pug` with:

```pug
extends layout

block content
  - const headingCount = (page.content.match(/<h[2-4]\b/gu) || []).length
  - const tocHtml = headingCount >= theme.toc.minHeadings ? toc(page.content, { list_number: true }) : ''
  main#main-content.article-shell
    .article-layout(class=tocHtml ? 'has-toc' : '')
      article.post
        header.post-header
          p.post-kicker Technical Writing / 技术文章
          h1= page.title
          p.post-meta
            time(datetime=date_xml(page.date))= date(page.date, 'YYYY-MM-DD')
        .post-content!= page.content
        if page.tags && page.tags.length
          nav.post-tags(aria-label='文章标签')
            each tag in page.tags.data
              a(href=url_for(tag.path))= `#${tag.name}`
        != partial('_partials/post-navigation', {}, { cache: false })
        if page.comments !== false && theme.comments && theme.comments.enable
          != partial('_partials/comments', {}, { cache: false })
      if tocHtml
        aside
          details.post-toc(open)
            summary 目录
            != tocHtml
```

- [ ] **Step 7: Run the clean-build regression suite**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/source-baseline.test.cjs tests/generated-home.test.cjs tests/generated-site.test.cjs
```

Expected: every test passes, all 67 paths exist, long-form code is unescaped, and the tag index links to both ASCII and Chinese-slug tag pages.

- [ ] **Step 8: Commit the article and archive experience**

```bash
cd /Users/pengzihao/blog
git add themes/resume-paper/layout tests/generated-site.test.cjs
git commit -m "feat: preserve Hexo article experience"
```

---

### Task 7: Integrate PDF, Post-Only Comments, Feed, Sitemap, and Domain Files

**Files:**
- Create: `/Users/pengzihao/blog/tests/generated-integrations.test.cjs`
- Create: `/Users/pengzihao/blog/scripts/migrate-valine-config.cjs`
- Create: `/Users/pengzihao/blog/source/_data/comments.json`
- Create: `/Users/pengzihao/blog/source/files/peng-zihao-resume.pdf`
- Create: `/Users/pengzihao/blog/themes/resume-paper/layout/_partials/comments.pug`
- Create: `/Users/pengzihao/blog/themes/resume-paper/source/js/comments.js`
- Modify: `/Users/pengzihao/blog/themes/resume-paper/_config.yml:1-7`
- Modify: `/Users/pengzihao/blog/package.json:5-14`

**Interfaces:**
- Consumes: Existing `themes/butterfly/_config.yml` `valine.*` values and `CDN.valine`, supplied `/Users/pengzihao/Downloads/彭子豪.pdf`, `source/CNAME`, existing feed/sitemap generators.
- Produces: `site.data.comments = { provider, cdn, options }`; `window.resumePaperComments` only on posts; `/files/peng-zihao-resume.pdf`; `atom.xml`, `sitemap.xml`, `CNAME` under the custom domain.

- [ ] **Step 1: Write the failing integration contract**

Create `tests/generated-integrations.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { root, outputRoot, readPublic, publicFileForRoute } = require('./support/site');

test('PDF, CNAME, feed, and sitemap survive a clean build', () => {
  const pdf = fs.readFileSync(publicFileForRoute('/files/peng-zihao-resume.pdf'));
  assert.ok(pdf.length > 10_000);
  assert.equal(pdf.subarray(0, 4).toString('ascii'), '%PDF');
  assert.equal(fs.readFileSync(path.join(outputRoot, 'CNAME'), 'utf8').trim(), 'xiaobazeo.com');
  for (const file of ['atom.xml', 'sitemap.xml']) {
    const output = fs.readFileSync(path.join(outputRoot, file), 'utf8');
    assert.match(output, /https:\/\/xiaobazeo\.com/u);
    assert.doesNotMatch(output, /http:\/\/xiaobazeo\.github\.io/u);
  }
  assert.equal(fs.existsSync(path.join(outputRoot, 'search.xml')), true);
});

test('Valine configuration is non-empty but serialized on post pages only', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'source/_data/comments.json'), 'utf8'));
  const englishHome = readPublic('/');
  const chineseHome = readPublic('/zh-cn/');
  const article = readPublic('/2024/03/10/Java-Deque/');

  assert.equal(config.provider, 'valine');
  assert.ok(config.cdn.startsWith('https://'));
  assert.ok(config.options.appId.length > 10);
  assert.ok(config.options.appKey.length > 10);
  for (const home of [englishHome, chineseHome]) {
    assert.doesNotMatch(home, /vcomments|resumePaperComments|Valine\.min\.js/iu);
    assert.equal(home.includes(config.options.appId), false);
    assert.equal(home.includes(config.options.appKey), false);
  }
  assert.match(article, /id="vcomments"/u);
  assert.match(article, /window\.resumePaperComments/u);
  assert.match(article, /src="\/js\/comments\.js"/u);
});

test('resume pages expose canonical and complete language alternates', () => {
  for (const [route, canonical] of [['/', 'https://xiaobazeo.com/'], ['/zh-cn/', 'https://xiaobazeo.com/zh-cn/']]) {
    const html = readPublic(route);
    assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
    assert.ok(html.includes('hreflang="en" href="https://xiaobazeo.com/"'));
    assert.ok(html.includes('hreflang="zh-CN" href="https://xiaobazeo.com/zh-cn/"'));
    assert.ok(html.includes('hreflang="x-default" href="https://xiaobazeo.com/"'));
  }
});
```

- [ ] **Step 2: Run the test and confirm missing PDF/comments fail**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-integrations.test.cjs
```

Expected: FAIL because the PDF and `source/_data/comments.json` do not yet exist.

- [ ] **Step 3: Copy the supplied PDF byte-for-byte**

Run:

```bash
mkdir -p /Users/pengzihao/blog/source/files
cp /Users/pengzihao/Downloads/彭子豪.pdf /Users/pengzihao/blog/source/files/peng-zihao-resume.pdf
shasum -a 256 /Users/pengzihao/Downloads/彭子豪.pdf /Users/pengzihao/blog/source/files/peng-zihao-resume.pdf
```

Expected: both SHA-256 values are identical. Do not extract or copy the PDF's contact data into homepage content.

- [ ] **Step 4: Implement deterministic Valine configuration migration**

Create `scripts/migrate-valine-config.cjs`:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const oldConfigPath = path.join(root, 'themes/butterfly/_config.yml');
const outputPath = path.join(root, 'source/_data/comments.json');
const source = fs.readFileSync(oldConfigPath, 'utf8').replace(/\r\n?/gu, '\n');
const start = source.indexOf('\nvaline:\n');
const end = source.indexOf('\n# waline', start);
if (start < 0 || end < 0) throw new Error('Could not locate the existing valine block');
const block = source.slice(start, end);

function readScalar(key) {
  const match = block.match(new RegExp(`^  ${key}:\\s*(.*)$`, 'm'));
  if (!match) throw new Error(`Missing existing valine key: ${key}`);
  const raw = match[1].replace(/\s+#.*$/u, '').trim().replace(/^['"]|['"]$/gu, '');
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (/^\d+$/u.test(raw)) return Number(raw);
  return raw;
}

const cdnMatch = source.match(/^  valine:\s+(https:\/\/\S+)$/m);
if (!cdnMatch) throw new Error('Could not locate the existing Valine CDN');

const migrated = {
  provider: 'valine',
  cdn: cdnMatch[1],
  options: {
    appId: readScalar('appId'),
    appKey: readScalar('appKey'),
    pageSize: readScalar('pageSize'),
    avatar: readScalar('avatar'),
    lang: readScalar('lang'),
    placeholder: readScalar('placeholder'),
    meta: String(readScalar('guest_info')).split(','),
    recordIP: readScalar('recordIP'),
    enableQQ: readScalar('enableQQ'),
    requiredFields: String(readScalar('requiredFields')).split(',')
  }
};

if (!migrated.options.appId || !migrated.options.appKey) {
  throw new Error('Existing Valine client configuration is empty');
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(migrated, null, 2)}\n`);
console.log('Migrated existing Valine client configuration');
```

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node scripts/migrate-valine-config.cjs`

Expected: the success message appears without printing either client value.

- [ ] **Step 5: Add the post-only comment partial and loader**

Change `themes/resume-paper/_config.yml` to:

```yaml
favicon: /img/favicon.png
toc:
  minHeadings: 3
comments:
  enable: true
```

Create `themes/resume-paper/layout/_partials/comments.pug`:

```pug
- const comments = site.data.comments
if comments && comments.provider === 'valine'
  section.post-comments(aria-labelledby='comments-title')
    h2#comments-title 评论
    #vcomments
    script.
      window.resumePaperComments = !{JSON.stringify(comments)};
    script(src=url_for('/js/comments.js') defer)
```

Create `themes/resume-paper/source/js/comments.js`:

```js
(function loadPostComments(windowRef, documentRef) {
  'use strict';
  windowRef.addEventListener('DOMContentLoaded', () => {
    const target = documentRef.getElementById('vcomments');
    const config = windowRef.resumePaperComments;
    if (!target || !config || config.provider !== 'valine') return;

    const initialize = () => {
      if (typeof windowRef.Valine !== 'function') return;
      new windowRef.Valine(Object.assign({}, config.options, {
        el: '#vcomments',
        path: windowRef.location.pathname
      }));
    };

    if (typeof windowRef.Valine === 'function') {
      initialize();
      return;
    }
    const script = documentRef.createElement('script');
    script.src = config.cdn;
    script.async = true;
    script.addEventListener('load', initialize, { once: true });
    documentRef.head.appendChild(script);
  });
}(window, document));
```

- [ ] **Step 6: Expose the final test commands**

Replace the `scripts` object in `package.json` with:

```json
"scripts": {
  "build": "hexo generate",
  "clean": "hexo clean",
  "deploy": "hexo deploy",
  "server": "hexo server",
  "test:baseline": "node --test tests/source-baseline.test.cjs",
  "test:unit": "node --test tests/config.test.cjs tests/resume-data.test.cjs tests/resume-helpers.test.cjs tests/site-js.test.cjs tests/theme-css.test.cjs",
  "test:generated": "npm run clean && npm run build && node --test tests/generated-home.test.cjs tests/generated-site.test.cjs tests/generated-integrations.test.cjs",
  "test": "npm run test:baseline && npm run test:unit && npm run test:generated",
  "verify": "node --check themes/resume-paper/source/js/site.js && node --check themes/resume-paper/source/js/comments.js && npm test"
}
```

- [ ] **Step 7: Run the integration and privacy checks**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run verify
test "$(tr -d '\r\n' < public/CNAME)" = "xiaobazeo.com"
test ! -d public/page/2
! rg 'http://xiaobazeo.github.io' public
```

Expected: every automated test passes; the two resume pages contain no comment loader/config; the representative article contains the comment container and loader; PDF/feed/sitemap/CNAME exist.

- [ ] **Step 8: Commit the integrations without logging client values**

```bash
cd /Users/pengzihao/blog
git add package.json scripts/migrate-valine-config.cjs source/_data/comments.json source/files/peng-zihao-resume.pdf themes/resume-paper/_config.yml themes/resume-paper/layout/_partials/comments.pug themes/resume-paper/source/js/comments.js tests/generated-integrations.test.cjs
git commit -m "feat: preserve resume download and post comments"
```

---

### Task 8: Add Link Verification and Complete Browser/Visual QA

**Files:**
- Create: `/Users/pengzihao/blog/tests/site-verifier.test.cjs`
- Create: `/Users/pengzihao/blog/scripts/verify-generated-site.cjs`
- Create: `/Users/pengzihao/blog/docs/qa/2026-08-07-resume-paper.md`
- Modify: `/Users/pengzihao/blog/package.json:5-15`

**Interfaces:**
- Consumes: A clean generated output directory selected by `SITE_OUTPUT_DIR` or defaulting to `public/`; approved 1487 × 1058 mock; local browser server.
- Produces: `publicFileForUrl(publicRoot, rawUrl, pageUrl): string|null`, `verifySite(publicRoot, siteUrl): { htmlCount, targetCount }`, `npm run verify:links`, six responsive screenshots, and a committed QA record.

- [ ] **Step 1: Write the failing URL-mapper test**

Create `tests/site-verifier.test.cjs`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { publicFileForUrl } = require('../scripts/verify-generated-site');

const output = path.resolve('/tmp/resume-paper-public');

test('publicFileForUrl maps same-origin site URLs and ignores external protocols', () => {
  assert.equal(publicFileForUrl(output, '/#resume', 'https://xiaobazeo.com/'), path.join(output, 'index.html'));
  assert.equal(publicFileForUrl(output, '/zh-cn/', 'https://xiaobazeo.com/'), path.join(output, 'zh-cn/index.html'));
  assert.equal(publicFileForUrl(output, '/tags/C-%E7%AC%94%E8%AE%B0/', 'https://xiaobazeo.com/tags/'), path.join(output, 'tags/C-笔记/index.html'));
  assert.equal(publicFileForUrl(output, '/files/peng-zihao-resume.pdf', 'https://xiaobazeo.com/'), path.join(output, 'files/peng-zihao-resume.pdf'));
  assert.equal(publicFileForUrl(output, 'mailto:166918502@qq.com', 'https://xiaobazeo.com/'), null);
  assert.equal(publicFileForUrl(output, 'https://github.com/xiaobazeo', 'https://xiaobazeo.com/'), null);
});
```

- [ ] **Step 2: Run the test and verify the verifier module is missing**

Run: `cd /Users/pengzihao/blog && fnm exec --using=22 node --test tests/site-verifier.test.cjs`

Expected: FAIL with `MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement the generated-site verifier**

Create `scripts/verify-generated-site.cjs`:

```js
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function listFiles(directory, suffix) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(absolute, suffix));
    else if (absolute.endsWith(suffix)) files.push(absolute);
  }
  return files;
}

function pageUrlForFile(publicRoot, file, siteUrl) {
  const relative = path.relative(publicRoot, file).split(path.sep).join('/');
  const route = relative === 'index.html'
    ? '/'
    : `/${relative.replace(/index\.html$/u, '')}`;
  return new URL(route, siteUrl).toString();
}

function publicFileForUrl(publicRoot, rawUrl, pageUrl) {
  let target;
  try {
    target = new URL(rawUrl, pageUrl);
  } catch {
    return null;
  }
  const site = new URL(pageUrl);
  if (!['http:', 'https:'].includes(target.protocol) || target.origin !== site.origin) return null;
  let pathname = decodeURIComponent(target.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  else if (path.extname(pathname) === '') pathname += '/index.html';
  return path.join(publicRoot, pathname.replace(/^\/+/u, ''));
}

function verifySite(publicRoot, siteUrl = 'https://xiaobazeo.com') {
  const htmlFiles = listFiles(publicRoot, '.html');
  const missing = [];
  let targetCount = 0;

  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(htmlFile, 'utf8');
    const pageUrl = pageUrlForFile(publicRoot, htmlFile, siteUrl);
    const urls = [...html.matchAll(/\b(?:href|src)="([^"]+)"/gu)].map((match) => match[1]);
    for (const url of urls) {
      const target = publicFileForUrl(publicRoot, url, pageUrl);
      if (!target) continue;
      targetCount += 1;
      if (!fs.existsSync(target)) {
        missing.push(`${path.relative(publicRoot, htmlFile)} -> ${url}`);
      }
    }
  }

  if (missing.length) {
    throw new Error(`Missing ${missing.length} generated targets:\n${missing.join('\n')}`);
  }
  return { htmlCount: htmlFiles.length, targetCount };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const publicRoot = path.resolve(process.env.SITE_OUTPUT_DIR || path.join(root, 'public'));
  const result = verifySite(publicRoot);
  console.log(`Verified ${result.targetCount} local targets across ${result.htmlCount} HTML files`);
}

module.exports = { publicFileForUrl, verifySite };
```

- [ ] **Step 4: Add the link verifier to the full verification command**

Add this script to `package.json`:

```json
"verify:links": "node scripts/verify-generated-site.cjs"
```

Append the verifier unit test to `test:unit`:

```json
"test:unit": "node --test tests/config.test.cjs tests/resume-data.test.cjs tests/resume-helpers.test.cjs tests/site-js.test.cjs tests/theme-css.test.cjs tests/site-verifier.test.cjs"
```

Change the final `verify` script to:

```json
"verify": "node --check themes/resume-paper/source/js/site.js && node --check themes/resume-paper/source/js/comments.js && npm test && npm run verify:links"
```

- [ ] **Step 5: Run the complete automated gate**

Run:

```bash
cd /Users/pengzihao/blog
fnm exec --using=22 npm run verify
git diff --check
```

Expected: unit tests pass, a clean build passes all generated contracts, all 67 legacy routes exist, every same-origin HTML link/static reference resolves, and `git diff --check` emits no output.

- [ ] **Step 6: Start the local site and capture both languages at all approved viewports**

Create the screenshot directory:

```bash
mkdir -p /Users/pengzihao/blog/artifacts/qa
```

Run this in a persistent terminal session and keep the returned process running during Steps 6–8: `cd /Users/pengzihao/blog && fnm exec --using=22 npm run server -- --ip 127.0.0.1`

Use the in-app browser against `http://127.0.0.1:4000/` and save:

```text
/Users/pengzihao/blog/artifacts/qa/en-1487x1058.png
/Users/pengzihao/blog/artifacts/qa/zh-1487x1058.png
/Users/pengzihao/blog/artifacts/qa/en-834x1194.png
/Users/pengzihao/blog/artifacts/qa/zh-834x1194.png
/Users/pengzihao/blog/artifacts/qa/en-390x844.png
/Users/pengzihao/blog/artifacts/qa/zh-390x844.png
```

At each viewport verify `document.documentElement.scrollWidth === window.innerWidth`. At 1487 × 1058 compare the English page with `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/docs/superpowers/design-assets/2026-08-07-bilingual-resume-blog-home-en.png`: ivory ground, charcoal type, burgundy accents, serif section hierarchy, thin rules, wide main resume area, restrained metadata rail, and no card/hero treatment.

- [ ] **Step 7: Complete keyboard, no-JavaScript, article, and network checks**

Verify these exact browser behaviors:

```text
1. A fresh visit to / renders English even when browser language is Chinese.
2. EN / 中文 follows ordinary hrefs in both directions; opening those hrefs directly works with JavaScript disabled.
3. Tab order reaches skip link, primary navigation, language switch, GitHub, Email, PDF, featured writing, archive, and feed.
4. At 390 × 844 the menu button changes aria-expanded, Escape closes it, and focus returns to the button; EN / 中文 remains visible outside the menu.
5. No name, company, impact metric, Chinese text, or long article title clips or overlaps.
6. A post page renders its TOC, highlighted code, working Copy/Copied feedback, tags, previous/next links, and Valine.
7. Homepage network resources contain no Google font, Butterfly, Valine, ribbon, canvas, analytics, or legacy hero request.
8. Post network resources may load Valine only after the post page is opened.
```

If any check fails, first add the narrowest failing Node assertion that can represent the defect, then fix the implementation, rerun `npm run verify`, and repeat the affected browser check.

- [ ] **Step 8: Record the completed QA evidence**

Create the QA documentation directory:

```bash
mkdir -p /Users/pengzihao/blog/docs/qa
```

Create `docs/qa/2026-08-07-resume-paper.md` only after every check above passes:

```markdown
# Resume Paper QA — 2026-08-07

Build runtime: Node 22 / Hexo 5.4.2
Reference: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/docs/superpowers/design-assets/2026-08-07-bilingual-resume-blog-home-en.png` (1487 × 1058)

| Check | Result | Evidence |
|---|---|---|
| English default and static bilingual links | PASS | `/`, `/zh-cn/`, generated-home tests |
| 67 frozen post routes | PASS | `tests/fixtures/legacy-post-routes.json`, generated-site tests |
| Desktop visual direction | PASS | `artifacts/qa/en-1487x1058.png`, `artifacts/qa/zh-1487x1058.png` |
| Tablet layout | PASS | `artifacts/qa/en-834x1194.png`, `artifacts/qa/zh-834x1194.png` |
| Mobile layout/menu | PASS | `artifacts/qa/en-390x844.png`, `artifacts/qa/zh-390x844.png` |
| Keyboard and focus order | PASS | Manual keyboard pass at 390 × 844 and 1487 × 1058 |
| Article code/TOC/tags/navigation/comments | PASS | `/2023/08/26/Spring-IOC-SourceCodeAnalysis/` |
| Homepage privacy/network boundary | PASS | No Valine credentials/scripts, remote fonts, or Butterfly resources |
| PDF/feed/sitemap/CNAME | PASS | generated-integrations tests |
| Local links and static assets | PASS | `npm run verify:links` |
```

- [ ] **Step 9: Commit the verification tooling and QA record**

Stop the local Hexo server with `Ctrl-C` in its persistent terminal, then commit:

```bash
cd /Users/pengzihao/blog
git add package.json scripts/verify-generated-site.cjs tests/site-verifier.test.cjs docs/qa/2026-08-07-resume-paper.md
git commit -m "test: verify responsive resume site"
```

---

### Task 9: Stage Verified Static Output in the Deployment Repository

**Files:**
- Replace generated output under: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/`
- Preserve unchanged: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/.git/`
- Preserve unchanged: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/docs/`

**Interfaces:**
- Consumes: Clean source commit, `npm run verify`, generated `/Users/pengzihao/blog/public/`, and output tests parameterized by `SITE_OUTPUT_DIR`.
- Produces: A local deployment-repository commit containing only verified static output plus the already-tracked design/spec/plan documents; no remote push.

- [ ] **Step 1: Rebuild and verify from the committed source state**

Run:

```bash
cd /Users/pengzihao/blog
git status --short
fnm exec --using=22 npm ci
fnm exec --using=22 npm run verify
git status --short
```

Expected: both status checks are empty; `npm ci` uses the lockfile; verification performs a clean build and passes.

- [ ] **Step 2: Sync generated output while protecting Git and design documentation**

Run:

```bash
rsync -av --delete --exclude='.git/' --exclude='docs/' /Users/pengzihao/blog/public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Expected: stale Butterfly files and old `/page/2/` through `/page/8/` outputs are deleted; `.git/` and `docs/` remain untouched.

- [ ] **Step 3: Re-run output contracts against the deployment repository**

Run:

```bash
cd /Users/pengzihao/blog
SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io fnm exec --using=22 node --test tests/generated-home.test.cjs tests/generated-site.test.cjs tests/generated-integrations.test.cjs
SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io fnm exec --using=22 node scripts/verify-generated-site.cjs
```

Expected: every generated contract and every same-origin target passes against the deployment repository itself.

- [ ] **Step 4: Check the staged deployment boundary**

Run:

```bash
cd /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io
git diff --check
test -f docs/superpowers/specs/2026-08-07-bilingual-resume-blog-design.md
test -f docs/superpowers/plans/2026-08-07-bilingual-resume-paper-hexo-theme.md
test -f index.html
test -f zh-cn/index.html
test -f files/peng-zihao-resume.pdf
test ! -d page/2
test -z "$(git diff --name-only --diff-filter=D -- docs)"
! rg 'butterfly|canvas-nest|ribbon' index.html zh-cn/index.html css js
```

Expected: no whitespace errors, required docs and outputs exist, no protected documentation is deleted, no duplicate resume pagination exists, and resume assets contain no Butterfly runtime.

- [ ] **Step 5: Commit locally without publishing**

```bash
cd /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io
git add -A
git diff --cached --stat
git commit -m "Site updated: 2026-08-07 resume-paper"
git status --short --branch
```

Expected: the repository is clean and ahead of its remote. Stop here; do not run `git push`, `hexo deploy`, or any hosting action.

---

## Completion Gate

Implementation is complete only when all of the following are simultaneously true:

- `npm run verify` passes from a clean source checkout under Node 22.
- The immutable route fixture contains 67 unique paths and all 67 exist in both `public/` and the deployment repository.
- `/` is English, `/zh-cn/` is Chinese, the switch is plain links, and articles do not imply a translation.
- Both resume pages contain only approved copy and omit role, department, skills/technology-stack, location, availability, and employment-status content.
- Canonical, `hreflang`, PDF, CNAME, Atom feed, sitemap, archive, tags, code, TOC, copy behavior, post navigation, and post-only comments pass automated and browser checks.
- Six viewport screenshots and the QA record show no clipping, overlap, horizontal overflow, hidden language switch, or visual regression from the approved paper direction.
- The deployment repository has a clean local commit with `docs/` preserved and no remote push has occurred.
