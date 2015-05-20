import index = require("./index");
import minimist = require("minimist");
import path = require("path");

interface Arguments extends minimist.ParsedArgs {
    tsconfig?: string;
    glob?: string[] | string;
}

var argv = <Arguments>minimist(process.argv.slice(2));

var config: index.Config  = {
    filename: argv.tsconfig || path.join(process.cwd(), "tsconfig.json"),
    files: argv._
};

if (typeof argv.glob === "string") {
    config.filesGlob = [<string>argv.glob];
} else {
    config.filesGlob = <string[]>argv.glob;
}

index.updateTsConfig(config, (err) => {
    if (err) {
        throw err;
    }
});
