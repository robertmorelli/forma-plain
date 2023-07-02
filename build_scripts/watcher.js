const chokidar = require('chokidar');
const { exec } = require('child_process');
let sass;
let ts;
try {
    sass = exec('npx sass src:sass_mid_compile --no-source-map --watch');
    ts = exec('npx tsc --strict --removeComments --watch');
    // One-liner for current directory
    chokidar.watch([
        'sass_mid_compile/',
        'ts_mid_compile/',
        'src/index.html',
    ]
    ).on("all", (e,p) => {
        exec('npx html-inline-external --src src/index.html --dest fin/index.html --pretty', (err, _, __) => {
            if (err) return void console.log(err);
            //print the time of the update in hh:mm:ss format
            const now = new Date();
            console.log(`file (${p}) updated at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
        });
    });
} catch (e) {
    sass.kill();
    ts.kill();
}
