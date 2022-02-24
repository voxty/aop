// Script By Astra#2100


const config = {
    "teamspeak_ip": "localhost",
    "teamspeak_password": "BfZzeicK",
    "teamspeak_bot_username": "AstraWrld",

    "channel_id": "2"
}





// DONNT EDIT UNLESS YOU KNOW WHAT YOUR DOING

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
        emitNet("chatMessage", source, `^3[AOP] ^7The current area of patrol is ^1${aop}`)
    };
});


on("astra:ts", (player) => {    
    TeamSpeak.connect({
        host: config.teamspeak_ip,
        protocol: QueryProtocol.RAW,
        queryport: 10011, //optional
        serverport: 9987,
        username: "serveradmin", // Query Username .. "Usally serveradmin"
        password: config.teamspeak_password, 
        nickname: config.teamspeak_bot_username 
    }).then(async teamspeak => {
        const channel = await teamspeak.getChannelById(config.channel_id);
        if (!channel) {
            console.log("That channel id is invalid, please makesure you are using the correct id");
        }
// DONNT EDIT UNLESS YOU KNOW WHAT YOUR DOING


        // EDIT ALL CHANNEL INFORMATION HERE
        // ${aop} will display the aop
        // ${player} will display the player who set the AOP
        channel.edit({
            channelDescription: `[center][size=15]AOP: ${aop}[/size][/center]\n[center][size=15]Set By: ${player}[/size][/center]`, // This will change the description
            channelName: `[cspacer]AOP: ${aop}` // This will change the space title
        });
        await Wait(1000)
        teamspeak.forceQuit()
    }).catch(e => {
        console.log(e);
    })
});

// Script By Astra#2100
console.log("Script By: Astra#2100")
