function cmd_help () {
    out = [];
    for (let data of CMD_DATA) {
	out.push(["".concat(data[0], "&nbsp;".repeat(MAX_CMD_LEN - data[0].length + 1), data[1]), 0]);
    }
    return out;
}

function cmd_whoami () {
    return [["This command is deprecated; use `whoarewe' instead.", 1]]
}

const about_us = `Hello! Thank you for visiting our website!<br>
<br>
This is the website of the Caelus System, fdbdd038-c151-4bed-8fdf-fdb02992c758. We're a system of nerdy girlthings (including the robotgirl, writing this!).<br><br>
We consider ourselves generally ageless and therian, although some of us may feel a stronger attachment to our biological age and/or humanity than the rest. We have infinitely many headmates. This website includes resources on us, and various projects and toys we've collected. We hope you enjoy your stay!<br><br>

For private communication, our GPG key is 0x522422885A2A8C3653FE8DF96DF08DC39EC5EDCD, which can be found on the Ubuntu OpenPGP keyserver.`;

function cmd_whoarewe () {
    return [["Fetching description...", 3], ["200 OK", 2], [about_us, 0]]
}

const meow_responses = [
    "mrrow~!",
    "nyaaa",
    "mrrrp :3",
    "mnyaa,",
    "arf!",
    "rrrufff :3",
    "boing"
];

function cmd_meow () {
    return [[meow_responses[Math.floor(Math.random()*meow_responses.length)], 2]]
}

const MAX_CMD_LEN = 8;
const CMD_DATA = [
    ["help",     "Prints this help message and exits.", cmd_help],
    ["whoami",   "Deprecated; use `whoarewe' instead.", cmd_whoami],
    ["whoarewe", "Prints information about us.",        cmd_whoarewe],
    ["meow",     "Meow!",                               cmd_meow]
];

function do_cmd_parse (value) {
    console.log(`:3 ${value}`);

    for (let data of CMD_DATA) {
	if (data[0] == value) {
	    return data[2]();
	}
    }

    return [["Unrecognized command. Type `help' for a list.", 1]];
}

function code_to_color (errcode) {
    switch (errcode) {
    case 0:
	return "--terminal-purple";
    case 1:
	return "--error-red";
    case 2:
	return "--success-green";
    case 3:
	return "--progress-yellow";
    }
}

function enter_handler () {
    let input = document.getElementById("prompt-box");
    let term = document.getElementById("terminal-contents");

    input.addEventListener("keyup", function(event) {
	if (event.key === "Enter") {
	    event.preventDefault();
	    let res = do_cmd_parse(input.value);

	    term.innerHTML = "";

	    let i = 0;
	    for (line of res) {
		term.innerHTML = term.innerHTML.concat(`<span id="term-line-${i}">${line[0]}</span><br>`)
		document.getElementById(`term-line-${i}`).style.color = window.getComputedStyle(document.body).getPropertyValue(code_to_color(line[1]));
		i++;
	    }
	}
    });
}
