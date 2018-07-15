import { Nav } from 'browser_nav';

export class Friends {
    private storage: FriendStorage;
    private browserNav: Nav;

    constructor(browserNav: Nav) {
        this.storage = new FriendStorage();
        this.browserNav = browserNav;
    }

    highlightFriends() {
        const existingFriendsNames = this.storage.allNames();
        Array.from(document.getElementsByClassName('hnuser'))
            .filter(e => existingFriendsNames.includes(e.textContent || ''))
            .forEach(element => {
                const name = element.textContent;
                if (name) {
                    const html_element = <HTMLElement>element;
                    html_element.style.color = '#f44336';
                    html_element.style.fontWeight = 'bold';
                    html_element.className = 'hnuser friend';
                    html_element.textContent = this.storage.getNameCommentString(name);
                }
            });
    }

    addCurrentElement() {
        if (this.browserNav.currentElement) {
            const hnuser = this.browserNav.currentElement.getElementsByClassName('hnuser');
            const author = hnuser[0].textContent;

            const comment = window.prompt(`Enter a description for ${author}`);
            this.storage.add(author, comment);
        }
    }

}

class FriendStorage {
    storage: Storage;
    friendsObj: FriendsObj;

    constructor() {
        this.storage = window.localStorage;
        this.friendsObj = JSON.parse(this.storage.getItem('hn_friends') || '{}');
    }

    allNames() {
        return Object.keys(this.friendsObj);
    }

    add(value, comment) {
        const name = this.nameFromValue(value);
        // if the comment is empty, delete the friend
        this.friendsObj[name] = comment || undefined;
        this.write();
    }

    getNameCommentString(name: string) {
        const comment = this.friendsObj[name];
        return `${name} [${comment}]`;
    }

    // This will return the name in both cases if it is a comment name string or just a name
    private nameFromValue(value: string) {
        return value.split(' [')[0];
    }

    private write() {
        this.storage.setItem('hn_friends', JSON.stringify(this.friendsObj));
    }
}

interface FriendsObj {
    [name: string]: string;
}