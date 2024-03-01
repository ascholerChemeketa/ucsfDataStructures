const esbuild = require('esbuild');
const glob = require('glob');

esbuild
    .build({
        stdin: { contents: '' },
        inject: glob.sync('AnimationLibrary/*.js'),
        bundle: true,
        sourcemap: true,
        minify: false,
        outfile: 'dist/entry.js',
    })
    .then(() => console.log("⚡ Javascript build complete! ⚡"))
    .catch(() => process.exit(1))