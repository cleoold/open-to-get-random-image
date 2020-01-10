[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg)](http://creativecommons.org/publicdomain/zero/1.0/)

# Random image displayer
A simple server to let a randomly chosen image show up on the page when requested. The image pool can be either provided locally in a folder or by URIs.

### Usage:
#### MODE OPTIONS (CHOOSE ONE FROM TWO):
 `--directory -d`           will serve every image in the directory  
 `--file -d`                the file contains URIs to the image, separated by lines. will serve images targeted by links contained in the file

#### REQUIRED OPTION:
 `--source-path -s <name>`  the source directory/file name provided for above two options

#### OPTIONAL OPTION:
 `--port -p <number>`       specifies a port number. default 8080

### Example
* There is a folder called `rresource` parallel to `server.ts`. The folder  contains `1.jpg`, `2.jpg` and so on. In this case run
  ```sh
  ts-node server.ts -d -s ./rresource 
  ```
* There is a file called `images.txt` in `./rrecource/` which is parallel to `server.ts`. The file contains:
  ```
  https://foo.bar/1.jpg
  https://foo.gar/3.png
  ...
  ```
  In this case run
  ```sh
  ts-node server.ts -f -s ./rresource/images.txt 
  ```
Enter `localhost:8080` in the browser and the page will show up.

### Install
```sh
npm install
```

### Attribution
command-line-args (https://www.npmjs.com/package/command-line-args)  
Express (https://www.npmjs.com/package/express)

