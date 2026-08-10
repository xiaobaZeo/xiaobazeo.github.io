# Resume Content And Section Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update both resume homepages with the approved AI-focused Profile copy and Xiaomi experience heading, then split Education and Writing into independent numbered sections without changing navigation or any of the 67 blog routes.

**Architecture:** Keep the existing static, data-driven Hexo architecture. Change the bilingual JSON schema from one combined `educationWriting` object to sibling `education` and `writing` objects, render them as sibling semantic sections in the Pug homepage partial, and remove only the obsolete combined-grid CSS. Protect the change with data, generated-HTML, CSS, deterministic-build, link, and real-browser contracts before synchronizing verified static output.

**Tech Stack:** Hexo 5.4.2, Node.js 22.23.2 via `fnm`, Pug, plain CSS, JSON, Node's built-in test runner, the in-app browser, Git, and rsync.

## Global Constraints

- Work in the existing isolated source worktree `/Users/pengzihao/blog/.worktrees/resume-paper` on `feature/resume-paper`; confirm it is clean before editing.
- Run every Node/npm command through `fnm exec --using=22`; the project requires Node `>=22 <23`, while the machine's default Node is outside that range.
- English remains the default at `/`; Chinese remains at `/zh-cn/`.
- The English Profile body must be exactly: `Focused on applied AI and exploratory research, with an emphasis on AI agents, intelligent workflows, and reliable real-world adoption.`
- The Chinese Profile body must be exactly: `专注于 AI 应用落地与研究探索，关注 AI Agent、智能工作流及其在真实场景中的可靠应用。`
- The hero statements remain byte-for-byte unchanged in data and rendered output.
- The experience headings must be exactly `AI Infra Engineer (Xiaomi)` and `AI Infra 工程师（Xiaomi）`; no department or separate role row is added.
- Education is independent section `04`; Writing is independent section `05`.
- The top navigation is unchanged: it has no Education link and its existing Writing link still targets `#writing`.
- Preserve the same three featured posts, `Browse all 67 posts` / `查看全部 67 篇文章`, all 67 article routes, archive, tags, search, Atom feed, sitemap, PDF, favicon, and CNAME.
- Do not reintroduce comments, Valine, LeanCloud, credentials, Butterfly runtime, remote fonts, or new dependencies.
- Use strict RED → GREEN cycles; do not change implementation before the relevant failing contract is observed.
- Do not push, deploy, or contact a hosting provider. Stop after verified local commits and request explicit publishing authorization.

## File Map

### Source implementation

- `source/_data/resume.json` — single bilingual source of truth for Profile, Experience, Education, Writing, navigation, and selected posts.
- `themes/resume-paper/layout/_partials/resume-home.pug` — semantic homepage section structure and data bindings.
- `themes/resume-paper/source/css/main.css` — numbered-section layout and responsive writing-row styling.

### Source tests and evidence

- `tests/resume-data.test.cjs` — exact bilingual copy, schema, identity-preservation, navigation, and privacy contracts.
- `tests/generated-home.test.cjs` — generated English/Chinese structure, landmarks, ordering, copy, navigation, and selected-writing contracts.
- `tests/theme-css.test.cjs` — removal of the obsolete combined grid and preservation of responsive writing rows.
- `docs/qa/2026-08-10-resume-content-section-refinement.md` — recorded Node 22 and real-browser acceptance evidence.
- `artifacts/qa/refinement-*.png` — ignored local screenshots for the six required locale/viewport combinations.

### Deployment output

- `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/` — verified generated site synchronized from source `public/`, while `.git/`, `docs/`, and `.superpowers/` remain protected.

---

### Task 1: Update The Bilingual Data Contract And Render Five Semantic Sections

**Files:**

- Modify: `tests/resume-data.test.cjs:20-57`
- Modify: `tests/generated-home.test.cjs:13-145`
- Modify: `source/_data/resume.json:2-137`
- Modify: `themes/resume-paper/layout/_partials/resume-home.pug:52-70`

**Interfaces:**

