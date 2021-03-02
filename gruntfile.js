module.exports = function(grunt) {

    var conf = grunt.file.readJSON('package.json'),
        demo = grunt.option("demo") || false;

    // comment banner
    var comment = [
        '/**',
        conf.name + '${varMode} v' + conf.version + ' | ' + grunt.template.today("yyyy-mm-dd"),
        conf.description,
        'by ' + conf.author,
        conf.license
    ].join('\n* ') + '\n**/';

    var config = {

        pkg: grunt.file.readJSON('package.json'),

        clean: {

            'dest': 'js/*',

            'temp': 'src/*.tmp'

        },

        copy: {

            dist: {

                src: 'src/modulr.js',
                dest: 'js/modulr.js',
                options: {
                    process: function (content, srcpath) {
                        content = content.replace('${version}', conf.version);
                        content = content.replace('//${returnValue}', 'return window.Modulr || app;');
                        content = [comment.replace('${varMode}', ''), content].join('\n\n');
                        return content;
                    }

                }

            },

            privateScope: {

                src: 'src/modulr.js',
                dest: 'js/modulr.scope.js',
                options: {
                    process: function (content, srcpath) {
                        content = content.replace('${version}', conf.version);
                        content = content.replace('//${returnValue}', 'return app;');
                        content = [comment.replace('${varMode}', ' (private scope)'), content].join('\n\n');
                        return content;
                    }

                }

            },

            demo: {

                src: 'js/modulr.js',
                dest: 'demo/js/modulr.js'

            }

        },

        concat: {

            demo: {
                options: {
                    separator: ';'
                },
                files: grunt.file.readJSON('demo/build.json')
            },

            polyfill: {
                options: {
                    separator: ';\n\n/**  polyfill **/\n'
                },
                files: {
                    'js/modulr.polyfill.min.js': [
                        'js/modulr.min.js',
                        'src/promise.polyfill.js'
                    ]
                }
            }

        },

        jshint: {

            build: {

                options: grunt.file.readJSON('.jshintrc'),
                expand: true,
                src: ['src/modulr.js']

            }

        },

        uglify: {

            dist: {

                options: {
                    mangle: true,
                    banner: comment.replace('${varMode}', '') + '\n'
                },
                files: {
                    'js/modulr.min.js' : 'js/modulr.js'
                }

            },

            privateScope: {
                options: {
                    mangle: true,
                    banner: comment.replace('${varMode}', ' (private scope)') + '\n'
                },
                files: {
                    'js/modulr.scope.min.js' : 'js/modulr.scope.js'
                }
            },

            includes: {

                option: {
                    mangle: true
                },
                files: {
                    'src/domready.tmp': 'src/domready.js'
                }

            }

        }

    };

    // load npm's
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var tasks;

    if (demo) {
        tasks = [
            'concat:demo'
        ];
    } else {
        tasks = [
            'clean:dest',
            'uglify:includes',
            'jshint',
            'copy:dist',
            'copy:privateScope',
            'copy:demo',
            'concat:demo',
            'uglify:dist',
            'uglify:privateScope',
            'concat:polyfill',
            'clean:temp'
        ];
    }

    grunt.registerTask('default', tasks);

    grunt.initConfig(config);

};
