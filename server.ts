import express from "express";
import { createMessage, deleteMessage, getMessage, lastModified, toHTML, updateMessage } from './data';
// const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('static'));

const port = 8080;
app.listen(port, () => console.log(`Le serveur est démarré sur le port ${port} !`));

app.get("/", (req, res) => {
    if (req.headers['if-none-match'] === lastModified() ) {
        console.log("GET / : On renvoie une réponse 304, sans corps.")
        res .setHeader('Cache-Control', `max-age=${60*60*24}`)
            .setHeader('ETag', lastModified() )
            .status(304).end();
    } else {
        console.log("GET / : On regénère le HTML");
        const html = toHTML();
        res .setHeader('ETag', lastModified() )
            .setHeader('Cache-Control', `max-age=${60*60*24}`)
            .send( html );
    }
});

app.get("/message", (req, res) => {
    const m = getMessage( +(req.query['id'] ?? NaN) );
    if (m) {
        res.send( JSON.stringify(m) );
    } else {
        if (typeof req.query['id'] === 'string') {
            res .status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        } else {
            res .status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});

app.post("/message", (req, res) => {
    const data     = req.body.data   as string;
    const author   = req.body.author as string;
    const idParent = req.body.idParent as string;

    if (!data) {
        return res  .status(400)
                    .send( `Il manque dans le corp du message la clef data ou bien sa valeur est ""` );
    }
    if (!author) {
        return res  .status(400)
                    .send( `Il manque dans le corp du message la clef author ou bien sa valeur est ""` );
    }
    const m = createMessage(author, data, idParent ? +idParent : undefined);
    if (m) {
        return res  .send( JSON.stringify(m) );
    } else {
        return res  .status(400)
                    .send( `Aucun message correspondant à idParent = ${idParent} n'a été trouvé` )
    }
});

app.delete("/message", (req, res) => {
    const m = getMessage( +(req.query['id'] ?? NaN) );
    if (m) {
        deleteMessage( +(req.query['id'] ?? NaN) );
        res.send( JSON.stringify(m) );
    } else {
        if (typeof req.query['id'] === 'string') {
            res .status(404)
                .send(`Aucun message n'est identifié par "${req.query['id']}"`);
        } else {
            res .status(404)
                .send("Veuillez spécifier un paramètre id");
        }
    }
});

app.put("/message", (req, res) => {
    const data      = req.body.data     as string;
    const id        = req.body.id       as string;

    if (!data) {
        return res  .status(400)
                    .send( `Il manque dans le corp du message la clef data ou bien sa valeur est ""` );
    }
    if (!id) {
        return res  .status(400)
                    .send( `Il manque dans le corp du message la clef id ou bien sa valeur est ""` );
    }
    const m = updateMessage( +id, data );
    if (m) {
        return res  .send( JSON.stringify(m) );
    } else {
        return res  .status(400)
                    .send( `Aucun message correspondant à idParent = ${id} n'a été trouvé` )
    }
});
