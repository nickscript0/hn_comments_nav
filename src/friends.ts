import { Nav } from './browser_nav';
import { getCommentAuthor, getUserLinks, getUserName } from './hn_dom';

export class Friends {
    private storage: FriendStorage;
    private browserNav: Nav;
    private originalStyles = new Map<HTMLAnchorElement, { color: string; fontWeight: string }>();

    constructor(browserNav: Nav) {
        this.storage = new FriendStorage();
        this.browserNav = browserNav;
    }

    highlightFriends() {
        this.originalStyles.forEach((style, element) => {
            element.style.color = style.color;
            element.style.fontWeight = style.fontWeight;
            element.classList.remove('friend');
        });
        this.originalStyles.clear();
        document.querySelectorAll('.hn-keynav-friend-note').forEach(note => note.remove());
        const existingFriendsNames = this.storage.allNames();
        getUserLinks()
            .filter(e => existingFriendsNames.includes(getUserName(e) || ''))
            .forEach(element => {
                const name = getUserName(element);
                if (name) {
                    this.originalStyles.set(element, {
                        color: element.style.color,
                        fontWeight: element.style.fontWeight,
                    });
                    element.style.color = '#f44336';
                    element.style.fontWeight = 'bold';
                    element.classList.add('friend');
                    const note = document.createElement('span');
                    note.className = 'hn-keynav-friend-note';
                    note.textContent = ` [${this.storage.getComment(name)}]`;
                    element.insertAdjacentElement('afterend', note);
                }
            });
    }

    addCurrentElement() {
        if (this.browserNav.currentElement) {
            const author = getCommentAuthor(this.browserNav.currentElement);
            if (!author) return;

            const comment = window.prompt(
                `Enter a description for ${author} (leave empty to remove)`,
                this.storage.getComment(author) || ''
            );
            if (comment === null) return;
            this.storage.add(author, comment);
            this.highlightFriends();
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

    add(name: string, comment: string) {
        // if the comment is empty, delete the friend
        if (comment) this.friendsObj[name] = comment;
        else delete this.friendsObj[name];
        this.write();
    }

    getComment(name: string) {
        return this.friendsObj[name];
    }

    private write() {
        this.storage.setItem('hn_friends', JSON.stringify(this.friendsObj));
    }
}

interface FriendsObj {
    [name: string]: string;
}
