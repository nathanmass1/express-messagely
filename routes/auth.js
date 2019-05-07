// const validation = require("../middleware/auth");
const User = require("../models/user")
const express = require("express");
const router = new express.Router();
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError")

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const OPTIONS = { expiresIn: 60 * 60 }



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/



 router.post("/login", async function(req, res, next) {
    try {
        const { username, password } = req.body;
        
        let user = await User.authenticate(username, password);

        if (user) {
            let token = jwt.sign({ username }, SECRET_KEY, OPTIONS);
            await User.updateLoginTimestamp(username)
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 404)
    } catch (err) {
        return next(err)
    }
 });



/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


 router.post("/register", async function(req, res, next){
    try {
        console.log(req.body);
        const { username, password, first_name, last_name, phone } = req.body;

        let user = await User.register({username, password, first_name, last_name, phone});

        if (user) {
            let token = jwt.sign({ username }, SECRET_KEY, OPTIONS);
            await User.updateLoginTimestamp(username)
            return res.json({ token });
        }
        throw new ExpressError("Invalid user/password", 404)
    } catch (err) {
        return next(err)
    }
 })


 module.exports = router;