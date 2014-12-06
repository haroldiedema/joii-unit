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
