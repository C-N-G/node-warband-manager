const process = require('process');
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

const showConsoleOutput = false;

let nw_server;

function get_time() {
  const now = new Date();
  return `[${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}]`;
}

function start_server() {

  console.log(get_time(), 'Starting server');

  nw_server = spawn("wineconsole", [
    "--backend=curses", "/home/cormac/nw_server/mb_warband_dedicated.exe", 
    "-r", "NW_Sample_Duel.txt", 
    "-m", "Napoleonic Wars"
  ], {
    shell: true,
    detached: true
  });
  
  let output = '';
  nw_server.stdout.on("data", data => {

    if (!showConsoleOutput) return;

    if (output.length > 2000) {
      output = output.split('\n');
      for (let i = 0; i < output.length - 1; i++) {
        console.log(output[i].trim());
      }
      output = output[output.length - 1];
    }
    output = output + data;

  });
  
  nw_server.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });
  
  nw_server.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });
  
  nw_server.on("close", code => {
    console.log(get_time(), `child process exited with code ${code}`);
    start_server();
  });

}

const restartIntervalInHours = 24;

setInterval(() => {
  if (nw_server.pid) {
    process.kill(-nw_server.pid); // note - before pid. This converts a pid to a group of pids for process kill() method.
  }
}, restartIntervalInHours*60*60*1000);

start_server();
 
