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

UsersRouter
    .route("/")
    .all((req, res, next) => {
        knexInstance = req.app.get("db");
        next();
    })
    .get((req, res) => {
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

UsersRouter
    .route("/:id")
    .all((req, res, next) => {
        UsersService.getById(req.app.get("db"), req.params.id)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        error: { message: `User doesn't exist` },
                    });
                }
                res.user = user;
                next();
            })
            .catch(next);
    })
    .get((req, res, next) => {
        res.json(res.user);

    }).patch((req, res, next) => {
        const{
            username, 
            password, 
            name
        } = req.body;
        const userToUpdate = {
            username, 
            password, 
            name
        };

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
        if (numberOfValues === 0) {
            logger.error(`Invalid update without required fields`);
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'username', 'password', 'name'`,
                },
            });
        }
        UsersService.updateUser(req.app.get("db"), req.params.id, userToUpdate)
            .then((numRowsAffected) => {
                res.status(204).end();
            })
            .catch(next);
    });



module.exports = UsersRouter;