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
