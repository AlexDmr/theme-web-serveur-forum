"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_1 = require("./data");
// const express = require('express');
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/static', express_1.default.static('static'));
const port = 8080;
app.listen(port, () => console.log(`Le serveur est démarré sur le port ${port} !`));
app.get("/", (req, res) => {
    if (req.headers['if-none-match'] === (0, data_1.lastModified)()) {
        console.log("On renvoie une réponse 304, sans corps.");
        res.setHeader('Cache-Control', `max-age=${60 * 60 * 24}`)
            .setHeader('ETag', (0, data_1.lastModified)())
            .status(304).end();
    }
    else {
        console.log("On regénère le HTML");
        const html = (0, data_1.toHTML)();
        res.setHeader('ETag', (0, data_1.lastModified)())
            .setHeader('Cache-Control', `max-age=${60 * 60 * 24}`)
            .send(html);
    }
});
app.get("/message", (req, res) => {
    const m = (0, data_1.getMessage)(+(req.query['id'] ?? NaN));
    if (m) {
        res.send(JSON.stringify(m));
    }
    else {
        if (typeof req.query['id'] === 'string') {
            res.status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        }
        else {
            res.status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});
app.post("/message", (req, res) => {
    const data = req.body.data;
    const author = req.body.author;
    const idParent = req.body.idParent;
    if (!data) {
        return res.status(400)
            .send(`Il manque dans le corp du message la clef data ou bien sa valeur est ""`);
    }
    if (!author) {
        return res.status(400)
            .send(`Il manque dans le corp du message la clef author ou bien sa valeur est ""`);
    }
    const m = (0, data_1.createMessage)(author, data, idParent ? +idParent : undefined);
    if (m) {
        return res.send(JSON.stringify(m));
    }
    else {
        return res.status(400)
            .send(`Aucun message correspondant à idParent = ${idParent} n'a été trouvé`);
    }
});
app.delete("/message", (req, res) => {
    const m = (0, data_1.getMessage)(+(req.query['id'] ?? NaN));
    if (m) {
        (0, data_1.deleteMessage)(+(req.query['id'] ?? NaN));
        res.send(JSON.stringify(m));
    }
    else {
        if (typeof req.query['id'] === 'string') {
            res.status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        }
        else {
            res.status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});
app.put("/message", (req, res) => {
    const data = req.body.data;
    const id = req.body.id;
    if (!data) {
        return res.status(400)
            .send(`Il manque dans le corp du message la clef data ou bien sa valeur est ""`);
    }
    if (!id) {
        return res.status(400)
            .send(`Il manque dans le corp du message la clef id ou bien sa valeur est ""`);
    }
    const m = (0, data_1.getMessage)(+id);
    if (m) {
        m.data = data;
        return res.send(JSON.stringify(m));
    }
    else {
        return res.status(400)
            .send(`Aucun message correspondant à idParent = ${id} n'a été trouvé`);
    }
});
