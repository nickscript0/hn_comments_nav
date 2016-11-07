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

    private _nextPosition(current_position: number | null, incrementor: number, boundary_func: Function) {
        let new_position: number;
        // Case 1: no comment is highlighted, go to nearest
        if (current_position === null) {
            new_position = this._findNearestTopCommentIndex();
            this._highlight(this.all_comments[new_position]);
        }
        // Case 2: will not go outside bounds, change to new position
        else if (boundary_func(current_position)) {
            new_position = current_position + incrementor;
            this._unHighlight(this.all_comments[current_position]);
            this._highlight(this.all_comments[new_position]);
        }
        // Case 3: will go outside bounds, remain in current
        else {
            new_position = current_position;
        }
        console.log(`changePosition from ${current_position} to ${new_position}`);
        return new_position;
    }

    public next() {
        this.position = this._nextPosition(this.position, 1,
            p => p < this.all_comments.length - 1);
    }

    public previous() {
        this.position = this._nextPosition(this.position, -1,
            p => p > 0);
    }

    public nextRoot() {
        const boundary_func = i => i < this.all_comments.length;
        const incrementor = (this.position !== null) ? this._findNextRoot(this.position, 1, boundary_func) : 0;
        this.position = this._nextPosition(this.position, incrementor, boundary_func);
    }

    public previousRoot() {
        const boundary_func = i => i >= 0;
        const incrementor = (this.position !== null) ? this._findNextRoot(this.position, -1, boundary_func) : 0;
        this.position = this._nextPosition(this.position, incrementor, boundary_func);
    }

    public get navPosition() {
        return this.position;
    }

    private _findNextRoot(current_position: number, incrementor: number, boundary_func: Function) {
        const is_child = i => this.all_comments[i].getElementsByTagName('table')[0].className.includes('parent-');
        let i: number = current_position + incrementor;
        while (boundary_func(i) && is_child(i)) {
            i += incrementor;
        }
        return boundary_func(i) ? i - current_position : 0;
    }

    private _highlight(element: Element) {
        const current = <HTMLElement>element;
        current.style.background = "aliceblue";
        current.scrollIntoView(true);
    }

    private _unHighlight(element: Element) {
        const last = <HTMLElement>element;
        last.style.background = "";
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