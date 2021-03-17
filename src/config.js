module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://chingu@localhost/geckos',
    API_TOKEN: process.env.API_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET|| 'v28-mushroom-finder-jwt',
    JWT_EXPIRY: process.env.JWT_EXPIRY 

}