/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, Class, undefined) {

    /**
     * Bootstrapper
     */
    g.JOII.Unit = Class({

        /**
         * Configuration object to be passed to the DI container.
         */
        'private object config' : {
            'parameters' : {
                'environment'  : undefined, // Overwritten by Unit.
                'loader'       : undefined, // Loader class
                'reporter'     : undefined, // Reporter class
                'dependencies' : [],        // An array of dependency files
                'tests'        : [],        // An array of test files
                'verbose'      : true       // Use verbose output (for debugging purposes)
            },
            'services'   : {
                // JOII.Unit.ReporterInterface
                'joii.unit.reporter' : {
                    'class'     : undefined, // Manually specified
                    'arguments' : ['%environment%', '%verbose%']
                },
                // JOII.Unit.LoaderInterface
                'joii.unit.loader' : {
                    'class'     : undefined, // Manually specified
                    'arguments' : ['%dependencies%', '%tests%', '@joii.unit.reporter']
                },
                // JOII.Unit.AnnotationReader.AnnotationReader
                'joii.unit.annotation_reader' : {
                    'class'     : 'JOII.Unit.AnnotationReader.AnnotationReader',
                    'arguments' : [
                        '@joii.unit.reporter',
                        '@joii.unit.loader'
                    ]
                },
                // JOII.Unit.TestCaseManager
                'joii.unit.test_manager' : {
                    'class'     : 'JOII.Unit.TestCaseManager',
                    'arguments' : [
                        '@joii.unit.annotation_reader',
                        '@joii.unit.reporter',
                        '@joii.unit.loader'
                    ]
                }
            }
        },

        /**
         * @var JOII.Unit.DependencyInjection.Container
         */
        'public immutable object container' : null,

        /**
         * Constructor
         *
         * @param object parameters
         * @param object services (optional)
         */
        'private __construct' : function (parameters, services) {

            // First and foremost, JOII.Unit may only exist once.
            if (typeof JOII.Unit.instance !== 'undefined') {
                throw 'Another instance of JOII.Unit is already active!';
            }

            // Register this instance.
            JOII.Unit.instance = this.__api__;

            // Arguments are optional.
            parameters = parameters = parameters || {};
            services   = services   = services   || {};

            // Merge the given options and services with the defaults
            var e = JOII.Compat.extend,
                c = this.config,
                b;

            this.config.parameters = e(true, c.parameters, parameters);
            this.config.services   = e(true, c.services, services);

            // Store the environment as a parameters, usable by services.
            this.config.parameters.environment = this.determineEnvironemnt();

            // If no reporter was specified, we'll define one.
            var reporter_class = this.config.parameters.reporter;
            if (reporter_class === undefined) {
                e = this.config.parameters.environment;
                e = e.charAt(0).toUpperCase() + e.slice(1) + 'Reporter';
                this.config.services['joii.unit.reporter']['class'] = 'JOII.Unit.Reporter.' + e;
            } else {
                this.config.services['joii.unit.reporter']['class'] = reporter_class;
            }

            // If no loader was specified, we'll create one.
            var loader_class = this.config.parameters.loader;
            if (loader_class === undefined) {
                e = this.config.parameters.environment;
                e = e.charAt(0).toUpperCase() + e.slice(1) + 'Loader';
                this.config.services['joii.unit.loader']['class'] = 'JOII.Unit.Loader.' + e;
            } else {
                this.config.services['joii.unit.loader']['class'] = loader_class;
            }

            // Create the service container
            var di = new JOII.Unit.DependencyInjection.ServiceContainer();
            di.loadConfiguration(this.config);
            this.container = di.getContainer();

            // Validate and initialize the reporter.
            var reporter = this.container.get('joii.unit.reporter');
            if (!JOII.isInstance(reporter) || !reporter.instanceOf(JOII.Unit.ReporterInterface)) {
                throw new Error('Reporter is not an instance of JOII.Unit.ReporterInterface');
            }
            reporter.init();

            var loader = this.container.get('joii.unit.loader');

            loader.load(JOII.Compat.Bind(this.runTests, this));

        },

        'private function runTests' : function()
        {
            var tests = this.container.get('joii.unit.test_manager').getTests(),
                result, testcase, filename, name, summary = {
                testcases  : [],
                assertions : { passed : 0, failed : 0, total : 0 },
                testcount  : 0,
                runtime    : 0
            };

            for (var i in tests) {
                testcase = tests[i].getTestCase();
                result   = tests[i].run();
                filename = testcase.filename;
                name     = testcase.reflector.getName();

                if (typeof summary.testcases[filename] === 'undefined') {
                    summary.testcases[filename] = {};
                }
                summary.testcases[filename][name] = result;
                summary.assertions.passed += result.assertions.passed;
                summary.assertions.failed += result.assertions.failed;
                summary.assertions.total  += (result.assertions.passed + result.assertions.failed);
                summary.testcount ++;
            }

            this.container.get('joii.unit.reporter').reportSummary(summary);
        },

        /**
         * Determine the environment and return it as a string.
         *
         * @return string
         */
        'private function determineEnvironemnt' : function () {
            if (typeof window !== 'undefined') {
                return 'browser';
            }
            if (typeof global !== 'undefined' && module && require) {
                return 'node';
            }
            throw new Error('JOII-Unit is unable to determine the current environment.');
        }
    });

    /**
     * Declare a namespace if it doesn't exist already.
     *
     * @param string ns
     * @return object
     */
    g.JOII.Unit.Namespace = function(identifier) {
        var ns = g.JOII.Unit;

        if (identifier !== '') {
            var parts = identifier.split('.');
            for (var i = 0; i < parts.length; i++) {
                if (!ns[parts[i]]) {
                    ns[parts[i]] = {};
                }
                ns = ns[parts[i]];
            }
        }

        return ns;
    }

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
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
    var ns = namespace('');

    ns.AbstractAnnotation = Class({ 'abstract': true }, {

        'final public immutable name'          : null,
        'final protected immutable definition' : null,
        'final protected immutable method'     : null,
        'final protected immutable data'       : null,

        'final private __construct' : function (definition, method, name, data) {
            this.definition = definition;
            this.method     = method;
            this.name       = name;
            this.data       = data;
        },

        'final public function toString' : function () {
            return '[Annotation ' + this.getName() + ': ' + this.getData() + ']';
        },

        /**
         * Returns true if this Annotation accepts the given name.
         *
         * @param string name
         * @return bool
         */
        'abstract public function accepts' : function (name) {}
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Interface, undefined) {

    /**
     * This interface defines all methods a Loader must implement.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    namespace('').LoaderInterface = Interface('JOII.Unit.Loader', {

        /**
         * Constructor
         *
         * @param array dep_files  List of dependency files
         * @param array test_files List of test files containing TestCases
         * @param JOII.Unit.ReporterInterface reporter
         */
        'private function __construct' : function (dep_files, test_files, reporter) {},

        /**
         * Loads all the files specified through the constructor. Once the
         * loading process is finished, the given callback is executed.
         *
         * @param function callback
         */
        'public function load' : function (callback) {},

        /**
         * Returns the name of the last loaded file.
         *
         * The variable needs to be defined _before_ the file is actually
         * loaded. The TestCaseManager uses the return value of this method to
         * identifier which TestCase belongs to wich file in order to use the
         * AnnotationReader.
         *
         * @return string
         */
        'public function getLastLoadedFile' : function() {},

        /**
         * Returns the source of the given file.
         *
         * @param string file
         * @return string
         */
        'public function getSource' : function (file) {}
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.InterfaceBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Interface, undefined) {

    /**
     * This interface defines all methods a Reporter must implement.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    namespace('').ReporterInterface = Interface('JOII.Unit.Reporter', {

        /**
         * Constructor
         *
         * @param string  env
         * @param boolean verbose
         */
        'private __construct' : function (env, verbose) {},

        /**
         * Initializes the reporter.
         *
         * Use this method to show a welcome screen, print a header or build
         * the skeleton of a webpage.
         */
        'public function init' : function () {},

        /**
         * Reports a passed assertion.
         *
         * @param JOII.Unit.TestCase testcase
         * @param string             method
         * @param string             message
         * @param mixed              actual
         * @param mixed              expected
         */
        'public function reportAssertPass' : function (testcase, method, message, actual, expected) {},

        /**
         * Reports a failed assertion.
         *
         * @param JOII.Unit.TestCase testcase
         * @param string             method
         * @param string             message
         * @param mixed              actual
         * @param mixed              expected
         */
        'public function reportAssertFail' : function (testcase, method, message, actual, expected) {},


        /**
         * Reports a critical error message.
         *
         * Exception messages are usually rendered with this.
         * This will terminate the process.
         *
         * @param string message.
         */
        'public function critical' : function (message) {},

        /**
         * Reports an error message. Multiple error messages may be displayed.
         *
         * @param string message
         */
        'public function error' : function (message) {},

        /**
         * Reports a debug message.
         *
         * @param string message
         */
        'public function debug' : function (message) {}

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.InterfaceBuilder));

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
    var ns = namespace('');

    /**
     * JOII-Unit Reporter suitable for a NodeJS environment.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.TestCaseManager = Class({

        'private annotation_reader' : null,
        'private reporter'          : null,
        'private loader'            : null,
        'private tests'             : [],

        'private __construct' : function (annotation_reader, reporter, loader) {
            this.annotation_reader = annotation_reader;
            this.reporter          = reporter;
            this.loader            = loader;
        },

        'public function addTest' : function(testcase) {
            testcase.reflector   = new JOII.Reflection.Class(testcase);
            testcase.filename    = this.loader.getLastLoadedFile();
            testcase.annotations = this.annotation_reader.get(testcase);

            // Build a list of all testable method names
            var methods = [], m = testcase.reflector.getMethods();
            for (var i in m) {
                if (m[i].isPublic() && m[i].getName().substr(0, 4) === 'test') {
                    methods.push(m[i].getName());
                }
            }
            testcase.methods = methods;
            this.tests.push(new JOII.Unit.TestCase.Process(testcase, this.reporter));
            this.reporter.debug('TestCaseManager::addTest - TestCase: "' + testcase.reflector.getName() + '" (from: ' + testcase.filename + '), ' + methods.length + ' test(s).');
        },

        'public function getTests' : function() {
            return this.tests;
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('AnnotationReader');

    /**
     * JOII-Unit AnnotationMethod
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AnnotationMethod = Class({

        'private string method'      : null,
        'private object annotations' : null,

        /**
         * @param object annotations
         */
        'private __construct' : function (method, annotations) {
            this.annotations = annotations || [];
            this.method      = method;
        },

        /**
         * Returns the annotation by the given name or throws an Error if
         * there is no such annotation.
         *
         * @param string name
         * @return bool
         */
        'public function get' : function (name) {
            for (var i in this.annotations) {
                if (this.annotations[i].instanceOf(name) ||
                    this.annotations[i].getName() === name) {
                    return this.annotations[i];
                }
            }
            throw new Error('Annotation "' + name + '" not found on method "' + this.method + '"');
        },

        /**
         * Returns true if this method has an annotation by the given name.
         *
         * @param string name
         * @return bool
         */
        'public function has' : function (name) {
            try {
                this.get(name);
                return true;
            } catch (e) {
                return false;
            }
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('AnnotationReader');

    /**
     * JOII-Unit AnnotationParser
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AnnotationParser = Class({

        'private number pointer' : 0,
        'private string source'  : '',
        'public annotations'     : {},

        /**
         * @param string filename
         * @param string scope
         */
        'private __construct' : function (source, scope) {
            // Replace ' with ", then remove subsequent ".
            this.source = this.trim(source.replace(/\'/g, '"').replace(/\"+/g, '"'));

            // Do something dirty... 'Guess' the scope starting point and reset
            // the pointer.
            scope = '"' + scope.substr(0, scope.length - 4); // Remove "Test".
            var start = this.seek(scope);
            var end   = this.seek('JOII.Unit.TestCase');
            end = (end === false ? this.source.length : end);

            this.source  = this.source.substring(start, end);
            this.pointer = 0;

            var doc_a, doc_b, fn;
            while (false !== (this.seek('/*'))) {
                doc_a = this.pointer;
                doc_b = this.seek('*/');
                fn    = this.seek(':');

                var docblock    = this.parseDocblock(this.source.substring(doc_a, doc_b));
                var declaration = this.parseDeclaration(this.source.substring(doc_b + 2, fn));

                this.annotations[declaration] = docblock;
            }
        },

        /**
         * Parses a declaration line.
         */
        'private function parseDeclaration' : function (str) {
            str = str.replace(/\"/g, '');
            str = this.trim(str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' '));
            var tmp = str.split(' ');
            return tmp[tmp.length - 1];
        },

        /**
         * Parses a dockblock.
         */
        'private function parseDocblock' : function (str) {
            var buff = [], index = 0, i, q = false, c;
            str = this.trim(str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' '));

            for (i = 0; i < str.length; i++) {
                c = str.charAt(i);

                if (c === '"' && q === false) {
                    q = true;
                } else if (c === '"' && q === true) {
                    q = false;
                }

                if (q === false && c === '*') {
                    continue;
                }

                if (c !== '@') {
                    if (typeof buff[index] === 'undefined') { buff[index] = ''; }
                    buff[index] += c;
                } else if (q === false && c === '@') {
                    buff[index] = this.trim(buff[index]);
                    index++;
                }
            }
            buff.shift();
            return buff;
        },

        /**
         * Moves the pointer until {str} is reached and returns the new pointer
         * location if {str} is actually found, false otherwise.
         *
         * @param string str
         * @return number|false
         */
        'private function seek' : function (str) {
            for (var i = this.pointer - 1; i < this.source.length; i++) {
                var fc = 0;
                for (var s = 0; s < str.length; s++) {
                    if (i + s > this.source.length) {
                        return false;
                    }
                    if (str.charAt(s) === this.source.charAt(i + s)) {
                        fc++;
                    } else {
                        break;
                    }
                }
                if (fc === str.length) {
                    this.pointer = i;
                    return this.pointer;
                }
            }
            return false;
        },

        'private trim' : function(str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        }
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('AnnotationReader');

    /**
     * JOII-Unit AnnotationReader (service)
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AnnotationReader = Class({

        'private object cache'                : {},
        'private JOII.Unit.Reporter reporter' : null,
        'private JOII.Unit.Loader loader'     : null,

        /**
         * @param JOII.Unit.Reporter reporter
         * @param JOII.Unit.Loader   loader
         */
        'private __construct' : function(reporter, loader) {
            this.reporter = reporter;
            this.loader   = loader;
        },

        /**
         * Returns an Annotations object for the given filename and scope.
         *
         * @param string filename
         * @param string scope
         * @return Annotations
         */
        'public function get' : function (definition) {

            var filename = definition.filename,
                scope    = definition.reflector.getName(),
                cache_id = filename + ':' + scope;

            // Do we have a cached version of this and scope?
            if (typeof this.cache[cache_id] !== 'undefined') {
                return this.cache[cache_id];
            }

            var r = JOII.Unit.AnnotationReader.AnnotationParser,
                a = JOII.Unit.AnnotationReader.Annotations,
                p = new r(this.loader.getSource(filename), scope);

            this.reporter.debug('AnnotationReader::get - Parsing annotations for ' + filename + ', scope: ' + scope);
            this.cache[cache_id] = new a(this.hydrateAnnotations(definition, p));

            return this.cache[cache_id];
        },

        /**
         * Returns a hydrated list of annotation objects indexed by method.
         *
         * @param AnnotationParser parser
         */
        'private hydrateAnnotations' : function(definition, parser) {
            var col = parser.getAnnotations(), method, result = {};

            for (method in col) {
                result[method] = [];
                for (i in col[method]) {
                    result[method].push(this.parseAnnotation(definition, method, col[method][i]));
                }
            }

            return result;
        },

        'private parseAnnotation' : function(definition, method, data) {
            var tmp = data.split(' '),
                name = tmp[0],
                data = '';

            tmp.shift(); data = tmp.join(' ');

            for (var i in JOII.Unit.Annotation) {
                if (typeof JOII.Unit.Annotation[i] !== 'function') {
                    continue;
                }
                var a = new JOII.Unit.Annotation[i](definition, method, name, data);
                if (typeof a.accepts === 'function' && a.accepts(name)) {
                    a.init();
                    return a;
                }
                delete a;
            }

            throw new Error('Unknown Annotation: "' + name + '"');
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('AnnotationReader');

    /**
     * JOII-Unit Annotations
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Annotations = Class({

        'private object annotations' : null,
        'private object cache'       : {},

        /**
         * @param JOII.Unit.AnnotationReader.AnnotationParser parser
         */
        'private __construct' : function (annotations) {
            this.annotations = annotations;
        },

        'public function getMethod' : function(method) {
            if (typeof this.cache[method] === 'undefined') {
                var m = JOII.Unit.AnnotationReader.AnnotationMethod,
                    p = this.annotations[method];
                this.cache[method] = new m(method, p);
            }

            return this.cache[method];
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Interface, undefined) {

    var ns = namespace('Annotation.Behavior');

    /**
     * When this interface is implemented on an annotation, the annotation will
     * be responsible for executing the test.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.ExceptionBehavior = Interface('UAB_Exception', {

        /**
         * Returns true if the given Error matches the expected exception.
         *
         * @param object|string e
         * @return bool
         */
        'public function isValid' : function (e) {},

        /**
         * Returns the message from the given Error object.
         * @return string
         */
        'public function getExceptionString' : function (e) {},

        /**
         * Returns the expected exception.
         * @return string
         */
        'public function getExpectedExceptionString' : function () {}

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.InterfaceBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Interface, undefined) {

    var ns = namespace('Annotation.Behavior');

    /**
     * When this interface is implemented on an annotation, the annotation will
     * be responsible for executing the test.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.TestExecutorBehavior = Interface('UAB_TestExecutor', {

        /**
         * Executes the function passed in argument #1
         */
        'public function execute' : function (fn) {}

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.InterfaceBuilder));

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
    var ns = namespace('Annotation');

    ns.DataProvider = Class('JOII.Unit.Annotation.DataProvider', {
        'extends'    : JOII.Unit.AbstractAnnotation,
        'implements' : ['UAB_TestExecutor']
    }, {

        'private string provider' : null,

        /** @override */
        'public function accepts' : function(name) {
            return name.toLowerCase() === 'dataprovider';
        },

        /** @override */
        'public function init' : function() {
            this.provider = JSON.parse(this.getData());
            if (!this.getDefinition().reflector.hasMethod(this.provider)) {
                throw new Error('DataProvider \'' + this.provider + '\' for method \'' + this.getMethod() + '\' in TestCase \'' + this.getDefinition().reflector.getName() + '\' does not exist.');
            }
        },

        /**
         * @see UA_TestExecutorBehavior.execute
         */
        'public function execute' : function(fn) {
            var inst     = new this.definition;
            var args_col = inst[this.provider]();

            for (var i in args_col) {
                fn.apply(undefined, args_col[i]);
            }
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
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
    var ns = namespace('Annotation');

    ns.ExpectedException = Class('JOII.Unit.Annotation.ExpectedException', {
        'extends'    : JOII.Unit.AbstractAnnotation,
        'implements' : ['UAB_Exception']
    }, {

        /** @override */
        'public function accepts' : function(name) {
            return name.toLowerCase() === 'expectedexception';
        },

        /** @override */
        'public function init' : function() {
            var message = JSON.parse(this.getData());
        },

        /**
         * @see UAB_Exception.isValid
         */
        'public function isValid' : function(e) {
            return this.getExceptionString(e) === this.getExpectedExceptionString();
        },

        /**
         * @see UAB_Exception.getExceptionString
         */
        'public function getExceptionString' : function (e) {
            if (typeof e === 'object') {
                return e.message;
            }
            return e;
        },

        /**
         * @see UAB_Exception.getExpectedExceptionString
         */
        'public function getExpectedExceptionString' : function () {
            return JSON.parse(this.getData());
        }
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
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
    var ns = namespace('Reporter');

    /**
     * JOII-Unit Reporter suitable for a NodeJS environment.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.NodeReporter = Class({ 'implements' : JOII.Unit.ReporterInterface }, {

        'private boolean verbose' : false,
        'private object output'   : null,
        'private object color'    : null,

        'private number lc' : 0,
        'private number ac' : 0,

        /**
         * Constructor
         */
        'private __construct' : function (env, verbose) {
            if (env !== 'node') {
                throw new Error('NodeReporter requires a NodeJS environment!');
            }

            this.verbose = verbose;
            this.output  = process.stdout;
            this.color   = require('cli-color');
        },

        /**
         * @see JOII.Unit.ReporterInterface.init()
         */
        'public function init' : function () {
            // Load package.json to build a nice "banner".
            var title, subtitle;
            try {
                var p    = JSON.parse(require('fs').readFileSync(__dirname + '/../package.json', 'utf8'));
                title    = this.color.cyan.bold(p.name) + this.color.cyan(' (module) ') + this.color.cyan.bold(p.version) + ', by ' + p.author + '\n',
                subtitle = p.homepage + '\n\n';
            } catch (e) {
                // Probably unable to load package.json.
                title    = this.color.cyan.bold('joii-unit') + this.color.cyan(' (standalone)') + ', by Harold Iedema\n';
                subtitle = 'https://github.com/haroldiedema/joii-unit/\n\n';
            }
            process.stdout.write('\n' + title + subtitle);
        },

        /**
         * @see JOII.Unit.ReporterInterface.reportAssertPass
         */
        'public function reportAssertPass' : function (testcase, method, message, actual, expected) {
            this.output.write('.');
            this.lc ++;
            this.ac ++;
            if (this.lc > 70) {
                this.output.write(' (' + this.ac + ')\n');
                this.lc = 0;
            }
        },

        /**
         * @see JOII.Unit.ReporterInterface.reportAssertFail
         */
        'public function reportAssertFail' : function (testcase, method, message, actual, expected) {
            this.output.write(this.color.bgRed.white.bold('F'));
            this.lc ++;
            this.ac ++;
            if (this.lc > 70) {
                this.output.write(' (' + this.ac + ')\n');
                this.lc = 0;
            }
        },

        'public function reportSummary' : function(report)
        {
            this.output.write('\n\n');

            // Draw a nice header indicating some tests failed or not.
            if (report.assertions.failed > 0) {
                this.output.write(this.color.bgRed.white.bold('FAILURES! Tests: ' + report.testcount + ', Assertions: ' + report.assertions.total + ', Failures: ' + report.assertions.failed) + '\n\n');
                this.reportSummaryFailed(report);
            } else {
                this.output.write(this.color.bgGreen.black('OK (' + report.testcount + ' tests, ' + report.assertions.total + ' assertions)') + '\n\n');
            }
        },

        'private function reportSummaryFailed' : function(report) {

            var file, testcase_name, test_name, tests, method, i, res, trace;

            for (file in report.testcases) {
                for (testcase_name in report.testcases[file]) {
                    tests = report.testcases[file][testcase_name].tests;
                    for (method in tests) {
                        for (i in tests[method]) {
                            if (tests[method][i].passed !== false) {
                                continue;
                            }

                            res   = tests[method][i];
                            trace = res.trace.split('\n');

                            this.output.write(file + ' (' + testcase_name + ')\n');
                            this.output.write('    Assertion : "' + res.message + '"\n');
                            this.output.write('    Expected  : ' + JSON.stringify(res.expected) + "\n");
                            this.output.write('    Actual    : ' + JSON.stringify(res.actual) + "\n");
                            for (var t in trace) {
                                trace[t] = trace[t].replace(/\\/g, '/');
                                if (trace[t].indexOf(file) !== -1 && trace[t].indexOf(testcase_name) !== -1) {
                                    this.output.write(this.color.blackBright(trace[t]) + "\n");
                                }
                            }
                            this.output.write("\n");
                        }
                    }
                }
            }
        },

        /**
         * @see JOII.Unit.ReporterInterface.critical()
         */
        'public function critical' : function (message) {
            process.stdout.write('\n' + this.color.bgRed.white.bold('CRITICAL: ' + message) + '\n\n');
        },

        /**
         * @see JOII.Unit.ReporterInterface.error()
         */
        'public function error' : function (message) {
            process.stdout.write('\n' + this.color.bgRed.white.bold('ERROR: ' + message) + '\n\n');
        },

        /**
         * @see JOII.Unit.ReporterInterface.debug()
         */
        'public function debug' : function (message) {
            if (!this.verbose) {
                return;
            }
            process.stdout.write(this.color.blackBright(message) + '\n');
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    var ns = namespace('DependencyInjection');

    /**
     * Dependency Injection Container
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Container = Class({

        'private object definitions'   : {},
        'private object parameters'    : {},
        'private object loading'       : {},
        'private object passes'        : [],
        'private boolean is_frozen'    : false,
        'private boolean is_compiling' : false,

        'private __construct': function() {
            return this.api;
        },

        /**
         * Creates a new Definition based on the passed name and function
         * and returns it.
         *
         * @param string name
         * @param mixed fn Function or string referencing the function.
         */
        'public function register': function(name, fn)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions[name] = new ns.Definition(fn);
            return this.definitions[name];
        },

        /**
         * Adds a CompilerPass to this container.
         *
         * A compiler pass must have a compile() method which accepts the
         * Container as its one and only argument. The CompilerPass may
         * add, alter or remove service definitions as it sees fit.
         *
         * @param CompilerPass compiler_pass
         */
        'public function addCompilerPass': function(compiler_pass)
        {
            if (typeof(compiler_pass) === 'function') {
                compiler_pass = new compiler_pass();
            }
            if (typeof(compiler_pass.compile) !== 'function') {
                throw new Error('The CompilerPass doesn\'t have a compile function.');
            }
            this.passes.push(compiler_pass);
        },

        /**
         * Runs all compiler passes. After this process is complete, the
         * container is marked as frozen and no more definitions may be
         * added.
         */
        'public function compile': function()
        {
            if (this.is_compiling) {
                throw new Error('The container is already compiling.');
            }
            this.is_compiling = true;
            if (this.is_frozen) {
                throw new Error('Unable to compile a container which is already compiled.');
            }
            for (var i in this.passes) {
                this.passes[i].compile(this);
            }
            this.is_compiling = false;
            this.is_frozen = true;
        },

        /**
         * Returns true if this container is already compiled.
         *
         * @return bool
         */
        'public function isFrozen': function()
        {
            return this.is_frozen;
        },

        /**
         * Returns the service with the associated id.
         *
         * @param string id
         * @return Object
         */
        'public function get': function(id)
        {
            // Compile the container first if it hasn't been compiled yet.
            if (!this.is_frozen) {
                this.compile();
            }

            if (typeof(this.definitions[id]) === 'undefined') {
                throw new Error('Service ' + id + ' does not exist.');
            }
            var definition = this.definitions[id];

            // Do we already have an instance of this definition?
            if (definition.hasInstance()) {
                return definition.getInstance();
            }

            // Circular reference check
            if (this.loading[id] === true) {
                throw new Error('Service ' + id + ' has a circular reference to itself.');
            }
            this.loading[id] = true;

            // Create the service
            var service = this.createService(definition);

            // Remove the circular reference check
            delete this.loading[id];
            return service;
        },

        /**
         * Initializes the service definition and returns its function
         * instance.
         *
         * @access private
         * @return Object
         */
        'public function createService': function(definition)
        {
            if (definition.hasInstance()) {
                throw new Error('Attempt to create a service that already has an instance.');
            }

            // Build up an array of arguments to pass to the constructor.
            var c_args = this.getParameterArray(definition.getArguments());

            // Construct function to use '.apply' on 'new' objects.
            var construct = function(c, args) {
                var cc = function() { return c.apply(this, args); };
                cc.prototype = c.prototype; return new cc();
            };

            var fn       = definition.getFunction(),
                instance = construct(fn, c_args);

            definition.setInstance(instance);

            var calls = definition.getMethodCalls();
            for (var i in calls) {
                if (!calls.hasOwnProperty(i)) {
                    continue;
                }
                var method = calls[i][0];
                var args   = this.getParameterArray(calls[i][1] || []);
                if (typeof(instance[method]) !== 'function') {
                    throw new Error('Method ' + method + ' does not exist.');
                }
                instance[method].apply(instance, args);
            }
            return instance;
        },

        'public function getServiceIds': function()
        {
            var result = [];
            for (var i in this.definitions) {
                if (this.definitions.hasOwnProperty(i)) {
                    result.push(i);
                }
            }
            return result;
        },

        /**
         * Sets the service definitions.
         *
         * @param DependencyInjection.Definition[] An array of Definitions.
         * @return DependencyInjection.Container
         */
        'public function setDefinitions': function(definitions)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions = {};
            this.addDefinitions(definitions);
            return this.api;
        },

        /**
         * Adds the service definitions.
         *
         * @param Definition[] definitions An array of service definitions.
         * @return DependencyInjection.Container
         */
        'public function addDefinitions': function(definitions)
        {
            for (var i in definitions) {
                if (definitions.hasOwnProperty(i)) {
                    var def = definitions[i];
                    this.setDefinition(i, def);
                }
            }
            return this.api;
        },

        /**
         * Sets a service definition.
         *
         * @param string id The id of the service
         * @param DepedencyInjection.Definition definition
         * @return DepedencyInjection.Container
         */
        'public function setDefinition': function(id, definition)
        {
            if (this.is_frozen) {
                throw new Error('Unable to register a new Definition on a frozen container.');
            }
            this.definitions[id] = definition;
            return this.api;
        },

        /**
         * Returns true if a service definition exists under the
         * given identifier.
         *
         * @return bool
         */
        'public function hasDefinition': function(id)
        {
            return typeof(this.definitions[id]) !== 'undefined';
        },

        /**
         * Gets a service definition.
         *
         * @param string id The service identifier
         * @return DependencyInjection.Definition
         */
        'public function getDefinition': function(id)
        {
            if (typeof(this.definitions[id]) === 'undefined') {
                throw new Error('The service definition ' + id + ' does not exist.');
            }
            return this.definitions[id];
        },

        /**
         * Returns an array of tag attributes indexed by service id.
         *
         * @param string name
         * @return array
         */
        'public function findTaggedServiceIds': function(name)
        {
            var result = {};
            for (var i in this.definitions) {
                if (!this.definitions.hasOwnProperty(i)) {
                    continue;
                }
                if (this.definitions[i].hasTag(name)) {
                    result[i] = this.definitions[i].getTag(name);
                }
            }
            return result;
        },

        /**
         * Sets the parameters array.
         *
         * @param  Object parameters
         * @return DepedencyInjection.Container
         */
        'public function setParameters': function(parameters)
        {
            if (this.is_frozen) {
                throw new Error('Unable to update parameters on a frozen container.');
            }
            this.parameters = parameters;
            return this.api;
        },

        /**
         * Sets a parameter.
         *
         * @param string name
         * @param mixed value
         * @return DepedencyInjection.Container
         */
        'public function setParameter': function(name, value)
        {
            if (this.is_frozen) {
                throw new Error('Unable to update parameters on a frozen container.');
            }
            this.parameters[name] = value;
            return this.api;
        },

        /**
         * Returns true if a parameter with the given name exists.
         *
         * @param string name
         * @return bool
         */
        'public function hasParameter': function(name)
        {
            return typeof(this.parameters[name]) !== 'undefined';
        },

        /**
         * Returns the value of the parameter with the given name.
         *
         * @param string name
         * @return mixed
         */
        'public function getParameter': function(name)
        {
            if (typeof(this.parameters[name]) !== 'undefined') {
                return this.parameters[name];
            }
            throw new Error('Parameter ' + name + ' does not exist.');
        },

        /**
         * Returns a parsed parameter array.
         *
         * @access private
         * @param array arr
         * @return arr
         */
        'private function getParameterArray': function(arr)
        {
            var args = [];
            for (var i in arr) {
                var arg = arr[i];
                if (typeof(arg) === 'string') {
                    arg = this.resolveParameter(arg);
                }
                args.push(arg);
            }
            return args;
        },

        /**
         * Resolves a parameter.
         *
         * If the value starts with an @, a service is referenced.
         * If the value is omitted with %, a parameter is referenced.
         *
         * @access private
         * @param string value
         * @return mixed
         */
        'private function resolveParameter': function(value)
        {
            if (typeof(value) !== 'string') {
                return value;
            }

            if (value.charAt(0) === '@') {
                return this.get(value.slice(1, value.length));
            }

            if (value.charAt(0) === '%' && value.charAt(value.length - 1) === '%') {
                return this.getParameter(value.slice(1, value.length - 1));
            }

            return value;
        }
    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    var ns = namespace('DependencyInjection');

    /**
     * Dependency Injection Definition
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Definition = Class({

        'private object name'      : null,
        'private object fn'        : null,
        'private object instance'  : null,
        'private object api'       : null,
        'private object is_public' : true,
        'private object args'      : [],
        'private object calls'     : [],
        'private object tags'      : {},

        /**
         * @param string name The name of this definition.
         * @param mixed  fn   Function or string referencing the function.
         */
        'private __construct': function(fn)
        {
            if (typeof(fn) !== 'function') {
                this.fn = this.findFunctionFromString(fn);
            } else {
                this.fn = fn;
            }
        },

        /**
         * Adds an argument to pass to the service constructor.
         *
         * @param mixed value
         * @return DependencyInjection.Definition
         */
        'public function addArgument': function(argument)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.args.push(argument);
            return this;
        },

        /**
         * Sets the arguments to pass to the service constructor.
         *
         * @param mixed value
         * @return DependencyInjection.Definition
         */
        'public function setArguments': function(args)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.args = args;
            return this;
        },

        /**
         * Gets the arguments to pass to the service constructor.
         *
         * @return array
         */
        'public function getArguments': function()
        {
            return this.args;
        },

        /**
         * Sets the methods to call after service initialization.
         *
         * @param array calls
         * @return DependencyInjection.Definition
         */
        'public function setMethodCalls': function(calls)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.calls = [];
            for (var i in calls) {
                if (calls.hasOwnProperty(i)) {
                    this.calls[i] = calls[i];
                }
            }
            return this;
        },

        /**
         * Adds a method to call after service initialization.
         *
         * @param string method
         * @param array  args
         * @return DependencyInjection.Definition
         */
        'public function addMethodCall': function(method, args)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            args = args || [];
            this.calls.push([method, args]);
            return this;
        },

        /**
         * Removes a method call from this definition by the given name.
         *
         * @param string method
         * @return DependencyInjection.Definition
         */
        'public function removeMethodCall': function(method)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            for (var i in this.calls) {
                if (this.calls[i][0] === method) {
                    delete this.calls[i];
                }
            }

            return this;
        },

        /**
         * Check if the current definition has a given method to call after
         * service initialization.
         *
         * @return bool
         */
        'public function hasMethodCall': function(method)
        {
            for (var i in this.calls) {
                if (this.calls[i][0] === method) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets the methods to call after service initialization.
         *
         * @return array
         */
        'public function getMethodCalls': function()
        {
            return this.calls;
        },

        /**
         * Sets tags for this definition.
         *
         * @param array tags
         * @return DependencyInjection.Definition
         */
        'public function setTags': function(tags)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.tags = tags;
            return this;
        },

        /**
         * Returns all tags.
         *
         * @return array
         */
        'public function getTags': function()
        {
            return this.tags;
        },

        /**
         * Gets a tag by name.
         *
         * @param string name The tag name
         * @return array An array of attributes
         */
        'public function getTag': function(name)
        {
            return typeof(this.tags[name]) !== 'undefined'
                ? this.tags[name] : [];
        },

        /**
         * Add a tag for this definition.
         *
         * @param string name
         * @param array attributes
         * @return DependencyInjection.Definition
         */
        'public function addTag': function(name, attributes)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            if (typeof(this.tags[name]) === 'undefined') {
                this.tags[name] = [];
            }
            this.tags[name].push(attributes);
            return this;
        },

        /**
         * Returns true if this definition has a tag with the given name.
         *
         * @return bool
         */
        'public function hasTag': function(name)
        {
            return typeof(this.tags[name]) !== 'undefined';
        },

        /**
         * Clears tags with the given name.
         *
         * @return DependencyInjection.Definition
         */
        'public function clearTag': function(name)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            if (typeof(this.tags[name]) !== 'undefined') {
                delete this.tags[name];
            }
            return this;
        },

        /**
         * @return DependencyInjection.Definition
         */
        'public function clearTags': function()
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.tags = {};
            return this;
        },

        /**
         * Sets the visibility of this service.
         *
         * @return DependencyInjection.Definition
         */
        'public function setPublic': function(flag)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.is_public = flag;
            return this;
        },

        /**
         * Returns true if this definition is public.
         *
         * Being public means it's retrievable from the container. A private
         * service is only usable as a dependency on other services.
         *
         * @return bool
         */
        'public function isPublic': function()
        {
            return this.is_public;
        },

        /**
         * Returns true if this definition has an instance of the function
         * associated with it.
         *
         * @return bool
         */
        'public function hasInstance': function()
        {
            return !!this.instance;
        },

        /**
         * Returns the associated instance.
         *
         * @return Object
         */
        'public function getInstance': function()
        {
            if (typeof(this.instance) !== 'undefined') {
                return this.instance;
            }
            throw new Error('Definition is not initialized.');
        },

        /**
         * Sets the instance for this definition.
         *
         * @param object instance
         * @return DependencyInjection.Definition
         */
        'public function setInstance': function(instance)
        {
            if (this.hasInstance()) {
                throw new Error('Unable to update a definition that is already initialized.');
            }
            this.instance = instance;
            return this;
        },

        /**
         * Returns the function associated with this Definition.
         *
         * @return Function
         */
        'public function getFunction': function()
        {
            return this.fn;
        },

        /**
         * Finds the given function by string reference.
         *
         * @access private
         * @return function
         */
        'private function findFunctionFromString': function(str)
        {
            if (str.indexOf('.') === -1) {
                // There are no namespace separators, just return it.
                if (typeof(g[str]) === 'function') {
                    return g[str];
                }
                throw new Error(str + ' is undefined or not a function.');
            }
            var chunks  = str.split('.'),
                result  = g,
                str_rep = '',
                current;
            while ((current = chunks.shift())) {
                str_rep += current;
                if (typeof(result[current]) === 'undefined' || (
                    typeof(result[current]) !== 'object' &&
                    typeof(result[current]) !== 'function')) {
                    throw new Error(str_rep + ' is undefined or not iterable.');
                }
                result = result[current];
                str_rep += '.';
            }
            return result;
        }

    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

