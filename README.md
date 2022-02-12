# hn_comments_nav

## Build
```bash
npm run build
```

## Notes
- Icons from https://iconarchive.com/show/keyboard-keys-icons-by-chromatix/letter-h-icon.html

## TODOs
- [x] :green_book: Add a shortcut to highlight the currently selected post's author
- [ ] :closed_book: Bug: multi-keyword highlight only processes one match in an element (should process all matches)
- [x] :green_book: - New feature: allow multi-keyword highlight each with a unique colour (e.g. I want to highlight someone else's name throughout or specific words) :date: Added Apr 1, 2017
- [x] :closed_book: Currently when advancing same level comments, it stops if end of root, instead could advance to next element (as RES does)
- [x] :green_book: Add key when held down overlays parent comment, so you can see the context of the current comment you're reading
- [ ] :green_book: Add stats for the current comment (number of children, others?)
- [ ] :green_book: Add stats for the article as a whole: how many 'friends' posted in it, summarize friends posts, sort by highest children threads, ...
- [x] :closed_book: Fix: should disable shortcut keys when user is inputting text in a textbox
- [x] :green_book: Highlight OP's name
- [x] :closed_book: Add tag feature for a username, like RES has

## Published Extension Text - Chrome Web Store
### Description
This extension provides tools for quickly navigating HN comment threads, maintaining your context in deep threads, and focusing on the commenters you value.

Features and Keyboard Shortcuts:
- Next comment (j), Previous comment (k)
- Next same-level comment (Shift+j), Previous same-level comment (Shift+k)
- Up a comment level forward (Shift+n), Up a comment level backward (Shift+m)
- Next root-level comment (n), Previous root-level comment (m)
- Show the current Parent comment inline (hold "p")
- Hide or show the current comment and children (l)
- Highlight the username of the current focused comment (h)
- Highlight the current selection text (h)
- Add a friend (permanently highlight a username with a note that persists on all pages) of the current focused comment (f)