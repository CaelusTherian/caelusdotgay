function cmd_help () {
    outstr = "";
    for (let data of CMD_DATA) {
	outstr = outstr.concat(data[0], " ".repeat(MAX_CMD_LEN - data[0].length + 1), data[1], "\n");
    }
    return [outstr, 0];
}

const MAX_CMD_LEN = 4;
const CMD_DATA = [
    ["help", "Prints this help message and exits.", cmd_help]
];

function do_cmd_parse (value) {
    console.log(`:3 ${value}`);

    for (let data of CMD_DATA) {
	if (data[0] == value) {
	    return data[2]();
	}
    }

    return ["Unrecognized command. Type `help' for a list.", 1];
}

function enter_handler () {
    let input = document.getElementById("prompt-box");
    let term = document.getElementById("terminal-contents");

    input.addEventListener("keyup", function(event) {
	if (event.key === "Enter") {
	    event.preventDefault();
	    let res = do_cmd_parse(input.value);
	    term.innerHTML = res[0];
	    term.style.color = window.getComputedStyle(document.body).getPropertyValue(res[1] ? "--error-red" : "--terminal-purple");
	}
    });
}
