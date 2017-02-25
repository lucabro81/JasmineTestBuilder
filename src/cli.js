#!/usr/bin/env node

var program = require('commander');
var fs = require('fs-extra');
var exec = require('child_process').exec;

///////////////////////////////
//////////// UTILS ////////////
///////////////////////////////

/**
 * Build command string
 *
 * @param program
 * @returns {string}
 * @private
 */
function _buildCommand(program) {
    var command = "jasmine";

    if (!program.color) {
        command += " --no-color";
    }

    if (program.filter) {
        command += " --filter=" + program.filter;
    }

    if (program.helper) {
        command += " --helper=" + program.helper;
    }

    if (program.stopOnFailure) {
        command += " --stopOnFailure=" + program.stopOnFailure;
    }

    return command;
}

/**
 * Run tests
 *
 * @param program
 * @private
 */
function _run(program) {

    var command = _buildCommand(program);

    exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('Exec error: ' + error, stderr);
            console.log(stdout);
        }
        else {
            console.log(stdout);
        }
    });
}

/**
 *
 * @returns {string}
 * @private
 */
function _contentTestFile() {
    return "/*\nEXAMPLE:\n\nimport {JasmineTestBuilder} from 'jasmine-test-builder';\n\n" +
        "var tb:JasmineTestBuilder<T> = new JasmineTestBuilder<T>();\n\n" +
        "tb.init('Test suite name', T);\n" +
        "\ttb.withMethod('methodName', [paramsArray]);\n" +
        "\ttb.result('testResult');\n" +
        "tb.run();\n*/"
}

/**
 * Init test enviroment
 *
 * @param program
 * @private
 */
function _init(program) {
    fs.removeSync('spec');
    exec("jasmine init", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('Exec error: ' + error);
        }
        else {
            fs.mkdirsSync('spec/test_out');
            fs.mkdirsSync('spec/test_src');
            fs.mkdirsSync('spec/test_src/assets');
            fs.mkdirsSync('spec/app');

            fs.writeFile('spec/test_src/assets/dummy_data.ts', '', function(err) {
                if (err) {
                    return console.log(err);
                }

                fs.writeFile('spec/test_src/test.spec.ts', _contentTestFile(), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("Test enviroment initialized.");
                });
            });


        }
    });
}

/**
 *
 * @param error
 * @param stdout
 * @param stderr
 * @private
 */
function _buildAppTestExecHandler(error, stdout, stderr) {
    if (error !== null) {
        console.log('Exec error: ' + error);
    }
    else {
        console.log("test app built")
    }
}

/**
 *
 * @param error
 * @param stdout
 * @param stderr
 * @private
 */
function _buildTestsExecHandler(error, stdout, stderr) {
    if (error !== null) {
        console.log('Exec error: ' + error);
    }
    else {
        console.log("tests built")
    }
}

/**
 *
 * @param program
 * @private
 */
function _buildAppTest(program) {
    if (program.rootDir) {

        exec("tsc " + program.rootDir + "/**/*.ts " +
            "--outDir spec/app " +
            "--module CommonJS " +
            "--declaration true " +
            "--declarationDir spec/app",
            function(error, stdout, stderr) {
                _buildAppTestExecHandler(error, stdout, stderr);
            }
        )
    }
}

function _buildTests() {
    exec("tsc ./spec/test_src/**/*.ts ./spec/test_src/*.ts " +
        "--outDir spec/test_out " +
        "--module CommonJS ",
        function(error, stdout, stderr) {
            _buildTestsExecHandler(error, stdout, stderr);
        }
    )
}

/////////////////////////////////
//////////// PARSING ////////////
/////////////////////////////////

// init array of command

var run = {};
run['run'] = _run;
run['init'] = _init;
run['build-test-app'] = _buildAppTest;
run['build-tests'] = _buildTests;

program
    .arguments('<command>')
    //.option('-f, --flag <flag>', 'Some flag')
    .option('-c, --no-color', '[turn off color in spec output', null, null)
    .option('-f, --filter [filter]', 'filter specs to run only those that match the given string', null, null)
    .option('--helper [helper]', 'load helper files that match the given string', null, null)
    .option('--stopOnFailure [stopOnFailure]', '[true|false] stop spec execution on expectation failure', null, null)
    .option('-s, --rootDir <rootDir>', 'path of files to tests', null, null)
    .action(function(command) {
        run[command](program);
    })
    .parse(process.argv);