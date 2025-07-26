let tsClient;
let db;

const config = {
    enableSQL: false, // Toggle this to false to disable SQL functionality

    mysql: {
        host: "",
        user: "",
        password: "",
        database: ""
    },
    teamspeak_ip: "localhost",
    query_password: "",
    teamspeak_bot_username: "Vox Development",
    channel_id: "1",
    enableDiscordLogging: false,
    discord_webhook: ""
}

const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
const axios = require("axios");
const mysql = require("mysql2/promise");

let aop = "None Set";
let aopSetBy = "Unknown";

let voteInProgress = false;
let voteOptions = [];
let votes = {};
let voteTimeout = null;
const VOTE_DURATION = 60000;

let lastKnownAOP = null;
let lastKnownSetter = null;
let lastChangeByCommand = false;

const formatMessage = (msg) => ({
    template: `<div style='background-color: rgba(34,34,34,0.4); padding-top: 5px; padding-bottom: 5px; border-radius: 7px; text-align: center; font-size: 1.6vh;'>${msg}</div>`
});

async function sendToDiscordWebhook(oldAOP, newAOP, player) {
    try {
        await axios.post(config.discord_webhook, {
            content: null,
            embeds: [{
                title: "AOP Changed",
                description: `The AOP has been changed from **${oldAOP}** to **${newAOP}** by **${player}**.`,
                color: 0xFFA500,
                timestamp: new Date().toISOString()
            }]
        });
    } catch (error) {
        console.log(`Failed to send to Discord webhook: ${error}`);
    }
}

async function saveAOP(newAOP, setBy) {
    if (!config.enableSQL || !db) return;
    try {
        await db.query("DELETE FROM aop WHERE serverName = ?", ['s1']);
        await db.query("INSERT INTO aop (aop, setBy, serverName) VALUES (?, ?, ?)", [newAOP, setBy, 's1']);
    } catch (err) {
        console.error("[MySQL] Failed to save AOP:", err);
    }
}

async function getCurrentAOP() {
    if (!config.enableSQL || !db) return aop;
    try {
        const [rows] = await db.query("SELECT aop FROM aop WHERE serverName = ? LIMIT 1", ['s1']);
        if (rows.length > 0) return rows[0].aop;
        return aop;
    } catch (err) {
        console.error("[MySQL] Failed to get current AOP:", err);
        return aop;
    }
}

async function getCurrentSetter() {
    if (!config.enableSQL || !db) return aopSetBy;
    try {
        const [rows] = await db.query("SELECT setBy FROM aop WHERE serverName = ? LIMIT 1", ['s1']);
        if (rows.length > 0) return rows[0].setBy;
        return aopSetBy;
    } catch (err) {
        console.error("[MySQL] Failed to get current setter:", err);
        return aopSetBy;
    }
}

