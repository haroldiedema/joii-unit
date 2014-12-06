/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    // Namespace declaration
    var ns = namespace('Loader');

    /**
     * JOII-Unit Reporter suitable for a NodeJS environment.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.NodeLoader = Class({ 'implements' : JOII.Unit.LoaderInterface }, {

        'protected object  files'    : [],
        'protected object source'    : {},
        'protected object reporter'  : null,
        'protected string last_file' : '',

        /**
         * Constructor
         */
        'private __construct' : function (dep_files, test_files, reporter) {
            var i, f = [];
            for (i in dep_files) { f.push(dep_files[i]); }
            for (i in test_files) { f.push(test_files[i]); }

            this.setFiles(f);
            this.setReporter(reporter);
        },

        /**
         * @see JOII.Unit.LoaderInterface.load()
         */
        'public function load' : function (callback) {
            // Is there anything to load?
            if (this.files.length === 0) {
                this.reporter.critical('No test files registered.');
                return;
            }

            // Load files
            var file, src, i, loaded = [], fs = require('fs');
            for (i in this.files) {
                file = this.absPath(this.files[i]);
                this.last_file = this.files[i];
                this.reporter.debug('NodeLoader::load - Loading file ' + this.files[i] + ' (' + file + ')');
                this.source[this.files[i]] = fs.readFileSync(file, 'utf8');
                require(file);
                loaded.push(this.files[i]);
            }

            callback(loaded);
        },

        'public function getLastLoadedFile' : function () {
            return this.last_file;
        },

        /**
         * Make an absolute path from relative
         *
         * @param string file
         * @return string
         */
        'private function absPath' : function (file) {
            if (file.charAt(0) != '/') {
                file = require('path').resolve(process.cwd(), file);
            }

            return file;
        },

        /**
         * Returns the contents of the given file as text.
         *
         * @param string file
         * @return string
         */
        'public getSource' : function(file)
        {
            if (typeof this.source[file] === 'undefined') {
                throw new Error('Source code for file "' + file + '" is unavailable.');
            }
            return this.source[file];
        }
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
