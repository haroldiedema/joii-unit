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
     * JOII-Unit AnnotationParser
     *
     * @author Harold Iedema <harold@iedema.me>
     */
    ns.AnnotationParser = Class({

        'private number pointer' : 0,
        'private string source'  : '',
        'public annotations'     : {},

        /**
         * @param string filename
         * @param string scope
         */
        'private __construct' : function (source, scope) {
            // Replace ' with ", then remove subsequent ".
            this.source = this.trim(source.replace(/\'/g, '"').replace(/\"+/g, '"'));

            // Do something dirty... 'Guess' the scope starting point and reset
            // the pointer.
            scope = '"' + scope.substr(0, scope.length - 4); // Remove "Test".
            var start = this.seek(scope);
            var end   = this.seek('JOII.Unit.TestCase');
            end = (end === false ? this.source.length : end);

            this.source  = this.source.substring(start, end);
            this.pointer = 0;

            var doc_a, doc_b, fn;
            while (false !== (this.seek('/*'))) {
                doc_a = this.pointer;
                doc_b = this.seek('*/');
                fn    = this.seek(':');

                var docblock    = this.parseDocblock(this.source.substring(doc_a, doc_b));
                var declaration = this.parseDeclaration(this.source.substring(doc_b + 2, fn));

                this.annotations[declaration] = docblock;
            }
        },

        /**
         * Parses a declaration line.
         */
        'private function parseDeclaration' : function (str) {
            str = str.replace(/\"/g, '');
            str = this.trim(str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' '));
            var tmp = str.split(' ');
            return tmp[tmp.length - 1];
        },

        /**
         * Parses a dockblock.
         */
        'private function parseDocblock' : function (str) {
            var buff = [], index = 0, i, q = false, c;
            str = this.trim(str.replace(/\n/g, '').replace(/\r/g, '').replace(/\s+/g, ' '));

            for (i = 0; i < str.length; i++) {
                c = str.charAt(i);

                if (c === '"' && q === false) {
                    q = true;
                } else if (c === '"' && q === true) {
                    q = false;
                }

                if (q === false && c === '*') {
                    continue;
                }

                if (c !== '@') {
                    if (typeof buff[index] === 'undefined') { buff[index] = ''; }
                    buff[index] += c;
                } else if (q === false && c === '@') {
                    buff[index] = this.trim(buff[index]);
                    index++;
                }
            }
            buff.shift();
            return buff;
        },

        /**
         * Moves the pointer until {str} is reached and returns the new pointer
         * location if {str} is actually found, false otherwise.
         *
         * @param string str
         * @return number|false
         */
        'private function seek' : function (str) {
            for (var i = this.pointer - 1; i < this.source.length; i++) {
                var fc = 0;
                for (var s = 0; s < str.length; s++) {
                    if (i + s > this.source.length) {
                        return false;
                    }
                    if (str.charAt(s) === this.source.charAt(i + s)) {
                        fc++;
                    } else {
                        break;
                    }
                }
                if (fc === str.length) {
                    this.pointer = i;
                    return this.pointer;
                }
            }
            return false;
        },

        'private trim' : function(str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        }
    });

} ((typeof window !== 'undefined' ? window : global),
   (typeof window !== 'undefined' ? window : global).JOII.Unit.Namespace,
   (typeof window !== 'undefined' ? window : global).JOII.ClassBuilder));
