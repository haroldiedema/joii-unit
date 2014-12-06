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