- Consumes: `resume_context(page)` and its existing `{ profile, shared, featuredPosts, postCount }` result.
- Produces: `shared.sectionOrder = ['profile', 'experience', 'impact', 'education', 'writing']`; locale objects at `sections.education` and `sections.writing`; unique `section#education` and `section#writing` landmarks.
- Preserves: the existing `sections.experience.company` field name so no helper or registration interface changes are needed.

- [ ] **Step 1: Strengthen the resume-data test before changing JSON**

Rename the main data test to `resume data encodes the approved bilingual AI profile and five-section hierarchy without forbidden identity rows`. Replace its old hierarchy, company, and education assertions with this exact contract while retaining the existing statements, metrics, forbidden-key, forbidden-value, email, and featured-slug assertions:

```js
assert.deepEqual(data.shared.sectionOrder, ['profile', 'experience', 'impact', 'education', 'writing']);
assert.deepEqual(en.nav.map(({ id }) => id), ['resume', 'experience', 'projects', 'writing', 'contact']);
assert.deepEqual(zh.nav.map(({ id }) => id), ['resume', 'experience', 'projects', 'writing', 'contact']);

assert.equal(
  en.sections.profile.body,
  'Focused on applied AI and exploratory research, with an emphasis on AI agents, intelligent workflows, and reliable real-world adoption.'
);
assert.equal(
  zh.sections.profile.body,
  '专注于 AI 应用落地与研究探索，关注 AI Agent、智能工作流及其在真实场景中的可靠应用。'
);
assert.equal(en.sections.experience.company, 'AI Infra Engineer (Xiaomi)');
assert.equal(zh.sections.experience.company, 'AI Infra 工程师（Xiaomi）');
assert.equal(en.sections.experience.dates, 'Jul 2024 — Present');
assert.equal(zh.sections.experience.dates, '2024.07 — 至今');

assert.deepEqual(en.sections.education, {
  number: '04',
  title: 'Education',
  school: 'Hunan University of Technology',
  degree: 'B.S. in Computer Science and Technology',
  dates: 'Sep 2020 — Jun 2024'
});
assert.deepEqual(zh.sections.education, {
  number: '04',
  title: '教育经历',
  school: '湖南工业大学',
  degree: '计算机科学与技术 本科',
  dates: '2020.09 — 2024.06'
});
assert.deepEqual(en.sections.writing, {
  number: '05',
  title: 'Writing',
  archivePrefix: 'Browse all',
  archiveSuffix: 'posts'
});
assert.deepEqual(zh.sections.writing, {
  number: '05',
  title: '写作',
  archivePrefix: '查看全部',
  archiveSuffix: '篇文章'
});
assert.equal(Object.hasOwn(en.sections, 'educationWriting'), false);
assert.equal(Object.hasOwn(zh.sections, 'educationWriting'), false);
```

- [ ] **Step 2: Run the data contract and confirm RED**

Run:

```bash
fnm exec --using=22 node --test tests/resume-data.test.cjs
```

Expected: FAIL because `sectionOrder`, both Profile bodies, both experience headings, and the separate `education` / `writing` objects still have their old values or do not exist.

- [ ] **Step 3: Add generated-page contracts before changing the template**

Add `education` to the shared landmark inventory and change the common section-body count:

```js
const sharedIds = ['resume', 'profile', 'experience', 'projects', 'education', 'writing', 'contact'];

assert.equal(
  countMatches(html, /\bclass="section-body"/gu),
  5,
  'Expected every resume section to align its content column'
);
assert.equal(countMatches(html, /href="#education"/gu), 0, 'Education must not be added to the top navigation');
assert.equal(countMatches(html, /href="#writing"/gu), 1, 'Writing navigation must keep targeting #writing');
```

Add these helpers after `attributeValue`:

```js
function extractNumberedSection(html, id) {
  const match = html.match(new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`, 'u'));
  assert.ok(match, `Missing #${id} section`);
  return match[0];
}

