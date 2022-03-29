/**
 * Highlight the original poster's name throughout the page
 */

import { Nav } from './browser_nav';
import { getCommentAuthor, hightlightUserThroughoutPage } from './hn_dom';

export function highlight_op() {
    const subtext = document.getElementsByClassName('subtext');
    if (subtext.length === 0) return;
    const op_name = subtext[0].getElementsByClassName('hnuser')[0].textContent;
    if (op_name) {
        hightlightUserThroughoutPage({ userName: op_name, color: '#42c135', fontWeight: 'bold' });
    }
}

export interface Highlight {
    add();
    clear();
}

export class TextHighlight implements Highlight {
    private words: Set<string>;
    private colour: ColourState;
    private browserNav: Nav;

    constructor(browserNav: Nav) {
        this.words = new Set();
        this.colour = new ColourState();
        this.browserNav = browserNav;
    }

    add() {
        const selection = window.getSelection()?.toString().trim();
        // If no text is selected highlight the author name of the current comment
        const word = selection !== '' ? selection : this._getPostAuthor();
        if (word !== null && word !== undefined && !this.words.has(word)) {
            this.words.add(word);
            this._highlightWord(word);
            console.log('words is ', JSON.stringify(Array.from(this.words)));
        }
    }

    clear() {
        this.words.clear();
    }

    private _highlightWord(word: string) {
        let highlight_count = 0;
        const highlight_colour = this.colour.next();
        findNodesWithWord(word).forEach(n => {
            if (createHighlightNodeTrio(word, n, highlight_colour)) highlight_count++;
        });

        console.log(`Highlighted ${word} ${highlight_count} times`);
    }

    private _getPostAuthor(): string | null {
        if (this.browserNav.currentElement) {
            return getCommentAuthor(this.browserNav.currentElement);
        }
        return null;
    }
}

/**
 * Given a textNode split its text into 3 span nodes: (pre_node, highlight_node, post_node), where
 * highlight_node is 'word' highlighted with a style and the other nodes contain the surrounding text
 * @param {string} word the word to highlight
 * @param {Element} original_node the original textNode to split into 3
 * @param {string} highlight_colour the colour to highlight
 * @returns {boolean} true if match found and word highlighted, false otherwise
 */
function createHighlightNodeTrio(word: string, original_node: Element, highlight_colour: string): boolean {
    if (original_node.textContent === null) return false;
    const word_index = original_node.textContent.indexOf(word);
    if (word_index === -1) return false;

    // Build 3 new nodes to replace the original_node:
    // pre_node, highlight_node, post_node
    const pre_node = document.createElement('span');
    pre_node.textContent = original_node.textContent.substring(0, word_index);
    const post_node = document.createElement('span');
    post_node.textContent = original_node.textContent.substring(word_index + word.length);

    const highlight_node = document.createElement('span');
    highlight_node.textContent = original_node.textContent.substring(word_index, word_index + word.length);
    highlight_node.style.color = highlight_colour;
    highlight_node.style.fontWeight = 'bold';

    // Replace original_node with the new nodes
    if (!original_node.parentNode) return false;
    original_node.parentNode.replaceChild(highlight_node, original_node);
    if (!highlight_node.parentNode) return false;
    highlight_node.parentNode.insertBefore(pre_node, highlight_node);
    highlight_node.parentNode.insertBefore(post_node, highlight_node.nextSibling);
    return true;
}

/**
 * Find all the textNodes that have 'word' in them (ignore case and whitespace only words)
 * @param {string} word a string to match
 * @returns {Array<Element>} the list of matched nodes
 */
function findNodesWithWord(word: string): Array<Element> {
    word = word.toLowerCase();
    if (word === '') return [];

    const filter_by_word: NodeFilter = {
        acceptNode: n =>
            n.textContent && n.textContent.toLowerCase().indexOf(word) !== -1
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP,
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, filter_by_word);

    let n;
    const matched_nodes: Array<Element> = [];
    while ((n = walker.nextNode())) {
        matched_nodes.push(n);
    }

    return matched_nodes;
}

const HIGHLIGHT_COLOURS = [
    'DarkOrchid',
    'DarkCyan',
    'Crimson',
    'DarkGoldenRod',
    'DarkOrange',
    'Fuchsia',
    'Brown',
    'CadetBlue',
    'Chocolate',
    'CornflowerBlue',
    'DarkGreen',
    'DarkMagenta',
    'DarkSlateBlue',
    'DarkViolet',
    'DeepPink',
    'DeepSkyBlue',
];

class ColourState {
    colour_index: number;

    constructor() {
        this.colour_index = 0;
    }

    next() {
        if (this.colour_index >= HIGHLIGHT_COLOURS.length) this.colour_index = HIGHLIGHT_COLOURS.length - 1;
        return HIGHLIGHT_COLOURS[this.colour_index++];
    }
}
