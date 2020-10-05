const { exec } = require('child_process');

const cmd = "wineconsole --backend=curses '/home/cormac/Mount&Blade Warband Napoleonic Wars Dedicated/mb_warband_dedicated.exe' -r NW_Sample_Duel.txt";
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// const ls = spawn("wineconsole", ["--backend=curses '/home/cormac/Mount&Blade Warband Napoleonic Wars Dedicated/mb_warband_dedicated.exe' -r NW_Sample_Duel.txt"]);

// ls.stdout.on("data", data => {
//     console.log(`stdout: ${data}`);
// });

// ls.stderr.on("data", data => {
//     console.log(`stderr: ${data}`);
// });

// ls.on('error', (error) => {
//     console.log(`error: ${error.message}`);
// });

// ls.on("close", code => {
//     console.log(`child process exited with code ${code}`);
// });