/*
 JavaScript Unit Testing Framework        _       _ _
   - Powered by JOII                     (_)___  (_|_)             .__  __
                                        / / __ \/ / /  __ __  ____ |__|/  |_
 (c)2014, <harold@iedema.me>           / / /_/ / / /  |  |  \/    \|  \   __\
 Released under the MIT license.    __/ /\____/_/_/   |  |  /   |  \  ||  |
 --------------------------------- /___/ ------------ |____/|___|  /__||__| ---
                                                                 */
(function(g, namespace, Class, undefined) {

    var ns = namespace('DependencyInjection');

    /**
     * Dependency Injection ServiceContainer
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.ServiceContainer = Class({

        'private object container' : null,

        'private __construct': function(container)
        {
            if (typeof(container) === 'undefined' || !container) {
                container = new ns.Container();
            }
            this.container = container;
        },

        /**
         * Returns the container.
         *
         * @return DependencyInjection.Container
         */
        'public function getContainer': function()
        {
            return this.container;
        },

        /**
         * Loads configuration which will be parsed and injected into
         * the Container.
         *
         * @return DependencyInjection.ContainerBuilder
         */
        'public function loadConfiguration': function(config)
        {
            if (typeof(config) !== 'object') {
                throw new Error('loadConfiguration expectes an object, ' + typeof(config) + ' given.');
            }
            if (typeof(config.parameters) === 'undefined' &&
                typeof(config.services) === 'undefined') {
                throw new Error("The configuration object must have a 'parameters' and/or 'services' element.");
            }

            // If we have 'parameters' object in the config...
            if (typeof(config.parameters) === 'object') {
                this.loadParameters(config.parameters);
            }

            // If we have a 'services' object in the config...
            if (typeof(config.services) === 'object') {
                for (var i in config.services) {
                    if (!config.services.hasOwnProperty(i)) {
                        continue;
                    }
                    this.loadService(i, config.services[i]);
                }
            }
        },

        /**
         * Iterates over the parameters object and injects them into the
         * Container being built.
         *
         * @access private
         */
        'private function loadParameters': function(parameters)
        {
            for (var i in parameters) {
                if (!parameters.hasOwnProperty(i)) {
                    continue;
                }
                this.container.setParameter(i, parameters[i]);
            }
        },

        /**
         * Creates a service definition.
         *
         * @access private
         * @param string id
         * @param object config
         */
        'private function loadService': function(id, config)
        {
            var def = this.container.register(id, config['class']);

            // Set constructor arguments
            if (typeof(config.arguments) !== 'undefined') {
                def.setArguments(config.arguments);
            }

            // Set method calls
            if (typeof(config.calls) !== 'undefined') {
                def.setMethodCalls(config.calls);
            }

            // Set tags
            if (typeof(config.tags) !== 'undefined') {
                def.setTags(config.tags);
            }
        }
    });
} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('');

    /**
     * JOII-Unit TestCase
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.TestCase = Class({

        /**
         * Allow executing this class as a function and delegate the call to
         * TestCase.Register
         */
        __call: function() {
            ns.TestCase.Register.apply(undefined, arguments);
        },

        // Callbacks
        'final public object on_pass' : null,
        'final public object on_fail' : null,

        'final private __construct' : function (on_pass, on_fail) {
            this.on_pass = on_pass || function (m, a, e, t) {};
            this.on_fail = on_fail || function (m, a, e, t) {
                throw new Error(m + "\n  Expected : " + JSON.stringify(e) + "\n  Actual   : " + JSON.stringify(a) + "\n");
            };
        },

        // Registers a passed test.
        'final private function pass' : function(message, actual, expected) {
            try { throw new Error(message); } catch (e) { trace = e.stack; }
            this.on_pass(message, actual, expected, trace);
        },

        // Registers a failed test.
        'final private function fail' : function(message, actual, expected) {
            // Throw an Error to generate a trace
            var trace = [];
            try { throw new Error(message); } catch (e) { trace = e.stack; }
            this.on_fail(message, actual, expected, trace);
        }

    });

    ns.TestCase.Register = function(name, body) {

        var unit = JOII.Unit.instance;
        if (typeof unit === 'undefined') {
            throw new Error('Unable to register a TestCase without an active JOII.Unit instance.');
        }

        // Append "Test" to the TestCase name.
        if (name.substr(name.length - 4) !== 'Test') {
            name += 'Test';
        }

        // Gather and apply traits
        var i, traits = [];
        for (i in JOII.Unit.TestCase.Traits) {
            traits.push(JOII.Unit.TestCase.Traits[i]);
        }

        var testcase = Class(name, { 'extends': JOII.Unit.TestCase, uses: traits }, body)
        unit.getContainer().get('joii.unit.test_manager').addTest(testcase);
    }

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('TestCase');

    /**
     * JOII-Unit TestCase Process
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.Process = Class({

        'private testcase'     : null,
        'private reporter'     : null,
        'private current_test' : null,
        'private result'       : {},

        /**
         * Constructor
         *
         * @param JOII.Unit.TestCase testcase
         */
        'private __construct' : function (testcase, reporter) {
            this.testcase = testcase;
            this.reporter = reporter;

            this.result.testcase   = testcase;
            this.result.tests      = {};
            this.result.assertions = { passed: 0, failed: 0 };
            this.result.runtime    = 0;
        },

        'public function getTestCase' : function () {
            return this.testcase;
        },

        /**
         * Runs the TestCase and returns an object with test results.
         *
         * @return object
         */
        'public function run' : function () {
            for (var i in this.testcase.methods) {
                var method      = this.testcase.methods[i],
                    annotations = this.testcase.annotations.getMethod(method);

                this.current_method = method;
                this.result.tests[method] = [];

                // Does the method implement annotation "UAB_TestExecutor" ?
                if (annotations.has('UAB_TestExecutor')) {
                    // Grab it and let it execute the test.
                    var annotation = annotations.get('UAB_TestExecutor');
                    this.dataset   = 0;
                    annotation.execute(JOII.Compat.Bind(function() {
                        this.dataset ++;
                        this.runTest(method, arguments);
                    }, this));
                } else {
                    this.dataset = undefined;
                    this.runTest(this.testcase.methods[i], []);
                }
            }

            return this.result;
        },

        /**
         * Runs one test.
         */
        'private function runTest' : function(method, args) {

            var on_pass = JOII.Compat.Bind(this.registerPass, this);
            var on_fail = JOII.Compat.Bind(this.registerFail, this);

            var instance    = new this.testcase(on_pass, on_fail),
                annotations = this.testcase.annotations.getMethod(method);

            if (this.testcase.reflector.hasMethod('setup')) {
                instance.setup();
            }

            this.current_test         = method;
            if (annotations.has('UAB_Exception')) {
                var ex = annotations.get('UAB_Exception').getExpectedExceptionString();
                try {
                    instance[method].apply(undefined, args);
                    on_fail('The expected exception "' + ex + '" was never thrown.', undefined, ex);
                } catch (e) {
                    if (! annotations.get('UAB_Exception').isValid(e)) {
                        var m = 'Thrown exception did not match the expected exception.',
                            o = on_fail;
                    } else {
                        var m = 'The expected exception was thrown.',
                            o = on_pass;
                    }
                    e = annotations.get('UAB_Exception').getExceptionString(e);
                    o(m, e, ex);
                }
            } else {
                instance[method].apply(undefined, args);
            }

            if (this.testcase.reflector.hasMethod('teardown')) {
                instance.teardown();
            }
        },

        'private function registerPass' : function (message, actual, expected, trace) {

            if (this.dataset !== undefined) {
                message = '[dataset #' + this.dataset + '] ' + message;
            }

            this.result.assertions.passed++;
            this.result.tests[this.current_method].push({
                passed: true, message: message, actual: actual, expected: expected, trace: trace
            });
            this.reporter.reportAssertPass(this.testcase, this.current_test, message, actual, expected, trace);
        },

        'private function registerFail' : function (message, actual, expected) {

            if (this.dataset !== undefined) {
                message = '[dataset #' + this.dataset + '] ' + message;
            }

            this.result.assertions.failed++;
            this.result.tests[this.current_method].push({
                passed: false, message: message, actual: actual, expected: expected, trace: trace
            });
            this.reporter.reportAssertFail(this.testcase, this.current_test, message, actual, expected, trace);
        }

    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));

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
    var ns = namespace('TestCase.Traits');

    /**
     * Contains assertion methods to be used in a TestCase.
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AssertScalar = {

        'final protected assert' : function (p, m, a, e) {
            this[(p === true) ? 'pass' : 'fail'](m, a, e);
        },

        /**
         * Assert the given value equals true in a strict comparison.
         *
         * @param mixed  a
         * @param string message
         */
        'final protected function assertTrue' : function(a, message) {
            this.assert(a === true, message, a, true);
        },

        /**
         * Assert the given value equals false in a strict comparison.
         *
         * @param mixed  a
         * @param string message
         */
        'final protected function assertFalse' : function(a, message) {
            this.assert(a === false, message, a, false);
        },

        /**
         * Perform a non-strict equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertEqual' : function(a, b, message) {
            this.assert(a == b, message, a, b);
        },

        /**
         * Perform a non-strict not-equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertNotEqual' : function(a, b, message) {
            this.assert(a != b, message, a, b);
        },

        /**
         * Perform a strict equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertEqualStrict' : function(a, b, message) {
            this.assert(a === b, message, a, b);
        },

        /**
         * Perform a strict not-equals comparison on the given values.
         *
         * @param mixed  a
         * @param mixed  b
         * @param string message
         */
        'final protected function assertNotEqualStrict' : function(a, b, message) {
            this.assert(a !== b, message, a, b);
        }
    };

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
