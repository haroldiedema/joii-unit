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
