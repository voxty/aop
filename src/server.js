// Script By Scentral#2100
let tsClient;

const config = {
	teamspeak_ip: "localhost",
	query_password: "omgpassword",
	teamspeak_bot_username: "serveradmin",

	aop_channel_id: "1",
	updatePlayerCount: true,
	updatePlayerCountInterval: 120, // In Seconds
	player_count_channel_id: "2",
	use_time: false,
	timezone: "America/New_York",
};

// DONNT EDIT UNLESS YOU KNOW WHAT YOUR DOING

const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library");
let aop = "None Set";
var today = new Date();
var time = today.toLocaleString("en-US", {
	hour12: false,
	timeZone: config.timezone,
	hour: "2-digit",
	minute: "2-digit",
});

RegisterCommand("aop", async (source, args) => {
	let newaop = args.join(" ");
	let commandrunner = GetPlayerName(source);
	if (newaop) {
		emitNet("chat:addMessage", -1, {
			template: `<div style='background-color: rgba(64, 64, 64, 0.3); text-align: center; border-radius: 0.5vh; padding: 0.7vh; font-size: 1.7vh;'><b>The AOP has been changed to ^3${newaop} ^7by ^1${commandrunner}.</b></div>`,
		});
		aop = newaop;
		emit("astra:ts", commandrunner);
	} else if (!newaop) {
		emitNet(
			"chatMessage",
			source,
			`^3[AOP] ^7The current area of patrol is ^1${aop}`
		);
	}
});

on("astra:ts", async (player) => {
	const channel = await tsClient.getChannelById(config.aop_channel_id);
	if (!channel) {
		console.log(
			"That channel id is invalid, please make sure you are using the correct id"
		);
	}
	if (config.use_time) {
		await channel
			.edit({
				channelDescription: `[center][size=15]AOP: ${aop}[/size][/center]\n[center][size=15]Set By: ${player}[/size][/center]`, // This will change the description
				channelName: `[cspacer]AOP: ${aop} [${time} EST]`, // This will change the space title
			})
			.catch((e) => {
				console.log(e);
			});
	} else {
		await channel
			.edit({
				channelDescription: `[center][size=15]AOP: ${aop}[/size][/center]\n[center][size=15]Set By: ${player}[/size][/center]`, // This will change the description
				channelName: `[cspacer]AOP: ${aop}`, // This will change the space title
			})
			.catch((e) => {
				console.log(e);
			});
	}
});

const updatePlayerCount = async () => {
	const channel = await tsClient.getChannelById(config.player_count_channel_id);
	if (!channel) {
		console.log(
			"That channel id is invalid, please make sure you are using the correct id"
		);
	}
	const playerCount = GetNumPlayerIndices();
	await channel
		.edit({
			channelName: `[cspacer]Players Online: ${playerCount}`,
		})
		.catch((e) => {
			console.error(e);
		});
};

on("onResourceStart", async (resourceName) => {
	if (resourceName === GetCurrentResourceName()) {
        if (config.teamspeak_bot_username.length > 20 ) return console.log("The bot username is too long, please make it less than 20 characters")
		try {
			tsClient = await TeamSpeak.connect({
				host: config.teamspeak_ip,
				protocol: QueryProtocol.RAW,
				queryport: 10011, //optional
				serverport: 9987,
				username: "serveradmin", // Query Username .. "Usally serveradmin"
				password: config.query_password,
				nickname: config.teamspeak_bot_username,
			});
			console.log("Successfully connected to the Teamspeak server.");
			if (config.updatePlayerCount)
				setInterval(updatePlayerCount, config.updatePlayerCountInterval * 1000);
		} catch (err) {
			console.error(`Error connecting to teamspeak: ${err}`);
		}
	}
});

process.on("unhandledRejection", (err) => {
	if (
		err === "TypeError: Cannot read properties of undefined (reading 'edit')"
	) {
		return console.log(
			"That channel id is invalid, please make sure you are using the correct id\n",
			err.stack
		);
	}
});

// Script By Scentral#2100
console.log(" Script By: Scentral#2100 ");