function assertNumberedSection(html, { id, number, title }) {
  const section = extractNumberedSection(html, id);
  const openingTag = section.match(/^<section\b[^>]*>/u);
  assert.ok(openingTag, `Missing opening tag for #${id}`);
  assert.equal(attributeValue(openingTag[0], 'aria-labelledby'), `${id}-title`);
  assert.match(section, new RegExp(`<span class="section-number">${number}<\\/span>`, 'u'));
  assert.match(section, new RegExp(`<h2 id="${id}-title">${title}<\\/h2>`, 'u'));
}
```

Add a new generated contract that proves both landmarks are independent, ordered, localized, and no longer use the combined heading:

```js
test('both resume pages render five ordered sibling sections with independent education and writing landmarks', () => {
  const cases = [
    { route: '/', education: 'Education', writing: 'Writing' },
    { route: '/zh-cn/', education: '教育经历', writing: '写作' }
  ];

  for (const entry of cases) {
    const html = readPublic(entry.route);
    const text = visibleText(html);
    const order = ['profile', 'experience', 'projects', 'education', 'writing']
      .map((id) => html.indexOf(`id="${id}"`));

    order.forEach((position, index) => {
      assert.ok(position >= 0, `Missing ordered section ${index + 1} on ${entry.route}`);
      if (index > 0) assert.ok(position > order[index - 1], `Wrong section order on ${entry.route}`);
    });

    assertNumberedSection(html, { id: 'education', number: '04', title: entry.education });
    assertNumberedSection(html, { id: 'writing', number: '05', title: entry.writing });
    assert.doesNotMatch(text, /Education & Writing|教育与写作/u);
  }
});
```

Update the locale-specific homepage tests with the exact new copy and archive link while retaining all existing date, metric, education, metadata, privacy, and route assertions:

```js
// English homepage
assert.match(text, /AI Infra Engineer \(Xiaomi\)/u);
assert.match(text, /Focused on applied AI and exploratory research, with an emphasis on AI agents, intelligent workflows, and reliable real-world adoption\./u);
assert.match(text, /I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge\./u);
assert.match(text, /Browse all 67 posts/u);
assert.doesNotMatch(text, /Xiaomi Corporation/u);

// Chinese homepage
assert.match(text, /AI Infra 工程师（Xiaomi）/u);
assert.match(text, /专注于 AI 应用落地与研究探索，关注 AI Agent、智能工作流及其在真实场景中的可靠应用。/u);
assert.match(text, /我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。/u);
assert.match(text, /查看全部 67 篇文章/u);
assert.doesNotMatch(text, /小米科技有限责任公司/u);
```

- [ ] **Step 4: Rebuild the unchanged implementation and confirm generated RED**

Run:

```bash
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: the build succeeds, then `generated-home.test.cjs` fails on the missing `#education`, four section bodies, old combined heading, old Profile copy, and old experience headings.

- [ ] **Step 5: Replace the combined JSON model with the approved five-section model**

Set the shared order exactly:

```json
"sectionOrder": ["profile", "experience", "impact", "education", "writing"]
```

Set the English changed fields exactly:

```json
"profile": {
  "number": "01",
  "title": "Profile",
  "body": "Focused on applied AI and exploratory research, with an emphasis on AI agents, intelligent workflows, and reliable real-world adoption."
},
"experience": {
  "number": "02",
  "title": "Experience",
  "company": "AI Infra Engineer (Xiaomi)",
  "dates": "Jul 2024 — Present",
  "bullets": [
    "Led a five-person team building a production collaboration and workflow platform supporting 2M+ monthly process instances, 1M+ daily algorithm tasks, and 40+ business lines.",
    "Helped build an internal AI-agent platform with 10+ reusable workflows serving 70+ users."
  ]
},
"education": {
  "number": "04",
  "title": "Education",
  "school": "Hunan University of Technology",
  "degree": "B.S. in Computer Science and Technology",
  "dates": "Sep 2020 — Jun 2024"
},
"writing": {
  "number": "05",
  "title": "Writing",
  "archivePrefix": "Browse all",
  "archiveSuffix": "posts"
}
```

Set the Chinese changed fields exactly:

