'use strict';
var packagejson = require('./package.json');

module.exports = function (grunt) {
 
  // Configuration

  grunt.initConfig({
    pkg: packagejson,
    jshint: {
      build: [
        'js/*.js'
      ],
      options: {jshintrc: '.jshintrc', ignores:[]}
    },
    uglify: {
      dist: {
        files: {
          'dist/app.min.js': [
            "js/*.js"
          ]
        }
      }
    },
    watch: {
      compile: {
        files: ['*.html','js/*.js','lib/**/*.js',"css/main.css"],
        tasks: ['jshint'],
        options: {
          debounceDelay: 250,
          livereload: true
        }        
      }
    }        
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');  
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'watch:compile']);
  
};