module.exports = function(grunt) {

  // Load node-modules;
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-text-replace");
  grunt.loadNpmTasks("grunt-shell");

  var bumpVersion = function(version,level) {
    version = version.split(".") || [0,0,0];
    level = level || 2;
    version[level]++;
    return version.join(".");
  };

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    secrets: grunt.file.readJSON(".secrets.json"),
    jshint: {
    	main: ["<%= pkg.main %>","Gruntfile.js"],
      options: {
        jshintrc: true
      }
    },
    shell: {
      pushEng: {
        command: "tasks/pusheng.sh"
      },
      updateLang: {
          command: "tasks/updatelang.sh <%= secrets.getLocalization.username %> <%= secrets.getLocalization.password %>"
      },
      chrome: {
          command: "tasks/chrome.sh"
      },
      firefox: {
          command: "tasks/firefox.sh"
      },
      blackberry10: {
          command: "tasks/blackberry10.sh"
      },
      pushBump: {
          command: "tasks/pushbump.sh"
      }
    },
    replace: {
      index: {
        src: ["www/index.html"],
        overwrite: true,
        replacements: [{
          from: /<p>Version: ([\d|\.]+)<\/p>/g,
          to: function(matchedWord, index, fullText, regexMatches){
            return "<p>Version: "+bumpVersion(regexMatches[0])+"</p>";
          }
        }]
      },
      osx: {
        src: ["source/osx/Resources/Sprinklers-Info.plist"],
        overwrite: true,
        replacements: [{
          from: /<key>CFBundleShortVersionString<\/key>\n\t<string>([\d|\.]+)<\/string>/g,
          to: function(matchedWord, index, fullText, regexMatches){
            return "<key>CFBundleShortVersionString</key>\n\t<string>"+bumpVersion(regexMatches[0])+"</string>";
          }
        }]
      },
      phonegap: {
        src: ["www/config.xml"],
        overwrite: true,
        replacements: [{
          from: /version     = "([\d|\.]+)"/g,
          to: function(matchedWord, index, fullText, regexMatches){
            return "version     = \""+bumpVersion(regexMatches[0])+"\"";
          }
        },{
          from: /versionCode = "(\d+)"/g,
          to: function(matchedWord, index, fullText, regexMatches) {
            return "versionCode = \""+(parseInt(regexMatches[0])+1)+"\"";
          }
        }]
      },
      manifests: {
        src: ["manifest.json","manifest.webapp","package.json"],
        overwrite: true,
        replacements: [{
          from: /"version": "([\d|\.]+)"/g,
          to: function(matchedWord, index, fullText, regexMatches){
            return "\"version\": \""+bumpVersion(regexMatches[0])+"\"";
          }
        }]
      }
    }
  });

  // Default task(s).
  grunt.registerTask("default",["jshint"]);
  grunt.registerTask("bump",["replace","shell:pushBump"]);
  grunt.registerTask("updateLang",["shell:updateLang"]);
  grunt.registerTask("pushEng",["shell:pushEng"]);
  grunt.registerTask("build",["jshint","shell:firefox","shell:chrome","shell:blackberry10"]);

};
