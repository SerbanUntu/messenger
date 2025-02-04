const pg = require('pg')

const db = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
})

const getUserById = async (id) => {
    const result = await db.query('SELECT user_id, username FROM users WHERE user_id = $1', [id])
    return result.rows[0]
}

module.exports = { db, getUserById }
