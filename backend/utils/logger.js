const fs = require("fs")
const path = require("path")

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs")
    this.ensureLogDirectory()
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  formatMessage(level, message, meta = {}) {
    return (
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
      }) + "\n"
    )
  }

  log(level, message, meta = {}) {
    const logMessage = this.formatMessage(level, message, meta)
    const logFile = path.join(this.logDir, `${level}.log`)

    // Console output
    console.log(`[${level.toUpperCase()}] ${message}`, meta)

    // File output
    fs.appendFileSync(logFile, logMessage)
  }

  info(message, meta = {}) {
    this.log("info", message, meta)
  }

  error(message, meta = {}) {
    this.log("error", message, meta)
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta)
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, meta)
    }
  }
}

module.exports = new Logger()
