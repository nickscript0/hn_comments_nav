/**
 * TODOs:
 *  - Add key when held down overlays parent comment, so you can see the context of the current comment you're reading
 *  - Instead of always starting at comment 0, jump to the element nearest the top of the viewport
 *  - Fix: should disable shortcut keys when user is inputting text in a textbox
 */

function main() {
    const nav = new BrowserNav();
    document.onkeypress = handle_key(nav);
}

interface Nav {
    next();
    previous();
    nextRoot();
    previousRoot();
}

function handle_key(nav: Nav) {
    const key_map = {
        'j': nav.next.bind(nav),
        'k': nav.previous.bind(nav),
        'J': nav.nextRoot.bind(nav),
        'K': nav.previousRoot.bind(nav)
    };
    return (e: KeyboardEvent) => key_map[e.key]();
}

/**
 * Nav
 */
class BrowserNav implements Nav {
    private all_comments: HTMLCollectionOf<Element>;
    private position: number | null;

    constructor() {
        this.all_comments = document.getElementsByClassName('athing comtr ');
        console.log('all_comments size ' + this.all_comments.length);

        this.position = null;
    }

    public next() {
        this._changePosition((this.position < this.all_comments.length - 1), 1);
    }

    public previous() {
        this._changePosition((this.position > 0), -1);
    }

    public nextRoot() {
        this._changeRoot(1, i => i < this.all_comments.length);
    }

    public previousRoot() {
        this._changeRoot(-1, i => i >= 0);
    }

    public get navPosition() {
        return this.position;
    }

    private _changeRoot(incrementor: number, exit_condition_func: Function) {
        const is_child = i => this.all_comments[i].getElementsByTagName('table')[0].className.includes('parent-');
        let i: number;
        for (i = this.position + incrementor; exit_condition_func(i) && is_child(i); i += incrementor);
        console.log(`nextRoot ${i}, incrementor ${i - this.position}`);
        this._changePosition(exit_condition_func(i), i - this.position);
    }

    private _changePosition(condition: boolean, incrementor: number) {
        const last_position = this.position;
        if (condition) {
            this.position = this.position !== null ? this.position + incrementor : this._findNearestTopCommentIndex();
            const last_comment = last_position !== null ? this.all_comments[last_position] : null;
            this._highlight(
                this.all_comments[this.position],
                last_comment
            );
        }
        console.log(`changePosition from ${last_position} to ${this.position}`);
    }

    private _highlight(current_element: Element, last_element: Element | null) {
        const current = <HTMLElement>current_element;
        current.style.background = "aliceblue";

        if (last_element !== null) {
            const last = <HTMLElement>last_element;
            last.style.background = "";
        }
        current.scrollIntoView(true);
    }

    private _findNearestTopCommentIndex(): number {
        // find the distance from top of viewport of all comments
        const tops = Array.from(this.all_comments).map(x => x.getBoundingClientRect().top);

        // find first non-negative top index (elements above viewport are negative)
        let starting_index = 0;
        for (; starting_index < tops.length; starting_index++) {
            if (tops[starting_index] >= 0) break;
        }
        return starting_index;
    }
}

main();