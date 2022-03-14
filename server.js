const process = require("process");
const path = require("path");
const https = require("https");
const fs = require("fs-extra");
const AdmZip = require("adm-zip");
const { spawn } = require("child_process");

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

module.exports = {

  showConsoleOutput: false,
  restartIntervalInHours: 24,
  restartInterval: 0,
  nw_server: {},

  calculate_restart_interval() {
    return this.restartIntervalInHours*60*60*1000;
  },
  
  /**
   * gets the current date and time for time stamping
   * @returns timestamp of current time
   */
  get_time() {
    const now = new Date();
    return `[${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}]`;
  },
  
  /**
   * starts the NW server process
   */
  start_server() {
  
    console.log(this.get_time(), 'Starting server');

    const server_path = path.join(__dirname, "server_files", "mb_warband_dedicated.exe")
    const config_file = "NW_server_config.txt"
  
    this.nw_server = spawn("wineconsole", [
      "--backend=curses", server_path, 
      // "-r", "NW_Sample_Duel.txt", 
      "-r", config_file, 
      "-m", "Napoleonic Wars"
    ], {
      shell: true,
      detached: true
    });
    
    let output = '';
    this.nw_server.stdout.on("data", data => {
  
      if (!this.showConsoleOutput) return;
  
      if (output.length > 2000) {
        output = output.split('\n');
        for (let i = 0; i < output.length - 1; i++) {
          console.log(output[i].trim());
        }
        output = output[output.length - 1];
      }
      output = output + data;
  
    });
    
    this.nw_server.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
    });
    
    this.nw_server.on('error', (error) => {
      console.log(`error: ${error.message}`);
    });
    
    this.nw_server.on("close", code => {
      console.log(this.get_time(), `child process exited with code ${code}`);
      this.start_server();
    });
  
  },
  
  /**
   * starts begins the restart routine to automatically restart the server
   * @param {int} restartHour what hour of a 24 hour clock to restart
   */
  start_automatic_restart(restartHour) {

    console.log(this.get_time(), 'automatic restart started');

    let today = new Date();
    let tomorrow = new Date();
    
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(restartHour, 0, 0);
    
    let msToRestart = tomorrow.getTime() - today.getTime();
    setTimeout(() => {
      this.kill_server()
      setInterval(this.kill_server, this.restartInterval);
    }, msToRestart);
  },
  
  /**
   * stops the NW server process
   */
  kill_server() {
    if (this.nw_server.pid) {
      process.kill(-this.nw_server.pid); // note - before pid. This converts a pid to a group of pids for process kill() method.
    }
  },

  install_server() {

    console.log(this.get_time(), "installing server");

    const download_url = "https://download.taleworlds.com/mb_warband_napoleonic_wars_dedicated_1174_nw_1210.zip";

    this.download_server(download_url);

  },

  download_server(url) {

    console.log(this.get_time(), "downloading server");
    console.log(this.get_time(), "download started");

    const file = fs.createWriteStream(path.join(__dirname, "server_files", "nw_server.zip"));
    const request = https.get(url, (res) => {
      res.pipe(file);
      res.on("end", () => {
        console.log(this.get_time(), "download finished");
        this.unzip_server();
      })
    })

    request.on("error", (error) => {
      console.log(`error: ${error}`);
    })

  },

  unzip_server() {

    console.log(this.get_time(), "unzipping server");

    const zip = new AdmZip(path.join(__dirname, "server_files", "nw_server.zip"));

    zip.extractAllTo(path.join(__dirname, "server_files/"), true);

    console.log(this.get_time(), "moving files");
    const src = path.join(__dirname, "server_files", "Mount&Blade Warband Napoleonic Wars Dedicated");
    const dst = path.join(__dirname, "server_files");
    fs.copySync(src, dst);
    fs.rmSync(src, { recursive: true, froce: true });
    fs.unlinkSync(path.join(dst, "nw_server.zip"))
    console.log(this.get_time(), "finished moving files");
    console.log(this.get_time(), "installation finished");

  },

  server_is_installed() {

    try {
      fs.statSync(path.join(__dirname, "server_files", "mb_warband_dedicated.exe"));
      return true;
    } catch (error) {
      return false;
    }

  },

  initalise() {
    this.restartInterval = this.calculate_restart_interval();
    if (!this.server_is_installed()) {
      this.install_server();
    }
    this.start_server();
    this.start_automatic_restart(5);
  },
  

}


