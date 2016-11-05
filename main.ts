/**
 * TODOs:
 *  - Add key when held down overlays parent comment, so you can see the context of the current comment you're reading
 *  - Allow mouse click focus to determine where to start, instead of always starting at comment 0
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
    return (e: KeyboardEvent) => {
        if (e.key === 'j') nav.next();
        if (e.key === 'k') nav.previous();
        if (e.key === 'J') nav.nextRoot();
        if (e.key === 'K') nav.previousRoot();
    };
}

/**
 * Nav
 */
class BrowserNav implements Nav {
    private all_comments: HTMLCollectionOf<Element>;
    private position: number;

    constructor() {
        this.all_comments = document.getElementsByClassName('athing comtr ');
        console.log('all_comments size ' + this.all_comments.length);

        this.position = 0;
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
        let i;
        for (i = this.position + incrementor; exit_condition_func(i) && is_child(i); i += incrementor);
        console.log(`nextRoot ${i}, incrementor ${i - this.position}`);
        this._changePosition(exit_condition_func(i), i - this.position);
    }

    private _changePosition(condition: boolean, incrementor: number) {
        let orig_pos = this.position;
        if (condition) {
            this.position += incrementor;
            this._highlight(
                this.all_comments[this.position],
                this.all_comments[this.position - incrementor]
            );
        }
        console.log(`changePosition from ${orig_pos} to ${this.position}`);
    }

    private _highlight(current_element: Element, last_element: Element) {
        const current = <HTMLElement>current_element;
        const last = <HTMLElement>last_element;
        current.style.background = "aliceblue";
        last.style.background = "";
        current.scrollIntoView(true);
    }
}

main();