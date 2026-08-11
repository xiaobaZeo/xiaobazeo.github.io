# Remove the bilingual hero statement

Date: 2026-08-11

## Goal

Remove the descriptive sentence below the name from both resume home pages while preserving the AI-focused Profile section and every other approved part of the bilingual resume.

## Approved scope

- Remove the English hero sentence: `I build reliable systems for complex production workflows and turn engineering practice into reusable knowledge.`
- Remove the corresponding Chinese hero sentence: `我专注于复杂生产流程的可靠系统建设，并将工程实践沉淀为可复用经验。`
- Keep both localized Profile paragraphs unchanged.
- Keep the name, eyebrow, GitHub link, email link, PDF link, navigation, metadata rail, experience, impact, education, writing, and all 67 article routes unchanged.
- Preserve the no-comments behavior.

## Design

The statement is a dedicated data field rendered as a dedicated paragraph between the name and contact actions. Remove the statement field from both locale objects, remove the statement paragraph from the resume-home template, and remove its now-unused CSS rule. The contact actions will follow the name directly, with existing spacing rules providing the final layout.

Do not replace the removed statement with Profile copy. This avoids duplicate content and keeps the AI positioning exclusively in the numbered Profile section, as requested.

## Verification

Use test-driven development:

1. Update the data and generated-page contracts first so they require both statement fields and both rendered sentences to be absent.
2. Run the focused tests and confirm they fail because the existing statement remains.
3. Remove the data fields, template paragraph, and unused CSS selector.
4. Run focused tests, then the complete Node 22 verification gate.
5. Confirm `/` and `/zh-cn/` retain their Profile copy and contact actions, contain no empty statement element, and remain responsive.
6. Rebuild and synchronize only generated site changes into the protected deployment repository, verify byte equality and links, commit, push, and confirm both live pages.

## Non-goals

- No changes to Profile wording.
- No typography, color, navigation, article, PDF, route, feed, search, sitemap, or comment-system changes.
- No refactoring outside the obsolete statement data, markup, styles, and their direct tests.
