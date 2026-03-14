const { spawn } = require("child_process");

const port = process.env.PORT || 3000;
const projectDir = "C:\\Users\\chiyo\\projects\\chiyoda-estate-hp";

const child = spawn(
  "C:\\Users\\chiyo\\nodejs\\npx.cmd",
  ["next", "dev", "--turbopack", "-p", String(port)],
  {
    cwd: projectDir,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PATH: "C:\\Users\\chiyo\\nodejs;" + (process.env.PATH || "") },
  }
);

process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
child.on("exit", (code) => process.exit(code || 0));
