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
