/** User class for message.ly */

const db = require("../db");
const bcrypt = require('bcrypt');



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.query(
      `INSERT into users (username, password, first_name, last_name, phone, join_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp)
      RETURNING username, first_name, last_name`,
      [username, hashedPassword, first_name, last_name, phone]);

    return result.rows[0];
  }


  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `Select password from users where username = $1`,
      [username]);
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return user;
        // throw {message: `You're logged in: ${username}`, status: 404}
      } else {
        throw {message: "Not authorized", status: 401}
      }
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `Update users set last_login_at = current_timestamp
      where username = $1
      returning username, last_login_at`,
      [username]);

    if (!result.rows[0]) {
      throw { message: `No such user: ${username}`, status: 404 }
    }

   return result.rows[0] 
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `Select username, first_name, last_name, phone from users`
    );

    return result.rows


  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `Select username, first_name, last_name, phone, join_at, last_login_at
      from users where username = $1`, [username]
    );

    return result.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `Select m.id, m.to_username, m.body, m.sent_at, m.read_at, t.username, t.first_name, t.last_name, t.phone
      from messages m
      join users f on f.username = m.from_username
      join users t on t.username = m.to_username
      where m.from_username = $1`,
      [username]
    );

    let m = result.rows;

    if (!m) {
      throw { message: `No messages from: ${username}`, status: 404 };
    }

    return m.map(obj => ({
      id: obj.id,
      to_user: {
        username: obj.username,
        first_name: obj.first_name,
        last_name: obj.last_name,
        phone: obj.phone,
      },
      body: obj.body,
      sent_at: obj.sent_at,
      read_at: obj.read_at
    }))

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `Select m.id, m.from_username, m.body, m.sent_at, m.read_at, t.username, t.first_name, t.last_name, t.phone
      from messages m
      join users f on f.username = m.from_username
      join users t on t.username = m.to_username
      where m.to_username = $1`,
      [username]
    );
    let m = result.rows;
    console.log(m);

    if (!m) {
      throw { message: `No messages to: ${username}`, status: 404 };
    }

    return m.map(obj => ({
      id: obj.id,
      from_user: {
        username: obj.username,
        first_name: obj.sfirst_name,
        last_name: obj.last_name,
        phone: obj.phone,
      },
      body: obj.body,
      sent_at: obj.sent_at,
      read_at: obj.read_at
    }))


  }
}


module.exports = User;