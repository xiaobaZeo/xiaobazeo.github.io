# Remove Bilingual Hero Statement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the descriptive sentence below the name from both resume home pages without changing the AI-focused Profile section or any other site behavior.

**Architecture:** Treat the hero statement as an obsolete presentation unit and remove it end-to-end: locale data, Pug markup, CSS, and direct contracts. Rebuild the deterministic Hexo output, synchronize only generated files into the protected GitHub Pages repository, and verify the live bilingual pages after publishing.

**Tech Stack:** Hexo 5.4.2, Pug, CSS, Node.js 22, `node:test`, Git, GitHub Pages.

## Global Constraints

- Remove the English sentence `I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.`
- Remove the Chinese sentence `我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。`
- Keep both localized Profile paragraphs unchanged.
- Keep the name, eyebrow, GitHub link, email link, PDF link, navigation, metadata rail, experience, impact, education, writing, and all 67 article routes unchanged.
- Preserve the no-comments behavior.
- Run every Node command with Node 22 via `fnm exec --using=22`.
- Do not modify or discard the pre-existing dirty nested repository at `themes/yilia`.
- Protect deployment `.git/`, `docs/`, and `.superpowers/` during synchronization.

---

### Task 1: Remove the statement unit from the source theme

**Files:**
- Modify: `tests/resume-data.test.cjs:20-57`
- Modify: `tests/generated-home.test.cjs:69-160`
- Modify: `tests/theme-css.test.cjs:38-64`
- Modify: `source/_data/resume.json:28-30,97-99`
- Modify: `themes/resume-paper/layout/_partials/resume-home.pug:6-10`
- Modify: `themes/resume-paper/source/css/main.css:99-102`

**Interfaces:**
- Consumes: `resume_context(page)` and `profile` locale objects already used by `resume-home.pug`.
- Produces: locale objects without a `statement` property and generated `/` and `/zh-cn/` pages without `.identity-header__statement`.

- [ ] **Step 1: Write the failing data, generated-page, and CSS contracts**

Replace the two positive statement assertions in `tests/resume-data.test.cjs` with:

```js
assert.equal(Object.hasOwn(en, 'statement'), false);
assert.equal(Object.hasOwn(zh, 'statement'), false);
```

In the shared `assertResumeContract()` helper in `tests/generated-home.test.cjs`, add:

```js
assert.equal(
  countMatches(html, /\bclass="identity-header__statement"/gu),
  0,
  'The removed hero statement must not leave an empty element'
);
```

Replace each locale's positive statement assertion with the matching negative assertion:

```js
assert.doesNotMatch(text, /I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge\./u);
```

```js
assert.doesNotMatch(text, /我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。/u);
```

Keep the existing exact positive assertions for both AI-focused Profile paragraphs.

Replace the statement-style assertion in `tests/theme-css.test.cjs` with:

```js
assert.doesNotMatch(css, /\.identity-header__statement\b/u);
```

- [ ] **Step 2: Run the focused contracts and verify RED**

Run:

```bash
fnm exec --using=22 node --test tests/resume-data.test.cjs tests/theme-css.test.cjs tests/generated-home.test.cjs
```

Expected: FAIL because both locale objects still contain `statement`, both generated pages still render `.identity-header__statement`, and the selector still exists in CSS.

- [ ] **Step 3: Remove the obsolete data, markup, and style**

Delete the `statement` property from both `locales.en` and `locales.zh-CN` in `source/_data/resume.json`.

Delete this line from `themes/resume-paper/layout/_partials/resume-home.pug`:

```pug
p.identity-header__statement= profile.statement
```

Delete this rule from `themes/resume-paper/source/css/main.css`:

```css
.identity-header__statement { max-width: 66ch; margin: 0; font-family: var(--sans); font-size: clamp(1rem, 1.2vw, 1.15rem); }
```

Do not change `.identity-actions`; its existing `margin-top: 20px` supplies the intended separation below the name.

- [ ] **Step 4: Regenerate and verify GREEN**

Run:

