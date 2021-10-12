interface MESSAGE {
    id: number;
    responses: ArrayMessage;
    author: string;
    data: string;
}

export function lastModified(): string {return rootMessage.responses.lastModified;}
export class ArrayMessage extends Array<MESSAGE> {
    private static _lastModified = Date.now().toString();
    get lastModified(): string {return ArrayMessage._lastModified;}

    constructor(...L: MESSAGE[]) {
        super(...L);
    }
    override splice(start: number, deleteCount?: number): MESSAGE[]
    override splice(start: number, deleteCount: number, ...L: MESSAGE[]): MESSAGE[] {
        console.log("splice", this);
        ArrayMessage._lastModified = Date.now().toString();
        return super.splice(start, deleteCount, ...L);
    }
    override push(...L: MESSAGE[]) { 
        ArrayMessage._lastModified = Date.now().toString();
        return super.push(...L);
    }
}

export const rootMessage: MESSAGE = {
    id: -1,
    responses: new ArrayMessage(),
    author: "",
    data: ""
};

let idM = 0;

createMessage("toto", "bonjour à tous");
createMessage("titi", "Salut toto", 1);
createMessage("titi", "Qui a des question ?");

export function createMessage(author: string, data: string, parentId?: number): MESSAGE | undefined {
    const m: MESSAGE = {author, data, id: ++idM, responses: new ArrayMessage()};
    if (typeof parentId === 'number') {
        const P = getMessage(parentId);
        if (P) {
            P.responses.push(m);
            return m;
        } else {
            idM--;
            return undefined;
        }
    } else {
        rootMessage.responses.push(m);
        return m;
    }
}

export function deleteMessage(id: number): boolean {
    const m = getMessage(id);
    if (m) {
        const L = [rootMessage];
        while (L.length > 0) {
            const p = L.pop() as MESSAGE;
            const pos = p.responses.indexOf(m);
            if (pos >= 0) {
                p.responses.splice(pos, 1);
                break;
            }
            L.push( ...p.responses );
        }
    }
    return !!m;
}

export function updateMessage(id: number, data: string): MESSAGE | undefined {
    const m = getMessage(id);
    if (m) {
        m.data = data;
        return m;
    } else {
        return undefined;
    }
}

export function getMessage(id: number, L: MESSAGE[] = [...rootMessage.responses]): MESSAGE | undefined {
    for (const m of L) {
        if (m.id === id) {
            return m;
        } else {
            const rep = getMessage(id, m.responses);
            if (rep) return rep;
        }
    }
    return undefined;
}

export function toHTML(): string {
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
                    ${rootMessage.responses.map( messageToHTML ).join("")}
                </section>
            </body>
        </html>`;
}

function messageToHTML(m: MESSAGE): string {
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
