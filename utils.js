/** Helper functions used by other classes */


/** getJoke
 *
 * Returns a random plaintext joke from icanhazdadjoke.com
 *
 * @returns {string} joke
 */
async function getJoke() {
    const result = await fetch("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: {
            Accept: "text/plain",
            "User-Agent": "https://github.com/gabeyoro/websocket-groupchat.git",
        },
    });
    const joke = await result.text();
    return joke;
}

module.exports = { getJoke };
