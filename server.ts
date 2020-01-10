import * as http from 'http';
import * as fs from 'fs';

import * as commandArgs from 'command-line-args';

/* usage page */

const usage: string = 
`A random image server.
Sends a random image to users when they click your site. The images you provide can be either from your local folder, or URIs.

MODE OPTIONS (CHOOSE ONE FROM TWO):
 --directory -d           will serve every image in the directory
 --file -d                the file contains URIs to the image, separated by lines. will serve images targeted by links contained in the file

REQUIRED OPTION:
 --source-path -p <name>  the source directory/file name provided for above two options`;

const optionDefinitions = [
    { name: 'help',         alias: 'h' },
    { name: 'directory',    alias: 'd' },
    { name: 'file',         alias: 'f'},
    { name: 'source-path',  alias: 'p', type: (fn: string) => new FileDetails(fn) }
];

/* utilities */

class FileDetails {
    filename: string;
    exist: boolean;
    constructor (filename: string) {
        this.filename = filename;
        this.exist = ((fn) => {
            try {
                fs.accessSync(fn, fs.constants.F_OK);
                return true;
            }
            catch {
                return false;
            }
        })(filename);
    }
}

/* global variables */

let outputLog                       = console.log.bind(this);
let exitDueToError: boolean         = false;
let mode: 'folder' | 'uris'         = 'folder';
let path: string                    = 'dummy';
let uris: string[]                  = [];

/* parsing command line arguments */

try {
    const commandArguments = commandArgs(optionDefinitions);
    if (commandArguments === {}) {
        outputLog('Type --help for usage.');
        exitDueToError = true;
    }
    if ('help' in commandArguments) {
        outputLog(usage);
        exitDueToError = true;
    }
    if ((!('directory' in commandArguments || 'file' in commandArguments))
        || ('directory' in commandArguments && 'file' in commandArguments)) {
        outputLog('Requires one and only one of modes "directory" or "file" enabled.')
        exitDueToError = true;
    }
    if (!('source-path' in commandArguments) || commandArguments['source-path'] === null || !commandArguments['source-path'].exist) {
        outputLog('Requires a valid folder/file name.')
        exitDueToError = true;
    }
    if (!exitDueToError) { // otherwise program quits
        mode = 'directory' in commandArguments ? 'folder' : 'uris';
        path = commandArguments['source-path'].filename;
    }
} catch (err) {
    outputLog(err.message);
    exitDueToError = true;
}

if (exitDueToError)
    process.exit(-1);

/* load image uris to memory */

if (mode == 'folder') {
    const isImg = (fn: string) => {
        fn = fn.toLowerCase();
        return fn.endsWith('jpg') || fn.endsWith('jpeg') || fn.endsWith('png') || fn.endsWith('gif') || fn.endsWith('bmp') || fn.endsWith('svg');
    }
    uris = fs.readdirSync(path).filter(isImg).map(fn => path + fn);
} else if (mode == 'uris') {
    uris = fs.readFileSync(path).toString().split('\n');
}
outputLog(uris)

/* start server */