```bash
fnm exec --using=22 npm run clean
fnm exec --using=22 npm run build
fnm exec --using=22 node --test tests/resume-data.test.cjs tests/theme-css.test.cjs tests/generated-home.test.cjs
```

Expected: all focused tests PASS. Inspect generated `/index.html` and `/zh-cn/index.html` to confirm the exact Profile text remains and neither statement sentence nor `.identity-header__statement` appears.

- [ ] **Step 5: Run the complete source verification gate**

Run:

```bash
fnm exec --using=22 npm run verify
git diff --check
```

Expected: baseline, unit, generated, deterministic-build, and local-link checks PASS; 67 legacy article routes, PDF, feeds, sitemap, search, and no-comments contracts remain green; `git diff --check` emits no output.

- [ ] **Step 6: Commit the source change**

```bash
git add source/_data/resume.json \
  themes/resume-paper/layout/_partials/resume-home.pug \
  themes/resume-paper/source/css/main.css \
  tests/resume-data.test.cjs \
  tests/generated-home.test.cjs \
  tests/theme-css.test.cjs
git commit -m "feat: remove bilingual hero statement"
```

Expected: the feature worktree is clean except for the known `themes/yilia` state, which must not be staged.

---

### Task 2: Synchronize, verify, and publish the generated site

**Files:**
- Modify generated deployment file: `index.html`
- Modify generated deployment file: `zh-cn/index.html`
- Modify generated deployment file: `css/main.css`
- Preserve: `.git/`, `docs/`, `.superpowers/`

**Interfaces:**
- Consumes: deterministic `public/` output produced by Task 1.
- Produces: deployment `master` whose non-protected files are byte-for-byte identical to `public/`, followed by the same commit on `origin/master`.

- [ ] **Step 1: Confirm the protected synchronization scope**

Run a checksum dry run from the source worktree:

```bash
rsync -avnc --delete \
  --exclude='.git/' \
  --exclude='docs/' \
  --exclude='.superpowers/' \
  public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Expected: only generated presentation files change; no deletion or modification under the three protected directories.

- [ ] **Step 2: Synchronize the generated output**

Run the same command without `-n`:

```bash
rsync -avc --delete \
  --exclude='.git/' \
  --exclude='docs/' \
  --exclude='.superpowers/' \
  public/ /Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io/
```

Expected: deployment content now matches the source `public/` tree.

- [ ] **Step 3: Run deployment contracts and byte-equivalence checks**

From the source worktree, run:

```bash
SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io \
  fnm exec --using=22 node --test \
  tests/generated-home.test.cjs \
  tests/generated-site.test.cjs \
  tests/generated-integrations.test.cjs

SITE_OUTPUT_DIR=/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io \
  fnm exec --using=22 node scripts/verify-generated-site.cjs
```

Then compare sorted SHA-256 manifests for source `public/` and the deployment tree while excluding `.git/`, `docs/`, and `.superpowers/`.

Expected: every deployment contract and link check PASS, both manifests contain 138 files, and their path/hash pairs are identical.

- [ ] **Step 4: Commit the deployment output**

From `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io`, run:

```bash
git diff --check
git add index.html zh-cn/index.html css/main.css
git commit -m "Site updated: 2026-08-11 hero statement removed"
```

Expected: the deployment repository is clean and `master` is ahead of `origin/master` by the new specification, plan, and generated-site commits.

- [ ] **Step 5: Publish and verify the live bilingual pages**

First query the remote `master` SHA and confirm it equals the locally known pre-push base. Push deployment `master` over HTTPS, then refresh the remote-tracking ref.

Verify both live pages contain their unchanged AI-focused Profile paragraphs and do not contain either removed statement sentence or `.identity-header__statement`:

```bash
curl -fsSL https://xiaobazeo.com/ | rg 'Focused on applied AI|I build reliable systems|identity-header__statement'
curl -fsSL https://xiaobazeo.com/zh-cn/ | rg '专注于 AI 应用落地与研究探索|我专注于复杂生产流程|identity-header__statement'
```

Expected: each page returns its Profile phrase; neither page returns the removed statement phrase or class. Local `master` and `origin/master` resolve to the same commit with divergence `0 0`.
