'use strict';

// create main namespace and expose it to window object
var UPLOADER = {};

// we pass window only for performance reason.
// In case you wonder why not to pass undefined as well, simple because I'm using 5.1
(function (w, u) {

    // settings
    u.settings = {
        allowedFileTypes: {
            jpg: {
                mime: 'image/jpg',
                magic: 'ffd8'
            },
            png: {
                mime: 'image/png',
                magic: '8950'
            }
        }
    };

    // cache DOM nodes
    u.nodes = {
        dropZone: w.document.querySelector('#drop-zone'),
        filesList: w.document.querySelector('#files-list'),
        inputFile: w.document.querySelector('#upload')
    };

    // helpers
    u.helpers = {
        clearFilesList: function () {
            u.helpers.clearFilesList = function () {};
            u.nodes.filesList.innerHTML = '';
        },
        notSupportedFile: function () {
            alert('Hi there! I\'m very limited application and accept only JPG and PNG files.');
        },
        // I found this solution to be way faster then using Canvas to generate thumbmail with correct aspect ratio
        clipImage: function (image) {
            var min = Math.min(image.width, image.height);

            (min === image.width) ? image.width = 150 : image.height = 150;
        },
        // Oh boy - it turned out you can easly fake file type, so the magic numbers are solution here
        detectImageType: function (buffer) {
            var dataView,
                hex,
                trueFileType = 'UNSUPPORTED';

            try {
                dataView = new DataView(buffer, 0, 5);
            } catch (ex) {
                u.helpers.notSupportedFile();
                return trueFileType;
                // console.error('Corrupted file.', ex);
            }

            hex = dataView.getUint8(0, true).toString(16) + dataView.getUint8(1, true).toString(16);

            if (hex === u.settings.allowedFileTypes.jpg.magic) {
                trueFileType = u.settings.allowedFileTypes.jpg.mime;
            } else if (hex === u.settings.allowedFileTypes.png.magic) {
                trueFileType = u.settings.allowedFileTypes.png.mime;
            }

            return trueFileType;

        },
        arrayBufferToBase64: function (buffer) {
            var binary = '',
                bytes = new Uint8Array(buffer),
                i,
                l = bytes.byteLength;

            for (i = 0; i < l; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            return window.btoa(binary);
        }
    };

    // add event listeners
    u.listeners = function () {
        u.nodes.dropZone.addEventListener('dragover', u.onDragOver);
        u.nodes.dropZone.addEventListener('dragleave', u.onDragLeave);
        u.nodes.dropZone.addEventListener('drop', u.processFiles);
        u.nodes.inputFile.addEventListener('change', u.processFiles);
    };

    u.onDragOver = function (e) {
        e.preventDefault();
        u.nodes.dropZone.className = 'highlight';
    };

    u.onDragLeave = function (e) {
        e.preventDefault();
        u.nodes.dropZone.className = '';
    };

    // handle files
    u.processFiles = function (e) {
        e.preventDefault();
        u.nodes.dropZone.className = '';

        // list of dropped files || uploaded files
        var files = (e.dataTransfer && e.dataTransfer.files) || e.target.files;

        [].forEach.call(files, function (file) {

            var reader;

            reader = new FileReader();

            // read file content
            reader.readAsArrayBuffer(file);

            // listener for file
            reader.onloadend = (function (file) {
                return function (e) {
                    u.onFileLoad(e, file);
                };
            }(file));

        });

        // required to upload the same file second time
        u.nodes.inputFile.value = '';
    };

    // once file is ready to access append it to files list
    u.onFileLoad = function (e, file) {

        var fileType = u.helpers.detectImageType(e.target.result);

        if (fileType === 'UNSUPPORTED') {
            u.helpers.notSupportedFile();
            return;
        }

        var li = w.document.createElement('li'),
            img = w.document.createElement('img'),
            src = 'data:' + fileType + ';base64,' + u.helpers.arrayBufferToBase64(e.target.result);

        u.helpers.clearFilesList();

        img.src = src;
        img.alt = file.name;
        img.title = 'Click to see original size';
        img.onload = u.helpers.clipImage(img);

        // append file to files list
        u.nodes.filesList.appendChild(li).appendChild(img);

        // show original size in new window
        img.addEventListener('click', function () {

            // since this is HTML5 not XHTML (with proper type) we can use write
            open().document.write('<img src="' + src + '" alt="' + file.name + '" />');
        });
    };

    // init
    u.listeners();

}(window, UPLOADER));