async function checkForAOPChange() {
    try {
        const newAOP = await getCurrentAOP();
        const newSetter = await getCurrentSetter();

        if (newAOP !== lastKnownAOP || newSetter !== lastKnownSetter) {

            if (lastChangeByCommand) {
                lastChangeByCommand = false;
                lastKnownAOP = newAOP;
                lastKnownSetter = newSetter;
                aop = newAOP;
                aopSetBy = newSetter;
                emit("ts:execute", newSetter);
                return;
            }

            aop = newAOP;
            aopSetBy = newSetter;
            lastKnownAOP = newAOP;
            lastKnownSetter = newSetter;

            emitNet("chat:addMessage", -1, formatMessage(`The AOP has been changed to ^3${aop} ^7by ^1${aopSetBy}.`));
            if (config.enableDiscordLogging) {
                await sendToDiscordWebhook(lastKnownAOP, aop, commandRunner);
            }
        }
    } catch (err) {
        console.error("[AOP] Error checking AOP change:", err);
    }
}
RegisterCommand("aop", async (source, rawArgs) => {
    let commandRunner = GetPlayerName(source);
    let input = rawArgs.join(" ");

    const args = input.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(str => str.replace(/"/g, "")) || [];

    if (args.length === 0) {
        if (voteInProgress) {
            let voteMessage = `^3[AOP] ^7Current vote in progress:\n`;
            voteOptions.forEach((option, index) => {
                voteMessage += `^7${index + 1}. ${option} (${votes[option] || 0} votes)\n`;
            });
            voteMessage += `^7Use /aop 1-${voteOptions.length} to vote!`;
            emitNet("chatMessage", source, voteMessage);
        } else {
            emitNet("chatMessage", source, `^3[AOP] ^7The current area of patrol is ^1${aop}`);
        }
        return;
    }

    if (args.length === 1 && args[0].match(/^[1-5]$/) && voteInProgress) {
        let voteIndex = parseInt(args[0]) - 1;
        if (voteIndex >= 0 && voteIndex < voteOptions.length) {
            let selectedOption = voteOptions[voteIndex];
            votes[selectedOption] = (votes[selectedOption] || 0) + 1;
            emitNet("chatMessage", source, `^3[AOP] ^7You voted for ^1${selectedOption}`);
        } else {
            emitNet("chatMessage", source, `^3[AOP] ^7Invalid vote. Use /aop 1-${voteOptions.length}`);
        }
        return;
    }

    if (voteInProgress) {
        emitNet("chatMessage", source, `^3[AOP] ^7A vote is already in progress. Use /aop 1-${voteOptions.length} to vote.`);
        return;
    }

    const directSetAOPs = ["los santos", "blaine county", "sandy shores", "paleto bay", "north ls", "north los santos", "south ls", "south los santos", "north bc", "north blaine county", "south bc", "south blaine county"];
    const inputLower = input.toLowerCase();

    if (directSetAOPs.includes(inputLower)) {
        let newAOP = input;
        let oldAOP = aop;
        aop = newAOP;
        aopSetBy = commandRunner;

        lastChangeByCommand = true;

        await saveAOP(aop, aopSetBy);

        emitNet("chat:addMessage", -1, formatMessage(`The AOP has been changed to ^3${aop} ^7by ^1${commandRunner}.`));
        emit("ts:execute", commandRunner);
        if (config.enableDiscordLogging) {
            await sendToDiscordWebhook(oldAOP, aop, commandRunner);
        }
        lastKnownAOP = aop;
        lastKnownSetter = aopSetBy;

        lastChangeByCommand = false;

        return;
    }

    if (args.length > 1 && args.length <= 5) {
        voteOptions = args;
        votes = {};
        voteInProgress = true;

        emitNet("chat:addMessage", -1, formatMessage(
            `AOP vote started by ^1${commandRunner}^7 vote with /aop 1-${voteOptions.length}<br>` +
            voteOptions.map((opt, i) => `${i + 1}. ${opt}`).join('<br>')
        ));

        voteTimeout = setTimeout(async () => {
            voteInProgress = false;
            let winningAOP = aop;
            let maxVotes = -1;

            for (let option of voteOptions) {
                let voteCount = votes[option] || 0;
                if (voteCount > maxVotes) {
                    maxVotes = voteCount;
                    winningAOP = option;
                }
            }

            let oldAOP = aop;
            aop = maxVotes === 0 ? voteOptions[Math.floor(Math.random() * voteOptions.length)] : winningAOP;
            aopSetBy = commandRunner;

            lastChangeByCommand = true;

            await saveAOP(aop, aopSetBy);

            emitNet("chat:addMessage", -1, formatMessage(`AOP vote ended. New AOP is ^3${aop} ^7set by ^1${commandRunner}.`));
            if (config.enableDiscordLogging) {
                await sendToDiscordWebhook(oldAOP, aop, commandRunner);
            }
            emit("ts:execute", commandRunner);

            lastKnownAOP = aop;
            lastKnownSetter = aopSetBy;

            lastChangeByCommand = false;

            voteOptions = [];
            votes = {};
            voteTimeout = null;
        }, VOTE_DURATION);
        return;
    }

    let newAOP = args[0];
    let oldAOP = aop;
    aop = newAOP;
    aopSetBy = commandRunner;

    lastChangeByCommand = true;

    await saveAOP(aop, aopSetBy);

    emitNet("chat:addMessage", -1, formatMessage(`The AOP has been changed to ^3${aop} ^7by ^1${commandRunner}.`));
    emit("ts:execute", commandRunner);
    if (config.enableDiscordLogging) {
        await sendToDiscordWebhook(oldAOP, aop, commandRunner);
    }
    lastKnownAOP = aop;
    lastKnownSetter = aopSetBy;

    lastChangeByCommand = false;
});

on("ts:execute", async (player) => {
    try {
        const channel = await tsClient.getChannelById(config.channel_id);
        if (!channel) {
            console.log("Invalid TeamSpeak channel ID.");
            return;
        }
        await channel.edit({
            channelDescription: `[center][b][size=14]AOP: ${aop}[/b]\n[b][size=12]Set By: ${player}[/size][/center]`,
            channelName: `[cspacer]AOP: ${aop}`
        });
    } catch (err) {
        console.log("Failed to update TeamSpeak channel:", err);
    }
});

on("onResourceStart", async (resourceName) => {
    if (resourceName === GetCurrentResourceName()) {
        try {
            if (config.enableSQL) {
                db = await mysql.createPool(config.mysql);
                await db.execute(`
                    CREATE TABLE IF NOT EXISTS aop (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        aop VARCHAR(255) NOT NULL,
                        setBy VARCHAR(255) NOT NULL,
                        serverName VARCHAR(255) NOT NULL
                    );
                `);
            }

            tsClient = await TeamSpeak.connect({
                host: config.teamspeak_ip,
                protocol: QueryProtocol.RAW,
                queryport: 10011,
                serverport: 9987,
                username: "serveradmin",
                password: config.query_password,
                nickname: config.teamspeak_bot_username
            });
            console.log("TeamSpeak connection established");

            aop = await getCurrentAOP();
            aopSetBy = await getCurrentSetter();
            lastKnownAOP = aop;
            lastKnownSetter = aopSetBy;

            setInterval(checkForAOPChange, 5000);

        } catch (err) {
            console.error("[Startup] Error on resource start:", err);
        }
    }
});
