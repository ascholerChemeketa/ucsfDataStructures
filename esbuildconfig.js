const esbuild = require("esbuild");
const glob = require("glob");

esbuild
  .build({
    //inject: glob.sync('AnimationLibrary/*.js'),
    //inject: glob.sync('AnimationLibrary/AVL.js'),
    //entryPoints: ["visualizationPageStyle.css"],
    entryPoints: ["entry.js"],
    bundle: true,
    sourcemap: true,
    minify: false,
    //outdir: 'dist/',
    //outfile: "dist/visualizationPageStyle.css",
    outfile: "dist/entry.js",
    // outfile: "../rsbooks/welcomeprogramming/external/interactives/data-structures/entry.js",
    // outfile: "../rsbooks/welcomeprogramming/published/welcomeprogramming/external/interactives/data-structures/entry.js",
    //platform: 'neutral',
    format: "esm",
  })
  .then(() => console.log("⚡ Javascript build complete! ⚡"))
  .catch(() => process.exit(1));
