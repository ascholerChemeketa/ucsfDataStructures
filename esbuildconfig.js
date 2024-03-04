const esbuild = require('esbuild');
const glob = require('glob');

esbuild
    .build({
        //inject: glob.sync('AnimationLibrary/*.js'),
        //inject: glob.sync('AnimationLibrary/AVL.js'),
        entryPoints: ['entry.js'],
        bundle: true,
        sourcemap: true,
        minify: false,
        //outdir: 'dist/',
        outfile: 'dist/entry.js',
        //platform: 'neutral',
        format: 'esm'
    })
    .then(() => console.log("⚡ Javascript build complete! ⚡"))
    .catch(() => process.exit(1))