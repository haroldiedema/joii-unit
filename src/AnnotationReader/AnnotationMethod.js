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
