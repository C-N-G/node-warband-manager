const { spawn } = require('child_process');

// const cmd = "wineconsole --backend=curses /home/cormac/nw_server/mb_warband_dedicated.exe -r NW_Sample_Duel.txt -m Napoleonic Wars";
// exec(cmd, (error, stdout, stderr) => {
//   if (error) {
//     console.log(`error: ${error.message}`);
//     return;
//   }
//   if (stderr) {
//     console.log(`stderr: ${stderr}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
// });

// set_map mp_french_farm
// scn_mp_french_farm.sco  

const nw_server = spawn("wineconsole", [
  "--backend=curses", "/home/cormac/nw_server/mb_warband_dedicated.exe", 
  "-r", "NW_Sample_Duel.txt", 
  "-m", "Napoleonic Wars"
], {
  shell:true
});

nw_server.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});

nw_server.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

nw_server.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

nw_server.on("close", code => {
    console.log(`child process exited with code ${code}`);
});
 

