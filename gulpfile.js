var gulp = require("gulp");
var tsc = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var del = require("del");

let tsProject = tsc.createProject("tsconfig.json");

gulp.task("default", ["build"]);

gulp.task("cleanup", function () {
	return del(["build", "maps", "declarations"]);
})

// Transpile ts > js with generating sourcemaps
gulp.task("build-debug", ["cleanup"], function () {
	var tsResult = gulp.src("src/**/*.ts")
		.pipe(sourcemaps.init())
		.pipe(tsProject());
	tsResult.dts.pipe(gulp.dest("declarations"));
	return tsResult.js.pipe(sourcemaps.write("../maps")).pipe(gulp.dest("build"));
})

// Transpile ts > js without generating sourcemaps
gulp.task("build", ["cleanup"], function () {
	var tsResult = gulp.src("src/**/*.ts")
		.pipe(tsProject());
	tsResult.dts.pipe(gulp.dest("declarations"));
	return tsResult.js.pipe(gulp.dest("build"));
})

gulp.task("watch", function () {
	gulp.watch("src/**/*.ts", ["build-debug"]);
});