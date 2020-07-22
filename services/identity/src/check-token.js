import {sharedConnection} from './db-util';

// The token should be checked in its form before awaiting any query and sending it to the DB to reduce time wasting. With that directly reject when form fails.
// DISCUSSION NEEDED: Maybe instead, automatically server-side trigger deleting the token when date passed

/**
 *
 * @param {string} token
 */
export async function checkToken(token) {

    // Unnecessary to check !token ?

    if (!token) {
        console.log('No token given.');
        return false;
    }

    if (token.length < 100 /* This is just a number I thought of for now */ || token.length > 255) {
        console.log('This token is not valid in its form.');
        return false;
    }

    const db = await sharedConnection();

    // TODO: In the following query also directly check for the expires_at date (no time wasting when querying two times) or should it be separately done?
    // TODO: With which time should it be compared?

    const [[{tokenExists}]] = await db.query('SELECT COUNT(*) as `tokenExists` FROM tokens WHERE token LIKE ?;', [token]);
    if (!tokenExists /* && !tokenHasExpired*/) {
        return true;
    }

    console.log('This token does not exist or has expired.')
}