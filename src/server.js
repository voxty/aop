// Script By Astra#2100

const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
let aop = "None Set"
let Wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

RegisterCommand("aop", async (source, args) => {
    let newaop = args.join(" ");
    let commandrunner = GetPlayerName(source);
    if (newaop) {
        emitNet("chat:addMessage", -1, {
            template: `<div style='background-color: rgba(64, 64, 64, 0.3); text-align: center; border-radius: 0.5vh; padding: 0.7vh; font-size: 1.7vh;'><b>The AOP has been changed to ^3${newaop} ^7by ^1${commandrunner}.</b></div>`,
        });
        aop = newaop
        emit("astra:ts", commandrunner);

    } else if (!newaop) {
        emitNet("chat:addMessage", source, `^3[AOP] ^7The current area of patrol is ^1${aop}`)
    };
});


on("astra:ts", (player) => {    
    TeamSpeak.connect({
        host: "localhost", // teamspeak ip
        protocol: QueryProtocol.RAW,
        queryport: 10011, //optional
        serverport: 9987,
        username: "serveradmin", // Query Username .. "Usally serveradmin"
        password: "QUERY_PASSWORD", // Query Password .. "Shows it when you create the teamspeak"
        nickname: "Asta Development" // Bot username
    }).then(async teamspeak => {
        const channel = await teamspeak.getChannelById("CHANNEL_ID"); // Set channel id here
        channel.edit({
            channelDescription: `[center][size=15]AOP: ${aop}[/size][/center]\n[center][size=15]Set By: ${player}[/size][/center]`, // This will change the description
            channelName: `[cspacer]AOP: ${aop}` // This will change the space title
        });
        await Wait(1000)
        teamspeak.forceQuit()
    })
});

// Script By Astra#2100
console.log("Script By: Astra#2100")