async function getJoke() {
    const result = await fetch("https://icanhazdadjoke.com/", {
        method: "GET",
        headers: {
            Accept: "text/plain",
            "User-Agent": "https://github.com/gabeyoro/websocket-groupchat.git",
        },
    });
    return result;
}

module.exports = { getJoke };
