const User = require("../models/user")
const Message = require("../models/message")
const express = require("express");
const router = new express.Router();
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError")
const validation = require("../middleware/auth")

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const OPTIONS = { expiresIn: 60 * 60 }


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", validation.ensureLoggedIn, async function (req, res, next) {
    try {
        console.log("CURRENT USER", req.user);

        const msg = await Message.get(req.params.id);
        console.log(msg);
        if (req.user.username === msg.from_user.username || req.user.username === msg.to_user.username) {
            return res.json({ message: await Message.get(req.params.id) });
        } else {
            return next({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        return next(err);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


router.post("/", validation.ensureLoggedIn, async function (req, res, next) {

    try {
        const { to_username, body } = req.body;
        console.log("REQ USER",req.user.username)
        const from_username = req.user.username

        let message = await Message.create({ from_username, to_username, body});
        console.log(message);

        return res.json({ message });
    } catch (err) {
        return next();
    }

})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/


 router.post("/:id/read",validation.ensureLoggedIn, async function (req, res, next) {
    try {
    const msg = await Message.get(req.params.id);
        console.log(msg);
        console.log("Message to username", msg.to_user.username)
        console.log("reg user username", req.user.username)

    if (req.user.username === msg.to_user.username) {
        return res.json({ message: await Message.markRead(req.params.id) });
    } else {
        return next({ status: 401, message: "Message wasn't for you!" });
    }
    }
    catch (err) {
        return next();
    }

 })

module.exports = router;