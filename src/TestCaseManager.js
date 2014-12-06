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