```json
"profile": {
  "number": "01",
  "title": "个人简介",
  "body": "专注于 AI 应用落地与研究探索，关注 AI Agent、智能工作流及其在真实场景中的可靠应用。"
},
"experience": {
  "number": "02",
  "title": "工作经历",
  "company": "AI Infra 工程师（Xiaomi）",
  "dates": "2024.07 — 至今",
  "bullets": [
    "带领 5 人团队建设生产协作与任务流转平台，支撑月均 200 万+ 流程实例、日均 100 万+ 算法任务，覆盖 40+ 业务线。",
    "参与内部 AI Agent 工程平台建设，落地 10+ 可复用工作流，服务 70+ 用户。"
  ]
},
"education": {
  "number": "04",
  "title": "教育经历",
  "school": "湖南工业大学",
  "degree": "计算机科学与技术 本科",
  "dates": "2020.09 — 2024.06"
},
"writing": {
  "number": "05",
  "title": "写作",
  "archivePrefix": "查看全部",
  "archiveSuffix": "篇文章"
}
```

Delete both `educationWriting` objects. Do not alter either locale's `statement`, navigation array, impact entries, experience bullets, metadata, actions, or shared featured slugs.

- [ ] **Step 6: Render Education and Writing as sibling sections**

Replace the current combined block at the end of `resume-home.pug` with:

```pug
      section#education.numbered-section(aria-labelledby='education-title')
        .section-heading
          span.section-number= profile.sections.education.number
          h2#education-title= profile.sections.education.title
        .section-body
          .education-block
            p.education-block__school= profile.sections.education.school
            p= profile.sections.education.degree
            time= profile.sections.education.dates
      section#writing.numbered-section(aria-labelledby='writing-title')
        .section-heading
          span.section-number= profile.sections.writing.number
          h2#writing-title= profile.sections.writing.title
        .section-body
          .writing-block
            ol.writing-list
              each post in context.featuredPosts
                li
                  a(href=url_for(`/${post.path}`))= post.title
                  time(datetime=post.date)= post.date
            a.archive-link(href=url_for('/archives/'))= `${profile.sections.writing.archivePrefix} ${context.postCount} ${profile.sections.writing.archiveSuffix}`
```

Do not add an Education item to `site-header.pug` or either locale's `nav` data.

- [ ] **Step 7: Run the focused contracts and confirm GREEN**

Run:

