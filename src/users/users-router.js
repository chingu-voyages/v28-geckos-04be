const express = require("express");
const UsersService = require("./users-service");
const { requireAuth } = require("../middleware/jwt-auth");


const UsersRouter = express.Router();
const serializeUser = (user) => {
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        date_created: user.date_created,
    };
};

let knexInstance;

UsersRouter.route("/api/users")
    .all((req, res, next) => {
        knexInstance = req.app.get("db");
        next();
    })
    .get(requireAuth, (req, res) => {
        console.log(req.user);
        res.json(serializeUser(req.user));
    })
    .post((req, res) => {
        const { password, username, name, confirmPassword } = req.body;
        const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
        console.log(req.body);

        for (const field of ["username", "password", "name", "confirmPassword"]) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing ${field}`,
                });
            }
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                error: `Passwords don't match`,
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: `Password must be 8 or more characters`,
            });
        }

        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return res.status(400).json({
                error: `Password must contain one uppercase character, one lowercase character, one special character, and one number`,
            });
        }

        UsersService.hasUserWithUserName(knexInstance, username).then((hasUser) => {
            if (hasUser) {
                return res.status(400).json({
                    error: `Username already in use`,
                });
            }

            return UsersService.hashPassword(password).then((hashedPassword) => {
                const newUser = {
                    username,
                    name,
                    password: hashedPassword,
                };

                return UsersService.insertUser(knexInstance, newUser).then((user) => {
                    res.status(201).json(serializeUser(user));
                });
            });
        });
    });

module.exports = UsersRouter;