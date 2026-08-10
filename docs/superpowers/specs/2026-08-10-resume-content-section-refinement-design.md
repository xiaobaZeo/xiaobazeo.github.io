# Resume Content And Section Refinement Design

**Status:** Approved for implementation planning

**Date:** 2026-08-10

**Product:** xiaobazeo.com / bilingual Hexo resume blog

**Primary source workspace:** `/Users/pengzihao/blog`

**Deployment repository:** `/Users/pengzihao/pzh_project/github_project/xiaobazeo.github.io`

## Purpose

Refine the approved bilingual resume homepage without changing its visual direction or blog behavior. The update makes the experience heading more concise, shifts the profile language toward applied AI, and separates education from writing so each topic has a clearer place in the page hierarchy.

This document is an incremental amendment to `2026-08-07-bilingual-resume-blog-design.md`. Where the two documents conflict, this document takes precedence.

## Approved Changes

### 1. Experience heading

Replace the current Xiaomi company-only heading with a role-and-company heading:

- English: `AI Infra Engineer (Xiaomi)`
- Chinese: `AI Infra 工程师（Xiaomi）`

This wording appears only as the heading of the existing work-experience entry. It does not appear in the identity hero, metadata rail, page title, navigation, or profile body. No department name is added.

The existing dates, two experience bullets, metrics, and layout remain unchanged.

### 2. Profile copy

Replace only the body text of `01 / Profile` and `01 / 个人简介`.

English:

> Focused on applied AI and exploratory research, with an emphasis on AI agents, intelligent workflows, and reliable real-world adoption.

Chinese:

> 专注于 AI 应用落地与研究探索，关注 AI Agent、智能工作流及其在真实场景中的可靠应用。

The copy intentionally presents applied AI as the primary focus and exploratory research as the secondary focus.

The identity hero statements remain unchanged:

- English: `I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.`
- Chinese: `我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。`

### 3. Education and writing hierarchy

Replace the combined `04 / Education & Writing` section with two independent, vertically ordered numbered sections:

1. `04 / Education` and `04 / 教育经历`
2. `05 / Writing` and `05 / 写作`

Each section has its own semantic section element, heading, rule, and body. Education is no longer visually nested beside writing in a two-column block.

The homepage order becomes:

1. `01 / Profile`
2. `02 / Experience`
3. `03 / Selected Impact`
4. `04 / Education`
5. `05 / Writing`

## Content Preservation

The following content and behavior must not change:

- The default homepage remains English at `/`.
- The Chinese homepage remains available at `/zh-cn/`.
- The `EN / 中文` language switch keeps its existing behavior.
- The identity hero name, statements, actions, and metadata remain unchanged.
- The education school, degree, and dates remain unchanged in both languages.
- Writing continues to show the same three selected posts in the same order.
- The writing section continues to show `Browse all 67 posts` / `查看全部 67 篇文章`.
- All 67 existing article routes and article-page behavior remain intact.
- Archive, tags, search, Atom feed, sitemap, PDF download, favicon, and custom-domain output remain intact.
- Comments remain unsupported and must not be reintroduced.

## Navigation

The top navigation remains unchanged. It does not gain an Education item.

- The existing Writing link continues to target `#writing`.
- The new Education section is reached through normal page scrolling.
- This avoids crowding the desktop and tablet header while preserving the current navigation rhythm.

## Data Model

The bilingual resume data should represent Education and Writing as separate sections instead of a shared `educationWriting` object.

The shared section order becomes:

```text
profile, experience, impact, education, writing
```

Both locales use the same field structure:

- `sections.education`: section number, localized title, school, degree, and dates.
- `sections.writing`: section number, localized title, archive-link prefix, and archive-link suffix.

The selected post list remains data-driven and is not duplicated inside the theme template.

The experience data keeps the existing field consumed by the template, but its localized display value changes to the approved role-and-company text. No additional role or department row is introduced.

## Template Structure

The homepage template renders five sibling numbered sections.

- Education uses `section#education` with a unique `#education-title` heading referenced by `aria-labelledby`.
- Writing uses `section#writing` with a unique `#writing-title` heading referenced by `aria-labelledby`.
- The previous combined Education/Writing wrapper is removed.
- Heading hierarchy remains valid: one page-level `h1`, followed by section-level `h2` headings and content-level headings only where needed.

## Layout And Responsive Behavior

The approved paper-inspired visual system remains unchanged: ivory background, charcoal text, burgundy accents, editorial typography, thin rules, and a restrained single-page rhythm.

The two new sections use the same numbered-section spacing and alignment as Profile, Experience, and Selected Impact.

### Desktop

- Education and Writing appear one after the other in the main resume column.
- The added section heading must not create excessive dead space or disrupt the metadata rail alignment.
- The page may extend below the first viewport, but the information density should remain close to the current design.

### Tablet and mobile

- Education and Writing remain consecutive single-column sections.
- Writing rows retain their existing responsive behavior and must not overflow horizontally.
- The language switch and mobile navigation remain visible and operable.

Any obsolete `.education-writing` grid rules are removed rather than left as unused styling.

## Accessibility And Metadata

- Both new sections use unique IDs and accessible heading relationships.
- Keyboard focus order remains unchanged except for the natural addition of the separate Education landmark.
- Existing canonical, `hreflang`, language, and structured metadata remain unchanged.
- Text contrast and touch-target requirements from the original design continue to apply.

## Verification Strategy

Implementation follows test-driven development.

1. Add failing data-contract tests for the new section order, section numbers, exact bilingual profile copy, and exact experience headings.
2. Add failing generated-home tests for unique `#education` and `#writing` sections, five numbered section bodies, and the absence of the old combined heading.
3. Add a focused CSS contract that rejects obsolete combined-grid rules and protects the responsive writing layout.
4. Make the smallest data, template, and CSS changes required to pass those tests.
5. Run the complete Node 22 verification suite, including deterministic builds and generated-link checks.
6. Confirm that all 67 article routes, feeds, search, sitemap, PDF, and no-comments contracts still pass.
7. Inspect both languages at these representative viewports:
   - desktop: `1487 × 1058`
   - tablet: `834 × 1194`
   - mobile: `390 × 844`
8. Confirm no clipping, overlap, horizontal scrolling, navigation regression, or unintended content change.

## Acceptance Criteria

1. The English experience heading reads exactly `AI Infra Engineer (Xiaomi)`.
2. The Chinese experience heading reads exactly `AI Infra 工程师（Xiaomi）`.
3. No department name or separate role row is rendered.
4. The English and Chinese Profile bodies match the approved AI-focused copy exactly.
5. The two identity hero statements remain byte-for-byte unchanged in the resume data and rendered homepage.
6. Education is rendered as independent section `04` with ID `education` in both languages.
7. Writing is rendered as independent section `05` with ID `writing` in both languages.
8. Neither homepage contains `Education & Writing` or `教育与写作`.
9. The top navigation is unchanged and its Writing link still resolves to `#writing`.
10. The same three selected posts and the complete 67-post archive link remain present.
11. Both homepages are responsive and accessible at the required desktop, tablet, and mobile sizes.
12. All automated source and generated-site verification passes on Node 22.
13. The generated deployment tree preserves all 67 article routes and contains no comment-service code or credentials.

## Delivery Boundary

Implementation is performed in the canonical Hexo source, then verified static output is synchronized to the deployment repository. Local commits are allowed as part of the implementation workflow. Pushing or publishing the updated site requires explicit deployment authorization after verification.
