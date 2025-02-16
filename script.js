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

function JSONtoHTML (json) {
    let out = "";

    for (section of json.sections) {
	if (section.type != "fftext") {
	    continue;
	}
	if (section.header != "") {
	    out = out.concat("<b><u>", section.header, "</u></b><br>\n")
	}
	for (line of section.body) {
	    out = out.concat(line, "<br>\n");
	}
	out = out.concat("\n", "<br>", "\n");
    }

    return out;
}

function cmd_whoarewe () {
    let json;

    let out = [["Fetching description...", 3]]

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
	    json = JSON.parse(xhttp.responseText);
	}
	else if ((this.status != 200) && (this.status != 0)) {
	    out = out.concat([[`${this.status} ${this.statusText}`, 1]]);
	}
    };
    xhttp.open("GET", "content/about_us.json", false);
    xhttp.send();

    if (out.length == 1) {
	return out.concat([["200 OK", 2], [JSONtoHTML(json), 0]]);
    } else {
	console.log(out)
	return out;
    }
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
    return [[meow_responses[Math.round(Math.random()*(meow_responses.length-1))], 2]]
}

const MAX_CMD_LEN = 9;
const CMD_DATA = [
    ["help",      "Prints this help message and exits.",     cmd_help],
    ["meow",      "Meow!",                                   cmd_meow],
    ["whoami",    "Deprecated; use `whoarewe' instead.",     cmd_whoami],
    ["whoarewe",  "Prints information about us.",            cmd_whoarewe]
];

function do_cmd_parse (input) {
    for (let data of CMD_DATA) {
	if (data[0] == input.value) {
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
	    let res = do_cmd_parse(input);
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
