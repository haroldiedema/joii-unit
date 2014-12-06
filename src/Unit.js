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