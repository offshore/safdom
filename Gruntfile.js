module.exports = function(grunt) {
    var banner = '/*! SAFDOM v<%= pkg.version %> | (c) Alex Offshore | aopdg.com */';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                sourceMapName: 'dist/safdom.min.map',
                ASCIIOnly: true,
                report: 'min',
                screwIE8: true,
                beautify: {
                    ascii_only: true
                },
                banner: banner,
                compress: {
                    conditionals: true,
                    evaluate: true,
                    loops: true,
                    hoist_vars: false,
                    if_return: true,
                    join_vars: true,
                    warnings: true,

                }
            },
            build: {
                src: 'src/safdom.js',
                dest: 'dist/safdom.min.js'
            },
		},
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['uglify']);
	grunt.registerTask('default', ['build']);
};
