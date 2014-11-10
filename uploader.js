'use strict';

// create main namespace and expose it to window object
var UPLOADER = {};

// we pass window only for performance reason.
// In case you wonder why not to pass undefined as well, simple because I'm using 5.1
(function (w, u) {

    // settings
    u.settings = {
        allowedFileTypes: /image.jpg|image.png/
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
        notSupportedFile: function (file) {
            alert('I am very limited application and accepting only JPG and PNG files and your files is: ' + file.type);
        },
        clipImage: function (image) {
            var min = Math.min(image.width, image.height);

            (min === image.width) ? image.width = 150 : image.height = 150;
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

            // check if allowed file type
            if (!file.type.match(u.settings.allowedFileTypes)) {
                u.helpers.notSupportedFile(file);
                return;
            };

            reader = new FileReader();

            // read file content
            reader.readAsDataURL(file);

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
        var li = w.document.createElement('li'),
            img = w.document.createElement('img');

        u.helpers.clearFilesList();

        img.src = e.srcElement.result;
        img.alt = file.name;
        img.title = 'Click to see original size';
        img.onload = u.helpers.clipImage(img);

        // append file to files list
        u.nodes.filesList.appendChild(li).appendChild(img);

        // show original size in new window
        img.addEventListener('click', function () {

            // since this is HTML5 not XHTML (with proper type) we can use write
            open().document.write('<img src="' + e.srcElement.result + '" alt="' + file.name + '" />');
        });
    };

    // init
    u.listeners();

}(window, UPLOADER));
