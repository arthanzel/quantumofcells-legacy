xvar gulp = require("gulp");

// ============================
// ====== Asset Pipeline ======
// ============================

var autoprefixer = require("gulp-autoprefixer");
var stylus = require("gulp-stylus");

gulp.task("build:stylus", function() {
    gulp.src("assets/styl/qoc.styl")
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(gulp.dest("assets/dist"));
});

gulp.task("watch", function() {
    gulp.watch("assets/styl/**/*.styl", ["build:stylus"]);
});