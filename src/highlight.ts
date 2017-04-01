/**
 * Highlight the original poster's name throughout the page
 */
import { getAllComments } from 'hn_dom';

export function highlight_op() {
    const op_name = document.getElementsByClassName('subtext')[0]
        .getElementsByClassName('hnuser')[0]
        .textContent;
    Array.from(document.getElementsByClassName('hnuser'))
        .filter(e => e.textContent === op_name)
        .map(element => {
            const html_element = <HTMLElement>element;
            html_element.style.color = '#42c135';
            html_element.style.fontWeight = 'bold';
        });
}

export interface Highlight {
    add();
    clear();
}

export class TextHighlight implements Highlight {
    private words: Set<string>;
    private colour: ColourState;

    constructor() {
        this.words = new Set();
        this.colour = new ColourState();
    }

    add() {
        const word = window.getSelection().toString();
        this.words.add(word);
        this._highlightWord(word);
        console.log('words is ', JSON.stringify(Array.from(this.words)));
    }

    clear() {
        this.words.clear();
    }

    private _highlightWord(word: string) {
        const comments = getAllComments();
        let highlight_count = 0;
        const highlight_colour = this.colour.next();
        Array.from(comments).forEach(all_el => {
            const text_els = all_el.getElementsByClassName('c00');
            Array.from(text_els).forEach(original_node => {
                if (original_node.textContent === null) return;
                const word_index = original_node.textContent.indexOf(word);
                if (word_index === -1) return;

                // Build 3 new nodes to replace the original_node:
                // pre_node, highlight_node, post_node
                const pre_node = original_node.cloneNode();
                pre_node.textContent = original_node.textContent.substring(0, word_index);
                const post_node = original_node.cloneNode();
                post_node.textContent = original_node.textContent.substring(word_index + word.length);

                original_node.textContent = word;
                const html_element = <HTMLElement>original_node;
                html_element.style.color = highlight_colour;
                html_element.style.fontWeight = 'bold';

                // Replace original_node with the new nodes
                if (original_node.parentNode === null) return;
                original_node.parentNode.insertBefore(pre_node, original_node);
                original_node.parentNode.insertBefore(post_node, original_node.nextSibling);
                highlight_count++;
            });
        });
        console.log(`Highlighted ${word} ${highlight_count} times`);
    }
}

const HIGHLIGHT_COLOURS = ['DarkOrchid', 'DarkCyan', 'Crimson', 'DarkGoldenRod', 'DarkOrange', 'Fuchsia'];

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