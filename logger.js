const path = require("path");
const fs = require("fs");
const { time } = require("console");
module.exports = {

  read_file(aLog) {

    return fs.readFileSync(path.join(__dirname, "server_files", "Logs", aLog), "utf-8");

  },

  crawl_data(log_file) {

    let db = {};
    let chat = [];

    if (this.db_exists()) {
      const db_data = this.read_db();
      db = db_data[0];
      chat = db_data[1];
    }

    const regex = new RegExp(/(\[\w+\])/);
    let names_to_ids = {};
    let date_stamp = this.get_log_file_date(log_file);
    let content = this.read_file(log_file).split(/\r?\n/);
    content.forEach(line => {

      const data = line.split(" ");
      if (data[3] == "SERVER" || data[3] == "[SERVER]:" || data[2] == "[SERVER]:") {
        return;
      }

      if (regex.test(line)) chat.push(`${date_stamp} ${line}`);

      // player joins
      if (line.includes("has joined the game")) {
        const id = data[10];
        const time = data[1];
        const name = data[3];
        if (!db.hasOwnProperty(id)) {
          db[id] = {};
          db[id].kills = 0;
          db[id].deaths = 0;
          db[id].dmg_dealt = 0;
          db[id].dmg_taken = 0;
          db[id].tmdmg_dealt = 0;
          db[id].tmdmg_taken = 0;
        } 
        db[id].name = name;
        db[id].last_active = `${date_stamp} ${time}`;
        names_to_ids[name] = id;
      } 
      // player leaves
      else if (line.includes("has left the game")) {
        const id = data[10];
        const time = data[1];
        db[id].last_active = `${date_stamp} ${time}`;
      }
      // player damages
      else if (line.includes("Delivered")) {
        const killer_id = names_to_ids[data[3]];
        const victim_id = names_to_ids[data[8]];
        const damage = data[5];
        db[killer_id].dmg_dealt += parseInt(damage);
        db[victim_id].dmg_taken += parseInt(damage);
      }
      // player teamhits
      else if (line.includes("teamhit")) {
        const killer_id = names_to_ids[data[3]];
        const victim_id = names_to_ids[data[5]];
        const damage = data[6];
        db[killer_id].tmdmg_dealt += parseInt(damage);
        db[victim_id].tmdmg_taken += parseInt(damage);
      }
      // player kills
      else if (line.includes("<img=")) {
        if (line.includes("  <img=")) return; // discount suicides
        const killer_id = names_to_ids[data[3]];
        const victim_id = names_to_ids[data[5]];
        db[killer_id].kills++
        db[victim_id].deaths++
      }

    })

    return [db, chat];
    
  },

  write_db(db, chat) {

    fs.writeFileSync(path.join(__dirname, "server_files", "data", "db.json"), JSON.stringify(db));
    fs.writeFileSync(path.join(__dirname, "server_files", "data", "chat.json"), JSON.stringify(chat));

  },

  read_db() {

    let data = [];
    data[0] = JSON.parse(fs.readFileSync(path.join(__dirname, "server_files", "data", "db.json")));
    data[1] = JSON.parse(fs.readFileSync(path.join(__dirname, "server_files", "data", "chat.json")));
    return data;

  },

  db_exists() {

    try {
      fs.statSync(path.join(__dirname, "server_files", "data", "db.json"));
      return true;
    } catch (error) {
      return false;
    }

  },

  get_log_file_date(log_file_name) {

    let data = log_file_name.split(".")[0].split("_")
    const year = "20" + data[4];
    const month = parseInt(data[2]) - 1;
    const date = data[3];
    let timestamp = new Date(year, month, date);
    return `${timestamp.getDate()}/${timestamp.getMonth()+1}/${timestamp.getFullYear()}`;

  },

  initalise() {

    const log_file = "server_log_03_06_22.txt";

    let data = this.crawl_data(log_file);
    this.write_db(data[0], data[1]);

  }

}