var gulp = require("gulp");
var tsc = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");

let tsProject = tsc.createProject("tsconfig.json");

gulp.task("default", ["build"]);

gulp.task("build", function () {
	var tsResult = gulp.src("src/**/*.ts")
		.pipe(sourcemaps.init())
		.pipe(tsProject());
	tsResult.dts.pipe(gulp.dest("declarations"));
	return tsResult.js.pipe(sourcemaps.write("../maps")).pipe(gulp.dest("build"));
})

gulp.task("watch", function () {
	gulp.watch("src/**/*.ts", ["build"]);
});