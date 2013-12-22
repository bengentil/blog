module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build/*'],
    sass: {
      dist: {
        files: {
            'build/css/main.css': 'src/styles/main.scss'
        }
      }
    },
    bower: {
      install: {
        options: {
          targetDir: 'build/components/',
          layout: 'byComponent',
          install: true,
          verbose: false,
          production: true,
          cleanTargetDir: false,
          cleanBowerDir: false,
          bowerOptions: {}
        }
      }
    },
    copy: {
      dist: {
        files: [{
            expand: true,
            flatten: true,
            src: 'src/assets/*',
            dest: 'build/',
        }]
      }
    },
    markdown: {
      dist: {
        files: [{
            expand: true,
            flatten: true,
            src: ['src/posts/*.md','src/pages/*.md'],
            dest: 'build/',
            ext: '.html'
        }],
        options: {
          template: 'src/templates/main.jst',
          preCompile: function(src, context) {},
          postCompile: function(src, context) {},
          templateContext: {
            'ganalytics': 'UA-XXXXXXXX',
            'domain': 'blog.bgentil.fr'
          },
          markdownOptions: {
            gfm: true,
            highlight: /*'auto'*/ function(){},
            codeLines: {
              before: '<span>',
              after: '</span>'
            }
          }
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {        
        expand: true,
        flatten: true,
        src: 'src/js/*.js',
        dest: 'build/js/',
        ext: '.min.js'
      }
    },
    watch: {
      src: {
        files: 'src/**/*',
        tasks: ['default'],
        options: {
          livereload: true,
        },
      },
    },

  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default tasks
  grunt.registerTask('default', ['clean','bower','copy','sass','markdown','uglify']);

};