let cache = {};

function general_help (DATA) {
    let max_len = Math.max.apply(null, DATA.map((x) => x[0].length));

    let out = [];
    for (let data of DATA) {
	out.push(["".concat(data[0], "&nbsp;".repeat(max_len - data[0].length + 2), data[1]), 0]);
    }
    return out;
}

function cmd_help () {
    return general_help(CMD_DATA);
}

function cmd_whoami () {
    return [["This command is deprecated; use `whoarewe' instead.", 1]]
}

function JSONtoHTML (json) {
    let out = "";

    for (section of json.sections) {
	if (section.header != "") {
	    out = out.concat(section.bold_header ? `<b><u>${section.header}</u></b>` : `<u>${section.header}</u>`, "<br>\n");
	}
	switch (section.type) {
	case "fftext":
	    out = out.concat(section.body.join("<br>\n"), "\n<br><br>\n");
	    break;

	case "list":
	    out = out.concat("<ul>\n<li>", section.body.join("</li>\n<li>"), "</li>\n</ul>\n");
	    break;

	case "factfile":
	    out = out.concat(`<img src="content/headmates/${section.body.avatar}" width="200" height="200">`,
		             `<b>Name</b>: ${section.body.name}<br>\n`,
			     "<b>Pronouns</b>: <ul>\n<li>", section.body.pronouns.join("</li>\n<li>"), "</li>\n</ul>\n",
			     `<b>Species</b>: ${section.body.species}<br>\n`,
			     `<b>Sexuality</b>: ${section.body.sexuality}<br>\n`,
			     `<b>Romanticism</b>: ${section.body.romanticism}<br>\n<br>`);

	    if (section.body.relations.length != 0) {
		out = out.concat("<u>Relationships with other headmates</u><br>\n<ul>\n<li>", section.body.relations.join("</li>\n<li>"), "</li>\n</ul>\n");
	    }
	    break;
	}
    }

    return out;
}

// 0 = bool, 1 = string
const WHOAREWE_FLAGS = [
    ["help",      "Prints this help message and exits.", 0],
    ["interests", "Prints information about our interests.", 0],
    ["interest",  "More detail about a specific interest (use interest=[short id]).", 1]
];

// Not async! Horrifying, I know!
function sync_fetch (url) {
    if (url in cache) {
	console.log("Cache hit!");
	return [cache[url], 0];
    }

    let out = ["", 0];

    let json;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
	    json = JSON.parse(xhttp.responseText);
	}
	else if ((this.status != 200) && (this.status != 0)) {
	    out = [`${this.status} ${this.statusText}`, 1];
	}
    };
    xhttp.open("GET", `content/${url}`, false);
    xhttp.send();

    if (out[1] == 0) {
	out = [json, 0];
	cache[url] = json;
    }
    return out;
}

function parse_flags (flags, DATA) {
    let fl_dict = {};

    for (flag of flags) {
	let success = false;

	for (opt of DATA) {
	    if (opt[2] == 0) {
		if (opt[0] == flag) {
		    fl_dict[opt[0]] = true;
		    success = true;
		}
	    }
	    if (opt[2] == 1) {
		if (opt[0] == flag.split("=")[0]) {
		    fl_dict[opt[0]] = flag.split("=").slice(1).join("=");
		    success = true;
		}
	    }
	}

	if (!success) {
	    return [flag, 1];
	}
    }

    return [fl_dict, 0];
}

function flag_dict_to_url (fl_dict) {
    let url = "about_us.json";
    if (fl_dict.interests) {
	url = "interests.json"
    }
    if ("interest" in fl_dict) {
	url = "interests_detail.json"
    }
    return url;
}

function cmd_whoarewe (opts) {
    let fl_data = parse_flags(opts, WHOAREWE_FLAGS);

    if (fl_data[1] == 1) {
	return [[`Unrecognized option: ${fl_data[0]}. Type \`whoarewe help' for a list of valid options.`, 1]];
    }

    if (fl_data[0].help) {
	return general_help(WHOAREWE_FLAGS);
    }

    let json;
    let res = sync_fetch(`${flag_dict_to_url(fl_data[0])}`);

    if ("interest" in fl_data[0]) {
	let success = false;

	for (section of res[0].sections) {
	    if (section.id == fl_data[0].interest) {
		res[0] = {"sections": [section]};
		success = true;
		break;
	    }
	}

	if (!success) {
	    return [[`Unknown section name: ${fl_data[0].interest}.`, 1]];
	}
    }

    let out = [["Fetching description...", 3]]

    if (res[1] == 0) {
	out.push(["200 OK", 2], [JSONtoHTML(res[0]), 0]);
    } else {
	out.push(res);
    }

    return out;
}

const meow_responses = [
    "mrrow~!",
    "nyaaa",
    "mrrrp :3",
    "mnyaa,",
    "arf!",
    "rrrufff :3",
    "boing",
    "miau :3c",
    "purrr~",
    "awawawaa",
    "beep!",
    "boop!"
];

function cmd_meow () {
    return [[meow_responses[Math.round(Math.random()*(meow_responses.length-1))], 2]]
}

const HEADMATES_FLAGS = [
    ["all",   "Lists all headmates.", 0],
    ["help",  "Prints this help message and exits.", 0],
    ["name",  "Prints information about a specific headmate; use --name=[name].", 1]
];

function cmd_headmates (opts) {
    let fl_data = parse_flags(opts, HEADMATES_FLAGS);

    if (fl_data[1] == 1) {
	return [[`Unrecognized option: ${fl_data[0]}. Type \`headmates --help' for a list of valid options.`, 1]];
    }

    if (fl_data[0].help) {
	return general_help(HEADMATES_FLAGS);
    }

    let res = ["", 0];

    if ("name" in fl_data[0]) {
	let name = fl_data[0].name.toLowerCase();
	if (name.match(/^[ 0-9a-z]+$/) == null) {
	    return [["That's not a valid headmate name!", 1]];
	}

	res = sync_fetch(`headmates/${name}.json`);

	let out = [["Fetching headmate page...", 3]];

	if (res[1] == 1) {
	    out.push(res);
	} else {
	    out.push(["200 OK", 2], [JSONtoHTML(res[0]), 0]);
	}

	return out;
    }

    let list = sync_fetch("headmate_list.json");
    let out = [["Fetching headmates list...", 3]];

    if (list[1] == 1) {
	out.push(list);
	return out;
    }

    if ("all" in fl_data[0]) {
	let html = `<b><u>Headmates</u></b>\n<ul>\n<li>${list[0].join("</li>\n<li>")}</li>\n</ul>\n`;
	out.push(["200 OK", 2], [html, 0]);
	return out;
    } else {
	return [["Please specify a selector to search headmates by.", 1]];
    }
}

const CMD_DATA = [
    ["headmates", "Prints information about our headmates.",                cmd_headmates],
    ["help",      "Prints this help message and exits.",                    cmd_help],
    ["meow",      "Meow!",                                                  cmd_meow],
    ["whoami",    "Deprecated; use `whoarewe' instead.",                    cmd_whoami],
    ["whoarewe",  "Prints information about us; --help for extra options.", cmd_whoarewe]
];

function do_cmd_parse (input) {
    for (let data of CMD_DATA) {
	if (data[0] == input.value.split(" ")[0]) {
	    return data[2](input.value.split(" ").slice(1));
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
