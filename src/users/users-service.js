const knex = require("knex");

const bcrypt = require("bcryptjs");


const UsersService = {

    hasUserWithUserName(knex, username) {

        return knex("users")

            .where({ username })

            .first()

            .then((user) => !!user);

    },

    insertUser(db, newUser) {

        return db

            .insert(newUser)

            .into("users")

            .returning("*")

            .then((rows) => rows[0]);

    },

    hashPassword(password) {

        return bcrypt.hash(password, 12);

    },

    updateUser(knex, id, newUserFields) {
        return knex("users").where({ id }).update(newUserFields);
    },
};




module.exports = UsersService;