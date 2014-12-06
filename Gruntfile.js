module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'concat': {
            options: {
                // define a string to put between each file in the concatenated output
                separator: '\n'
            },
            dist: {
                // the files to concatenate
                src: [
                      'src/Unit.js',

                      'src/Annotation.js',
                      'src/LoaderInterface.js',
                      'src/ReporterInterface.js',
                      'src/TestCaseManager.js',
                      
                      'src/AnnotationReader/*.js',
                      'src/Annotation/Behavior/*.js',
                      'src/Annotation/*.js',
                      'src/Loader/*.js',
                      'src/Reporter/*.js',
                      'src/DependencyInjection/*.js',
                      
                      'src/TestCase.js',
                      'src/TestCase/*.js',
                      'src/TestCase/Traits/*.js'

                ],
                // the location of the resulting JS file
                dest: './dist/<%= pkg.name %>.js'
            }
        },
        'uglify': {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: './dist/<%= pkg.name %>.js',
                dest: './dist/<%= pkg.name %>.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
};