```bash
fnm exec --using=22 node --test tests/resume-data.test.cjs
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: both unit tests in `resume-data.test.cjs` pass; all generated-home tests pass for `/` and `/zh-cn/`.

- [ ] **Step 8: Check and commit the self-contained data/markup change**

Run:

```bash
git diff --check
git diff -- source/_data/resume.json themes/resume-paper/layout/_partials/resume-home.pug tests/resume-data.test.cjs tests/generated-home.test.cjs
git status --short
```

Confirm that only the four planned files changed, then commit:

```bash
git add source/_data/resume.json themes/resume-paper/layout/_partials/resume-home.pug tests/resume-data.test.cjs tests/generated-home.test.cjs
git commit -m "feat: refine bilingual resume sections"
```

---

### Task 2: Remove The Obsolete Combined Grid And Preserve Responsive Writing Rows

**Files:**

- Modify: `tests/theme-css.test.cjs:10-64`
- Modify: `themes/resume-paper/source/css/main.css:117-135,178-197,223-252`

**Interfaces:**

- Consumes: sibling `.education-block` and `.writing-block` elements from Task 1.
- Produces: no `.education-writing` selector; base two-column title/date writing rows; mobile single-column title/date writing rows.
- Preserves: existing visual tokens, numbered-section rhythm, desktop metadata rail, mobile menu, and 44px action targets.

- [ ] **Step 1: Add a narrow CSS regression contract**

Append this test to `tests/theme-css.test.cjs`:

```js
test('separate education and writing sections remove the obsolete grid while writing rows remain responsive', () => {
  const css = fs.readFileSync(cssPath, 'utf8');
  const mobileStart = css.indexOf('@media (max-width: 767px)');
  const reducedMotionStart = css.indexOf('@media (prefers-reduced-motion: reduce)');
  const mobile = css.slice(mobileStart, reducedMotionStart);

  assert.ok(mobileStart >= 0 && reducedMotionStart > mobileStart, 'missing mobile rules');
  assert.doesNotMatch(css, /\.education-writing\b/u);
  assert.match(
    css,
    /\.writing-list li\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto;/u
  );
  assert.match(
    mobile,
    /\.writing-list li\s*\{[^}]*grid-template-columns:\s*1fr;[^}]*gap:\s*var\(--space-2\);/u
  );
  assert.match(mobile, /\.writing-list time\s*\{[^}]*white-space:\s*normal;/u);
});
```

- [ ] **Step 2: Run the CSS contract and confirm RED**

Run:

```bash
fnm exec --using=22 node --test tests/theme-css.test.cjs
```

Expected: FAIL because `.education-writing` still exists in base, desktop, and mobile selectors, and the mobile writing-row override is not yet an independent rule.

- [ ] **Step 3: Remove only stale combined-section styling**

Make these exact selector changes in `main.css`:

```css
.experience-entry h3 { margin: 0; font-size: 1.25rem; }
.experience-entry time, .education-block time, .writing-list time { color: var(--muted); white-space: nowrap; }
.education-block p { margin: var(--space-2) 0; }
.education-block__school { font-weight: 700; }
.writing-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-4); padding-block: var(--space-3); border-bottom: 1px solid var(--rule); }
```

Delete the base `.education-writing` grid rule. In the desktop media block, use:

```css
.experience-entry h3, .impact-list h3 { color: var(--burgundy); font-size: 1.1rem; }
.writing-list li { padding-block: 2px; }
```

Delete the desktop `.education-writing` gap rule. In the mobile media block, replace the old grouped selector with:

```css
.experience-entry__heading, .impact-list li { display: grid; grid-template-columns: 1fr; gap: var(--space-2); }
.writing-list li { grid-template-columns: 1fr; gap: var(--space-2); }
.experience-entry time, .writing-list time { white-space: normal; }
```

Do not change numbered-section padding or any breakpoint.

- [ ] **Step 4: Run focused unit and generated tests and confirm GREEN**

Run:

```bash
fnm exec --using=22 node --test tests/theme-css.test.cjs tests/resume-data.test.cjs
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/generated-home.test.cjs
```

Expected: all focused unit and generated-home tests pass.

- [ ] **Step 5: Check and commit the styling change**

Run:

```bash
git diff --check
git diff -- themes/resume-paper/source/css/main.css tests/theme-css.test.cjs
git status --short
```

Confirm that only the CSS file and its test changed, then commit:

```bash
git add themes/resume-paper/source/css/main.css tests/theme-css.test.cjs
git commit -m "style: separate education and writing layout"
```

---

### Task 3: Run Full Verification And Record Responsive Design QA

**Files:**

- Create: `docs/qa/2026-08-10-resume-content-section-refinement.md`
- Create locally but do not track: `artifacts/qa/refinement-en-1487x1058.png`
- Create locally but do not track: `artifacts/qa/refinement-zh-1487x1058.png`
- Create locally but do not track: `artifacts/qa/refinement-en-834x1194.png`
- Create locally but do not track: `artifacts/qa/refinement-zh-834x1194.png`
- Create locally but do not track: `artifacts/qa/refinement-en-390x844.png`
- Create locally but do not track: `artifacts/qa/refinement-zh-390x844.png`

**Interfaces:**

- Consumes: the completed data, template, CSS, and tests from Tasks 1–2.
- Produces: a freshly verified deterministic `public/` tree and a committed QA report.
- Preserves: the ignored status of `artifacts/qa/`; screenshots are evidence, not deployable site assets.

- [ ] **Step 1: Prove the source tree is clean and use the required runtime**

Run:

```bash
git status --short --branch
fnm exec --using=22 node --version
```

Expected: the feature branch is clean and Node reports `v22.23.2` or another installed `v22.x` satisfying `>=22 <23`.

- [ ] **Step 2: Run the complete source verification gate**

Run:

```bash
fnm exec --using=22 npm run verify
```

Expected: JavaScript syntax, 3 baseline tests, all unit tests including the new contracts, all generated tests, the isolated full-tree stability test, and the generated-link verifier pass. The verifier continues to resolve the complete local target inventory across all generated HTML.

If any check fails, stop this task and use `superpowers:systematic-debugging`; do not record or commit a passing QA result until the full command exits zero.

- [ ] **Step 3: Start the verified site locally**

Run in a persistent terminal session:

```bash
fnm exec --using=22 npm run server -- --port 4000
```

Expected: the generated site is available at `http://localhost:4000/` and `/zh-cn/` without rebuilding from a different Node version.

