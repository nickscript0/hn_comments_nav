function main() {
    const nav = new Nav();
    document.onkeypress = handle_key(nav);
}

function handle_key(nav: Nav) {
    return function (e: KeyboardEvent) {
        // console.log(`onkeypress: e.code=${e.code}, e.key=${e.key}`);
        if (e.key === 'j') nav.next();
        if (e.key === 'k') nav.previous();
        if (e.key === 'J') nav.nextRoot();
        // console.log(`position is ${nav.navPosition}`);
    };
}

/**
 * Nav
 */
class Nav {
    private all_comments: HTMLCollectionOf<Element>;
    private position: number;

    constructor() {
        this.all_comments = document.getElementsByClassName('athing comtr ');
        console.log('all_comments is size ' + this.all_comments.length);

        this.position = 0;
    }

    public next() {
        this._changePosition((this.position < this.all_comments.length - 1), 1);

    }

    public previous() {
        this._changePosition((this.position > 0), -1);
    }

    public nextRoot() {
        this._changeRoot(1);
    }

    public get navPosition() {
        return this.position;
    }

    private _changeRoot(incrementor: number) {
        const is_child = i => this.all_comments[i].getElementsByTagName('table')[0].className.includes('parent-');
        let i;
        for (i = this.position + incrementor;
            i < this.all_comments.length && is_child(i);
            i = i + incrementor) {
        }
        console.log(`nextRoot ${i}, incrementor ${i - this.position}`);
        this._changePosition((i < this.all_comments.length), i - this.position);
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