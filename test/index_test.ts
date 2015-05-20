import chai = require("chai");
import fs = require("fs");
import index = require("../src/index");
import os = require("os");
import path = require("path");

var assert = chai.assert;

suite("Index", () => {
    var tmp = path.join(os.tmpdir(), "tsconfig.json");

    function writeTsConfig(contents: string, callback: (err: Error) => any): void {
        fs.writeFile(tmp, contents, callback);
    }

    function readTsConfig(callback: (err: Error, contents: string) => any): void {
        fs.readFile(tmp, {
            encoding: "utf8"
        }, callback);
    }

    teardown((done) => {
        fs.exists(tmp, (exists) => {
            if (exists) {
                return fs.unlink(tmp, done);
            }
            done();
        });
    });

    test("#findFiles", (done) => {
        index.findFiles([
            "!./build/**/*.ts",
            "./**/*.ts",
            "!./node_modules/**/*.ts",
            "!./typings/**/*.ts"
        ], (err, files) => {
            if (err) {
                done(err);
            }
            assert.deepEqual({
                "./src/index.ts": true,
                "./test/index_test.ts": true
            }, files);
            done();
        });
    });

    suite("#readTsConfig", () => {
        test("reads tsconfig files", (done) => {
            writeTsConfig(JSON.stringify({
                filesGlob: [
                    "./**/*.ts",
                    "!./build/**/*.ts",
                    "!./node_modules/**/*.ts"
                ]
            }), (err) => {
                if (err) {
                    return done(err);
                }
                index.readTsConfig(tmp, (err, tsConfig) => {
                    if (err) {
                        return done(err);
                    }
                    assert.deepEqual([
                        "./**/*.ts",
                        "!./build/**/*.ts",
                        "!./node_modules/**/*.ts"
                    ], tsConfig.filesGlob);
                    done();
                });
            });
        });

        test("returns fs errors", (done) => {
            index.readTsConfig(tmp, (err, tsConfig) => {
                assert.isDefined(err);
                assert.isNotNull(err);
                assert.instanceOf(err, Error);
                done();
            });
        });

        test("returns JSON parse errors", (done) => {
            writeTsConfig("evil", (err) => {
                if (err) {
                    return done(err);
                }
                index.readTsConfig(tmp, (err, tsConfig) => {
                    assert.isDefined(err);
                    assert.isNotNull(err);
                    assert.instanceOf(err, SyntaxError);
                    done();
                });
            });
        });
    });

    suite("#writeTsConfig", () => {
        test("writes tsconfig files", (done) => {
            index.writeTsConfig(tmp, {files: []}, (err) => {
                if (err) {
                    done(err);
                }
                readTsConfig((err, contents) => {
                    if (err) {
                        return done(err);
                    }
                    assert.equal("{\n  \"files\": []\n}", contents);
                    done();
                });
            });
        });

        test("throws errors", (done) => {
            var obj: any = {};
            obj.a = {b: obj};
            index.writeTsConfig(tmp, obj, (err) => {
                assert.isDefined(err);
                assert.isNotNull(err);
                assert.instanceOf(err, TypeError);
                done();
            });
        });
    });

    suite("#updateTsConfig", () => {
        test("pass explicit glob", (done) => {
            writeTsConfig("{\"files\":[]}", (err) => {
                if (err) {
                    return done(err);
                }
                index.updateTsConfig({
                    filename: tmp,
                    filesGlob: ["!**/*.ts"]
                }, (err) => {
                    if (err) {
                        return done(err);
                    }
                    readTsConfig((err, contents) => {
                        if (err) {
                            return done(err);
                        }
                        assert.equal("{\n  \"files\": []\n}", contents);
                        done();
                    });
                });
            });
        });

        test("pass file overrides", (done) => {
            writeTsConfig("{\"files\":[], \"filesGlob\":[\"!**/*.ts\"]}", (err) => {
                if (err) {
                    return done(err);
                }
                index.updateTsConfig({
                    filename: tmp,
                    files: ["./src/index.ts"]
                }, (err) => {
                    if (err) {
                        return done(err);
                    }
                    readTsConfig((err, contents) => {
                        if (err) {
                            return done(err);
                        }
                        assert.equal(
                            "{\n  \"files\": [\n    \"./src/index.ts\"\n  ],\n  \"filesGlob\": [\n    \"!**/*.ts\"\n  ]\n}",
                            contents);
                        done();
                    });
                });
            });
        });

        test("returns readTsConfig errors", (done) => {
            index.updateTsConfig({
                filename: tmp
            }, (err) => {
                assert.isDefined(err);
                assert.isNotNull(err);
                assert.instanceOf(err, Error);
                done();
            });
        });

        test("returns findFiles errors", (done) => {
            writeTsConfig("{\"files\":[]}", (err) => {
                if (err) {
                    return done(err);
                }
                index.updateTsConfig({
                    filename: tmp,
                    filesGlob: []
                }, (err) => {
                    assert.isDefined(err);
                    assert.isNotNull(err);
                    assert.instanceOf(err, Error);
                    assert.equal(err.message, "Must provide non empty patterns");
                    done();
                });
            });
        });

        test("errors if there is no glob", (done) => {
            writeTsConfig("{}", (err) => {
                if (err) {
                    return done(err);
                }
                index.updateTsConfig({
                    filename: tmp
                }, (err) => {
                    assert.isDefined(err);
                    assert.isNotNull(err);
                    assert.instanceOf(err, Error);
                    assert.equal(err.message, "No glob specified");
                    done();
                });
            });
        });
    });
});
