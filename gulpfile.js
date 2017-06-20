"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const rename = require("gulp-rename");
const changed = require("gulp-changed");
const runSequence = require("run-sequence");
const path = require("path");
const del = require("del");
const ts = require("gulp-typescript");
const ngc = require("gulp-ngc");
const merge = require("merge2");
const rollup = require("gulp-rollup");
const inlineNg2Template = require("gulp-inline-ng2-template");
const ROLLUP_GLOBALS = {
    "@angular/core": "_angular_core",
    "@angular/common": "_angular_common",
    "@angular/forms": "_angular_forms",
};
const ROLLUP_EXTERNAL = Object.keys(ROLLUP_GLOBALS);
const rootFolder = path.join(__dirname);
const srcFolder = path.join(rootFolder, "src");
const tmpFolder = path.join(rootFolder, ".tmp");
const tmpBundlesFolder = path.join(tmpFolder, ".bundles");
const buildFolder = path.join(rootFolder, "build");
const distFolder = path.join(rootFolder, "dist");
const { name: libName, main: bandleNameUMD, module: bundleNameES5, es2015: bundleNameES2015, } = require("./package.json");
gulp_1.task("debug", () => merge(gulp_1.src([
    `!${srcFolder}/inline-editor.module.ts`,
    `!${srcFolder}/tsconfig.json`,
    `${srcFolder}/**/*`,
])
    .pipe(changed(distFolder))
    .pipe(gulp_1.dest(distFolder)), gulp_1.src([`${srcFolder}/inline-editor.module.ts`])
    .pipe(changed(distFolder, { transformPath: () => `${distFolder}/index.ts` }))
    .pipe(rename("index.ts"))
    .pipe(gulp_1.dest(distFolder))));
gulp_1.task("clean:dist", () => deleteFolders([distFolder]));
gulp_1.task("copy:source", () => gulp_1.src([`${srcFolder}/**/*`])
    .pipe(inlineNg2Template({
    base: srcFolder,
    target: "es5",
    useRelativePaths: true,
    removeLineBreaks: true,
}))
    .pipe(gulp_1.dest(tmpFolder)));
gulp_1.task("ngc", () => ngc(`${tmpFolder}/tsconfig.json`));
gulp_1.task("rollup", () => runSequence("rollup:es2015", "rollup:es5", "rollup:umd"));
const rollupES2015Caches = {};
gulp_1.task("rollup:es2015", () => gulp_1.src(`${buildFolder}/**/*.js`)
    .pipe(rollup({
    entry: `${buildFolder}/inline-editor.module.js`,
    external: ROLLUP_EXTERNAL,
    format: "es",
    separateCaches: rollupES2015Caches,
}))
    .on("bundle", (bundle, name) => {
    rollupES2015Caches[name] = bundle;
})
    .pipe(rename(bundleNameES2015))
    .pipe(gulp_1.dest(tmpBundlesFolder)));
const tsProject = ts.createProject({
    target: "es5",
    module: "es2015",
    allowJs: true,
    typescript: require("typescript"),
});
gulp_1.task("rollup:es5", () => {
    const tsResult = gulp_1.src(`${tmpBundlesFolder}/${bundleNameES2015}`)
        .pipe(tsProject());
    return merge([
        tsResult.js.pipe(rename(bundleNameES5)).pipe(gulp_1.dest(tmpBundlesFolder)),
        tsResult.dts.pipe(gulp_1.dest(tmpBundlesFolder)),
    ]);
});
const rollupUMDCaches = {};
gulp_1.task("rollup:umd", () => gulp_1.src(`${tmpBundlesFolder}/${bundleNameES5}`)
    .pipe(rollup({
    entry: `${tmpBundlesFolder}/${bundleNameES5}`,
    globals: ROLLUP_GLOBALS,
    external: ROLLUP_EXTERNAL,
    format: "umd",
    moduleName: libName,
    separateCaches: rollupUMDCaches,
    onwarn(message) {
        if (message.code === "THIS_IS_UNDEFINED") {
            return;
        }
        console.warn(message);
    },
}))
    .on("bundle", (bundle, name) => {
    rollupUMDCaches[name] = bundle;
})
    .pipe(rename(bandleNameUMD))
    .pipe(gulp_1.dest(tmpBundlesFolder)));
gulp_1.task("copy:build", () => runSequence("copy:buildTS", "copy:buildCSS"));
gulp_1.task("copy:buildTS", () => gulp_1.src([
    `${buildFolder}/**/*`,
    `!${buildFolder}/**/*.js`,
])
    .pipe(gulp_1.dest(distFolder)));
gulp_1.task("copy:buildCSS", () => gulp_1.src([
    `${srcFolder}/themes/**/*`,
])
    .pipe(gulp_1.dest(`${distFolder}/themes`)));
gulp_1.task("copy:bundles", () => gulp_1.src(`${tmpBundlesFolder}/*.js`).pipe(gulp_1.dest(distFolder)));
gulp_1.task("copy:manifest", () => gulp_1.src([`${rootFolder}/package.json`]).pipe(gulp_1.dest(distFolder)));
gulp_1.task("clean:tmp", () => deleteFolders([tmpFolder]));
gulp_1.task("clean:build", () => deleteFolders([buildFolder]));
gulp_1.task("compile", () => runSequence("copy:source", "ngc", "rollup", "clean:dist", "copy:buildTS", "copy:buildCSS", "copy:bundles", "copy:manifest", "clean:build", "clean:tmp", (err) => {
    if (err) {
        console.log("ERROR:", err.message);
        deleteFolders([distFolder, tmpFolder, buildFolder]);
    }
    else {
        console.log("Compilation finished succesfully");
    }
}));
gulp_1.task("compile:debug", () => runSequence("clean:dist", "debug", (err) => {
    if (err) {
        console.log("ERROR:", err.message);
        deleteFolders([distFolder]);
    }
    else {
        console.log("Compilation finished succesfully");
    }
}));
gulp_1.task("watch", ["compile"], () => gulp_1.watch(`${srcFolder}/**/*`, ["compile"]));
gulp_1.task("watch:debug", ["compile:debug"], () => gulp_1.watch(`${srcFolder}/**/*`, ["debug"]));
gulp_1.task("clean", ["clean:dist", "clean:tmp", "clean:build"]);
gulp_1.task("build", ["clean", "compile"]);
gulp_1.task("build:watch", ["build", "watch"]);
gulp_1.task("default", ["build:watch"]);
function deleteFolders(folders) {
    return del(folders);
}
//# sourceMappingURL=gulpfile.js.map