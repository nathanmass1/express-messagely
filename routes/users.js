// const validation = require("../middleware/auth");
const User = require("../models/user")
const express = require("express");
const router = new express.Router();
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError")

const jwt = require("jsonwebtoken");
const SECRET = "NEVER MAKE THIS PUBLIC IN PRODUCTION!";
const OPTIONS = { expiresIn: 60 * 60 }


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {
    console.log("USERS.ALL", await User.all());

    try {
        return res.json({ users: await User.all() });
    } catch (err) {
        return next(err);
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async function (req, res, next) {
    try {
        return res.json({ users: await User.get(req.params.username) });
    } catch (err) {
        return next(err);
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get("/:username/to", async function (req, res, next) {
    try {
        return res.json({ messages: await User.messagesTo(req.params.username) });
    } catch (err) {
        return next(err);
    }

})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async function (req, res, next) {
    try {
        return res.json({ messages: await User.messagesFrom(req.params.username) }
        );
    } catch (err) {
        return next(err);
    }


})


module.exports = router;