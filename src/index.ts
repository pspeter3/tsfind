import fs = require("fs");
import glob = require("glob");

export interface TsConfig {
    files: string[];
    filesGlob?: string[];
}

export interface Config {
    filename: string;
    files?: string[];
    filesGlob?: string[];
}

export function findFiles(patterns: string[], callback: (err: Error, files: {[key: string]: boolean}) => any): void {
    var error: Error = null;
    var counter = 0;
    var max = patterns.length;
    if (max === 0) {
        return callback(new Error("Must provide non empty patterns"), null);
    }
    var included = <string[]>[];
    var excluded = <string[]>[];
    patterns.forEach((pattern) => {
        var matcher = pattern;
        var exclude = matcher[0] === "!";
        if (exclude) {
            matcher = matcher.slice(1);
        }
        glob(matcher, (err, files) => {
            /* istanbul ignore next */
            if (err) {
                error = err;
            }
            if (exclude) {
                excluded = excluded.concat(files);
            } else {
                included = included.concat(files);
            }
            counter++;
            if (counter >= max) {
                var fset = included.reduce((fset, filename) => {
                    fset[filename] = true;
                    return fset;
                }, <{[key: string]: boolean}>{});
                excluded.forEach((filename) => {
                    delete fset[filename];
                });
                return callback(error, fset);
            }
        });
    });
}

export function readTsConfig(filename: string, callback: (err: Error, tsConfig: TsConfig) => any): void {
    fs.readFile(filename, {
        encoding: "utf8"
    }, (err, contents) => {
        if (err) {
            return callback(err, null);
        }
        var data: TsConfig;
        try {
            data = JSON.parse(contents);
        } catch (e) {
            return callback(e, null);
        }
        return callback(null, data);
    });
}

export function writeTsConfig(filename: string, tsConfig: TsConfig, callback: (err: Error) => any): void {
    var contents: string;
    try {
        contents = JSON.stringify(tsConfig, null, 2);
    } catch (e) {
        return callback(e);
    }
    fs.writeFile(filename, contents, callback);
}

export function updateTsConfig(config: Config, callback: (err: Error) => any): void {
    readTsConfig(config.filename, (err, tsConfig) => {
        if (err) {
            return callback(err);
        }
        var patterns = config.filesGlob || tsConfig.filesGlob;
        if (!patterns) {
            return callback(new Error("No glob specified"));
        }
        findFiles(patterns, (err, fset) => {
            if (err) {
                return callback(err);
            }
            var overrides = config.files || [];
            overrides.forEach((filename) => {
                fset[filename] = true;
            });
            tsConfig.files = Object.keys(fset);
            writeTsConfig(config.filename, tsConfig, callback);
        });
    });
}