- [ ] **Step 4: Capture and inspect all six required homepage states**

Use the in-app browser to inspect and capture both `/` and `/zh-cn/` at:

```text
1487 × 1058
834 × 1194
390 × 844
```

Save the six captures to the exact `artifacts/qa/refinement-<locale>-<width>x<height>.png` paths listed above. For each state, measure this browser result:

```js
({
  innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  educationTop: document.querySelector('#education').getBoundingClientRect().top + scrollY,
  educationBottom: document.querySelector('#education').getBoundingClientRect().bottom + scrollY,
  writingTop: document.querySelector('#writing').getBoundingClientRect().top + scrollY,
  educationBodyWidth: document.querySelector('#education .section-body').getBoundingClientRect().width,
  writingBodyWidth: document.querySelector('#writing .section-body').getBoundingClientRect().width
})
```

Required result for all six states:

- `scrollWidth <= innerWidth`;
- `educationTop < educationBottom <= writingTop`;
- Education and Writing share the same left alignment as the other numbered sections;
- no clipped text, overlap, excessive dead space, or hidden archive link;
- mobile writing titles and dates form readable single-column rows;
- the metadata rail remains visually attached to the resume composition.

- [ ] **Step 5: Verify real navigation and interaction behavior**

In the in-app browser:

1. On `/`, click Writing and confirm the URL fragment is `#writing` and the new Writing section is the scroll target.
2. Confirm there is no Education item in the top navigation.
3. Use `中文` to open `/zh-cn/`, then use `EN` to return to `/`.
4. At `390 × 844`, open Menu, confirm `aria-expanded="true"`, press Escape, confirm `aria-expanded="false"`, and confirm focus returns to Menu.
5. Open `/2023/08/26/Spring-IOC-SourceCodeAnalysis/` and confirm its TOC, syntax-highlighted code, copy control, tags, previous/next navigation, and no-comments state still work.
6. Confirm the browser console has no error and the homepage loads no Valine, LeanCloud, Butterfly, analytics, or remote-font request.

- [ ] **Step 6: Record exact passing evidence**

Only after Steps 2–5 pass, create `docs/qa/2026-08-10-resume-content-section-refinement.md` with this content:

```markdown
# Resume Content And Section Refinement QA — 2026-08-10

Build runtime: Node 22 / Hexo 5.4.2

| Check | Result | Evidence |
|---|---|---|
| Approved bilingual content | PASS | `/` and `/zh-cn/` render the exact approved AI Profile copy and `AI Infra Engineer (Xiaomi)` / `AI Infra 工程师（Xiaomi）`; both hero statements are unchanged. |
| Five-section hierarchy | PASS | Both locales render ordered Profile, Experience, Selected Impact, Education `04`, and Writing `05` sibling sections with unique IDs and `aria-labelledby`; the combined heading is absent. |
| Navigation preservation | PASS | Header has no Education item; Writing targets `#writing`; EN / 中文 remain ordinary working links. |
| Featured and complete writing | PASS | The same three featured posts retain route/date order and the archive link still reports all 67 posts. |
| Desktop layout | PASS | `refinement-en-1487x1058.png` and `refinement-zh-1487x1058.png`; independent Education/Writing sections preserve the compact paper-resume rhythm with no horizontal overflow or metadata-rail drift. |
| Tablet layout | PASS | `refinement-en-834x1194.png` and `refinement-zh-834x1194.png`; both sections remain aligned, consecutive, unclipped, and free of horizontal overflow. |
| Mobile layout and menu | PASS | `refinement-en-390x844.png` and `refinement-zh-390x844.png`; writing rows stack, archive link remains visible, Menu/Escape/focus behavior passes, and the language switch remains outside the menu. |
| Article behavior and no comments | PASS | Representative long article retains TOC, code/copy, tags, previous/next links, and contains no comment UI or comment-service runtime. |
| Full source gate | PASS | Node 22 `npm run verify` passes unit, generated, stability, and same-origin link verification contracts. |
```

- [ ] **Step 7: Check and commit the QA evidence**

Stop the local server, then run:

```bash
git status --short
git diff --check
git check-ignore artifacts/qa/refinement-en-1487x1058.png
```

Expected: only the dated QA Markdown file is uncommitted; the screenshot path is ignored. Commit:

```bash
git add docs/qa/2026-08-10-resume-content-section-refinement.md
git commit -m "test: record resume refinement QA"
```

---

### Task 4: Synchronize And Verify The Local Deployment Repository

**Files:**

- Modify generated output under: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/`
- Preserve unchanged: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/.git/`
- Preserve unchanged: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/docs/`
- Preserve unchanged: `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/.superpowers/`

