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
