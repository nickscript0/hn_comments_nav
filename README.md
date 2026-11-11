# hn_comments_nav

## Build

Use Node.js 26 LTS; the exact development and CI version is pinned in `.nvmrc`.
If you use nvm, run `nvm install` and `nvm use` in this directory first.

```bash
npm ci
npm run build
```

The build runs strict TypeScript checking, then esbuild produces a minified ES2022
content script and source map at `build/main.bundle.js` and `build/main.bundle.js.map`.

Reload the unpacked extension in `chrome://extensions` after building, then refresh open HN tabs.

## Development

```bash
npm run watch      # Rebuild the content script on source changes
npm run typecheck  # Check types without emitting JavaScript
npm run lint       # Run Biome lint checks
npm run format     # Format TypeScript, JavaScript, and project JSON with Biome
npm test           # Build and run the shortcut regression tests
npm run check      # Check lint and formatting, type-check, build, and test (also runs in CI)
```

Watch mode builds an unminified bundle and source map. Reload the extension and refresh
HN after each rebuild. To check types continuously in another terminal, run
`npm run typecheck -- --watch`.

The toolchain uses esbuild for bundling, TypeScript for type checking, Biome for linting
and formatting, and jsdom with Node's built-in test runner for DOM regression tests.
The manifest continues to load `build/main.bundle.js`.

To package a production build for submission:

```bash
npm run build
./zip-for-submission.sh
```

## Notes
- Icons from https://iconarchive.com/show/keyboard-keys-icons-by-chromatix/letter-h-icon.html

## TODOs
- [ ] :closed_book: Bug: multi-keyword highlight only processes one match in an element (should process all matches)
- [ ] :green_book: Add stats for the current comment (number of children, others?)
- [ ] :green_book: Add stats for the article as a whole: how many 'friends' posted in it, summarize friends posts, sort by highest children threads, ...

- [x] :green_book: Add a shortcut to highlight the currently selected post's author
- [x] :green_book: - New feature: allow multi-keyword highlight each with a unique colour (e.g. I want to highlight someone else's name throughout or specific words) :date: Added Apr 1, 2017
- [x] :closed_book: Currently when advancing same level comments, it stops if end of root, instead could advance to next element (as RES does)
- [x] :green_book: Add key when held down overlays parent comment, so you can see the context of the current comment you're reading
- [x] :closed_book: Fix: should disable shortcut keys when user is inputting text in a textbox
- [x] :green_book: Highlight OP's name
- [x] :closed_book: Add tag feature for a username, like RES has

## Published Extension Text - Chrome Web Store
### Description
This extension provides tools for quickly navigating HN comment threads, maintaining your context in deep threads, and focusing on the commenters you value.

Features and Keyboard Shortcuts (available on HN Comments Pages):
- Next comment (j), Previous comment (k)
- Next same-level comment (Shift+j), Previous same-level comment (Shift+k)
- Up a comment level forward (Shift+n), Up a comment level backward (Shift+m)
- Next root-level comment (n), Previous root-level comment (m)
- Show the current Parent comment inline (hold "p")
- Hide or show the current comment and children (l)
- Highlight the username of the current focused comment (h)
- Highlight the current selection text (h)
- Click the `nav` link in a comment header to make it the current keyboard navigation target
- Add a friend (permanently highlight a username with a note that persists on all pages) of the current focused comment (f)
- Press `f` again to edit the friend note; submit an empty note to remove the friend, or Cancel to keep it
- Copy the post title and url in adoc format (Ctrl+Shift+X)
