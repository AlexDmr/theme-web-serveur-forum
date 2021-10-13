"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHTML = exports.getMessage = exports.updateMessage = exports.deleteMessage = exports.createMessage = exports.rootMessage = exports.ArrayMessage = exports.lastModified = void 0;
function lastModified() { return exports.rootMessage.responses.lastModified; }
exports.lastModified = lastModified;
class ArrayMessage extends Array {
    constructor(...L) {
        super(...L);
    }
    get lastModified() { return ArrayMessage._lastModified; }
    forceUpdate() {
        console.log("_lastModified was", ArrayMessage._lastModified);
        ArrayMessage._lastModified = Date.now().toString();
        console.log("_lastModified  is", ArrayMessage._lastModified);
    }
    splice(start, deleteCount, ...L) {
        console.log("splice", this);
        ArrayMessage._lastModified = Date.now().toString();
        return super.splice(start, deleteCount, ...L);
    }
    push(...L) {
        ArrayMessage._lastModified = Date.now().toString();
        return super.push(...L);
    }
}
exports.ArrayMessage = ArrayMessage;
ArrayMessage._lastModified = Date.now().toString();
exports.rootMessage = {
    id: -1,
    responses: new ArrayMessage(),
    author: "",
    data: ""
};
let idM = 0;
createMessage("toto", "Bonjour à tous");
createMessage("titi", "Salut toto", 1);
createMessage("titi", "Qui a des questions ?");
function createMessage(author, data, parentId) {
    const m = { author, data, id: ++idM, responses: new ArrayMessage() };
    if (typeof parentId === 'number') {
        const P = getMessage(parentId);
        if (P) {
            P.responses.push(m);
            return m;
        }
        else {
            idM--;
            return undefined;
        }
    }
    else {
        exports.rootMessage.responses.push(m);
        return m;
    }
}
exports.createMessage = createMessage;
function deleteMessage(id) {
    const m = getMessage(id);
    if (m) {
        const L = [exports.rootMessage];
        while (L.length > 0) {
            const p = L.pop();
            const pos = p.responses.indexOf(m);
            if (pos >= 0) {
                p.responses.splice(pos, 1);
                break;
            }
            L.push(...p.responses);
        }
    }
    return !!m;
}
exports.deleteMessage = deleteMessage;
function updateMessage(id, data) {
    const m = getMessage(id);
    if (m) {
        m.data = data;
        exports.rootMessage.responses.forceUpdate();
        return m;
    }
    else {
        return undefined;
    }
}
exports.updateMessage = updateMessage;
function getMessage(id, L = [...exports.rootMessage.responses]) {
    for (const m of L) {
        if (m.id === id) {
            return m;
        }
        else {
            const rep = getMessage(id, m.responses);
            if (rep)
                return rep;
        }
    }
    return undefined;
}
exports.getMessage = getMessage;
function toHTML() {
    // lastModified = Date.now().toString();
    return `
        <!doctype html>
        <html>
            <head>
                <link rel="stylesheet" href="/static/style.css" />
            </head>
            <body>
                <h1>Bienvenu sur le forum</h1>
                <section class="messages">
                    ${exports.rootMessage.responses.map(messageToHTML).join("")}
                </section>
            </body>
        </html>`;
}
exports.toHTML = toHTML;
function messageToHTML(m) {
    return `
        <section class="message">
            <div class="idMessage">
                <label>de ${m.author}, idMessage = ${m.id}</label>
            </div>
            <div>
                ${m.data}
            </div>
            <div>
                ${m.responses.length ? '<div class="reponse">Réponses :</div>' : ''}
                ${m.responses.map(messageToHTML)}
            </div>
        </section>
    `;
}
