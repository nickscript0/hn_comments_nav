const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { JSDOM } = require('jsdom');

const bundle = readFileSync(require.resolve('../build/main.bundle.js'), 'utf8');

// Structure checked against a live HN discussion on 2026-11-11. Modern
// profile links have no hnuser class; the older markup includes it.
function fixture({ legacy = false, missingOP = false, missingNavs = false } = {}) {
    const user = name => `<a href="user?id=${name}"${legacy ? ' class="hnuser"' : ''}>${name}</a>`;
    const row = (id, name, indent) => `<tr class="athing comtr" id="${id}"><td><table><tr>
        <td class="ind" indent="${indent}"><img width="${indent * 40}"></td>
        <td class="default"><div><span class="comhead">
        ${name ? user(name) : '[deleted]'} <span class="age"><a href="item?id=${id}">1 hour ago</a></span>
        ${missingNavs ? '' : '<span class="navs"> | <a href="#103">next</a></span>'}
        </span></div><div class="comment"><div class="commtext c00">Some useful text.</div>
        <div class="reply"><a href="reply?id=${id}">reply</a></div></div></td>
        </tr></table></td></tr>`;
    return `<table><tr><td class="subtext"><span class="subline">${missingOP ? '' : user('alice')}</span></td></tr></table>
        <table class="comment-tree">${row('101', 'alice', 0)}${row('102', 'bob', 1)}${row('103', 'alice', 0)}${row('104', null, 0)}</table>
        <textarea></textarea>`;
}

function openPage(options = {}, friends = {}) {
    const dom = new JSDOM(fixture(options), {
        url: 'https://news.ycombinator.com/item?id=100',
        runScripts: 'outside-only',
    });
    const { window } = dom;
    window.console.log = () => {};
    window.HTMLElement.prototype.scrollIntoView = function () { window.lastScrolled = this.id; };
    window.localStorage.setItem('hn_friends', JSON.stringify(friends));
    const errors = [];
    window.addEventListener('error', event => errors.push(event.error));
    // Evaluating the actual content-script bundle also verifies startup reaches
    // nav-link installation instead of failing while highlighting the OP.
    window.eval(bundle);
    return {
        window,
        document: window.document,
        errors,
        key(key) { window.document.dispatchEvent(new window.KeyboardEvent('keypress', { key, bubbles: true })); },
        nav(id) { window.document.querySelector(`[id="${id}"] .hn-keynav-nav-button`).click(); },
        close() { assert.deepEqual(errors, []); window.close(); },
    };
}

for (const legacy of [false, true]) {
    test(`${legacy ? 'legacy' : 'modern'} markup: nav links set the target used by j/k and h`, () => {
        const page = openPage({ legacy });
        const { document } = page;
        assert.equal(document.querySelectorAll('.hn-keynav-nav-button').length, 4);
        assert.equal(document.querySelector('[href="user?id=alice"]').style.color, 'rgb(66, 193, 53)');
        page.nav('102');
        assert.equal(page.window.lastScrolled, '102');
        assert.equal(document.getElementById('102').style.background, 'aliceblue');
        assert.equal(document.querySelectorAll('.hn-keynav-rtp').length, 4);
        page.key('h');
        assert.equal(document.querySelector('[href="user?id=bob"] span[style]').style.color, 'darkorchid');
        page.key('j');
        assert.equal(page.window.lastScrolled, '103');
        page.key('k');
        assert.equal(page.window.lastScrolled, '102');
        page.close();
    });
}

test('h highlights selected text without a navigation target', () => {
    const page = openPage();
    const text = page.document.querySelector('.commtext');
    const range = page.document.createRange();
    range.selectNodeContents(text);
    page.window.getSelection().addRange(range);
    page.key('h');
    for (const comment of page.document.querySelectorAll('.commtext')) {
        assert.equal(comment.querySelector('span[style]').style.color, 'darkorchid');
    }
    page.close();
});

test('f adds, edits, cancels and removes notes immediately while preserving profile identity', () => {
    const page = openPage();
    const { document, window } = page;
    page.nav('101');
    let answer = 'Helpful author';
    const prompts = [];
    window.prompt = (message, value) => { prompts.push({ message, value }); return answer; };
    page.key('f');
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hn_friends')), { alice: 'Helpful author' });
    assert.equal(document.querySelectorAll('.hn-keynav-friend-note').length, 3);
    assert.equal(document.querySelector('[href="user?id=alice"]').textContent, 'alice');
    assert.equal(document.querySelector('[href="user?id=alice"]').classList.contains('friend'), true);
    answer = 'Updated note';
    page.key('f');
    assert.equal(prompts[1].value, 'Helpful author');
    assert.equal(document.querySelectorAll('.hn-keynav-friend-note').length, 3);
    assert.equal(document.querySelector('.hn-keynav-friend-note').textContent, ' [Updated note]');
    answer = null;
    page.key('f');
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hn_friends')), { alice: 'Updated note' });
    // H still uses the username after F has decorated it, including persisted notes.
    page.key('h');
    assert.equal(document.querySelector('[href="user?id=alice"] span[style]').textContent, 'alice');
    assert.equal(document.querySelector('[href="user?id=alice"] span[style]').style.color, 'darkorchid');
    answer = '';
    page.key('f');
    assert.deepEqual(JSON.parse(window.localStorage.getItem('hn_friends')), {});
    assert.equal(document.querySelectorAll('.hn-keynav-friend-note').length, 0);
    assert.equal(document.querySelectorAll('.friend').length, 0);
    page.close();
});

test('persisted friends highlight on startup and survive navigation and H', () => {
    const page = openPage({}, { alice: 'Saved note' });
    assert.equal(page.document.querySelectorAll('.hn-keynav-friend-note').length, 3);
    page.nav('102');
    assert.equal(page.document.querySelectorAll('.hn-keynav-rtp').length, 4);
    page.nav('101');
    page.key('h');
    assert.equal(page.document.querySelector('[href="user?id=alice"] span[style]').textContent, 'alice');
    page.close();
});

test('missing OP author and deleted comments do not break initialization or shortcuts', () => {
    const page = openPage({ missingOP: true, missingNavs: true });
    assert.equal(page.document.querySelectorAll('.hn-keynav-nav-button').length, 4);
    page.nav('104');
    page.key('h');
    page.window.prompt = () => assert.fail('Deleted author must not prompt');
    page.key('f');
    page.close();
});
