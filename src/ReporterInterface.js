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
