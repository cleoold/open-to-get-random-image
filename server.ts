import * as fs from 'fs';
import * as path from 'path';

import * as commandArgs from 'command-line-args';

/* usage page */

const usage: string =
`A random image server.
Sends a random image to users when they click your site. The images you provide can be either from your local folder, or URIs.

MODE OPTIONS (CHOOSE ONE FROM TWO):
 --directory -d           will serve every image in the directory
 --file -d                the file contains URIs to the image, separated by lines. will serve images targeted by links contained in the file

REQUIRED OPTION:
 --source-path -s <name>  the source directory/file name provided for above two options

OPTIONAL OPTION:
 --port -p <number>       specifies a port number. default 8080`;

const optionDefinitions = [
    { name: 'help', alias: 'h' },
    { name: 'directory', alias: 'd' },
    { name: 'file', alias: 'f' },
    { name: 'source-path', alias: 's', type: (fn: string) => new FileDetails(fn) },
    { name: 'port', alias: 'p', type: Number }
];

/* utilities */

class FileDetails {
    filename: string;
    exist: boolean;
    constructor(filename: string) {
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

function fmtTime(): string {
    const time = new Date();
    return `[${time.getMonth()+1}.${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}]`;
}

/* global variables */

let outputLog                         = console.log.bind(this);
let outputErr                         = console.error.bind(this);
let exitDueToError: boolean           = false;
let mode: 'folder' | 'uris'           = 'folder';
let servePath: string                 = '/dummy';
const mockServePath: string           = '/rimages'; /* for static chosen image resource mock path, only used in directory mode */
let imgUris: string[]                 = [];

let port: number                      = 8080;

/* parsing command line arguments */

try {
    const commandArguments = commandArgs(optionDefinitions);
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
        outputLog('--source-path: Requires a valid folder/file name.')
        exitDueToError = true;
    }
    if (!exitDueToError) { // otherwise program quits
        mode = 'directory' in commandArguments ? 'folder' : 'uris';
        servePath = commandArguments['source-path'].filename;
    }
    if ('port' in commandArguments) {
        if (commandArguments['port'] === null) {
            outputLog('--port: Requires valid port number.');
            exitDueToError = true;
        } else {
            port = commandArguments['port'];
        }
    }
    if (Object.entries(commandArguments).length === 0 && commandArguments.constructor === Object) {
        outputLog('Type --help for usage.');
        exitDueToError = true;
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
    imgUris = fs.readdirSync(servePath).filter(isImg).map(fn => path.join(mockServePath, fn));
} else if (mode == 'uris') {
    imgUris = fs.readFileSync(servePath).toString().split('\n');
}

/* load html template to memory */

const imgSiteTemplateString = fs.readFileSync('template.htm').toString();

/* start server */

import * as express from 'express';

const app = express();

if (mode == 'folder')
    app.use(mockServePath, express.static(path.join(__dirname, servePath)));
// ^ if required to use other kind of static resources add other entries similar

app.get('/', (req, res) => {
    let chosen = imgUris[Math.floor(Math.random() * imgUris.length)];
    if (mode == 'folder')
        chosen = '.' + chosen;
    res.set('Content-Type', 'text/html')
        .send(Buffer.from(imgSiteTemplateString
                .replace('%{randomized-image}', chosen)))
    outputLog(`${fmtTime()} Processed index request image chosen: ${chosen}`);
})

app.get('*', (req, res) => {
    res.status(404).send('what???');
    outputLog(`${fmtTime()} Processed 404 uri: ${req.url}`);
});

app.listen(port, () => outputLog(`App listening on port ${port}!`))

