"use strict";

/** Functionality related to chatting. */

const { getJoke } = require("./utils");

// Room is an abstraction of a chat channel
const Room = require("./Room");

/** ChatUser is a individual connection from client -> server to chat. */

class ChatUser {
    /** Make chat user: store connection-device, room.
     *
     * @param send {function} callback to send message to this user
     * @param room {Room} room user will be in
     * */

    constructor(send, roomName) {
        this._send = send; // "send" function for this user
        this.room = Room.get(roomName); // room user will be in
        this.name = null; // becomes the username of the visitor

        console.log(`created chat in ${this.room.name}`);
    }

    /** Send msgs to this client using underlying connection-send-function.
     *
     * @param data {string} message to send
     * */

    send(data) {
        try {
            this._send(data);
        } catch {
            // If trying to send to a user fails, ignore it
        }
    }

    /** Handle joining: add to room members, announce join.
     *
     * @param name {string} name to use in room
     * */

    handleJoin(name) {
        this.name = name;
        this.room.join(this);
        this.room.broadcast({
            type: "note",
            text: `${this.name} joined "${this.room.name}".`,
        });
    }

    /** Handle a chat: broadcast to room.
     *
     * @param text {string} message to send
     * */

    handleChat(text) {
        this.room.broadcast({
            name: this.name,
            type: "chat",
            text: text,
        });
    }

    /** Handle messages from client:
     *
     * @param jsonData {string} raw message data
     *
     * @example<code>
     * - {type: "join", name: username} : join
     * - {type: "chat", text: msg }     : chat
     * - {type: "chat", text: "/priv..."} : private message
     * - {type: "chat", text: "/joke"}  : joke
     * </code>
     */

    handleMessage(jsonData) {
        let msg = JSON.parse(jsonData);
        if (msg.type === "join") this.handleJoin(msg.name);
        else if (msg.text.startsWith("/priv")){
            const parts = msg.text.split(" ");
            this.privateMessage(parts[1], parts[2]);
        }
        else if (msg.text === "/joke") {
            this.sendJoke();
        }
        else if (msg.type === "chat") this.handleChat(msg.text);
        else throw new Error(`bad message: ${msg.type}`);
    }

    /** Send a random joke note to this user */

    async sendJoke() {
        const joke = await getJoke();
        console.log("joke:", joke);
        this.send(
            JSON.stringify({
                type: "note",
                text: joke,
            })
        );
    }

    /** private message a user:
     *
     * @param {string} username
     * @param {string} message
     *
     * Sends chat message to username
     */

    privateMessage( username, message) {
        const users = this.room.members.values();
        const recipient = users.find(user => user.name === username);
        console.log("USERS:", users)
        if(!recipient){
            throw new Error(`could not find: ${username}`);
        }

        recipient.send(JSON.stringify({
            type: "chat",
            message: message,
            name: this.name
        }));

    }

    /** Connection was closed: leave room, announce exit to others. */

    handleClose() {
        this.room.leave(this);
        this.room.broadcast({
            type: "note",
            text: `${this.name} left ${this.room.name}.`,
        });
    }
}

module.exports = ChatUser;
