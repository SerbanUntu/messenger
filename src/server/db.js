const pg = require('pg')

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
})

const doesUserExist = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id])
    return result.rows.length > 0
}

module.exports = { pool, doesUserExist } 