**Interfaces:**

- Consumes: the fresh verified `/Users/pengzihao/blog/.worktrees/resume-paper/public/` tree from Task 3.
- Produces: a local deployment commit whose non-protected tree is byte-identical to `public/`.
- Does not produce: a push, hosting deployment, remote branch update, or DNS change.

- [ ] **Step 1: Verify both repository boundaries before synchronization**

Run in the source worktree:

```bash
git status --short --branch
fnm exec --using=22 npm run verify
```

Run in the deployment repository:

```bash
git status --short --branch
git diff --check
```

Expected: source and deployment repositories are clean before generated output synchronization, and the source full gate passes immediately before copying.

- [ ] **Step 2: Perform a protected checksum dry run**

Run:

```bash
rsync -avnc --dry-run --itemize-changes --delete --exclude='.git/' --exclude='docs/' --exclude='.superpowers/' /Users/pengzihao/blog/.worktrees/resume-paper/public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Expected: only generated-site paths are listed. No path under `.git/`, `docs/`, or `.superpowers/` appears. Review every deletion before continuing; this refinement should not remove any of the 67 article routes.

- [ ] **Step 3: Synchronize with the identical protected boundary**

Run:

```bash
rsync -avc --delete --exclude='.git/' --exclude='docs/' --exclude='.superpowers/' /Users/pengzihao/blog/.worktrees/resume-paper/public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Then prove the non-protected trees match:

```bash
rsync -avnc --dry-run --itemize-changes --delete --exclude='.git/' --exclude='docs/' --exclude='.superpowers/' /Users/pengzihao/blog/.worktrees/resume-paper/public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Expected: the second dry run reports no file change or deletion.

- [ ] **Step 4: Run generated contracts against the deployment tree**

From the source worktree, run:

```bash
env SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io fnm exec --using=22 node --test tests/generated-home.test.cjs tests/generated-site.test.cjs tests/generated-integrations.test.cjs
env SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io fnm exec --using=22 node scripts/verify-generated-site.cjs
```

Expected: every generated contract passes for the deployment tree, all 67 frozen routes resolve, and all same-origin generated links resolve.

- [ ] **Step 5: Verify protected paths, privacy, and diff quality**

From the deployment repository, run:

```bash
git diff --name-only -- docs .superpowers
git diff --name-only --diff-filter=D -- docs .superpowers
git diff --check
git status --short
```

Expected: the first two commands print nothing; `git diff --check` exits zero; only generated output is modified. Confirm `index.html` and `zh-cn/index.html` contain the approved new headings, Profile copy, and independent section IDs, and that no comment-service marker or credential appears in the generated diff.

- [ ] **Step 6: Create a local deployment-output commit**

Run:

```bash
git add -A
git diff --cached --name-only
git diff --cached --check
git commit -m "Site updated: 2026-08-10 resume refinement"
git status --short --branch
git show --check --stat --oneline HEAD
```

Before committing, confirm the staged path list contains no `docs/` or `.superpowers/` change. Expected final state: deployment repository clean, local `master` ahead of `origin/master`, and no remote operation performed.

- [ ] **Step 7: Stop at the publishing boundary**

Report the source commits, deployment commit, complete Node 22 verification result, deployment contract result, responsive QA evidence, and clean repository states. Explicitly state that the update is not live yet and request authorization before any `git push` or hosting action.
