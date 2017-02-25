#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
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
            console.log('Exec error: ' + error);
        }
        else {
            console.log(stdout);
        }
    });
}

/**
 * Init test enviroment
 *
 * @param program
 * @private
 */
function _init(program) {
    exec("jasmine init", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('Exec error: ' + error);
        }
        else {
            console.log("Test enviroment initialized.");
            fs.mkdirSync('spec/test_src');
            fs.mkdirSync('spec/test_src/assets');
            fs.mkdirSync('spec/app');
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
function _buildTestExecHandler(error, stdout, stderr) {
    if (error !== null) {
        console.log('Exec error: ' + error);
    }
    else {
        console.log("test built")
    }
}

/**
 *
 * @param program
 * @private
 */
function _buildTests(program) {
    if (program.source) {
        exec("tsc --rootDir='" + program.source +
                "' --outDir='spec/app' --declaration=true --declarationDir='spec/app'",
                function(error, stdout, stderr) {
                    _buildTestExecHandler(error, stdout, stderr);
                })
    }
}

/////////////////////////////////
//////////// PARSING ////////////
/////////////////////////////////

// init array of command

var run = {};
run['run'] = _run;
run['init'] = _init;
run['build-tests'] = _buildTests;

program
    .arguments('<command>')
    //.option('-f, --flag <flag>', 'Some flag')
    .option('-c, --no-color', '[turn off color in spec output', null, null)
    .option('-f, --filter [filter]', 'filter specs to run only those that match the given string', null, null)
    .option('--helper [helper]', 'load helper files that match the given string', null, null)
    .option('--stopOnFailure [stopOnFailure]', '[true|false] stop spec execution on expectation failure', null, null)
    .option('-s, --source <source>', 'path of files to tests', null, null)
    .action(function(command) {
        run[command](program);
    })
    .parse(process.argv);