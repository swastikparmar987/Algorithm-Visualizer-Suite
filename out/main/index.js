"use strict";
const require$$1$1 = require("fs");
const require$$1 = require("path");
const require$$1$2 = require("os");
const require$$0$1 = require("crypto");
const require$$1$3 = require("electron");
const fs$k = require("fs/promises");
const require$$0$5 = require("child_process");
const require$$1$5 = require("util");
const require$$0$4 = require("events");
const require$$2 = require("url");
const require$$0$3 = require("http");
const require$$1$4 = require("https");
const require$$3 = require("zlib");
const require$$0$2 = require("stream");
const require$$7 = require("net");
const require$$4$1 = require("dns");
require("tls");
const require$$0$6 = require("constants");
const require$$5 = require("assert");
const require$$1$6 = require("tty");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$3 = { exports: {} };
const version$2 = "17.3.1";
const require$$4 = {
  version: version$2
};
const fs$j = require$$1$1;
const path$n = require$$1;
const os$1 = require$$1$2;
const crypto$1 = require$$0$1;
const packageJson$1 = require$$4;
const version$1 = packageJson$1.version;
const TIPS = [
  "🔐 encrypt with Dotenvx: https://dotenvx.com",
  "🔐 prevent committing .env to code: https://dotenvx.com/precommit",
  "🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
  "🤖 agentic secret storage: https://dotenvx.com/as2",
  "⚡️ secrets for agents: https://dotenvx.com/as2",
  "🛡️ auth for agents: https://vestauth.com",
  "🛠️  run anywhere with `dotenvx run -- yourcommand`",
  "⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
  "⚙️  enable debug logging with { debug: true }",
  "⚙️  override existing env vars with { override: true }",
  "⚙️  suppress all logs with { quiet: true }",
  "⚙️  write to custom object with { processEnv: myObject }",
  "⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
];
function _getRandomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
function parseBoolean(value) {
  if (typeof value === "string") {
    return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
  }
  return Boolean(value);
}
function supportsAnsi() {
  return process.stdout.isTTY;
}
function dim(text) {
  return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
}
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function parse$7(src2) {
  const obj = {};
  let lines = src2.toString();
  lines = lines.replace(/\r\n?/mg, "\n");
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    obj[key] = value;
  }
  return obj;
}
function _parseVault(options2) {
  options2 = options2 || {};
  const vaultPath = _vaultPath(options2);
  options2.path = vaultPath;
  const result = DotenvModule.configDotenv(options2);
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
    err.code = "MISSING_DATA";
    throw err;
  }
  const keys = _dotenvKey(options2).split(",");
  const length = keys.length;
  let decrypted;
  for (let i2 = 0; i2 < length; i2++) {
    try {
      const key = keys[i2].trim();
      const attrs = _instructions(result, key);
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
      break;
    } catch (error2) {
      if (i2 + 1 >= length) {
        throw error2;
      }
    }
  }
  return DotenvModule.parse(decrypted);
}
function _warn(message) {
  console.error(`[dotenv@${version$1}][WARN] ${message}`);
}
function _debug(message) {
  console.log(`[dotenv@${version$1}][DEBUG] ${message}`);
}
function _log(message) {
  console.log(`[dotenv@${version$1}] ${message}`);
}
function _dotenvKey(options2) {
  if (options2 && options2.DOTENV_KEY && options2.DOTENV_KEY.length > 0) {
    return options2.DOTENV_KEY;
  }
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY;
  }
  return "";
}
function _instructions(result, dotenvKey) {
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error2) {
    if (error2.code === "ERR_INVALID_URL") {
      const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    }
    throw error2;
  }
  const key = uri.password;
  if (!key) {
    const err = new Error("INVALID_DOTENV_KEY: Missing key part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environment = uri.searchParams.get("environment");
  if (!environment) {
    const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
    err.code = "INVALID_DOTENV_KEY";
    throw err;
  }
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey];
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
    err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
    throw err;
  }
  return { ciphertext, key };
}
function _vaultPath(options2) {
  let possibleVaultPath = null;
  if (options2 && options2.path && options2.path.length > 0) {
    if (Array.isArray(options2.path)) {
      for (const filepath of options2.path) {
        if (fs$j.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
        }
      }
    } else {
      possibleVaultPath = options2.path.endsWith(".vault") ? options2.path : `${options2.path}.vault`;
    }
  } else {
    possibleVaultPath = path$n.resolve(process.cwd(), ".env.vault");
  }
  if (fs$j.existsSync(possibleVaultPath)) {
    return possibleVaultPath;
  }
  return null;
}
function _resolveHome(envPath) {
  return envPath[0] === "~" ? path$n.join(os$1.homedir(), envPath.slice(1)) : envPath;
}
function _configVault(options2) {
  const debug2 = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (debug2 || !quiet) {
    _log("Loading env from encrypted .env.vault");
  }
  const parsed = DotenvModule._parseVault(options2);
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  DotenvModule.populate(processEnv, parsed, options2);
  return { parsed };
}
function configDotenv(options2) {
  const dotenvPath = path$n.resolve(process.cwd(), ".env");
  let encoding = "utf8";
  let processEnv = process.env;
  if (options2 && options2.processEnv != null) {
    processEnv = options2.processEnv;
  }
  let debug2 = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options2 && options2.debug);
  let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options2 && options2.quiet);
  if (options2 && options2.encoding) {
    encoding = options2.encoding;
  } else {
    if (debug2) {
      _debug("No encoding is specified. UTF-8 is used by default");
    }
  }
  let optionPaths = [dotenvPath];
  if (options2 && options2.path) {
    if (!Array.isArray(options2.path)) {
      optionPaths = [_resolveHome(options2.path)];
    } else {
      optionPaths = [];
      for (const filepath of options2.path) {
        optionPaths.push(_resolveHome(filepath));
      }
    }
  }
  let lastError;
  const parsedAll = {};
  for (const path2 of optionPaths) {
    try {
      const parsed = DotenvModule.parse(fs$j.readFileSync(path2, { encoding }));
      DotenvModule.populate(parsedAll, parsed, options2);
    } catch (e) {
      if (debug2) {
        _debug(`Failed to load ${path2} ${e.message}`);
      }
      lastError = e;
    }
  }
  const populated = DotenvModule.populate(processEnv, parsedAll, options2);
  debug2 = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug2);
  quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
  if (debug2 || !quiet) {
    const keysCount = Object.keys(populated).length;
    const shortPaths = [];
    for (const filePath of optionPaths) {
      try {
        const relative = path$n.relative(process.cwd(), filePath);
        shortPaths.push(relative);
      } catch (e) {
        if (debug2) {
          _debug(`Failed to load ${filePath} ${e.message}`);
        }
        lastError = e;
      }
    }
    _log(`injecting env (${keysCount}) from ${shortPaths.join(",")} ${dim(`-- tip: ${_getRandomTip()}`)}`);
  }
  if (lastError) {
    return { parsed: parsedAll, error: lastError };
  } else {
    return { parsed: parsedAll };
  }
}
function config(options2) {
  if (_dotenvKey(options2).length === 0) {
    return DotenvModule.configDotenv(options2);
  }
  const vaultPath = _vaultPath(options2);
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
    return DotenvModule.configDotenv(options2);
  }
  return DotenvModule._configVault(options2);
}
function decrypt(encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), "hex");
  let ciphertext = Buffer.from(encrypted, "base64");
  const nonce = ciphertext.subarray(0, 12);
  const authTag = ciphertext.subarray(-16);
  ciphertext = ciphertext.subarray(12, -16);
  try {
    const aesgcm = crypto$1.createDecipheriv("aes-256-gcm", key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
  } catch (error2) {
    const isRange = error2 instanceof RangeError;
    const invalidKeyLength = error2.message === "Invalid key length";
    const decryptionFailed = error2.message === "Unsupported state or unable to authenticate data";
    if (isRange || invalidKeyLength) {
      const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      err.code = "INVALID_DOTENV_KEY";
      throw err;
    } else if (decryptionFailed) {
      const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      err.code = "DECRYPTION_FAILED";
      throw err;
    } else {
      throw error2;
    }
  }
}
function populate(processEnv, parsed, options2 = {}) {
  const debug2 = Boolean(options2 && options2.debug);
  const override = Boolean(options2 && options2.override);
  const populated = {};
  if (typeof parsed !== "object") {
    const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    err.code = "OBJECT_REQUIRED";
    throw err;
  }
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
        populated[key] = parsed[key];
      }
      if (debug2) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
      populated[key] = parsed[key];
    }
  }
  return populated;
}
const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse: parse$7,
  populate
};
main$3.exports.configDotenv = DotenvModule.configDotenv;
main$3.exports._configVault = DotenvModule._configVault;
main$3.exports._parseVault = DotenvModule._parseVault;
main$3.exports.config = DotenvModule.config;
main$3.exports.decrypt = DotenvModule.decrypt;
main$3.exports.parse = DotenvModule.parse;
main$3.exports.populate = DotenvModule.populate;
main$3.exports = DotenvModule;
var mainExports = main$3.exports;
const options = {};
if (process.env.DOTENV_CONFIG_ENCODING != null) {
  options.encoding = process.env.DOTENV_CONFIG_ENCODING;
}
if (process.env.DOTENV_CONFIG_PATH != null) {
  options.path = process.env.DOTENV_CONFIG_PATH;
}
if (process.env.DOTENV_CONFIG_QUIET != null) {
  options.quiet = process.env.DOTENV_CONFIG_QUIET;
}
if (process.env.DOTENV_CONFIG_DEBUG != null) {
  options.debug = process.env.DOTENV_CONFIG_DEBUG;
}
if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
  options.override = process.env.DOTENV_CONFIG_OVERRIDE;
}
if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
  options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
}
var envOptions = options;
const re$3 = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
var cliOptions = function optionMatcher(args) {
  const options2 = args.reduce(function(acc, cur) {
    const matches = cur.match(re$3);
    if (matches) {
      acc[matches[1]] = matches[2];
    }
    return acc;
  }, {});
  if (!("quiet" in options2)) {
    options2.quiet = "true";
  }
  return options2;
};
(function() {
  mainExports.config(
    Object.assign(
      {},
      envOptions,
      cliOptions(process.argv)
    )
  );
})();
const is = {
  dev: !require$$1$3.app.isPackaged
};
const platform$1 = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform$1.isWindows)
      require$$1$3.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform$1.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return require$$1$3.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      require$$1$3.app.setLoginItemSettings({
        openAtLogin: auto,
        path: process.execPath
      });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return require$$1$3.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window2, shortcutOptions) {
    if (!window2)
      return;
    const { webContents } = window2;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window2.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    require$$1$3.ipcMain.on("win:invoke", (event, action) => {
      const win = require$$1$3.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
var shared = { exports: {} };
var fetch = { exports: {} };
const urllib$1 = require$$2;
const SESSION_TIMEOUT = 1800;
let Cookies$1 = class Cookies2 {
  constructor(options2) {
    this.options = options2 || {};
    this.cookies = [];
  }
  /**
   * Stores a cookie string to the cookie storage
   *
   * @param {String} cookieStr Value from the 'Set-Cookie:' header
   * @param {String} url Current URL
   */
  set(cookieStr, url) {
    let urlparts = urllib$1.parse(url || "");
    let cookie = this.parse(cookieStr);
    let domain;
    if (cookie.domain) {
      domain = cookie.domain.replace(/^\./, "");
      if (
        // can't be valid if the requested domain is shorter than current hostname
        urlparts.hostname.length < domain.length || // prefix domains with dot to be sure that partial matches are not used
        ("." + urlparts.hostname).substr(-domain.length + 1) !== "." + domain
      ) {
        cookie.domain = urlparts.hostname;
      }
    } else {
      cookie.domain = urlparts.hostname;
    }
    if (!cookie.path) {
      cookie.path = this.getPath(urlparts.pathname);
    }
    if (!cookie.expires) {
      cookie.expires = new Date(Date.now() + (Number(this.options.sessionTimeout || SESSION_TIMEOUT) || SESSION_TIMEOUT) * 1e3);
    }
    return this.add(cookie);
  }
  /**
   * Returns cookie string for the 'Cookie:' header.
   *
   * @param {String} url URL to check for
   * @returns {String} Cookie header or empty string if no matches were found
   */
  get(url) {
    return this.list(url).map((cookie) => cookie.name + "=" + cookie.value).join("; ");
  }
  /**
   * Lists all valied cookie objects for the specified URL
   *
   * @param {String} url URL to check for
   * @returns {Array} An array of cookie objects
   */
  list(url) {
    let result = [];
    let i2;
    let cookie;
    for (i2 = this.cookies.length - 1; i2 >= 0; i2--) {
      cookie = this.cookies[i2];
      if (this.isExpired(cookie)) {
        this.cookies.splice(i2, i2);
        continue;
      }
      if (this.match(cookie, url)) {
        result.unshift(cookie);
      }
    }
    return result;
  }
  /**
   * Parses cookie string from the 'Set-Cookie:' header
   *
   * @param {String} cookieStr String from the 'Set-Cookie:' header
   * @returns {Object} Cookie object
   */
  parse(cookieStr) {
    let cookie = {};
    (cookieStr || "").toString().split(";").forEach((cookiePart) => {
      let valueParts = cookiePart.split("=");
      let key = valueParts.shift().trim().toLowerCase();
      let value = valueParts.join("=").trim();
      let domain;
      if (!key) {
        return;
      }
      switch (key) {
        case "expires":
          value = new Date(value);
          if (value.toString() !== "Invalid Date") {
            cookie.expires = value;
          }
          break;
        case "path":
          cookie.path = value;
          break;
        case "domain":
          domain = value.toLowerCase();
          if (domain.length && domain.charAt(0) !== ".") {
            domain = "." + domain;
          }
          cookie.domain = domain;
          break;
        case "max-age":
          cookie.expires = new Date(Date.now() + (Number(value) || 0) * 1e3);
          break;
        case "secure":
          cookie.secure = true;
          break;
        case "httponly":
          cookie.httponly = true;
          break;
        default:
          if (!cookie.name) {
            cookie.name = key;
            cookie.value = value;
          }
      }
    });
    return cookie;
  }
  /**
   * Checks if a cookie object is valid for a specified URL
   *
   * @param {Object} cookie Cookie object
   * @param {String} url URL to check for
   * @returns {Boolean} true if cookie is valid for specifiec URL
   */
  match(cookie, url) {
    let urlparts = urllib$1.parse(url || "");
    if (urlparts.hostname !== cookie.domain && (cookie.domain.charAt(0) !== "." || ("." + urlparts.hostname).substr(-cookie.domain.length) !== cookie.domain)) {
      return false;
    }
    let path2 = this.getPath(urlparts.pathname);
    if (path2.substr(0, cookie.path.length) !== cookie.path) {
      return false;
    }
    if (cookie.secure && urlparts.protocol !== "https:") {
      return false;
    }
    return true;
  }
  /**
   * Adds (or updates/removes if needed) a cookie object to the cookie storage
   *
   * @param {Object} cookie Cookie value to be stored
   */
  add(cookie) {
    let i2;
    let len;
    if (!cookie || !cookie.name) {
      return false;
    }
    for (i2 = 0, len = this.cookies.length; i2 < len; i2++) {
      if (this.compare(this.cookies[i2], cookie)) {
        if (this.isExpired(cookie)) {
          this.cookies.splice(i2, 1);
          return false;
        }
        this.cookies[i2] = cookie;
        return true;
      }
    }
    if (!this.isExpired(cookie)) {
      this.cookies.push(cookie);
    }
    return true;
  }
  /**
   * Checks if two cookie objects are the same
   *
   * @param {Object} a Cookie to check against
   * @param {Object} b Cookie to check against
   * @returns {Boolean} True, if the cookies are the same
   */
  compare(a, b) {
    return a.name === b.name && a.path === b.path && a.domain === b.domain && a.secure === b.secure && a.httponly === a.httponly;
  }
  /**
   * Checks if a cookie is expired
   *
   * @param {Object} cookie Cookie object to check against
   * @returns {Boolean} True, if the cookie is expired
   */
  isExpired(cookie) {
    return cookie.expires && cookie.expires < /* @__PURE__ */ new Date() || !cookie.value;
  }
  /**
   * Returns normalized cookie path for an URL path argument
   *
   * @param {String} pathname
   * @returns {String} Normalized path
   */
  getPath(pathname) {
    let path2 = (pathname || "/").split("/");
    path2.pop();
    path2 = path2.join("/").trim();
    if (path2.charAt(0) !== "/") {
      path2 = "/" + path2;
    }
    if (path2.substr(-1) !== "/") {
      path2 += "/";
    }
    return path2;
  }
};
var cookies = Cookies$1;
const version = "8.0.1";
const require$$10 = {
  version
};
const ERROR_CODES = {
  // Connection errors
  ECONNECTION: "Connection closed unexpectedly",
  ETIMEDOUT: "Connection or operation timed out",
  ESOCKET: "Socket-level error",
  EDNS: "DNS resolution failed",
  // TLS/Security errors
  ETLS: "TLS handshake or STARTTLS failed",
  EREQUIRETLS: "REQUIRETLS not supported by server (RFC 8689)",
  // Protocol errors
  EPROTOCOL: "Invalid SMTP server response",
  EENVELOPE: "Invalid mail envelope (sender or recipients)",
  EMESSAGE: "Message delivery error",
  ESTREAM: "Stream processing error",
  // Authentication errors
  EAUTH: "Authentication failed",
  ENOAUTH: "Authentication credentials not provided",
  EOAUTH2: "OAuth2 token generation or refresh error",
  // Resource errors
  EMAXLIMIT: "Pool resource limit reached (max messages per connection)",
  // Transport-specific errors
  ESENDMAIL: "Sendmail command error",
  ESES: "AWS SES transport error",
  // Configuration and access errors
  ECONFIG: "Invalid configuration",
  EPROXY: "Proxy connection error",
  EFILEACCESS: "File access rejected (disableFileAccess is set)",
  EURLACCESS: "URL access rejected (disableUrlAccess is set)",
  EFETCH: "HTTP fetch error"
};
var errors$2 = Object.keys(ERROR_CODES).reduce(
  (exports$1, code) => {
    exports$1[code] = code;
    return exports$1;
  },
  { ERROR_CODES }
);
const http = require$$0$3;
const https = require$$1$4;
const urllib = require$$2;
const zlib = require$$3;
const PassThrough = require$$0$2.PassThrough;
const Cookies = cookies;
const packageData = require$$10;
const net = require$$7;
const errors$1 = errors$2;
const MAX_REDIRECTS = 5;
fetch.exports = function(url, options2) {
  return nmfetch(url, options2);
};
fetch.exports.Cookies = Cookies;
function nmfetch(url, options2) {
  options2 = options2 || {};
  options2.fetchRes = options2.fetchRes || new PassThrough();
  options2.cookies = options2.cookies || new Cookies();
  options2.redirects = options2.redirects || 0;
  options2.maxRedirects = isNaN(options2.maxRedirects) ? MAX_REDIRECTS : options2.maxRedirects;
  if (options2.cookie) {
    [].concat(options2.cookie || []).forEach((cookie) => {
      options2.cookies.set(cookie, url);
    });
    options2.cookie = false;
  }
  let fetchRes = options2.fetchRes;
  let parsed = urllib.parse(url);
  let method = (options2.method || "").toString().trim().toUpperCase() || "GET";
  let finished = false;
  let cookies2;
  let body;
  let handler = parsed.protocol === "https:" ? https : http;
  let headers = {
    "accept-encoding": "gzip,deflate",
    "user-agent": "nodemailer/" + packageData.version
  };
  Object.keys(options2.headers || {}).forEach((key) => {
    headers[key.toLowerCase().trim()] = options2.headers[key];
  });
  if (options2.userAgent) {
    headers["user-agent"] = options2.userAgent;
  }
  if (parsed.auth) {
    headers.Authorization = "Basic " + Buffer.from(parsed.auth).toString("base64");
  }
  if (cookies2 = options2.cookies.get(url)) {
    headers.cookie = cookies2;
  }
  if (options2.body) {
    if (options2.contentType !== false) {
      headers["Content-Type"] = options2.contentType || "application/x-www-form-urlencoded";
    }
    if (typeof options2.body.pipe === "function") {
      headers["Transfer-Encoding"] = "chunked";
      body = options2.body;
      body.on("error", (err) => {
        if (finished) {
          return;
        }
        finished = true;
        err.code = errors$1.EFETCH;
        err.sourceUrl = url;
        fetchRes.emit("error", err);
      });
    } else {
      if (options2.body instanceof Buffer) {
        body = options2.body;
      } else if (typeof options2.body === "object") {
        try {
          body = Buffer.from(
            Object.keys(options2.body).map((key) => {
              let value = options2.body[key].toString().trim();
              return encodeURIComponent(key) + "=" + encodeURIComponent(value);
            }).join("&")
          );
        } catch (E) {
          if (finished) {
            return;
          }
          finished = true;
          E.code = errors$1.EFETCH;
          E.sourceUrl = url;
          fetchRes.emit("error", E);
          return;
        }
      } else {
        body = Buffer.from(options2.body.toString().trim());
      }
      headers["Content-Type"] = options2.contentType || "application/x-www-form-urlencoded";
      headers["Content-Length"] = body.length;
    }
    method = (options2.method || "").toString().trim().toUpperCase() || "POST";
  }
  let req;
  let reqOptions = {
    method,
    host: parsed.hostname,
    path: parsed.path,
    port: parsed.port ? parsed.port : parsed.protocol === "https:" ? 443 : 80,
    headers,
    rejectUnauthorized: false,
    agent: false
  };
  if (options2.tls) {
    Object.keys(options2.tls).forEach((key) => {
      reqOptions[key] = options2.tls[key];
    });
  }
  if (parsed.protocol === "https:" && parsed.hostname && parsed.hostname !== reqOptions.host && !net.isIP(parsed.hostname) && !reqOptions.servername) {
    reqOptions.servername = parsed.hostname;
  }
  try {
    req = handler.request(reqOptions);
  } catch (E) {
    finished = true;
    setImmediate(() => {
      E.code = errors$1.EFETCH;
      E.sourceUrl = url;
      fetchRes.emit("error", E);
    });
    return fetchRes;
  }
  if (options2.timeout) {
    req.setTimeout(options2.timeout, () => {
      if (finished) {
        return;
      }
      finished = true;
      req.abort();
      let err = new Error("Request Timeout");
      err.code = errors$1.EFETCH;
      err.sourceUrl = url;
      fetchRes.emit("error", err);
    });
  }
  req.on("error", (err) => {
    if (finished) {
      return;
    }
    finished = true;
    err.code = errors$1.EFETCH;
    err.sourceUrl = url;
    fetchRes.emit("error", err);
  });
  req.on("response", (res) => {
    let inflate;
    if (finished) {
      return;
    }
    switch (res.headers["content-encoding"]) {
      case "gzip":
      case "deflate":
        inflate = zlib.createUnzip();
        break;
    }
    if (res.headers["set-cookie"]) {
      [].concat(res.headers["set-cookie"] || []).forEach((cookie) => {
        options2.cookies.set(cookie, url);
      });
    }
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      options2.redirects++;
      if (options2.redirects > options2.maxRedirects) {
        finished = true;
        let err = new Error("Maximum redirect count exceeded");
        err.code = errors$1.EFETCH;
        err.sourceUrl = url;
        fetchRes.emit("error", err);
        req.abort();
        return;
      }
      options2.method = "GET";
      options2.body = false;
      return nmfetch(urllib.resolve(url, res.headers.location), options2);
    }
    fetchRes.statusCode = res.statusCode;
    fetchRes.headers = res.headers;
    if (res.statusCode >= 300 && !options2.allowErrorResponse) {
      finished = true;
      let err = new Error("Invalid status code " + res.statusCode);
      err.code = errors$1.EFETCH;
      err.sourceUrl = url;
      fetchRes.emit("error", err);
      req.abort();
      return;
    }
    res.on("error", (err) => {
      if (finished) {
        return;
      }
      finished = true;
      err.code = errors$1.EFETCH;
      err.sourceUrl = url;
      fetchRes.emit("error", err);
      req.abort();
    });
    if (inflate) {
      res.pipe(inflate).pipe(fetchRes);
      inflate.on("error", (err) => {
        if (finished) {
          return;
        }
        finished = true;
        err.code = errors$1.EFETCH;
        err.sourceUrl = url;
        fetchRes.emit("error", err);
        req.abort();
      });
    } else {
      res.pipe(fetchRes);
    }
  });
  setImmediate(() => {
    if (body) {
      try {
        if (typeof body.pipe === "function") {
          return body.pipe(req);
        } else {
          req.write(body);
        }
      } catch (err) {
        finished = true;
        err.code = errors$1.EFETCH;
        err.sourceUrl = url;
        fetchRes.emit("error", err);
        return;
      }
    }
    req.end();
  });
  return fetchRes;
}
var fetchExports = fetch.exports;
(function(module) {
  const urllib2 = require$$2;
  const util2 = require$$1$5;
  const fs2 = require$$1$1;
  const nmfetch2 = fetchExports;
  const dns = require$$4$1;
  const net2 = require$$7;
  const os2 = require$$1$2;
  const DNS_TTL = 5 * 60 * 1e3;
  const CACHE_CLEANUP_INTERVAL = 30 * 1e3;
  const MAX_CACHE_SIZE = 1e3;
  let lastCacheCleanup = 0;
  module.exports._lastCacheCleanup = () => lastCacheCleanup;
  module.exports._resetCacheCleanup = () => {
    lastCacheCleanup = 0;
  };
  let networkInterfaces;
  try {
    networkInterfaces = os2.networkInterfaces();
  } catch (_err) {
  }
  module.exports.networkInterfaces = networkInterfaces;
  const isFamilySupported = (family, allowInternal) => {
    let networkInterfaces2 = module.exports.networkInterfaces;
    if (!networkInterfaces2) {
      return true;
    }
    const familySupported = (
      // crux that replaces Object.values(networkInterfaces) as Object.values is not supported in nodejs v6
      Object.keys(networkInterfaces2).map((key) => networkInterfaces2[key]).reduce((acc, val) => acc.concat(val), []).filter((i2) => !i2.internal || allowInternal).filter((i2) => i2.family === "IPv" + family || i2.family === family).length > 0
    );
    return familySupported;
  };
  const resolver = (family, hostname, options2, callback) => {
    options2 = options2 || {};
    const familySupported = isFamilySupported(family, options2.allowInternalNetworkInterfaces);
    if (!familySupported) {
      return callback(null, []);
    }
    const resolver2 = dns.Resolver ? new dns.Resolver(options2) : dns;
    resolver2["resolve" + family](hostname, (err, addresses) => {
      if (err) {
        switch (err.code) {
          case dns.NODATA:
          case dns.NOTFOUND:
          case dns.NOTIMP:
          case dns.SERVFAIL:
          case dns.CONNREFUSED:
          case dns.REFUSED:
          case "EAI_AGAIN":
            return callback(null, []);
        }
        return callback(err);
      }
      return callback(null, Array.isArray(addresses) ? addresses : [].concat(addresses || []));
    });
  };
  const dnsCache = module.exports.dnsCache = /* @__PURE__ */ new Map();
  const formatDNSValue = (value, extra) => {
    if (!value) {
      return Object.assign({}, extra || {});
    }
    let addresses = value.addresses || [];
    let host = null;
    if (addresses.length === 1) {
      host = addresses[0];
    } else if (addresses.length > 1) {
      host = addresses[Math.floor(Math.random() * addresses.length)];
    }
    return Object.assign(
      {
        servername: value.servername,
        host,
        // Include all addresses for connection fallback support
        _addresses: addresses
      },
      extra || {}
    );
  };
  module.exports.resolveHostname = (options2, callback) => {
    options2 = options2 || {};
    if (!options2.host && options2.servername) {
      options2.host = options2.servername;
    }
    if (!options2.host || net2.isIP(options2.host)) {
      let value = {
        addresses: [options2.host],
        servername: options2.servername || false
      };
      return callback(
        null,
        formatDNSValue(value, {
          cached: false
        })
      );
    }
    let cached;
    if (dnsCache.has(options2.host)) {
      cached = dnsCache.get(options2.host);
      const now = Date.now();
      if (now - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
        lastCacheCleanup = now;
        for (const [host, entry] of dnsCache.entries()) {
          if (entry.expires && entry.expires < now) {
            dnsCache.delete(host);
          }
        }
        if (dnsCache.size > MAX_CACHE_SIZE) {
          const toDelete = Math.floor(MAX_CACHE_SIZE * 0.1);
          const keys = Array.from(dnsCache.keys()).slice(0, toDelete);
          keys.forEach((key) => dnsCache.delete(key));
        }
      }
      if (!cached.expires || cached.expires >= now) {
        return callback(
          null,
          formatDNSValue(cached.value, {
            cached: true
          })
        );
      }
    }
    let ipv4Addresses = [];
    let ipv6Addresses = [];
    let ipv4Error = null;
    let ipv6Error = null;
    resolver(4, options2.host, options2, (err, addresses) => {
      if (err) {
        ipv4Error = err;
      } else {
        ipv4Addresses = addresses || [];
      }
      resolver(6, options2.host, options2, (err2, addresses2) => {
        if (err2) {
          ipv6Error = err2;
        } else {
          ipv6Addresses = addresses2 || [];
        }
        let allAddresses = ipv4Addresses.concat(ipv6Addresses);
        if (allAddresses.length) {
          let value = {
            addresses: allAddresses,
            servername: options2.servername || options2.host
          };
          dnsCache.set(options2.host, {
            value,
            expires: Date.now() + (options2.dnsTtl || DNS_TTL)
          });
          return callback(
            null,
            formatDNSValue(value, {
              cached: false
            })
          );
        }
        if (ipv4Error && ipv6Error) {
          if (cached) {
            dnsCache.set(options2.host, {
              value: cached.value,
              expires: Date.now() + (options2.dnsTtl || DNS_TTL)
            });
            return callback(
              null,
              formatDNSValue(cached.value, {
                cached: true,
                error: ipv4Error
              })
            );
          }
        }
        try {
          dns.lookup(options2.host, { all: true }, (err3, addresses3) => {
            if (err3) {
              if (cached) {
                dnsCache.set(options2.host, {
                  value: cached.value,
                  expires: Date.now() + (options2.dnsTtl || DNS_TTL)
                });
                return callback(
                  null,
                  formatDNSValue(cached.value, {
                    cached: true,
                    error: err3
                  })
                );
              }
              return callback(err3);
            }
            let supportedAddresses = addresses3 ? addresses3.filter((addr) => isFamilySupported(addr.family)).map((addr) => addr.address) : [];
            if (addresses3 && addresses3.length && !supportedAddresses.length) {
              console.warn(`Failed to resolve IPv${addresses3[0].family} addresses with current network`);
            }
            if (!supportedAddresses.length && cached) {
              return callback(
                null,
                formatDNSValue(cached.value, {
                  cached: true
                })
              );
            }
            let value = {
              addresses: supportedAddresses.length ? supportedAddresses : [options2.host],
              servername: options2.servername || options2.host
            };
            dnsCache.set(options2.host, {
              value,
              expires: Date.now() + (options2.dnsTtl || DNS_TTL)
            });
            return callback(
              null,
              formatDNSValue(value, {
                cached: false
              })
            );
          });
        } catch (lookupErr) {
          if (cached) {
            dnsCache.set(options2.host, {
              value: cached.value,
              expires: Date.now() + (options2.dnsTtl || DNS_TTL)
            });
            return callback(
              null,
              formatDNSValue(cached.value, {
                cached: true,
                error: lookupErr
              })
            );
          }
          return callback(ipv4Error || ipv6Error || lookupErr);
        }
      });
    });
  };
  module.exports.parseConnectionUrl = (str2) => {
    str2 = str2 || "";
    let options2 = {};
    [urllib2.parse(str2, true)].forEach((url) => {
      let auth;
      switch (url.protocol) {
        case "smtp:":
          options2.secure = false;
          break;
        case "smtps:":
          options2.secure = true;
          break;
        case "direct:":
          options2.direct = true;
          break;
      }
      if (!isNaN(url.port) && Number(url.port)) {
        options2.port = Number(url.port);
      }
      if (url.hostname) {
        options2.host = url.hostname;
      }
      if (url.auth) {
        auth = url.auth.split(":");
        if (!options2.auth) {
          options2.auth = {};
        }
        options2.auth.user = auth.shift();
        options2.auth.pass = auth.join(":");
      }
      Object.keys(url.query || {}).forEach((key) => {
        let obj = options2;
        let lKey = key;
        let value = url.query[key];
        if (!isNaN(value)) {
          value = Number(value);
        }
        switch (value) {
          case "true":
            value = true;
            break;
          case "false":
            value = false;
            break;
        }
        if (key.indexOf("tls.") === 0) {
          lKey = key.substr(4);
          if (!options2.tls) {
            options2.tls = {};
          }
          obj = options2.tls;
        } else if (key.indexOf(".") >= 0) {
          return;
        }
        if (!(lKey in obj)) {
          obj[lKey] = value;
        }
      });
    });
    return options2;
  };
  module.exports._logFunc = (logger, level, defaults2, data, message, ...args) => {
    let entry = {};
    Object.keys(defaults2 || {}).forEach((key) => {
      if (key !== "level") {
        entry[key] = defaults2[key];
      }
    });
    Object.keys(data || {}).forEach((key) => {
      if (key !== "level") {
        entry[key] = data[key];
      }
    });
    logger[level](entry, message, ...args);
  };
  module.exports.getLogger = (options2, defaults2) => {
    options2 = options2 || {};
    let response = {};
    let levels = ["trace", "debug", "info", "warn", "error", "fatal"];
    if (!options2.logger) {
      levels.forEach((level) => {
        response[level] = () => false;
      });
      return response;
    }
    let logger = options2.logger;
    if (options2.logger === true) {
      logger = createDefaultLogger(levels);
    }
    levels.forEach((level) => {
      response[level] = (data, message, ...args) => {
        module.exports._logFunc(logger, level, defaults2, data, message, ...args);
      };
    });
    return response;
  };
  module.exports.callbackPromise = (resolve, reject) => function() {
    let args = Array.from(arguments);
    let err = args.shift();
    if (err) {
      reject(err);
    } else {
      resolve(...args);
    }
  };
  module.exports.parseDataURI = (uri) => {
    if (typeof uri !== "string") {
      return null;
    }
    if (!uri.startsWith("data:")) {
      return null;
    }
    const commaPos = uri.indexOf(",");
    if (commaPos === -1) {
      return null;
    }
    const data = uri.substring(commaPos + 1);
    const metaStr = uri.substring("data:".length, commaPos);
    let encoding;
    const metaEntries = metaStr.split(";");
    if (metaEntries.length > 0) {
      const lastEntry = metaEntries[metaEntries.length - 1].toLowerCase().trim();
      if (["base64", "utf8", "utf-8"].includes(lastEntry) && lastEntry.indexOf("=") === -1) {
        encoding = lastEntry;
        metaEntries.pop();
      }
    }
    const contentType = metaEntries.length > 0 ? metaEntries.shift() : "application/octet-stream";
    const params = {};
    for (let i2 = 0; i2 < metaEntries.length; i2++) {
      const entry = metaEntries[i2];
      const sepPos = entry.indexOf("=");
      if (sepPos > 0) {
        const key = entry.substring(0, sepPos).trim();
        const value = entry.substring(sepPos + 1).trim();
        if (key) {
          params[key] = value;
        }
      }
    }
    let bufferData;
    try {
      if (encoding === "base64") {
        bufferData = Buffer.from(data, "base64");
      } else {
        try {
          bufferData = Buffer.from(decodeURIComponent(data));
        } catch (_decodeError) {
          bufferData = Buffer.from(data);
        }
      }
    } catch (_bufferError) {
      bufferData = Buffer.alloc(0);
    }
    return {
      data: bufferData,
      encoding: encoding || null,
      contentType: contentType || "application/octet-stream",
      params
    };
  };
  module.exports.resolveContent = (data, key, callback) => {
    let promise;
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = module.exports.callbackPromise(resolve, reject);
      });
    }
    let content = data && data[key] && data[key].content || data[key];
    let contentStream;
    let encoding = (typeof data[key] === "object" && data[key].encoding || "utf8").toString().toLowerCase().replace(/[-_\s]/g, "");
    if (!content) {
      return callback(null, content);
    }
    if (typeof content === "object") {
      if (typeof content.pipe === "function") {
        return resolveStream(content, (err, value) => {
          if (err) {
            return callback(err);
          }
          if (data[key].content) {
            data[key].content = value;
          } else {
            data[key] = value;
          }
          callback(null, value);
        });
      } else if (/^https?:\/\//i.test(content.path || content.href)) {
        contentStream = nmfetch2(content.path || content.href);
        return resolveStream(contentStream, callback);
      } else if (/^data:/i.test(content.path || content.href)) {
        let parsedDataUri = module.exports.parseDataURI(content.path || content.href);
        if (!parsedDataUri || !parsedDataUri.data) {
          return callback(null, Buffer.from(0));
        }
        return callback(null, parsedDataUri.data);
      } else if (content.path) {
        return resolveStream(fs2.createReadStream(content.path), callback);
      }
    }
    if (typeof data[key].content === "string" && !["utf8", "usascii", "ascii"].includes(encoding)) {
      content = Buffer.from(data[key].content, encoding);
    }
    setImmediate(() => callback(null, content));
    return promise;
  };
  module.exports.assign = function() {
    let args = Array.from(arguments);
    let target = args.shift() || {};
    args.forEach((source) => {
      Object.keys(source || {}).forEach((key) => {
        if (["tls", "auth"].includes(key) && source[key] && typeof source[key] === "object") {
          if (!target[key]) {
            target[key] = {};
          }
          Object.keys(source[key]).forEach((subKey) => {
            target[key][subKey] = source[key][subKey];
          });
        } else {
          target[key] = source[key];
        }
      });
    });
    return target;
  };
  module.exports.encodeXText = (str2) => {
    if (!/[^\x21-\x2A\x2C-\x3C\x3E-\x7E]/.test(str2)) {
      return str2;
    }
    let buf = Buffer.from(str2);
    let result = "";
    for (let i2 = 0, len = buf.length; i2 < len; i2++) {
      let c = buf[i2];
      if (c < 33 || c > 126 || c === 43 || c === 61) {
        result += "+" + (c < 16 ? "0" : "") + c.toString(16).toUpperCase();
      } else {
        result += String.fromCharCode(c);
      }
    }
    return result;
  };
  function resolveStream(stream2, callback) {
    let responded = false;
    let chunks = [];
    let chunklen = 0;
    stream2.on("error", (err) => {
      if (responded) {
        return;
      }
      responded = true;
      callback(err);
    });
    stream2.on("readable", () => {
      let chunk;
      while ((chunk = stream2.read()) !== null) {
        chunks.push(chunk);
        chunklen += chunk.length;
      }
    });
    stream2.on("end", () => {
      if (responded) {
        return;
      }
      responded = true;
      let value;
      try {
        value = Buffer.concat(chunks, chunklen);
      } catch (E) {
        return callback(E);
      }
      callback(null, value);
    });
  }
  function createDefaultLogger(levels) {
    let levelMaxLen = 0;
    let levelNames = /* @__PURE__ */ new Map();
    levels.forEach((level) => {
      if (level.length > levelMaxLen) {
        levelMaxLen = level.length;
      }
    });
    levels.forEach((level) => {
      let levelName = level.toUpperCase();
      if (levelName.length < levelMaxLen) {
        levelName += " ".repeat(levelMaxLen - levelName.length);
      }
      levelNames.set(level, levelName);
    });
    let print = (level, entry, message, ...args) => {
      let prefix = "";
      if (entry) {
        if (entry.tnx === "server") {
          prefix = "S: ";
        } else if (entry.tnx === "client") {
          prefix = "C: ";
        }
        if (entry.sid) {
          prefix = "[" + entry.sid + "] " + prefix;
        }
        if (entry.cid) {
          prefix = "[#" + entry.cid + "] " + prefix;
        }
      }
      message = util2.format(message, ...args);
      message.split(/\r?\n/).forEach((line) => {
        console.log("[%s] %s %s", (/* @__PURE__ */ new Date()).toISOString().substr(0, 19).replace(/T/, " "), levelNames.get(level), prefix + line);
      });
    };
    let logger = {};
    levels.forEach((level) => {
      logger[level] = print.bind(null, level);
    });
    return logger;
  }
})(shared);
var sharedExports = shared.exports;
const path$m = require$$1;
const defaultMimeType = "application/octet-stream";
const defaultExtension = "bin";
const mimeTypes$1 = /* @__PURE__ */ new Map([
  ["application/acad", "dwg"],
  ["application/applixware", "aw"],
  ["application/arj", "arj"],
  ["application/atom+xml", "xml"],
  ["application/atomcat+xml", "atomcat"],
  ["application/atomsvc+xml", "atomsvc"],
  ["application/base64", ["mm", "mme"]],
  ["application/binhex", "hqx"],
  ["application/binhex4", "hqx"],
  ["application/book", ["book", "boo"]],
  ["application/ccxml+xml,", "ccxml"],
  ["application/cdf", "cdf"],
  ["application/cdmi-capability", "cdmia"],
  ["application/cdmi-container", "cdmic"],
  ["application/cdmi-domain", "cdmid"],
  ["application/cdmi-object", "cdmio"],
  ["application/cdmi-queue", "cdmiq"],
  ["application/clariscad", "ccad"],
  ["application/commonground", "dp"],
  ["application/cu-seeme", "cu"],
  ["application/davmount+xml", "davmount"],
  ["application/drafting", "drw"],
  ["application/dsptype", "tsp"],
  ["application/dssc+der", "dssc"],
  ["application/dssc+xml", "xdssc"],
  ["application/dxf", "dxf"],
  ["application/ecmascript", ["js", "es"]],
  ["application/emma+xml", "emma"],
  ["application/envoy", "evy"],
  ["application/epub+zip", "epub"],
  ["application/excel", ["xls", "xl", "xla", "xlb", "xlc", "xld", "xlk", "xll", "xlm", "xlt", "xlv", "xlw"]],
  ["application/exi", "exi"],
  ["application/font-tdpfr", "pfr"],
  ["application/fractals", "fif"],
  ["application/freeloader", "frl"],
  ["application/futuresplash", "spl"],
  ["application/geo+json", "geojson"],
  ["application/gnutar", "tgz"],
  ["application/groupwise", "vew"],
  ["application/hlp", "hlp"],
  ["application/hta", "hta"],
  ["application/hyperstudio", "stk"],
  ["application/i-deas", "unv"],
  ["application/iges", ["iges", "igs"]],
  ["application/inf", "inf"],
  ["application/internet-property-stream", "acx"],
  ["application/ipfix", "ipfix"],
  ["application/java", "class"],
  ["application/java-archive", "jar"],
  ["application/java-byte-code", "class"],
  ["application/java-serialized-object", "ser"],
  ["application/java-vm", "class"],
  ["application/javascript", "js"],
  ["application/json", "json"],
  ["application/lha", "lha"],
  ["application/lzx", "lzx"],
  ["application/mac-binary", "bin"],
  ["application/mac-binhex", "hqx"],
  ["application/mac-binhex40", "hqx"],
  ["application/mac-compactpro", "cpt"],
  ["application/macbinary", "bin"],
  ["application/mads+xml", "mads"],
  ["application/marc", "mrc"],
  ["application/marcxml+xml", "mrcx"],
  ["application/mathematica", "ma"],
  ["application/mathml+xml", "mathml"],
  ["application/mbedlet", "mbd"],
  ["application/mbox", "mbox"],
  ["application/mcad", "mcd"],
  ["application/mediaservercontrol+xml", "mscml"],
  ["application/metalink4+xml", "meta4"],
  ["application/mets+xml", "mets"],
  ["application/mime", "aps"],
  ["application/mods+xml", "mods"],
  ["application/mp21", "m21"],
  ["application/mp4", "mp4"],
  ["application/mspowerpoint", ["ppt", "pot", "pps", "ppz"]],
  ["application/msword", ["doc", "dot", "w6w", "wiz", "word"]],
  ["application/mswrite", "wri"],
  ["application/mxf", "mxf"],
  ["application/netmc", "mcp"],
  ["application/octet-stream", ["*"]],
  ["application/oda", "oda"],
  ["application/oebps-package+xml", "opf"],
  ["application/ogg", "ogx"],
  ["application/olescript", "axs"],
  ["application/onenote", "onetoc"],
  ["application/patch-ops-error+xml", "xer"],
  ["application/pdf", "pdf"],
  ["application/pgp-encrypted", "asc"],
  ["application/pgp-signature", "pgp"],
  ["application/pics-rules", "prf"],
  ["application/pkcs-12", "p12"],
  ["application/pkcs-crl", "crl"],
  ["application/pkcs10", "p10"],
  ["application/pkcs7-mime", ["p7c", "p7m"]],
  ["application/pkcs7-signature", "p7s"],
  ["application/pkcs8", "p8"],
  ["application/pkix-attr-cert", "ac"],
  ["application/pkix-cert", ["cer", "crt"]],
  ["application/pkix-crl", "crl"],
  ["application/pkix-pkipath", "pkipath"],
  ["application/pkixcmp", "pki"],
  ["application/plain", "text"],
  ["application/pls+xml", "pls"],
  ["application/postscript", ["ps", "ai", "eps"]],
  ["application/powerpoint", "ppt"],
  ["application/pro_eng", ["part", "prt"]],
  ["application/prs.cww", "cww"],
  ["application/pskc+xml", "pskcxml"],
  ["application/rdf+xml", "rdf"],
  ["application/reginfo+xml", "rif"],
  ["application/relax-ng-compact-syntax", "rnc"],
  ["application/resource-lists+xml", "rl"],
  ["application/resource-lists-diff+xml", "rld"],
  ["application/ringing-tones", "rng"],
  ["application/rls-services+xml", "rs"],
  ["application/rsd+xml", "rsd"],
  ["application/rss+xml", "xml"],
  ["application/rtf", ["rtf", "rtx"]],
  ["application/sbml+xml", "sbml"],
  ["application/scvp-cv-request", "scq"],
  ["application/scvp-cv-response", "scs"],
  ["application/scvp-vp-request", "spq"],
  ["application/scvp-vp-response", "spp"],
  ["application/sdp", "sdp"],
  ["application/sea", "sea"],
  ["application/set", "set"],
  ["application/set-payment-initiation", "setpay"],
  ["application/set-registration-initiation", "setreg"],
  ["application/shf+xml", "shf"],
  ["application/sla", "stl"],
  ["application/smil", ["smi", "smil"]],
  ["application/smil+xml", "smi"],
  ["application/solids", "sol"],
  ["application/sounder", "sdr"],
  ["application/sparql-query", "rq"],
  ["application/sparql-results+xml", "srx"],
  ["application/srgs", "gram"],
  ["application/srgs+xml", "grxml"],
  ["application/sru+xml", "sru"],
  ["application/ssml+xml", "ssml"],
  ["application/step", ["step", "stp"]],
  ["application/streamingmedia", "ssm"],
  ["application/tei+xml", "tei"],
  ["application/thraud+xml", "tfi"],
  ["application/timestamped-data", "tsd"],
  ["application/toolbook", "tbk"],
  ["application/vda", "vda"],
  ["application/vnd.3gpp.pic-bw-large", "plb"],
  ["application/vnd.3gpp.pic-bw-small", "psb"],
  ["application/vnd.3gpp.pic-bw-var", "pvb"],
  ["application/vnd.3gpp2.tcap", "tcap"],
  ["application/vnd.3m.post-it-notes", "pwn"],
  ["application/vnd.accpac.simply.aso", "aso"],
  ["application/vnd.accpac.simply.imp", "imp"],
  ["application/vnd.acucobol", "acu"],
  ["application/vnd.acucorp", "atc"],
  ["application/vnd.adobe.air-application-installer-package+zip", "air"],
  ["application/vnd.adobe.fxp", "fxp"],
  ["application/vnd.adobe.xdp+xml", "xdp"],
  ["application/vnd.adobe.xfdf", "xfdf"],
  ["application/vnd.ahead.space", "ahead"],
  ["application/vnd.airzip.filesecure.azf", "azf"],
  ["application/vnd.airzip.filesecure.azs", "azs"],
  ["application/vnd.amazon.ebook", "azw"],
  ["application/vnd.americandynamics.acc", "acc"],
  ["application/vnd.amiga.ami", "ami"],
  ["application/vnd.android.package-archive", "apk"],
  ["application/vnd.anser-web-certificate-issue-initiation", "cii"],
  ["application/vnd.anser-web-funds-transfer-initiation", "fti"],
  ["application/vnd.antix.game-component", "atx"],
  ["application/vnd.apple.installer+xml", "mpkg"],
  ["application/vnd.apple.mpegurl", "m3u8"],
  ["application/vnd.aristanetworks.swi", "swi"],
  ["application/vnd.audiograph", "aep"],
  ["application/vnd.blueice.multipass", "mpm"],
  ["application/vnd.bmi", "bmi"],
  ["application/vnd.businessobjects", "rep"],
  ["application/vnd.chemdraw+xml", "cdxml"],
  ["application/vnd.chipnuts.karaoke-mmd", "mmd"],
  ["application/vnd.cinderella", "cdy"],
  ["application/vnd.claymore", "cla"],
  ["application/vnd.cloanto.rp9", "rp9"],
  ["application/vnd.clonk.c4group", "c4g"],
  ["application/vnd.cluetrust.cartomobile-config", "c11amc"],
  ["application/vnd.cluetrust.cartomobile-config-pkg", "c11amz"],
  ["application/vnd.commonspace", "csp"],
  ["application/vnd.contact.cmsg", "cdbcmsg"],
  ["application/vnd.cosmocaller", "cmc"],
  ["application/vnd.crick.clicker", "clkx"],
  ["application/vnd.crick.clicker.keyboard", "clkk"],
  ["application/vnd.crick.clicker.palette", "clkp"],
  ["application/vnd.crick.clicker.template", "clkt"],
  ["application/vnd.crick.clicker.wordbank", "clkw"],
  ["application/vnd.criticaltools.wbs+xml", "wbs"],
  ["application/vnd.ctc-posml", "pml"],
  ["application/vnd.cups-ppd", "ppd"],
  ["application/vnd.curl.car", "car"],
  ["application/vnd.curl.pcurl", "pcurl"],
  ["application/vnd.data-vision.rdz", "rdz"],
  ["application/vnd.denovo.fcselayout-link", "fe_launch"],
  ["application/vnd.dna", "dna"],
  ["application/vnd.dolby.mlp", "mlp"],
  ["application/vnd.dpgraph", "dpg"],
  ["application/vnd.dreamfactory", "dfac"],
  ["application/vnd.dvb.ait", "ait"],
  ["application/vnd.dvb.service", "svc"],
  ["application/vnd.dynageo", "geo"],
  ["application/vnd.ecowin.chart", "mag"],
  ["application/vnd.enliven", "nml"],
  ["application/vnd.epson.esf", "esf"],
  ["application/vnd.epson.msf", "msf"],
  ["application/vnd.epson.quickanime", "qam"],
  ["application/vnd.epson.salt", "slt"],
  ["application/vnd.epson.ssf", "ssf"],
  ["application/vnd.eszigno3+xml", "es3"],
  ["application/vnd.ezpix-album", "ez2"],
  ["application/vnd.ezpix-package", "ez3"],
  ["application/vnd.fdf", "fdf"],
  ["application/vnd.fdsn.seed", "seed"],
  ["application/vnd.flographit", "gph"],
  ["application/vnd.fluxtime.clip", "ftc"],
  ["application/vnd.framemaker", "fm"],
  ["application/vnd.frogans.fnc", "fnc"],
  ["application/vnd.frogans.ltf", "ltf"],
  ["application/vnd.fsc.weblaunch", "fsc"],
  ["application/vnd.fujitsu.oasys", "oas"],
  ["application/vnd.fujitsu.oasys2", "oa2"],
  ["application/vnd.fujitsu.oasys3", "oa3"],
  ["application/vnd.fujitsu.oasysgp", "fg5"],
  ["application/vnd.fujitsu.oasysprs", "bh2"],
  ["application/vnd.fujixerox.ddd", "ddd"],
  ["application/vnd.fujixerox.docuworks", "xdw"],
  ["application/vnd.fujixerox.docuworks.binder", "xbd"],
  ["application/vnd.fuzzysheet", "fzs"],
  ["application/vnd.genomatix.tuxedo", "txd"],
  ["application/vnd.geogebra.file", "ggb"],
  ["application/vnd.geogebra.tool", "ggt"],
  ["application/vnd.geometry-explorer", "gex"],
  ["application/vnd.geonext", "gxt"],
  ["application/vnd.geoplan", "g2w"],
  ["application/vnd.geospace", "g3w"],
  ["application/vnd.gmx", "gmx"],
  ["application/vnd.google-earth.kml+xml", "kml"],
  ["application/vnd.google-earth.kmz", "kmz"],
  ["application/vnd.grafeq", "gqf"],
  ["application/vnd.groove-account", "gac"],
  ["application/vnd.groove-help", "ghf"],
  ["application/vnd.groove-identity-message", "gim"],
  ["application/vnd.groove-injector", "grv"],
  ["application/vnd.groove-tool-message", "gtm"],
  ["application/vnd.groove-tool-template", "tpl"],
  ["application/vnd.groove-vcard", "vcg"],
  ["application/vnd.hal+xml", "hal"],
  ["application/vnd.handheld-entertainment+xml", "zmm"],
  ["application/vnd.hbci", "hbci"],
  ["application/vnd.hhe.lesson-player", "les"],
  ["application/vnd.hp-hpgl", ["hgl", "hpg", "hpgl"]],
  ["application/vnd.hp-hpid", "hpid"],
  ["application/vnd.hp-hps", "hps"],
  ["application/vnd.hp-jlyt", "jlt"],
  ["application/vnd.hp-pcl", "pcl"],
  ["application/vnd.hp-pclxl", "pclxl"],
  ["application/vnd.hydrostatix.sof-data", "sfd-hdstx"],
  ["application/vnd.hzn-3d-crossword", "x3d"],
  ["application/vnd.ibm.minipay", "mpy"],
  ["application/vnd.ibm.modcap", "afp"],
  ["application/vnd.ibm.rights-management", "irm"],
  ["application/vnd.ibm.secure-container", "sc"],
  ["application/vnd.iccprofile", "icc"],
  ["application/vnd.igloader", "igl"],
  ["application/vnd.immervision-ivp", "ivp"],
  ["application/vnd.immervision-ivu", "ivu"],
  ["application/vnd.insors.igm", "igm"],
  ["application/vnd.intercon.formnet", "xpw"],
  ["application/vnd.intergeo", "i2g"],
  ["application/vnd.intu.qbo", "qbo"],
  ["application/vnd.intu.qfx", "qfx"],
  ["application/vnd.ipunplugged.rcprofile", "rcprofile"],
  ["application/vnd.irepository.package+xml", "irp"],
  ["application/vnd.is-xpr", "xpr"],
  ["application/vnd.isac.fcs", "fcs"],
  ["application/vnd.jam", "jam"],
  ["application/vnd.jcp.javame.midlet-rms", "rms"],
  ["application/vnd.jisp", "jisp"],
  ["application/vnd.joost.joda-archive", "joda"],
  ["application/vnd.kahootz", "ktz"],
  ["application/vnd.kde.karbon", "karbon"],
  ["application/vnd.kde.kchart", "chrt"],
  ["application/vnd.kde.kformula", "kfo"],
  ["application/vnd.kde.kivio", "flw"],
  ["application/vnd.kde.kontour", "kon"],
  ["application/vnd.kde.kpresenter", "kpr"],
  ["application/vnd.kde.kspread", "ksp"],
  ["application/vnd.kde.kword", "kwd"],
  ["application/vnd.kenameaapp", "htke"],
  ["application/vnd.kidspiration", "kia"],
  ["application/vnd.kinar", "kne"],
  ["application/vnd.koan", "skp"],
  ["application/vnd.kodak-descriptor", "sse"],
  ["application/vnd.las.las+xml", "lasxml"],
  ["application/vnd.llamagraphics.life-balance.desktop", "lbd"],
  ["application/vnd.llamagraphics.life-balance.exchange+xml", "lbe"],
  ["application/vnd.lotus-1-2-3", "123"],
  ["application/vnd.lotus-approach", "apr"],
  ["application/vnd.lotus-freelance", "pre"],
  ["application/vnd.lotus-notes", "nsf"],
  ["application/vnd.lotus-organizer", "org"],
  ["application/vnd.lotus-screencam", "scm"],
  ["application/vnd.lotus-wordpro", "lwp"],
  ["application/vnd.macports.portpkg", "portpkg"],
  ["application/vnd.mcd", "mcd"],
  ["application/vnd.medcalcdata", "mc1"],
  ["application/vnd.mediastation.cdkey", "cdkey"],
  ["application/vnd.mfer", "mwf"],
  ["application/vnd.mfmp", "mfm"],
  ["application/vnd.micrografx.flo", "flo"],
  ["application/vnd.micrografx.igx", "igx"],
  ["application/vnd.mif", "mif"],
  ["application/vnd.mobius.daf", "daf"],
  ["application/vnd.mobius.dis", "dis"],
  ["application/vnd.mobius.mbk", "mbk"],
  ["application/vnd.mobius.mqy", "mqy"],
  ["application/vnd.mobius.msl", "msl"],
  ["application/vnd.mobius.plc", "plc"],
  ["application/vnd.mobius.txf", "txf"],
  ["application/vnd.mophun.application", "mpn"],
  ["application/vnd.mophun.certificate", "mpc"],
  ["application/vnd.mozilla.xul+xml", "xul"],
  ["application/vnd.ms-artgalry", "cil"],
  ["application/vnd.ms-cab-compressed", "cab"],
  ["application/vnd.ms-excel", ["xls", "xla", "xlc", "xlm", "xlt", "xlw", "xlb", "xll"]],
  ["application/vnd.ms-excel.addin.macroenabled.12", "xlam"],
  ["application/vnd.ms-excel.sheet.binary.macroenabled.12", "xlsb"],
  ["application/vnd.ms-excel.sheet.macroenabled.12", "xlsm"],
  ["application/vnd.ms-excel.template.macroenabled.12", "xltm"],
  ["application/vnd.ms-fontobject", "eot"],
  ["application/vnd.ms-htmlhelp", "chm"],
  ["application/vnd.ms-ims", "ims"],
  ["application/vnd.ms-lrm", "lrm"],
  ["application/vnd.ms-officetheme", "thmx"],
  ["application/vnd.ms-outlook", "msg"],
  ["application/vnd.ms-pki.certstore", "sst"],
  ["application/vnd.ms-pki.pko", "pko"],
  ["application/vnd.ms-pki.seccat", "cat"],
  ["application/vnd.ms-pki.stl", "stl"],
  ["application/vnd.ms-pkicertstore", "sst"],
  ["application/vnd.ms-pkiseccat", "cat"],
  ["application/vnd.ms-pkistl", "stl"],
  ["application/vnd.ms-powerpoint", ["ppt", "pot", "pps", "ppa", "pwz"]],
  ["application/vnd.ms-powerpoint.addin.macroenabled.12", "ppam"],
  ["application/vnd.ms-powerpoint.presentation.macroenabled.12", "pptm"],
  ["application/vnd.ms-powerpoint.slide.macroenabled.12", "sldm"],
  ["application/vnd.ms-powerpoint.slideshow.macroenabled.12", "ppsm"],
  ["application/vnd.ms-powerpoint.template.macroenabled.12", "potm"],
  ["application/vnd.ms-project", "mpp"],
  ["application/vnd.ms-word.document.macroenabled.12", "docm"],
  ["application/vnd.ms-word.template.macroenabled.12", "dotm"],
  ["application/vnd.ms-works", ["wks", "wcm", "wdb", "wps"]],
  ["application/vnd.ms-wpl", "wpl"],
  ["application/vnd.ms-xpsdocument", "xps"],
  ["application/vnd.mseq", "mseq"],
  ["application/vnd.musician", "mus"],
  ["application/vnd.muvee.style", "msty"],
  ["application/vnd.neurolanguage.nlu", "nlu"],
  ["application/vnd.noblenet-directory", "nnd"],
  ["application/vnd.noblenet-sealer", "nns"],
  ["application/vnd.noblenet-web", "nnw"],
  ["application/vnd.nokia.configuration-message", "ncm"],
  ["application/vnd.nokia.n-gage.data", "ngdat"],
  ["application/vnd.nokia.n-gage.symbian.install", "n-gage"],
  ["application/vnd.nokia.radio-preset", "rpst"],
  ["application/vnd.nokia.radio-presets", "rpss"],
  ["application/vnd.nokia.ringing-tone", "rng"],
  ["application/vnd.novadigm.edm", "edm"],
  ["application/vnd.novadigm.edx", "edx"],
  ["application/vnd.novadigm.ext", "ext"],
  ["application/vnd.oasis.opendocument.chart", "odc"],
  ["application/vnd.oasis.opendocument.chart-template", "otc"],
  ["application/vnd.oasis.opendocument.database", "odb"],
  ["application/vnd.oasis.opendocument.formula", "odf"],
  ["application/vnd.oasis.opendocument.formula-template", "odft"],
  ["application/vnd.oasis.opendocument.graphics", "odg"],
  ["application/vnd.oasis.opendocument.graphics-template", "otg"],
  ["application/vnd.oasis.opendocument.image", "odi"],
  ["application/vnd.oasis.opendocument.image-template", "oti"],
  ["application/vnd.oasis.opendocument.presentation", "odp"],
  ["application/vnd.oasis.opendocument.presentation-template", "otp"],
  ["application/vnd.oasis.opendocument.spreadsheet", "ods"],
  ["application/vnd.oasis.opendocument.spreadsheet-template", "ots"],
  ["application/vnd.oasis.opendocument.text", "odt"],
  ["application/vnd.oasis.opendocument.text-master", "odm"],
  ["application/vnd.oasis.opendocument.text-template", "ott"],
  ["application/vnd.oasis.opendocument.text-web", "oth"],
  ["application/vnd.olpc-sugar", "xo"],
  ["application/vnd.oma.dd2+xml", "dd2"],
  ["application/vnd.openofficeorg.extension", "oxt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.slide", "sldx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.slideshow", "ppsx"],
  ["application/vnd.openxmlformats-officedocument.presentationml.template", "potx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.template", "xltx"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.template", "dotx"],
  ["application/vnd.osgeo.mapguide.package", "mgp"],
  ["application/vnd.osgi.dp", "dp"],
  ["application/vnd.palm", "pdb"],
  ["application/vnd.pawaafile", "paw"],
  ["application/vnd.pg.format", "str"],
  ["application/vnd.pg.osasli", "ei6"],
  ["application/vnd.picsel", "efif"],
  ["application/vnd.pmi.widget", "wg"],
  ["application/vnd.pocketlearn", "plf"],
  ["application/vnd.powerbuilder6", "pbd"],
  ["application/vnd.previewsystems.box", "box"],
  ["application/vnd.proteus.magazine", "mgz"],
  ["application/vnd.publishare-delta-tree", "qps"],
  ["application/vnd.pvi.ptid1", "ptid"],
  ["application/vnd.quark.quarkxpress", "qxd"],
  ["application/vnd.realvnc.bed", "bed"],
  ["application/vnd.recordare.musicxml", "mxl"],
  ["application/vnd.recordare.musicxml+xml", "musicxml"],
  ["application/vnd.rig.cryptonote", "cryptonote"],
  ["application/vnd.rim.cod", "cod"],
  ["application/vnd.rn-realmedia", "rm"],
  ["application/vnd.rn-realplayer", "rnx"],
  ["application/vnd.route66.link66+xml", "link66"],
  ["application/vnd.sailingtracker.track", "st"],
  ["application/vnd.seemail", "see"],
  ["application/vnd.sema", "sema"],
  ["application/vnd.semd", "semd"],
  ["application/vnd.semf", "semf"],
  ["application/vnd.shana.informed.formdata", "ifm"],
  ["application/vnd.shana.informed.formtemplate", "itp"],
  ["application/vnd.shana.informed.interchange", "iif"],
  ["application/vnd.shana.informed.package", "ipk"],
  ["application/vnd.simtech-mindmapper", "twd"],
  ["application/vnd.smaf", "mmf"],
  ["application/vnd.smart.teacher", "teacher"],
  ["application/vnd.solent.sdkm+xml", "sdkm"],
  ["application/vnd.spotfire.dxp", "dxp"],
  ["application/vnd.spotfire.sfs", "sfs"],
  ["application/vnd.stardivision.calc", "sdc"],
  ["application/vnd.stardivision.draw", "sda"],
  ["application/vnd.stardivision.impress", "sdd"],
  ["application/vnd.stardivision.math", "smf"],
  ["application/vnd.stardivision.writer", "sdw"],
  ["application/vnd.stardivision.writer-global", "sgl"],
  ["application/vnd.stepmania.stepchart", "sm"],
  ["application/vnd.sun.xml.calc", "sxc"],
  ["application/vnd.sun.xml.calc.template", "stc"],
  ["application/vnd.sun.xml.draw", "sxd"],
  ["application/vnd.sun.xml.draw.template", "std"],
  ["application/vnd.sun.xml.impress", "sxi"],
  ["application/vnd.sun.xml.impress.template", "sti"],
  ["application/vnd.sun.xml.math", "sxm"],
  ["application/vnd.sun.xml.writer", "sxw"],
  ["application/vnd.sun.xml.writer.global", "sxg"],
  ["application/vnd.sun.xml.writer.template", "stw"],
  ["application/vnd.sus-calendar", "sus"],
  ["application/vnd.svd", "svd"],
  ["application/vnd.symbian.install", "sis"],
  ["application/vnd.syncml+xml", "xsm"],
  ["application/vnd.syncml.dm+wbxml", "bdm"],
  ["application/vnd.syncml.dm+xml", "xdm"],
  ["application/vnd.tao.intent-module-archive", "tao"],
  ["application/vnd.tmobile-livetv", "tmo"],
  ["application/vnd.trid.tpt", "tpt"],
  ["application/vnd.triscape.mxs", "mxs"],
  ["application/vnd.trueapp", "tra"],
  ["application/vnd.ufdl", "ufd"],
  ["application/vnd.uiq.theme", "utz"],
  ["application/vnd.umajin", "umj"],
  ["application/vnd.unity", "unityweb"],
  ["application/vnd.uoml+xml", "uoml"],
  ["application/vnd.vcx", "vcx"],
  ["application/vnd.visio", "vsd"],
  ["application/vnd.visionary", "vis"],
  ["application/vnd.vsf", "vsf"],
  ["application/vnd.wap.wbxml", "wbxml"],
  ["application/vnd.wap.wmlc", "wmlc"],
  ["application/vnd.wap.wmlscriptc", "wmlsc"],
  ["application/vnd.webturbo", "wtb"],
  ["application/vnd.wolfram.player", "nbp"],
  ["application/vnd.wordperfect", "wpd"],
  ["application/vnd.wqd", "wqd"],
  ["application/vnd.wt.stf", "stf"],
  ["application/vnd.xara", ["web", "xar"]],
  ["application/vnd.xfdl", "xfdl"],
  ["application/vnd.yamaha.hv-dic", "hvd"],
  ["application/vnd.yamaha.hv-script", "hvs"],
  ["application/vnd.yamaha.hv-voice", "hvp"],
  ["application/vnd.yamaha.openscoreformat", "osf"],
  ["application/vnd.yamaha.openscoreformat.osfpvg+xml", "osfpvg"],
  ["application/vnd.yamaha.smaf-audio", "saf"],
  ["application/vnd.yamaha.smaf-phrase", "spf"],
  ["application/vnd.yellowriver-custom-menu", "cmp"],
  ["application/vnd.zul", "zir"],
  ["application/vnd.zzazz.deck+xml", "zaz"],
  ["application/vocaltec-media-desc", "vmd"],
  ["application/vocaltec-media-file", "vmf"],
  ["application/voicexml+xml", "vxml"],
  ["application/widget", "wgt"],
  ["application/winhlp", "hlp"],
  ["application/wordperfect", ["wp", "wp5", "wp6", "wpd"]],
  ["application/wordperfect6.0", ["w60", "wp5"]],
  ["application/wordperfect6.1", "w61"],
  ["application/wsdl+xml", "wsdl"],
  ["application/wspolicy+xml", "wspolicy"],
  ["application/x-123", "wk1"],
  ["application/x-7z-compressed", "7z"],
  ["application/x-abiword", "abw"],
  ["application/x-ace-compressed", "ace"],
  ["application/x-aim", "aim"],
  ["application/x-authorware-bin", "aab"],
  ["application/x-authorware-map", "aam"],
  ["application/x-authorware-seg", "aas"],
  ["application/x-bcpio", "bcpio"],
  ["application/x-binary", "bin"],
  ["application/x-binhex40", "hqx"],
  ["application/x-bittorrent", "torrent"],
  ["application/x-bsh", ["bsh", "sh", "shar"]],
  ["application/x-bytecode.elisp", "elc"],
  ["application/x-bytecode.python", "pyc"],
  ["application/x-bzip", "bz"],
  ["application/x-bzip2", ["boz", "bz2"]],
  ["application/x-cdf", "cdf"],
  ["application/x-cdlink", "vcd"],
  ["application/x-chat", ["cha", "chat"]],
  ["application/x-chess-pgn", "pgn"],
  ["application/x-cmu-raster", "ras"],
  ["application/x-cocoa", "cco"],
  ["application/x-compactpro", "cpt"],
  ["application/x-compress", "z"],
  ["application/x-compressed", ["tgz", "gz", "z", "zip"]],
  ["application/x-conference", "nsc"],
  ["application/x-cpio", "cpio"],
  ["application/x-cpt", "cpt"],
  ["application/x-csh", "csh"],
  ["application/x-debian-package", "deb"],
  ["application/x-deepv", "deepv"],
  ["application/x-director", ["dir", "dcr", "dxr"]],
  ["application/x-doom", "wad"],
  ["application/x-dtbncx+xml", "ncx"],
  ["application/x-dtbook+xml", "dtb"],
  ["application/x-dtbresource+xml", "res"],
  ["application/x-dvi", "dvi"],
  ["application/x-elc", "elc"],
  ["application/x-envoy", ["env", "evy"]],
  ["application/x-esrehber", "es"],
  ["application/x-excel", ["xls", "xla", "xlb", "xlc", "xld", "xlk", "xll", "xlm", "xlt", "xlv", "xlw"]],
  ["application/x-font-bdf", "bdf"],
  ["application/x-font-ghostscript", "gsf"],
  ["application/x-font-linux-psf", "psf"],
  ["application/x-font-otf", "otf"],
  ["application/x-font-pcf", "pcf"],
  ["application/x-font-snf", "snf"],
  ["application/x-font-ttf", "ttf"],
  ["application/x-font-type1", "pfa"],
  ["application/x-font-woff", "woff"],
  ["application/x-frame", "mif"],
  ["application/x-freelance", "pre"],
  ["application/x-futuresplash", "spl"],
  ["application/x-gnumeric", "gnumeric"],
  ["application/x-gsp", "gsp"],
  ["application/x-gss", "gss"],
  ["application/x-gtar", "gtar"],
  ["application/x-gzip", ["gz", "gzip"]],
  ["application/x-hdf", "hdf"],
  ["application/x-helpfile", ["help", "hlp"]],
  ["application/x-httpd-imap", "imap"],
  ["application/x-ima", "ima"],
  ["application/x-internet-signup", ["ins", "isp"]],
  ["application/x-internett-signup", "ins"],
  ["application/x-inventor", "iv"],
  ["application/x-ip2", "ip"],
  ["application/x-iphone", "iii"],
  ["application/x-java-class", "class"],
  ["application/x-java-commerce", "jcm"],
  ["application/x-java-jnlp-file", "jnlp"],
  ["application/x-javascript", "js"],
  ["application/x-koan", ["skd", "skm", "skp", "skt"]],
  ["application/x-ksh", "ksh"],
  ["application/x-latex", ["latex", "ltx"]],
  ["application/x-lha", "lha"],
  ["application/x-lisp", "lsp"],
  ["application/x-livescreen", "ivy"],
  ["application/x-lotus", "wq1"],
  ["application/x-lotusscreencam", "scm"],
  ["application/x-lzh", "lzh"],
  ["application/x-lzx", "lzx"],
  ["application/x-mac-binhex40", "hqx"],
  ["application/x-macbinary", "bin"],
  ["application/x-magic-cap-package-1.0", "mc$"],
  ["application/x-mathcad", "mcd"],
  ["application/x-meme", "mm"],
  ["application/x-midi", ["mid", "midi"]],
  ["application/x-mif", "mif"],
  ["application/x-mix-transfer", "nix"],
  ["application/x-mobipocket-ebook", "prc"],
  ["application/x-mplayer2", "asx"],
  ["application/x-ms-application", "application"],
  ["application/x-ms-wmd", "wmd"],
  ["application/x-ms-wmz", "wmz"],
  ["application/x-ms-xbap", "xbap"],
  ["application/x-msaccess", "mdb"],
  ["application/x-msbinder", "obd"],
  ["application/x-mscardfile", "crd"],
  ["application/x-msclip", "clp"],
  ["application/x-msdownload", ["exe", "dll"]],
  ["application/x-msexcel", ["xls", "xla", "xlw"]],
  ["application/x-msmediaview", ["mvb", "m13", "m14"]],
  ["application/x-msmetafile", "wmf"],
  ["application/x-msmoney", "mny"],
  ["application/x-mspowerpoint", "ppt"],
  ["application/x-mspublisher", "pub"],
  ["application/x-msschedule", "scd"],
  ["application/x-msterminal", "trm"],
  ["application/x-mswrite", "wri"],
  ["application/x-navi-animation", "ani"],
  ["application/x-navidoc", "nvd"],
  ["application/x-navimap", "map"],
  ["application/x-navistyle", "stl"],
  ["application/x-netcdf", ["cdf", "nc"]],
  ["application/x-newton-compatible-pkg", "pkg"],
  ["application/x-nokia-9000-communicator-add-on-software", "aos"],
  ["application/x-omc", "omc"],
  ["application/x-omcdatamaker", "omcd"],
  ["application/x-omcregerator", "omcr"],
  ["application/x-pagemaker", ["pm4", "pm5"]],
  ["application/x-pcl", "pcl"],
  ["application/x-perfmon", ["pma", "pmc", "pml", "pmr", "pmw"]],
  ["application/x-pixclscript", "plx"],
  ["application/x-pkcs10", "p10"],
  ["application/x-pkcs12", ["p12", "pfx"]],
  ["application/x-pkcs7-certificates", ["p7b", "spc"]],
  ["application/x-pkcs7-certreqresp", "p7r"],
  ["application/x-pkcs7-mime", ["p7m", "p7c"]],
  ["application/x-pkcs7-signature", ["p7s", "p7a"]],
  ["application/x-pointplus", "css"],
  ["application/x-portable-anymap", "pnm"],
  ["application/x-project", ["mpc", "mpt", "mpv", "mpx"]],
  ["application/x-qpro", "wb1"],
  ["application/x-rar-compressed", "rar"],
  ["application/x-rtf", "rtf"],
  ["application/x-sdp", "sdp"],
  ["application/x-sea", "sea"],
  ["application/x-seelogo", "sl"],
  ["application/x-sh", "sh"],
  ["application/x-shar", ["shar", "sh"]],
  ["application/x-shockwave-flash", "swf"],
  ["application/x-silverlight-app", "xap"],
  ["application/x-sit", "sit"],
  ["application/x-sprite", ["spr", "sprite"]],
  ["application/x-stuffit", "sit"],
  ["application/x-stuffitx", "sitx"],
  ["application/x-sv4cpio", "sv4cpio"],
  ["application/x-sv4crc", "sv4crc"],
  ["application/x-tar", "tar"],
  ["application/x-tbook", ["sbk", "tbk"]],
  ["application/x-tcl", "tcl"],
  ["application/x-tex", "tex"],
  ["application/x-tex-tfm", "tfm"],
  ["application/x-texinfo", ["texi", "texinfo"]],
  ["application/x-troff", ["roff", "t", "tr"]],
  ["application/x-troff-man", "man"],
  ["application/x-troff-me", "me"],
  ["application/x-troff-ms", "ms"],
  ["application/x-troff-msvideo", "avi"],
  ["application/x-ustar", "ustar"],
  ["application/x-visio", ["vsd", "vst", "vsw"]],
  ["application/x-vnd.audioexplosion.mzz", "mzz"],
  ["application/x-vnd.ls-xpix", "xpix"],
  ["application/x-vrml", "vrml"],
  ["application/x-wais-source", ["src", "wsrc"]],
  ["application/x-winhelp", "hlp"],
  ["application/x-wintalk", "wtk"],
  ["application/x-world", ["wrl", "svr"]],
  ["application/x-wpwin", "wpd"],
  ["application/x-wri", "wri"],
  ["application/x-x509-ca-cert", ["cer", "crt", "der"]],
  ["application/x-x509-user-cert", "crt"],
  ["application/x-xfig", "fig"],
  ["application/x-xpinstall", "xpi"],
  ["application/x-zip-compressed", "zip"],
  ["application/xcap-diff+xml", "xdf"],
  ["application/xenc+xml", "xenc"],
  ["application/xhtml+xml", "xhtml"],
  ["application/xml", "xml"],
  ["application/xml-dtd", "dtd"],
  ["application/xop+xml", "xop"],
  ["application/xslt+xml", "xslt"],
  ["application/xspf+xml", "xspf"],
  ["application/xv+xml", "mxml"],
  ["application/yang", "yang"],
  ["application/yin+xml", "yin"],
  ["application/ynd.ms-pkipko", "pko"],
  ["application/zip", "zip"],
  ["audio/adpcm", "adp"],
  ["audio/aiff", ["aiff", "aif", "aifc"]],
  ["audio/basic", ["snd", "au"]],
  ["audio/it", "it"],
  ["audio/make", ["funk", "my", "pfunk"]],
  ["audio/make.my.funk", "pfunk"],
  ["audio/mid", ["mid", "rmi"]],
  ["audio/midi", ["midi", "kar", "mid"]],
  ["audio/mod", "mod"],
  ["audio/mp4", "mp4a"],
  ["audio/mpeg", ["mpga", "mp3", "m2a", "mp2", "mpa", "mpg"]],
  ["audio/mpeg3", "mp3"],
  ["audio/nspaudio", ["la", "lma"]],
  ["audio/ogg", "oga"],
  ["audio/s3m", "s3m"],
  ["audio/tsp-audio", "tsi"],
  ["audio/tsplayer", "tsp"],
  ["audio/vnd.dece.audio", "uva"],
  ["audio/vnd.digital-winds", "eol"],
  ["audio/vnd.dra", "dra"],
  ["audio/vnd.dts", "dts"],
  ["audio/vnd.dts.hd", "dtshd"],
  ["audio/vnd.lucent.voice", "lvp"],
  ["audio/vnd.ms-playready.media.pya", "pya"],
  ["audio/vnd.nuera.ecelp4800", "ecelp4800"],
  ["audio/vnd.nuera.ecelp7470", "ecelp7470"],
  ["audio/vnd.nuera.ecelp9600", "ecelp9600"],
  ["audio/vnd.qcelp", "qcp"],
  ["audio/vnd.rip", "rip"],
  ["audio/voc", "voc"],
  ["audio/voxware", "vox"],
  ["audio/wav", "wav"],
  ["audio/webm", "weba"],
  ["audio/x-aac", "aac"],
  ["audio/x-adpcm", "snd"],
  ["audio/x-aiff", ["aiff", "aif", "aifc"]],
  ["audio/x-au", "au"],
  ["audio/x-gsm", ["gsd", "gsm"]],
  ["audio/x-jam", "jam"],
  ["audio/x-liveaudio", "lam"],
  ["audio/x-mid", ["mid", "midi"]],
  ["audio/x-midi", ["midi", "mid"]],
  ["audio/x-mod", "mod"],
  ["audio/x-mpeg", "mp2"],
  ["audio/x-mpeg-3", "mp3"],
  ["audio/x-mpegurl", "m3u"],
  ["audio/x-mpequrl", "m3u"],
  ["audio/x-ms-wax", "wax"],
  ["audio/x-ms-wma", "wma"],
  ["audio/x-nspaudio", ["la", "lma"]],
  ["audio/x-pn-realaudio", ["ra", "ram", "rm", "rmm", "rmp"]],
  ["audio/x-pn-realaudio-plugin", ["ra", "rmp", "rpm"]],
  ["audio/x-psid", "sid"],
  ["audio/x-realaudio", "ra"],
  ["audio/x-twinvq", "vqf"],
  ["audio/x-twinvq-plugin", ["vqe", "vql"]],
  ["audio/x-vnd.audioexplosion.mjuicemediafile", "mjf"],
  ["audio/x-voc", "voc"],
  ["audio/x-wav", "wav"],
  ["audio/xm", "xm"],
  ["chemical/x-cdx", "cdx"],
  ["chemical/x-cif", "cif"],
  ["chemical/x-cmdf", "cmdf"],
  ["chemical/x-cml", "cml"],
  ["chemical/x-csml", "csml"],
  ["chemical/x-pdb", ["pdb", "xyz"]],
  ["chemical/x-xyz", "xyz"],
  ["drawing/x-dwf", "dwf"],
  ["i-world/i-vrml", "ivr"],
  ["image/bmp", ["bmp", "bm"]],
  ["image/cgm", "cgm"],
  ["image/cis-cod", "cod"],
  ["image/cmu-raster", ["ras", "rast"]],
  ["image/fif", "fif"],
  ["image/florian", ["flo", "turbot"]],
  ["image/g3fax", "g3"],
  ["image/gif", "gif"],
  ["image/ief", ["ief", "iefs"]],
  ["image/jpeg", ["jpeg", "jpe", "jpg", "jfif", "jfif-tbnl"]],
  ["image/jutvision", "jut"],
  ["image/ktx", "ktx"],
  ["image/naplps", ["nap", "naplps"]],
  ["image/pict", ["pic", "pict"]],
  ["image/pipeg", "jfif"],
  ["image/pjpeg", ["jfif", "jpe", "jpeg", "jpg"]],
  ["image/png", ["png", "x-png"]],
  ["image/prs.btif", "btif"],
  ["image/svg+xml", "svg"],
  ["image/tiff", ["tif", "tiff"]],
  ["image/vasa", "mcf"],
  ["image/vnd.adobe.photoshop", "psd"],
  ["image/vnd.dece.graphic", "uvi"],
  ["image/vnd.djvu", "djvu"],
  ["image/vnd.dvb.subtitle", "sub"],
  ["image/vnd.dwg", ["dwg", "dxf", "svf"]],
  ["image/vnd.dxf", "dxf"],
  ["image/vnd.fastbidsheet", "fbs"],
  ["image/vnd.fpx", "fpx"],
  ["image/vnd.fst", "fst"],
  ["image/vnd.fujixerox.edmics-mmr", "mmr"],
  ["image/vnd.fujixerox.edmics-rlc", "rlc"],
  ["image/vnd.ms-modi", "mdi"],
  ["image/vnd.net-fpx", ["fpx", "npx"]],
  ["image/vnd.rn-realflash", "rf"],
  ["image/vnd.rn-realpix", "rp"],
  ["image/vnd.wap.wbmp", "wbmp"],
  ["image/vnd.xiff", "xif"],
  ["image/webp", "webp"],
  ["image/x-cmu-raster", "ras"],
  ["image/x-cmx", "cmx"],
  ["image/x-dwg", ["dwg", "dxf", "svf"]],
  ["image/x-freehand", "fh"],
  ["image/x-icon", "ico"],
  ["image/x-jg", "art"],
  ["image/x-jps", "jps"],
  ["image/x-niff", ["niff", "nif"]],
  ["image/x-pcx", "pcx"],
  ["image/x-pict", ["pct", "pic"]],
  ["image/x-portable-anymap", "pnm"],
  ["image/x-portable-bitmap", "pbm"],
  ["image/x-portable-graymap", "pgm"],
  ["image/x-portable-greymap", "pgm"],
  ["image/x-portable-pixmap", "ppm"],
  ["image/x-quicktime", ["qif", "qti", "qtif"]],
  ["image/x-rgb", "rgb"],
  ["image/x-tiff", ["tif", "tiff"]],
  ["image/x-windows-bmp", "bmp"],
  ["image/x-xbitmap", "xbm"],
  ["image/x-xbm", "xbm"],
  ["image/x-xpixmap", ["xpm", "pm"]],
  ["image/x-xwd", "xwd"],
  ["image/x-xwindowdump", "xwd"],
  ["image/xbm", "xbm"],
  ["image/xpm", "xpm"],
  ["message/rfc822", ["eml", "mht", "mhtml", "nws", "mime"]],
  ["model/iges", ["iges", "igs"]],
  ["model/mesh", "msh"],
  ["model/vnd.collada+xml", "dae"],
  ["model/vnd.dwf", "dwf"],
  ["model/vnd.gdl", "gdl"],
  ["model/vnd.gtw", "gtw"],
  ["model/vnd.mts", "mts"],
  ["model/vnd.vtu", "vtu"],
  ["model/vrml", ["vrml", "wrl", "wrz"]],
  ["model/x-pov", "pov"],
  ["multipart/x-gzip", "gzip"],
  ["multipart/x-ustar", "ustar"],
  ["multipart/x-zip", "zip"],
  ["music/crescendo", ["mid", "midi"]],
  ["music/x-karaoke", "kar"],
  ["paleovu/x-pv", "pvu"],
  ["text/asp", "asp"],
  ["text/calendar", "ics"],
  ["text/css", "css"],
  ["text/csv", "csv"],
  ["text/ecmascript", "js"],
  ["text/h323", "323"],
  ["text/html", ["html", "htm", "stm", "acgi", "htmls", "htx", "shtml"]],
  ["text/iuls", "uls"],
  ["text/javascript", "js"],
  ["text/mcf", "mcf"],
  ["text/n3", "n3"],
  ["text/pascal", "pas"],
  [
    "text/plain",
    [
      "txt",
      "bas",
      "c",
      "h",
      "c++",
      "cc",
      "com",
      "conf",
      "cxx",
      "def",
      "f",
      "f90",
      "for",
      "g",
      "hh",
      "idc",
      "jav",
      "java",
      "list",
      "log",
      "lst",
      "m",
      "mar",
      "pl",
      "sdml",
      "text"
    ]
  ],
  ["text/plain-bas", "par"],
  ["text/prs.lines.tag", "dsc"],
  ["text/richtext", ["rtx", "rt", "rtf"]],
  ["text/scriplet", "wsc"],
  ["text/scriptlet", "sct"],
  ["text/sgml", ["sgm", "sgml"]],
  ["text/tab-separated-values", "tsv"],
  ["text/troff", "t"],
  ["text/turtle", "ttl"],
  ["text/uri-list", ["uni", "unis", "uri", "uris"]],
  ["text/vnd.abc", "abc"],
  ["text/vnd.curl", "curl"],
  ["text/vnd.curl.dcurl", "dcurl"],
  ["text/vnd.curl.mcurl", "mcurl"],
  ["text/vnd.curl.scurl", "scurl"],
  ["text/vnd.fly", "fly"],
  ["text/vnd.fmi.flexstor", "flx"],
  ["text/vnd.graphviz", "gv"],
  ["text/vnd.in3d.3dml", "3dml"],
  ["text/vnd.in3d.spot", "spot"],
  ["text/vnd.rn-realtext", "rt"],
  ["text/vnd.sun.j2me.app-descriptor", "jad"],
  ["text/vnd.wap.wml", "wml"],
  ["text/vnd.wap.wmlscript", "wmls"],
  ["text/webviewhtml", "htt"],
  ["text/x-asm", ["asm", "s"]],
  ["text/x-audiosoft-intra", "aip"],
  ["text/x-c", ["c", "cc", "cpp"]],
  ["text/x-component", "htc"],
  ["text/x-fortran", ["for", "f", "f77", "f90"]],
  ["text/x-h", ["h", "hh"]],
  ["text/x-java-source", ["java", "jav"]],
  ["text/x-java-source,java", "java"],
  ["text/x-la-asf", "lsx"],
  ["text/x-m", "m"],
  ["text/x-pascal", "p"],
  ["text/x-script", "hlb"],
  ["text/x-script.csh", "csh"],
  ["text/x-script.elisp", "el"],
  ["text/x-script.guile", "scm"],
  ["text/x-script.ksh", "ksh"],
  ["text/x-script.lisp", "lsp"],
  ["text/x-script.perl", "pl"],
  ["text/x-script.perl-module", "pm"],
  ["text/x-script.phyton", "py"],
  ["text/x-script.rexx", "rexx"],
  ["text/x-script.scheme", "scm"],
  ["text/x-script.sh", "sh"],
  ["text/x-script.tcl", "tcl"],
  ["text/x-script.tcsh", "tcsh"],
  ["text/x-script.zsh", "zsh"],
  ["text/x-server-parsed-html", ["shtml", "ssi"]],
  ["text/x-setext", "etx"],
  ["text/x-sgml", ["sgm", "sgml"]],
  ["text/x-speech", ["spc", "talk"]],
  ["text/x-uil", "uil"],
  ["text/x-uuencode", ["uu", "uue"]],
  ["text/x-vcalendar", "vcs"],
  ["text/x-vcard", "vcf"],
  ["text/xml", "xml"],
  ["video/3gpp", "3gp"],
  ["video/3gpp2", "3g2"],
  ["video/animaflex", "afl"],
  ["video/avi", "avi"],
  ["video/avs-video", "avs"],
  ["video/dl", "dl"],
  ["video/fli", "fli"],
  ["video/gl", "gl"],
  ["video/h261", "h261"],
  ["video/h263", "h263"],
  ["video/h264", "h264"],
  ["video/jpeg", "jpgv"],
  ["video/jpm", "jpm"],
  ["video/mj2", "mj2"],
  ["video/mp4", "mp4"],
  ["video/mpeg", ["mpeg", "mp2", "mpa", "mpe", "mpg", "mpv2", "m1v", "m2v", "mp3"]],
  ["video/msvideo", "avi"],
  ["video/ogg", "ogv"],
  ["video/quicktime", ["mov", "qt", "moov"]],
  ["video/vdo", "vdo"],
  ["video/vivo", ["viv", "vivo"]],
  ["video/vnd.dece.hd", "uvh"],
  ["video/vnd.dece.mobile", "uvm"],
  ["video/vnd.dece.pd", "uvp"],
  ["video/vnd.dece.sd", "uvs"],
  ["video/vnd.dece.video", "uvv"],
  ["video/vnd.fvt", "fvt"],
  ["video/vnd.mpegurl", "mxu"],
  ["video/vnd.ms-playready.media.pyv", "pyv"],
  ["video/vnd.rn-realvideo", "rv"],
  ["video/vnd.uvvu.mp4", "uvu"],
  ["video/vnd.vivo", ["viv", "vivo"]],
  ["video/vosaic", "vos"],
  ["video/webm", "webm"],
  ["video/x-amt-demorun", "xdr"],
  ["video/x-amt-showrun", "xsr"],
  ["video/x-atomic3d-feature", "fmf"],
  ["video/x-dl", "dl"],
  ["video/x-dv", ["dif", "dv"]],
  ["video/x-f4v", "f4v"],
  ["video/x-fli", "fli"],
  ["video/x-flv", "flv"],
  ["video/x-gl", "gl"],
  ["video/x-isvideo", "isu"],
  ["video/x-la-asf", ["lsf", "lsx"]],
  ["video/x-m4v", "m4v"],
  ["video/x-motion-jpeg", "mjpg"],
  ["video/x-mpeg", ["mp3", "mp2"]],
  ["video/x-mpeq2a", "mp2"],
  ["video/x-ms-asf", ["asf", "asr", "asx"]],
  ["video/x-ms-asf-plugin", "asx"],
  ["video/x-ms-wm", "wm"],
  ["video/x-ms-wmv", "wmv"],
  ["video/x-ms-wmx", "wmx"],
  ["video/x-ms-wvx", "wvx"],
  ["video/x-msvideo", "avi"],
  ["video/x-qtc", "qtc"],
  ["video/x-scm", "scm"],
  ["video/x-sgi-movie", ["movie", "mv"]],
  ["windows/metafile", "wmf"],
  ["www/mime", "mime"],
  ["x-conference/x-cooltalk", "ice"],
  ["x-music/x-midi", ["mid", "midi"]],
  ["x-world/x-3dmf", ["3dm", "3dmf", "qd3", "qd3d"]],
  ["x-world/x-svr", "svr"],
  ["x-world/x-vrml", ["flr", "vrml", "wrl", "wrz", "xaf", "xof"]],
  ["x-world/x-vrt", "vrt"],
  ["xgl/drawing", "xgz"],
  ["xgl/movie", "xmz"]
]);
const extensions = /* @__PURE__ */ new Map([
  ["123", "application/vnd.lotus-1-2-3"],
  ["323", "text/h323"],
  ["*", "application/octet-stream"],
  ["3dm", "x-world/x-3dmf"],
  ["3dmf", "x-world/x-3dmf"],
  ["3dml", "text/vnd.in3d.3dml"],
  ["3g2", "video/3gpp2"],
  ["3gp", "video/3gpp"],
  ["7z", "application/x-7z-compressed"],
  ["a", "application/octet-stream"],
  ["aab", "application/x-authorware-bin"],
  ["aac", "audio/x-aac"],
  ["aam", "application/x-authorware-map"],
  ["aas", "application/x-authorware-seg"],
  ["abc", "text/vnd.abc"],
  ["abw", "application/x-abiword"],
  ["ac", "application/pkix-attr-cert"],
  ["acc", "application/vnd.americandynamics.acc"],
  ["ace", "application/x-ace-compressed"],
  ["acgi", "text/html"],
  ["acu", "application/vnd.acucobol"],
  ["acx", "application/internet-property-stream"],
  ["adp", "audio/adpcm"],
  ["aep", "application/vnd.audiograph"],
  ["afl", "video/animaflex"],
  ["afp", "application/vnd.ibm.modcap"],
  ["ahead", "application/vnd.ahead.space"],
  ["ai", "application/postscript"],
  ["aif", ["audio/aiff", "audio/x-aiff"]],
  ["aifc", ["audio/aiff", "audio/x-aiff"]],
  ["aiff", ["audio/aiff", "audio/x-aiff"]],
  ["aim", "application/x-aim"],
  ["aip", "text/x-audiosoft-intra"],
  ["air", "application/vnd.adobe.air-application-installer-package+zip"],
  ["ait", "application/vnd.dvb.ait"],
  ["ami", "application/vnd.amiga.ami"],
  ["ani", "application/x-navi-animation"],
  ["aos", "application/x-nokia-9000-communicator-add-on-software"],
  ["apk", "application/vnd.android.package-archive"],
  ["application", "application/x-ms-application"],
  ["apr", "application/vnd.lotus-approach"],
  ["aps", "application/mime"],
  ["arc", "application/octet-stream"],
  ["arj", ["application/arj", "application/octet-stream"]],
  ["art", "image/x-jg"],
  ["asf", "video/x-ms-asf"],
  ["asm", "text/x-asm"],
  ["aso", "application/vnd.accpac.simply.aso"],
  ["asp", "text/asp"],
  ["asr", "video/x-ms-asf"],
  ["asx", ["video/x-ms-asf", "application/x-mplayer2", "video/x-ms-asf-plugin"]],
  ["atc", "application/vnd.acucorp"],
  ["atomcat", "application/atomcat+xml"],
  ["atomsvc", "application/atomsvc+xml"],
  ["atx", "application/vnd.antix.game-component"],
  ["au", ["audio/basic", "audio/x-au"]],
  ["avi", ["video/avi", "video/msvideo", "application/x-troff-msvideo", "video/x-msvideo"]],
  ["avs", "video/avs-video"],
  ["aw", "application/applixware"],
  ["axs", "application/olescript"],
  ["azf", "application/vnd.airzip.filesecure.azf"],
  ["azs", "application/vnd.airzip.filesecure.azs"],
  ["azw", "application/vnd.amazon.ebook"],
  ["bas", "text/plain"],
  ["bcpio", "application/x-bcpio"],
  ["bdf", "application/x-font-bdf"],
  ["bdm", "application/vnd.syncml.dm+wbxml"],
  ["bed", "application/vnd.realvnc.bed"],
  ["bh2", "application/vnd.fujitsu.oasysprs"],
  [
    "bin",
    ["application/octet-stream", "application/mac-binary", "application/macbinary", "application/x-macbinary", "application/x-binary"]
  ],
  ["bm", "image/bmp"],
  ["bmi", "application/vnd.bmi"],
  ["bmp", ["image/bmp", "image/x-windows-bmp"]],
  ["boo", "application/book"],
  ["book", "application/book"],
  ["box", "application/vnd.previewsystems.box"],
  ["boz", "application/x-bzip2"],
  ["bsh", "application/x-bsh"],
  ["btif", "image/prs.btif"],
  ["bz", "application/x-bzip"],
  ["bz2", "application/x-bzip2"],
  ["c", ["text/plain", "text/x-c"]],
  ["c++", "text/plain"],
  ["c11amc", "application/vnd.cluetrust.cartomobile-config"],
  ["c11amz", "application/vnd.cluetrust.cartomobile-config-pkg"],
  ["c4g", "application/vnd.clonk.c4group"],
  ["cab", "application/vnd.ms-cab-compressed"],
  ["car", "application/vnd.curl.car"],
  ["cat", ["application/vnd.ms-pkiseccat", "application/vnd.ms-pki.seccat"]],
  ["cc", ["text/plain", "text/x-c"]],
  ["ccad", "application/clariscad"],
  ["cco", "application/x-cocoa"],
  ["ccxml", "application/ccxml+xml,"],
  ["cdbcmsg", "application/vnd.contact.cmsg"],
  ["cdf", ["application/cdf", "application/x-cdf", "application/x-netcdf"]],
  ["cdkey", "application/vnd.mediastation.cdkey"],
  ["cdmia", "application/cdmi-capability"],
  ["cdmic", "application/cdmi-container"],
  ["cdmid", "application/cdmi-domain"],
  ["cdmio", "application/cdmi-object"],
  ["cdmiq", "application/cdmi-queue"],
  ["cdx", "chemical/x-cdx"],
  ["cdxml", "application/vnd.chemdraw+xml"],
  ["cdy", "application/vnd.cinderella"],
  ["cer", ["application/pkix-cert", "application/x-x509-ca-cert"]],
  ["cgm", "image/cgm"],
  ["cha", "application/x-chat"],
  ["chat", "application/x-chat"],
  ["chm", "application/vnd.ms-htmlhelp"],
  ["chrt", "application/vnd.kde.kchart"],
  ["cif", "chemical/x-cif"],
  ["cii", "application/vnd.anser-web-certificate-issue-initiation"],
  ["cil", "application/vnd.ms-artgalry"],
  ["cla", "application/vnd.claymore"],
  [
    "class",
    ["application/octet-stream", "application/java", "application/java-byte-code", "application/java-vm", "application/x-java-class"]
  ],
  ["clkk", "application/vnd.crick.clicker.keyboard"],
  ["clkp", "application/vnd.crick.clicker.palette"],
  ["clkt", "application/vnd.crick.clicker.template"],
  ["clkw", "application/vnd.crick.clicker.wordbank"],
  ["clkx", "application/vnd.crick.clicker"],
  ["clp", "application/x-msclip"],
  ["cmc", "application/vnd.cosmocaller"],
  ["cmdf", "chemical/x-cmdf"],
  ["cml", "chemical/x-cml"],
  ["cmp", "application/vnd.yellowriver-custom-menu"],
  ["cmx", "image/x-cmx"],
  ["cod", ["image/cis-cod", "application/vnd.rim.cod"]],
  ["com", ["application/octet-stream", "text/plain"]],
  ["conf", "text/plain"],
  ["cpio", "application/x-cpio"],
  ["cpp", "text/x-c"],
  ["cpt", ["application/mac-compactpro", "application/x-compactpro", "application/x-cpt"]],
  ["crd", "application/x-mscardfile"],
  ["crl", ["application/pkix-crl", "application/pkcs-crl"]],
  ["crt", ["application/pkix-cert", "application/x-x509-user-cert", "application/x-x509-ca-cert"]],
  ["cryptonote", "application/vnd.rig.cryptonote"],
  ["csh", ["text/x-script.csh", "application/x-csh"]],
  ["csml", "chemical/x-csml"],
  ["csp", "application/vnd.commonspace"],
  ["css", ["text/css", "application/x-pointplus"]],
  ["csv", "text/csv"],
  ["cu", "application/cu-seeme"],
  ["curl", "text/vnd.curl"],
  ["cww", "application/prs.cww"],
  ["cxx", "text/plain"],
  ["dae", "model/vnd.collada+xml"],
  ["daf", "application/vnd.mobius.daf"],
  ["davmount", "application/davmount+xml"],
  ["dcr", "application/x-director"],
  ["dcurl", "text/vnd.curl.dcurl"],
  ["dd2", "application/vnd.oma.dd2+xml"],
  ["ddd", "application/vnd.fujixerox.ddd"],
  ["deb", "application/x-debian-package"],
  ["deepv", "application/x-deepv"],
  ["def", "text/plain"],
  ["der", "application/x-x509-ca-cert"],
  ["dfac", "application/vnd.dreamfactory"],
  ["dif", "video/x-dv"],
  ["dir", "application/x-director"],
  ["dis", "application/vnd.mobius.dis"],
  ["djvu", "image/vnd.djvu"],
  ["dl", ["video/dl", "video/x-dl"]],
  ["dll", "application/x-msdownload"],
  ["dms", "application/octet-stream"],
  ["dna", "application/vnd.dna"],
  ["doc", "application/msword"],
  ["docm", "application/vnd.ms-word.document.macroenabled.12"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["dot", "application/msword"],
  ["dotm", "application/vnd.ms-word.template.macroenabled.12"],
  ["dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template"],
  ["dp", ["application/commonground", "application/vnd.osgi.dp"]],
  ["dpg", "application/vnd.dpgraph"],
  ["dra", "audio/vnd.dra"],
  ["drw", "application/drafting"],
  ["dsc", "text/prs.lines.tag"],
  ["dssc", "application/dssc+der"],
  ["dtb", "application/x-dtbook+xml"],
  ["dtd", "application/xml-dtd"],
  ["dts", "audio/vnd.dts"],
  ["dtshd", "audio/vnd.dts.hd"],
  ["dump", "application/octet-stream"],
  ["dv", "video/x-dv"],
  ["dvi", "application/x-dvi"],
  ["dwf", ["model/vnd.dwf", "drawing/x-dwf"]],
  ["dwg", ["application/acad", "image/vnd.dwg", "image/x-dwg"]],
  ["dxf", ["application/dxf", "image/vnd.dwg", "image/vnd.dxf", "image/x-dwg"]],
  ["dxp", "application/vnd.spotfire.dxp"],
  ["dxr", "application/x-director"],
  ["ecelp4800", "audio/vnd.nuera.ecelp4800"],
  ["ecelp7470", "audio/vnd.nuera.ecelp7470"],
  ["ecelp9600", "audio/vnd.nuera.ecelp9600"],
  ["edm", "application/vnd.novadigm.edm"],
  ["edx", "application/vnd.novadigm.edx"],
  ["efif", "application/vnd.picsel"],
  ["ei6", "application/vnd.pg.osasli"],
  ["el", "text/x-script.elisp"],
  ["elc", ["application/x-elc", "application/x-bytecode.elisp"]],
  ["eml", "message/rfc822"],
  ["emma", "application/emma+xml"],
  ["env", "application/x-envoy"],
  ["eol", "audio/vnd.digital-winds"],
  ["eot", "application/vnd.ms-fontobject"],
  ["eps", "application/postscript"],
  ["epub", "application/epub+zip"],
  ["es", ["application/ecmascript", "application/x-esrehber"]],
  ["es3", "application/vnd.eszigno3+xml"],
  ["esf", "application/vnd.epson.esf"],
  ["etx", "text/x-setext"],
  ["evy", ["application/envoy", "application/x-envoy"]],
  ["exe", ["application/octet-stream", "application/x-msdownload"]],
  ["exi", "application/exi"],
  ["ext", "application/vnd.novadigm.ext"],
  ["ez2", "application/vnd.ezpix-album"],
  ["ez3", "application/vnd.ezpix-package"],
  ["f", ["text/plain", "text/x-fortran"]],
  ["f4v", "video/x-f4v"],
  ["f77", "text/x-fortran"],
  ["f90", ["text/plain", "text/x-fortran"]],
  ["fbs", "image/vnd.fastbidsheet"],
  ["fcs", "application/vnd.isac.fcs"],
  ["fdf", "application/vnd.fdf"],
  ["fe_launch", "application/vnd.denovo.fcselayout-link"],
  ["fg5", "application/vnd.fujitsu.oasysgp"],
  ["fh", "image/x-freehand"],
  ["fif", ["application/fractals", "image/fif"]],
  ["fig", "application/x-xfig"],
  ["fli", ["video/fli", "video/x-fli"]],
  ["flo", ["image/florian", "application/vnd.micrografx.flo"]],
  ["flr", "x-world/x-vrml"],
  ["flv", "video/x-flv"],
  ["flw", "application/vnd.kde.kivio"],
  ["flx", "text/vnd.fmi.flexstor"],
  ["fly", "text/vnd.fly"],
  ["fm", "application/vnd.framemaker"],
  ["fmf", "video/x-atomic3d-feature"],
  ["fnc", "application/vnd.frogans.fnc"],
  ["for", ["text/plain", "text/x-fortran"]],
  ["fpx", ["image/vnd.fpx", "image/vnd.net-fpx"]],
  ["frl", "application/freeloader"],
  ["fsc", "application/vnd.fsc.weblaunch"],
  ["fst", "image/vnd.fst"],
  ["ftc", "application/vnd.fluxtime.clip"],
  ["fti", "application/vnd.anser-web-funds-transfer-initiation"],
  ["funk", "audio/make"],
  ["fvt", "video/vnd.fvt"],
  ["fxp", "application/vnd.adobe.fxp"],
  ["fzs", "application/vnd.fuzzysheet"],
  ["g", "text/plain"],
  ["g2w", "application/vnd.geoplan"],
  ["g3", "image/g3fax"],
  ["g3w", "application/vnd.geospace"],
  ["gac", "application/vnd.groove-account"],
  ["gdl", "model/vnd.gdl"],
  ["geo", "application/vnd.dynageo"],
  ["geojson", "application/geo+json"],
  ["gex", "application/vnd.geometry-explorer"],
  ["ggb", "application/vnd.geogebra.file"],
  ["ggt", "application/vnd.geogebra.tool"],
  ["ghf", "application/vnd.groove-help"],
  ["gif", "image/gif"],
  ["gim", "application/vnd.groove-identity-message"],
  ["gl", ["video/gl", "video/x-gl"]],
  ["gmx", "application/vnd.gmx"],
  ["gnumeric", "application/x-gnumeric"],
  ["gph", "application/vnd.flographit"],
  ["gqf", "application/vnd.grafeq"],
  ["gram", "application/srgs"],
  ["grv", "application/vnd.groove-injector"],
  ["grxml", "application/srgs+xml"],
  ["gsd", "audio/x-gsm"],
  ["gsf", "application/x-font-ghostscript"],
  ["gsm", "audio/x-gsm"],
  ["gsp", "application/x-gsp"],
  ["gss", "application/x-gss"],
  ["gtar", "application/x-gtar"],
  ["gtm", "application/vnd.groove-tool-message"],
  ["gtw", "model/vnd.gtw"],
  ["gv", "text/vnd.graphviz"],
  ["gxt", "application/vnd.geonext"],
  ["gz", ["application/x-gzip", "application/x-compressed"]],
  ["gzip", ["multipart/x-gzip", "application/x-gzip"]],
  ["h", ["text/plain", "text/x-h"]],
  ["h261", "video/h261"],
  ["h263", "video/h263"],
  ["h264", "video/h264"],
  ["hal", "application/vnd.hal+xml"],
  ["hbci", "application/vnd.hbci"],
  ["hdf", "application/x-hdf"],
  ["help", "application/x-helpfile"],
  ["hgl", "application/vnd.hp-hpgl"],
  ["hh", ["text/plain", "text/x-h"]],
  ["hlb", "text/x-script"],
  ["hlp", ["application/winhlp", "application/hlp", "application/x-helpfile", "application/x-winhelp"]],
  ["hpg", "application/vnd.hp-hpgl"],
  ["hpgl", "application/vnd.hp-hpgl"],
  ["hpid", "application/vnd.hp-hpid"],
  ["hps", "application/vnd.hp-hps"],
  [
    "hqx",
    [
      "application/mac-binhex40",
      "application/binhex",
      "application/binhex4",
      "application/mac-binhex",
      "application/x-binhex40",
      "application/x-mac-binhex40"
    ]
  ],
  ["hta", "application/hta"],
  ["htc", "text/x-component"],
  ["htke", "application/vnd.kenameaapp"],
  ["htm", "text/html"],
  ["html", "text/html"],
  ["htmls", "text/html"],
  ["htt", "text/webviewhtml"],
  ["htx", "text/html"],
  ["hvd", "application/vnd.yamaha.hv-dic"],
  ["hvp", "application/vnd.yamaha.hv-voice"],
  ["hvs", "application/vnd.yamaha.hv-script"],
  ["i2g", "application/vnd.intergeo"],
  ["icc", "application/vnd.iccprofile"],
  ["ice", "x-conference/x-cooltalk"],
  ["ico", "image/x-icon"],
  ["ics", "text/calendar"],
  ["idc", "text/plain"],
  ["ief", "image/ief"],
  ["iefs", "image/ief"],
  ["ifm", "application/vnd.shana.informed.formdata"],
  ["iges", ["application/iges", "model/iges"]],
  ["igl", "application/vnd.igloader"],
  ["igm", "application/vnd.insors.igm"],
  ["igs", ["application/iges", "model/iges"]],
  ["igx", "application/vnd.micrografx.igx"],
  ["iif", "application/vnd.shana.informed.interchange"],
  ["iii", "application/x-iphone"],
  ["ima", "application/x-ima"],
  ["imap", "application/x-httpd-imap"],
  ["imp", "application/vnd.accpac.simply.imp"],
  ["ims", "application/vnd.ms-ims"],
  ["inf", "application/inf"],
  ["ins", ["application/x-internet-signup", "application/x-internett-signup"]],
  ["ip", "application/x-ip2"],
  ["ipfix", "application/ipfix"],
  ["ipk", "application/vnd.shana.informed.package"],
  ["irm", "application/vnd.ibm.rights-management"],
  ["irp", "application/vnd.irepository.package+xml"],
  ["isp", "application/x-internet-signup"],
  ["isu", "video/x-isvideo"],
  ["it", "audio/it"],
  ["itp", "application/vnd.shana.informed.formtemplate"],
  ["iv", "application/x-inventor"],
  ["ivp", "application/vnd.immervision-ivp"],
  ["ivr", "i-world/i-vrml"],
  ["ivu", "application/vnd.immervision-ivu"],
  ["ivy", "application/x-livescreen"],
  ["jad", "text/vnd.sun.j2me.app-descriptor"],
  ["jam", ["application/vnd.jam", "audio/x-jam"]],
  ["jar", "application/java-archive"],
  ["jav", ["text/plain", "text/x-java-source"]],
  ["java", ["text/plain", "text/x-java-source,java", "text/x-java-source"]],
  ["jcm", "application/x-java-commerce"],
  ["jfif", ["image/pipeg", "image/jpeg", "image/pjpeg"]],
  ["jfif-tbnl", "image/jpeg"],
  ["jisp", "application/vnd.jisp"],
  ["jlt", "application/vnd.hp-jlyt"],
  ["jnlp", "application/x-java-jnlp-file"],
  ["joda", "application/vnd.joost.joda-archive"],
  ["jpe", ["image/jpeg", "image/pjpeg"]],
  ["jpeg", ["image/jpeg", "image/pjpeg"]],
  ["jpg", ["image/jpeg", "image/pjpeg"]],
  ["jpgv", "video/jpeg"],
  ["jpm", "video/jpm"],
  ["jps", "image/x-jps"],
  ["js", ["application/javascript", "application/ecmascript", "text/javascript", "text/ecmascript", "application/x-javascript"]],
  ["json", "application/json"],
  ["jut", "image/jutvision"],
  ["kar", ["audio/midi", "music/x-karaoke"]],
  ["karbon", "application/vnd.kde.karbon"],
  ["kfo", "application/vnd.kde.kformula"],
  ["kia", "application/vnd.kidspiration"],
  ["kml", "application/vnd.google-earth.kml+xml"],
  ["kmz", "application/vnd.google-earth.kmz"],
  ["kne", "application/vnd.kinar"],
  ["kon", "application/vnd.kde.kontour"],
  ["kpr", "application/vnd.kde.kpresenter"],
  ["ksh", ["application/x-ksh", "text/x-script.ksh"]],
  ["ksp", "application/vnd.kde.kspread"],
  ["ktx", "image/ktx"],
  ["ktz", "application/vnd.kahootz"],
  ["kwd", "application/vnd.kde.kword"],
  ["la", ["audio/nspaudio", "audio/x-nspaudio"]],
  ["lam", "audio/x-liveaudio"],
  ["lasxml", "application/vnd.las.las+xml"],
  ["latex", "application/x-latex"],
  ["lbd", "application/vnd.llamagraphics.life-balance.desktop"],
  ["lbe", "application/vnd.llamagraphics.life-balance.exchange+xml"],
  ["les", "application/vnd.hhe.lesson-player"],
  ["lha", ["application/octet-stream", "application/lha", "application/x-lha"]],
  ["lhx", "application/octet-stream"],
  ["link66", "application/vnd.route66.link66+xml"],
  ["list", "text/plain"],
  ["lma", ["audio/nspaudio", "audio/x-nspaudio"]],
  ["log", "text/plain"],
  ["lrm", "application/vnd.ms-lrm"],
  ["lsf", "video/x-la-asf"],
  ["lsp", ["application/x-lisp", "text/x-script.lisp"]],
  ["lst", "text/plain"],
  ["lsx", ["video/x-la-asf", "text/x-la-asf"]],
  ["ltf", "application/vnd.frogans.ltf"],
  ["ltx", "application/x-latex"],
  ["lvp", "audio/vnd.lucent.voice"],
  ["lwp", "application/vnd.lotus-wordpro"],
  ["lzh", ["application/octet-stream", "application/x-lzh"]],
  ["lzx", ["application/lzx", "application/octet-stream", "application/x-lzx"]],
  ["m", ["text/plain", "text/x-m"]],
  ["m13", "application/x-msmediaview"],
  ["m14", "application/x-msmediaview"],
  ["m1v", "video/mpeg"],
  ["m21", "application/mp21"],
  ["m2a", "audio/mpeg"],
  ["m2v", "video/mpeg"],
  ["m3u", ["audio/x-mpegurl", "audio/x-mpequrl"]],
  ["m3u8", "application/vnd.apple.mpegurl"],
  ["m4v", "video/x-m4v"],
  ["ma", "application/mathematica"],
  ["mads", "application/mads+xml"],
  ["mag", "application/vnd.ecowin.chart"],
  ["man", "application/x-troff-man"],
  ["map", "application/x-navimap"],
  ["mar", "text/plain"],
  ["mathml", "application/mathml+xml"],
  ["mbd", "application/mbedlet"],
  ["mbk", "application/vnd.mobius.mbk"],
  ["mbox", "application/mbox"],
  ["mc$", "application/x-magic-cap-package-1.0"],
  ["mc1", "application/vnd.medcalcdata"],
  ["mcd", ["application/mcad", "application/vnd.mcd", "application/x-mathcad"]],
  ["mcf", ["image/vasa", "text/mcf"]],
  ["mcp", "application/netmc"],
  ["mcurl", "text/vnd.curl.mcurl"],
  ["mdb", "application/x-msaccess"],
  ["mdi", "image/vnd.ms-modi"],
  ["me", "application/x-troff-me"],
  ["meta4", "application/metalink4+xml"],
  ["mets", "application/mets+xml"],
  ["mfm", "application/vnd.mfmp"],
  ["mgp", "application/vnd.osgeo.mapguide.package"],
  ["mgz", "application/vnd.proteus.magazine"],
  ["mht", "message/rfc822"],
  ["mhtml", "message/rfc822"],
  ["mid", ["audio/mid", "audio/midi", "music/crescendo", "x-music/x-midi", "audio/x-midi", "application/x-midi", "audio/x-mid"]],
  ["midi", ["audio/midi", "music/crescendo", "x-music/x-midi", "audio/x-midi", "application/x-midi", "audio/x-mid"]],
  ["mif", ["application/vnd.mif", "application/x-mif", "application/x-frame"]],
  ["mime", ["message/rfc822", "www/mime"]],
  ["mj2", "video/mj2"],
  ["mjf", "audio/x-vnd.audioexplosion.mjuicemediafile"],
  ["mjpg", "video/x-motion-jpeg"],
  ["mlp", "application/vnd.dolby.mlp"],
  ["mm", ["application/base64", "application/x-meme"]],
  ["mmd", "application/vnd.chipnuts.karaoke-mmd"],
  ["mme", "application/base64"],
  ["mmf", "application/vnd.smaf"],
  ["mmr", "image/vnd.fujixerox.edmics-mmr"],
  ["mny", "application/x-msmoney"],
  ["mod", ["audio/mod", "audio/x-mod"]],
  ["mods", "application/mods+xml"],
  ["moov", "video/quicktime"],
  ["mov", "video/quicktime"],
  ["movie", "video/x-sgi-movie"],
  ["mp2", ["video/mpeg", "audio/mpeg", "video/x-mpeg", "audio/x-mpeg", "video/x-mpeq2a"]],
  ["mp3", ["audio/mpeg", "audio/mpeg3", "video/mpeg", "audio/x-mpeg-3", "video/x-mpeg"]],
  ["mp4", ["video/mp4", "application/mp4"]],
  ["mp4a", "audio/mp4"],
  ["mpa", ["video/mpeg", "audio/mpeg"]],
  ["mpc", ["application/vnd.mophun.certificate", "application/x-project"]],
  ["mpe", "video/mpeg"],
  ["mpeg", "video/mpeg"],
  ["mpg", ["video/mpeg", "audio/mpeg"]],
  ["mpga", "audio/mpeg"],
  ["mpkg", "application/vnd.apple.installer+xml"],
  ["mpm", "application/vnd.blueice.multipass"],
  ["mpn", "application/vnd.mophun.application"],
  ["mpp", "application/vnd.ms-project"],
  ["mpt", "application/x-project"],
  ["mpv", "application/x-project"],
  ["mpv2", "video/mpeg"],
  ["mpx", "application/x-project"],
  ["mpy", "application/vnd.ibm.minipay"],
  ["mqy", "application/vnd.mobius.mqy"],
  ["mrc", "application/marc"],
  ["mrcx", "application/marcxml+xml"],
  ["ms", "application/x-troff-ms"],
  ["mscml", "application/mediaservercontrol+xml"],
  ["mseq", "application/vnd.mseq"],
  ["msf", "application/vnd.epson.msf"],
  ["msg", "application/vnd.ms-outlook"],
  ["msh", "model/mesh"],
  ["msl", "application/vnd.mobius.msl"],
  ["msty", "application/vnd.muvee.style"],
  ["mts", "model/vnd.mts"],
  ["mus", "application/vnd.musician"],
  ["musicxml", "application/vnd.recordare.musicxml+xml"],
  ["mv", "video/x-sgi-movie"],
  ["mvb", "application/x-msmediaview"],
  ["mwf", "application/vnd.mfer"],
  ["mxf", "application/mxf"],
  ["mxl", "application/vnd.recordare.musicxml"],
  ["mxml", "application/xv+xml"],
  ["mxs", "application/vnd.triscape.mxs"],
  ["mxu", "video/vnd.mpegurl"],
  ["my", "audio/make"],
  ["mzz", "application/x-vnd.audioexplosion.mzz"],
  ["n-gage", "application/vnd.nokia.n-gage.symbian.install"],
  ["n3", "text/n3"],
  ["nap", "image/naplps"],
  ["naplps", "image/naplps"],
  ["nbp", "application/vnd.wolfram.player"],
  ["nc", "application/x-netcdf"],
  ["ncm", "application/vnd.nokia.configuration-message"],
  ["ncx", "application/x-dtbncx+xml"],
  ["ngdat", "application/vnd.nokia.n-gage.data"],
  ["nif", "image/x-niff"],
  ["niff", "image/x-niff"],
  ["nix", "application/x-mix-transfer"],
  ["nlu", "application/vnd.neurolanguage.nlu"],
  ["nml", "application/vnd.enliven"],
  ["nnd", "application/vnd.noblenet-directory"],
  ["nns", "application/vnd.noblenet-sealer"],
  ["nnw", "application/vnd.noblenet-web"],
  ["npx", "image/vnd.net-fpx"],
  ["nsc", "application/x-conference"],
  ["nsf", "application/vnd.lotus-notes"],
  ["nvd", "application/x-navidoc"],
  ["nws", "message/rfc822"],
  ["o", "application/octet-stream"],
  ["oa2", "application/vnd.fujitsu.oasys2"],
  ["oa3", "application/vnd.fujitsu.oasys3"],
  ["oas", "application/vnd.fujitsu.oasys"],
  ["obd", "application/x-msbinder"],
  ["oda", "application/oda"],
  ["odb", "application/vnd.oasis.opendocument.database"],
  ["odc", "application/vnd.oasis.opendocument.chart"],
  ["odf", "application/vnd.oasis.opendocument.formula"],
  ["odft", "application/vnd.oasis.opendocument.formula-template"],
  ["odg", "application/vnd.oasis.opendocument.graphics"],
  ["odi", "application/vnd.oasis.opendocument.image"],
  ["odm", "application/vnd.oasis.opendocument.text-master"],
  ["odp", "application/vnd.oasis.opendocument.presentation"],
  ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
  ["odt", "application/vnd.oasis.opendocument.text"],
  ["oga", "audio/ogg"],
  ["ogv", "video/ogg"],
  ["ogx", "application/ogg"],
  ["omc", "application/x-omc"],
  ["omcd", "application/x-omcdatamaker"],
  ["omcr", "application/x-omcregerator"],
  ["onetoc", "application/onenote"],
  ["opf", "application/oebps-package+xml"],
  ["org", "application/vnd.lotus-organizer"],
  ["osf", "application/vnd.yamaha.openscoreformat"],
  ["osfpvg", "application/vnd.yamaha.openscoreformat.osfpvg+xml"],
  ["otc", "application/vnd.oasis.opendocument.chart-template"],
  ["otf", "application/x-font-otf"],
  ["otg", "application/vnd.oasis.opendocument.graphics-template"],
  ["oth", "application/vnd.oasis.opendocument.text-web"],
  ["oti", "application/vnd.oasis.opendocument.image-template"],
  ["otp", "application/vnd.oasis.opendocument.presentation-template"],
  ["ots", "application/vnd.oasis.opendocument.spreadsheet-template"],
  ["ott", "application/vnd.oasis.opendocument.text-template"],
  ["oxt", "application/vnd.openofficeorg.extension"],
  ["p", "text/x-pascal"],
  ["p10", ["application/pkcs10", "application/x-pkcs10"]],
  ["p12", ["application/pkcs-12", "application/x-pkcs12"]],
  ["p7a", "application/x-pkcs7-signature"],
  ["p7b", "application/x-pkcs7-certificates"],
  ["p7c", ["application/pkcs7-mime", "application/x-pkcs7-mime"]],
  ["p7m", ["application/pkcs7-mime", "application/x-pkcs7-mime"]],
  ["p7r", "application/x-pkcs7-certreqresp"],
  ["p7s", ["application/pkcs7-signature", "application/x-pkcs7-signature"]],
  ["p8", "application/pkcs8"],
  ["par", "text/plain-bas"],
  ["part", "application/pro_eng"],
  ["pas", "text/pascal"],
  ["paw", "application/vnd.pawaafile"],
  ["pbd", "application/vnd.powerbuilder6"],
  ["pbm", "image/x-portable-bitmap"],
  ["pcf", "application/x-font-pcf"],
  ["pcl", ["application/vnd.hp-pcl", "application/x-pcl"]],
  ["pclxl", "application/vnd.hp-pclxl"],
  ["pct", "image/x-pict"],
  ["pcurl", "application/vnd.curl.pcurl"],
  ["pcx", "image/x-pcx"],
  ["pdb", ["application/vnd.palm", "chemical/x-pdb"]],
  ["pdf", "application/pdf"],
  ["pfa", "application/x-font-type1"],
  ["pfr", "application/font-tdpfr"],
  ["pfunk", ["audio/make", "audio/make.my.funk"]],
  ["pfx", "application/x-pkcs12"],
  ["pgm", ["image/x-portable-graymap", "image/x-portable-greymap"]],
  ["pgn", "application/x-chess-pgn"],
  ["pgp", "application/pgp-signature"],
  ["pic", ["image/pict", "image/x-pict"]],
  ["pict", "image/pict"],
  ["pkg", "application/x-newton-compatible-pkg"],
  ["pki", "application/pkixcmp"],
  ["pkipath", "application/pkix-pkipath"],
  ["pko", ["application/ynd.ms-pkipko", "application/vnd.ms-pki.pko"]],
  ["pl", ["text/plain", "text/x-script.perl"]],
  ["plb", "application/vnd.3gpp.pic-bw-large"],
  ["plc", "application/vnd.mobius.plc"],
  ["plf", "application/vnd.pocketlearn"],
  ["pls", "application/pls+xml"],
  ["plx", "application/x-pixclscript"],
  ["pm", ["text/x-script.perl-module", "image/x-xpixmap"]],
  ["pm4", "application/x-pagemaker"],
  ["pm5", "application/x-pagemaker"],
  ["pma", "application/x-perfmon"],
  ["pmc", "application/x-perfmon"],
  ["pml", ["application/vnd.ctc-posml", "application/x-perfmon"]],
  ["pmr", "application/x-perfmon"],
  ["pmw", "application/x-perfmon"],
  ["png", "image/png"],
  ["pnm", ["application/x-portable-anymap", "image/x-portable-anymap"]],
  ["portpkg", "application/vnd.macports.portpkg"],
  ["pot", ["application/vnd.ms-powerpoint", "application/mspowerpoint"]],
  ["potm", "application/vnd.ms-powerpoint.template.macroenabled.12"],
  ["potx", "application/vnd.openxmlformats-officedocument.presentationml.template"],
  ["pov", "model/x-pov"],
  ["ppa", "application/vnd.ms-powerpoint"],
  ["ppam", "application/vnd.ms-powerpoint.addin.macroenabled.12"],
  ["ppd", "application/vnd.cups-ppd"],
  ["ppm", "image/x-portable-pixmap"],
  ["pps", ["application/vnd.ms-powerpoint", "application/mspowerpoint"]],
  ["ppsm", "application/vnd.ms-powerpoint.slideshow.macroenabled.12"],
  ["ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow"],
  ["ppt", ["application/vnd.ms-powerpoint", "application/mspowerpoint", "application/powerpoint", "application/x-mspowerpoint"]],
  ["pptm", "application/vnd.ms-powerpoint.presentation.macroenabled.12"],
  ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ["ppz", "application/mspowerpoint"],
  ["prc", "application/x-mobipocket-ebook"],
  ["pre", ["application/vnd.lotus-freelance", "application/x-freelance"]],
  ["prf", "application/pics-rules"],
  ["prt", "application/pro_eng"],
  ["ps", "application/postscript"],
  ["psb", "application/vnd.3gpp.pic-bw-small"],
  ["psd", ["application/octet-stream", "image/vnd.adobe.photoshop"]],
  ["psf", "application/x-font-linux-psf"],
  ["pskcxml", "application/pskc+xml"],
  ["ptid", "application/vnd.pvi.ptid1"],
  ["pub", "application/x-mspublisher"],
  ["pvb", "application/vnd.3gpp.pic-bw-var"],
  ["pvu", "paleovu/x-pv"],
  ["pwn", "application/vnd.3m.post-it-notes"],
  ["pwz", "application/vnd.ms-powerpoint"],
  ["py", "text/x-script.phyton"],
  ["pya", "audio/vnd.ms-playready.media.pya"],
  ["pyc", "application/x-bytecode.python"],
  ["pyv", "video/vnd.ms-playready.media.pyv"],
  ["qam", "application/vnd.epson.quickanime"],
  ["qbo", "application/vnd.intu.qbo"],
  ["qcp", "audio/vnd.qcelp"],
  ["qd3", "x-world/x-3dmf"],
  ["qd3d", "x-world/x-3dmf"],
  ["qfx", "application/vnd.intu.qfx"],
  ["qif", "image/x-quicktime"],
  ["qps", "application/vnd.publishare-delta-tree"],
  ["qt", "video/quicktime"],
  ["qtc", "video/x-qtc"],
  ["qti", "image/x-quicktime"],
  ["qtif", "image/x-quicktime"],
  ["qxd", "application/vnd.quark.quarkxpress"],
  ["ra", ["audio/x-realaudio", "audio/x-pn-realaudio", "audio/x-pn-realaudio-plugin"]],
  ["ram", "audio/x-pn-realaudio"],
  ["rar", "application/x-rar-compressed"],
  ["ras", ["image/cmu-raster", "application/x-cmu-raster", "image/x-cmu-raster"]],
  ["rast", "image/cmu-raster"],
  ["rcprofile", "application/vnd.ipunplugged.rcprofile"],
  ["rdf", "application/rdf+xml"],
  ["rdz", "application/vnd.data-vision.rdz"],
  ["rep", "application/vnd.businessobjects"],
  ["res", "application/x-dtbresource+xml"],
  ["rexx", "text/x-script.rexx"],
  ["rf", "image/vnd.rn-realflash"],
  ["rgb", "image/x-rgb"],
  ["rif", "application/reginfo+xml"],
  ["rip", "audio/vnd.rip"],
  ["rl", "application/resource-lists+xml"],
  ["rlc", "image/vnd.fujixerox.edmics-rlc"],
  ["rld", "application/resource-lists-diff+xml"],
  ["rm", ["application/vnd.rn-realmedia", "audio/x-pn-realaudio"]],
  ["rmi", "audio/mid"],
  ["rmm", "audio/x-pn-realaudio"],
  ["rmp", ["audio/x-pn-realaudio-plugin", "audio/x-pn-realaudio"]],
  ["rms", "application/vnd.jcp.javame.midlet-rms"],
  ["rnc", "application/relax-ng-compact-syntax"],
  ["rng", ["application/ringing-tones", "application/vnd.nokia.ringing-tone"]],
  ["rnx", "application/vnd.rn-realplayer"],
  ["roff", "application/x-troff"],
  ["rp", "image/vnd.rn-realpix"],
  ["rp9", "application/vnd.cloanto.rp9"],
  ["rpm", "audio/x-pn-realaudio-plugin"],
  ["rpss", "application/vnd.nokia.radio-presets"],
  ["rpst", "application/vnd.nokia.radio-preset"],
  ["rq", "application/sparql-query"],
  ["rs", "application/rls-services+xml"],
  ["rsd", "application/rsd+xml"],
  ["rt", ["text/richtext", "text/vnd.rn-realtext"]],
  ["rtf", ["application/rtf", "text/richtext", "application/x-rtf"]],
  ["rtx", ["text/richtext", "application/rtf"]],
  ["rv", "video/vnd.rn-realvideo"],
  ["s", "text/x-asm"],
  ["s3m", "audio/s3m"],
  ["saf", "application/vnd.yamaha.smaf-audio"],
  ["saveme", "application/octet-stream"],
  ["sbk", "application/x-tbook"],
  ["sbml", "application/sbml+xml"],
  ["sc", "application/vnd.ibm.secure-container"],
  ["scd", "application/x-msschedule"],
  [
    "scm",
    ["application/vnd.lotus-screencam", "video/x-scm", "text/x-script.guile", "application/x-lotusscreencam", "text/x-script.scheme"]
  ],
  ["scq", "application/scvp-cv-request"],
  ["scs", "application/scvp-cv-response"],
  ["sct", "text/scriptlet"],
  ["scurl", "text/vnd.curl.scurl"],
  ["sda", "application/vnd.stardivision.draw"],
  ["sdc", "application/vnd.stardivision.calc"],
  ["sdd", "application/vnd.stardivision.impress"],
  ["sdkm", "application/vnd.solent.sdkm+xml"],
  ["sdml", "text/plain"],
  ["sdp", ["application/sdp", "application/x-sdp"]],
  ["sdr", "application/sounder"],
  ["sdw", "application/vnd.stardivision.writer"],
  ["sea", ["application/sea", "application/x-sea"]],
  ["see", "application/vnd.seemail"],
  ["seed", "application/vnd.fdsn.seed"],
  ["sema", "application/vnd.sema"],
  ["semd", "application/vnd.semd"],
  ["semf", "application/vnd.semf"],
  ["ser", "application/java-serialized-object"],
  ["set", "application/set"],
  ["setpay", "application/set-payment-initiation"],
  ["setreg", "application/set-registration-initiation"],
  ["sfd-hdstx", "application/vnd.hydrostatix.sof-data"],
  ["sfs", "application/vnd.spotfire.sfs"],
  ["sgl", "application/vnd.stardivision.writer-global"],
  ["sgm", ["text/sgml", "text/x-sgml"]],
  ["sgml", ["text/sgml", "text/x-sgml"]],
  ["sh", ["application/x-shar", "application/x-bsh", "application/x-sh", "text/x-script.sh"]],
  ["shar", ["application/x-bsh", "application/x-shar"]],
  ["shf", "application/shf+xml"],
  ["shtml", ["text/html", "text/x-server-parsed-html"]],
  ["sid", "audio/x-psid"],
  ["sis", "application/vnd.symbian.install"],
  ["sit", ["application/x-stuffit", "application/x-sit"]],
  ["sitx", "application/x-stuffitx"],
  ["skd", "application/x-koan"],
  ["skm", "application/x-koan"],
  ["skp", ["application/vnd.koan", "application/x-koan"]],
  ["skt", "application/x-koan"],
  ["sl", "application/x-seelogo"],
  ["sldm", "application/vnd.ms-powerpoint.slide.macroenabled.12"],
  ["sldx", "application/vnd.openxmlformats-officedocument.presentationml.slide"],
  ["slt", "application/vnd.epson.salt"],
  ["sm", "application/vnd.stepmania.stepchart"],
  ["smf", "application/vnd.stardivision.math"],
  ["smi", ["application/smil", "application/smil+xml"]],
  ["smil", "application/smil"],
  ["snd", ["audio/basic", "audio/x-adpcm"]],
  ["snf", "application/x-font-snf"],
  ["sol", "application/solids"],
  ["spc", ["text/x-speech", "application/x-pkcs7-certificates"]],
  ["spf", "application/vnd.yamaha.smaf-phrase"],
  ["spl", ["application/futuresplash", "application/x-futuresplash"]],
  ["spot", "text/vnd.in3d.spot"],
  ["spp", "application/scvp-vp-response"],
  ["spq", "application/scvp-vp-request"],
  ["spr", "application/x-sprite"],
  ["sprite", "application/x-sprite"],
  ["src", "application/x-wais-source"],
  ["sru", "application/sru+xml"],
  ["srx", "application/sparql-results+xml"],
  ["sse", "application/vnd.kodak-descriptor"],
  ["ssf", "application/vnd.epson.ssf"],
  ["ssi", "text/x-server-parsed-html"],
  ["ssm", "application/streamingmedia"],
  ["ssml", "application/ssml+xml"],
  ["sst", ["application/vnd.ms-pkicertstore", "application/vnd.ms-pki.certstore"]],
  ["st", "application/vnd.sailingtracker.track"],
  ["stc", "application/vnd.sun.xml.calc.template"],
  ["std", "application/vnd.sun.xml.draw.template"],
  ["step", "application/step"],
  ["stf", "application/vnd.wt.stf"],
  ["sti", "application/vnd.sun.xml.impress.template"],
  ["stk", "application/hyperstudio"],
  ["stl", ["application/vnd.ms-pkistl", "application/sla", "application/vnd.ms-pki.stl", "application/x-navistyle"]],
  ["stm", "text/html"],
  ["stp", "application/step"],
  ["str", "application/vnd.pg.format"],
  ["stw", "application/vnd.sun.xml.writer.template"],
  ["sub", "image/vnd.dvb.subtitle"],
  ["sus", "application/vnd.sus-calendar"],
  ["sv4cpio", "application/x-sv4cpio"],
  ["sv4crc", "application/x-sv4crc"],
  ["svc", "application/vnd.dvb.service"],
  ["svd", "application/vnd.svd"],
  ["svf", ["image/vnd.dwg", "image/x-dwg"]],
  ["svg", "image/svg+xml"],
  ["svr", ["x-world/x-svr", "application/x-world"]],
  ["swf", "application/x-shockwave-flash"],
  ["swi", "application/vnd.aristanetworks.swi"],
  ["sxc", "application/vnd.sun.xml.calc"],
  ["sxd", "application/vnd.sun.xml.draw"],
  ["sxg", "application/vnd.sun.xml.writer.global"],
  ["sxi", "application/vnd.sun.xml.impress"],
  ["sxm", "application/vnd.sun.xml.math"],
  ["sxw", "application/vnd.sun.xml.writer"],
  ["t", ["text/troff", "application/x-troff"]],
  ["talk", "text/x-speech"],
  ["tao", "application/vnd.tao.intent-module-archive"],
  ["tar", "application/x-tar"],
  ["tbk", ["application/toolbook", "application/x-tbook"]],
  ["tcap", "application/vnd.3gpp2.tcap"],
  ["tcl", ["text/x-script.tcl", "application/x-tcl"]],
  ["tcsh", "text/x-script.tcsh"],
  ["teacher", "application/vnd.smart.teacher"],
  ["tei", "application/tei+xml"],
  ["tex", "application/x-tex"],
  ["texi", "application/x-texinfo"],
  ["texinfo", "application/x-texinfo"],
  ["text", ["application/plain", "text/plain"]],
  ["tfi", "application/thraud+xml"],
  ["tfm", "application/x-tex-tfm"],
  ["tgz", ["application/gnutar", "application/x-compressed"]],
  ["thmx", "application/vnd.ms-officetheme"],
  ["tif", ["image/tiff", "image/x-tiff"]],
  ["tiff", ["image/tiff", "image/x-tiff"]],
  ["tmo", "application/vnd.tmobile-livetv"],
  ["torrent", "application/x-bittorrent"],
  ["tpl", "application/vnd.groove-tool-template"],
  ["tpt", "application/vnd.trid.tpt"],
  ["tr", "application/x-troff"],
  ["tra", "application/vnd.trueapp"],
  ["trm", "application/x-msterminal"],
  ["tsd", "application/timestamped-data"],
  ["tsi", "audio/tsp-audio"],
  ["tsp", ["application/dsptype", "audio/tsplayer"]],
  ["tsv", "text/tab-separated-values"],
  ["ttf", "application/x-font-ttf"],
  ["ttl", "text/turtle"],
  ["turbot", "image/florian"],
  ["twd", "application/vnd.simtech-mindmapper"],
  ["txd", "application/vnd.genomatix.tuxedo"],
  ["txf", "application/vnd.mobius.txf"],
  ["txt", "text/plain"],
  ["ufd", "application/vnd.ufdl"],
  ["uil", "text/x-uil"],
  ["uls", "text/iuls"],
  ["umj", "application/vnd.umajin"],
  ["uni", "text/uri-list"],
  ["unis", "text/uri-list"],
  ["unityweb", "application/vnd.unity"],
  ["unv", "application/i-deas"],
  ["uoml", "application/vnd.uoml+xml"],
  ["uri", "text/uri-list"],
  ["uris", "text/uri-list"],
  ["ustar", ["application/x-ustar", "multipart/x-ustar"]],
  ["utz", "application/vnd.uiq.theme"],
  ["uu", ["application/octet-stream", "text/x-uuencode"]],
  ["uue", "text/x-uuencode"],
  ["uva", "audio/vnd.dece.audio"],
  ["uvh", "video/vnd.dece.hd"],
  ["uvi", "image/vnd.dece.graphic"],
  ["uvm", "video/vnd.dece.mobile"],
  ["uvp", "video/vnd.dece.pd"],
  ["uvs", "video/vnd.dece.sd"],
  ["uvu", "video/vnd.uvvu.mp4"],
  ["uvv", "video/vnd.dece.video"],
  ["vcd", "application/x-cdlink"],
  ["vcf", "text/x-vcard"],
  ["vcg", "application/vnd.groove-vcard"],
  ["vcs", "text/x-vcalendar"],
  ["vcx", "application/vnd.vcx"],
  ["vda", "application/vda"],
  ["vdo", "video/vdo"],
  ["vew", "application/groupwise"],
  ["vis", "application/vnd.visionary"],
  ["viv", ["video/vivo", "video/vnd.vivo"]],
  ["vivo", ["video/vivo", "video/vnd.vivo"]],
  ["vmd", "application/vocaltec-media-desc"],
  ["vmf", "application/vocaltec-media-file"],
  ["voc", ["audio/voc", "audio/x-voc"]],
  ["vos", "video/vosaic"],
  ["vox", "audio/voxware"],
  ["vqe", "audio/x-twinvq-plugin"],
  ["vqf", "audio/x-twinvq"],
  ["vql", "audio/x-twinvq-plugin"],
  ["vrml", ["model/vrml", "x-world/x-vrml", "application/x-vrml"]],
  ["vrt", "x-world/x-vrt"],
  ["vsd", ["application/vnd.visio", "application/x-visio"]],
  ["vsf", "application/vnd.vsf"],
  ["vst", "application/x-visio"],
  ["vsw", "application/x-visio"],
  ["vtu", "model/vnd.vtu"],
  ["vxml", "application/voicexml+xml"],
  ["w60", "application/wordperfect6.0"],
  ["w61", "application/wordperfect6.1"],
  ["w6w", "application/msword"],
  ["wad", "application/x-doom"],
  ["wav", ["audio/wav", "audio/x-wav"]],
  ["wax", "audio/x-ms-wax"],
  ["wb1", "application/x-qpro"],
  ["wbmp", "image/vnd.wap.wbmp"],
  ["wbs", "application/vnd.criticaltools.wbs+xml"],
  ["wbxml", "application/vnd.wap.wbxml"],
  ["wcm", "application/vnd.ms-works"],
  ["wdb", "application/vnd.ms-works"],
  ["web", "application/vnd.xara"],
  ["weba", "audio/webm"],
  ["webm", "video/webm"],
  ["webp", "image/webp"],
  ["wg", "application/vnd.pmi.widget"],
  ["wgt", "application/widget"],
  ["wiz", "application/msword"],
  ["wk1", "application/x-123"],
  ["wks", "application/vnd.ms-works"],
  ["wm", "video/x-ms-wm"],
  ["wma", "audio/x-ms-wma"],
  ["wmd", "application/x-ms-wmd"],
  ["wmf", ["windows/metafile", "application/x-msmetafile"]],
  ["wml", "text/vnd.wap.wml"],
  ["wmlc", "application/vnd.wap.wmlc"],
  ["wmls", "text/vnd.wap.wmlscript"],
  ["wmlsc", "application/vnd.wap.wmlscriptc"],
  ["wmv", "video/x-ms-wmv"],
  ["wmx", "video/x-ms-wmx"],
  ["wmz", "application/x-ms-wmz"],
  ["woff", "application/x-font-woff"],
  ["word", "application/msword"],
  ["wp", "application/wordperfect"],
  ["wp5", ["application/wordperfect", "application/wordperfect6.0"]],
  ["wp6", "application/wordperfect"],
  ["wpd", ["application/wordperfect", "application/vnd.wordperfect", "application/x-wpwin"]],
  ["wpl", "application/vnd.ms-wpl"],
  ["wps", "application/vnd.ms-works"],
  ["wq1", "application/x-lotus"],
  ["wqd", "application/vnd.wqd"],
  ["wri", ["application/mswrite", "application/x-wri", "application/x-mswrite"]],
  ["wrl", ["model/vrml", "x-world/x-vrml", "application/x-world"]],
  ["wrz", ["model/vrml", "x-world/x-vrml"]],
  ["wsc", "text/scriplet"],
  ["wsdl", "application/wsdl+xml"],
  ["wspolicy", "application/wspolicy+xml"],
  ["wsrc", "application/x-wais-source"],
  ["wtb", "application/vnd.webturbo"],
  ["wtk", "application/x-wintalk"],
  ["wvx", "video/x-ms-wvx"],
  ["x-png", "image/png"],
  ["x3d", "application/vnd.hzn-3d-crossword"],
  ["xaf", "x-world/x-vrml"],
  ["xap", "application/x-silverlight-app"],
  ["xar", "application/vnd.xara"],
  ["xbap", "application/x-ms-xbap"],
  ["xbd", "application/vnd.fujixerox.docuworks.binder"],
  ["xbm", ["image/xbm", "image/x-xbm", "image/x-xbitmap"]],
  ["xdf", "application/xcap-diff+xml"],
  ["xdm", "application/vnd.syncml.dm+xml"],
  ["xdp", "application/vnd.adobe.xdp+xml"],
  ["xdr", "video/x-amt-demorun"],
  ["xdssc", "application/dssc+xml"],
  ["xdw", "application/vnd.fujixerox.docuworks"],
  ["xenc", "application/xenc+xml"],
  ["xer", "application/patch-ops-error+xml"],
  ["xfdf", "application/vnd.adobe.xfdf"],
  ["xfdl", "application/vnd.xfdl"],
  ["xgz", "xgl/drawing"],
  ["xhtml", "application/xhtml+xml"],
  ["xif", "image/vnd.xiff"],
  ["xl", "application/excel"],
  ["xla", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
  ["xlam", "application/vnd.ms-excel.addin.macroenabled.12"],
  ["xlb", ["application/excel", "application/vnd.ms-excel", "application/x-excel"]],
  ["xlc", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
  ["xld", ["application/excel", "application/x-excel"]],
  ["xlk", ["application/excel", "application/x-excel"]],
  ["xll", ["application/excel", "application/vnd.ms-excel", "application/x-excel"]],
  ["xlm", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
  ["xls", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
  ["xlsb", "application/vnd.ms-excel.sheet.binary.macroenabled.12"],
  ["xlsm", "application/vnd.ms-excel.sheet.macroenabled.12"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["xlt", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
  ["xltm", "application/vnd.ms-excel.template.macroenabled.12"],
  ["xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template"],
  ["xlv", ["application/excel", "application/x-excel"]],
  ["xlw", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
  ["xm", "audio/xm"],
  ["xml", ["application/xml", "text/xml", "application/atom+xml", "application/rss+xml"]],
  ["xmz", "xgl/movie"],
  ["xo", "application/vnd.olpc-sugar"],
  ["xof", "x-world/x-vrml"],
  ["xop", "application/xop+xml"],
  ["xpi", "application/x-xpinstall"],
  ["xpix", "application/x-vnd.ls-xpix"],
  ["xpm", ["image/xpm", "image/x-xpixmap"]],
  ["xpr", "application/vnd.is-xpr"],
  ["xps", "application/vnd.ms-xpsdocument"],
  ["xpw", "application/vnd.intercon.formnet"],
  ["xslt", "application/xslt+xml"],
  ["xsm", "application/vnd.syncml+xml"],
  ["xspf", "application/xspf+xml"],
  ["xsr", "video/x-amt-showrun"],
  ["xul", "application/vnd.mozilla.xul+xml"],
  ["xwd", ["image/x-xwd", "image/x-xwindowdump"]],
  ["xyz", ["chemical/x-xyz", "chemical/x-pdb"]],
  ["yang", "application/yang"],
  ["yin", "application/yin+xml"],
  ["z", ["application/x-compressed", "application/x-compress"]],
  ["zaz", "application/vnd.zzazz.deck+xml"],
  ["zip", ["application/zip", "multipart/x-zip", "application/x-zip-compressed", "application/x-compressed"]],
  ["zir", "application/vnd.zul"],
  ["zmm", "application/vnd.handheld-entertainment+xml"],
  ["zoo", "application/octet-stream"],
  ["zsh", "text/x-script.zsh"]
]);
var mimeTypes_1 = {
  detectMimeType(filename) {
    if (!filename) {
      return defaultMimeType;
    }
    let parsed = path$m.parse(filename);
    let extension = (parsed.ext.substr(1) || parsed.name || "").split("?").shift().trim().toLowerCase();
    let value = defaultMimeType;
    if (extensions.has(extension)) {
      value = extensions.get(extension);
    }
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  },
  detectExtension(mimeType) {
    if (!mimeType) {
      return defaultExtension;
    }
    let parts = (mimeType || "").toLowerCase().trim().split("/");
    let rootType = parts.shift().trim();
    let subType = parts.join("/").trim();
    if (mimeTypes$1.has(rootType + "/" + subType)) {
      let value = mimeTypes$1.get(rootType + "/" + subType);
      if (Array.isArray(value)) {
        return value[0];
      }
      return value;
    }
    switch (rootType) {
      case "text":
        return "txt";
      default:
        return "bin";
    }
  }
};
const maxInt = 2147483647;
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128;
const delimiter = "-";
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
const errors = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
};
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;
function error$1(type2) {
  throw new RangeError(errors[type2]);
}
function map$1(array, callback) {
  const result = [];
  let length = array.length;
  while (length--) {
    result[length] = callback(array[length]);
  }
  return result;
}
function mapDomain(domain, callback) {
  const parts = domain.split("@");
  let result = "";
  if (parts.length > 1) {
    result = parts[0] + "@";
    domain = parts[1];
  }
  domain = domain.replace(regexSeparators, ".");
  const labels = domain.split(".");
  const encoded = map$1(labels, callback).join(".");
  return result + encoded;
}
function ucs2decode(string) {
  const output = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 55296 && value <= 56319 && counter < length) {
      const extra = string.charCodeAt(counter++);
      if ((extra & 64512) == 56320) {
        output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}
const ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
const basicToDigit = function(codePoint) {
  if (codePoint >= 48 && codePoint < 58) {
    return 26 + (codePoint - 48);
  }
  if (codePoint >= 65 && codePoint < 91) {
    return codePoint - 65;
  }
  if (codePoint >= 97 && codePoint < 123) {
    return codePoint - 97;
  }
  return base;
};
const digitToBasic = function(digit, flag) {
  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};
const adapt = function(delta, numPoints, firstTime) {
  let k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (
    ;
    /* no initialization */
    delta > baseMinusTMin * tMax >> 1;
    k += base
  ) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};
const decode = function(input) {
  const output = [];
  const inputLength = input.length;
  let i2 = 0;
  let n = initialN;
  let bias = initialBias;
  let basic = input.lastIndexOf(delimiter);
  if (basic < 0) {
    basic = 0;
  }
  for (let j = 0; j < basic; ++j) {
    if (input.charCodeAt(j) >= 128) {
      error$1("not-basic");
    }
    output.push(input.charCodeAt(j));
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
    const oldi = i2;
    for (let w = 1, k = base; ; k += base) {
      if (index >= inputLength) {
        error$1("invalid-input");
      }
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= base) {
        error$1("invalid-input");
      }
      if (digit > floor((maxInt - i2) / w)) {
        error$1("overflow");
      }
      i2 += digit * w;
      const t2 = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t2) {
        break;
      }
      const baseMinusT = base - t2;
      if (w > floor(maxInt / baseMinusT)) {
        error$1("overflow");
      }
      w *= baseMinusT;
    }
    const out2 = output.length + 1;
    bias = adapt(i2 - oldi, out2, oldi == 0);
    if (floor(i2 / out2) > maxInt - n) {
      error$1("overflow");
    }
    n += floor(i2 / out2);
    i2 %= out2;
    output.splice(i2++, 0, n);
  }
  return String.fromCodePoint(...output);
};
const encode$2 = function(input) {
  const output = [];
  input = ucs2decode(input);
  const inputLength = input.length;
  let n = initialN;
  let delta = 0;
  let bias = initialBias;
  for (const currentValue of input) {
    if (currentValue < 128) {
      output.push(stringFromCharCode(currentValue));
    }
  }
  const basicLength = output.length;
  let handledCPCount = basicLength;
  if (basicLength) {
    output.push(delimiter);
  }
  while (handledCPCount < inputLength) {
    let m = maxInt;
    for (const currentValue of input) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error$1("overflow");
    }
    delta += (m - n) * handledCPCountPlusOne;
    n = m;
    for (const currentValue of input) {
      if (currentValue < n && ++delta > maxInt) {
        error$1("overflow");
      }
      if (currentValue === n) {
        let q = delta;
        for (let k = base; ; k += base) {
          const t2 = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t2) {
            break;
          }
          const qMinusT = q - t2;
          const baseMinusT = base - t2;
          output.push(stringFromCharCode(digitToBasic(t2 + qMinusT % baseMinusT, 0)));
          q = floor(qMinusT / baseMinusT);
        }
        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }
    ++delta;
    ++n;
  }
  return output.join("");
};
const toUnicode = function(input) {
  return mapDomain(input, function(string) {
    return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
  });
};
const toASCII = function(input) {
  return mapDomain(input, function(string) {
    return regexNonASCII.test(string) ? "xn--" + encode$2(string) : string;
  });
};
const punycode$1 = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  version: "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  ucs2: {
    decode: ucs2decode,
    encode: ucs2encode
  },
  decode,
  encode: encode$2,
  toASCII,
  toUnicode
};
var punycode_1 = punycode$1;
const Transform$1 = require$$0$2.Transform;
function encode$1(buffer) {
  if (typeof buffer === "string") {
    buffer = Buffer.from(buffer, "utf-8");
  }
  return buffer.toString("base64");
}
function wrap$1(str2, lineLength) {
  str2 = (str2 || "").toString();
  lineLength = lineLength || 76;
  if (str2.length <= lineLength) {
    return str2;
  }
  let result = [];
  let pos = 0;
  let chunkLength = lineLength * 1024;
  while (pos < str2.length) {
    let wrappedLines = str2.substr(pos, chunkLength).replace(new RegExp(".{" + lineLength + "}", "g"), "$&\r\n");
    result.push(wrappedLines);
    pos += chunkLength;
  }
  return result.join("");
}
let Encoder$1 = class Encoder2 extends Transform$1 {
  constructor(options2) {
    super();
    this.options = options2 || {};
    if (this.options.lineLength !== false) {
      this.options.lineLength = this.options.lineLength || 76;
    }
    this._curLine = "";
    this._remainingBytes = false;
    this.inputBytes = 0;
    this.outputBytes = 0;
  }
  _transform(chunk, encoding, done) {
    if (encoding !== "buffer") {
      chunk = Buffer.from(chunk, encoding);
    }
    if (!chunk || !chunk.length) {
      return setImmediate(done);
    }
    this.inputBytes += chunk.length;
    if (this._remainingBytes && this._remainingBytes.length) {
      chunk = Buffer.concat([this._remainingBytes, chunk], this._remainingBytes.length + chunk.length);
      this._remainingBytes = false;
    }
    if (chunk.length % 3) {
      this._remainingBytes = chunk.slice(chunk.length - chunk.length % 3);
      chunk = chunk.slice(0, chunk.length - chunk.length % 3);
    } else {
      this._remainingBytes = false;
    }
    let b64 = this._curLine + encode$1(chunk);
    if (this.options.lineLength) {
      b64 = wrap$1(b64, this.options.lineLength);
      let lastLF = b64.lastIndexOf("\n");
      if (lastLF < 0) {
        this._curLine = b64;
        b64 = "";
      } else {
        this._curLine = b64.substring(lastLF + 1);
        b64 = b64.substring(0, lastLF + 1);
        if (b64 && !b64.endsWith("\r\n")) {
          b64 += "\r\n";
        }
      }
    } else {
      this._curLine = "";
    }
    if (b64) {
      this.outputBytes += b64.length;
      this.push(Buffer.from(b64, "ascii"));
    }
    setImmediate(done);
  }
  _flush(done) {
    if (this._remainingBytes && this._remainingBytes.length) {
      this._curLine += encode$1(this._remainingBytes);
    }
    if (this._curLine) {
      this.outputBytes += this._curLine.length;
      this.push(Buffer.from(this._curLine, "ascii"));
      this._curLine = "";
    }
    done();
  }
};
var base64$1 = {
  encode: encode$1,
  wrap: wrap$1,
  Encoder: Encoder$1
};
const Transform = require$$0$2.Transform;
function encode(buffer) {
  if (typeof buffer === "string") {
    buffer = Buffer.from(buffer, "utf-8");
  }
  let ranges = [
    // https://tools.ietf.org/html/rfc2045#section-6.7
    [9],
    // <TAB>
    [10],
    // <LF>
    [13],
    // <CR>
    [32, 60],
    // <SP>!"#$%&'()*+,-./0123456789:;
    [62, 126]
    // >?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}
  ];
  let result = "";
  let ord;
  for (let i2 = 0, len = buffer.length; i2 < len; i2++) {
    ord = buffer[i2];
    if (checkRanges(ord, ranges) && !((ord === 32 || ord === 9) && (i2 === len - 1 || buffer[i2 + 1] === 10 || buffer[i2 + 1] === 13))) {
      result += String.fromCharCode(ord);
      continue;
    }
    result += "=" + (ord < 16 ? "0" : "") + ord.toString(16).toUpperCase();
  }
  return result;
}
function wrap(str2, lineLength) {
  str2 = (str2 || "").toString();
  lineLength = lineLength || 76;
  if (str2.length <= lineLength) {
    return str2;
  }
  let pos = 0;
  let len = str2.length;
  let match, code, line;
  let lineMargin = Math.floor(lineLength / 3);
  let result = "";
  while (pos < len) {
    line = str2.substr(pos, lineLength);
    if (match = line.match(/\r\n/)) {
      line = line.substr(0, match.index + match[0].length);
      result += line;
      pos += line.length;
      continue;
    }
    if (line.substr(-1) === "\n") {
      result += line;
      pos += line.length;
      continue;
    } else if (match = line.substr(-lineMargin).match(/\n.*?$/)) {
      line = line.substr(0, line.length - (match[0].length - 1));
      result += line;
      pos += line.length;
      continue;
    } else if (line.length > lineLength - lineMargin && (match = line.substr(-lineMargin).match(/[ \t.,!?][^ \t.,!?]*$/))) {
      line = line.substr(0, line.length - (match[0].length - 1));
    } else if (line.match(/[=][\da-f]{0,2}$/i)) {
      if (match = line.match(/[=][\da-f]{0,1}$/i)) {
        line = line.substr(0, line.length - match[0].length);
      }
      while (line.length > 3 && line.length < len - pos && !line.match(/^(?:=[\da-f]{2}){1,4}$/i) && (match = line.match(/[=][\da-f]{2}$/gi))) {
        code = parseInt(match[0].substr(1, 2), 16);
        if (code < 128) {
          break;
        }
        line = line.substr(0, line.length - 3);
        if (code >= 192) {
          break;
        }
      }
    }
    if (pos + line.length < len && line.substr(-1) !== "\n") {
      if (line.length === lineLength && line.match(/[=][\da-f]{2}$/i)) {
        line = line.substr(0, line.length - 3);
      } else if (line.length === lineLength) {
        line = line.substr(0, line.length - 1);
      }
      pos += line.length;
      line += "=\r\n";
    } else {
      pos += line.length;
    }
    result += line;
  }
  return result;
}
function checkRanges(nr, ranges) {
  for (let i2 = ranges.length - 1; i2 >= 0; i2--) {
    if (!ranges[i2].length) {
      continue;
    }
    if (ranges[i2].length === 1 && nr === ranges[i2][0]) {
      return true;
    }
    if (ranges[i2].length === 2 && nr >= ranges[i2][0] && nr <= ranges[i2][1]) {
      return true;
    }
  }
  return false;
}
class Encoder extends Transform {
  constructor(options2) {
    super();
    this.options = options2 || {};
    if (this.options.lineLength !== false) {
      this.options.lineLength = this.options.lineLength || 76;
    }
    this._curLine = "";
    this.inputBytes = 0;
    this.outputBytes = 0;
  }
  _transform(chunk, encoding, done) {
    let qp2;
    if (encoding !== "buffer") {
      chunk = Buffer.from(chunk, encoding);
    }
    if (!chunk || !chunk.length) {
      return done();
    }
    this.inputBytes += chunk.length;
    if (this.options.lineLength) {
      qp2 = this._curLine + encode(chunk);
      qp2 = wrap(qp2, this.options.lineLength);
      qp2 = qp2.replace(/(^|\n)([^\n]*)$/, (match, lineBreak, lastLine) => {
        this._curLine = lastLine;
        return lineBreak;
      });
      if (qp2) {
        this.outputBytes += qp2.length;
        this.push(qp2);
      }
    } else {
      qp2 = encode(chunk);
      this.outputBytes += qp2.length;
      this.push(qp2, "ascii");
    }
    done();
  }
  _flush(done) {
    if (this._curLine) {
      this.outputBytes += this._curLine.length;
      this.push(this._curLine, "ascii");
    }
    done();
  }
}
var qp$1 = {
  encode,
  wrap,
  Encoder
};
const base64 = base64$1;
const qp = qp$1;
const mimeTypes = mimeTypes_1;
var mimeFuncs$1 = {
  /**
   * Checks if a value is plaintext string (uses only printable 7bit chars)
   *
   * @param {String} value String to be tested
   * @returns {Boolean} true if it is a plaintext string
   */
  isPlainText(value, isParam) {
    const re2 = isParam ? /[\x00-\x08\x0b\x0c\x0e-\x1f"\u0080-\uFFFF]/ : /[\x00-\x08\x0b\x0c\x0e-\x1f\u0080-\uFFFF]/;
    if (typeof value !== "string" || re2.test(value)) {
      return false;
    } else {
      return true;
    }
  },
  /**
   * Checks if a multi line string containes lines longer than the selected value.
   *
   * Useful when detecting if a mail message needs any processing at all –
   * if only plaintext characters are used and lines are short, then there is
   * no need to encode the values in any way. If the value is plaintext but has
   * longer lines then allowed, then use format=flowed
   *
   * @param {Number} lineLength Max line length to check for
   * @returns {Boolean} Returns true if there is at least one line longer than lineLength chars
   */
  hasLongerLines(str2, lineLength) {
    if (str2.length > 128 * 1024) {
      return true;
    }
    return new RegExp("^.{" + (lineLength + 1) + ",}", "m").test(str2);
  },
  /**
   * Encodes a string or an Buffer to an UTF-8 MIME Word (rfc2047)
   *
   * @param {String|Buffer} data String to be encoded
   * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
   * @param {Number} [maxLength=0] If set, split mime words into several chunks if needed
   * @return {String} Single or several mime words joined together
   */
  encodeWord(data, mimeWordEncoding, maxLength) {
    mimeWordEncoding = (mimeWordEncoding || "Q").toString().toUpperCase().trim().charAt(0);
    maxLength = maxLength || 0;
    let encodedStr;
    let toCharset = "UTF-8";
    if (maxLength && maxLength > 7 + toCharset.length) {
      maxLength -= 7 + toCharset.length;
    }
    if (mimeWordEncoding === "Q") {
      encodedStr = qp.encode(data).replace(/[^a-z0-9!*+\-/=]/gi, (chr) => {
        let ord = chr.charCodeAt(0).toString(16).toUpperCase();
        if (chr === " ") {
          return "_";
        } else {
          return "=" + (ord.length === 1 ? "0" + ord : ord);
        }
      });
    } else if (mimeWordEncoding === "B") {
      encodedStr = typeof data === "string" ? data : base64.encode(data);
      maxLength = maxLength ? Math.max(3, (maxLength - maxLength % 4) / 4 * 3) : 0;
    }
    if (maxLength && (mimeWordEncoding !== "B" ? encodedStr : base64.encode(data)).length > maxLength) {
      if (mimeWordEncoding === "Q") {
        encodedStr = this.splitMimeEncodedString(encodedStr, maxLength).join("?= =?" + toCharset + "?" + mimeWordEncoding + "?");
      } else {
        let parts = [];
        let lpart = "";
        for (let i2 = 0, len = encodedStr.length; i2 < len; i2++) {
          let chr = encodedStr.charAt(i2);
          if (/[\ud83c\ud83d\ud83e]/.test(chr) && i2 < len - 1) {
            chr += encodedStr.charAt(++i2);
          }
          if (Buffer.byteLength(lpart + chr) <= maxLength || i2 === 0) {
            lpart += chr;
          } else {
            parts.push(base64.encode(lpart));
            lpart = chr;
          }
        }
        if (lpart) {
          parts.push(base64.encode(lpart));
        }
        if (parts.length > 1) {
          encodedStr = parts.join("?= =?" + toCharset + "?" + mimeWordEncoding + "?");
        } else {
          encodedStr = parts.join("");
        }
      }
    } else if (mimeWordEncoding === "B") {
      encodedStr = base64.encode(data);
    }
    return "=?" + toCharset + "?" + mimeWordEncoding + "?" + encodedStr + (encodedStr.substr(-2) === "?=" ? "" : "?=");
  },
  /**
   * Finds word sequences with non ascii text and converts these to mime words
   *
   * @param {String} value String to be encoded
   * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
   * @param {Number} [maxLength=0] If set, split mime words into several chunks if needed
   * @param {Boolean} [encodeAll=false] If true and the value needs encoding then encodes entire string, not just the smallest match
   * @return {String} String with possible mime words
   */
  encodeWords(value, mimeWordEncoding, maxLength, encodeAll) {
    maxLength = maxLength || 0;
    let encodedValue;
    let firstMatch = value.match(/(?:^|\s)([^\s]*["\u0080-\uFFFF])/);
    if (!firstMatch) {
      return value;
    }
    if (encodeAll) {
      return this.encodeWord(value, mimeWordEncoding, maxLength);
    }
    let lastMatch = value.match(/(["\u0080-\uFFFF][^\s]*)[^"\u0080-\uFFFF]*$/);
    if (!lastMatch) {
      return value;
    }
    let startIndex = firstMatch.index + (firstMatch[0].match(/[^\s]/) || {
      index: 0
    }).index;
    let endIndex = lastMatch.index + (lastMatch[1] || "").length;
    encodedValue = (startIndex ? value.substr(0, startIndex) : "") + this.encodeWord(value.substring(startIndex, endIndex), mimeWordEncoding || "Q", maxLength) + (endIndex < value.length ? value.substr(endIndex) : "");
    return encodedValue;
  },
  /**
   * Joins parsed header value together as 'value; param1=value1; param2=value2'
   * PS: We are following RFC 822 for the list of special characters that we need to keep in quotes.
   *      Refer: https://www.w3.org/Protocols/rfc1341/4_Content-Type.html
   * @param {Object} structured Parsed header value
   * @return {String} joined header value
   */
  buildHeaderValue(structured) {
    let paramsArray = [];
    Object.keys(structured.params || {}).forEach((param) => {
      let value = structured.params[param];
      if (!this.isPlainText(value, true) || value.length >= 75) {
        this.buildHeaderParam(param, value, 50).forEach((encodedParam) => {
          if (!/[\s"\\;:/=(),<>@[\]?]|^[-']|'$/.test(encodedParam.value) || encodedParam.key.substr(-1) === "*") {
            paramsArray.push(encodedParam.key + "=" + encodedParam.value);
          } else {
            paramsArray.push(encodedParam.key + "=" + JSON.stringify(encodedParam.value));
          }
        });
      } else if (/[\s'"\\;:/=(),<>@[\]?]|^-/.test(value)) {
        paramsArray.push(param + "=" + JSON.stringify(value));
      } else {
        paramsArray.push(param + "=" + value);
      }
    });
    return structured.value + (paramsArray.length ? "; " + paramsArray.join("; ") : "");
  },
  /**
   * Encodes a string or an Buffer to an UTF-8 Parameter Value Continuation encoding (rfc2231)
   * Useful for splitting long parameter values.
   *
   * For example
   *      title="unicode string"
   * becomes
   *     title*0*=utf-8''unicode
   *     title*1*=%20string
   *
   * @param {String|Buffer} data String to be encoded
   * @param {Number} [maxLength=50] Max length for generated chunks
   * @param {String} [fromCharset='UTF-8'] Source sharacter set
   * @return {Array} A list of encoded keys and headers
   */
  buildHeaderParam(key, data, maxLength) {
    let list = [];
    let encodedStr = typeof data === "string" ? data : (data || "").toString();
    let encodedStrArr;
    let chr, ord;
    let line;
    let startPos = 0;
    let i2, len;
    maxLength = maxLength || 50;
    if (this.isPlainText(data, true)) {
      if (encodedStr.length <= maxLength) {
        return [
          {
            key,
            value: encodedStr
          }
        ];
      }
      encodedStr = encodedStr.replace(new RegExp(".{" + maxLength + "}", "g"), (str2) => {
        list.push({
          line: str2
        });
        return "";
      });
      if (encodedStr) {
        list.push({
          line: encodedStr
        });
      }
    } else {
      if (/[\uD800-\uDBFF]/.test(encodedStr)) {
        encodedStrArr = [];
        for (i2 = 0, len = encodedStr.length; i2 < len; i2++) {
          chr = encodedStr.charAt(i2);
          ord = chr.charCodeAt(0);
          if (ord >= 55296 && ord <= 56319 && i2 < len - 1) {
            chr += encodedStr.charAt(i2 + 1);
            encodedStrArr.push(chr);
            i2++;
          } else {
            encodedStrArr.push(chr);
          }
        }
        encodedStr = encodedStrArr;
      }
      line = "utf-8''";
      let encoded = true;
      startPos = 0;
      for (i2 = 0, len = encodedStr.length; i2 < len; i2++) {
        chr = encodedStr[i2];
        if (encoded) {
          chr = this.safeEncodeURIComponent(chr);
        } else {
          chr = chr === " " ? chr : this.safeEncodeURIComponent(chr);
          if (chr !== encodedStr[i2]) {
            if ((this.safeEncodeURIComponent(line) + chr).length >= maxLength) {
              list.push({
                line,
                encoded
              });
              line = "";
              startPos = i2 - 1;
            } else {
              encoded = true;
              i2 = startPos;
              line = "";
              continue;
            }
          }
        }
        if ((line + chr).length >= maxLength) {
          list.push({
            line,
            encoded
          });
          line = chr = encodedStr[i2] === " " ? " " : this.safeEncodeURIComponent(encodedStr[i2]);
          if (chr === encodedStr[i2]) {
            encoded = false;
            startPos = i2 - 1;
          } else {
            encoded = true;
          }
        } else {
          line += chr;
        }
      }
      if (line) {
        list.push({
          line,
          encoded
        });
      }
    }
    return list.map((item, i3) => ({
      // encoded lines: {name}*{part}*
      // unencoded lines: {name}*{part}
      // if any line needs to be encoded then the first line (part==0) is always encoded
      key: key + "*" + i3 + (item.encoded ? "*" : ""),
      value: item.line
    }));
  },
  /**
   * Parses a header value with key=value arguments into a structured
   * object.
   *
   *   parseHeaderValue('content-type: text/plain; CHARSET='UTF-8'') ->
   *   {
   *     'value': 'text/plain',
   *     'params': {
   *       'charset': 'UTF-8'
   *     }
   *   }
   *
   * @param {String} str Header value
   * @return {Object} Header value as a parsed structure
   */
  parseHeaderValue(str2) {
    let response = {
      value: false,
      params: {}
    };
    let key = false;
    let value = "";
    let type2 = "value";
    let quote = false;
    let escaped = false;
    let chr;
    for (let i2 = 0, len = str2.length; i2 < len; i2++) {
      chr = str2.charAt(i2);
      if (type2 === "key") {
        if (chr === "=") {
          key = value.trim().toLowerCase();
          type2 = "value";
          value = "";
          continue;
        }
        value += chr;
      } else {
        if (escaped) {
          value += chr;
        } else if (chr === "\\") {
          escaped = true;
          continue;
        } else if (quote && chr === quote) {
          quote = false;
        } else if (!quote && chr === '"') {
          quote = chr;
        } else if (!quote && chr === ";") {
          if (key === false) {
            response.value = value.trim();
          } else {
            response.params[key] = value.trim();
          }
          type2 = "key";
          value = "";
        } else {
          value += chr;
        }
        escaped = false;
      }
    }
    if (type2 === "value") {
      if (key === false) {
        response.value = value.trim();
      } else {
        response.params[key] = value.trim();
      }
    } else if (value.trim()) {
      response.params[value.trim().toLowerCase()] = "";
    }
    Object.keys(response.params).forEach((key2) => {
      let actualKey, nr, match, value2;
      if (match = key2.match(/(\*(\d+)|\*(\d+)\*|\*)$/)) {
        actualKey = key2.substr(0, match.index);
        nr = Number(match[2] || match[3]) || 0;
        if (!response.params[actualKey] || typeof response.params[actualKey] !== "object") {
          response.params[actualKey] = {
            charset: false,
            values: []
          };
        }
        value2 = response.params[key2];
        if (nr === 0 && match[0].substr(-1) === "*" && (match = value2.match(/^([^']*)'[^']*'(.*)$/))) {
          response.params[actualKey].charset = match[1] || "iso-8859-1";
          value2 = match[2];
        }
        response.params[actualKey].values[nr] = value2;
        delete response.params[key2];
      }
    });
    Object.keys(response.params).forEach((key2) => {
      let value2;
      if (response.params[key2] && Array.isArray(response.params[key2].values)) {
        value2 = response.params[key2].values.map((val) => val || "").join("");
        if (response.params[key2].charset) {
          response.params[key2] = "=?" + response.params[key2].charset + "?Q?" + value2.replace(/[=?_\s]/g, (s) => {
            let c = s.charCodeAt(0).toString(16);
            if (s === " ") {
              return "_";
            } else {
              return "%" + (c.length < 2 ? "0" : "") + c;
            }
          }).replace(/%/g, "=") + "?=";
        } else {
          response.params[key2] = value2;
        }
      }
    });
    return response;
  },
  /**
   * Returns file extension for a content type string. If no suitable extensions
   * are found, 'bin' is used as the default extension
   *
   * @param {String} mimeType Content type to be checked for
   * @return {String} File extension
   */
  detectExtension: (mimeType) => mimeTypes.detectExtension(mimeType),
  /**
   * Returns content type for a file extension. If no suitable content types
   * are found, 'application/octet-stream' is used as the default content type
   *
   * @param {String} extension Extension to be checked for
   * @return {String} File extension
   */
  detectMimeType: (extension) => mimeTypes.detectMimeType(extension),
  /**
   * Folds long lines, useful for folding header lines (afterSpace=false) and
   * flowed text (afterSpace=true)
   *
   * @param {String} str String to be folded
   * @param {Number} [lineLength=76] Maximum length of a line
   * @param {Boolean} afterSpace If true, leave a space in th end of a line
   * @return {String} String with folded lines
   */
  foldLines(str2, lineLength, afterSpace) {
    str2 = (str2 || "").toString();
    lineLength = lineLength || 76;
    let pos = 0, len = str2.length, result = "", line, match;
    while (pos < len) {
      line = str2.substr(pos, lineLength);
      if (line.length < lineLength) {
        result += line;
        break;
      }
      if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
        line = match[0];
        result += line;
        pos += line.length;
        continue;
      } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
        line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
      } else if (match = str2.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
        line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
      }
      result += line;
      pos += line.length;
      if (pos < len) {
        result += "\r\n";
      }
    }
    return result;
  },
  /**
   * Splits a mime encoded string. Needed for dividing mime words into smaller chunks
   *
   * @param {String} str Mime encoded string to be split up
   * @param {Number} maxlen Maximum length of characters for one part (minimum 12)
   * @return {Array} Split string
   */
  splitMimeEncodedString: (str2, maxlen) => {
    let curLine, match, chr, done, lines = [];
    maxlen = Math.max(maxlen || 0, 12);
    while (str2.length) {
      curLine = str2.substr(0, maxlen);
      if (match = curLine.match(/[=][0-9A-F]?$/i)) {
        curLine = curLine.substr(0, match.index);
      }
      done = false;
      while (!done) {
        done = true;
        if (match = str2.substr(curLine.length).match(/^[=]([0-9A-F]{2})/i)) {
          chr = parseInt(match[1], 16);
          if (chr < 194 && chr > 127) {
            curLine = curLine.substr(0, curLine.length - 3);
            done = false;
          }
        }
      }
      if (curLine.length) {
        lines.push(curLine);
      }
      str2 = str2.substr(curLine.length);
    }
    return lines;
  },
  encodeURICharComponent: (chr) => {
    let res = "";
    let ord = chr.charCodeAt(0).toString(16).toUpperCase();
    if (ord.length % 2) {
      ord = "0" + ord;
    }
    if (ord.length > 2) {
      for (let i2 = 0, len = ord.length / 2; i2 < len; i2++) {
        res += "%" + ord.substr(i2, 2);
      }
    } else {
      res += "%" + ord;
    }
    return res;
  },
  safeEncodeURIComponent(str2) {
    str2 = (str2 || "").toString();
    try {
      str2 = encodeURIComponent(str2);
    } catch (_E) {
      return str2.replace(/[^\x00-\x1F *'()<>@,;:\\"[\]?=\u007F-\uFFFF]+/g, "");
    }
    return str2.replace(/[\x00-\x1F *'()<>@,;:\\"[\]?=\u007F-\uFFFF]/g, (chr) => this.encodeURICharComponent(chr));
  }
};
require$$0$2.Transform;
const stream$2 = require$$0$2;
stream$2.Transform;
const stream$1 = require$$0$2;
stream$1.Transform;
require$$0$2.PassThrough;
sharedExports.parseDataURI;
require$$0$2.Transform;
require$$0$2.Transform;
var sign = { exports: {} };
const punycode = punycode_1;
const mimeFuncs = mimeFuncs$1;
const crypto = require$$0$1;
sign.exports = (headers, hashAlgo, bodyHash, options2) => {
  options2 = options2 || {};
  let defaultFieldNames = "From:Sender:Reply-To:Subject:Date:Message-ID:To:Cc:MIME-Version:Content-Type:Content-Transfer-Encoding:Content-ID:Content-Description:Resent-Date:Resent-From:Resent-Sender:Resent-To:Resent-Cc:Resent-Message-ID:In-Reply-To:References:List-Id:List-Help:List-Unsubscribe:List-Subscribe:List-Post:List-Owner:List-Archive";
  let fieldNames = options2.headerFieldNames || defaultFieldNames;
  let canonicalizedHeaderData = relaxedHeaders(headers, fieldNames, options2.skipFields);
  let dkimHeader = generateDKIMHeader(options2.domainName, options2.keySelector, canonicalizedHeaderData.fieldNames, hashAlgo, bodyHash);
  let signer, signature;
  canonicalizedHeaderData.headers += "dkim-signature:" + relaxedHeaderLine(dkimHeader);
  signer = crypto.createSign(("rsa-" + hashAlgo).toUpperCase());
  signer.update(canonicalizedHeaderData.headers);
  try {
    signature = signer.sign(options2.privateKey, "base64");
  } catch (_E) {
    return false;
  }
  return dkimHeader + signature.replace(/(^.{73}|.{75}(?!\r?\n|\r))/g, "$&\r\n ").trim();
};
sign.exports.relaxedHeaders = relaxedHeaders;
function generateDKIMHeader(domainName, keySelector, fieldNames, hashAlgo, bodyHash) {
  let dkim = [
    "v=1",
    "a=rsa-" + hashAlgo,
    "c=relaxed/relaxed",
    "d=" + punycode.toASCII(domainName),
    "q=dns/txt",
    "s=" + keySelector,
    "bh=" + bodyHash,
    "h=" + fieldNames
  ].join("; ");
  return mimeFuncs.foldLines("DKIM-Signature: " + dkim, 76) + ";\r\n b=";
}
function relaxedHeaders(headers, fieldNames, skipFields) {
  let includedFields = /* @__PURE__ */ new Set();
  let skip = /* @__PURE__ */ new Set();
  let headerFields = /* @__PURE__ */ new Map();
  (skipFields || "").toLowerCase().split(":").forEach((field) => {
    skip.add(field.trim());
  });
  (fieldNames || "").toLowerCase().split(":").filter((field) => !skip.has(field.trim())).forEach((field) => {
    includedFields.add(field.trim());
  });
  for (let i2 = headers.length - 1; i2 >= 0; i2--) {
    let line = headers[i2];
    if (includedFields.has(line.key) && !headerFields.has(line.key)) {
      headerFields.set(line.key, relaxedHeaderLine(line.line));
    }
  }
  let headersList = [];
  let fields = [];
  includedFields.forEach((field) => {
    if (headerFields.has(field)) {
      fields.push(field);
      headersList.push(field + ":" + headerFields.get(field));
    }
  });
  return {
    headers: headersList.join("\r\n") + "\r\n",
    fieldNames: fields.join(":")
  };
}
function relaxedHeaderLine(line) {
  return line.substr(line.indexOf(":") + 1).replace(/\r?\n/g, "").replace(/\s+/g, " ").trim();
}
require$$0$2.PassThrough;
const stream = require$$0$2;
stream.Transform;
require$$0$4.EventEmitter;
require$$0$2.PassThrough;
require$$0$2.Stream;
sharedExports.assign;
const Aliyun = {
  description: "Alibaba Cloud Mail",
  domains: [
    "aliyun.com"
  ],
  host: "smtp.aliyun.com",
  port: 465,
  secure: true
};
const AliyunQiye = {
  description: "Alibaba Cloud Enterprise Mail",
  host: "smtp.qiye.aliyun.com",
  port: 465,
  secure: true
};
const AOL = {
  description: "AOL Mail",
  domains: [
    "aol.com"
  ],
  host: "smtp.aol.com",
  port: 587
};
const Aruba = {
  description: "Aruba PEC (Italian email provider)",
  domains: [
    "aruba.it",
    "pec.aruba.it"
  ],
  aliases: [
    "Aruba PEC"
  ],
  host: "smtps.aruba.it",
  port: 465,
  secure: true,
  authMethod: "LOGIN"
};
const Bluewin = {
  description: "Bluewin (Swiss email provider)",
  host: "smtpauths.bluewin.ch",
  domains: [
    "bluewin.ch"
  ],
  port: 465
};
const BOL = {
  description: "BOL Mail (Brazilian provider)",
  domains: [
    "bol.com.br"
  ],
  host: "smtp.bol.com.br",
  port: 587,
  requireTLS: true
};
const DebugMail = {
  description: "DebugMail (email testing service)",
  host: "debugmail.io",
  port: 25
};
const Disroot = {
  description: "Disroot (privacy-focused provider)",
  domains: [
    "disroot.org"
  ],
  host: "disroot.org",
  port: 587,
  secure: false,
  authMethod: "LOGIN"
};
const DynectEmail = {
  description: "Dyn Email Delivery",
  aliases: [
    "Dynect"
  ],
  host: "smtp.dynect.net",
  port: 25
};
const ElasticEmail = {
  description: "Elastic Email",
  aliases: [
    "Elastic Email"
  ],
  host: "smtp.elasticemail.com",
  port: 465,
  secure: true
};
const Ethereal = {
  description: "Ethereal Email (email testing service)",
  aliases: [
    "ethereal.email"
  ],
  host: "smtp.ethereal.email",
  port: 587
};
const FastMail = {
  description: "FastMail",
  domains: [
    "fastmail.fm"
  ],
  host: "smtp.fastmail.com",
  port: 465,
  secure: true
};
const GandiMail = {
  description: "Gandi Mail",
  aliases: [
    "Gandi",
    "Gandi Mail"
  ],
  host: "mail.gandi.net",
  port: 587
};
const Gmail = {
  description: "Gmail",
  aliases: [
    "Google Mail"
  ],
  domains: [
    "gmail.com",
    "googlemail.com"
  ],
  host: "smtp.gmail.com",
  port: 465,
  secure: true
};
const GmailWorkspace = {
  description: "Gmail Workspace",
  aliases: [
    "Google Workspace Mail"
  ],
  host: "smtp-relay.gmail.com",
  port: 465,
  secure: true
};
const GMX = {
  description: "GMX Mail",
  domains: [
    "gmx.com",
    "gmx.net",
    "gmx.de"
  ],
  host: "mail.gmx.com",
  port: 587
};
const Godaddy = {
  description: "GoDaddy Email (US)",
  host: "smtpout.secureserver.net",
  port: 25
};
const GodaddyAsia = {
  description: "GoDaddy Email (Asia)",
  host: "smtp.asia.secureserver.net",
  port: 25
};
const GodaddyEurope = {
  description: "GoDaddy Email (Europe)",
  host: "smtp.europe.secureserver.net",
  port: 25
};
const Hotmail = {
  description: "Outlook.com / Hotmail",
  aliases: [
    "Outlook",
    "Outlook.com",
    "Hotmail.com"
  ],
  domains: [
    "hotmail.com",
    "outlook.com"
  ],
  host: "smtp-mail.outlook.com",
  port: 587
};
const iCloud = {
  description: "iCloud Mail",
  aliases: [
    "Me",
    "Mac"
  ],
  domains: [
    "me.com",
    "mac.com"
  ],
  host: "smtp.mail.me.com",
  port: 587
};
const Infomaniak = {
  description: "Infomaniak Mail (Swiss hosting provider)",
  host: "mail.infomaniak.com",
  domains: [
    "ik.me",
    "ikmail.com",
    "etik.com"
  ],
  port: 587
};
const KolabNow = {
  description: "KolabNow (secure email service)",
  domains: [
    "kolabnow.com"
  ],
  aliases: [
    "Kolab"
  ],
  host: "smtp.kolabnow.com",
  port: 465,
  secure: true,
  authMethod: "LOGIN"
};
const Loopia = {
  description: "Loopia (Swedish hosting provider)",
  host: "mailcluster.loopia.se",
  port: 465
};
const Loops = {
  description: "Loops",
  host: "smtp.loops.so",
  port: 587
};
const Maildev = {
  description: "MailDev (local email testing)",
  port: 1025,
  ignoreTLS: true
};
const MailerSend = {
  description: "MailerSend",
  host: "smtp.mailersend.net",
  port: 587
};
const Mailgun = {
  description: "Mailgun",
  host: "smtp.mailgun.org",
  port: 465,
  secure: true
};
const Mailjet = {
  description: "Mailjet",
  host: "in.mailjet.com",
  port: 587
};
const Mailosaur = {
  description: "Mailosaur (email testing service)",
  host: "mailosaur.io",
  port: 25
};
const Mailtrap = {
  description: "Mailtrap",
  host: "live.smtp.mailtrap.io",
  port: 587
};
const Mandrill = {
  description: "Mandrill (by Mailchimp)",
  host: "smtp.mandrillapp.com",
  port: 587
};
const Naver = {
  description: "Naver Mail (Korean email provider)",
  host: "smtp.naver.com",
  port: 587
};
const OhMySMTP = {
  description: "OhMySMTP (email delivery service)",
  host: "smtp.ohmysmtp.com",
  port: 587,
  secure: false
};
const One = {
  description: "One.com Email",
  host: "send.one.com",
  port: 465,
  secure: true
};
const OpenMailBox = {
  description: "OpenMailBox",
  aliases: [
    "OMB",
    "openmailbox.org"
  ],
  host: "smtp.openmailbox.org",
  port: 465,
  secure: true
};
const Outlook365 = {
  description: "Microsoft 365 / Office 365",
  host: "smtp.office365.com",
  port: 587,
  secure: false
};
const Postmark = {
  description: "Postmark",
  aliases: [
    "PostmarkApp"
  ],
  host: "smtp.postmarkapp.com",
  port: 2525
};
const Proton = {
  description: "Proton Mail",
  aliases: [
    "ProtonMail",
    "Proton.me",
    "Protonmail.com",
    "Protonmail.ch"
  ],
  domains: [
    "proton.me",
    "protonmail.com",
    "pm.me",
    "protonmail.ch"
  ],
  host: "smtp.protonmail.ch",
  port: 587,
  requireTLS: true
};
const QQ = {
  description: "QQ Mail",
  domains: [
    "qq.com"
  ],
  host: "smtp.qq.com",
  port: 465,
  secure: true
};
const QQex = {
  description: "QQ Enterprise Mail",
  aliases: [
    "QQ Enterprise"
  ],
  domains: [
    "exmail.qq.com"
  ],
  host: "smtp.exmail.qq.com",
  port: 465,
  secure: true
};
const Resend = {
  description: "Resend",
  host: "smtp.resend.com",
  port: 465,
  secure: true
};
const Runbox = {
  description: "Runbox (Norwegian email provider)",
  domains: [
    "runbox.com"
  ],
  host: "smtp.runbox.com",
  port: 465,
  secure: true
};
const SendCloud = {
  description: "SendCloud (Chinese email delivery)",
  host: "smtp.sendcloud.net",
  port: 2525
};
const SendGrid = {
  description: "SendGrid",
  host: "smtp.sendgrid.net",
  port: 587
};
const SendinBlue = {
  description: "Brevo (formerly Sendinblue)",
  aliases: [
    "Brevo"
  ],
  host: "smtp-relay.brevo.com",
  port: 587
};
const SendPulse = {
  description: "SendPulse",
  host: "smtp-pulse.com",
  port: 465,
  secure: true
};
const SES = {
  description: "AWS SES US East (N. Virginia)",
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 465,
  secure: true
};
const Seznam = {
  description: "Seznam Email (Czech email provider)",
  aliases: [
    "Seznam Email"
  ],
  domains: [
    "seznam.cz",
    "email.cz",
    "post.cz",
    "spoluzaci.cz"
  ],
  host: "smtp.seznam.cz",
  port: 465,
  secure: true
};
const SMTP2GO = {
  description: "SMTP2GO",
  host: "mail.smtp2go.com",
  port: 2525
};
const Sparkpost = {
  description: "SparkPost",
  aliases: [
    "SparkPost",
    "SparkPost Mail"
  ],
  domains: [
    "sparkpost.com"
  ],
  host: "smtp.sparkpostmail.com",
  port: 587,
  secure: false
};
const Tipimail = {
  description: "Tipimail (email delivery service)",
  host: "smtp.tipimail.com",
  port: 587
};
const Tutanota = {
  description: "Tutanota (Tuta Mail)",
  domains: [
    "tutanota.com",
    "tuta.com",
    "tutanota.de",
    "tuta.io"
  ],
  host: "smtp.tutanota.com",
  port: 465,
  secure: true
};
const Yahoo = {
  description: "Yahoo Mail",
  domains: [
    "yahoo.com"
  ],
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true
};
const Yandex = {
  description: "Yandex Mail",
  domains: [
    "yandex.ru"
  ],
  host: "smtp.yandex.ru",
  port: 465,
  secure: true
};
const Zimbra = {
  description: "Zimbra Mail Server",
  aliases: [
    "Zimbra Collaboration"
  ],
  host: "smtp.zimbra.com",
  port: 587,
  requireTLS: true
};
const Zoho = {
  description: "Zoho Mail",
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  authMethod: "LOGIN"
};
const require$$0 = {
  "126": {
    description: "126 Mail (NetEase)",
    host: "smtp.126.com",
    port: 465,
    secure: true
  },
  "163": {
    description: "163 Mail (NetEase)",
    host: "smtp.163.com",
    port: 465,
    secure: true
  },
  "1und1": {
    description: "1&1 Mail (German hosting provider)",
    host: "smtp.1und1.de",
    port: 465,
    secure: true,
    authMethod: "LOGIN"
  },
  Aliyun,
  AliyunQiye,
  AOL,
  Aruba,
  Bluewin,
  BOL,
  DebugMail,
  Disroot,
  DynectEmail,
  ElasticEmail,
  Ethereal,
  FastMail,
  "Feishu Mail": {
    description: "Feishu Mail (Lark)",
    aliases: [
      "Feishu",
      "FeishuMail"
    ],
    domains: [
      "www.feishu.cn"
    ],
    host: "smtp.feishu.cn",
    port: 465,
    secure: true
  },
  "Forward Email": {
    description: "Forward Email (email forwarding service)",
    aliases: [
      "FE",
      "ForwardEmail"
    ],
    domains: [
      "forwardemail.net"
    ],
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true
  },
  GandiMail,
  Gmail,
  GmailWorkspace,
  GMX,
  Godaddy,
  GodaddyAsia,
  GodaddyEurope,
  "hot.ee": {
    description: "Hot.ee (Estonian email provider)",
    host: "mail.hot.ee"
  },
  Hotmail,
  iCloud,
  Infomaniak,
  KolabNow,
  Loopia,
  Loops,
  "mail.ee": {
    description: "Mail.ee (Estonian email provider)",
    host: "smtp.mail.ee"
  },
  "Mail.ru": {
    description: "Mail.ru",
    host: "smtp.mail.ru",
    port: 465,
    secure: true
  },
  "Mailcatch.app": {
    description: "Mailcatch (email testing service)",
    host: "sandbox-smtp.mailcatch.app",
    port: 2525
  },
  Maildev,
  MailerSend,
  Mailgun,
  Mailjet,
  Mailosaur,
  Mailtrap,
  Mandrill,
  Naver,
  OhMySMTP,
  One,
  OpenMailBox,
  Outlook365,
  Postmark,
  Proton,
  "qiye.aliyun": {
    description: "Alibaba Mail Enterprise Edition",
    host: "smtp.mxhichina.com",
    port: "465",
    secure: true
  },
  QQ,
  QQex,
  Resend,
  Runbox,
  SendCloud,
  SendGrid,
  SendinBlue,
  SendPulse,
  SES,
  "SES-AP-NORTHEAST-1": {
    description: "AWS SES Asia Pacific (Tokyo)",
    host: "email-smtp.ap-northeast-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-AP-NORTHEAST-2": {
    description: "AWS SES Asia Pacific (Seoul)",
    host: "email-smtp.ap-northeast-2.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-AP-NORTHEAST-3": {
    description: "AWS SES Asia Pacific (Osaka)",
    host: "email-smtp.ap-northeast-3.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-AP-SOUTH-1": {
    description: "AWS SES Asia Pacific (Mumbai)",
    host: "email-smtp.ap-south-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-AP-SOUTHEAST-1": {
    description: "AWS SES Asia Pacific (Singapore)",
    host: "email-smtp.ap-southeast-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-AP-SOUTHEAST-2": {
    description: "AWS SES Asia Pacific (Sydney)",
    host: "email-smtp.ap-southeast-2.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-CA-CENTRAL-1": {
    description: "AWS SES Canada (Central)",
    host: "email-smtp.ca-central-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-EU-CENTRAL-1": {
    description: "AWS SES Europe (Frankfurt)",
    host: "email-smtp.eu-central-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-EU-NORTH-1": {
    description: "AWS SES Europe (Stockholm)",
    host: "email-smtp.eu-north-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-EU-WEST-1": {
    description: "AWS SES Europe (Ireland)",
    host: "email-smtp.eu-west-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-EU-WEST-2": {
    description: "AWS SES Europe (London)",
    host: "email-smtp.eu-west-2.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-EU-WEST-3": {
    description: "AWS SES Europe (Paris)",
    host: "email-smtp.eu-west-3.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-SA-EAST-1": {
    description: "AWS SES South America (São Paulo)",
    host: "email-smtp.sa-east-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-EAST-1": {
    description: "AWS SES US East (N. Virginia)",
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-EAST-2": {
    description: "AWS SES US East (Ohio)",
    host: "email-smtp.us-east-2.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-GOV-EAST-1": {
    description: "AWS SES GovCloud (US-East)",
    host: "email-smtp.us-gov-east-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-GOV-WEST-1": {
    description: "AWS SES GovCloud (US-West)",
    host: "email-smtp.us-gov-west-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-WEST-1": {
    description: "AWS SES US West (N. California)",
    host: "email-smtp.us-west-1.amazonaws.com",
    port: 465,
    secure: true
  },
  "SES-US-WEST-2": {
    description: "AWS SES US West (Oregon)",
    host: "email-smtp.us-west-2.amazonaws.com",
    port: 465,
    secure: true
  },
  Seznam,
  SMTP2GO,
  Sparkpost,
  Tipimail,
  Tutanota,
  Yahoo,
  Yandex,
  Zimbra,
  Zoho
};
const services = require$$0;
const normalized = {};
Object.keys(services).forEach((key) => {
  let service = services[key];
  normalized[normalizeKey(key)] = normalizeService(service);
  [].concat(service.aliases || []).forEach((alias) => {
    normalized[normalizeKey(alias)] = normalizeService(service);
  });
  [].concat(service.domains || []).forEach((domain) => {
    normalized[normalizeKey(domain)] = normalizeService(service);
  });
});
function normalizeKey(key) {
  return key.replace(/[^a-zA-Z0-9.-]/g, "").toLowerCase();
}
function normalizeService(service) {
  let filter = ["domains", "aliases"];
  let response = {};
  Object.keys(service).forEach((key) => {
    if (filter.indexOf(key) < 0) {
      response[key] = service[key];
    }
  });
  return response;
}
require$$0$5.spawn;
(process.env.ETHEREAL_API || "https://api.nodemailer.com").replace(/\/+$/, "");
(process.env.ETHEREAL_WEB || "https://ethereal.email").replace(/\/+$/, "");
(process.env.ETHEREAL_API_KEY || "").replace(/\s*/g, "") || null;
["true", "yes", "y", "1"].includes((process.env.ETHEREAL_CACHE || "yes").toString().trim().toLowerCase());
var src$1 = { exports: {} };
var electronLogPreload = { exports: {} };
var hasRequiredElectronLogPreload;
function requireElectronLogPreload() {
  if (hasRequiredElectronLogPreload) return electronLogPreload.exports;
  hasRequiredElectronLogPreload = 1;
  (function(module) {
    let electron = {};
    try {
      electron = require("electron");
    } catch (e) {
    }
    if (electron.ipcRenderer) {
      initialize2(electron);
    }
    {
      module.exports = initialize2;
    }
    function initialize2({ contextBridge, ipcRenderer }) {
      if (!ipcRenderer) {
        return;
      }
      ipcRenderer.on("__ELECTRON_LOG_IPC__", (_, message) => {
        window.postMessage({ cmd: "message", ...message });
      });
      ipcRenderer.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((e) => console.error(new Error(
        `electron-log isn't initialized in the main process. Please call log.initialize() before. ${e.message}`
      )));
      const electronLog = {
        sendToMain(message) {
          try {
            ipcRenderer.send("__ELECTRON_LOG__", message);
          } catch (e) {
            console.error("electronLog.sendToMain ", e, "data:", message);
            ipcRenderer.send("__ELECTRON_LOG__", {
              cmd: "errorHandler",
              error: { message: e?.message, stack: e?.stack },
              errorName: "sendToMain"
            });
          }
        },
        log(...data) {
          electronLog.sendToMain({ data, level: "info" });
        }
      };
      for (const level of ["error", "warn", "info", "verbose", "debug", "silly"]) {
        electronLog[level] = (...data) => electronLog.sendToMain({
          data,
          level
        });
      }
      if (contextBridge && process.contextIsolated) {
        try {
          contextBridge.exposeInMainWorld("__electronLog", electronLog);
        } catch {
        }
      }
      if (typeof window === "object") {
        window.__electronLog = electronLog;
      } else {
        __electronLog = electronLog;
      }
    }
  })(electronLogPreload);
  return electronLogPreload.exports;
}
var renderer = { exports: {} };
var scope;
var hasRequiredScope;
function requireScope() {
  if (hasRequiredScope) return scope;
  hasRequiredScope = 1;
  scope = scopeFactory;
  function scopeFactory(logger) {
    return Object.defineProperties(scope2, {
      defaultLabel: { value: "", writable: true },
      labelPadding: { value: true, writable: true },
      maxLabelLength: { value: 0, writable: true },
      labelLength: {
        get() {
          switch (typeof scope2.labelPadding) {
            case "boolean":
              return scope2.labelPadding ? scope2.maxLabelLength : 0;
            case "number":
              return scope2.labelPadding;
            default:
              return 0;
          }
        }
      }
    });
    function scope2(label) {
      scope2.maxLabelLength = Math.max(scope2.maxLabelLength, label.length);
      const newScope = {};
      for (const level of logger.levels) {
        newScope[level] = (...d) => logger.logData(d, { level, scope: label });
      }
      newScope.log = newScope.info;
      return newScope;
    }
  }
  return scope;
}
var Buffering_1;
var hasRequiredBuffering;
function requireBuffering() {
  if (hasRequiredBuffering) return Buffering_1;
  hasRequiredBuffering = 1;
  class Buffering {
    constructor({ processMessage }) {
      this.processMessage = processMessage;
      this.buffer = [];
      this.enabled = false;
      this.begin = this.begin.bind(this);
      this.commit = this.commit.bind(this);
      this.reject = this.reject.bind(this);
    }
    addMessage(message) {
      this.buffer.push(message);
    }
    begin() {
      this.enabled = [];
    }
    commit() {
      this.enabled = false;
      this.buffer.forEach((item) => this.processMessage(item));
      this.buffer = [];
    }
    reject() {
      this.enabled = false;
      this.buffer = [];
    }
  }
  Buffering_1 = Buffering;
  return Buffering_1;
}
var Logger_1;
var hasRequiredLogger;
function requireLogger() {
  if (hasRequiredLogger) return Logger_1;
  hasRequiredLogger = 1;
  const scopeFactory = requireScope();
  const Buffering = requireBuffering();
  class Logger {
    static instances = {};
    dependencies = {};
    errorHandler = null;
    eventLogger = null;
    functions = {};
    hooks = [];
    isDev = false;
    levels = null;
    logId = null;
    scope = null;
    transports = {};
    variables = {};
    constructor({
      allowUnknownLevel = false,
      dependencies = {},
      errorHandler,
      eventLogger,
      initializeFn,
      isDev = false,
      levels = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId,
      transportFactories = {},
      variables
    } = {}) {
      this.addLevel = this.addLevel.bind(this);
      this.create = this.create.bind(this);
      this.initialize = this.initialize.bind(this);
      this.logData = this.logData.bind(this);
      this.processMessage = this.processMessage.bind(this);
      this.allowUnknownLevel = allowUnknownLevel;
      this.buffering = new Buffering(this);
      this.dependencies = dependencies;
      this.initializeFn = initializeFn;
      this.isDev = isDev;
      this.levels = levels;
      this.logId = logId;
      this.scope = scopeFactory(this);
      this.transportFactories = transportFactories;
      this.variables = variables || {};
      for (const name of this.levels) {
        this.addLevel(name, false);
      }
      this.log = this.info;
      this.functions.log = this.log;
      this.errorHandler = errorHandler;
      errorHandler?.setOptions({ ...dependencies, logFn: this.error });
      this.eventLogger = eventLogger;
      eventLogger?.setOptions({ ...dependencies, logger: this });
      for (const [name, factory] of Object.entries(transportFactories)) {
        this.transports[name] = factory(this, dependencies);
      }
      Logger.instances[logId] = this;
    }
    static getInstance({ logId }) {
      return this.instances[logId] || this.instances.default;
    }
    addLevel(level, index = this.levels.length) {
      if (index !== false) {
        this.levels.splice(index, 0, level);
      }
      this[level] = (...args) => this.logData(args, { level });
      this.functions[level] = this[level];
    }
    catchErrors(options2) {
      this.processMessage(
        {
          data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
          level: "warn"
        },
        { transports: ["console"] }
      );
      return this.errorHandler.startCatching(options2);
    }
    create(options2) {
      if (typeof options2 === "string") {
        options2 = { logId: options2 };
      }
      return new Logger({
        dependencies: this.dependencies,
        errorHandler: this.errorHandler,
        initializeFn: this.initializeFn,
        isDev: this.isDev,
        transportFactories: this.transportFactories,
        variables: { ...this.variables },
        ...options2
      });
    }
    compareLevels(passLevel, checkLevel, levels = this.levels) {
      const pass = levels.indexOf(passLevel);
      const check = levels.indexOf(checkLevel);
      if (check === -1 || pass === -1) {
        return true;
      }
      return check <= pass;
    }
    initialize(options2 = {}) {
      this.initializeFn({ logger: this, ...this.dependencies, ...options2 });
    }
    logData(data, options2 = {}) {
      if (this.buffering.enabled) {
        this.buffering.addMessage({ data, date: /* @__PURE__ */ new Date(), ...options2 });
      } else {
        this.processMessage({ data, ...options2 });
      }
    }
    processMessage(message, { transports = this.transports } = {}) {
      if (message.cmd === "errorHandler") {
        this.errorHandler.handle(message.error, {
          errorName: message.errorName,
          processType: "renderer",
          showDialog: Boolean(message.showDialog)
        });
        return;
      }
      let level = message.level;
      if (!this.allowUnknownLevel) {
        level = this.levels.includes(message.level) ? message.level : "info";
      }
      const normalizedMessage = {
        date: /* @__PURE__ */ new Date(),
        logId: this.logId,
        ...message,
        level,
        variables: {
          ...this.variables,
          ...message.variables
        }
      };
      for (const [transName, transFn] of this.transportEntries(transports)) {
        if (typeof transFn !== "function" || transFn.level === false) {
          continue;
        }
        if (!this.compareLevels(transFn.level, message.level)) {
          continue;
        }
        try {
          const transformedMsg = this.hooks.reduce((msg, hook) => {
            return msg ? hook(msg, transFn, transName) : msg;
          }, normalizedMessage);
          if (transformedMsg) {
            transFn({ ...transformedMsg, data: [...transformedMsg.data] });
          }
        } catch (e) {
          this.processInternalErrorFn(e);
        }
      }
    }
    processInternalErrorFn(_e) {
    }
    transportEntries(transports = this.transports) {
      const transportArray = Array.isArray(transports) ? transports : Object.entries(transports);
      return transportArray.map((item) => {
        switch (typeof item) {
          case "string":
            return this.transports[item] ? [item, this.transports[item]] : null;
          case "function":
            return [item.name, item];
          default:
            return Array.isArray(item) ? item : null;
        }
      }).filter(Boolean);
    }
  }
  Logger_1 = Logger;
  return Logger_1;
}
var RendererErrorHandler_1;
var hasRequiredRendererErrorHandler;
function requireRendererErrorHandler() {
  if (hasRequiredRendererErrorHandler) return RendererErrorHandler_1;
  hasRequiredRendererErrorHandler = 1;
  const consoleError = console.error;
  class RendererErrorHandler {
    logFn = null;
    onError = null;
    showDialog = false;
    preventDefault = true;
    constructor({ logFn = null } = {}) {
      this.handleError = this.handleError.bind(this);
      this.handleRejection = this.handleRejection.bind(this);
      this.startCatching = this.startCatching.bind(this);
      this.logFn = logFn;
    }
    handle(error2, {
      logFn = this.logFn,
      errorName = "",
      onError = this.onError,
      showDialog = this.showDialog
    } = {}) {
      try {
        if (onError?.({ error: error2, errorName, processType: "renderer" }) !== false) {
          logFn({ error: error2, errorName, showDialog });
        }
      } catch {
        consoleError(error2);
      }
    }
    setOptions({ logFn, onError, preventDefault, showDialog }) {
      if (typeof logFn === "function") {
        this.logFn = logFn;
      }
      if (typeof onError === "function") {
        this.onError = onError;
      }
      if (typeof preventDefault === "boolean") {
        this.preventDefault = preventDefault;
      }
      if (typeof showDialog === "boolean") {
        this.showDialog = showDialog;
      }
    }
    startCatching({ onError, showDialog } = {}) {
      if (this.isActive) {
        return;
      }
      this.isActive = true;
      this.setOptions({ onError, showDialog });
      window.addEventListener("error", (event) => {
        this.preventDefault && event.preventDefault?.();
        this.handleError(event.error || event);
      });
      window.addEventListener("unhandledrejection", (event) => {
        this.preventDefault && event.preventDefault?.();
        this.handleRejection(event.reason || event);
      });
    }
    handleError(error2) {
      this.handle(error2, { errorName: "Unhandled" });
    }
    handleRejection(reason) {
      const error2 = reason instanceof Error ? reason : new Error(JSON.stringify(reason));
      this.handle(error2, { errorName: "Unhandled rejection" });
    }
  }
  RendererErrorHandler_1 = RendererErrorHandler;
  return RendererErrorHandler_1;
}
var transform_1;
var hasRequiredTransform;
function requireTransform() {
  if (hasRequiredTransform) return transform_1;
  hasRequiredTransform = 1;
  transform_1 = { transform };
  function transform({
    logger,
    message,
    transport,
    initialData = message?.data || [],
    transforms = transport?.transforms
  }) {
    return transforms.reduce((data, trans) => {
      if (typeof trans === "function") {
        return trans({ data, logger, message, transport });
      }
      return data;
    }, initialData);
  }
  return transform_1;
}
var console_1$1;
var hasRequiredConsole$1;
function requireConsole$1() {
  if (hasRequiredConsole$1) return console_1$1;
  hasRequiredConsole$1 = 1;
  const { transform } = requireTransform();
  console_1$1 = consoleTransportRendererFactory;
  const consoleMethods = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  function consoleTransportRendererFactory(logger) {
    return Object.assign(transport, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      transforms: [formatDataFn],
      writeFn({ message: { level, data } }) {
        const consoleLogFn = consoleMethods[level] || consoleMethods.info;
        setTimeout(() => consoleLogFn(...data));
      }
    });
    function transport(message) {
      transport.writeFn({
        message: { ...message, data: transform({ logger, message, transport }) }
      });
    }
  }
  function formatDataFn({
    data = [],
    logger = {},
    message = {},
    transport = {}
  }) {
    if (typeof transport.format === "function") {
      return transport.format({
        data,
        level: message?.level || "info",
        logger,
        message,
        transport
      });
    }
    if (typeof transport.format !== "string") {
      return data;
    }
    data.unshift(transport.format);
    if (typeof data[1] === "string" && data[1].match(/%[1cdfiOos]/)) {
      data = [`${data[0]}${data[1]}`, ...data.slice(2)];
    }
    const date = message.date || /* @__PURE__ */ new Date();
    data[0] = data[0].replace(/\{(\w+)}/g, (substring, name) => {
      switch (name) {
        case "level":
          return message.level;
        case "logId":
          return message.logId;
        case "scope": {
          const scope2 = message.scope || logger.scope?.defaultLabel;
          return scope2 ? ` (${scope2})` : "";
        }
        case "text":
          return "";
        case "y":
          return date.getFullYear().toString(10);
        case "m":
          return (date.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return date.getDate().toString(10).padStart(2, "0");
        case "h":
          return date.getHours().toString(10).padStart(2, "0");
        case "i":
          return date.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return date.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return date.getMilliseconds().toString(10).padStart(3, "0");
        case "iso":
          return date.toISOString();
        default:
          return message.variables?.[name] || substring;
      }
    }).trim();
    return data;
  }
  return console_1$1;
}
var ipc$1;
var hasRequiredIpc$1;
function requireIpc$1() {
  if (hasRequiredIpc$1) return ipc$1;
  hasRequiredIpc$1 = 1;
  const { transform } = requireTransform();
  ipc$1 = ipcTransportRendererFactory;
  const RESTRICTED_TYPES = /* @__PURE__ */ new Set([Promise, WeakMap, WeakSet]);
  function ipcTransportRendererFactory(logger) {
    return Object.assign(transport, {
      depth: 5,
      transforms: [serializeFn]
    });
    function transport(message) {
      if (!window.__electronLog) {
        logger.processMessage(
          {
            data: ["electron-log: logger isn't initialized in the main process"],
            level: "error"
          },
          { transports: ["console"] }
        );
        return;
      }
      try {
        const serialized = transform({
          initialData: message,
          logger,
          message,
          transport
        });
        __electronLog.sendToMain(serialized);
      } catch (e) {
        logger.transports.console({
          data: ["electronLog.transports.ipc", e, "data:", message.data],
          level: "error"
        });
      }
    }
  }
  function isPrimitive(value) {
    return Object(value) !== value;
  }
  function serializeFn({
    data,
    depth,
    seen = /* @__PURE__ */ new WeakSet(),
    transport = {}
  } = {}) {
    const actualDepth = depth || transport.depth || 5;
    if (seen.has(data)) {
      return "[Circular]";
    }
    if (actualDepth < 1) {
      if (isPrimitive(data)) {
        return data;
      }
      if (Array.isArray(data)) {
        return "[Array]";
      }
      return `[${typeof data}]`;
    }
    if (["function", "symbol"].includes(typeof data)) {
      return data.toString();
    }
    if (isPrimitive(data)) {
      return data;
    }
    if (RESTRICTED_TYPES.has(data.constructor)) {
      return `[${data.constructor.name}]`;
    }
    if (Array.isArray(data)) {
      return data.map((item) => serializeFn({
        data: item,
        depth: actualDepth - 1,
        seen
      }));
    }
    if (data instanceof Date) {
      return data.toISOString();
    }
    if (data instanceof Error) {
      return data.stack;
    }
    if (data instanceof Map) {
      return new Map(
        Array.from(data).map(([key, value]) => [
          serializeFn({ data: key, depth: actualDepth - 1, seen }),
          serializeFn({ data: value, depth: actualDepth - 1, seen })
        ])
      );
    }
    if (data instanceof Set) {
      return new Set(
        Array.from(data).map(
          (val) => serializeFn({ data: val, depth: actualDepth - 1, seen })
        )
      );
    }
    seen.add(data);
    return Object.fromEntries(
      Object.entries(data).map(
        ([key, value]) => [
          key,
          serializeFn({ data: value, depth: actualDepth - 1, seen })
        ]
      )
    );
  }
  return ipc$1;
}
var hasRequiredRenderer;
function requireRenderer() {
  if (hasRequiredRenderer) return renderer.exports;
  hasRequiredRenderer = 1;
  (function(module) {
    const Logger = requireLogger();
    const RendererErrorHandler = requireRendererErrorHandler();
    const transportConsole = requireConsole$1();
    const transportIpc = requireIpc$1();
    if (typeof process === "object" && process.type === "browser") {
      console.warn(
        "electron-log/renderer is loaded in the main process. It could cause unexpected behaviour."
      );
    }
    module.exports = createLogger();
    module.exports.Logger = Logger;
    module.exports.default = module.exports;
    function createLogger() {
      const logger = new Logger({
        allowUnknownLevel: true,
        errorHandler: new RendererErrorHandler(),
        initializeFn: () => {
        },
        logId: "default",
        transportFactories: {
          console: transportConsole,
          ipc: transportIpc
        },
        variables: {
          processType: "renderer"
        }
      });
      logger.errorHandler.setOptions({
        logFn({ error: error2, errorName, showDialog }) {
          logger.transports.console({
            data: [errorName, error2].filter(Boolean),
            level: "error"
          });
          logger.transports.ipc({
            cmd: "errorHandler",
            error: {
              cause: error2?.cause,
              code: error2?.code,
              name: error2?.name,
              message: error2?.message,
              stack: error2?.stack
            },
            errorName,
            logId: logger.logId,
            showDialog
          });
        }
      });
      if (typeof window === "object") {
        window.addEventListener("message", (event) => {
          const { cmd, logId, ...message } = event.data || {};
          const instance = Logger.getInstance({ logId });
          if (cmd === "message") {
            instance.processMessage(message, { transports: ["console"] });
          }
        });
      }
      return new Proxy(logger, {
        get(target, prop) {
          if (typeof target[prop] !== "undefined") {
            return target[prop];
          }
          return (...data) => logger.logData(data, { level: prop });
        }
      });
    }
  })(renderer);
  return renderer.exports;
}
var packageJson;
var hasRequiredPackageJson;
function requirePackageJson() {
  if (hasRequiredPackageJson) return packageJson;
  hasRequiredPackageJson = 1;
  const fs2 = require$$1$1;
  const path2 = require$$1;
  packageJson = {
    findAndReadPackageJson,
    tryReadJsonAt
  };
  function findAndReadPackageJson() {
    return tryReadJsonAt(getMainModulePath()) || tryReadJsonAt(extractPathFromArgs()) || tryReadJsonAt(process.resourcesPath, "app.asar") || tryReadJsonAt(process.resourcesPath, "app") || tryReadJsonAt(process.cwd()) || { name: void 0, version: void 0 };
  }
  function tryReadJsonAt(...searchPaths) {
    if (!searchPaths[0]) {
      return void 0;
    }
    try {
      const searchPath = path2.join(...searchPaths);
      const fileName = findUp("package.json", searchPath);
      if (!fileName) {
        return void 0;
      }
      const json2 = JSON.parse(fs2.readFileSync(fileName, "utf8"));
      const name = json2?.productName || json2?.name;
      if (!name || name.toLowerCase() === "electron") {
        return void 0;
      }
      if (name) {
        return { name, version: json2?.version };
      }
      return void 0;
    } catch (e) {
      return void 0;
    }
  }
  function findUp(fileName, cwd2) {
    let currentPath = cwd2;
    while (true) {
      const parsedPath = path2.parse(currentPath);
      const root2 = parsedPath.root;
      const dir = parsedPath.dir;
      if (fs2.existsSync(path2.join(currentPath, fileName))) {
        return path2.resolve(path2.join(currentPath, fileName));
      }
      if (currentPath === root2) {
        return null;
      }
      currentPath = dir;
    }
  }
  function extractPathFromArgs() {
    const matchedArgs = process.argv.filter((arg) => {
      return arg.indexOf("--user-data-dir=") === 0;
    });
    if (matchedArgs.length === 0 || typeof matchedArgs[0] !== "string") {
      return null;
    }
    const userDataDir = matchedArgs[0];
    return userDataDir.replace("--user-data-dir=", "");
  }
  function getMainModulePath() {
    try {
      return require.main?.filename;
    } catch {
      return void 0;
    }
  }
  return packageJson;
}
var NodeExternalApi_1;
var hasRequiredNodeExternalApi;
function requireNodeExternalApi() {
  if (hasRequiredNodeExternalApi) return NodeExternalApi_1;
  hasRequiredNodeExternalApi = 1;
  const childProcess = require$$0$5;
  const os2 = require$$1$2;
  const path2 = require$$1;
  const packageJson2 = requirePackageJson();
  class NodeExternalApi {
    appName = void 0;
    appPackageJson = void 0;
    platform = process.platform;
    getAppLogPath(appName = this.getAppName()) {
      if (this.platform === "darwin") {
        return path2.join(this.getSystemPathHome(), "Library/Logs", appName);
      }
      return path2.join(this.getAppUserDataPath(appName), "logs");
    }
    getAppName() {
      const appName = this.appName || this.getAppPackageJson()?.name;
      if (!appName) {
        throw new Error(
          "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
        );
      }
      return appName;
    }
    /**
     * @private
     * @returns {undefined}
     */
    getAppPackageJson() {
      if (typeof this.appPackageJson !== "object") {
        this.appPackageJson = packageJson2.findAndReadPackageJson();
      }
      return this.appPackageJson;
    }
    getAppUserDataPath(appName = this.getAppName()) {
      return appName ? path2.join(this.getSystemPathAppData(), appName) : void 0;
    }
    getAppVersion() {
      return this.getAppPackageJson()?.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const release = Number(os2.release().split(".")[0]);
      if (release <= 19) {
        return `10.${release - 4}`;
      }
      return release - 9;
    }
    /**
     * @protected
     * @returns {string}
     */
    getOsVersion() {
      let osName = os2.type().replace("_", " ");
      let osVersion = os2.release();
      if (osName === "Darwin") {
        osName = "macOS";
        osVersion = this.getMacOsVersion();
      }
      return `${osName} ${osVersion}`;
    }
    /**
     * @return {PathVariables}
     */
    getPathVariables() {
      const appName = this.getAppName();
      const appVersion = this.getAppVersion();
      const self2 = this;
      return {
        appData: this.getSystemPathAppData(),
        appName,
        appVersion,
        get electronDefaultDir() {
          return self2.getElectronLogPath();
        },
        home: this.getSystemPathHome(),
        libraryDefaultDir: this.getAppLogPath(appName),
        libraryTemplate: this.getAppLogPath("{appName}"),
        temp: this.getSystemPathTemp(),
        userData: this.getAppUserDataPath(appName)
      };
    }
    getSystemPathAppData() {
      const home = this.getSystemPathHome();
      switch (this.platform) {
        case "darwin": {
          return path2.join(home, "Library/Application Support");
        }
        case "win32": {
          return process.env.APPDATA || path2.join(home, "AppData/Roaming");
        }
        default: {
          return process.env.XDG_CONFIG_HOME || path2.join(home, ".config");
        }
      }
    }
    getSystemPathHome() {
      return os2.homedir?.() || process.env.HOME;
    }
    getSystemPathTemp() {
      return os2.tmpdir();
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: void 0,
        os: this.getOsVersion()
      };
    }
    isDev() {
      return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
    }
    isElectron() {
      return Boolean(process.versions.electron);
    }
    onAppEvent(_eventName, _handler) {
    }
    onAppReady(handler) {
      handler();
    }
    onEveryWebContentsEvent(eventName, handler) {
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(channel, listener) {
    }
    onIpcInvoke(channel, listener) {
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(url, logFunction = console.error) {
      const startMap = { darwin: "open", win32: "start", linux: "xdg-open" };
      const start = startMap[process.platform] || "xdg-open";
      childProcess.exec(`${start} ${url}`, {}, (err) => {
        if (err) {
          logFunction(err);
        }
      });
    }
    setAppName(appName) {
      this.appName = appName;
    }
    setPlatform(platform2) {
      this.platform = platform2;
    }
    setPreloadFileForSessions({
      filePath,
      // eslint-disable-line no-unused-vars
      includeFutureSession = true,
      // eslint-disable-line no-unused-vars
      getSessions = () => []
      // eslint-disable-line no-unused-vars
    }) {
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(channel, message) {
    }
    showErrorBox(title, message) {
    }
  }
  NodeExternalApi_1 = NodeExternalApi;
  return NodeExternalApi_1;
}
var ElectronExternalApi_1;
var hasRequiredElectronExternalApi;
function requireElectronExternalApi() {
  if (hasRequiredElectronExternalApi) return ElectronExternalApi_1;
  hasRequiredElectronExternalApi = 1;
  const path2 = require$$1;
  const NodeExternalApi = requireNodeExternalApi();
  class ElectronExternalApi extends NodeExternalApi {
    /**
     * @type {typeof Electron}
     */
    electron = void 0;
    /**
     * @param {object} options
     * @param {typeof Electron} [options.electron]
     */
    constructor({ electron } = {}) {
      super();
      this.electron = electron;
    }
    getAppName() {
      let appName;
      try {
        appName = this.appName || this.electron.app?.name || this.electron.app?.getName();
      } catch {
      }
      return appName || super.getAppName();
    }
    getAppUserDataPath(appName) {
      return this.getPath("userData") || super.getAppUserDataPath(appName);
    }
    getAppVersion() {
      let appVersion;
      try {
        appVersion = this.electron.app?.getVersion();
      } catch {
      }
      return appVersion || super.getAppVersion();
    }
    getElectronLogPath() {
      return this.getPath("logs") || super.getElectronLogPath();
    }
    /**
     * @private
     * @param {any} name
     * @returns {string|undefined}
     */
    getPath(name) {
      try {
        return this.electron.app?.getPath(name);
      } catch {
        return void 0;
      }
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: `Electron ${process.versions.electron}`,
        os: this.getOsVersion()
      };
    }
    getSystemPathAppData() {
      return this.getPath("appData") || super.getSystemPathAppData();
    }
    isDev() {
      if (this.electron.app?.isPackaged !== void 0) {
        return !this.electron.app.isPackaged;
      }
      if (typeof process.execPath === "string") {
        const execFileName = path2.basename(process.execPath).toLowerCase();
        return execFileName.startsWith("electron");
      }
      return super.isDev();
    }
    onAppEvent(eventName, handler) {
      this.electron.app?.on(eventName, handler);
      return () => {
        this.electron.app?.off(eventName, handler);
      };
    }
    onAppReady(handler) {
      if (this.electron.app?.isReady()) {
        handler();
      } else if (this.electron.app?.once) {
        this.electron.app?.once("ready", handler);
      } else {
        handler();
      }
    }
    onEveryWebContentsEvent(eventName, handler) {
      this.electron.webContents?.getAllWebContents()?.forEach((webContents) => {
        webContents.on(eventName, handler);
      });
      this.electron.app?.on("web-contents-created", onWebContentsCreated);
      return () => {
        this.electron.webContents?.getAllWebContents().forEach((webContents) => {
          webContents.off(eventName, handler);
        });
        this.electron.app?.off("web-contents-created", onWebContentsCreated);
      };
      function onWebContentsCreated(_, webContents) {
        webContents.on(eventName, handler);
      }
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(channel, listener) {
      this.electron.ipcMain?.on(channel, listener);
    }
    onIpcInvoke(channel, listener) {
      this.electron.ipcMain?.handle?.(channel, listener);
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(url, logFunction = console.error) {
      this.electron.shell?.openExternal(url).catch(logFunction);
    }
    setPreloadFileForSessions({
      filePath,
      includeFutureSession = true,
      getSessions = () => [this.electron.session?.defaultSession]
    }) {
      for (const session of getSessions().filter(Boolean)) {
        setPreload(session);
      }
      if (includeFutureSession) {
        this.onAppEvent("session-created", (session) => {
          setPreload(session);
        });
      }
      function setPreload(session) {
        if (typeof session.registerPreloadScript === "function") {
          session.registerPreloadScript({
            filePath,
            id: "electron-log-preload",
            type: "frame"
          });
        } else {
          session.setPreloads([...session.getPreloads(), filePath]);
        }
      }
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(channel, message) {
      this.electron.BrowserWindow?.getAllWindows()?.forEach((wnd) => {
        if (wnd.webContents?.isDestroyed() === false && wnd.webContents?.isCrashed() === false) {
          wnd.webContents.send(channel, message);
        }
      });
    }
    showErrorBox(title, message) {
      this.electron.dialog?.showErrorBox(title, message);
    }
  }
  ElectronExternalApi_1 = ElectronExternalApi;
  return ElectronExternalApi_1;
}
var initialize;
var hasRequiredInitialize;
function requireInitialize() {
  if (hasRequiredInitialize) return initialize;
  hasRequiredInitialize = 1;
  const fs2 = require$$1$1;
  const os2 = require$$1$2;
  const path2 = require$$1;
  const preloadInitializeFn = requireElectronLogPreload();
  let preloadInitialized = false;
  let spyConsoleInitialized = false;
  initialize = {
    initialize({
      externalApi,
      getSessions,
      includeFutureSession,
      logger,
      preload = true,
      spyRendererConsole = false
    }) {
      externalApi.onAppReady(() => {
        try {
          if (preload) {
            initializePreload({
              externalApi,
              getSessions,
              includeFutureSession,
              logger,
              preloadOption: preload
            });
          }
          if (spyRendererConsole) {
            initializeSpyRendererConsole({ externalApi, logger });
          }
        } catch (err) {
          logger.warn(err);
        }
      });
    }
  };
  function initializePreload({
    externalApi,
    getSessions,
    includeFutureSession,
    logger,
    preloadOption
  }) {
    let preloadPath = typeof preloadOption === "string" ? preloadOption : void 0;
    if (preloadInitialized) {
      logger.warn(new Error("log.initialize({ preload }) already called").stack);
      return;
    }
    preloadInitialized = true;
    try {
      preloadPath = path2.resolve(
        __dirname,
        "../renderer/electron-log-preload.js"
      );
    } catch {
    }
    if (!preloadPath || !fs2.existsSync(preloadPath)) {
      preloadPath = path2.join(
        externalApi.getAppUserDataPath() || os2.tmpdir(),
        "electron-log-preload.js"
      );
      const preloadCode = `
      try {
        (${preloadInitializeFn.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
      fs2.writeFileSync(preloadPath, preloadCode, "utf8");
    }
    externalApi.setPreloadFileForSessions({
      filePath: preloadPath,
      includeFutureSession,
      getSessions
    });
  }
  function initializeSpyRendererConsole({ externalApi, logger }) {
    if (spyConsoleInitialized) {
      logger.warn(
        new Error("log.initialize({ spyRendererConsole }) already called").stack
      );
      return;
    }
    spyConsoleInitialized = true;
    const levels = ["debug", "info", "warn", "error"];
    externalApi.onEveryWebContentsEvent(
      "console-message",
      (event, level, message) => {
        logger.processMessage({
          data: [message],
          level: levels[level],
          variables: { processType: "renderer" }
        });
      }
    );
  }
  return initialize;
}
var ErrorHandler_1;
var hasRequiredErrorHandler;
function requireErrorHandler() {
  if (hasRequiredErrorHandler) return ErrorHandler_1;
  hasRequiredErrorHandler = 1;
  class ErrorHandler {
    externalApi = void 0;
    isActive = false;
    logFn = void 0;
    onError = void 0;
    showDialog = true;
    constructor({
      externalApi,
      logFn = void 0,
      onError = void 0,
      showDialog = void 0
    } = {}) {
      this.createIssue = this.createIssue.bind(this);
      this.handleError = this.handleError.bind(this);
      this.handleRejection = this.handleRejection.bind(this);
      this.setOptions({ externalApi, logFn, onError, showDialog });
      this.startCatching = this.startCatching.bind(this);
      this.stopCatching = this.stopCatching.bind(this);
    }
    handle(error2, {
      logFn = this.logFn,
      onError = this.onError,
      processType = "browser",
      showDialog = this.showDialog,
      errorName = ""
    } = {}) {
      error2 = normalizeError(error2);
      try {
        if (typeof onError === "function") {
          const versions = this.externalApi?.getVersions() || {};
          const createIssue = this.createIssue;
          const result = onError({
            createIssue,
            error: error2,
            errorName,
            processType,
            versions
          });
          if (result === false) {
            return;
          }
        }
        errorName ? logFn(errorName, error2) : logFn(error2);
        if (showDialog && !errorName.includes("rejection") && this.externalApi) {
          this.externalApi.showErrorBox(
            `A JavaScript error occurred in the ${processType} process`,
            error2.stack
          );
        }
      } catch {
        console.error(error2);
      }
    }
    setOptions({ externalApi, logFn, onError, showDialog }) {
      if (typeof externalApi === "object") {
        this.externalApi = externalApi;
      }
      if (typeof logFn === "function") {
        this.logFn = logFn;
      }
      if (typeof onError === "function") {
        this.onError = onError;
      }
      if (typeof showDialog === "boolean") {
        this.showDialog = showDialog;
      }
    }
    startCatching({ onError, showDialog } = {}) {
      if (this.isActive) {
        return;
      }
      this.isActive = true;
      this.setOptions({ onError, showDialog });
      process.on("uncaughtException", this.handleError);
      process.on("unhandledRejection", this.handleRejection);
    }
    stopCatching() {
      this.isActive = false;
      process.removeListener("uncaughtException", this.handleError);
      process.removeListener("unhandledRejection", this.handleRejection);
    }
    createIssue(pageUrl, queryParams) {
      this.externalApi?.openUrl(
        `${pageUrl}?${new URLSearchParams(queryParams).toString()}`
      );
    }
    handleError(error2) {
      this.handle(error2, { errorName: "Unhandled" });
    }
    handleRejection(reason) {
      const error2 = reason instanceof Error ? reason : new Error(JSON.stringify(reason));
      this.handle(error2, { errorName: "Unhandled rejection" });
    }
  }
  function normalizeError(e) {
    if (e instanceof Error) {
      return e;
    }
    if (e && typeof e === "object") {
      if (e.message) {
        return Object.assign(new Error(e.message), e);
      }
      try {
        return new Error(JSON.stringify(e));
      } catch (serErr) {
        return new Error(`Couldn't normalize error ${String(e)}: ${serErr}`);
      }
    }
    return new Error(`Can't normalize error ${String(e)}`);
  }
  ErrorHandler_1 = ErrorHandler;
  return ErrorHandler_1;
}
var EventLogger_1;
var hasRequiredEventLogger;
function requireEventLogger() {
  if (hasRequiredEventLogger) return EventLogger_1;
  hasRequiredEventLogger = 1;
  class EventLogger {
    disposers = [];
    format = "{eventSource}#{eventName}:";
    formatters = {
      app: {
        "certificate-error": ({ args }) => {
          return this.arrayToObject(args.slice(1, 4), [
            "url",
            "error",
            "certificate"
          ]);
        },
        "child-process-gone": ({ args }) => {
          return args.length === 1 ? args[0] : args;
        },
        "render-process-gone": ({ args: [webContents, details] }) => {
          return details && typeof details === "object" ? { ...details, ...this.getWebContentsDetails(webContents) } : [];
        }
      },
      webContents: {
        "console-message": ({ args: [level, message, line, sourceId] }) => {
          if (level < 3) {
            return void 0;
          }
          return { message, source: `${sourceId}:${line}` };
        },
        "did-fail-load": ({ args }) => {
          return this.arrayToObject(args, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]);
        },
        "did-fail-provisional-load": ({ args }) => {
          return this.arrayToObject(args, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]);
        },
        "plugin-crashed": ({ args }) => {
          return this.arrayToObject(args, ["name", "version"]);
        },
        "preload-error": ({ args }) => {
          return this.arrayToObject(args, ["preloadPath", "error"]);
        }
      }
    };
    events = {
      app: {
        "certificate-error": true,
        "child-process-gone": true,
        "render-process-gone": true
      },
      webContents: {
        // 'console-message': true,
        "did-fail-load": true,
        "did-fail-provisional-load": true,
        "plugin-crashed": true,
        "preload-error": true,
        "unresponsive": true
      }
    };
    externalApi = void 0;
    level = "error";
    scope = "";
    constructor(options2 = {}) {
      this.setOptions(options2);
    }
    setOptions({
      events,
      externalApi,
      level,
      logger,
      format: format2,
      formatters,
      scope: scope2
    }) {
      if (typeof events === "object") {
        this.events = events;
      }
      if (typeof externalApi === "object") {
        this.externalApi = externalApi;
      }
      if (typeof level === "string") {
        this.level = level;
      }
      if (typeof logger === "object") {
        this.logger = logger;
      }
      if (typeof format2 === "string" || typeof format2 === "function") {
        this.format = format2;
      }
      if (typeof formatters === "object") {
        this.formatters = formatters;
      }
      if (typeof scope2 === "string") {
        this.scope = scope2;
      }
    }
    startLogging(options2 = {}) {
      this.setOptions(options2);
      this.disposeListeners();
      for (const eventName of this.getEventNames(this.events.app)) {
        this.disposers.push(
          this.externalApi.onAppEvent(eventName, (...handlerArgs) => {
            this.handleEvent({ eventSource: "app", eventName, handlerArgs });
          })
        );
      }
      for (const eventName of this.getEventNames(this.events.webContents)) {
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(
            eventName,
            (...handlerArgs) => {
              this.handleEvent(
                { eventSource: "webContents", eventName, handlerArgs }
              );
            }
          )
        );
      }
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(array, fieldNames) {
      const obj = {};
      fieldNames.forEach((fieldName, index) => {
        obj[fieldName] = array[index];
      });
      if (array.length > fieldNames.length) {
        obj.unknownArgs = array.slice(fieldNames.length);
      }
      return obj;
    }
    disposeListeners() {
      this.disposers.forEach((disposer) => disposer());
      this.disposers = [];
    }
    formatEventLog({ eventName, eventSource, handlerArgs }) {
      const [event, ...args] = handlerArgs;
      if (typeof this.format === "function") {
        return this.format({ args, event, eventName, eventSource });
      }
      const formatter = this.formatters[eventSource]?.[eventName];
      let formattedArgs = args;
      if (typeof formatter === "function") {
        formattedArgs = formatter({ args, event, eventName, eventSource });
      }
      if (!formattedArgs) {
        return void 0;
      }
      const eventData = {};
      if (Array.isArray(formattedArgs)) {
        eventData.args = formattedArgs;
      } else if (typeof formattedArgs === "object") {
        Object.assign(eventData, formattedArgs);
      }
      if (eventSource === "webContents") {
        Object.assign(eventData, this.getWebContentsDetails(event?.sender));
      }
      const title = this.format.replace("{eventSource}", eventSource === "app" ? "App" : "WebContents").replace("{eventName}", eventName);
      return [title, eventData];
    }
    getEventNames(eventMap) {
      if (!eventMap || typeof eventMap !== "object") {
        return [];
      }
      return Object.entries(eventMap).filter(([_, listen]) => listen).map(([eventName]) => eventName);
    }
    getWebContentsDetails(webContents) {
      if (!webContents?.loadURL) {
        return {};
      }
      try {
        return {
          webContents: {
            id: webContents.id,
            url: webContents.getURL()
          }
        };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName, eventSource, handlerArgs }) {
      const log2 = this.formatEventLog({ eventName, eventSource, handlerArgs });
      if (log2) {
        const logFns = this.scope ? this.logger.scope(this.scope) : this.logger;
        logFns?.[this.level]?.(...log2);
      }
    }
  }
  EventLogger_1 = EventLogger;
  return EventLogger_1;
}
var format;
var hasRequiredFormat;
function requireFormat() {
  if (hasRequiredFormat) return format;
  hasRequiredFormat = 1;
  const { transform } = requireTransform();
  format = {
    concatFirstStringElements,
    formatScope,
    formatText,
    formatVariables,
    timeZoneFromOffset,
    format({ message, logger, transport, data = message?.data }) {
      switch (typeof transport.format) {
        case "string": {
          return transform({
            message,
            logger,
            transforms: [formatVariables, formatScope, formatText],
            transport,
            initialData: [transport.format, ...data]
          });
        }
        case "function": {
          return transport.format({
            data,
            level: message?.level || "info",
            logger,
            message,
            transport
          });
        }
        default: {
          return data;
        }
      }
    }
  };
  function concatFirstStringElements({ data }) {
    if (typeof data[0] !== "string" || typeof data[1] !== "string") {
      return data;
    }
    if (data[0].match(/%[1cdfiOos]/)) {
      return data;
    }
    return [`${data[0]} ${data[1]}`, ...data.slice(2)];
  }
  function timeZoneFromOffset(minutesOffset) {
    const minutesPositive = Math.abs(minutesOffset);
    const sign2 = minutesOffset > 0 ? "-" : "+";
    const hours = Math.floor(minutesPositive / 60).toString().padStart(2, "0");
    const minutes = (minutesPositive % 60).toString().padStart(2, "0");
    return `${sign2}${hours}:${minutes}`;
  }
  function formatScope({ data, logger, message }) {
    const { defaultLabel, labelLength } = logger?.scope || {};
    const template = data[0];
    let label = message.scope;
    if (!label) {
      label = defaultLabel;
    }
    let scopeText;
    if (label === "") {
      scopeText = labelLength > 0 ? "".padEnd(labelLength + 3) : "";
    } else if (typeof label === "string") {
      scopeText = ` (${label})`.padEnd(labelLength + 3);
    } else {
      scopeText = "";
    }
    data[0] = template.replace("{scope}", scopeText);
    return data;
  }
  function formatVariables({ data, message }) {
    let template = data[0];
    if (typeof template !== "string") {
      return data;
    }
    template = template.replace("{level}]", `${message.level}]`.padEnd(6, " "));
    const date = message.date || /* @__PURE__ */ new Date();
    data[0] = template.replace(/\{(\w+)}/g, (substring, name) => {
      switch (name) {
        case "level":
          return message.level || "info";
        case "logId":
          return message.logId;
        case "y":
          return date.getFullYear().toString(10);
        case "m":
          return (date.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return date.getDate().toString(10).padStart(2, "0");
        case "h":
          return date.getHours().toString(10).padStart(2, "0");
        case "i":
          return date.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return date.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return date.getMilliseconds().toString(10).padStart(3, "0");
        case "z":
          return timeZoneFromOffset(date.getTimezoneOffset());
        case "iso":
          return date.toISOString();
        default: {
          return message.variables?.[name] || substring;
        }
      }
    }).trim();
    return data;
  }
  function formatText({ data }) {
    const template = data[0];
    if (typeof template !== "string") {
      return data;
    }
    const textTplPosition = template.lastIndexOf("{text}");
    if (textTplPosition === template.length - 6) {
      data[0] = template.replace(/\s?{text}/, "");
      if (data[0] === "") {
        data.shift();
      }
      return data;
    }
    const templatePieces = template.split("{text}");
    let result = [];
    if (templatePieces[0] !== "") {
      result.push(templatePieces[0]);
    }
    result = result.concat(data.slice(1));
    if (templatePieces[1] !== "") {
      result.push(templatePieces[1]);
    }
    return result;
  }
  return format;
}
var object = { exports: {} };
var hasRequiredObject;
function requireObject() {
  if (hasRequiredObject) return object.exports;
  hasRequiredObject = 1;
  (function(module) {
    const util2 = require$$1$5;
    module.exports = {
      serialize,
      maxDepth({ data, transport, depth = transport?.depth ?? 6 }) {
        if (!data) {
          return data;
        }
        if (depth < 1) {
          if (Array.isArray(data)) return "[array]";
          if (typeof data === "object" && data) return "[object]";
          return data;
        }
        if (Array.isArray(data)) {
          return data.map((child) => module.exports.maxDepth({
            data: child,
            depth: depth - 1
          }));
        }
        if (typeof data !== "object") {
          return data;
        }
        if (data && typeof data.toISOString === "function") {
          return data;
        }
        if (data === null) {
          return null;
        }
        if (data instanceof Error) {
          return data;
        }
        const newJson = {};
        for (const i2 in data) {
          if (!Object.prototype.hasOwnProperty.call(data, i2)) continue;
          newJson[i2] = module.exports.maxDepth({
            data: data[i2],
            depth: depth - 1
          });
        }
        return newJson;
      },
      toJSON({ data }) {
        return JSON.parse(JSON.stringify(data, createSerializer()));
      },
      toString({ data, transport }) {
        const inspectOptions = transport?.inspectOptions || {};
        const simplifiedData = data.map((item) => {
          if (item === void 0) {
            return void 0;
          }
          try {
            const str2 = JSON.stringify(item, createSerializer(), "  ");
            return str2 === void 0 ? void 0 : JSON.parse(str2);
          } catch (e) {
            return item;
          }
        });
        return util2.formatWithOptions(inspectOptions, ...simplifiedData);
      }
    };
    function createSerializer(options2 = {}) {
      const seen = /* @__PURE__ */ new WeakSet();
      return function(key, value) {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return void 0;
          }
          seen.add(value);
        }
        return serialize(key, value, options2);
      };
    }
    function serialize(key, value, options2 = {}) {
      const serializeMapAndSet = options2?.serializeMapAndSet !== false;
      if (value instanceof Error) {
        return value.stack;
      }
      if (!value) {
        return value;
      }
      if (typeof value === "function") {
        return `[function] ${value.toString()}`;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (serializeMapAndSet && value instanceof Map && Object.fromEntries) {
        return Object.fromEntries(value);
      }
      if (serializeMapAndSet && value instanceof Set && Array.from) {
        return Array.from(value);
      }
      return value;
    }
  })(object);
  return object.exports;
}
var style;
var hasRequiredStyle;
function requireStyle() {
  if (hasRequiredStyle) return style;
  hasRequiredStyle = 1;
  style = {
    transformStyles,
    applyAnsiStyles({ data }) {
      return transformStyles(data, styleToAnsi, resetAnsiStyle);
    },
    removeStyles({ data }) {
      return transformStyles(data, () => "");
    }
  };
  const ANSI_COLORS = {
    unset: "\x1B[0m",
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m",
    gray: "\x1B[90m"
  };
  function styleToAnsi(style2) {
    const color = style2.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return ANSI_COLORS[color] || "";
  }
  function resetAnsiStyle(string) {
    return string + ANSI_COLORS.unset;
  }
  function transformStyles(data, onStyleFound, onStyleApplied) {
    const foundStyles = {};
    return data.reduce((result, item, index, array) => {
      if (foundStyles[index]) {
        return result;
      }
      if (typeof item === "string") {
        let valueIndex = index;
        let styleApplied = false;
        item = item.replace(/%[1cdfiOos]/g, (match) => {
          valueIndex += 1;
          if (match !== "%c") {
            return match;
          }
          const style2 = array[valueIndex];
          if (typeof style2 === "string") {
            foundStyles[valueIndex] = true;
            styleApplied = true;
            return onStyleFound(style2, item);
          }
          return match;
        });
        if (styleApplied && onStyleApplied) {
          item = onStyleApplied(item);
        }
      }
      result.push(item);
      return result;
    }, []);
  }
  return style;
}
var console_1;
var hasRequiredConsole;
function requireConsole() {
  if (hasRequiredConsole) return console_1;
  hasRequiredConsole = 1;
  const {
    concatFirstStringElements,
    format: format2
  } = requireFormat();
  const { maxDepth, toJSON } = requireObject();
  const {
    applyAnsiStyles,
    removeStyles
  } = requireStyle();
  const { transform } = requireTransform();
  const consoleMethods = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  console_1 = consoleTransportFactory;
  const separator = process.platform === "win32" ? ">" : "›";
  const DEFAULT_FORMAT = `%c{h}:{i}:{s}.{ms}{scope}%c ${separator} {text}`;
  Object.assign(consoleTransportFactory, {
    DEFAULT_FORMAT
  });
  function consoleTransportFactory(logger) {
    return Object.assign(transport, {
      colorMap: {
        error: "red",
        warn: "yellow",
        info: "cyan",
        verbose: "unset",
        debug: "gray",
        silly: "gray",
        default: "unset"
      },
      format: DEFAULT_FORMAT,
      level: "silly",
      transforms: [
        addTemplateColors,
        format2,
        formatStyles,
        concatFirstStringElements,
        maxDepth,
        toJSON
      ],
      useStyles: process.env.FORCE_STYLES,
      writeFn({ message }) {
        const consoleLogFn = consoleMethods[message.level] || consoleMethods.info;
        consoleLogFn(...message.data);
      }
    });
    function transport(message) {
      const data = transform({ logger, message, transport });
      transport.writeFn({
        message: { ...message, data }
      });
    }
  }
  function addTemplateColors({ data, message, transport }) {
    if (typeof transport.format !== "string" || !transport.format.includes("%c")) {
      return data;
    }
    return [
      `color:${levelToStyle(message.level, transport)}`,
      "color:unset",
      ...data
    ];
  }
  function canUseStyles(useStyleValue, level) {
    if (typeof useStyleValue === "boolean") {
      return useStyleValue;
    }
    const useStderr = level === "error" || level === "warn";
    const stream2 = useStderr ? process.stderr : process.stdout;
    return stream2 && stream2.isTTY;
  }
  function formatStyles(args) {
    const { message, transport } = args;
    const useStyles = canUseStyles(transport.useStyles, message.level);
    const nextTransform = useStyles ? applyAnsiStyles : removeStyles;
    return nextTransform(args);
  }
  function levelToStyle(level, transport) {
    return transport.colorMap[level] || transport.colorMap.default;
  }
  return console_1;
}
var File_1;
var hasRequiredFile$1;
function requireFile$1() {
  if (hasRequiredFile$1) return File_1;
  hasRequiredFile$1 = 1;
  const EventEmitter = require$$0$4;
  const fs2 = require$$1$1;
  const os2 = require$$1$2;
  class File extends EventEmitter {
    asyncWriteQueue = [];
    bytesWritten = 0;
    hasActiveAsyncWriting = false;
    path = null;
    initialSize = void 0;
    writeOptions = null;
    writeAsync = false;
    constructor({
      path: path2,
      writeOptions = { encoding: "utf8", flag: "a", mode: 438 },
      writeAsync = false
    }) {
      super();
      this.path = path2;
      this.writeOptions = writeOptions;
      this.writeAsync = writeAsync;
    }
    get size() {
      return this.getSize();
    }
    clear() {
      try {
        fs2.writeFileSync(this.path, "", {
          mode: this.writeOptions.mode,
          flag: "w"
        });
        this.reset();
        return true;
      } catch (e) {
        if (e.code === "ENOENT") {
          return true;
        }
        this.emit("error", e, this);
        return false;
      }
    }
    crop(bytesAfter) {
      try {
        const content = readFileSyncFromEnd(this.path, bytesAfter || 4096);
        this.clear();
        this.writeLine(`[log cropped]${os2.EOL}${content}`);
      } catch (e) {
        this.emit(
          "error",
          new Error(`Couldn't crop file ${this.path}. ${e.message}`),
          this
        );
      }
    }
    getSize() {
      if (this.initialSize === void 0) {
        try {
          const stats = fs2.statSync(this.path);
          this.initialSize = stats.size;
        } catch (e) {
          this.initialSize = 0;
        }
      }
      return this.initialSize + this.bytesWritten;
    }
    increaseBytesWrittenCounter(text) {
      this.bytesWritten += Buffer.byteLength(text, this.writeOptions.encoding);
    }
    isNull() {
      return false;
    }
    nextAsyncWrite() {
      const file2 = this;
      if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0) {
        return;
      }
      const text = this.asyncWriteQueue.join("");
      this.asyncWriteQueue = [];
      this.hasActiveAsyncWriting = true;
      fs2.writeFile(this.path, text, this.writeOptions, (e) => {
        file2.hasActiveAsyncWriting = false;
        if (e) {
          file2.emit(
            "error",
            new Error(`Couldn't write to ${file2.path}. ${e.message}`),
            this
          );
        } else {
          file2.increaseBytesWrittenCounter(text);
        }
        file2.nextAsyncWrite();
      });
    }
    reset() {
      this.initialSize = void 0;
      this.bytesWritten = 0;
    }
    toString() {
      return this.path;
    }
    writeLine(text) {
      text += os2.EOL;
      if (this.writeAsync) {
        this.asyncWriteQueue.push(text);
        this.nextAsyncWrite();
        return;
      }
      try {
        fs2.writeFileSync(this.path, text, this.writeOptions);
        this.increaseBytesWrittenCounter(text);
      } catch (e) {
        this.emit(
          "error",
          new Error(`Couldn't write to ${this.path}. ${e.message}`),
          this
        );
      }
    }
  }
  File_1 = File;
  function readFileSyncFromEnd(filePath, bytesCount) {
    const buffer = Buffer.alloc(bytesCount);
    const stats = fs2.statSync(filePath);
    const readLength = Math.min(stats.size, bytesCount);
    const offset = Math.max(0, stats.size - bytesCount);
    const fd = fs2.openSync(filePath, "r");
    const totalBytes = fs2.readSync(fd, buffer, 0, readLength, offset);
    fs2.closeSync(fd);
    return buffer.toString("utf8", 0, totalBytes);
  }
  return File_1;
}
var NullFile_1;
var hasRequiredNullFile;
function requireNullFile() {
  if (hasRequiredNullFile) return NullFile_1;
  hasRequiredNullFile = 1;
  const File = requireFile$1();
  class NullFile extends File {
    clear() {
    }
    crop() {
    }
    getSize() {
      return 0;
    }
    isNull() {
      return true;
    }
    writeLine() {
    }
  }
  NullFile_1 = NullFile;
  return NullFile_1;
}
var FileRegistry_1;
var hasRequiredFileRegistry;
function requireFileRegistry() {
  if (hasRequiredFileRegistry) return FileRegistry_1;
  hasRequiredFileRegistry = 1;
  const EventEmitter = require$$0$4;
  const fs2 = require$$1$1;
  const path2 = require$$1;
  const File = requireFile$1();
  const NullFile = requireNullFile();
  class FileRegistry extends EventEmitter {
    store = {};
    constructor() {
      super();
      this.emitError = this.emitError.bind(this);
    }
    /**
     * Provide a File object corresponding to the filePath
     * @param {string} filePath
     * @param {WriteOptions} [writeOptions]
     * @param {boolean} [writeAsync]
     * @return {File}
     */
    provide({ filePath, writeOptions = {}, writeAsync = false }) {
      let file2;
      try {
        filePath = path2.resolve(filePath);
        if (this.store[filePath]) {
          return this.store[filePath];
        }
        file2 = this.createFile({ filePath, writeOptions, writeAsync });
      } catch (e) {
        file2 = new NullFile({ path: filePath });
        this.emitError(e, file2);
      }
      file2.on("error", this.emitError);
      this.store[filePath] = file2;
      return file2;
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @param {boolean} async
     * @return {File}
     * @private
     */
    createFile({ filePath, writeOptions, writeAsync }) {
      this.testFileWriting({ filePath, writeOptions });
      return new File({ path: filePath, writeOptions, writeAsync });
    }
    /**
     * @param {Error} error
     * @param {File} file
     * @private
     */
    emitError(error2, file2) {
      this.emit("error", error2, file2);
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @private
     */
    testFileWriting({ filePath, writeOptions }) {
      fs2.mkdirSync(path2.dirname(filePath), { recursive: true });
      fs2.writeFileSync(filePath, "", { flag: "a", mode: writeOptions.mode });
    }
  }
  FileRegistry_1 = FileRegistry;
  return FileRegistry_1;
}
var file$1;
var hasRequiredFile;
function requireFile() {
  if (hasRequiredFile) return file$1;
  hasRequiredFile = 1;
  const fs2 = require$$1$1;
  const os2 = require$$1$2;
  const path2 = require$$1;
  const FileRegistry = requireFileRegistry();
  const { transform } = requireTransform();
  const { removeStyles } = requireStyle();
  const {
    format: format2,
    concatFirstStringElements
  } = requireFormat();
  const { toString: toString3 } = requireObject();
  file$1 = fileTransportFactory;
  const globalRegistry = new FileRegistry();
  function fileTransportFactory(logger, { registry = globalRegistry, externalApi } = {}) {
    let pathVariables;
    if (registry.listenerCount("error") < 1) {
      registry.on("error", (e, file2) => {
        logConsole(`Can't write to ${file2}`, e);
      });
    }
    return Object.assign(transport, {
      fileName: getDefaultFileName(logger.variables.processType),
      format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
      getFile,
      inspectOptions: { depth: 5 },
      level: "silly",
      maxSize: 1024 ** 2,
      readAllLogs,
      sync: true,
      transforms: [removeStyles, format2, concatFirstStringElements, toString3],
      writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
      archiveLogFn(file2) {
        const oldPath = file2.toString();
        const inf = path2.parse(oldPath);
        try {
          fs2.renameSync(oldPath, path2.join(inf.dir, `${inf.name}.old${inf.ext}`));
        } catch (e) {
          logConsole("Could not rotate log", e);
          const quarterOfMaxSize = Math.round(transport.maxSize / 4);
          file2.crop(Math.min(quarterOfMaxSize, 256 * 1024));
        }
      },
      resolvePathFn(vars) {
        return path2.join(vars.libraryDefaultDir, vars.fileName);
      },
      setAppName(name) {
        logger.dependencies.externalApi.setAppName(name);
      }
    });
    function transport(message) {
      const file2 = getFile(message);
      const needLogRotation = transport.maxSize > 0 && file2.size > transport.maxSize;
      if (needLogRotation) {
        transport.archiveLogFn(file2);
        file2.reset();
      }
      const content = transform({ logger, message, transport });
      file2.writeLine(content);
    }
    function initializeOnFirstAccess() {
      if (pathVariables) {
        return;
      }
      pathVariables = Object.create(
        Object.prototype,
        {
          ...Object.getOwnPropertyDescriptors(
            externalApi.getPathVariables()
          ),
          fileName: {
            get() {
              return transport.fileName;
            },
            enumerable: true
          }
        }
      );
      if (typeof transport.archiveLog === "function") {
        transport.archiveLogFn = transport.archiveLog;
        logConsole("archiveLog is deprecated. Use archiveLogFn instead");
      }
      if (typeof transport.resolvePath === "function") {
        transport.resolvePathFn = transport.resolvePath;
        logConsole("resolvePath is deprecated. Use resolvePathFn instead");
      }
    }
    function logConsole(message, error2 = null, level = "error") {
      const data = [`electron-log.transports.file: ${message}`];
      if (error2) {
        data.push(error2);
      }
      logger.transports.console({ data, date: /* @__PURE__ */ new Date(), level });
    }
    function getFile(msg) {
      initializeOnFirstAccess();
      const filePath = transport.resolvePathFn(pathVariables, msg);
      return registry.provide({
        filePath,
        writeAsync: !transport.sync,
        writeOptions: transport.writeOptions
      });
    }
    function readAllLogs({ fileFilter = (f) => f.endsWith(".log") } = {}) {
      initializeOnFirstAccess();
      const logsPath = path2.dirname(transport.resolvePathFn(pathVariables));
      if (!fs2.existsSync(logsPath)) {
        return [];
      }
      return fs2.readdirSync(logsPath).map((fileName) => path2.join(logsPath, fileName)).filter(fileFilter).map((logPath) => {
        try {
          return {
            path: logPath,
            lines: fs2.readFileSync(logPath, "utf8").split(os2.EOL)
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    }
  }
  function getDefaultFileName(processType = process.type) {
    switch (processType) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
  return file$1;
}
var ipc;
var hasRequiredIpc;
function requireIpc() {
  if (hasRequiredIpc) return ipc;
  hasRequiredIpc = 1;
  const { maxDepth, toJSON } = requireObject();
  const { transform } = requireTransform();
  ipc = ipcTransportFactory;
  function ipcTransportFactory(logger, { externalApi }) {
    Object.assign(transport, {
      depth: 3,
      eventId: "__ELECTRON_LOG_IPC__",
      level: logger.isDev ? "silly" : false,
      transforms: [toJSON, maxDepth]
    });
    return externalApi?.isElectron() ? transport : void 0;
    function transport(message) {
      if (message?.variables?.processType === "renderer") {
        return;
      }
      externalApi?.sendIpc(transport.eventId, {
        ...message,
        data: transform({ logger, message, transport })
      });
    }
  }
  return ipc;
}
var remote;
var hasRequiredRemote;
function requireRemote() {
  if (hasRequiredRemote) return remote;
  hasRequiredRemote = 1;
  const http2 = require$$0$3;
  const https2 = require$$1$4;
  const { transform } = requireTransform();
  const { removeStyles } = requireStyle();
  const { toJSON, maxDepth } = requireObject();
  remote = remoteTransportFactory;
  function remoteTransportFactory(logger) {
    return Object.assign(transport, {
      client: { name: "electron-application" },
      depth: 6,
      level: false,
      requestOptions: {},
      transforms: [removeStyles, toJSON, maxDepth],
      makeBodyFn({ message }) {
        return JSON.stringify({
          client: transport.client,
          data: message.data,
          date: message.date.getTime(),
          level: message.level,
          scope: message.scope,
          variables: message.variables
        });
      },
      processErrorFn({ error: error2 }) {
        logger.processMessage(
          {
            data: [`electron-log: can't POST ${transport.url}`, error2],
            level: "warn"
          },
          { transports: ["console", "file"] }
        );
      },
      sendRequestFn({ serverUrl, requestOptions, body }) {
        const httpTransport = serverUrl.startsWith("https:") ? https2 : http2;
        const request = httpTransport.request(serverUrl, {
          method: "POST",
          ...requestOptions,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": body.length,
            ...requestOptions.headers
          }
        });
        request.write(body);
        request.end();
        return request;
      }
    });
    function transport(message) {
      if (!transport.url) {
        return;
      }
      const body = transport.makeBodyFn({
        logger,
        message: { ...message, data: transform({ logger, message, transport }) },
        transport
      });
      const request = transport.sendRequestFn({
        serverUrl: transport.url,
        requestOptions: transport.requestOptions,
        body: Buffer.from(body, "utf8")
      });
      request.on("error", (error2) => transport.processErrorFn({
        error: error2,
        logger,
        message,
        request,
        transport
      }));
    }
  }
  return remote;
}
var createDefaultLogger_1;
var hasRequiredCreateDefaultLogger;
function requireCreateDefaultLogger() {
  if (hasRequiredCreateDefaultLogger) return createDefaultLogger_1;
  hasRequiredCreateDefaultLogger = 1;
  const Logger = requireLogger();
  const ErrorHandler = requireErrorHandler();
  const EventLogger = requireEventLogger();
  const transportConsole = requireConsole();
  const transportFile = requireFile();
  const transportIpc = requireIpc();
  const transportRemote = requireRemote();
  createDefaultLogger_1 = createDefaultLogger;
  function createDefaultLogger({ dependencies, initializeFn }) {
    const defaultLogger = new Logger({
      dependencies,
      errorHandler: new ErrorHandler(),
      eventLogger: new EventLogger(),
      initializeFn,
      isDev: dependencies.externalApi?.isDev(),
      logId: "default",
      transportFactories: {
        console: transportConsole,
        file: transportFile,
        ipc: transportIpc,
        remote: transportRemote
      },
      variables: {
        processType: "main"
      }
    });
    defaultLogger.default = defaultLogger;
    defaultLogger.Logger = Logger;
    defaultLogger.processInternalErrorFn = (e) => {
      defaultLogger.transports.console.writeFn({
        message: {
          data: ["Unhandled electron-log error", e],
          level: "error"
        }
      });
    };
    return defaultLogger;
  }
  return createDefaultLogger_1;
}
var main$2;
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main$2;
  hasRequiredMain = 1;
  const electron = require$$1$3;
  const ElectronExternalApi = requireElectronExternalApi();
  const { initialize: initialize2 } = requireInitialize();
  const createDefaultLogger = requireCreateDefaultLogger();
  const externalApi = new ElectronExternalApi({ electron });
  const defaultLogger = createDefaultLogger({
    dependencies: { externalApi },
    initializeFn: initialize2
  });
  main$2 = defaultLogger;
  externalApi.onIpc("__ELECTRON_LOG__", (_, message) => {
    if (message.scope) {
      defaultLogger.Logger.getInstance(message).scope(message.scope);
    }
    const date = new Date(message.date);
    processMessage({
      ...message,
      date: date.getTime() ? date : /* @__PURE__ */ new Date()
    });
  });
  externalApi.onIpcInvoke("__ELECTRON_LOG__", (_, { cmd = "", logId }) => {
    switch (cmd) {
      case "getOptions": {
        const logger = defaultLogger.Logger.getInstance({ logId });
        return {
          levels: logger.levels,
          logId
        };
      }
      default: {
        processMessage({ data: [`Unknown cmd '${cmd}'`], level: "error" });
        return {};
      }
    }
  });
  function processMessage(message) {
    defaultLogger.Logger.getInstance(message)?.processMessage(message);
  }
  return main$2;
}
var node$1;
var hasRequiredNode$1;
function requireNode$1() {
  if (hasRequiredNode$1) return node$1;
  hasRequiredNode$1 = 1;
  const NodeExternalApi = requireNodeExternalApi();
  const createDefaultLogger = requireCreateDefaultLogger();
  const externalApi = new NodeExternalApi();
  const defaultLogger = createDefaultLogger({
    dependencies: { externalApi }
  });
  node$1 = defaultLogger;
  return node$1;
}
const isRenderer = typeof process === "undefined" || (process.type === "renderer" || process.type === "worker");
const isMain = typeof process === "object" && process.type === "browser";
if (isRenderer) {
  requireElectronLogPreload();
  src$1.exports = requireRenderer();
} else if (isMain) {
  src$1.exports = requireMain();
} else {
  src$1.exports = requireNode$1();
}
var srcExports$1 = src$1.exports;
const log = /* @__PURE__ */ getDefaultExportFromCjs(srcExports$1);
var main$1 = {};
var fs$i = {};
var universalify$1 = {};
universalify$1.fromCallback = function(fn) {
  return Object.defineProperty(function(...args) {
    if (typeof args[args.length - 1] === "function") fn.apply(this, args);
    else {
      return new Promise((resolve, reject) => {
        args.push((err, res) => err != null ? reject(err) : resolve(res));
        fn.apply(this, args);
      });
    }
  }, "name", { value: fn.name });
};
universalify$1.fromPromise = function(fn) {
  return Object.defineProperty(function(...args) {
    const cb = args[args.length - 1];
    if (typeof cb !== "function") return fn.apply(this, args);
    else {
      args.pop();
      fn.apply(this, args).then((r) => cb(null, r), cb);
    }
  }, "name", { value: fn.name });
};
var constants$2 = require$$0$6;
var origCwd = process.cwd;
var cwd = null;
var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd;
};
try {
  process.cwd();
} catch (er) {
}
if (typeof process.chdir === "function") {
  var chdir = process.chdir;
  process.chdir = function(d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}
var polyfills$1 = patch$3;
function patch$3(fs2) {
  if (constants$2.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs2);
  }
  if (!fs2.lutimes) {
    patchLutimes(fs2);
  }
  fs2.chown = chownFix(fs2.chown);
  fs2.fchown = chownFix(fs2.fchown);
  fs2.lchown = chownFix(fs2.lchown);
  fs2.chmod = chmodFix(fs2.chmod);
  fs2.fchmod = chmodFix(fs2.fchmod);
  fs2.lchmod = chmodFix(fs2.lchmod);
  fs2.chownSync = chownFixSync(fs2.chownSync);
  fs2.fchownSync = chownFixSync(fs2.fchownSync);
  fs2.lchownSync = chownFixSync(fs2.lchownSync);
  fs2.chmodSync = chmodFixSync(fs2.chmodSync);
  fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
  fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
  fs2.stat = statFix(fs2.stat);
  fs2.fstat = statFix(fs2.fstat);
  fs2.lstat = statFix(fs2.lstat);
  fs2.statSync = statFixSync(fs2.statSync);
  fs2.fstatSync = statFixSync(fs2.fstatSync);
  fs2.lstatSync = statFixSync(fs2.lstatSync);
  if (fs2.chmod && !fs2.lchmod) {
    fs2.lchmod = function(path2, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchmodSync = function() {
    };
  }
  if (fs2.chown && !fs2.lchown) {
    fs2.lchown = function(path2, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs2.lchownSync = function() {
    };
  }
  if (platform === "win32") {
    fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
      function rename2(from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB(er) {
          if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
            setTimeout(function() {
              fs2.stat(to, function(stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename2, fs$rename);
      return rename2;
    }(fs2.rename);
  }
  fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
    function read(fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === "function") {
        var eagCounter = 0;
        callback = function(er, _, __) {
          if (er && er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
    }
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read;
  }(fs2.read);
  fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : /* @__PURE__ */ function(fs$readSync) {
    return function(fd, buffer, offset, length, position) {
      var eagCounter = 0;
      while (true) {
        try {
          return fs$readSync.call(fs2, fd, buffer, offset, length, position);
        } catch (er) {
          if (er.code === "EAGAIN" && eagCounter < 10) {
            eagCounter++;
            continue;
          }
          throw er;
        }
      }
    };
  }(fs2.readSync);
  function patchLchmod(fs22) {
    fs22.lchmod = function(path2, mode, callback) {
      fs22.open(
        path2,
        constants$2.O_WRONLY | constants$2.O_SYMLINK,
        mode,
        function(err, fd) {
          if (err) {
            if (callback) callback(err);
            return;
          }
          fs22.fchmod(fd, mode, function(err2) {
            fs22.close(fd, function(err22) {
              if (callback) callback(err2 || err22);
            });
          });
        }
      );
    };
    fs22.lchmodSync = function(path2, mode) {
      var fd = fs22.openSync(path2, constants$2.O_WRONLY | constants$2.O_SYMLINK, mode);
      var threw = true;
      var ret;
      try {
        ret = fs22.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs22.closeSync(fd);
          } catch (er) {
          }
        } else {
          fs22.closeSync(fd);
        }
      }
      return ret;
    };
  }
  function patchLutimes(fs22) {
    if (constants$2.hasOwnProperty("O_SYMLINK") && fs22.futimes) {
      fs22.lutimes = function(path2, at, mt, cb) {
        fs22.open(path2, constants$2.O_SYMLINK, function(er, fd) {
          if (er) {
            if (cb) cb(er);
            return;
          }
          fs22.futimes(fd, at, mt, function(er2) {
            fs22.close(fd, function(er22) {
              if (cb) cb(er2 || er22);
            });
          });
        });
      };
      fs22.lutimesSync = function(path2, at, mt) {
        var fd = fs22.openSync(path2, constants$2.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs22.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs22.closeSync(fd);
            } catch (er) {
            }
          } else {
            fs22.closeSync(fd);
          }
        }
        return ret;
      };
    } else if (fs22.futimes) {
      fs22.lutimes = function(_a, _b, _c, cb) {
        if (cb) process.nextTick(cb);
      };
      fs22.lutimesSync = function() {
      };
    }
  }
  function chmodFix(orig) {
    if (!orig) return orig;
    return function(target, mode, cb) {
      return orig.call(fs2, target, mode, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chmodFixSync(orig) {
    if (!orig) return orig;
    return function(target, mode) {
      try {
        return orig.call(fs2, target, mode);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function chownFix(orig) {
    if (!orig) return orig;
    return function(target, uid, gid, cb) {
      return orig.call(fs2, target, uid, gid, function(er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      });
    };
  }
  function chownFixSync(orig) {
    if (!orig) return orig;
    return function(target, uid, gid) {
      try {
        return orig.call(fs2, target, uid, gid);
      } catch (er) {
        if (!chownErOk(er)) throw er;
      }
    };
  }
  function statFix(orig) {
    if (!orig) return orig;
    return function(target, options2, cb) {
      if (typeof options2 === "function") {
        cb = options2;
        options2 = null;
      }
      function callback(er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 4294967296;
          if (stats.gid < 0) stats.gid += 4294967296;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options2 ? orig.call(fs2, target, options2, callback) : orig.call(fs2, target, callback);
    };
  }
  function statFixSync(orig) {
    if (!orig) return orig;
    return function(target, options2) {
      var stats = options2 ? orig.call(fs2, target, options2) : orig.call(fs2, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 4294967296;
        if (stats.gid < 0) stats.gid += 4294967296;
      }
      return stats;
    };
  }
  function chownErOk(er) {
    if (!er)
      return true;
    if (er.code === "ENOSYS")
      return true;
    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true;
    }
    return false;
  }
}
var Stream = require$$0$2.Stream;
var legacyStreams = legacy$1;
function legacy$1(fs2) {
  return {
    ReadStream,
    WriteStream
  };
  function ReadStream(path2, options2) {
    if (!(this instanceof ReadStream)) return new ReadStream(path2, options2);
    Stream.call(this);
    var self2 = this;
    this.path = path2;
    this.fd = null;
    this.readable = true;
    this.paused = false;
    this.flags = "r";
    this.mode = 438;
    this.bufferSize = 64 * 1024;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options2[key];
    }
    if (this.encoding) this.setEncoding(this.encoding);
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.end === void 0) {
        this.end = Infinity;
      } else if ("number" !== typeof this.end) {
        throw TypeError("end must be a Number");
      }
      if (this.start > this.end) {
        throw new Error("start must be <= end");
      }
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        self2._read();
      });
      return;
    }
    fs2.open(this.path, this.flags, this.mode, function(err, fd) {
      if (err) {
        self2.emit("error", err);
        self2.readable = false;
        return;
      }
      self2.fd = fd;
      self2.emit("open", fd);
      self2._read();
    });
  }
  function WriteStream(path2, options2) {
    if (!(this instanceof WriteStream)) return new WriteStream(path2, options2);
    Stream.call(this);
    this.path = path2;
    this.fd = null;
    this.writable = true;
    this.flags = "w";
    this.encoding = "binary";
    this.mode = 438;
    this.bytesWritten = 0;
    options2 = options2 || {};
    var keys = Object.keys(options2);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options2[key];
    }
    if (this.start !== void 0) {
      if ("number" !== typeof this.start) {
        throw TypeError("start must be a Number");
      }
      if (this.start < 0) {
        throw new Error("start must be >= zero");
      }
      this.pos = this.start;
    }
    this.busy = false;
    this._queue = [];
    if (this.fd === null) {
      this._open = fs2.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
      this.flush();
    }
  }
}
var clone_1 = clone$1;
var getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};
function clone$1(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (obj instanceof Object)
    var copy2 = { __proto__: getPrototypeOf(obj) };
  else
    var copy2 = /* @__PURE__ */ Object.create(null);
  Object.getOwnPropertyNames(obj).forEach(function(key) {
    Object.defineProperty(copy2, key, Object.getOwnPropertyDescriptor(obj, key));
  });
  return copy2;
}
var fs$h = require$$1$1;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;
var util$2 = require$$1$5;
var gracefulQueue;
var previousSymbol;
if (typeof Symbol === "function" && typeof Symbol.for === "function") {
  gracefulQueue = Symbol.for("graceful-fs.queue");
  previousSymbol = Symbol.for("graceful-fs.previous");
} else {
  gracefulQueue = "___graceful-fs.queue";
  previousSymbol = "___graceful-fs.previous";
}
function noop() {
}
function publishQueue(context, queue2) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue2;
    }
  });
}
var debug$3 = noop;
if (util$2.debuglog)
  debug$3 = util$2.debuglog("gfs4");
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
  debug$3 = function() {
    var m = util$2.format.apply(util$2, arguments);
    m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
    console.error(m);
  };
if (!fs$h[gracefulQueue]) {
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$h, queue);
  fs$h.close = function(fs$close) {
    function close(fd, cb) {
      return fs$close.call(fs$h, fd, function(err) {
        if (!err) {
          resetQueue();
        }
        if (typeof cb === "function")
          cb.apply(this, arguments);
      });
    }
    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close;
  }(fs$h.close);
  fs$h.closeSync = function(fs$closeSync) {
    function closeSync(fd) {
      fs$closeSync.apply(fs$h, arguments);
      resetQueue();
    }
    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync;
  }(fs$h.closeSync);
  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
    process.on("exit", function() {
      debug$3(fs$h[gracefulQueue]);
      require$$5.equal(fs$h[gracefulQueue].length, 0);
    });
  }
}
if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$h[gracefulQueue]);
}
var gracefulFs = patch$2(clone(fs$h));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$h.__patched) {
  gracefulFs = patch$2(fs$h);
  fs$h.__patched = true;
}
function patch$2(fs2) {
  polyfills(fs2);
  fs2.gracefulify = patch$2;
  fs2.createReadStream = createReadStream;
  fs2.createWriteStream = createWriteStream;
  var fs$readFile = fs2.readFile;
  fs2.readFile = readFile2;
  function readFile2(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$readFile(path2, options2, cb);
    function go$readFile(path22, options22, cb2, startTime) {
      return fs$readFile(path22, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$readFile, [path22, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$writeFile = fs2.writeFile;
  fs2.writeFile = writeFile2;
  function writeFile2(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$writeFile(path2, data, options2, cb);
    function go$writeFile(path22, data2, options22, cb2, startTime) {
      return fs$writeFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$writeFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$appendFile = fs2.appendFile;
  if (fs$appendFile)
    fs2.appendFile = appendFile;
  function appendFile(path2, data, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    return go$appendFile(path2, data, options2, cb);
    function go$appendFile(path22, data2, options22, cb2, startTime) {
      return fs$appendFile(path22, data2, options22, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$appendFile, [path22, data2, options22, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$copyFile = fs2.copyFile;
  if (fs$copyFile)
    fs2.copyFile = copyFile2;
  function copyFile2(src2, dest, flags, cb) {
    if (typeof flags === "function") {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src2, dest, flags, cb);
    function go$copyFile(src22, dest2, flags2, cb2, startTime) {
      return fs$copyFile(src22, dest2, flags2, function(err) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$copyFile, [src22, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  var fs$readdir = fs2.readdir;
  fs2.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir(path2, options2, cb) {
    if (typeof options2 === "function")
      cb = options2, options2 = null;
    var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    } : function go$readdir2(path22, options22, cb2, startTime) {
      return fs$readdir(path22, options22, fs$readdirCallback(
        path22,
        options22,
        cb2,
        startTime
      ));
    };
    return go$readdir(path2, options2, cb);
    function fs$readdirCallback(path22, options22, cb2, startTime) {
      return function(err, files) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([
            go$readdir,
            [path22, options22, cb2],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();
          if (typeof cb2 === "function")
            cb2.call(this, err, files);
        }
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var legStreams = legacy(fs2);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }
  var fs$ReadStream = fs2.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }
  var fs$WriteStream = fs2.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }
  Object.defineProperty(fs2, "ReadStream", {
    get: function() {
      return ReadStream;
    },
    set: function(val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs2, "WriteStream", {
    get: function() {
      return WriteStream;
    },
    set: function(val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileReadStream = ReadStream;
  Object.defineProperty(fs2, "FileReadStream", {
    get: function() {
      return FileReadStream;
    },
    set: function(val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs2, "FileWriteStream", {
    get: function() {
      return FileWriteStream;
    },
    set: function(val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });
  function ReadStream(path2, options2) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this;
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
  }
  function ReadStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
        that.read();
      }
    });
  }
  function WriteStream(path2, options2) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this;
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
  }
  function WriteStream$open() {
    var that = this;
    open(that.path, that.flags, that.mode, function(err, fd) {
      if (err) {
        that.destroy();
        that.emit("error", err);
      } else {
        that.fd = fd;
        that.emit("open", fd);
      }
    });
  }
  function createReadStream(path2, options2) {
    return new fs2.ReadStream(path2, options2);
  }
  function createWriteStream(path2, options2) {
    return new fs2.WriteStream(path2, options2);
  }
  var fs$open = fs2.open;
  fs2.open = open;
  function open(path2, flags, mode, cb) {
    if (typeof mode === "function")
      cb = mode, mode = null;
    return go$open(path2, flags, mode, cb);
    function go$open(path22, flags2, mode2, cb2, startTime) {
      return fs$open(path22, flags2, mode2, function(err, fd) {
        if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
          enqueue([go$open, [path22, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb2 === "function")
            cb2.apply(this, arguments);
        }
      });
    }
  }
  return fs2;
}
function enqueue(elem) {
  debug$3("ENQUEUE", elem[0].name, elem[1]);
  fs$h[gracefulQueue].push(elem);
  retry$2();
}
var retryTimer;
function resetQueue() {
  var now = Date.now();
  for (var i2 = 0; i2 < fs$h[gracefulQueue].length; ++i2) {
    if (fs$h[gracefulQueue][i2].length > 2) {
      fs$h[gracefulQueue][i2][3] = now;
      fs$h[gracefulQueue][i2][4] = now;
    }
  }
  retry$2();
}
function retry$2() {
  clearTimeout(retryTimer);
  retryTimer = void 0;
  if (fs$h[gracefulQueue].length === 0)
    return;
  var elem = fs$h[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];
  if (startTime === void 0) {
    debug$3("RETRY", fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 6e4) {
    debug$3("TIMEOUT", fn.name, args);
    var cb = args.pop();
    if (typeof cb === "function")
      cb.call(null, err);
  } else {
    var sinceAttempt = Date.now() - lastTime;
    var sinceStart = Math.max(lastTime - startTime, 1);
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    if (sinceAttempt >= desiredDelay) {
      debug$3("RETRY", fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      fs$h[gracefulQueue].push(elem);
    }
  }
  if (retryTimer === void 0) {
    retryTimer = setTimeout(retry$2, 0);
  }
}
(function(exports$1) {
  const u2 = universalify$1.fromCallback;
  const fs2 = gracefulFs;
  const api = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((key) => {
    return typeof fs2[key] === "function";
  });
  Object.assign(exports$1, fs2);
  api.forEach((method) => {
    exports$1[method] = u2(fs2[method]);
  });
  exports$1.exists = function(filename, callback) {
    if (typeof callback === "function") {
      return fs2.exists(filename, callback);
    }
    return new Promise((resolve) => {
      return fs2.exists(filename, resolve);
    });
  };
  exports$1.read = function(fd, buffer, offset, length, position, callback) {
    if (typeof callback === "function") {
      return fs2.read(fd, buffer, offset, length, position, callback);
    }
    return new Promise((resolve, reject) => {
      fs2.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
        if (err) return reject(err);
        resolve({ bytesRead, buffer: buffer2 });
      });
    });
  };
  exports$1.write = function(fd, buffer, ...args) {
    if (typeof args[args.length - 1] === "function") {
      return fs2.write(fd, buffer, ...args);
    }
    return new Promise((resolve, reject) => {
      fs2.write(fd, buffer, ...args, (err, bytesWritten, buffer2) => {
        if (err) return reject(err);
        resolve({ bytesWritten, buffer: buffer2 });
      });
    });
  };
  if (typeof fs2.writev === "function") {
    exports$1.writev = function(fd, buffers, ...args) {
      if (typeof args[args.length - 1] === "function") {
        return fs2.writev(fd, buffers, ...args);
      }
      return new Promise((resolve, reject) => {
        fs2.writev(fd, buffers, ...args, (err, bytesWritten, buffers2) => {
          if (err) return reject(err);
          resolve({ bytesWritten, buffers: buffers2 });
        });
      });
    };
  }
  if (typeof fs2.realpath.native === "function") {
    exports$1.realpath.native = u2(fs2.realpath.native);
  } else {
    process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  }
})(fs$i);
var makeDir$1 = {};
var utils$1 = {};
const path$l = require$$1;
utils$1.checkPath = function checkPath2(pth) {
  if (process.platform === "win32") {
    const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$l.parse(pth).root, ""));
    if (pathHasInvalidWinCharacters) {
      const error2 = new Error(`Path contains invalid characters: ${pth}`);
      error2.code = "EINVAL";
      throw error2;
    }
  }
};
const fs$g = fs$i;
const { checkPath } = utils$1;
const getMode = (options2) => {
  const defaults2 = { mode: 511 };
  if (typeof options2 === "number") return options2;
  return { ...defaults2, ...options2 }.mode;
};
makeDir$1.makeDir = async (dir, options2) => {
  checkPath(dir);
  return fs$g.mkdir(dir, {
    mode: getMode(options2),
    recursive: true
  });
};
makeDir$1.makeDirSync = (dir, options2) => {
  checkPath(dir);
  return fs$g.mkdirSync(dir, {
    mode: getMode(options2),
    recursive: true
  });
};
const u$a = universalify$1.fromPromise;
const { makeDir: _makeDir, makeDirSync } = makeDir$1;
const makeDir = u$a(_makeDir);
var mkdirs$2 = {
  mkdirs: makeDir,
  mkdirsSync: makeDirSync,
  // alias
  mkdirp: makeDir,
  mkdirpSync: makeDirSync,
  ensureDir: makeDir,
  ensureDirSync: makeDirSync
};
const u$9 = universalify$1.fromPromise;
const fs$f = fs$i;
function pathExists$6(path2) {
  return fs$f.access(path2).then(() => true).catch(() => false);
}
var pathExists_1 = {
  pathExists: u$9(pathExists$6),
  pathExistsSync: fs$f.existsSync
};
const fs$e = gracefulFs;
function utimesMillis$1(path2, atime, mtime, callback) {
  fs$e.open(path2, "r+", (err, fd) => {
    if (err) return callback(err);
    fs$e.futimes(fd, atime, mtime, (futimesErr) => {
      fs$e.close(fd, (closeErr) => {
        if (callback) callback(futimesErr || closeErr);
      });
    });
  });
}
function utimesMillisSync$1(path2, atime, mtime) {
  const fd = fs$e.openSync(path2, "r+");
  fs$e.futimesSync(fd, atime, mtime);
  return fs$e.closeSync(fd);
}
var utimes = {
  utimesMillis: utimesMillis$1,
  utimesMillisSync: utimesMillisSync$1
};
const fs$d = fs$i;
const path$k = require$$1;
const util$1 = require$$1$5;
function getStats$2(src2, dest, opts) {
  const statFunc = opts.dereference ? (file2) => fs$d.stat(file2, { bigint: true }) : (file2) => fs$d.lstat(file2, { bigint: true });
  return Promise.all([
    statFunc(src2),
    statFunc(dest).catch((err) => {
      if (err.code === "ENOENT") return null;
      throw err;
    })
  ]).then(([srcStat, destStat]) => ({ srcStat, destStat }));
}
function getStatsSync(src2, dest, opts) {
  let destStat;
  const statFunc = opts.dereference ? (file2) => fs$d.statSync(file2, { bigint: true }) : (file2) => fs$d.lstatSync(file2, { bigint: true });
  const srcStat = statFunc(src2);
  try {
    destStat = statFunc(dest);
  } catch (err) {
    if (err.code === "ENOENT") return { srcStat, destStat: null };
    throw err;
  }
  return { srcStat, destStat };
}
function checkPaths(src2, dest, funcName, opts, cb) {
  util$1.callbackify(getStats$2)(src2, dest, opts, (err, stats) => {
    if (err) return cb(err);
    const { srcStat, destStat } = stats;
    if (destStat) {
      if (areIdentical$2(srcStat, destStat)) {
        const srcBaseName = path$k.basename(src2);
        const destBaseName = path$k.basename(dest);
        if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
          return cb(null, { srcStat, destStat, isChangingCase: true });
        }
        return cb(new Error("Source and destination must not be the same."));
      }
      if (srcStat.isDirectory() && !destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src2}'.`));
      }
      if (!srcStat.isDirectory() && destStat.isDirectory()) {
        return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src2}'.`));
      }
    }
    if (srcStat.isDirectory() && isSrcSubdir(src2, dest)) {
      return cb(new Error(errMsg(src2, dest, funcName)));
    }
    return cb(null, { srcStat, destStat });
  });
}
function checkPathsSync(src2, dest, funcName, opts) {
  const { srcStat, destStat } = getStatsSync(src2, dest, opts);
  if (destStat) {
    if (areIdentical$2(srcStat, destStat)) {
      const srcBaseName = path$k.basename(src2);
      const destBaseName = path$k.basename(dest);
      if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
        return { srcStat, destStat, isChangingCase: true };
      }
      throw new Error("Source and destination must not be the same.");
    }
    if (srcStat.isDirectory() && !destStat.isDirectory()) {
      throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src2}'.`);
    }
    if (!srcStat.isDirectory() && destStat.isDirectory()) {
      throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src2}'.`);
    }
  }
  if (srcStat.isDirectory() && isSrcSubdir(src2, dest)) {
    throw new Error(errMsg(src2, dest, funcName));
  }
  return { srcStat, destStat };
}
function checkParentPaths(src2, srcStat, dest, funcName, cb) {
  const srcParent = path$k.resolve(path$k.dirname(src2));
  const destParent = path$k.resolve(path$k.dirname(dest));
  if (destParent === srcParent || destParent === path$k.parse(destParent).root) return cb();
  fs$d.stat(destParent, { bigint: true }, (err, destStat) => {
    if (err) {
      if (err.code === "ENOENT") return cb();
      return cb(err);
    }
    if (areIdentical$2(srcStat, destStat)) {
      return cb(new Error(errMsg(src2, dest, funcName)));
    }
    return checkParentPaths(src2, srcStat, destParent, funcName, cb);
  });
}
function checkParentPathsSync(src2, srcStat, dest, funcName) {
  const srcParent = path$k.resolve(path$k.dirname(src2));
  const destParent = path$k.resolve(path$k.dirname(dest));
  if (destParent === srcParent || destParent === path$k.parse(destParent).root) return;
  let destStat;
  try {
    destStat = fs$d.statSync(destParent, { bigint: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  if (areIdentical$2(srcStat, destStat)) {
    throw new Error(errMsg(src2, dest, funcName));
  }
  return checkParentPathsSync(src2, srcStat, destParent, funcName);
}
function areIdentical$2(srcStat, destStat) {
  return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
}
function isSrcSubdir(src2, dest) {
  const srcArr = path$k.resolve(src2).split(path$k.sep).filter((i2) => i2);
  const destArr = path$k.resolve(dest).split(path$k.sep).filter((i2) => i2);
  return srcArr.reduce((acc, cur, i2) => acc && destArr[i2] === cur, true);
}
function errMsg(src2, dest, funcName) {
  return `Cannot ${funcName} '${src2}' to a subdirectory of itself, '${dest}'.`;
}
var stat$4 = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir,
  areIdentical: areIdentical$2
};
const fs$c = gracefulFs;
const path$j = require$$1;
const mkdirs$1 = mkdirs$2.mkdirs;
const pathExists$5 = pathExists_1.pathExists;
const utimesMillis = utimes.utimesMillis;
const stat$3 = stat$4;
function copy$2(src2, dest, opts, cb) {
  if (typeof opts === "function" && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === "function") {
    opts = { filter: opts };
  }
  cb = cb || function() {
  };
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0001"
    );
  }
  stat$3.checkPaths(src2, dest, "copy", opts, (err, stats) => {
    if (err) return cb(err);
    const { srcStat, destStat } = stats;
    stat$3.checkParentPaths(src2, srcStat, dest, "copy", (err2) => {
      if (err2) return cb(err2);
      if (opts.filter) return handleFilter(checkParentDir, destStat, src2, dest, opts, cb);
      return checkParentDir(destStat, src2, dest, opts, cb);
    });
  });
}
function checkParentDir(destStat, src2, dest, opts, cb) {
  const destParent = path$j.dirname(dest);
  pathExists$5(destParent, (err, dirExists) => {
    if (err) return cb(err);
    if (dirExists) return getStats$1(destStat, src2, dest, opts, cb);
    mkdirs$1(destParent, (err2) => {
      if (err2) return cb(err2);
      return getStats$1(destStat, src2, dest, opts, cb);
    });
  });
}
function handleFilter(onInclude, destStat, src2, dest, opts, cb) {
  Promise.resolve(opts.filter(src2, dest)).then((include) => {
    if (include) return onInclude(destStat, src2, dest, opts, cb);
    return cb();
  }, (error2) => cb(error2));
}
function startCopy$1(destStat, src2, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats$1, destStat, src2, dest, opts, cb);
  return getStats$1(destStat, src2, dest, opts, cb);
}
function getStats$1(destStat, src2, dest, opts, cb) {
  const stat2 = opts.dereference ? fs$c.stat : fs$c.lstat;
  stat2(src2, (err, srcStat) => {
    if (err) return cb(err);
    if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src2, dest, opts, cb);
    else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src2, dest, opts, cb);
    else if (srcStat.isSymbolicLink()) return onLink$1(destStat, src2, dest, opts, cb);
    else if (srcStat.isSocket()) return cb(new Error(`Cannot copy a socket file: ${src2}`));
    else if (srcStat.isFIFO()) return cb(new Error(`Cannot copy a FIFO pipe: ${src2}`));
    return cb(new Error(`Unknown file: ${src2}`));
  });
}
function onFile$1(srcStat, destStat, src2, dest, opts, cb) {
  if (!destStat) return copyFile$1(srcStat, src2, dest, opts, cb);
  return mayCopyFile$1(srcStat, src2, dest, opts, cb);
}
function mayCopyFile$1(srcStat, src2, dest, opts, cb) {
  if (opts.overwrite) {
    fs$c.unlink(dest, (err) => {
      if (err) return cb(err);
      return copyFile$1(srcStat, src2, dest, opts, cb);
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`));
  } else return cb();
}
function copyFile$1(srcStat, src2, dest, opts, cb) {
  fs$c.copyFile(src2, dest, (err) => {
    if (err) return cb(err);
    if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src2, dest, cb);
    return setDestMode$1(dest, srcStat.mode, cb);
  });
}
function handleTimestampsAndMode(srcMode, src2, dest, cb) {
  if (fileIsNotWritable$1(srcMode)) {
    return makeFileWritable$1(dest, srcMode, (err) => {
      if (err) return cb(err);
      return setDestTimestampsAndMode(srcMode, src2, dest, cb);
    });
  }
  return setDestTimestampsAndMode(srcMode, src2, dest, cb);
}
function fileIsNotWritable$1(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable$1(dest, srcMode, cb) {
  return setDestMode$1(dest, srcMode | 128, cb);
}
function setDestTimestampsAndMode(srcMode, src2, dest, cb) {
  setDestTimestamps$1(src2, dest, (err) => {
    if (err) return cb(err);
    return setDestMode$1(dest, srcMode, cb);
  });
}
function setDestMode$1(dest, srcMode, cb) {
  return fs$c.chmod(dest, srcMode, cb);
}
function setDestTimestamps$1(src2, dest, cb) {
  fs$c.stat(src2, (err, updatedSrcStat) => {
    if (err) return cb(err);
    return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb);
  });
}
function onDir$1(srcStat, destStat, src2, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy$1(srcStat.mode, src2, dest, opts, cb);
  return copyDir$1(src2, dest, opts, cb);
}
function mkDirAndCopy$1(srcMode, src2, dest, opts, cb) {
  fs$c.mkdir(dest, (err) => {
    if (err) return cb(err);
    copyDir$1(src2, dest, opts, (err2) => {
      if (err2) return cb(err2);
      return setDestMode$1(dest, srcMode, cb);
    });
  });
}
function copyDir$1(src2, dest, opts, cb) {
  fs$c.readdir(src2, (err, items) => {
    if (err) return cb(err);
    return copyDirItems(items, src2, dest, opts, cb);
  });
}
function copyDirItems(items, src2, dest, opts, cb) {
  const item = items.pop();
  if (!item) return cb();
  return copyDirItem$1(items, item, src2, dest, opts, cb);
}
function copyDirItem$1(items, item, src2, dest, opts, cb) {
  const srcItem = path$j.join(src2, item);
  const destItem = path$j.join(dest, item);
  stat$3.checkPaths(srcItem, destItem, "copy", opts, (err, stats) => {
    if (err) return cb(err);
    const { destStat } = stats;
    startCopy$1(destStat, srcItem, destItem, opts, (err2) => {
      if (err2) return cb(err2);
      return copyDirItems(items, src2, dest, opts, cb);
    });
  });
}
function onLink$1(destStat, src2, dest, opts, cb) {
  fs$c.readlink(src2, (err, resolvedSrc) => {
    if (err) return cb(err);
    if (opts.dereference) {
      resolvedSrc = path$j.resolve(process.cwd(), resolvedSrc);
    }
    if (!destStat) {
      return fs$c.symlink(resolvedSrc, dest, cb);
    } else {
      fs$c.readlink(dest, (err2, resolvedDest) => {
        if (err2) {
          if (err2.code === "EINVAL" || err2.code === "UNKNOWN") return fs$c.symlink(resolvedSrc, dest, cb);
          return cb(err2);
        }
        if (opts.dereference) {
          resolvedDest = path$j.resolve(process.cwd(), resolvedDest);
        }
        if (stat$3.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
        }
        if (destStat.isDirectory() && stat$3.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
        }
        return copyLink$1(resolvedSrc, dest, cb);
      });
    }
  });
}
function copyLink$1(resolvedSrc, dest, cb) {
  fs$c.unlink(dest, (err) => {
    if (err) return cb(err);
    return fs$c.symlink(resolvedSrc, dest, cb);
  });
}
var copy_1 = copy$2;
const fs$b = gracefulFs;
const path$i = require$$1;
const mkdirsSync$1 = mkdirs$2.mkdirsSync;
const utimesMillisSync = utimes.utimesMillisSync;
const stat$2 = stat$4;
function copySync$1(src2, dest, opts) {
  if (typeof opts === "function") {
    opts = { filter: opts };
  }
  opts = opts || {};
  opts.clobber = "clobber" in opts ? !!opts.clobber : true;
  opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
  if (opts.preserveTimestamps && process.arch === "ia32") {
    process.emitWarning(
      "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
      "Warning",
      "fs-extra-WARN0002"
    );
  }
  const { srcStat, destStat } = stat$2.checkPathsSync(src2, dest, "copy", opts);
  stat$2.checkParentPathsSync(src2, srcStat, dest, "copy");
  return handleFilterAndCopy(destStat, src2, dest, opts);
}
function handleFilterAndCopy(destStat, src2, dest, opts) {
  if (opts.filter && !opts.filter(src2, dest)) return;
  const destParent = path$i.dirname(dest);
  if (!fs$b.existsSync(destParent)) mkdirsSync$1(destParent);
  return getStats(destStat, src2, dest, opts);
}
function startCopy(destStat, src2, dest, opts) {
  if (opts.filter && !opts.filter(src2, dest)) return;
  return getStats(destStat, src2, dest, opts);
}
function getStats(destStat, src2, dest, opts) {
  const statSync = opts.dereference ? fs$b.statSync : fs$b.lstatSync;
  const srcStat = statSync(src2);
  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src2, dest, opts);
  else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src2, dest, opts);
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src2, dest, opts);
  else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src2}`);
  else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src2}`);
  throw new Error(`Unknown file: ${src2}`);
}
function onFile(srcStat, destStat, src2, dest, opts) {
  if (!destStat) return copyFile(srcStat, src2, dest, opts);
  return mayCopyFile(srcStat, src2, dest, opts);
}
function mayCopyFile(srcStat, src2, dest, opts) {
  if (opts.overwrite) {
    fs$b.unlinkSync(dest);
    return copyFile(srcStat, src2, dest, opts);
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`);
  }
}
function copyFile(srcStat, src2, dest, opts) {
  fs$b.copyFileSync(src2, dest);
  if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src2, dest);
  return setDestMode(dest, srcStat.mode);
}
function handleTimestamps(srcMode, src2, dest) {
  if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
  return setDestTimestamps(src2, dest);
}
function fileIsNotWritable(srcMode) {
  return (srcMode & 128) === 0;
}
function makeFileWritable(dest, srcMode) {
  return setDestMode(dest, srcMode | 128);
}
function setDestMode(dest, srcMode) {
  return fs$b.chmodSync(dest, srcMode);
}
function setDestTimestamps(src2, dest) {
  const updatedSrcStat = fs$b.statSync(src2);
  return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
}
function onDir(srcStat, destStat, src2, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat.mode, src2, dest, opts);
  return copyDir(src2, dest, opts);
}
function mkDirAndCopy(srcMode, src2, dest, opts) {
  fs$b.mkdirSync(dest);
  copyDir(src2, dest, opts);
  return setDestMode(dest, srcMode);
}
function copyDir(src2, dest, opts) {
  fs$b.readdirSync(src2).forEach((item) => copyDirItem(item, src2, dest, opts));
}
function copyDirItem(item, src2, dest, opts) {
  const srcItem = path$i.join(src2, item);
  const destItem = path$i.join(dest, item);
  const { destStat } = stat$2.checkPathsSync(srcItem, destItem, "copy", opts);
  return startCopy(destStat, srcItem, destItem, opts);
}
function onLink(destStat, src2, dest, opts) {
  let resolvedSrc = fs$b.readlinkSync(src2);
  if (opts.dereference) {
    resolvedSrc = path$i.resolve(process.cwd(), resolvedSrc);
  }
  if (!destStat) {
    return fs$b.symlinkSync(resolvedSrc, dest);
  } else {
    let resolvedDest;
    try {
      resolvedDest = fs$b.readlinkSync(dest);
    } catch (err) {
      if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs$b.symlinkSync(resolvedSrc, dest);
      throw err;
    }
    if (opts.dereference) {
      resolvedDest = path$i.resolve(process.cwd(), resolvedDest);
    }
    if (stat$2.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
    }
    if (fs$b.statSync(dest).isDirectory() && stat$2.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
    }
    return copyLink(resolvedSrc, dest);
  }
}
function copyLink(resolvedSrc, dest) {
  fs$b.unlinkSync(dest);
  return fs$b.symlinkSync(resolvedSrc, dest);
}
var copySync_1 = copySync$1;
const u$8 = universalify$1.fromCallback;
var copy$1 = {
  copy: u$8(copy_1),
  copySync: copySync_1
};
const fs$a = gracefulFs;
const path$h = require$$1;
const assert = require$$5;
const isWindows = process.platform === "win32";
function defaults(options2) {
  const methods = [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ];
  methods.forEach((m) => {
    options2[m] = options2[m] || fs$a[m];
    m = m + "Sync";
    options2[m] = options2[m] || fs$a[m];
  });
  options2.maxBusyTries = options2.maxBusyTries || 3;
}
function rimraf$1(p, options2, cb) {
  let busyTries = 0;
  if (typeof options2 === "function") {
    cb = options2;
    options2 = {};
  }
  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
  assert(options2, "rimraf: invalid options argument provided");
  assert.strictEqual(typeof options2, "object", "rimraf: options should be object");
  defaults(options2);
  rimraf_(p, options2, function CB(er) {
    if (er) {
      if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options2.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        return setTimeout(() => rimraf_(p, options2, CB), time);
      }
      if (er.code === "ENOENT") er = null;
    }
    cb(er);
  });
}
function rimraf_(p, options2, cb) {
  assert(p);
  assert(options2);
  assert(typeof cb === "function");
  options2.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT") {
      return cb(null);
    }
    if (er && er.code === "EPERM" && isWindows) {
      return fixWinEPERM(p, options2, er, cb);
    }
    if (st && st.isDirectory()) {
      return rmdir(p, options2, er, cb);
    }
    options2.unlink(p, (er2) => {
      if (er2) {
        if (er2.code === "ENOENT") {
          return cb(null);
        }
        if (er2.code === "EPERM") {
          return isWindows ? fixWinEPERM(p, options2, er2, cb) : rmdir(p, options2, er2, cb);
        }
        if (er2.code === "EISDIR") {
          return rmdir(p, options2, er2, cb);
        }
      }
      return cb(er2);
    });
  });
}
function fixWinEPERM(p, options2, er, cb) {
  assert(p);
  assert(options2);
  assert(typeof cb === "function");
  options2.chmod(p, 438, (er2) => {
    if (er2) {
      cb(er2.code === "ENOENT" ? null : er);
    } else {
      options2.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === "ENOENT" ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options2, er, cb);
        } else {
          options2.unlink(p, cb);
        }
      });
    }
  });
}
function fixWinEPERMSync(p, options2, er) {
  let stats;
  assert(p);
  assert(options2);
  try {
    options2.chmodSync(p, 438);
  } catch (er2) {
    if (er2.code === "ENOENT") {
      return;
    } else {
      throw er;
    }
  }
  try {
    stats = options2.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT") {
      return;
    } else {
      throw er;
    }
  }
  if (stats.isDirectory()) {
    rmdirSync(p, options2, er);
  } else {
    options2.unlinkSync(p);
  }
}
function rmdir(p, options2, originalEr, cb) {
  assert(p);
  assert(options2);
  assert(typeof cb === "function");
  options2.rmdir(p, (er) => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
      rmkids(p, options2, cb);
    } else if (er && er.code === "ENOTDIR") {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}
function rmkids(p, options2, cb) {
  assert(p);
  assert(options2);
  assert(typeof cb === "function");
  options2.readdir(p, (er, files) => {
    if (er) return cb(er);
    let n = files.length;
    let errState;
    if (n === 0) return options2.rmdir(p, cb);
    files.forEach((f) => {
      rimraf$1(path$h.join(p, f), options2, (er2) => {
        if (errState) {
          return;
        }
        if (er2) return cb(errState = er2);
        if (--n === 0) {
          options2.rmdir(p, cb);
        }
      });
    });
  });
}
function rimrafSync(p, options2) {
  let st;
  options2 = options2 || {};
  defaults(options2);
  assert(p, "rimraf: missing path");
  assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
  assert(options2, "rimraf: missing options");
  assert.strictEqual(typeof options2, "object", "rimraf: options should be object");
  try {
    st = options2.lstatSync(p);
  } catch (er) {
    if (er.code === "ENOENT") {
      return;
    }
    if (er.code === "EPERM" && isWindows) {
      fixWinEPERMSync(p, options2, er);
    }
  }
  try {
    if (st && st.isDirectory()) {
      rmdirSync(p, options2, null);
    } else {
      options2.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === "ENOENT") {
      return;
    } else if (er.code === "EPERM") {
      return isWindows ? fixWinEPERMSync(p, options2, er) : rmdirSync(p, options2, er);
    } else if (er.code !== "EISDIR") {
      throw er;
    }
    rmdirSync(p, options2, er);
  }
}
function rmdirSync(p, options2, originalEr) {
  assert(p);
  assert(options2);
  try {
    options2.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOTDIR") {
      throw originalEr;
    } else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") {
      rmkidsSync(p, options2);
    } else if (er.code !== "ENOENT") {
      throw er;
    }
  }
}
function rmkidsSync(p, options2) {
  assert(p);
  assert(options2);
  options2.readdirSync(p).forEach((f) => rimrafSync(path$h.join(p, f), options2));
  if (isWindows) {
    const startTime = Date.now();
    do {
      try {
        const ret = options2.rmdirSync(p, options2);
        return ret;
      } catch {
      }
    } while (Date.now() - startTime < 500);
  } else {
    const ret = options2.rmdirSync(p, options2);
    return ret;
  }
}
var rimraf_1 = rimraf$1;
rimraf$1.sync = rimrafSync;
const fs$9 = gracefulFs;
const u$7 = universalify$1.fromCallback;
const rimraf = rimraf_1;
function remove$2(path2, callback) {
  if (fs$9.rm) return fs$9.rm(path2, { recursive: true, force: true }, callback);
  rimraf(path2, callback);
}
function removeSync$1(path2) {
  if (fs$9.rmSync) return fs$9.rmSync(path2, { recursive: true, force: true });
  rimraf.sync(path2);
}
var remove_1 = {
  remove: u$7(remove$2),
  removeSync: removeSync$1
};
const u$6 = universalify$1.fromPromise;
const fs$8 = fs$i;
const path$g = require$$1;
const mkdir$3 = mkdirs$2;
const remove$1 = remove_1;
const emptyDir = u$6(async function emptyDir2(dir) {
  let items;
  try {
    items = await fs$8.readdir(dir);
  } catch {
    return mkdir$3.mkdirs(dir);
  }
  return Promise.all(items.map((item) => remove$1.remove(path$g.join(dir, item))));
});
function emptyDirSync(dir) {
  let items;
  try {
    items = fs$8.readdirSync(dir);
  } catch {
    return mkdir$3.mkdirsSync(dir);
  }
  items.forEach((item) => {
    item = path$g.join(dir, item);
    remove$1.removeSync(item);
  });
}
var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};
const u$5 = universalify$1.fromCallback;
const path$f = require$$1;
const fs$7 = gracefulFs;
const mkdir$2 = mkdirs$2;
function createFile$1(file2, callback) {
  function makeFile() {
    fs$7.writeFile(file2, "", (err) => {
      if (err) return callback(err);
      callback();
    });
  }
  fs$7.stat(file2, (err, stats) => {
    if (!err && stats.isFile()) return callback();
    const dir = path$f.dirname(file2);
    fs$7.stat(dir, (err2, stats2) => {
      if (err2) {
        if (err2.code === "ENOENT") {
          return mkdir$2.mkdirs(dir, (err3) => {
            if (err3) return callback(err3);
            makeFile();
          });
        }
        return callback(err2);
      }
      if (stats2.isDirectory()) makeFile();
      else {
        fs$7.readdir(dir, (err3) => {
          if (err3) return callback(err3);
        });
      }
    });
  });
}
function createFileSync$1(file2) {
  let stats;
  try {
    stats = fs$7.statSync(file2);
  } catch {
  }
  if (stats && stats.isFile()) return;
  const dir = path$f.dirname(file2);
  try {
    if (!fs$7.statSync(dir).isDirectory()) {
      fs$7.readdirSync(dir);
    }
  } catch (err) {
    if (err && err.code === "ENOENT") mkdir$2.mkdirsSync(dir);
    else throw err;
  }
  fs$7.writeFileSync(file2, "");
}
var file = {
  createFile: u$5(createFile$1),
  createFileSync: createFileSync$1
};
const u$4 = universalify$1.fromCallback;
const path$e = require$$1;
const fs$6 = gracefulFs;
const mkdir$1 = mkdirs$2;
const pathExists$4 = pathExists_1.pathExists;
const { areIdentical: areIdentical$1 } = stat$4;
function createLink$1(srcpath, dstpath, callback) {
  function makeLink(srcpath2, dstpath2) {
    fs$6.link(srcpath2, dstpath2, (err) => {
      if (err) return callback(err);
      callback(null);
    });
  }
  fs$6.lstat(dstpath, (_, dstStat) => {
    fs$6.lstat(srcpath, (err, srcStat) => {
      if (err) {
        err.message = err.message.replace("lstat", "ensureLink");
        return callback(err);
      }
      if (dstStat && areIdentical$1(srcStat, dstStat)) return callback(null);
      const dir = path$e.dirname(dstpath);
      pathExists$4(dir, (err2, dirExists) => {
        if (err2) return callback(err2);
        if (dirExists) return makeLink(srcpath, dstpath);
        mkdir$1.mkdirs(dir, (err3) => {
          if (err3) return callback(err3);
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}
function createLinkSync$1(srcpath, dstpath) {
  let dstStat;
  try {
    dstStat = fs$6.lstatSync(dstpath);
  } catch {
  }
  try {
    const srcStat = fs$6.lstatSync(srcpath);
    if (dstStat && areIdentical$1(srcStat, dstStat)) return;
  } catch (err) {
    err.message = err.message.replace("lstat", "ensureLink");
    throw err;
  }
  const dir = path$e.dirname(dstpath);
  const dirExists = fs$6.existsSync(dir);
  if (dirExists) return fs$6.linkSync(srcpath, dstpath);
  mkdir$1.mkdirsSync(dir);
  return fs$6.linkSync(srcpath, dstpath);
}
var link = {
  createLink: u$4(createLink$1),
  createLinkSync: createLinkSync$1
};
const path$d = require$$1;
const fs$5 = gracefulFs;
const pathExists$3 = pathExists_1.pathExists;
function symlinkPaths$1(srcpath, dstpath, callback) {
  if (path$d.isAbsolute(srcpath)) {
    return fs$5.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace("lstat", "ensureSymlink");
        return callback(err);
      }
      return callback(null, {
        toCwd: srcpath,
        toDst: srcpath
      });
    });
  } else {
    const dstdir = path$d.dirname(dstpath);
    const relativeToDst = path$d.join(dstdir, srcpath);
    return pathExists$3(relativeToDst, (err, exists) => {
      if (err) return callback(err);
      if (exists) {
        return callback(null, {
          toCwd: relativeToDst,
          toDst: srcpath
        });
      } else {
        return fs$5.lstat(srcpath, (err2) => {
          if (err2) {
            err2.message = err2.message.replace("lstat", "ensureSymlink");
            return callback(err2);
          }
          return callback(null, {
            toCwd: srcpath,
            toDst: path$d.relative(dstdir, srcpath)
          });
        });
      }
    });
  }
}
function symlinkPathsSync$1(srcpath, dstpath) {
  let exists;
  if (path$d.isAbsolute(srcpath)) {
    exists = fs$5.existsSync(srcpath);
    if (!exists) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: srcpath,
      toDst: srcpath
    };
  } else {
    const dstdir = path$d.dirname(dstpath);
    const relativeToDst = path$d.join(dstdir, srcpath);
    exists = fs$5.existsSync(relativeToDst);
    if (exists) {
      return {
        toCwd: relativeToDst,
        toDst: srcpath
      };
    } else {
      exists = fs$5.existsSync(srcpath);
      if (!exists) throw new Error("relative srcpath does not exist");
      return {
        toCwd: srcpath,
        toDst: path$d.relative(dstdir, srcpath)
      };
    }
  }
}
var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths$1,
  symlinkPathsSync: symlinkPathsSync$1
};
const fs$4 = gracefulFs;
function symlinkType$1(srcpath, type2, callback) {
  callback = typeof type2 === "function" ? type2 : callback;
  type2 = typeof type2 === "function" ? false : type2;
  if (type2) return callback(null, type2);
  fs$4.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, "file");
    type2 = stats && stats.isDirectory() ? "dir" : "file";
    callback(null, type2);
  });
}
function symlinkTypeSync$1(srcpath, type2) {
  let stats;
  if (type2) return type2;
  try {
    stats = fs$4.lstatSync(srcpath);
  } catch {
    return "file";
  }
  return stats && stats.isDirectory() ? "dir" : "file";
}
var symlinkType_1 = {
  symlinkType: symlinkType$1,
  symlinkTypeSync: symlinkTypeSync$1
};
const u$3 = universalify$1.fromCallback;
const path$c = require$$1;
const fs$3 = fs$i;
const _mkdirs = mkdirs$2;
const mkdirs = _mkdirs.mkdirs;
const mkdirsSync = _mkdirs.mkdirsSync;
const _symlinkPaths = symlinkPaths_1;
const symlinkPaths = _symlinkPaths.symlinkPaths;
const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
const _symlinkType = symlinkType_1;
const symlinkType = _symlinkType.symlinkType;
const symlinkTypeSync = _symlinkType.symlinkTypeSync;
const pathExists$2 = pathExists_1.pathExists;
const { areIdentical } = stat$4;
function createSymlink$1(srcpath, dstpath, type2, callback) {
  callback = typeof type2 === "function" ? type2 : callback;
  type2 = typeof type2 === "function" ? false : type2;
  fs$3.lstat(dstpath, (err, stats) => {
    if (!err && stats.isSymbolicLink()) {
      Promise.all([
        fs$3.stat(srcpath),
        fs$3.stat(dstpath)
      ]).then(([srcStat, dstStat]) => {
        if (areIdentical(srcStat, dstStat)) return callback(null);
        _createSymlink(srcpath, dstpath, type2, callback);
      });
    } else _createSymlink(srcpath, dstpath, type2, callback);
  });
}
function _createSymlink(srcpath, dstpath, type2, callback) {
  symlinkPaths(srcpath, dstpath, (err, relative) => {
    if (err) return callback(err);
    srcpath = relative.toDst;
    symlinkType(relative.toCwd, type2, (err2, type3) => {
      if (err2) return callback(err2);
      const dir = path$c.dirname(dstpath);
      pathExists$2(dir, (err3, dirExists) => {
        if (err3) return callback(err3);
        if (dirExists) return fs$3.symlink(srcpath, dstpath, type3, callback);
        mkdirs(dir, (err4) => {
          if (err4) return callback(err4);
          fs$3.symlink(srcpath, dstpath, type3, callback);
        });
      });
    });
  });
}
function createSymlinkSync$1(srcpath, dstpath, type2) {
  let stats;
  try {
    stats = fs$3.lstatSync(dstpath);
  } catch {
  }
  if (stats && stats.isSymbolicLink()) {
    const srcStat = fs$3.statSync(srcpath);
    const dstStat = fs$3.statSync(dstpath);
    if (areIdentical(srcStat, dstStat)) return;
  }
  const relative = symlinkPathsSync(srcpath, dstpath);
  srcpath = relative.toDst;
  type2 = symlinkTypeSync(relative.toCwd, type2);
  const dir = path$c.dirname(dstpath);
  const exists = fs$3.existsSync(dir);
  if (exists) return fs$3.symlinkSync(srcpath, dstpath, type2);
  mkdirsSync(dir);
  return fs$3.symlinkSync(srcpath, dstpath, type2);
}
var symlink = {
  createSymlink: u$3(createSymlink$1),
  createSymlinkSync: createSymlinkSync$1
};
const { createFile, createFileSync } = file;
const { createLink, createLinkSync } = link;
const { createSymlink, createSymlinkSync } = symlink;
var ensure = {
  // file
  createFile,
  createFileSync,
  ensureFile: createFile,
  ensureFileSync: createFileSync,
  // link
  createLink,
  createLinkSync,
  ensureLink: createLink,
  ensureLinkSync: createLinkSync,
  // symlink
  createSymlink,
  createSymlinkSync,
  ensureSymlink: createSymlink,
  ensureSymlinkSync: createSymlinkSync
};
function stringify$4(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
  const EOF = finalEOL ? EOL : "";
  const str2 = JSON.stringify(obj, replacer, spaces);
  return str2.replace(/\n/g, EOL) + EOF;
}
function stripBom$1(content) {
  if (Buffer.isBuffer(content)) content = content.toString("utf8");
  return content.replace(/^\uFEFF/, "");
}
var utils = { stringify: stringify$4, stripBom: stripBom$1 };
let _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = require$$1$1;
}
const universalify = universalify$1;
const { stringify: stringify$3, stripBom } = utils;
async function _readFile(file2, options2 = {}) {
  if (typeof options2 === "string") {
    options2 = { encoding: options2 };
  }
  const fs2 = options2.fs || _fs;
  const shouldThrow = "throws" in options2 ? options2.throws : true;
  let data = await universalify.fromCallback(fs2.readFile)(file2, options2);
  data = stripBom(data);
  let obj;
  try {
    obj = JSON.parse(data, options2 ? options2.reviver : null);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
  return obj;
}
const readFile = universalify.fromPromise(_readFile);
function readFileSync(file2, options2 = {}) {
  if (typeof options2 === "string") {
    options2 = { encoding: options2 };
  }
  const fs2 = options2.fs || _fs;
  const shouldThrow = "throws" in options2 ? options2.throws : true;
  try {
    let content = fs2.readFileSync(file2, options2);
    content = stripBom(content);
    return JSON.parse(content, options2.reviver);
  } catch (err) {
    if (shouldThrow) {
      err.message = `${file2}: ${err.message}`;
      throw err;
    } else {
      return null;
    }
  }
}
async function _writeFile(file2, obj, options2 = {}) {
  const fs2 = options2.fs || _fs;
  const str2 = stringify$3(obj, options2);
  await universalify.fromCallback(fs2.writeFile)(file2, str2, options2);
}
const writeFile = universalify.fromPromise(_writeFile);
function writeFileSync(file2, obj, options2 = {}) {
  const fs2 = options2.fs || _fs;
  const str2 = stringify$3(obj, options2);
  return fs2.writeFileSync(file2, str2, options2);
}
var jsonfile$1 = {
  readFile,
  readFileSync,
  writeFile,
  writeFileSync
};
const jsonFile$1 = jsonfile$1;
var jsonfile = {
  // jsonfile exports
  readJson: jsonFile$1.readFile,
  readJsonSync: jsonFile$1.readFileSync,
  writeJson: jsonFile$1.writeFile,
  writeJsonSync: jsonFile$1.writeFileSync
};
const u$2 = universalify$1.fromCallback;
const fs$2 = gracefulFs;
const path$b = require$$1;
const mkdir = mkdirs$2;
const pathExists$1 = pathExists_1.pathExists;
function outputFile$1(file2, data, encoding, callback) {
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = "utf8";
  }
  const dir = path$b.dirname(file2);
  pathExists$1(dir, (err, itDoes) => {
    if (err) return callback(err);
    if (itDoes) return fs$2.writeFile(file2, data, encoding, callback);
    mkdir.mkdirs(dir, (err2) => {
      if (err2) return callback(err2);
      fs$2.writeFile(file2, data, encoding, callback);
    });
  });
}
function outputFileSync$1(file2, ...args) {
  const dir = path$b.dirname(file2);
  if (fs$2.existsSync(dir)) {
    return fs$2.writeFileSync(file2, ...args);
  }
  mkdir.mkdirsSync(dir);
  fs$2.writeFileSync(file2, ...args);
}
var outputFile_1 = {
  outputFile: u$2(outputFile$1),
  outputFileSync: outputFileSync$1
};
const { stringify: stringify$2 } = utils;
const { outputFile } = outputFile_1;
async function outputJson(file2, data, options2 = {}) {
  const str2 = stringify$2(data, options2);
  await outputFile(file2, str2, options2);
}
var outputJson_1 = outputJson;
const { stringify: stringify$1 } = utils;
const { outputFileSync } = outputFile_1;
function outputJsonSync(file2, data, options2) {
  const str2 = stringify$1(data, options2);
  outputFileSync(file2, str2, options2);
}
var outputJsonSync_1 = outputJsonSync;
const u$1 = universalify$1.fromPromise;
const jsonFile = jsonfile;
jsonFile.outputJson = u$1(outputJson_1);
jsonFile.outputJsonSync = outputJsonSync_1;
jsonFile.outputJSON = jsonFile.outputJson;
jsonFile.outputJSONSync = jsonFile.outputJsonSync;
jsonFile.writeJSON = jsonFile.writeJson;
jsonFile.writeJSONSync = jsonFile.writeJsonSync;
jsonFile.readJSON = jsonFile.readJson;
jsonFile.readJSONSync = jsonFile.readJsonSync;
var json$1 = jsonFile;
const fs$1 = gracefulFs;
const path$a = require$$1;
const copy = copy$1.copy;
const remove = remove_1.remove;
const mkdirp = mkdirs$2.mkdirp;
const pathExists = pathExists_1.pathExists;
const stat$1 = stat$4;
function move$1(src2, dest, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  stat$1.checkPaths(src2, dest, "move", opts, (err, stats) => {
    if (err) return cb(err);
    const { srcStat, isChangingCase = false } = stats;
    stat$1.checkParentPaths(src2, srcStat, dest, "move", (err2) => {
      if (err2) return cb(err2);
      if (isParentRoot$1(dest)) return doRename$1(src2, dest, overwrite, isChangingCase, cb);
      mkdirp(path$a.dirname(dest), (err3) => {
        if (err3) return cb(err3);
        return doRename$1(src2, dest, overwrite, isChangingCase, cb);
      });
    });
  });
}
function isParentRoot$1(dest) {
  const parent = path$a.dirname(dest);
  const parsedPath = path$a.parse(parent);
  return parsedPath.root === parent;
}
function doRename$1(src2, dest, overwrite, isChangingCase, cb) {
  if (isChangingCase) return rename$1(src2, dest, overwrite, cb);
  if (overwrite) {
    return remove(dest, (err) => {
      if (err) return cb(err);
      return rename$1(src2, dest, overwrite, cb);
    });
  }
  pathExists(dest, (err, destExists) => {
    if (err) return cb(err);
    if (destExists) return cb(new Error("dest already exists."));
    return rename$1(src2, dest, overwrite, cb);
  });
}
function rename$1(src2, dest, overwrite, cb) {
  fs$1.rename(src2, dest, (err) => {
    if (!err) return cb();
    if (err.code !== "EXDEV") return cb(err);
    return moveAcrossDevice$1(src2, dest, overwrite, cb);
  });
}
function moveAcrossDevice$1(src2, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy(src2, dest, opts, (err) => {
    if (err) return cb(err);
    return remove(src2, cb);
  });
}
var move_1 = move$1;
const fs = gracefulFs;
const path$9 = require$$1;
const copySync = copy$1.copySync;
const removeSync = remove_1.removeSync;
const mkdirpSync = mkdirs$2.mkdirpSync;
const stat = stat$4;
function moveSync(src2, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;
  const { srcStat, isChangingCase = false } = stat.checkPathsSync(src2, dest, "move", opts);
  stat.checkParentPathsSync(src2, srcStat, dest, "move");
  if (!isParentRoot(dest)) mkdirpSync(path$9.dirname(dest));
  return doRename(src2, dest, overwrite, isChangingCase);
}
function isParentRoot(dest) {
  const parent = path$9.dirname(dest);
  const parsedPath = path$9.parse(parent);
  return parsedPath.root === parent;
}
function doRename(src2, dest, overwrite, isChangingCase) {
  if (isChangingCase) return rename(src2, dest, overwrite);
  if (overwrite) {
    removeSync(dest);
    return rename(src2, dest, overwrite);
  }
  if (fs.existsSync(dest)) throw new Error("dest already exists.");
  return rename(src2, dest, overwrite);
}
function rename(src2, dest, overwrite) {
  try {
    fs.renameSync(src2, dest);
  } catch (err) {
    if (err.code !== "EXDEV") throw err;
    return moveAcrossDevice(src2, dest, overwrite);
  }
}
function moveAcrossDevice(src2, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync(src2, dest, opts);
  return removeSync(src2);
}
var moveSync_1 = moveSync;
const u = universalify$1.fromCallback;
var move = {
  move: u(move_1),
  moveSync: moveSync_1
};
var lib = {
  // Export promiseified graceful-fs:
  ...fs$i,
  // Export extra methods:
  ...copy$1,
  ...empty,
  ...ensure,
  ...json$1,
  ...mkdirs$2,
  ...move,
  ...outputFile_1,
  ...pathExists_1,
  ...remove_1
};
var BaseUpdater$1 = {};
var AppUpdater$1 = {};
var out = {};
var CancellationToken$1 = {};
Object.defineProperty(CancellationToken$1, "__esModule", { value: true });
CancellationToken$1.CancellationError = CancellationToken$1.CancellationToken = void 0;
const events_1$1 = require$$0$4;
class CancellationToken extends events_1$1.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(value) {
    this.removeParentCancelHandler();
    this._parent = value;
    this.parentCancelHandler = () => this.cancel();
    this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(parent) {
    super();
    this.parentCancelHandler = null;
    this._parent = null;
    this._cancelled = false;
    if (parent != null) {
      this.parent = parent;
    }
  }
  cancel() {
    this._cancelled = true;
    this.emit("cancel");
  }
  onCancel(handler) {
    if (this.cancelled) {
      handler();
    } else {
      this.once("cancel", handler);
    }
  }
  createPromise(callback) {
    if (this.cancelled) {
      return Promise.reject(new CancellationError());
    }
    const finallyHandler = () => {
      if (cancelHandler != null) {
        try {
          this.removeListener("cancel", cancelHandler);
          cancelHandler = null;
        } catch (_ignore) {
        }
      }
    };
    let cancelHandler = null;
    return new Promise((resolve, reject) => {
      let addedCancelHandler = null;
      cancelHandler = () => {
        try {
          if (addedCancelHandler != null) {
            addedCancelHandler();
            addedCancelHandler = null;
          }
        } finally {
          reject(new CancellationError());
        }
      };
      if (this.cancelled) {
        cancelHandler();
        return;
      }
      this.onCancel(cancelHandler);
      callback(resolve, reject, (callback2) => {
        addedCancelHandler = callback2;
      });
    }).then((it) => {
      finallyHandler();
      return it;
    }).catch((e) => {
      finallyHandler();
      throw e;
    });
  }
  removeParentCancelHandler() {
    const parent = this._parent;
    if (parent != null && this.parentCancelHandler != null) {
      parent.removeListener("cancel", this.parentCancelHandler);
      this.parentCancelHandler = null;
    }
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners();
      this._parent = null;
    }
  }
}
CancellationToken$1.CancellationToken = CancellationToken;
class CancellationError extends Error {
  constructor() {
    super("cancelled");
  }
}
CancellationToken$1.CancellationError = CancellationError;
var error = {};
Object.defineProperty(error, "__esModule", { value: true });
error.newError = newError;
function newError(message, code) {
  const error2 = new Error(message);
  error2.code = code;
  return error2;
}
var httpExecutor = {};
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options2) {
    options2 = options2 || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse2(val);
    } else if (type2 === "number" && isFinite(val)) {
      return options2.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str2) {
    str2 = String(str2);
    if (str2.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str2
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common$6;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common$6;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce2;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i2 = 0; i2 < namespace.length; i2++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i2);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self2 = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format2) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format2];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend3;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend3(namespace, delimiter2) {
      const newDebug = createDebug(this.namespace + (typeof delimiter2 === "undefined" ? ":" : delimiter2) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce2(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common$6 = setup;
  return common$6;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load2;
    exports$1.useColors = useColors;
    exports$1.storage = localstorage();
    exports$1.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports$1.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports$1.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports$1.storage.setItem("debug", namespaces);
        } else {
          exports$1.storage.removeItem("debug");
        }
      } catch (error2) {
      }
    }
    function load2() {
      let r;
      try {
        r = exports$1.storage.getItem("debug") || exports$1.storage.getItem("DEBUG");
      } catch (error2) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error2) {
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error2) {
        return "[UnexpectedJSONParseError]: " + error2.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os2 = require$$1$2;
  const tty = require$$1$6;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === "dumb") {
      return min;
    }
    if (process.platform === "win32") {
      const osRelease = os2.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign2) => sign2 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version2 = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version2 >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min;
  }
  function getSupportLevel(stream2) {
    const level = supportsColor(stream2, stream2 && stream2.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    const tty = require$$1$6;
    const util2 = require$$1$5;
    exports$1.init = init;
    exports$1.log = log2;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load2;
    exports$1.useColors = useColors;
    exports$1.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports$1.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error2) {
    }
    exports$1.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports$1.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log2(...args) {
      return process.stderr.write(util2.formatWithOptions(exports$1.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load2() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports$1.inspectOpts);
      for (let i2 = 0; i2 < keys.length; i2++) {
        debug2.inspectOpts[keys[i2]] = exports$1.inspectOpts[keys[i2]];
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str2) => str2.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var ProgressCallbackTransform$1 = {};
Object.defineProperty(ProgressCallbackTransform$1, "__esModule", { value: true });
ProgressCallbackTransform$1.ProgressCallbackTransform = void 0;
const stream_1$3 = require$$0$2;
class ProgressCallbackTransform extends stream_1$3.Transform {
  constructor(total, cancellationToken, onProgress) {
    super();
    this.total = total;
    this.cancellationToken = cancellationToken;
    this.onProgress = onProgress;
    this.start = Date.now();
    this.transferred = 0;
    this.delta = 0;
    this.nextUpdate = this.start + 1e3;
  }
  _transform(chunk, encoding, callback) {
    if (this.cancellationToken.cancelled) {
      callback(new Error("cancelled"), null);
      return;
    }
    this.transferred += chunk.length;
    this.delta += chunk.length;
    const now = Date.now();
    if (now >= this.nextUpdate && this.transferred !== this.total) {
      this.nextUpdate = now + 1e3;
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((now - this.start) / 1e3))
      });
      this.delta = 0;
    }
    callback(null, chunk);
  }
  _flush(callback) {
    if (this.cancellationToken.cancelled) {
      callback(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
    this.delta = 0;
    callback(null);
  }
}
ProgressCallbackTransform$1.ProgressCallbackTransform = ProgressCallbackTransform;
Object.defineProperty(httpExecutor, "__esModule", { value: true });
httpExecutor.DigestTransform = httpExecutor.HttpExecutor = httpExecutor.HttpError = void 0;
httpExecutor.createHttpError = createHttpError;
httpExecutor.parseJson = parseJson;
httpExecutor.configureRequestOptionsFromUrl = configureRequestOptionsFromUrl;
httpExecutor.configureRequestUrl = configureRequestUrl;
httpExecutor.safeGetHeader = safeGetHeader;
httpExecutor.configureRequestOptions = configureRequestOptions;
httpExecutor.safeStringifyJson = safeStringifyJson;
const crypto_1$4 = require$$0$1;
const debug_1$1 = srcExports;
const fs_1$5 = require$$1$1;
const stream_1$2 = require$$0$2;
const url_1$7 = require$$2;
const CancellationToken_1$1 = CancellationToken$1;
const error_1$2 = error;
const ProgressCallbackTransform_1 = ProgressCallbackTransform$1;
const debug$2 = (0, debug_1$1.default)("electron-builder");
function createHttpError(response, description = null) {
  return new HttpError(response.statusCode || -1, `${response.statusCode} ${response.statusMessage}` + (description == null ? "" : "\n" + JSON.stringify(description, null, "  ")) + "\nHeaders: " + safeStringifyJson(response.headers), description);
}
const HTTP_STATUS_CODES = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class HttpError extends Error {
  constructor(statusCode, message = `HTTP error: ${HTTP_STATUS_CODES.get(statusCode) || statusCode}`, description = null) {
    super(message);
    this.statusCode = statusCode;
    this.description = description;
    this.name = "HttpError";
    this.code = `HTTP_ERROR_${statusCode}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
httpExecutor.HttpError = HttpError;
function parseJson(result) {
  return result.then((it) => it == null || it.length === 0 ? null : JSON.parse(it));
}
class HttpExecutor {
  constructor() {
    this.maxRedirects = 10;
  }
  request(options2, cancellationToken = new CancellationToken_1$1.CancellationToken(), data) {
    configureRequestOptions(options2);
    const json2 = data == null ? void 0 : JSON.stringify(data);
    const encodedData = json2 ? Buffer.from(json2) : void 0;
    if (encodedData != null) {
      debug$2(json2);
      const { headers, ...opts } = options2;
      options2 = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": encodedData.length,
          ...headers
        },
        ...opts
      };
    }
    return this.doApiRequest(options2, cancellationToken, (it) => it.end(encodedData));
  }
  doApiRequest(options2, cancellationToken, requestProcessor, redirectCount = 0) {
    if (debug$2.enabled) {
      debug$2(`Request: ${safeStringifyJson(options2)}`);
    }
    return cancellationToken.createPromise((resolve, reject, onCancel) => {
      const request = this.createRequest(options2, (response) => {
        try {
          this.handleResponse(response, options2, cancellationToken, resolve, reject, redirectCount, requestProcessor);
        } catch (e) {
          reject(e);
        }
      });
      this.addErrorAndTimeoutHandlers(request, reject, options2.timeout);
      this.addRedirectHandlers(request, options2, reject, redirectCount, (options3) => {
        this.doApiRequest(options3, cancellationToken, requestProcessor, redirectCount).then(resolve).catch(reject);
      });
      requestProcessor(request, reject);
      onCancel(() => request.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(request, options2, reject, redirectCount, handler) {
  }
  addErrorAndTimeoutHandlers(request, reject, timeout = 60 * 1e3) {
    this.addTimeOutHandler(request, reject, timeout);
    request.on("error", reject);
    request.on("aborted", () => {
      reject(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(response, options2, cancellationToken, resolve, reject, redirectCount, requestProcessor) {
    var _a;
    if (debug$2.enabled) {
      debug$2(`Response: ${response.statusCode} ${response.statusMessage}, request options: ${safeStringifyJson(options2)}`);
    }
    if (response.statusCode === 404) {
      reject(createHttpError(response, `method: ${options2.method || "GET"} url: ${options2.protocol || "https:"}//${options2.hostname}${options2.port ? `:${options2.port}` : ""}${options2.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (response.statusCode === 204) {
      resolve();
      return;
    }
    const code = (_a = response.statusCode) !== null && _a !== void 0 ? _a : 0;
    const shouldRedirect = code >= 300 && code < 400;
    const redirectUrl = safeGetHeader(response, "location");
    if (shouldRedirect && redirectUrl != null) {
      if (redirectCount > this.maxRedirects) {
        reject(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options2), cancellationToken, requestProcessor, redirectCount).then(resolve).catch(reject);
      return;
    }
    response.setEncoding("utf8");
    let data = "";
    response.on("error", reject);
    response.on("data", (chunk) => data += chunk);
    response.on("end", () => {
      try {
        if (response.statusCode != null && response.statusCode >= 400) {
          const contentType = safeGetHeader(response, "content-type");
          const isJson = contentType != null && (Array.isArray(contentType) ? contentType.find((it) => it.includes("json")) != null : contentType.includes("json"));
          reject(createHttpError(response, `method: ${options2.method || "GET"} url: ${options2.protocol || "https:"}//${options2.hostname}${options2.port ? `:${options2.port}` : ""}${options2.path}

          Data:
          ${isJson ? JSON.stringify(JSON.parse(data)) : data}
          `));
        } else {
          resolve(data.length === 0 ? null : data);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  async downloadToBuffer(url, options2) {
    return await options2.cancellationToken.createPromise((resolve, reject, onCancel) => {
      const responseChunks = [];
      const requestOptions = {
        headers: options2.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      configureRequestUrl(url, requestOptions);
      configureRequestOptions(requestOptions);
      this.doDownload(requestOptions, {
        destination: null,
        options: options2,
        onCancel,
        callback: (error2) => {
          if (error2 == null) {
            resolve(Buffer.concat(responseChunks));
          } else {
            reject(error2);
          }
        },
        responseHandler: (response, callback) => {
          let receivedLength = 0;
          response.on("data", (chunk) => {
            receivedLength += chunk.length;
            if (receivedLength > 524288e3) {
              callback(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            responseChunks.push(chunk);
          });
          response.on("end", () => {
            callback(null);
          });
        }
      }, 0);
    });
  }
  doDownload(requestOptions, options2, redirectCount) {
    const request = this.createRequest(requestOptions, (response) => {
      if (response.statusCode >= 400) {
        options2.callback(new Error(`Cannot download "${requestOptions.protocol || "https:"}//${requestOptions.hostname}${requestOptions.path}", status ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      response.on("error", options2.callback);
      const redirectUrl = safeGetHeader(response, "location");
      if (redirectUrl != null) {
        if (redirectCount < this.maxRedirects) {
          this.doDownload(HttpExecutor.prepareRedirectUrlOptions(redirectUrl, requestOptions), options2, redirectCount++);
        } else {
          options2.callback(this.createMaxRedirectError());
        }
        return;
      }
      if (options2.responseHandler == null) {
        configurePipes(options2, response);
      } else {
        options2.responseHandler(response, options2.callback);
      }
    });
    this.addErrorAndTimeoutHandlers(request, options2.callback, requestOptions.timeout);
    this.addRedirectHandlers(request, requestOptions, options2.callback, redirectCount, (requestOptions2) => {
      this.doDownload(requestOptions2, options2, redirectCount++);
    });
    request.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(request, callback, timeout) {
    request.on("socket", (socket) => {
      socket.setTimeout(timeout, () => {
        request.abort();
        callback(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(redirectUrl, options2) {
    const newOptions = configureRequestOptionsFromUrl(redirectUrl, { ...options2 });
    const headers = newOptions.headers;
    if (headers === null || headers === void 0 ? void 0 : headers.authorization) {
      const originalUrl = HttpExecutor.reconstructOriginalUrl(options2);
      const parsedRedirectUrl = parseUrl(redirectUrl, options2);
      if (HttpExecutor.isCrossOriginRedirect(originalUrl, parsedRedirectUrl)) {
        if (debug$2.enabled) {
          debug$2(`Given the cross-origin redirect (from ${originalUrl.host} to ${parsedRedirectUrl.host}), the Authorization header will be stripped out.`);
        }
        delete headers.authorization;
      }
    }
    return newOptions;
  }
  static reconstructOriginalUrl(options2) {
    const protocol = options2.protocol || "https:";
    if (!options2.hostname) {
      throw new Error("Missing hostname in request options");
    }
    const hostname = options2.hostname;
    const port = options2.port ? `:${options2.port}` : "";
    const path2 = options2.path || "/";
    return new url_1$7.URL(`${protocol}//${hostname}${port}${path2}`);
  }
  static isCrossOriginRedirect(originalUrl, redirectUrl) {
    if (originalUrl.hostname.toLowerCase() !== redirectUrl.hostname.toLowerCase()) {
      return true;
    }
    if (originalUrl.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(originalUrl.port) && redirectUrl.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(redirectUrl.port)) {
      return false;
    }
    if (originalUrl.protocol !== redirectUrl.protocol) {
      return true;
    }
    const originalPort = originalUrl.port;
    const redirectPort = redirectUrl.port;
    return originalPort !== redirectPort;
  }
  static retryOnServerError(task, maxRetries = 3) {
    for (let attemptNumber = 0; ; attemptNumber++) {
      try {
        return task();
      } catch (e) {
        if (attemptNumber < maxRetries && (e instanceof HttpError && e.isServerError() || e.code === "EPIPE")) {
          continue;
        }
        throw e;
      }
    }
  }
}
httpExecutor.HttpExecutor = HttpExecutor;
function parseUrl(url, options2) {
  try {
    return new url_1$7.URL(url);
  } catch {
    const hostname = options2.hostname;
    const protocol = options2.protocol || "https:";
    const port = options2.port ? `:${options2.port}` : "";
    const baseUrl = `${protocol}//${hostname}${port}`;
    return new url_1$7.URL(url, baseUrl);
  }
}
function configureRequestOptionsFromUrl(url, options2) {
  const result = configureRequestOptions(options2);
  const parsedUrl = parseUrl(url, options2);
  configureRequestUrl(parsedUrl, result);
  return result;
}
function configureRequestUrl(url, options2) {
  options2.protocol = url.protocol;
  options2.hostname = url.hostname;
  if (url.port) {
    options2.port = url.port;
  } else if (options2.port) {
    delete options2.port;
  }
  options2.path = url.pathname + url.search;
}
class DigestTransform extends stream_1$2.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(expected, algorithm = "sha512", encoding = "base64") {
    super();
    this.expected = expected;
    this.algorithm = algorithm;
    this.encoding = encoding;
    this._actual = null;
    this.isValidateOnEnd = true;
    this.digester = (0, crypto_1$4.createHash)(algorithm);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(chunk, encoding, callback) {
    this.digester.update(chunk);
    callback(null, chunk);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(callback) {
    this._actual = this.digester.digest(this.encoding);
    if (this.isValidateOnEnd) {
      try {
        this.validate();
      } catch (e) {
        callback(e);
        return;
      }
    }
    callback(null);
  }
  validate() {
    if (this._actual == null) {
      throw (0, error_1$2.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    }
    if (this._actual !== this.expected) {
      throw (0, error_1$2.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    }
    return null;
  }
}
httpExecutor.DigestTransform = DigestTransform;
function checkSha2(sha2Header, sha2, callback) {
  if (sha2Header != null && sha2 != null && sha2Header !== sha2) {
    callback(new Error(`checksum mismatch: expected ${sha2} but got ${sha2Header} (X-Checksum-Sha2 header)`));
    return false;
  }
  return true;
}
function safeGetHeader(response, headerKey) {
  const value = response.headers[headerKey];
  if (value == null) {
    return null;
  } else if (Array.isArray(value)) {
    return value.length === 0 ? null : value[value.length - 1];
  } else {
    return value;
  }
}
function configurePipes(options2, response) {
  if (!checkSha2(safeGetHeader(response, "X-Checksum-Sha2"), options2.options.sha2, options2.callback)) {
    return;
  }
  const streams = [];
  if (options2.options.onProgress != null) {
    const contentLength = safeGetHeader(response, "content-length");
    if (contentLength != null) {
      streams.push(new ProgressCallbackTransform_1.ProgressCallbackTransform(parseInt(contentLength, 10), options2.options.cancellationToken, options2.options.onProgress));
    }
  }
  const sha512 = options2.options.sha512;
  if (sha512 != null) {
    streams.push(new DigestTransform(sha512, "sha512", sha512.length === 128 && !sha512.includes("+") && !sha512.includes("Z") && !sha512.includes("=") ? "hex" : "base64"));
  } else if (options2.options.sha2 != null) {
    streams.push(new DigestTransform(options2.options.sha2, "sha256", "hex"));
  }
  const fileOut = (0, fs_1$5.createWriteStream)(options2.destination);
  streams.push(fileOut);
  let lastStream = response;
  for (const stream2 of streams) {
    stream2.on("error", (error2) => {
      fileOut.close();
      if (!options2.options.cancellationToken.cancelled) {
        options2.callback(error2);
      }
    });
    lastStream = lastStream.pipe(stream2);
  }
  fileOut.on("finish", () => {
    fileOut.close(options2.callback);
  });
}
function configureRequestOptions(options2, token, method) {
  if (method != null) {
    options2.method = method;
  }
  options2.headers = { ...options2.headers };
  const headers = options2.headers;
  if (token != null) {
    headers.authorization = token.startsWith("Basic") || token.startsWith("Bearer") ? token : `token ${token}`;
  }
  if (headers["User-Agent"] == null) {
    headers["User-Agent"] = "electron-builder";
  }
  if (method == null || method === "GET" || headers["Cache-Control"] == null) {
    headers["Cache-Control"] = "no-cache";
  }
  if (options2.protocol == null && process.versions.electron != null) {
    options2.protocol = "https:";
  }
  return options2;
}
function safeStringifyJson(data, skippedNames) {
  return JSON.stringify(data, (name, value) => {
    if (name.endsWith("Authorization") || name.endsWith("authorization") || name.endsWith("Password") || name.endsWith("PASSWORD") || name.endsWith("Token") || name.includes("password") || name.includes("token") || skippedNames != null && skippedNames.has(name)) {
      return "<stripped sensitive data>";
    }
    return value;
  }, 2);
}
var MemoLazy$1 = {};
Object.defineProperty(MemoLazy$1, "__esModule", { value: true });
MemoLazy$1.MemoLazy = void 0;
class MemoLazy {
  constructor(selector, creator) {
    this.selector = selector;
    this.creator = creator;
    this.selected = void 0;
    this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const selected = this.selector();
    if (this._value !== void 0 && equals(this.selected, selected)) {
      return this._value;
    }
    this.selected = selected;
    const result = this.creator(selected);
    this.value = result;
    return result;
  }
  set value(value) {
    this._value = value;
  }
}
MemoLazy$1.MemoLazy = MemoLazy;
function equals(firstValue, secondValue) {
  const isFirstObject = typeof firstValue === "object" && firstValue !== null;
  const isSecondObject = typeof secondValue === "object" && secondValue !== null;
  if (isFirstObject && isSecondObject) {
    const keys1 = Object.keys(firstValue);
    const keys2 = Object.keys(secondValue);
    return keys1.length === keys2.length && keys1.every((key) => equals(firstValue[key], secondValue[key]));
  }
  return firstValue === secondValue;
}
var publishOptions = {};
Object.defineProperty(publishOptions, "__esModule", { value: true });
publishOptions.githubUrl = githubUrl;
publishOptions.githubTagPrefix = githubTagPrefix;
publishOptions.getS3LikeProviderBaseUrl = getS3LikeProviderBaseUrl;
function githubUrl(options2, defaultHost = "github.com") {
  return `${options2.protocol || "https"}://${options2.host || defaultHost}`;
}
function githubTagPrefix(options2) {
  var _a;
  if (options2.tagNamePrefix) {
    return options2.tagNamePrefix;
  }
  if ((_a = options2.vPrefixedTagName) !== null && _a !== void 0 ? _a : true) {
    return "v";
  }
  return "";
}
function getS3LikeProviderBaseUrl(configuration) {
  const provider = configuration.provider;
  if (provider === "s3") {
    return s3Url(configuration);
  }
  if (provider === "spaces") {
    return spacesUrl(configuration);
  }
  throw new Error(`Not supported provider: ${provider}`);
}
function s3Url(options2) {
  let url;
  if (options2.accelerate == true) {
    url = `https://${options2.bucket}.s3-accelerate.amazonaws.com`;
  } else if (options2.endpoint != null) {
    url = `${options2.endpoint}/${options2.bucket}`;
  } else if (options2.bucket.includes(".")) {
    if (options2.region == null) {
      throw new Error(`Bucket name "${options2.bucket}" includes a dot, but S3 region is missing`);
    }
    if (options2.region === "us-east-1") {
      url = `https://s3.amazonaws.com/${options2.bucket}`;
    } else {
      url = `https://s3-${options2.region}.amazonaws.com/${options2.bucket}`;
    }
  } else if (options2.region === "cn-north-1") {
    url = `https://${options2.bucket}.s3.${options2.region}.amazonaws.com.cn`;
  } else {
    url = `https://${options2.bucket}.s3.amazonaws.com`;
  }
  return appendPath(url, options2.path);
}
function appendPath(url, p) {
  if (p != null && p.length > 0) {
    if (!p.startsWith("/")) {
      url += "/";
    }
    url += p;
  }
  return url;
}
function spacesUrl(options2) {
  if (options2.name == null) {
    throw new Error(`name is missing`);
  }
  if (options2.region == null) {
    throw new Error(`region is missing`);
  }
  return appendPath(`https://${options2.name}.${options2.region}.digitaloceanspaces.com`, options2.path);
}
var retry$1 = {};
Object.defineProperty(retry$1, "__esModule", { value: true });
retry$1.retry = retry;
const CancellationToken_1 = CancellationToken$1;
async function retry(task, options2) {
  var _a;
  const { retries: retryCount, interval, backoff = 0, attempt = 0, shouldRetry, cancellationToken = new CancellationToken_1.CancellationToken() } = options2;
  try {
    return await task();
  } catch (error2) {
    if (await Promise.resolve((_a = shouldRetry === null || shouldRetry === void 0 ? void 0 : shouldRetry(error2)) !== null && _a !== void 0 ? _a : true) && retryCount > 0 && !cancellationToken.cancelled) {
      await new Promise((resolve) => setTimeout(resolve, interval + backoff * attempt));
      return await retry(task, { ...options2, retries: retryCount - 1, attempt: attempt + 1 });
    } else {
      throw error2;
    }
  }
}
var rfc2253Parser = {};
Object.defineProperty(rfc2253Parser, "__esModule", { value: true });
rfc2253Parser.parseDn = parseDn;
function parseDn(seq2) {
  let quoted = false;
  let key = null;
  let token = "";
  let nextNonSpace = 0;
  seq2 = seq2.trim();
  const result = /* @__PURE__ */ new Map();
  for (let i2 = 0; i2 <= seq2.length; i2++) {
    if (i2 === seq2.length) {
      if (key !== null) {
        result.set(key, token);
      }
      break;
    }
    const ch = seq2[i2];
    if (quoted) {
      if (ch === '"') {
        quoted = false;
        continue;
      }
    } else {
      if (ch === '"') {
        quoted = true;
        continue;
      }
      if (ch === "\\") {
        i2++;
        const ord = parseInt(seq2.slice(i2, i2 + 2), 16);
        if (Number.isNaN(ord)) {
          token += seq2[i2];
        } else {
          i2++;
          token += String.fromCharCode(ord);
        }
        continue;
      }
      if (key === null && ch === "=") {
        key = token;
        token = "";
        continue;
      }
      if (ch === "," || ch === ";" || ch === "+") {
        if (key !== null) {
          result.set(key, token);
        }
        key = null;
        token = "";
        continue;
      }
    }
    if (ch === " " && !quoted) {
      if (token.length === 0) {
        continue;
      }
      if (i2 > nextNonSpace) {
        let j = i2;
        while (seq2[j] === " ") {
          j++;
        }
        nextNonSpace = j;
      }
      if (nextNonSpace >= seq2.length || seq2[nextNonSpace] === "," || seq2[nextNonSpace] === ";" || key === null && seq2[nextNonSpace] === "=" || key !== null && seq2[nextNonSpace] === "+") {
        i2 = nextNonSpace - 1;
        continue;
      }
    }
    token += ch;
  }
  return result;
}
var uuid = {};
Object.defineProperty(uuid, "__esModule", { value: true });
uuid.nil = uuid.UUID = void 0;
const crypto_1$3 = require$$0$1;
const error_1$1 = error;
const invalidName = "options.name must be either a string or a Buffer";
const randomHost = (0, crypto_1$3.randomBytes)(16);
randomHost[0] = randomHost[0] | 1;
const hex2byte = {};
const byte2hex = [];
for (let i2 = 0; i2 < 256; i2++) {
  const hex = (i2 + 256).toString(16).substr(1);
  hex2byte[hex] = i2;
  byte2hex[i2] = hex;
}
class UUID {
  constructor(uuid2) {
    this.ascii = null;
    this.binary = null;
    const check = UUID.check(uuid2);
    if (!check) {
      throw new Error("not a UUID");
    }
    this.version = check.version;
    if (check.format === "ascii") {
      this.ascii = uuid2;
    } else {
      this.binary = uuid2;
    }
  }
  static v5(name, namespace) {
    return uuidNamed(name, "sha1", 80, namespace);
  }
  toString() {
    if (this.ascii == null) {
      this.ascii = stringify(this.binary);
    }
    return this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(uuid2, offset = 0) {
    if (typeof uuid2 === "string") {
      uuid2 = uuid2.toLowerCase();
      if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(uuid2)) {
        return false;
      }
      if (uuid2 === "00000000-0000-0000-0000-000000000000") {
        return { version: void 0, variant: "nil", format: "ascii" };
      }
      return {
        version: (hex2byte[uuid2[14] + uuid2[15]] & 240) >> 4,
        variant: getVariant((hex2byte[uuid2[19] + uuid2[20]] & 224) >> 5),
        format: "ascii"
      };
    }
    if (Buffer.isBuffer(uuid2)) {
      if (uuid2.length < offset + 16) {
        return false;
      }
      let i2 = 0;
      for (; i2 < 16; i2++) {
        if (uuid2[offset + i2] !== 0) {
          break;
        }
      }
      if (i2 === 16) {
        return { version: void 0, variant: "nil", format: "binary" };
      }
      return {
        version: (uuid2[offset + 6] & 240) >> 4,
        variant: getVariant((uuid2[offset + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, error_1$1.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(input) {
    const buffer = Buffer.allocUnsafe(16);
    let j = 0;
    for (let i2 = 0; i2 < 16; i2++) {
      buffer[i2] = hex2byte[input[j++] + input[j++]];
      if (i2 === 3 || i2 === 5 || i2 === 7 || i2 === 9) {
        j += 1;
      }
    }
    return buffer;
  }
}
uuid.UUID = UUID;
UUID.OID = UUID.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function getVariant(bits) {
  switch (bits) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var UuidEncoding;
(function(UuidEncoding2) {
  UuidEncoding2[UuidEncoding2["ASCII"] = 0] = "ASCII";
  UuidEncoding2[UuidEncoding2["BINARY"] = 1] = "BINARY";
  UuidEncoding2[UuidEncoding2["OBJECT"] = 2] = "OBJECT";
})(UuidEncoding || (UuidEncoding = {}));
function uuidNamed(name, hashMethod, version2, namespace, encoding = UuidEncoding.ASCII) {
  const hash = (0, crypto_1$3.createHash)(hashMethod);
  const nameIsNotAString = typeof name !== "string";
  if (nameIsNotAString && !Buffer.isBuffer(name)) {
    throw (0, error_1$1.newError)(invalidName, "ERR_INVALID_UUID_NAME");
  }
  hash.update(namespace);
  hash.update(name);
  const buffer = hash.digest();
  let result;
  switch (encoding) {
    case UuidEncoding.BINARY:
      buffer[6] = buffer[6] & 15 | version2;
      buffer[8] = buffer[8] & 63 | 128;
      result = buffer;
      break;
    case UuidEncoding.OBJECT:
      buffer[6] = buffer[6] & 15 | version2;
      buffer[8] = buffer[8] & 63 | 128;
      result = new UUID(buffer);
      break;
    default:
      result = byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6] & 15 | version2] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8] & 63 | 128] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
      break;
  }
  return result;
}
function stringify(buffer) {
  return byte2hex[buffer[0]] + byte2hex[buffer[1]] + byte2hex[buffer[2]] + byte2hex[buffer[3]] + "-" + byte2hex[buffer[4]] + byte2hex[buffer[5]] + "-" + byte2hex[buffer[6]] + byte2hex[buffer[7]] + "-" + byte2hex[buffer[8]] + byte2hex[buffer[9]] + "-" + byte2hex[buffer[10]] + byte2hex[buffer[11]] + byte2hex[buffer[12]] + byte2hex[buffer[13]] + byte2hex[buffer[14]] + byte2hex[buffer[15]];
}
uuid.nil = new UUID("00000000-0000-0000-0000-000000000000");
var xml = {};
var sax$1 = {};
(function(exports$1) {
  (function(sax2) {
    sax2.parser = function(strict, opt) {
      return new SAXParser(strict, opt);
    };
    sax2.SAXParser = SAXParser;
    sax2.SAXStream = SAXStream;
    sax2.createStream = createStream;
    sax2.MAX_BUFFER_LENGTH = 64 * 1024;
    var buffers = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    sax2.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function SAXParser(strict, opt) {
      if (!(this instanceof SAXParser)) {
        return new SAXParser(strict, opt);
      }
      var parser = this;
      clearBuffers(parser);
      parser.q = parser.c = "";
      parser.bufferCheckPosition = sax2.MAX_BUFFER_LENGTH;
      parser.opt = opt || {};
      parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
      parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
      parser.tags = [];
      parser.closed = parser.closedRoot = parser.sawRoot = false;
      parser.tag = parser.error = null;
      parser.strict = !!strict;
      parser.noscript = !!(strict || parser.opt.noscript);
      parser.state = S.BEGIN;
      parser.strictEntities = parser.opt.strictEntities;
      parser.ENTITIES = parser.strictEntities ? Object.create(sax2.XML_ENTITIES) : Object.create(sax2.ENTITIES);
      parser.attribList = [];
      if (parser.opt.xmlns) {
        parser.ns = Object.create(rootNS);
      }
      if (parser.opt.unquotedAttributeValues === void 0) {
        parser.opt.unquotedAttributeValues = !strict;
      }
      parser.trackPosition = parser.opt.position !== false;
      if (parser.trackPosition) {
        parser.position = parser.line = parser.column = 0;
      }
      emit(parser, "onready");
    }
    if (!Object.create) {
      Object.create = function(o) {
        function F() {
        }
        F.prototype = o;
        var newf = new F();
        return newf;
      };
    }
    if (!Object.keys) {
      Object.keys = function(o) {
        var a = [];
        for (var i2 in o) if (o.hasOwnProperty(i2)) a.push(i2);
        return a;
      };
    }
    function checkBufferLength(parser) {
      var maxAllowed = Math.max(sax2.MAX_BUFFER_LENGTH, 10);
      var maxActual = 0;
      for (var i2 = 0, l = buffers.length; i2 < l; i2++) {
        var len = parser[buffers[i2]].length;
        if (len > maxAllowed) {
          switch (buffers[i2]) {
            case "textNode":
              closeText(parser);
              break;
            case "cdata":
              emitNode(parser, "oncdata", parser.cdata);
              parser.cdata = "";
              break;
            case "script":
              emitNode(parser, "onscript", parser.script);
              parser.script = "";
              break;
            default:
              error2(parser, "Max buffer length exceeded: " + buffers[i2]);
          }
        }
        maxActual = Math.max(maxActual, len);
      }
      var m = sax2.MAX_BUFFER_LENGTH - maxActual;
      parser.bufferCheckPosition = m + parser.position;
    }
    function clearBuffers(parser) {
      for (var i2 = 0, l = buffers.length; i2 < l; i2++) {
        parser[buffers[i2]] = "";
      }
    }
    function flushBuffers(parser) {
      closeText(parser);
      if (parser.cdata !== "") {
        emitNode(parser, "oncdata", parser.cdata);
        parser.cdata = "";
      }
      if (parser.script !== "") {
        emitNode(parser, "onscript", parser.script);
        parser.script = "";
      }
    }
    SAXParser.prototype = {
      end: function() {
        end(this);
      },
      write,
      resume: function() {
        this.error = null;
        return this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        flushBuffers(this);
      }
    };
    var Stream2;
    try {
      Stream2 = require("stream").Stream;
    } catch (ex) {
      Stream2 = function() {
      };
    }
    if (!Stream2) Stream2 = function() {
    };
    var streamWraps = sax2.EVENTS.filter(function(ev) {
      return ev !== "error" && ev !== "end";
    });
    function createStream(strict, opt) {
      return new SAXStream(strict, opt);
    }
    function SAXStream(strict, opt) {
      if (!(this instanceof SAXStream)) {
        return new SAXStream(strict, opt);
      }
      Stream2.apply(this);
      this._parser = new SAXParser(strict, opt);
      this.writable = true;
      this.readable = true;
      var me = this;
      this._parser.onend = function() {
        me.emit("end");
      };
      this._parser.onerror = function(er) {
        me.emit("error", er);
        me._parser.error = null;
      };
      this._decoder = null;
      streamWraps.forEach(function(ev) {
        Object.defineProperty(me, "on" + ev, {
          get: function() {
            return me._parser["on" + ev];
          },
          set: function(h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser["on" + ev] = h;
              return h;
            }
            me.on(ev, h);
          },
          enumerable: true,
          configurable: false
        });
      });
    }
    SAXStream.prototype = Object.create(Stream2.prototype, {
      constructor: {
        value: SAXStream
      }
    });
    SAXStream.prototype.write = function(data) {
      if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
        if (!this._decoder) {
          this._decoder = new TextDecoder("utf8");
        }
        data = this._decoder.decode(data, { stream: true });
      }
      this._parser.write(data.toString());
      this.emit("data", data);
      return true;
    };
    SAXStream.prototype.end = function(chunk) {
      if (chunk && chunk.length) {
        this.write(chunk);
      }
      if (this._decoder) {
        var remaining = this._decoder.decode();
        if (remaining) {
          this._parser.write(remaining);
          this.emit("data", remaining);
        }
      }
      this._parser.end();
      return true;
    };
    SAXStream.prototype.on = function(ev, handler) {
      var me = this;
      if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
        me._parser["on" + ev] = function() {
          var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          args.splice(0, 0, ev);
          me.emit.apply(me, args);
        };
      }
      return Stream2.prototype.on.call(me, ev, handler);
    };
    var CDATA = "[CDATA[";
    var DOCTYPE = "DOCTYPE";
    var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
    var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function isWhitespace2(c) {
      return c === " " || c === "\n" || c === "\r" || c === "	";
    }
    function isQuote(c) {
      return c === '"' || c === "'";
    }
    function isAttribEnd(c) {
      return c === ">" || isWhitespace2(c);
    }
    function isMatch(regex, c) {
      return regex.test(c);
    }
    function notMatch(regex, c) {
      return !isMatch(regex, c);
    }
    var S = 0;
    sax2.STATE = {
      BEGIN: S++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: S++,
      // leading whitespace
      TEXT: S++,
      // general stuff
      TEXT_ENTITY: S++,
      // &amp and such.
      OPEN_WAKA: S++,
      // <
      SGML_DECL: S++,
      // <!BLARG
      SGML_DECL_QUOTED: S++,
      // <!BLARG foo "bar
      DOCTYPE: S++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: S++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: S++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: S++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: S++,
      // <!-
      COMMENT: S++,
      // <!--
      COMMENT_ENDING: S++,
      // <!-- blah -
      COMMENT_ENDED: S++,
      // <!-- blah --
      CDATA: S++,
      // <![CDATA[ something
      CDATA_ENDING: S++,
      // ]
      CDATA_ENDING_2: S++,
      // ]]
      PROC_INST: S++,
      // <?hi
      PROC_INST_BODY: S++,
      // <?hi there
      PROC_INST_ENDING: S++,
      // <?hi "there" ?
      OPEN_TAG: S++,
      // <strong
      OPEN_TAG_SLASH: S++,
      // <strong /
      ATTRIB: S++,
      // <a
      ATTRIB_NAME: S++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: S++,
      // <a foo _
      ATTRIB_VALUE: S++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: S++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: S++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: S++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: S++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: S++,
      // <foo bar=&quot
      CLOSE_TAG: S++,
      // </a
      CLOSE_TAG_SAW_WHITE: S++,
      // </a   >
      SCRIPT: S++,
      // <script> ...
      SCRIPT_ENDING: S++
      // <script> ... <
    };
    sax2.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    };
    sax2.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    };
    Object.keys(sax2.ENTITIES).forEach(function(key) {
      var e = sax2.ENTITIES[key];
      var s2 = typeof e === "number" ? String.fromCharCode(e) : e;
      sax2.ENTITIES[key] = s2;
    });
    for (var s in sax2.STATE) {
      sax2.STATE[sax2.STATE[s]] = s;
    }
    S = sax2.STATE;
    function emit(parser, event, data) {
      parser[event] && parser[event](data);
    }
    function emitNode(parser, nodeType, data) {
      if (parser.textNode) closeText(parser);
      emit(parser, nodeType, data);
    }
    function closeText(parser) {
      parser.textNode = textopts(parser.opt, parser.textNode);
      if (parser.textNode) emit(parser, "ontext", parser.textNode);
      parser.textNode = "";
    }
    function textopts(opt, text) {
      if (opt.trim) text = text.trim();
      if (opt.normalize) text = text.replace(/\s+/g, " ");
      return text;
    }
    function error2(parser, er) {
      closeText(parser);
      if (parser.trackPosition) {
        er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
      }
      er = new Error(er);
      parser.error = er;
      emit(parser, "onerror", er);
      return parser;
    }
    function end(parser) {
      if (parser.sawRoot && !parser.closedRoot)
        strictFail(parser, "Unclosed root tag");
      if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
        error2(parser, "Unexpected end");
      }
      closeText(parser);
      parser.c = "";
      parser.closed = true;
      emit(parser, "onend");
      SAXParser.call(parser, parser.strict, parser.opt);
      return parser;
    }
    function strictFail(parser, message) {
      if (typeof parser !== "object" || !(parser instanceof SAXParser)) {
        throw new Error("bad call to strictFail");
      }
      if (parser.strict) {
        error2(parser, message);
      }
    }
    function newTag(parser) {
      if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
      var parent = parser.tags[parser.tags.length - 1] || parser;
      var tag = parser.tag = { name: parser.tagName, attributes: {} };
      if (parser.opt.xmlns) {
        tag.ns = parent.ns;
      }
      parser.attribList.length = 0;
      emitNode(parser, "onopentagstart", tag);
    }
    function qname(name, attribute) {
      var i2 = name.indexOf(":");
      var qualName = i2 < 0 ? ["", name] : name.split(":");
      var prefix = qualName[0];
      var local = qualName[1];
      if (attribute && name === "xmlns") {
        prefix = "xmlns";
        local = "";
      }
      return { prefix, local };
    }
    function attrib(parser) {
      if (!parser.strict) {
        parser.attribName = parser.attribName[parser.looseCase]();
      }
      if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
        parser.attribName = parser.attribValue = "";
        return;
      }
      if (parser.opt.xmlns) {
        var qn = qname(parser.attribName, true);
        var prefix = qn.prefix;
        var local = qn.local;
        if (prefix === "xmlns") {
          if (local === "xml" && parser.attribValue !== XML_NAMESPACE) {
            strictFail(
              parser,
              "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue
            );
          } else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) {
            strictFail(
              parser,
              "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue
            );
          } else {
            var tag = parser.tag;
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (tag.ns === parent.ns) {
              tag.ns = Object.create(parent.ns);
            }
            tag.ns[local] = parser.attribValue;
          }
        }
        parser.attribList.push([parser.attribName, parser.attribValue]);
      } else {
        parser.tag.attributes[parser.attribName] = parser.attribValue;
        emitNode(parser, "onattribute", {
          name: parser.attribName,
          value: parser.attribValue
        });
      }
      parser.attribName = parser.attribValue = "";
    }
    function openTag(parser, selfClosing) {
      if (parser.opt.xmlns) {
        var tag = parser.tag;
        var qn = qname(parser.tagName);
        tag.prefix = qn.prefix;
        tag.local = qn.local;
        tag.uri = tag.ns[qn.prefix] || "";
        if (tag.prefix && !tag.uri) {
          strictFail(
            parser,
            "Unbound namespace prefix: " + JSON.stringify(parser.tagName)
          );
          tag.uri = qn.prefix;
        }
        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (tag.ns && parent.ns !== tag.ns) {
          Object.keys(tag.ns).forEach(function(p) {
            emitNode(parser, "onopennamespace", {
              prefix: p,
              uri: tag.ns[p]
            });
          });
        }
        for (var i2 = 0, l = parser.attribList.length; i2 < l; i2++) {
          var nv = parser.attribList[i2];
          var name = nv[0];
          var value = nv[1];
          var qualName = qname(name, true);
          var prefix = qualName.prefix;
          var local = qualName.local;
          var uri = prefix === "" ? "" : tag.ns[prefix] || "";
          var a = {
            name,
            value,
            prefix,
            local,
            uri
          };
          if (prefix && prefix !== "xmlns" && !uri) {
            strictFail(
              parser,
              "Unbound namespace prefix: " + JSON.stringify(prefix)
            );
            a.uri = prefix;
          }
          parser.tag.attributes[name] = a;
          emitNode(parser, "onattribute", a);
        }
        parser.attribList.length = 0;
      }
      parser.tag.isSelfClosing = !!selfClosing;
      parser.sawRoot = true;
      parser.tags.push(parser.tag);
      emitNode(parser, "onopentag", parser.tag);
      if (!selfClosing) {
        if (!parser.noscript && parser.tagName.toLowerCase() === "script") {
          parser.state = S.SCRIPT;
        } else {
          parser.state = S.TEXT;
        }
        parser.tag = null;
        parser.tagName = "";
      }
      parser.attribName = parser.attribValue = "";
      parser.attribList.length = 0;
    }
    function closeTag(parser) {
      if (!parser.tagName) {
        strictFail(parser, "Weird empty close tag.");
        parser.textNode += "</>";
        parser.state = S.TEXT;
        return;
      }
      if (parser.script) {
        if (parser.tagName !== "script") {
          parser.script += "</" + parser.tagName + ">";
          parser.tagName = "";
          parser.state = S.SCRIPT;
          return;
        }
        emitNode(parser, "onscript", parser.script);
        parser.script = "";
      }
      var t2 = parser.tags.length;
      var tagName = parser.tagName;
      if (!parser.strict) {
        tagName = tagName[parser.looseCase]();
      }
      var closeTo = tagName;
      while (t2--) {
        var close = parser.tags[t2];
        if (close.name !== closeTo) {
          strictFail(parser, "Unexpected close tag");
        } else {
          break;
        }
      }
      if (t2 < 0) {
        strictFail(parser, "Unmatched closing tag: " + parser.tagName);
        parser.textNode += "</" + parser.tagName + ">";
        parser.state = S.TEXT;
        return;
      }
      parser.tagName = tagName;
      var s2 = parser.tags.length;
      while (s2-- > t2) {
        var tag = parser.tag = parser.tags.pop();
        parser.tagName = parser.tag.name;
        emitNode(parser, "onclosetag", parser.tagName);
        var x = {};
        for (var i2 in tag.ns) {
          x[i2] = tag.ns[i2];
        }
        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (parser.opt.xmlns && tag.ns !== parent.ns) {
          Object.keys(tag.ns).forEach(function(p) {
            var n = tag.ns[p];
            emitNode(parser, "onclosenamespace", { prefix: p, uri: n });
          });
        }
      }
      if (t2 === 0) parser.closedRoot = true;
      parser.tagName = parser.attribValue = parser.attribName = "";
      parser.attribList.length = 0;
      parser.state = S.TEXT;
    }
    function parseEntity(parser) {
      var entity = parser.entity;
      var entityLC = entity.toLowerCase();
      var num;
      var numStr = "";
      if (parser.ENTITIES[entity]) {
        return parser.ENTITIES[entity];
      }
      if (parser.ENTITIES[entityLC]) {
        return parser.ENTITIES[entityLC];
      }
      entity = entityLC;
      if (entity.charAt(0) === "#") {
        if (entity.charAt(1) === "x") {
          entity = entity.slice(2);
          num = parseInt(entity, 16);
          numStr = num.toString(16);
        } else {
          entity = entity.slice(1);
          num = parseInt(entity, 10);
          numStr = num.toString(10);
        }
      }
      entity = entity.replace(/^0+/, "");
      if (isNaN(num) || numStr.toLowerCase() !== entity || num < 0 || num > 1114111) {
        strictFail(parser, "Invalid character entity");
        return "&" + parser.entity + ";";
      }
      return String.fromCodePoint(num);
    }
    function beginWhiteSpace(parser, c) {
      if (c === "<") {
        parser.state = S.OPEN_WAKA;
        parser.startTagPosition = parser.position;
      } else if (!isWhitespace2(c)) {
        strictFail(parser, "Non-whitespace before first tag.");
        parser.textNode = c;
        parser.state = S.TEXT;
      }
    }
    function charAt(chunk, i2) {
      var result = "";
      if (i2 < chunk.length) {
        result = chunk.charAt(i2);
      }
      return result;
    }
    function write(chunk) {
      var parser = this;
      if (this.error) {
        throw this.error;
      }
      if (parser.closed) {
        return error2(
          parser,
          "Cannot write after close. Assign an onready handler."
        );
      }
      if (chunk === null) {
        return end(parser);
      }
      if (typeof chunk === "object") {
        chunk = chunk.toString();
      }
      var i2 = 0;
      var c = "";
      while (true) {
        c = charAt(chunk, i2++);
        parser.c = c;
        if (!c) {
          break;
        }
        if (parser.trackPosition) {
          parser.position++;
          if (c === "\n") {
            parser.line++;
            parser.column = 0;
          } else {
            parser.column++;
          }
        }
        switch (parser.state) {
          case S.BEGIN:
            parser.state = S.BEGIN_WHITESPACE;
            if (c === "\uFEFF") {
              continue;
            }
            beginWhiteSpace(parser, c);
            continue;
          case S.BEGIN_WHITESPACE:
            beginWhiteSpace(parser, c);
            continue;
          case S.TEXT:
            if (parser.sawRoot && !parser.closedRoot) {
              var starti = i2 - 1;
              while (c && c !== "<" && c !== "&") {
                c = charAt(chunk, i2++);
                if (c && parser.trackPosition) {
                  parser.position++;
                  if (c === "\n") {
                    parser.line++;
                    parser.column = 0;
                  } else {
                    parser.column++;
                  }
                }
              }
              parser.textNode += chunk.substring(starti, i2 - 1);
            }
            if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else {
              if (!isWhitespace2(c) && (!parser.sawRoot || parser.closedRoot)) {
                strictFail(parser, "Text data outside of root node.");
              }
              if (c === "&") {
                parser.state = S.TEXT_ENTITY;
              } else {
                parser.textNode += c;
              }
            }
            continue;
          case S.SCRIPT:
            if (c === "<") {
              parser.state = S.SCRIPT_ENDING;
            } else {
              parser.script += c;
            }
            continue;
          case S.SCRIPT_ENDING:
            if (c === "/") {
              parser.state = S.CLOSE_TAG;
            } else {
              parser.script += "<" + c;
              parser.state = S.SCRIPT;
            }
            continue;
          case S.OPEN_WAKA:
            if (c === "!") {
              parser.state = S.SGML_DECL;
              parser.sgmlDecl = "";
            } else if (isWhitespace2(c)) ;
            else if (isMatch(nameStart, c)) {
              parser.state = S.OPEN_TAG;
              parser.tagName = c;
            } else if (c === "/") {
              parser.state = S.CLOSE_TAG;
              parser.tagName = "";
            } else if (c === "?") {
              parser.state = S.PROC_INST;
              parser.procInstName = parser.procInstBody = "";
            } else {
              strictFail(parser, "Unencoded <");
              if (parser.startTagPosition + 1 < parser.position) {
                var pad = parser.position - parser.startTagPosition;
                c = new Array(pad).join(" ") + c;
              }
              parser.textNode += "<" + c;
              parser.state = S.TEXT;
            }
            continue;
          case S.SGML_DECL:
            if (parser.sgmlDecl + c === "--") {
              parser.state = S.COMMENT;
              parser.comment = "";
              parser.sgmlDecl = "";
              continue;
            }
            if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
              parser.state = S.DOCTYPE_DTD;
              parser.doctype += "<!" + parser.sgmlDecl + c;
              parser.sgmlDecl = "";
            } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
              emitNode(parser, "onopencdata");
              parser.state = S.CDATA;
              parser.sgmlDecl = "";
              parser.cdata = "";
            } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
              parser.state = S.DOCTYPE;
              if (parser.doctype || parser.sawRoot) {
                strictFail(
                  parser,
                  "Inappropriately located doctype declaration"
                );
              }
              parser.doctype = "";
              parser.sgmlDecl = "";
            } else if (c === ">") {
              emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
              parser.sgmlDecl = "";
              parser.state = S.TEXT;
            } else if (isQuote(c)) {
              parser.state = S.SGML_DECL_QUOTED;
              parser.sgmlDecl += c;
            } else {
              parser.sgmlDecl += c;
            }
            continue;
          case S.SGML_DECL_QUOTED:
            if (c === parser.q) {
              parser.state = S.SGML_DECL;
              parser.q = "";
            }
            parser.sgmlDecl += c;
            continue;
          case S.DOCTYPE:
            if (c === ">") {
              parser.state = S.TEXT;
              emitNode(parser, "ondoctype", parser.doctype);
              parser.doctype = true;
            } else {
              parser.doctype += c;
              if (c === "[") {
                parser.state = S.DOCTYPE_DTD;
              } else if (isQuote(c)) {
                parser.state = S.DOCTYPE_QUOTED;
                parser.q = c;
              }
            }
            continue;
          case S.DOCTYPE_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.q = "";
              parser.state = S.DOCTYPE;
            }
            continue;
          case S.DOCTYPE_DTD:
            if (c === "]") {
              parser.doctype += c;
              parser.state = S.DOCTYPE;
            } else if (c === "<") {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else if (isQuote(c)) {
              parser.doctype += c;
              parser.state = S.DOCTYPE_DTD_QUOTED;
              parser.q = c;
            } else {
              parser.doctype += c;
            }
            continue;
          case S.DOCTYPE_DTD_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.state = S.DOCTYPE_DTD;
              parser.q = "";
            }
            continue;
          case S.COMMENT:
            if (c === "-") {
              parser.state = S.COMMENT_ENDING;
            } else {
              parser.comment += c;
            }
            continue;
          case S.COMMENT_ENDING:
            if (c === "-") {
              parser.state = S.COMMENT_ENDED;
              parser.comment = textopts(parser.opt, parser.comment);
              if (parser.comment) {
                emitNode(parser, "oncomment", parser.comment);
              }
              parser.comment = "";
            } else {
              parser.comment += "-" + c;
              parser.state = S.COMMENT;
            }
            continue;
          case S.COMMENT_ENDED:
            if (c !== ">") {
              strictFail(parser, "Malformed comment");
              parser.comment += "--" + c;
              parser.state = S.COMMENT;
            } else if (parser.doctype && parser.doctype !== true) {
              parser.state = S.DOCTYPE_DTD;
            } else {
              parser.state = S.TEXT;
            }
            continue;
          case S.CDATA:
            var starti = i2 - 1;
            while (c && c !== "]") {
              c = charAt(chunk, i2++);
              if (c && parser.trackPosition) {
                parser.position++;
                if (c === "\n") {
                  parser.line++;
                  parser.column = 0;
                } else {
                  parser.column++;
                }
              }
            }
            parser.cdata += chunk.substring(starti, i2 - 1);
            if (c === "]") {
              parser.state = S.CDATA_ENDING;
            }
            continue;
          case S.CDATA_ENDING:
            if (c === "]") {
              parser.state = S.CDATA_ENDING_2;
            } else {
              parser.cdata += "]" + c;
              parser.state = S.CDATA;
            }
            continue;
          case S.CDATA_ENDING_2:
            if (c === ">") {
              if (parser.cdata) {
                emitNode(parser, "oncdata", parser.cdata);
              }
              emitNode(parser, "onclosecdata");
              parser.cdata = "";
              parser.state = S.TEXT;
            } else if (c === "]") {
              parser.cdata += "]";
            } else {
              parser.cdata += "]]" + c;
              parser.state = S.CDATA;
            }
            continue;
          case S.PROC_INST:
            if (c === "?") {
              parser.state = S.PROC_INST_ENDING;
            } else if (isWhitespace2(c)) {
              parser.state = S.PROC_INST_BODY;
            } else {
              parser.procInstName += c;
            }
            continue;
          case S.PROC_INST_BODY:
            if (!parser.procInstBody && isWhitespace2(c)) {
              continue;
            } else if (c === "?") {
              parser.state = S.PROC_INST_ENDING;
            } else {
              parser.procInstBody += c;
            }
            continue;
          case S.PROC_INST_ENDING:
            if (c === ">") {
              emitNode(parser, "onprocessinginstruction", {
                name: parser.procInstName,
                body: parser.procInstBody
              });
              parser.procInstName = parser.procInstBody = "";
              parser.state = S.TEXT;
            } else {
              parser.procInstBody += "?" + c;
              parser.state = S.PROC_INST_BODY;
            }
            continue;
          case S.OPEN_TAG:
            if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else {
              newTag(parser);
              if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else {
                if (!isWhitespace2(c)) {
                  strictFail(parser, "Invalid character in tag name");
                }
                parser.state = S.ATTRIB;
              }
            }
            continue;
          case S.OPEN_TAG_SLASH:
            if (c === ">") {
              openTag(parser, true);
              closeTag(parser);
            } else {
              strictFail(
                parser,
                "Forward-slash in opening tag not followed by >"
              );
              parser.state = S.ATTRIB;
            }
            continue;
          case S.ATTRIB:
            if (isWhitespace2(c)) {
              continue;
            } else if (c === ">") {
              openTag(parser);
            } else if (c === "/") {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c;
              parser.attribValue = "";
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, "Invalid attribute name");
            }
            continue;
          case S.ATTRIB_NAME:
            if (c === "=") {
              parser.state = S.ATTRIB_VALUE;
            } else if (c === ">") {
              strictFail(parser, "Attribute without value");
              parser.attribValue = parser.attribName;
              attrib(parser);
              openTag(parser);
            } else if (isWhitespace2(c)) {
              parser.state = S.ATTRIB_NAME_SAW_WHITE;
            } else if (isMatch(nameBody, c)) {
              parser.attribName += c;
            } else {
              strictFail(parser, "Invalid attribute name");
            }
            continue;
          case S.ATTRIB_NAME_SAW_WHITE:
            if (c === "=") {
              parser.state = S.ATTRIB_VALUE;
            } else if (isWhitespace2(c)) {
              continue;
            } else {
              strictFail(parser, "Attribute without value");
              parser.tag.attributes[parser.attribName] = "";
              parser.attribValue = "";
              emitNode(parser, "onattribute", {
                name: parser.attribName,
                value: ""
              });
              parser.attribName = "";
              if (c === ">") {
                openTag(parser);
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
                parser.state = S.ATTRIB;
              }
            }
            continue;
          case S.ATTRIB_VALUE:
            if (isWhitespace2(c)) {
              continue;
            } else if (isQuote(c)) {
              parser.q = c;
              parser.state = S.ATTRIB_VALUE_QUOTED;
            } else {
              if (!parser.opt.unquotedAttributeValues) {
                error2(parser, "Unquoted attribute value");
              }
              parser.state = S.ATTRIB_VALUE_UNQUOTED;
              parser.attribValue = c;
            }
            continue;
          case S.ATTRIB_VALUE_QUOTED:
            if (c !== parser.q) {
              if (c === "&") {
                parser.state = S.ATTRIB_VALUE_ENTITY_Q;
              } else {
                parser.attribValue += c;
              }
              continue;
            }
            attrib(parser);
            parser.q = "";
            parser.state = S.ATTRIB_VALUE_CLOSED;
            continue;
          case S.ATTRIB_VALUE_CLOSED:
            if (isWhitespace2(c)) {
              parser.state = S.ATTRIB;
            } else if (c === ">") {
              openTag(parser);
            } else if (c === "/") {
              parser.state = S.OPEN_TAG_SLASH;
            } else if (isMatch(nameStart, c)) {
              strictFail(parser, "No whitespace between attributes");
              parser.attribName = c;
              parser.attribValue = "";
              parser.state = S.ATTRIB_NAME;
            } else {
              strictFail(parser, "Invalid attribute name");
            }
            continue;
          case S.ATTRIB_VALUE_UNQUOTED:
            if (!isAttribEnd(c)) {
              if (c === "&") {
                parser.state = S.ATTRIB_VALUE_ENTITY_U;
              } else {
                parser.attribValue += c;
              }
              continue;
            }
            attrib(parser);
            if (c === ">") {
              openTag(parser);
            } else {
              parser.state = S.ATTRIB;
            }
            continue;
          case S.CLOSE_TAG:
            if (!parser.tagName) {
              if (isWhitespace2(c)) {
                continue;
              } else if (notMatch(nameStart, c)) {
                if (parser.script) {
                  parser.script += "</" + c;
                  parser.state = S.SCRIPT;
                } else {
                  strictFail(parser, "Invalid tagname in closing tag.");
                }
              } else {
                parser.tagName = c;
              }
            } else if (c === ">") {
              closeTag(parser);
            } else if (isMatch(nameBody, c)) {
              parser.tagName += c;
            } else if (parser.script) {
              parser.script += "</" + parser.tagName + c;
              parser.tagName = "";
              parser.state = S.SCRIPT;
            } else {
              if (!isWhitespace2(c)) {
                strictFail(parser, "Invalid tagname in closing tag");
              }
              parser.state = S.CLOSE_TAG_SAW_WHITE;
            }
            continue;
          case S.CLOSE_TAG_SAW_WHITE:
            if (isWhitespace2(c)) {
              continue;
            }
            if (c === ">") {
              closeTag(parser);
            } else {
              strictFail(parser, "Invalid characters in closing tag");
            }
            continue;
          case S.TEXT_ENTITY:
          case S.ATTRIB_VALUE_ENTITY_Q:
          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState;
            var buffer;
            switch (parser.state) {
              case S.TEXT_ENTITY:
                returnState = S.TEXT;
                buffer = "textNode";
                break;
              case S.ATTRIB_VALUE_ENTITY_Q:
                returnState = S.ATTRIB_VALUE_QUOTED;
                buffer = "attribValue";
                break;
              case S.ATTRIB_VALUE_ENTITY_U:
                returnState = S.ATTRIB_VALUE_UNQUOTED;
                buffer = "attribValue";
                break;
            }
            if (c === ";") {
              var parsedEntity = parseEntity(parser);
              if (parser.opt.unparsedEntities && !Object.values(sax2.XML_ENTITIES).includes(parsedEntity)) {
                parser.entity = "";
                parser.state = returnState;
                parser.write(parsedEntity);
              } else {
                parser[buffer] += parsedEntity;
                parser.entity = "";
                parser.state = returnState;
              }
            } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
              parser.entity += c;
            } else {
              strictFail(parser, "Invalid character in entity name");
              parser[buffer] += "&" + parser.entity + c;
              parser.entity = "";
              parser.state = returnState;
            }
            continue;
          default: {
            throw new Error(parser, "Unknown state: " + parser.state);
          }
        }
      }
      if (parser.position >= parser.bufferCheckPosition) {
        checkBufferLength(parser);
      }
      return parser;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    if (!String.fromCodePoint) {
      (function() {
        var stringFromCharCode2 = String.fromCharCode;
        var floor2 = Math.floor;
        var fromCodePoint = function() {
          var MAX_SIZE = 16384;
          var codeUnits = [];
          var highSurrogate;
          var lowSurrogate;
          var index = -1;
          var length = arguments.length;
          if (!length) {
            return "";
          }
          var result = "";
          while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 1114111 || // not a valid Unicode code point
            floor2(codePoint) !== codePoint) {
              throw RangeError("Invalid code point: " + codePoint);
            }
            if (codePoint <= 65535) {
              codeUnits.push(codePoint);
            } else {
              codePoint -= 65536;
              highSurrogate = (codePoint >> 10) + 55296;
              lowSurrogate = codePoint % 1024 + 56320;
              codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode2.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result;
        };
        if (Object.defineProperty) {
          Object.defineProperty(String, "fromCodePoint", {
            value: fromCodePoint,
            configurable: true,
            writable: true
          });
        } else {
          String.fromCodePoint = fromCodePoint;
        }
      })();
    }
  })(exports$1);
})(sax$1);
Object.defineProperty(xml, "__esModule", { value: true });
xml.XElement = void 0;
xml.parseXml = parseXml;
const sax = sax$1;
const error_1 = error;
class XElement {
  constructor(name) {
    this.name = name;
    this.value = "";
    this.attributes = null;
    this.isCData = false;
    this.elements = null;
    if (!name) {
      throw (0, error_1.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    }
    if (!isValidName(name)) {
      throw (0, error_1.newError)(`Invalid element name: ${name}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
  }
  attribute(name) {
    const result = this.attributes === null ? null : this.attributes[name];
    if (result == null) {
      throw (0, error_1.newError)(`No attribute "${name}"`, "ERR_XML_MISSED_ATTRIBUTE");
    }
    return result;
  }
  removeAttribute(name) {
    if (this.attributes !== null) {
      delete this.attributes[name];
    }
  }
  element(name, ignoreCase = false, errorIfMissed = null) {
    const result = this.elementOrNull(name, ignoreCase);
    if (result === null) {
      throw (0, error_1.newError)(errorIfMissed || `No element "${name}"`, "ERR_XML_MISSED_ELEMENT");
    }
    return result;
  }
  elementOrNull(name, ignoreCase = false) {
    if (this.elements === null) {
      return null;
    }
    for (const element of this.elements) {
      if (isNameEquals(element, name, ignoreCase)) {
        return element;
      }
    }
    return null;
  }
  getElements(name, ignoreCase = false) {
    if (this.elements === null) {
      return [];
    }
    return this.elements.filter((it) => isNameEquals(it, name, ignoreCase));
  }
  elementValueOrEmpty(name, ignoreCase = false) {
    const element = this.elementOrNull(name, ignoreCase);
    return element === null ? "" : element.value;
  }
}
xml.XElement = XElement;
const NAME_REG_EXP = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function isValidName(name) {
  return NAME_REG_EXP.test(name);
}
function isNameEquals(element, name, ignoreCase) {
  const elementName = element.name;
  return elementName === name || ignoreCase === true && elementName.length === name.length && elementName.toLowerCase() === name.toLowerCase();
}
function parseXml(data) {
  let rootElement = null;
  const parser = sax.parser(true, {});
  const elements = [];
  parser.onopentag = (saxElement) => {
    const element = new XElement(saxElement.name);
    element.attributes = saxElement.attributes;
    if (rootElement === null) {
      rootElement = element;
    } else {
      const parent = elements[elements.length - 1];
      if (parent.elements == null) {
        parent.elements = [];
      }
      parent.elements.push(element);
    }
    elements.push(element);
  };
  parser.onclosetag = () => {
    elements.pop();
  };
  parser.ontext = (text) => {
    if (elements.length > 0) {
      elements[elements.length - 1].value = text;
    }
  };
  parser.oncdata = (cdata) => {
    const element = elements[elements.length - 1];
    element.value = cdata;
    element.isCData = true;
  };
  parser.onerror = (err) => {
    throw err;
  };
  parser.write(data);
  return rootElement;
}
(function(exports$1) {
  Object.defineProperty(exports$1, "__esModule", { value: true });
  exports$1.CURRENT_APP_PACKAGE_FILE_NAME = exports$1.CURRENT_APP_INSTALLER_FILE_NAME = exports$1.XElement = exports$1.parseXml = exports$1.UUID = exports$1.parseDn = exports$1.retry = exports$1.githubTagPrefix = exports$1.githubUrl = exports$1.getS3LikeProviderBaseUrl = exports$1.ProgressCallbackTransform = exports$1.MemoLazy = exports$1.safeStringifyJson = exports$1.safeGetHeader = exports$1.parseJson = exports$1.HttpExecutor = exports$1.HttpError = exports$1.DigestTransform = exports$1.createHttpError = exports$1.configureRequestUrl = exports$1.configureRequestOptionsFromUrl = exports$1.configureRequestOptions = exports$1.newError = exports$1.CancellationToken = exports$1.CancellationError = void 0;
  exports$1.asArray = asArray;
  var CancellationToken_12 = CancellationToken$1;
  Object.defineProperty(exports$1, "CancellationError", { enumerable: true, get: function() {
    return CancellationToken_12.CancellationError;
  } });
  Object.defineProperty(exports$1, "CancellationToken", { enumerable: true, get: function() {
    return CancellationToken_12.CancellationToken;
  } });
  var error_12 = error;
  Object.defineProperty(exports$1, "newError", { enumerable: true, get: function() {
    return error_12.newError;
  } });
  var httpExecutor_1 = httpExecutor;
  Object.defineProperty(exports$1, "configureRequestOptions", { enumerable: true, get: function() {
    return httpExecutor_1.configureRequestOptions;
  } });
  Object.defineProperty(exports$1, "configureRequestOptionsFromUrl", { enumerable: true, get: function() {
    return httpExecutor_1.configureRequestOptionsFromUrl;
  } });
  Object.defineProperty(exports$1, "configureRequestUrl", { enumerable: true, get: function() {
    return httpExecutor_1.configureRequestUrl;
  } });
  Object.defineProperty(exports$1, "createHttpError", { enumerable: true, get: function() {
    return httpExecutor_1.createHttpError;
  } });
  Object.defineProperty(exports$1, "DigestTransform", { enumerable: true, get: function() {
    return httpExecutor_1.DigestTransform;
  } });
  Object.defineProperty(exports$1, "HttpError", { enumerable: true, get: function() {
    return httpExecutor_1.HttpError;
  } });
  Object.defineProperty(exports$1, "HttpExecutor", { enumerable: true, get: function() {
    return httpExecutor_1.HttpExecutor;
  } });
  Object.defineProperty(exports$1, "parseJson", { enumerable: true, get: function() {
    return httpExecutor_1.parseJson;
  } });
  Object.defineProperty(exports$1, "safeGetHeader", { enumerable: true, get: function() {
    return httpExecutor_1.safeGetHeader;
  } });
  Object.defineProperty(exports$1, "safeStringifyJson", { enumerable: true, get: function() {
    return httpExecutor_1.safeStringifyJson;
  } });
  var MemoLazy_1 = MemoLazy$1;
  Object.defineProperty(exports$1, "MemoLazy", { enumerable: true, get: function() {
    return MemoLazy_1.MemoLazy;
  } });
  var ProgressCallbackTransform_12 = ProgressCallbackTransform$1;
  Object.defineProperty(exports$1, "ProgressCallbackTransform", { enumerable: true, get: function() {
    return ProgressCallbackTransform_12.ProgressCallbackTransform;
  } });
  var publishOptions_1 = publishOptions;
  Object.defineProperty(exports$1, "getS3LikeProviderBaseUrl", { enumerable: true, get: function() {
    return publishOptions_1.getS3LikeProviderBaseUrl;
  } });
  Object.defineProperty(exports$1, "githubUrl", { enumerable: true, get: function() {
    return publishOptions_1.githubUrl;
  } });
  Object.defineProperty(exports$1, "githubTagPrefix", { enumerable: true, get: function() {
    return publishOptions_1.githubTagPrefix;
  } });
  var retry_1 = retry$1;
  Object.defineProperty(exports$1, "retry", { enumerable: true, get: function() {
    return retry_1.retry;
  } });
  var rfc2253Parser_1 = rfc2253Parser;
  Object.defineProperty(exports$1, "parseDn", { enumerable: true, get: function() {
    return rfc2253Parser_1.parseDn;
  } });
  var uuid_1 = uuid;
  Object.defineProperty(exports$1, "UUID", { enumerable: true, get: function() {
    return uuid_1.UUID;
  } });
  var xml_1 = xml;
  Object.defineProperty(exports$1, "parseXml", { enumerable: true, get: function() {
    return xml_1.parseXml;
  } });
  Object.defineProperty(exports$1, "XElement", { enumerable: true, get: function() {
    return xml_1.XElement;
  } });
  exports$1.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe";
  exports$1.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  function asArray(v) {
    if (v == null) {
      return [];
    } else if (Array.isArray(v)) {
      return v;
    } else {
      return [v];
    }
  }
})(out);
var jsYaml = {};
var loader$1 = {};
var common$5 = {};
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
common$5.isNothing = isNothing;
common$5.isObject = isObject;
common$5.toArray = toArray;
common$5.repeat = repeat;
common$5.isNegativeZero = isNegativeZero;
common$5.extend = extend;
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$4(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$4.prototype = Object.create(Error.prototype);
YAMLException$4.prototype.constructor = YAMLException$4;
YAMLException$4.prototype.toString = function toString2(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$4;
var common$4 = common$5;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common$4.repeat(" ", max - string.length) + string;
}
function makeSnippet$1(mark, options2) {
  options2 = Object.create(options2 || null);
  if (!mark.buffer) return null;
  if (!options2.maxLength) options2.maxLength = 79;
  if (typeof options2.indent !== "number") options2.indent = 1;
  if (typeof options2.linesBefore !== "number") options2.linesBefore = 3;
  if (typeof options2.linesAfter !== "number") options2.linesAfter = 2;
  var re2 = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re2.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i2, line;
  var lineNoLength = Math.min(mark.line + options2.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options2.maxLength - (options2.indent + lineNoLength + 3);
  for (i2 = 1; i2 <= options2.linesBefore; i2++) {
    if (foundLineNo - i2 < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i2],
      lineEnds[foundLineNo - i2],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i2]),
      maxLineLength
    );
    result = common$4.repeat(" ", options2.indent) + padStart((mark.line - i2 + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common$4.repeat(" ", options2.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common$4.repeat("-", options2.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i2 = 1; i2 <= options2.linesAfter; i2++) {
    if (foundLineNo + i2 >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i2],
      lineEnds[foundLineNo + i2],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i2]),
      maxLineLength
    );
    result += common$4.repeat(" ", options2.indent) + padStart((mark.line + i2 + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet$1;
var YAMLException$3 = exception;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style2) {
      map2[style2].forEach(function(alias) {
        result[String(alias)] = style2;
      });
    });
  }
  return result;
}
function Type$e(tag, options2) {
  options2 = options2 || {};
  Object.keys(options2).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException$3('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options2;
  this.tag = tag;
  this.kind = options2["kind"] || null;
  this.resolve = options2["resolve"] || function() {
    return true;
  };
  this.construct = options2["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options2["instanceOf"] || null;
  this.predicate = options2["predicate"] || null;
  this.represent = options2["represent"] || null;
  this.representName = options2["representName"] || null;
  this.defaultStyle = options2["defaultStyle"] || null;
  this.multi = options2["multi"] || false;
  this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException$3('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$e;
var YAMLException$2 = exception;
var Type$d = type;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof Type$d) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new YAMLException$2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type2) {
    if (!(type2 instanceof Type$d)) {
      throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type2.loadKind && type2.loadKind !== "scalar") {
      throw new YAMLException$2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type2.multi) {
      throw new YAMLException$2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type2) {
    if (!(type2 instanceof Type$d)) {
      throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var Type$c = type;
var str = new Type$c("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var Type$b = type;
var seq = new Type$b("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var Type$a = type;
var map = new Type$a("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var Schema = schema;
var failsafe = new Schema({
  explicit: [
    str,
    seq,
    map
  ]
});
var Type$9 = type;
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object2) {
  return object2 === null;
}
var _null = new Type$9("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
var Type$8 = type;
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object2) {
  return Object.prototype.toString.call(object2) === "[object Boolean]";
}
var bool = new Type$8("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object2) {
      return object2 ? "true" : "false";
    },
    uppercase: function(object2) {
      return object2 ? "TRUE" : "FALSE";
    },
    camelcase: function(object2) {
      return object2 ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
var common$3 = common$5;
var Type$7 = type;
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign2 = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign2 = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign2 * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign2 * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign2 * parseInt(value.slice(2), 8);
  }
  return sign2 * parseInt(value, 10);
}
function isInteger(object2) {
  return Object.prototype.toString.call(object2) === "[object Number]" && (object2 % 1 === 0 && !common$3.isNegativeZero(object2));
}
var int = new Type$7("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var common$2 = common$5;
var Type$6 = type;
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign2;
  value = data.replace(/_/g, "").toLowerCase();
  sign2 = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign2 === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign2 * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object2, style2) {
  var res;
  if (isNaN(object2)) {
    switch (style2) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object2) {
    switch (style2) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object2) {
    switch (style2) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common$2.isNegativeZero(object2)) {
    return "-0.0";
  }
  res = object2.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object2) {
  return Object.prototype.toString.call(object2) === "[object Number]" && (object2 % 1 !== 0 || common$2.isNegativeZero(object2));
}
var float = new Type$6("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var Type$5 = type;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object2) {
  return object2.toISOString();
}
var timestamp = new Type$5("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
var Type$4 = type;
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new Type$4("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var Type$3 = type;
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object2) {
  var result = "", bits = 0, idx, tail, max = object2.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object2[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new Type$3("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var Type$2 = type;
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object2 = data;
  for (index = 0, length = object2.length; index < length; index += 1) {
    pair = object2[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new Type$2("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var Type$1 = type;
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object2 = data;
  result = new Array(object2.length);
  for (index = 0, length = object2.length; index < length; index += 1) {
    pair = object2[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object2 = data;
  result = new Array(object2.length);
  for (index = 0, length = object2.length; index < length; index += 1) {
    pair = object2[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new Type$1("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var Type = type;
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object2 = data;
  for (key in object2) {
    if (_hasOwnProperty$2.call(object2, key)) {
      if (object2[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new Type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var common$1 = common$5;
var YAMLException$1 = exception;
var makeSnippet = snippet;
var DEFAULT_SCHEMA$1 = _default;
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object2, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object2, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object2[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options2) {
  this.input = input;
  this.filename = options2["filename"] || null;
  this.schema = options2["schema"] || DEFAULT_SCHEMA$1;
  this.onWarning = options2["onWarning"] || null;
  this.legacy = options2["legacy"] || false;
  this.json = options2["json"] || false;
  this.listener = options2["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = makeSnippet(mark);
  return new YAMLException$1(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major2, minor2;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major2 = parseInt(match[1], 10);
    minor2 = parseInt(match[2], 10);
    if (major2 !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor2 < 2;
    if (minor2 !== 1 && minor2 !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common$1.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common$1.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common$1.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common$1.repeat("\n", emptyLines);
      }
    } else {
      state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options2) {
  input = String(input);
  options2 = options2 || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options2);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll(input, iterator, options2) {
  if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
    options2 = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options2);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load(input, options2) {
  var documents = loadDocuments(input, options2);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException$1("expected a single document in the stream, but found more");
}
loader$1.loadAll = loadAll;
loader$1.load = load;
var dumper$1 = {};
var common = common$5;
var YAMLException = exception;
var DEFAULT_SCHEMA = _default;
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style2, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style2 = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style2)) {
      style2 = type2.styleAliases[style2];
    }
    result[tag] = style2;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1, QUOTING_TYPE_DOUBLE = 2;
function State(options2) {
  this.schema = options2["schema"] || DEFAULT_SCHEMA;
  this.indent = Math.max(1, options2["indent"] || 2);
  this.noArrayIndent = options2["noArrayIndent"] || false;
  this.skipInvalid = options2["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
  this.sortKeys = options2["sortKeys"] || false;
  this.lineWidth = options2["lineWidth"] || 80;
  this.noRefs = options2["noRefs"] || false;
  this.noCompatMode = options2["noCompatMode"] || false;
  this.condenseFlow = options2["condenseFlow"] || false;
  this.quotingType = options2["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options2["forceQuotes"] || false;
  this.replacer = typeof options2["replacer"] === "function" ? options2["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i2;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new YAMLException("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
    char = codePointAt(string, i2);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i2];
      if (char >= 65536) result += string[i2 + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object2) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object2.length; index < length; index += 1) {
    value = object2[index];
    if (state.replacer) {
      value = state.replacer.call(object2, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object2, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object2.length; index < length; index += 1) {
    value = object2[index];
    if (state.replacer) {
      value = state.replacer.call(object2, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object2) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object2), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object2[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object2, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object2, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object2), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new YAMLException("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object2[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object2, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object2, explicit) {
  var _result, typeList, index, length, type2, style2;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object2 === "object" && object2 instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object2))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object2);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style2 = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object2, style2);
        } else if (_hasOwnProperty.call(type2.represent, style2)) {
          _result = type2.represent[style2](object2, style2);
        } else {
          throw new YAMLException("!<" + type2.tag + '> tag resolver accepts not "' + style2 + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object2, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object2;
  if (!detectType(state, object2, false)) {
    detectType(state, object2, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object2);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object2, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object2, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object2, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object2 !== null && typeof object2 === "object") {
    index = objects.indexOf(object2);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object2);
      if (Array.isArray(object2)) {
        for (index = 0, length = object2.length; index < length; index += 1) {
          inspectNode(object2[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object2);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object2[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump(input, options2) {
  options2 = options2 || {};
  var state = new State(options2);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
dumper$1.dump = dump;
var loader = loader$1;
var dumper = dumper$1;
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
jsYaml.Type = type;
jsYaml.Schema = schema;
jsYaml.FAILSAFE_SCHEMA = failsafe;
jsYaml.JSON_SCHEMA = json;
jsYaml.CORE_SCHEMA = core;
jsYaml.DEFAULT_SCHEMA = _default;
jsYaml.load = loader.load;
jsYaml.loadAll = loader.loadAll;
jsYaml.dump = dumper.dump;
jsYaml.YAMLException = exception;
jsYaml.types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
jsYaml.safeLoad = renamed("safeLoad", "load");
jsYaml.safeLoadAll = renamed("safeLoadAll", "loadAll");
jsYaml.safeDump = renamed("safeDump", "dump");
var main = {};
Object.defineProperty(main, "__esModule", { value: true });
main.Lazy = void 0;
class Lazy {
  constructor(creator) {
    this._value = null;
    this.creator = creator;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null) {
      return this._value;
    }
    const result = this.creator();
    this.value = result;
    return result;
  }
  set value(value) {
    this._value = value;
    this.creator = null;
  }
}
main.Lazy = Lazy;
var re$2 = { exports: {} };
const SEMVER_SPEC_VERSION = "2.0.0";
const MAX_LENGTH$1 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991;
const MAX_SAFE_COMPONENT_LENGTH = 16;
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;
const RELEASE_TYPES = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var constants$1 = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const debug$1 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
};
var debug_1 = debug$1;
(function(module, exports$1) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2,
    MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH2,
    MAX_LENGTH: MAX_LENGTH2
  } = constants$1;
  const debug2 = debug_1;
  exports$1 = module.exports = {};
  const re2 = exports$1.re = [];
  const safeRe = exports$1.safeRe = [];
  const src2 = exports$1.src = [];
  const safeSrc = exports$1.safeSrc = [];
  const t2 = exports$1.t = {};
  let R = 0;
  const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  const safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH2],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH2]
  ];
  const makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  const createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug2(name, index, value);
    t2[name] = index;
    src2[index] = value;
    safeSrc[index] = safe;
    re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})\\.(${src2[t2.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src2[t2.NONNUMERICIDENTIFIER]}|${src2[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src2[t2.PRERELEASEIDENTIFIER]}(?:\\.${src2[t2.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src2[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src2[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src2[t2.BUILDIDENTIFIER]}(?:\\.${src2[t2.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src2[t2.MAINVERSION]}${src2[t2.PRERELEASE]}?${src2[t2.BUILD]}?`);
  createToken("FULL", `^${src2[t2.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src2[t2.MAINVERSIONLOOSE]}${src2[t2.PRERELEASELOOSE]}?${src2[t2.BUILD]}?`);
  createToken("LOOSE", `^${src2[t2.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src2[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src2[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:\\.(${src2[t2.XRANGEIDENTIFIER]})(?:${src2[t2.PRERELEASE]})?${src2[t2.BUILD]}?)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src2[t2.XRANGEIDENTIFIERLOOSE]})(?:${src2[t2.PRERELEASELOOSE]})?${src2[t2.BUILD]}?)?)?`);
  createToken("XRANGE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src2[t2.GTLT]}\\s*${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?`);
  createToken("COERCE", `${src2[t2.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src2[t2.COERCEPLAIN] + `(?:${src2[t2.PRERELEASE]})?(?:${src2[t2.BUILD]})?(?:$|[^\\d])`);
  createToken("COERCERTL", src2[t2.COERCE], true);
  createToken("COERCERTLFULL", src2[t2.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src2[t2.LONETILDE]}\\s+`, true);
  exports$1.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src2[t2.LONETILDE]}${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src2[t2.LONECARET]}\\s+`, true);
  exports$1.caretTrimReplace = "$1^";
  createToken("CARET", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src2[t2.LONECARET]}${src2[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src2[t2.GTLT]}\\s*(${src2[t2.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src2[t2.GTLT]}\\s*(${src2[t2.LOOSEPLAIN]}|${src2[t2.XRANGEPLAIN]})`, true);
  exports$1.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src2[t2.XRANGEPLAIN]})\\s+-\\s+(${src2[t2.XRANGEPLAIN]})\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src2[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src2[t2.XRANGEPLAINLOOSE]})\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$2, re$2.exports);
var reExports = re$2.exports;
const looseOption = Object.freeze({ loose: true });
const emptyOpts = Object.freeze({});
const parseOptions$1 = (options2) => {
  if (!options2) {
    return emptyOpts;
  }
  if (typeof options2 !== "object") {
    return looseOption;
  }
  return options2;
};
var parseOptions_1 = parseOptions$1;
const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  if (typeof a === "number" && typeof b === "number") {
    return a === b ? 0 : a < b ? -1 : 1;
  }
  const anum = numeric.test(a);
  const bnum = numeric.test(b);
  if (anum && bnum) {
    a = +a;
    b = +b;
  }
  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};
const debug = debug_1;
const { MAX_LENGTH, MAX_SAFE_INTEGER } = constants$1;
const { safeRe: re$1, t: t$1 } = reExports;
const parseOptions = parseOptions_1;
const { compareIdentifiers } = identifiers$1;
let SemVer$d = class SemVer2 {
  constructor(version2, options2) {
    options2 = parseOptions(options2);
    if (version2 instanceof SemVer2) {
      if (version2.loose === !!options2.loose && version2.includePrerelease === !!options2.includePrerelease) {
        return version2;
      } else {
        version2 = version2.version;
      }
    } else if (typeof version2 !== "string") {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
    }
    if (version2.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      );
    }
    debug("SemVer", version2, options2);
    this.options = options2;
    this.loose = !!options2.loose;
    this.includePrerelease = !!options2.includePrerelease;
    const m = version2.trim().match(options2.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);
    if (!m) {
      throw new TypeError(`Invalid Version: ${version2}`);
    }
    this.raw = version2;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError("Invalid major version");
    }
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError("Invalid minor version");
    }
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError("Invalid patch version");
    }
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split(".").map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num;
          }
        }
        return id;
      });
    }
    this.build = m[5] ? m[5].split(".") : [];
    this.format();
  }
  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join(".")}`;
    }
    return this.version;
  }
  toString() {
    return this.version;
  }
  compare(other) {
    debug("SemVer.compare", this.version, this.options, other);
    if (!(other instanceof SemVer2)) {
      if (typeof other === "string" && other === this.version) {
        return 0;
      }
      other = new SemVer2(other, this.options);
    }
    if (other.version === this.version) {
      return 0;
    }
    return this.compareMain(other) || this.comparePre(other);
  }
  compareMain(other) {
    if (!(other instanceof SemVer2)) {
      other = new SemVer2(other, this.options);
    }
    if (this.major < other.major) {
      return -1;
    }
    if (this.major > other.major) {
      return 1;
    }
    if (this.minor < other.minor) {
      return -1;
    }
    if (this.minor > other.minor) {
      return 1;
    }
    if (this.patch < other.patch) {
      return -1;
    }
    if (this.patch > other.patch) {
      return 1;
    }
    return 0;
  }
  comparePre(other) {
    if (!(other instanceof SemVer2)) {
      other = new SemVer2(other, this.options);
    }
    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }
    let i2 = 0;
    do {
      const a = this.prerelease[i2];
      const b = other.prerelease[i2];
      debug("prerelease compare", i2, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i2);
  }
  compareBuild(other) {
    if (!(other instanceof SemVer2)) {
      other = new SemVer2(other, this.options);
    }
    let i2 = 0;
    do {
      const a = this.build[i2];
      const b = other.build[i2];
      debug("build compare", i2, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i2);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release, identifier, identifierBase) {
    if (release.startsWith("pre")) {
      if (!identifier && identifierBase === false) {
        throw new Error("invalid increment argument: identifier is empty");
      }
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re$1[t$1.PRERELEASELOOSE] : re$1[t$1.PRERELEASE]);
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`);
        }
      }
    }
    switch (release) {
      case "premajor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "preminor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "prepatch":
        this.prerelease.length = 0;
        this.inc("patch", identifier, identifierBase);
        this.inc("pre", identifier, identifierBase);
        break;
      case "prerelease":
        if (this.prerelease.length === 0) {
          this.inc("patch", identifier, identifierBase);
        }
        this.inc("pre", identifier, identifierBase);
        break;
      case "release":
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`);
        }
        this.prerelease.length = 0;
        break;
      case "major":
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case "minor":
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break;
      case "patch":
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break;
      case "pre": {
        const base2 = Number(identifierBase) ? 1 : 0;
        if (this.prerelease.length === 0) {
          this.prerelease = [base2];
        } else {
          let i2 = this.prerelease.length;
          while (--i2 >= 0) {
            if (typeof this.prerelease[i2] === "number") {
              this.prerelease[i2]++;
              i2 = -2;
            }
          }
          if (i2 === -1) {
            if (identifier === this.prerelease.join(".") && identifierBase === false) {
              throw new Error("invalid increment argument: identifier already exists");
            }
            this.prerelease.push(base2);
          }
        }
        if (identifier) {
          let prerelease2 = [identifier, base2];
          if (identifierBase === false) {
            prerelease2 = [identifier];
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease2;
            }
          } else {
            this.prerelease = prerelease2;
          }
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${release}`);
    }
    this.raw = this.format();
    if (this.build.length) {
      this.raw += `+${this.build.join(".")}`;
    }
    return this;
  }
};
var semver$2 = SemVer$d;
const SemVer$c = semver$2;
const parse$6 = (version2, options2, throwErrors = false) => {
  if (version2 instanceof SemVer$c) {
    return version2;
  }
  try {
    return new SemVer$c(version2, options2);
  } catch (er) {
    if (!throwErrors) {
      return null;
    }
    throw er;
  }
};
var parse_1 = parse$6;
const parse$5 = parse_1;
const valid$2 = (version2, options2) => {
  const v = parse$5(version2, options2);
  return v ? v.version : null;
};
var valid_1 = valid$2;
const parse$4 = parse_1;
const clean$1 = (version2, options2) => {
  const s = parse$4(version2.trim().replace(/^[=v]+/, ""), options2);
  return s ? s.version : null;
};
var clean_1 = clean$1;
const SemVer$b = semver$2;
const inc$1 = (version2, release, options2, identifier, identifierBase) => {
  if (typeof options2 === "string") {
    identifierBase = identifier;
    identifier = options2;
    options2 = void 0;
  }
  try {
    return new SemVer$b(
      version2 instanceof SemVer$b ? version2.version : version2,
      options2
    ).inc(release, identifier, identifierBase).version;
  } catch (er) {
    return null;
  }
};
var inc_1 = inc$1;
const parse$3 = parse_1;
const diff$1 = (version1, version2) => {
  const v1 = parse$3(version1, null, true);
  const v2 = parse$3(version2, null, true);
  const comparison = v1.compare(v2);
  if (comparison === 0) {
    return null;
  }
  const v1Higher = comparison > 0;
  const highVersion = v1Higher ? v1 : v2;
  const lowVersion = v1Higher ? v2 : v1;
  const highHasPre = !!highVersion.prerelease.length;
  const lowHasPre = !!lowVersion.prerelease.length;
  if (lowHasPre && !highHasPre) {
    if (!lowVersion.patch && !lowVersion.minor) {
      return "major";
    }
    if (lowVersion.compareMain(highVersion) === 0) {
      if (lowVersion.minor && !lowVersion.patch) {
        return "minor";
      }
      return "patch";
    }
  }
  const prefix = highHasPre ? "pre" : "";
  if (v1.major !== v2.major) {
    return prefix + "major";
  }
  if (v1.minor !== v2.minor) {
    return prefix + "minor";
  }
  if (v1.patch !== v2.patch) {
    return prefix + "patch";
  }
  return "prerelease";
};
var diff_1 = diff$1;
const SemVer$a = semver$2;
const major$1 = (a, loose) => new SemVer$a(a, loose).major;
var major_1 = major$1;
const SemVer$9 = semver$2;
const minor$1 = (a, loose) => new SemVer$9(a, loose).minor;
var minor_1 = minor$1;
const SemVer$8 = semver$2;
const patch$1 = (a, loose) => new SemVer$8(a, loose).patch;
var patch_1 = patch$1;
const parse$2 = parse_1;
const prerelease$1 = (version2, options2) => {
  const parsed = parse$2(version2, options2);
  return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};
var prerelease_1 = prerelease$1;
const SemVer$7 = semver$2;
const compare$b = (a, b, loose) => new SemVer$7(a, loose).compare(new SemVer$7(b, loose));
var compare_1 = compare$b;
const compare$a = compare_1;
const rcompare$1 = (a, b, loose) => compare$a(b, a, loose);
var rcompare_1 = rcompare$1;
const compare$9 = compare_1;
const compareLoose$1 = (a, b) => compare$9(a, b, true);
var compareLoose_1 = compareLoose$1;
const SemVer$6 = semver$2;
const compareBuild$3 = (a, b, loose) => {
  const versionA = new SemVer$6(a, loose);
  const versionB = new SemVer$6(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB);
};
var compareBuild_1 = compareBuild$3;
const compareBuild$2 = compareBuild_1;
const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
var sort_1 = sort$1;
const compareBuild$1 = compareBuild_1;
const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
var rsort_1 = rsort$1;
const compare$8 = compare_1;
const gt$4 = (a, b, loose) => compare$8(a, b, loose) > 0;
var gt_1 = gt$4;
const compare$7 = compare_1;
const lt$3 = (a, b, loose) => compare$7(a, b, loose) < 0;
var lt_1 = lt$3;
const compare$6 = compare_1;
const eq$2 = (a, b, loose) => compare$6(a, b, loose) === 0;
var eq_1 = eq$2;
const compare$5 = compare_1;
const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
var neq_1 = neq$2;
const compare$4 = compare_1;
const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
var gte_1 = gte$3;
const compare$3 = compare_1;
const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
var lte_1 = lte$3;
const eq$1 = eq_1;
const neq$1 = neq_1;
const gt$3 = gt_1;
const gte$2 = gte_1;
const lt$2 = lt_1;
const lte$2 = lte_1;
const cmp$1 = (a, op, b, loose) => {
  switch (op) {
    case "===":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a === b;
    case "!==":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a !== b;
    case "":
    case "=":
    case "==":
      return eq$1(a, b, loose);
    case "!=":
      return neq$1(a, b, loose);
    case ">":
      return gt$3(a, b, loose);
    case ">=":
      return gte$2(a, b, loose);
    case "<":
      return lt$2(a, b, loose);
    case "<=":
      return lte$2(a, b, loose);
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};
var cmp_1 = cmp$1;
const SemVer$5 = semver$2;
const parse$1 = parse_1;
const { safeRe: re, t } = reExports;
const coerce$1 = (version2, options2) => {
  if (version2 instanceof SemVer$5) {
    return version2;
  }
  if (typeof version2 === "number") {
    version2 = String(version2);
  }
  if (typeof version2 !== "string") {
    return null;
  }
  options2 = options2 || {};
  let match = null;
  if (!options2.rtl) {
    match = version2.match(options2.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  } else {
    const coerceRtlRegex = options2.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
    let next;
    while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
      if (!match || next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
    }
    coerceRtlRegex.lastIndex = -1;
  }
  if (match === null) {
    return null;
  }
  const major2 = match[2];
  const minor2 = match[3] || "0";
  const patch2 = match[4] || "0";
  const prerelease2 = options2.includePrerelease && match[5] ? `-${match[5]}` : "";
  const build = options2.includePrerelease && match[6] ? `+${match[6]}` : "";
  return parse$1(`${major2}.${minor2}.${patch2}${prerelease2}${build}`, options2);
};
var coerce_1 = coerce$1;
class LRUCache {
  constructor() {
    this.max = 1e3;
    this.map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      return void 0;
    } else {
      this.map.delete(key);
      this.map.set(key, value);
      return value;
    }
  }
  delete(key) {
    return this.map.delete(key);
  }
  set(key, value) {
    const deleted = this.delete(key);
    if (!deleted && value !== void 0) {
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value;
        this.delete(firstKey);
      }
      this.map.set(key, value);
    }
    return this;
  }
}
var lrucache = LRUCache;
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range2 {
    constructor(range2, options2) {
      options2 = parseOptions2(options2);
      if (range2 instanceof Range2) {
        if (range2.loose === !!options2.loose && range2.includePrerelease === !!options2.includePrerelease) {
          return range2;
        } else {
          return new Range2(range2.raw, options2);
        }
      }
      if (range2 instanceof Comparator2) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options2;
      this.loose = !!options2.loose;
      this.includePrerelease = !!options2.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i2 = 0; i2 < this.set.length; i2++) {
          if (i2 > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i2];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t2.HYPHENRANGELOOSE] : re2[t2.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug2("hyphen replace", range2);
      range2 = range2.replace(re2[t2.COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range2);
      range2 = range2.replace(re2[t2.TILDETRIM], tildeTrimReplace);
      debug2("tilde trim", range2);
      range2 = range2.replace(re2[t2.CARETTRIM], caretTrimReplace);
      debug2("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug2("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t2.COMPARATORLOOSE]);
        });
      }
      debug2("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator2(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range2, options2) {
      if (!(range2 instanceof Range2)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options2) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options2) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options2);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version2) {
      if (!version2) {
        return false;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i2 = 0; i2 < this.set.length; i2++) {
        if (testSet(this.set[i2], version2, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  range = Range2;
  const LRU = lrucache;
  const cache = new LRU();
  const parseOptions2 = parseOptions_1;
  const Comparator2 = requireComparator();
  const debug2 = debug_1;
  const SemVer3 = semver$2;
  const {
    safeRe: re2,
    t: t2,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = reExports;
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants$1;
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options2) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options2);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options2) => {
    comp = comp.replace(re2[t2.BUILD], "");
    debug2("comp", comp, options2);
    comp = replaceCarets(comp, options2);
    debug2("caret", comp);
    comp = replaceTildes(comp, options2);
    debug2("tildes", comp);
    comp = replaceXRanges(comp, options2);
    debug2("xrange", comp);
    comp = replaceStars(comp, options2);
    debug2("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const replaceTildes = (comp, options2) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options2)).join(" ");
  };
  const replaceTilde = (comp, options2) => {
    const r = options2.loose ? re2[t2.TILDELOOSE] : re2[t2.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug2("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug2("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options2) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options2)).join(" ");
  };
  const replaceCaret = (comp, options2) => {
    debug2("caret", comp, options2);
    const r = options2.loose ? re2[t2.CARETLOOSE] : re2[t2.CARET];
    const z = options2.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug2("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug2("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug2("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options2) => {
    debug2("replaceXRanges", comp, options2);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options2)).join(" ");
  };
  const replaceXRange = (comp, options2) => {
    comp = comp.trim();
    const r = options2.loose ? re2[t2.XRANGELOOSE] : re2[t2.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug2("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options2.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug2("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options2) => {
    debug2("replaceStars", comp, options2);
    return comp.trim().replace(re2[t2.STAR], "");
  };
  const replaceGTE0 = (comp, options2) => {
    debug2("replaceGTE0", comp, options2);
    return comp.trim().replace(re2[options2.includePrerelease ? t2.GTE0PRE : t2.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set2, version2, options2) => {
    for (let i2 = 0; i2 < set2.length; i2++) {
      if (!set2[i2].test(version2)) {
        return false;
      }
    }
    if (version2.prerelease.length && !options2.includePrerelease) {
      for (let i2 = 0; i2 < set2.length; i2++) {
        debug2(set2[i2].semver);
        if (set2[i2].semver === Comparator2.ANY) {
          continue;
        }
        if (set2[i2].semver.prerelease.length > 0) {
          const allowed = set2[i2].semver;
          if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY2 = Symbol("SemVer ANY");
  class Comparator2 {
    static get ANY() {
      return ANY2;
    }
    constructor(comp, options2) {
      options2 = parseOptions2(options2);
      if (comp instanceof Comparator2) {
        if (comp.loose === !!options2.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug2("comparator", comp, options2);
      this.options = options2;
      this.loose = !!options2.loose;
      this.parse(comp);
      if (this.semver === ANY2) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t2.COMPARATORLOOSE] : re2[t2.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY2;
      } else {
        this.semver = new SemVer3(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version2) {
      debug2("Comparator.test", version2, this.options.loose);
      if (this.semver === ANY2 || version2 === ANY2) {
        return true;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp2(version2, this.operator, this.semver, this.options);
    }
    intersects(comp, options2) {
      if (!(comp instanceof Comparator2)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range2(comp.value, options2).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range2(this.value, options2).test(comp.semver);
      }
      options2 = parseOptions2(options2);
      if (options2.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options2.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp2(this.semver, "<", comp.semver, options2) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp2(this.semver, ">", comp.semver, options2) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  comparator = Comparator2;
  const parseOptions2 = parseOptions_1;
  const { safeRe: re2, t: t2 } = reExports;
  const cmp2 = cmp_1;
  const debug2 = debug_1;
  const SemVer3 = semver$2;
  const Range2 = requireRange();
  return comparator;
}
const Range$9 = requireRange();
const satisfies$4 = (version2, range2, options2) => {
  try {
    range2 = new Range$9(range2, options2);
  } catch (er) {
    return false;
  }
  return range2.test(version2);
};
var satisfies_1 = satisfies$4;
const Range$8 = requireRange();
const toComparators$1 = (range2, options2) => new Range$8(range2, options2).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
var toComparators_1 = toComparators$1;
const SemVer$4 = semver$2;
const Range$7 = requireRange();
const maxSatisfying$1 = (versions, range2, options2) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$7(range2, options2);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!max || maxSV.compare(v) === -1) {
        max = v;
        maxSV = new SemVer$4(max, options2);
      }
    }
  });
  return max;
};
var maxSatisfying_1 = maxSatisfying$1;
const SemVer$3 = semver$2;
const Range$6 = requireRange();
const minSatisfying$1 = (versions, range2, options2) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$6(range2, options2);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!min || minSV.compare(v) === 1) {
        min = v;
        minSV = new SemVer$3(min, options2);
      }
    }
  });
  return min;
};
var minSatisfying_1 = minSatisfying$1;
const SemVer$2 = semver$2;
const Range$5 = requireRange();
const gt$2 = gt_1;
const minVersion$1 = (range2, loose) => {
  range2 = new Range$5(range2, loose);
  let minver = new SemVer$2("0.0.0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = new SemVer$2("0.0.0-0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = null;
  for (let i2 = 0; i2 < range2.set.length; ++i2) {
    const comparators = range2.set[i2];
    let setMin = null;
    comparators.forEach((comparator2) => {
      const compver = new SemVer$2(comparator2.semver.version);
      switch (comparator2.operator) {
        case ">":
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
        case "":
        case ">=":
          if (!setMin || gt$2(compver, setMin)) {
            setMin = compver;
          }
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${comparator2.operator}`);
      }
    });
    if (setMin && (!minver || gt$2(minver, setMin))) {
      minver = setMin;
    }
  }
  if (minver && range2.test(minver)) {
    return minver;
  }
  return null;
};
var minVersion_1 = minVersion$1;
const Range$4 = requireRange();
const validRange$1 = (range2, options2) => {
  try {
    return new Range$4(range2, options2).range || "*";
  } catch (er) {
    return null;
  }
};
var valid$1 = validRange$1;
const SemVer$1 = semver$2;
const Comparator$2 = requireComparator();
const { ANY: ANY$1 } = Comparator$2;
const Range$3 = requireRange();
const satisfies$3 = satisfies_1;
const gt$1 = gt_1;
const lt$1 = lt_1;
const lte$1 = lte_1;
const gte$1 = gte_1;
const outside$3 = (version2, range2, hilo, options2) => {
  version2 = new SemVer$1(version2, options2);
  range2 = new Range$3(range2, options2);
  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case ">":
      gtfn = gt$1;
      ltefn = lte$1;
      ltfn = lt$1;
      comp = ">";
      ecomp = ">=";
      break;
    case "<":
      gtfn = lt$1;
      ltefn = gte$1;
      ltfn = gt$1;
      comp = "<";
      ecomp = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (satisfies$3(version2, range2, options2)) {
    return false;
  }
  for (let i2 = 0; i2 < range2.set.length; ++i2) {
    const comparators = range2.set[i2];
    let high = null;
    let low = null;
    comparators.forEach((comparator2) => {
      if (comparator2.semver === ANY$1) {
        comparator2 = new Comparator$2(">=0.0.0");
      }
      high = high || comparator2;
      low = low || comparator2;
      if (gtfn(comparator2.semver, high.semver, options2)) {
        high = comparator2;
      } else if (ltfn(comparator2.semver, low.semver, options2)) {
        low = comparator2;
      }
    });
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }
    if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
      return false;
    }
  }
  return true;
};
var outside_1 = outside$3;
const outside$2 = outside_1;
const gtr$1 = (version2, range2, options2) => outside$2(version2, range2, ">", options2);
var gtr_1 = gtr$1;
const outside$1 = outside_1;
const ltr$1 = (version2, range2, options2) => outside$1(version2, range2, "<", options2);
var ltr_1 = ltr$1;
const Range$2 = requireRange();
const intersects$1 = (r1, r2, options2) => {
  r1 = new Range$2(r1, options2);
  r2 = new Range$2(r2, options2);
  return r1.intersects(r2, options2);
};
var intersects_1 = intersects$1;
const satisfies$2 = satisfies_1;
const compare$2 = compare_1;
var simplify = (versions, range2, options2) => {
  const set2 = [];
  let first = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$2(a, b, options2));
  for (const version2 of v) {
    const included = satisfies$2(version2, range2, options2);
    if (included) {
      prev = version2;
      if (!first) {
        first = version2;
      }
    } else {
      if (prev) {
        set2.push([first, prev]);
      }
      prev = null;
      first = null;
    }
  }
  if (first) {
    set2.push([first, null]);
  }
  const ranges = [];
  for (const [min, max] of set2) {
    if (min === max) {
      ranges.push(min);
    } else if (!max && min === v[0]) {
      ranges.push("*");
    } else if (!max) {
      ranges.push(`>=${min}`);
    } else if (min === v[0]) {
      ranges.push(`<=${max}`);
    } else {
      ranges.push(`${min} - ${max}`);
    }
  }
  const simplified = ranges.join(" || ");
  const original = typeof range2.raw === "string" ? range2.raw : String(range2);
  return simplified.length < original.length ? simplified : range2;
};
const Range$1 = requireRange();
const Comparator$1 = requireComparator();
const { ANY } = Comparator$1;
const satisfies$1 = satisfies_1;
const compare$1 = compare_1;
const subset$1 = (sub, dom, options2 = {}) => {
  if (sub === dom) {
    return true;
  }
  sub = new Range$1(sub, options2);
  dom = new Range$1(dom, options2);
  let sawNonNull = false;
  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options2);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub) {
        continue OUTER;
      }
    }
    if (sawNonNull) {
      return false;
    }
  }
  return true;
};
const minimumVersionWithPreRelease = [new Comparator$1(">=0.0.0-0")];
const minimumVersion = [new Comparator$1(">=0.0.0")];
const simpleSubset = (sub, dom, options2) => {
  if (sub === dom) {
    return true;
  }
  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true;
    } else if (options2.includePrerelease) {
      sub = minimumVersionWithPreRelease;
    } else {
      sub = minimumVersion;
    }
  }
  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options2.includePrerelease) {
      return true;
    } else {
      dom = minimumVersion;
    }
  }
  const eqSet = /* @__PURE__ */ new Set();
  let gt2, lt2;
  for (const c of sub) {
    if (c.operator === ">" || c.operator === ">=") {
      gt2 = higherGT(gt2, c, options2);
    } else if (c.operator === "<" || c.operator === "<=") {
      lt2 = lowerLT(lt2, c, options2);
    } else {
      eqSet.add(c.semver);
    }
  }
  if (eqSet.size > 1) {
    return null;
  }
  let gtltComp;
  if (gt2 && lt2) {
    gtltComp = compare$1(gt2.semver, lt2.semver, options2);
    if (gtltComp > 0) {
      return null;
    } else if (gtltComp === 0 && (gt2.operator !== ">=" || lt2.operator !== "<=")) {
      return null;
    }
  }
  for (const eq2 of eqSet) {
    if (gt2 && !satisfies$1(eq2, String(gt2), options2)) {
      return null;
    }
    if (lt2 && !satisfies$1(eq2, String(lt2), options2)) {
      return null;
    }
    for (const c of dom) {
      if (!satisfies$1(eq2, String(c), options2)) {
        return false;
      }
    }
    return true;
  }
  let higher, lower;
  let hasDomLT, hasDomGT;
  let needDomLTPre = lt2 && !options2.includePrerelease && lt2.semver.prerelease.length ? lt2.semver : false;
  let needDomGTPre = gt2 && !options2.includePrerelease && gt2.semver.prerelease.length ? gt2.semver : false;
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt2.operator === "<" && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }
  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
    hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
    if (gt2) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === ">" || c.operator === ">=") {
        higher = higherGT(gt2, c, options2);
        if (higher === c && higher !== gt2) {
          return false;
        }
      } else if (gt2.operator === ">=" && !satisfies$1(gt2.semver, String(c), options2)) {
        return false;
      }
    }
    if (lt2) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === "<" || c.operator === "<=") {
        lower = lowerLT(lt2, c, options2);
        if (lower === c && lower !== lt2) {
          return false;
        }
      } else if (lt2.operator === "<=" && !satisfies$1(lt2.semver, String(c), options2)) {
        return false;
      }
    }
    if (!c.operator && (lt2 || gt2) && gtltComp !== 0) {
      return false;
    }
  }
  if (gt2 && hasDomLT && !lt2 && gtltComp !== 0) {
    return false;
  }
  if (lt2 && hasDomGT && !gt2 && gtltComp !== 0) {
    return false;
  }
  if (needDomGTPre || needDomLTPre) {
    return false;
  }
  return true;
};
const higherGT = (a, b, options2) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options2);
  return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
};
const lowerLT = (a, b, options2) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options2);
  return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
};
var subset_1 = subset$1;
const internalRe = reExports;
const constants = constants$1;
const SemVer = semver$2;
const identifiers = identifiers$1;
const parse = parse_1;
const valid = valid_1;
const clean = clean_1;
const inc = inc_1;
const diff = diff_1;
const major = major_1;
const minor = minor_1;
const patch = patch_1;
const prerelease = prerelease_1;
const compare = compare_1;
const rcompare = rcompare_1;
const compareLoose = compareLoose_1;
const compareBuild = compareBuild_1;
const sort = sort_1;
const rsort = rsort_1;
const gt = gt_1;
const lt = lt_1;
const eq = eq_1;
const neq = neq_1;
const gte = gte_1;
const lte = lte_1;
const cmp = cmp_1;
const coerce = coerce_1;
const Comparator = requireComparator();
const Range = requireRange();
const satisfies = satisfies_1;
const toComparators = toComparators_1;
const maxSatisfying = maxSatisfying_1;
const minSatisfying = minSatisfying_1;
const minVersion = minVersion_1;
const validRange = valid$1;
const outside = outside_1;
const gtr = gtr_1;
const ltr = ltr_1;
const intersects = intersects_1;
const simplifyRange = simplify;
const subset = subset_1;
var semver$1 = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers
};
var DownloadedUpdateHelper$1 = {};
var lodash_isequal = { exports: {} };
lodash_isequal.exports;
(function(module, exports$1) {
  var LARGE_ARRAY_SIZE = 200;
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag2 = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var reRegExpChar2 = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  var freeGlobal2 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf2 = typeof self == "object" && self && self.Object === Object && self;
  var root2 = freeGlobal2 || freeSelf2 || Function("return this")();
  var freeExports = exports$1 && !exports$1.nodeType && exports$1;
  var freeModule = freeExports && true && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal2.process;
  var nodeUtil = function() {
    try {
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  function getValue(object2, key) {
    return object2 == null ? void 0 : object2[key];
  }
  function mapToArray(map2) {
    var index = -1, result = Array(map2.size);
    map2.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  function setToArray(set2) {
    var index = -1, result = Array(set2.size);
    set2.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto2 = Object.prototype;
  var coreJsData = root2["__core-js_shared__"];
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto2.hasOwnProperty;
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  var nativeObjectToString = objectProto2.toString;
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar2, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  var Buffer2 = moduleExports ? root2.Buffer : void 0, Symbol2 = root2.Symbol, Uint8Array2 = root2.Uint8Array, propertyIsEnumerable = objectProto2.propertyIsEnumerable, splice = arrayProto.splice, symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
  var nativeGetSymbols = Object.getOwnPropertySymbols, nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0, nativeKeys = overArg(Object.keys, Object);
  var DataView = getNative(root2, "DataView"), Map2 = getNative(root2, "Map"), Promise2 = getNative(root2, "Promise"), Set2 = getNative(root2, "Set"), WeakMap2 = getNative(root2, "WeakMap"), nativeCreate = getNative(Object, "create");
  var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap2);
  var symbolProto2 = Symbol2 ? Symbol2.prototype : void 0, symbolValueOf = symbolProto2 ? symbolProto2.valueOf : void 0;
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map2 || ListCache)(),
      "string": new Hash()
    };
  }
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache();
    while (++index < length) {
      this.add(values[index]);
    }
  }
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  function stackGet(key) {
    return this.__data__.get(key);
  }
  function stackHas(key) {
    return this.__data__.has(key);
  }
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs2 = data.__data__;
      if (!Map2 || pairs2.length < LARGE_ARRAY_SIZE - 1) {
        pairs2.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs2);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if (hasOwnProperty.call(value, key) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq2(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
    var result = keysFunc(object2);
    return isArray(object2) ? result : arrayPush(result, symbolsFunc(object2));
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString2(value);
  }
  function baseIsArguments(value) {
    return isObjectLike2(value) && baseGetTag(value) == argsTag;
  }
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike2(value) && !isObjectLike2(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object2), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object2), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object2)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
  }
  function baseIsNative(value) {
    if (!isObject2(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseIsTypedArray(value) {
    return isObjectLike2(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  function baseKeys(object2) {
    if (!isPrototype(object2)) {
      return nativeKeys(object2);
    }
    var result = [];
    for (var key in Object(object2)) {
      if (hasOwnProperty.call(object2, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var stacked = stack.get(array);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue2, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
          return false;
        }
        object2 = object2.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object2), new Uint8Array2(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq2(+object2, +other);
      case errorTag:
        return object2.name == other.name && object2.message == other.message;
      case regexpTag:
      case stringTag:
        return object2 == other + "";
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object2.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object2);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object2, other);
        var result = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object2);
        return result;
      case symbolTag2:
        if (symbolValueOf) {
          return symbolValueOf.call(object2) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var stacked = stack.get(object2);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(object2, other);
    stack.set(other, object2);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object2[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object2.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object2);
    stack["delete"](other);
    return result;
  }
  function getAllKeys(object2) {
    return baseGetAllKeys(object2, keys, getSymbols);
  }
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object2, key) {
    var value = getValue(object2, key);
    return baseIsNative(value) ? value : void 0;
  }
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getSymbols = !nativeGetSymbols ? stubArray : function(object2) {
    if (object2 == null) {
      return [];
    }
    object2 = Object(object2);
    return arrayFilter(nativeGetSymbols(object2), function(symbol) {
      return propertyIsEnumerable.call(object2, symbol);
    });
  };
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER2 : length;
    return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  function isKeyable(value) {
    var type2 = typeof value;
    return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto2;
    return value === proto;
  }
  function objectToString2(value) {
    return nativeObjectToString.call(value);
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function eq2(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArguments = baseIsArguments(/* @__PURE__ */ function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike2(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArray = Array.isArray;
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  var isBuffer = nativeIsBuffer || stubFalse;
  function isEqual2(value, other) {
    return baseIsEqual(value, other);
  }
  function isFunction(value) {
    if (!isObject2(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER2;
  }
  function isObject2(value) {
    var type2 = typeof value;
    return value != null && (type2 == "object" || type2 == "function");
  }
  function isObjectLike2(value) {
    return value != null && typeof value == "object";
  }
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  function keys(object2) {
    return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
  }
  function stubArray() {
    return [];
  }
  function stubFalse() {
    return false;
  }
  module.exports = isEqual2;
})(lodash_isequal, lodash_isequal.exports);
var lodash_isequalExports = lodash_isequal.exports;
Object.defineProperty(DownloadedUpdateHelper$1, "__esModule", { value: true });
DownloadedUpdateHelper$1.DownloadedUpdateHelper = void 0;
DownloadedUpdateHelper$1.createTempUpdateFile = createTempUpdateFile;
const crypto_1$2 = require$$0$1;
const fs_1$4 = require$$1$1;
const isEqual = lodash_isequalExports;
const fs_extra_1$6 = lib;
const path$8 = require$$1;
class DownloadedUpdateHelper {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this._file = null;
    this._packageFile = null;
    this.versionInfo = null;
    this.fileInfo = null;
    this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return path$8.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(updateFile, updateInfo, fileInfo, logger) {
    if (this.versionInfo != null && this.file === updateFile && this.fileInfo != null) {
      if (isEqual(this.versionInfo, updateInfo) && isEqual(this.fileInfo.info, fileInfo.info) && await (0, fs_extra_1$6.pathExists)(updateFile)) {
        return updateFile;
      } else {
        return null;
      }
    }
    const cachedUpdateFile = await this.getValidCachedUpdateFile(fileInfo, logger);
    if (cachedUpdateFile === null) {
      return null;
    }
    logger.info(`Update has already been downloaded to ${updateFile}).`);
    this._file = cachedUpdateFile;
    return cachedUpdateFile;
  }
  async setDownloadedFile(downloadedFile, packageFile, versionInfo, fileInfo, updateFileName, isSaveCache) {
    this._file = downloadedFile;
    this._packageFile = packageFile;
    this.versionInfo = versionInfo;
    this.fileInfo = fileInfo;
    this._downloadedFileInfo = {
      fileName: updateFileName,
      sha512: fileInfo.info.sha512,
      isAdminRightsRequired: fileInfo.info.isAdminRightsRequired === true
    };
    if (isSaveCache) {
      await (0, fs_extra_1$6.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
  }
  async clear() {
    this._file = null;
    this._packageFile = null;
    this.versionInfo = null;
    this.fileInfo = null;
    await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, fs_extra_1$6.emptyDir)(this.cacheDirForPendingUpdate);
    } catch (_ignore) {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(fileInfo, logger) {
    const updateInfoFilePath = this.getUpdateInfoFile();
    const doesUpdateInfoFileExist = await (0, fs_extra_1$6.pathExists)(updateInfoFilePath);
    if (!doesUpdateInfoFileExist) {
      return null;
    }
    let cachedInfo;
    try {
      cachedInfo = await (0, fs_extra_1$6.readJson)(updateInfoFilePath);
    } catch (error2) {
      let message = `No cached update info available`;
      if (error2.code !== "ENOENT") {
        await this.cleanCacheDirForPendingUpdate();
        message += ` (error on read: ${error2.message})`;
      }
      logger.info(message);
      return null;
    }
    const isCachedInfoFileNameValid = (cachedInfo === null || cachedInfo === void 0 ? void 0 : cachedInfo.fileName) !== null;
    if (!isCachedInfoFileNameValid) {
      logger.warn(`Cached update info is corrupted: no fileName, directory for cached update will be cleaned`);
      await this.cleanCacheDirForPendingUpdate();
      return null;
    }
    if (fileInfo.info.sha512 !== cachedInfo.sha512) {
      logger.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${cachedInfo.sha512}, expected: ${fileInfo.info.sha512}. Directory for cached update will be cleaned`);
      await this.cleanCacheDirForPendingUpdate();
      return null;
    }
    const updateFile = path$8.join(this.cacheDirForPendingUpdate, cachedInfo.fileName);
    if (!await (0, fs_extra_1$6.pathExists)(updateFile)) {
      logger.info("Cached update file doesn't exist");
      return null;
    }
    const sha512 = await hashFile(updateFile);
    if (fileInfo.info.sha512 !== sha512) {
      logger.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${sha512}, expected: ${fileInfo.info.sha512}`);
      await this.cleanCacheDirForPendingUpdate();
      return null;
    }
    this._downloadedFileInfo = cachedInfo;
    return updateFile;
  }
  getUpdateInfoFile() {
    return path$8.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
DownloadedUpdateHelper$1.DownloadedUpdateHelper = DownloadedUpdateHelper;
function hashFile(file2, algorithm = "sha512", encoding = "base64", options2) {
  return new Promise((resolve, reject) => {
    const hash = (0, crypto_1$2.createHash)(algorithm);
    hash.on("error", reject).setEncoding(encoding);
    (0, fs_1$4.createReadStream)(file2, {
      ...options2,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", reject).on("end", () => {
      hash.end();
      resolve(hash.read());
    }).pipe(hash, { end: false });
  });
}
async function createTempUpdateFile(name, cacheDir, log2) {
  let nameCounter = 0;
  let result = path$8.join(cacheDir, name);
  for (let i2 = 0; i2 < 3; i2++) {
    try {
      await (0, fs_extra_1$6.unlink)(result);
      return result;
    } catch (e) {
      if (e.code === "ENOENT") {
        return result;
      }
      log2.warn(`Error on remove temp update file: ${e}`);
      result = path$8.join(cacheDir, `${nameCounter++}-${name}`);
    }
  }
  return result;
}
var ElectronAppAdapter$1 = {};
var AppAdapter = {};
Object.defineProperty(AppAdapter, "__esModule", { value: true });
AppAdapter.getAppCacheDir = getAppCacheDir;
const path$7 = require$$1;
const os_1$1 = require$$1$2;
function getAppCacheDir() {
  const homedir = (0, os_1$1.homedir)();
  let result;
  if (process.platform === "win32") {
    result = process.env["LOCALAPPDATA"] || path$7.join(homedir, "AppData", "Local");
  } else if (process.platform === "darwin") {
    result = path$7.join(homedir, "Library", "Caches");
  } else {
    result = process.env["XDG_CACHE_HOME"] || path$7.join(homedir, ".cache");
  }
  return result;
}
Object.defineProperty(ElectronAppAdapter$1, "__esModule", { value: true });
ElectronAppAdapter$1.ElectronAppAdapter = void 0;
const path$6 = require$$1;
const AppAdapter_1 = AppAdapter;
class ElectronAppAdapter {
  constructor(app = require$$1$3.app) {
    this.app = app;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === true;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? path$6.join(process.resourcesPath, "app-update.yml") : path$6.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, AppAdapter_1.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(handler) {
    this.app.once("quit", (_, exitCode) => handler(exitCode));
  }
}
ElectronAppAdapter$1.ElectronAppAdapter = ElectronAppAdapter;
var electronHttpExecutor = {};
(function(exports$1) {
  Object.defineProperty(exports$1, "__esModule", { value: true });
  exports$1.ElectronHttpExecutor = exports$1.NET_SESSION_NAME = void 0;
  exports$1.getNetSession = getNetSession;
  const builder_util_runtime_12 = out;
  exports$1.NET_SESSION_NAME = "electron-updater";
  function getNetSession() {
    return require$$1$3.session.fromPartition(exports$1.NET_SESSION_NAME, {
      cache: false
    });
  }
  class ElectronHttpExecutor extends builder_util_runtime_12.HttpExecutor {
    constructor(proxyLoginCallback) {
      super();
      this.proxyLoginCallback = proxyLoginCallback;
      this.cachedSession = null;
    }
    async download(url, destination, options2) {
      return await options2.cancellationToken.createPromise((resolve, reject, onCancel) => {
        const requestOptions = {
          headers: options2.headers || void 0,
          redirect: "manual"
        };
        (0, builder_util_runtime_12.configureRequestUrl)(url, requestOptions);
        (0, builder_util_runtime_12.configureRequestOptions)(requestOptions);
        this.doDownload(requestOptions, {
          destination,
          options: options2,
          onCancel,
          callback: (error2) => {
            if (error2 == null) {
              resolve(destination);
            } else {
              reject(error2);
            }
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(options2, callback) {
      if (options2.headers && options2.headers.Host) {
        options2.host = options2.headers.Host;
        delete options2.headers.Host;
      }
      if (this.cachedSession == null) {
        this.cachedSession = getNetSession();
      }
      const request = require$$1$3.net.request({
        ...options2,
        session: this.cachedSession
      });
      request.on("response", callback);
      if (this.proxyLoginCallback != null) {
        request.on("login", this.proxyLoginCallback);
      }
      return request;
    }
    addRedirectHandlers(request, options2, reject, redirectCount, handler) {
      request.on("redirect", (statusCode, method, redirectUrl) => {
        request.abort();
        if (redirectCount > this.maxRedirects) {
          reject(this.createMaxRedirectError());
        } else {
          handler(builder_util_runtime_12.HttpExecutor.prepareRedirectUrlOptions(redirectUrl, options2));
        }
      });
    }
  }
  exports$1.ElectronHttpExecutor = ElectronHttpExecutor;
})(electronHttpExecutor);
var GenericProvider$1 = {};
var util = {};
Object.defineProperty(util, "__esModule", { value: true });
util.newBaseUrl = newBaseUrl;
util.newUrlFromBase = newUrlFromBase;
util.getChannelFilename = getChannelFilename;
const url_1$6 = require$$2;
function newBaseUrl(url) {
  const result = new url_1$6.URL(url);
  if (!result.pathname.endsWith("/")) {
    result.pathname += "/";
  }
  return result;
}
function newUrlFromBase(pathname, baseUrl, addRandomQueryToAvoidCaching = false) {
  const result = new url_1$6.URL(pathname, baseUrl);
  const search = baseUrl.search;
  if (search != null && search.length !== 0) {
    result.search = search;
  } else if (addRandomQueryToAvoidCaching) {
    result.search = `noCache=${Date.now().toString(32)}`;
  }
  return result;
}
function getChannelFilename(channel) {
  return `${channel}.yml`;
}
var Provider$1 = {};
var symbolTag = "[object Symbol]";
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
var Symbol$1 = root.Symbol;
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
function isObjectLike(value) {
  return !!value && typeof value == "object";
}
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
}
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function escapeRegExp$2(string) {
  string = toString(string);
  return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
}
var lodash_escaperegexp = escapeRegExp$2;
Object.defineProperty(Provider$1, "__esModule", { value: true });
Provider$1.Provider = void 0;
Provider$1.findFile = findFile;
Provider$1.parseUpdateInfo = parseUpdateInfo;
Provider$1.getFileList = getFileList;
Provider$1.resolveFiles = resolveFiles;
const builder_util_runtime_1$f = out;
const js_yaml_1$2 = jsYaml;
const url_1$5 = require$$2;
const util_1$6 = util;
const escapeRegExp$1 = lodash_escaperegexp;
class Provider {
  constructor(runtimeOptions) {
    this.runtimeOptions = runtimeOptions;
    this.requestHeaders = null;
    this.executor = runtimeOptions.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl = null) {
    const newBlockMapUrl = (0, util_1$6.newUrlFromBase)(`${baseUrl.pathname}.blockmap`, baseUrl);
    const oldBlockMapUrl = (0, util_1$6.newUrlFromBase)(`${baseUrl.pathname.replace(new RegExp(escapeRegExp$1(newVersion), "g"), oldVersion)}.blockmap`, oldBlockMapFileBaseUrl ? new url_1$5.URL(oldBlockMapFileBaseUrl) : baseUrl);
    return [oldBlockMapUrl, newBlockMapUrl];
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== false;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const arch = process.env["TEST_UPDATER_ARCH"] || process.arch;
      const archSuffix = arch === "x64" ? "" : `-${arch}`;
      return "-linux" + archSuffix;
    } else {
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(channel) {
    return `${channel}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(value) {
    this.requestHeaders = value;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(url, headers, cancellationToken) {
    return this.executor.request(this.createRequestOptions(url, headers), cancellationToken);
  }
  createRequestOptions(url, headers) {
    const result = {};
    if (this.requestHeaders == null) {
      if (headers != null) {
        result.headers = headers;
      }
    } else {
      result.headers = headers == null ? this.requestHeaders : { ...this.requestHeaders, ...headers };
    }
    (0, builder_util_runtime_1$f.configureRequestUrl)(url, result);
    return result;
  }
}
Provider$1.Provider = Provider;
function findFile(files, extension, not) {
  var _a;
  if (files.length === 0) {
    throw (0, builder_util_runtime_1$f.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  const filteredFiles = files.filter((it) => it.url.pathname.toLowerCase().endsWith(`.${extension.toLowerCase()}`));
  const result = (_a = filteredFiles.find((it) => [it.url.pathname, it.info.url].some((n) => n.includes(process.arch)))) !== null && _a !== void 0 ? _a : filteredFiles.shift();
  if (result) {
    return result;
  } else if (not == null) {
    return files[0];
  } else {
    return files.find((fileInfo) => !not.some((ext) => fileInfo.url.pathname.toLowerCase().endsWith(`.${ext.toLowerCase()}`)));
  }
}
function parseUpdateInfo(rawData, channelFile, channelFileUrl) {
  if (rawData == null) {
    throw (0, builder_util_runtime_1$f.newError)(`Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  let result;
  try {
    result = (0, js_yaml_1$2.load)(rawData);
  } catch (e) {
    throw (0, builder_util_runtime_1$f.newError)(`Cannot parse update info from ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}, rawData: ${rawData}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return result;
}
function getFileList(updateInfo) {
  const files = updateInfo.files;
  if (files != null && files.length > 0) {
    return files;
  }
  if (updateInfo.path != null) {
    return [
      {
        url: updateInfo.path,
        sha2: updateInfo.sha2,
        sha512: updateInfo.sha512
      }
    ];
  } else {
    throw (0, builder_util_runtime_1$f.newError)(`No files provided: ${(0, builder_util_runtime_1$f.safeStringifyJson)(updateInfo)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
}
function resolveFiles(updateInfo, baseUrl, pathTransformer = (p) => p) {
  const files = getFileList(updateInfo);
  const result = files.map((fileInfo) => {
    if (fileInfo.sha2 == null && fileInfo.sha512 == null) {
      throw (0, builder_util_runtime_1$f.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, builder_util_runtime_1$f.safeStringifyJson)(fileInfo)}`, "ERR_UPDATER_NO_CHECKSUM");
    }
    return {
      url: (0, util_1$6.newUrlFromBase)(pathTransformer(fileInfo.url), baseUrl),
      info: fileInfo
    };
  });
  const packages = updateInfo.packages;
  const packageInfo = packages == null ? null : packages[process.arch] || packages.ia32;
  if (packageInfo != null) {
    result[0].packageInfo = {
      ...packageInfo,
      path: (0, util_1$6.newUrlFromBase)(pathTransformer(packageInfo.path), baseUrl).href
    };
  }
  return result;
}
Object.defineProperty(GenericProvider$1, "__esModule", { value: true });
GenericProvider$1.GenericProvider = void 0;
const builder_util_runtime_1$e = out;
const util_1$5 = util;
const Provider_1$b = Provider$1;
class GenericProvider extends Provider_1$b.Provider {
  constructor(configuration, updater, runtimeOptions) {
    super(runtimeOptions);
    this.configuration = configuration;
    this.updater = updater;
    this.baseUrl = (0, util_1$5.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const result = this.updater.channel || this.configuration.channel;
    return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
  }
  async getLatestVersion() {
    const channelFile = (0, util_1$5.getChannelFilename)(this.channel);
    const channelUrl = (0, util_1$5.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let attemptNumber = 0; ; attemptNumber++) {
      try {
        return (0, Provider_1$b.parseUpdateInfo)(await this.httpRequest(channelUrl), channelFile, channelUrl);
      } catch (e) {
        if (e instanceof builder_util_runtime_1$e.HttpError && e.statusCode === 404) {
          throw (0, builder_util_runtime_1$e.newError)(`Cannot find channel "${channelFile}" update info: ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        } else if (e.code === "ECONNREFUSED") {
          if (attemptNumber < 3) {
            await new Promise((resolve, reject) => {
              try {
                setTimeout(resolve, 1e3 * attemptNumber);
              } catch (e2) {
                reject(e2);
              }
            });
            continue;
          }
        }
        throw e;
      }
    }
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$b.resolveFiles)(updateInfo, this.baseUrl);
  }
}
GenericProvider$1.GenericProvider = GenericProvider;
var providerFactory = {};
var BitbucketProvider$1 = {};
Object.defineProperty(BitbucketProvider$1, "__esModule", { value: true });
BitbucketProvider$1.BitbucketProvider = void 0;
const builder_util_runtime_1$d = out;
const util_1$4 = util;
const Provider_1$a = Provider$1;
class BitbucketProvider extends Provider_1$a.Provider {
  constructor(configuration, updater, runtimeOptions) {
    super({
      ...runtimeOptions,
      isUseMultipleRangeRequest: false
    });
    this.configuration = configuration;
    this.updater = updater;
    const { owner, slug } = configuration;
    this.baseUrl = (0, util_1$4.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${owner}/${slug}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const cancellationToken = new builder_util_runtime_1$d.CancellationToken();
    const channelFile = (0, util_1$4.getChannelFilename)(this.getCustomChannelName(this.channel));
    const channelUrl = (0, util_1$4.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const updateInfo = await this.httpRequest(channelUrl, void 0, cancellationToken);
      return (0, Provider_1$a.parseUpdateInfo)(updateInfo, channelFile, channelUrl);
    } catch (e) {
      throw (0, builder_util_runtime_1$d.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$a.resolveFiles)(updateInfo, this.baseUrl);
  }
  toString() {
    const { owner, slug } = this.configuration;
    return `Bitbucket (owner: ${owner}, slug: ${slug}, channel: ${this.channel})`;
  }
}
BitbucketProvider$1.BitbucketProvider = BitbucketProvider;
var GitHubProvider$1 = {};
Object.defineProperty(GitHubProvider$1, "__esModule", { value: true });
GitHubProvider$1.GitHubProvider = GitHubProvider$1.BaseGitHubProvider = void 0;
GitHubProvider$1.computeReleaseNotes = computeReleaseNotes;
const builder_util_runtime_1$c = out;
const semver = semver$1;
const url_1$4 = require$$2;
const util_1$3 = util;
const Provider_1$9 = Provider$1;
const hrefRegExp = /\/tag\/([^/]+)$/;
class BaseGitHubProvider extends Provider_1$9.Provider {
  constructor(options2, defaultHost, runtimeOptions) {
    super({
      ...runtimeOptions,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: false
    });
    this.options = options2;
    this.baseUrl = (0, util_1$3.newBaseUrl)((0, builder_util_runtime_1$c.githubUrl)(options2, defaultHost));
    const apiHost = defaultHost === "github.com" ? "api.github.com" : defaultHost;
    this.baseApiUrl = (0, util_1$3.newBaseUrl)((0, builder_util_runtime_1$c.githubUrl)(options2, apiHost));
  }
  computeGithubBasePath(result) {
    const host = this.options.host;
    return host && !["github.com", "api.github.com"].includes(host) ? `/api/v3${result}` : result;
  }
}
GitHubProvider$1.BaseGitHubProvider = BaseGitHubProvider;
class GitHubProvider extends BaseGitHubProvider {
  constructor(options2, updater, runtimeOptions) {
    super(options2, "github.com", runtimeOptions);
    this.options = options2;
    this.updater = updater;
  }
  get channel() {
    const result = this.updater.channel || this.options.channel;
    return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
  }
  async getLatestVersion() {
    var _a, _b, _c, _d, _e;
    const cancellationToken = new builder_util_runtime_1$c.CancellationToken();
    const feedXml = await this.httpRequest((0, util_1$3.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, cancellationToken);
    const feed = (0, builder_util_runtime_1$c.parseXml)(feedXml);
    let latestRelease = feed.element("entry", false, `No published versions on GitHub`);
    let tag = null;
    try {
      if (this.updater.allowPrerelease) {
        const currentChannel = ((_a = this.updater) === null || _a === void 0 ? void 0 : _a.channel) || ((_b = semver.prerelease(this.updater.currentVersion)) === null || _b === void 0 ? void 0 : _b[0]) || null;
        if (currentChannel === null) {
          tag = hrefRegExp.exec(latestRelease.element("link").attribute("href"))[1];
        } else {
          for (const element of feed.getElements("entry")) {
            const hrefElement = hrefRegExp.exec(element.element("link").attribute("href"));
            if (hrefElement === null) {
              continue;
            }
            const hrefTag = hrefElement[1];
            const hrefChannel = ((_c = semver.prerelease(hrefTag)) === null || _c === void 0 ? void 0 : _c[0]) || null;
            const shouldFetchVersion = !currentChannel || ["alpha", "beta"].includes(currentChannel);
            const isCustomChannel = hrefChannel !== null && !["alpha", "beta"].includes(String(hrefChannel));
            const channelMismatch = currentChannel === "beta" && hrefChannel === "alpha";
            if (shouldFetchVersion && !isCustomChannel && !channelMismatch) {
              tag = hrefTag;
              break;
            }
            const isNextPreRelease = hrefChannel && hrefChannel === currentChannel;
            if (isNextPreRelease) {
              tag = hrefTag;
              break;
            }
          }
        }
      } else {
        tag = await this.getLatestTagName(cancellationToken);
        for (const element of feed.getElements("entry")) {
          if (hrefRegExp.exec(element.element("link").attribute("href"))[1] === tag) {
            latestRelease = element;
            break;
          }
        }
      }
    } catch (e) {
      throw (0, builder_util_runtime_1$c.newError)(`Cannot parse releases feed: ${e.stack || e.message},
XML:
${feedXml}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (tag == null) {
      throw (0, builder_util_runtime_1$c.newError)(`No published versions on GitHub`, "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    }
    let rawData;
    let channelFile = "";
    let channelFileUrl = "";
    const fetchData = async (channelName) => {
      channelFile = (0, util_1$3.getChannelFilename)(channelName);
      channelFileUrl = (0, util_1$3.newUrlFromBase)(this.getBaseDownloadPath(String(tag), channelFile), this.baseUrl);
      const requestOptions = this.createRequestOptions(channelFileUrl);
      try {
        return await this.executor.request(requestOptions, cancellationToken);
      } catch (e) {
        if (e instanceof builder_util_runtime_1$c.HttpError && e.statusCode === 404) {
          throw (0, builder_util_runtime_1$c.newError)(`Cannot find ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        }
        throw e;
      }
    };
    try {
      let channel = this.channel;
      if (this.updater.allowPrerelease && ((_d = semver.prerelease(tag)) === null || _d === void 0 ? void 0 : _d[0])) {
        channel = this.getCustomChannelName(String((_e = semver.prerelease(tag)) === null || _e === void 0 ? void 0 : _e[0]));
      }
      rawData = await fetchData(channel);
    } catch (e) {
      if (this.updater.allowPrerelease) {
        rawData = await fetchData(this.getDefaultChannelName());
      } else {
        throw e;
      }
    }
    const result = (0, Provider_1$9.parseUpdateInfo)(rawData, channelFile, channelFileUrl);
    if (result.releaseName == null) {
      result.releaseName = latestRelease.elementValueOrEmpty("title");
    }
    if (result.releaseNotes == null) {
      result.releaseNotes = computeReleaseNotes(this.updater.currentVersion, this.updater.fullChangelog, feed, latestRelease);
    }
    return {
      tag,
      ...result
    };
  }
  async getLatestTagName(cancellationToken) {
    const options2 = this.options;
    const url = options2.host == null || options2.host === "github.com" ? (0, util_1$3.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new url_1$4.URL(`${this.computeGithubBasePath(`/repos/${options2.owner}/${options2.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const rawData = await this.httpRequest(url, { Accept: "application/json" }, cancellationToken);
      if (rawData == null) {
        return null;
      }
      const releaseInfo = JSON.parse(rawData);
      return releaseInfo.tag_name;
    } catch (e) {
      throw (0, builder_util_runtime_1$c.newError)(`Unable to find latest version on GitHub (${url}), please ensure a production release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$9.resolveFiles)(updateInfo, this.baseUrl, (p) => this.getBaseDownloadPath(updateInfo.tag, p.replace(/ /g, "-")));
  }
  getBaseDownloadPath(tag, fileName) {
    return `${this.basePath}/download/${tag}/${fileName}`;
  }
}
GitHubProvider$1.GitHubProvider = GitHubProvider;
function getNoteValue(parent) {
  const result = parent.elementValueOrEmpty("content");
  return result === "No content." ? "" : result;
}
function computeReleaseNotes(currentVersion, isFullChangelog, feed, latestRelease) {
  if (!isFullChangelog) {
    return getNoteValue(latestRelease);
  }
  const releaseNotes = [];
  for (const release of feed.getElements("entry")) {
    const versionRelease = /\/tag\/v?([^/]+)$/.exec(release.element("link").attribute("href"))[1];
    if (semver.valid(versionRelease) && semver.lt(currentVersion, versionRelease)) {
      releaseNotes.push({
        version: versionRelease,
        note: getNoteValue(release)
      });
    }
  }
  return releaseNotes.sort((a, b) => semver.rcompare(a.version, b.version));
}
var GitLabProvider$1 = {};
Object.defineProperty(GitLabProvider$1, "__esModule", { value: true });
GitLabProvider$1.GitLabProvider = void 0;
const builder_util_runtime_1$b = out;
const url_1$3 = require$$2;
const escapeRegExp = lodash_escaperegexp;
const util_1$2 = util;
const Provider_1$8 = Provider$1;
class GitLabProvider extends Provider_1$8.Provider {
  /**
   * Normalizes filenames by replacing spaces and underscores with dashes.
   *
   * This is a workaround to handle filename formatting differences between tools:
   * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
   * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
   *
   * Because of this mismatch, we can't reliably extract the correct filename from
   * the asset path without normalization. This function ensures consistent matching
   * across different filename formats by converting all spaces and underscores to dashes.
   *
   * @param filename The filename to normalize
   * @returns The normalized filename with spaces and underscores replaced by dashes
   */
  normalizeFilename(filename) {
    return filename.replace(/ |_/g, "-");
  }
  constructor(options2, updater, runtimeOptions) {
    super({
      ...runtimeOptions,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: false
    });
    this.options = options2;
    this.updater = updater;
    this.cachedLatestVersion = null;
    const defaultHost = "gitlab.com";
    const host = options2.host || defaultHost;
    this.baseApiUrl = (0, util_1$2.newBaseUrl)(`https://${host}/api/v4`);
  }
  get channel() {
    const result = this.updater.channel || this.options.channel;
    return result == null ? this.getDefaultChannelName() : this.getCustomChannelName(result);
  }
  async getLatestVersion() {
    const cancellationToken = new builder_util_runtime_1$b.CancellationToken();
    const latestReleaseUrl = (0, util_1$2.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
    let latestRelease;
    try {
      const header = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
      const releaseResponse = await this.httpRequest(latestReleaseUrl, header, cancellationToken);
      if (!releaseResponse) {
        throw (0, builder_util_runtime_1$b.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      }
      latestRelease = JSON.parse(releaseResponse);
    } catch (e) {
      throw (0, builder_util_runtime_1$b.newError)(`Unable to find latest release on GitLab (${latestReleaseUrl}): ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    const tag = latestRelease.tag_name;
    let rawData = null;
    let channelFile = "";
    let channelFileUrl = null;
    const fetchChannelData = async (channelName) => {
      channelFile = (0, util_1$2.getChannelFilename)(channelName);
      const channelAsset = latestRelease.assets.links.find((asset) => asset.name === channelFile);
      if (!channelAsset) {
        throw (0, builder_util_runtime_1$b.newError)(`Cannot find ${channelFile} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      }
      channelFileUrl = new url_1$3.URL(channelAsset.direct_asset_url);
      const headers = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
      try {
        const result2 = await this.httpRequest(channelFileUrl, headers, cancellationToken);
        if (!result2) {
          throw (0, builder_util_runtime_1$b.newError)(`Empty response from ${channelFileUrl}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        }
        return result2;
      } catch (e) {
        if (e instanceof builder_util_runtime_1$b.HttpError && e.statusCode === 404) {
          throw (0, builder_util_runtime_1$b.newError)(`Cannot find ${channelFile} in the latest release artifacts (${channelFileUrl}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        }
        throw e;
      }
    };
    try {
      rawData = await fetchChannelData(this.channel);
    } catch (e) {
      if (this.channel !== this.getDefaultChannelName()) {
        rawData = await fetchChannelData(this.getDefaultChannelName());
      } else {
        throw e;
      }
    }
    if (!rawData) {
      throw (0, builder_util_runtime_1$b.newError)(`Unable to parse channel data from ${channelFile}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    const result = (0, Provider_1$8.parseUpdateInfo)(rawData, channelFile, channelFileUrl);
    if (result.releaseName == null) {
      result.releaseName = latestRelease.name;
    }
    if (result.releaseNotes == null) {
      result.releaseNotes = latestRelease.description || null;
    }
    const assetsMap = /* @__PURE__ */ new Map();
    for (const asset of latestRelease.assets.links) {
      assetsMap.set(this.normalizeFilename(asset.name), asset.direct_asset_url);
    }
    const gitlabUpdateInfo = {
      tag,
      assets: assetsMap,
      ...result
    };
    this.cachedLatestVersion = gitlabUpdateInfo;
    return gitlabUpdateInfo;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(assets) {
    const assetsMap = /* @__PURE__ */ new Map();
    for (const asset of assets.links) {
      assetsMap.set(this.normalizeFilename(asset.name), asset.direct_asset_url);
    }
    return assetsMap;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(assets, filename) {
    const possibleBlockMapNames = [`${filename}.blockmap`, `${this.normalizeFilename(filename)}.blockmap`];
    for (const blockMapName of possibleBlockMapNames) {
      const assetUrl = assets.get(blockMapName);
      if (assetUrl) {
        return new url_1$3.URL(assetUrl);
      }
    }
    return null;
  }
  async fetchReleaseInfoByVersion(version2) {
    const cancellationToken = new builder_util_runtime_1$b.CancellationToken();
    const possibleReleaseIds = [`v${version2}`, version2];
    for (const releaseId of possibleReleaseIds) {
      const releaseUrl = (0, util_1$2.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(releaseId)}`, this.baseApiUrl);
      try {
        const header = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
        const releaseResponse = await this.httpRequest(releaseUrl, header, cancellationToken);
        if (releaseResponse) {
          const release = JSON.parse(releaseResponse);
          return release;
        }
      } catch (e) {
        if (e instanceof builder_util_runtime_1$b.HttpError && e.statusCode === 404) {
          continue;
        }
        throw (0, builder_util_runtime_1$b.newError)(`Unable to find release ${releaseId} on GitLab (${releaseUrl}): ${e.stack || e.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, builder_util_runtime_1$b.newError)(`Unable to find release with version ${version2} (tried: ${possibleReleaseIds.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(token) {
    const headers = {};
    if (token != null) {
      if (token.startsWith("Bearer")) {
        headers.authorization = token;
      } else {
        headers["PRIVATE-TOKEN"] = token;
      }
    }
    return headers;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(version2) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === version2) {
      return this.cachedLatestVersion.assets;
    }
    const versionInfo = await this.fetchReleaseInfoByVersion(version2);
    if (versionInfo && versionInfo.assets) {
      return this.convertAssetsToMap(versionInfo.assets);
    }
    return null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(oldVersion, newVersion, baseFilename) {
    let newBlockMapUrl = null;
    let oldBlockMapUrl = null;
    const newVersionAssets = await this.getVersionInfoForBlockMap(newVersion);
    if (newVersionAssets) {
      newBlockMapUrl = this.findBlockMapInAssets(newVersionAssets, baseFilename);
    }
    const oldVersionAssets = await this.getVersionInfoForBlockMap(oldVersion);
    if (oldVersionAssets) {
      const oldFilename = baseFilename.replace(new RegExp(escapeRegExp(newVersion), "g"), oldVersion);
      oldBlockMapUrl = this.findBlockMapInAssets(oldVersionAssets, oldFilename);
    }
    return [oldBlockMapUrl, newBlockMapUrl];
  }
  async getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl = null) {
    if (this.options.uploadTarget === "project_upload") {
      const baseFilename = baseUrl.pathname.split("/").pop() || "";
      const [oldBlockMapUrl, newBlockMapUrl] = await this.findBlockMapUrlsFromAssets(oldVersion, newVersion, baseFilename);
      if (!newBlockMapUrl) {
        throw (0, builder_util_runtime_1$b.newError)(`Cannot find blockmap file for ${newVersion} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      }
      if (!oldBlockMapUrl) {
        throw (0, builder_util_runtime_1$b.newError)(`Cannot find blockmap file for ${oldVersion} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      }
      return [oldBlockMapUrl, newBlockMapUrl];
    } else {
      return super.getBlockMapFiles(baseUrl, oldVersion, newVersion, oldBlockMapFileBaseUrl);
    }
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$8.getFileList)(updateInfo).map((fileInfo) => {
      const possibleNames = [
        fileInfo.url,
        // Original filename
        this.normalizeFilename(fileInfo.url)
        // Normalized filename (spaces/underscores → dashes)
      ];
      const matchingAssetName = possibleNames.find((name) => updateInfo.assets.has(name));
      const assetUrl = matchingAssetName ? updateInfo.assets.get(matchingAssetName) : void 0;
      if (!assetUrl) {
        throw (0, builder_util_runtime_1$b.newError)(`Cannot find asset "${fileInfo.url}" in GitLab release assets. Available assets: ${Array.from(updateInfo.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      }
      return {
        url: new url_1$3.URL(assetUrl),
        info: fileInfo
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
GitLabProvider$1.GitLabProvider = GitLabProvider;
var KeygenProvider$1 = {};
Object.defineProperty(KeygenProvider$1, "__esModule", { value: true });
KeygenProvider$1.KeygenProvider = void 0;
const builder_util_runtime_1$a = out;
const util_1$1 = util;
const Provider_1$7 = Provider$1;
class KeygenProvider extends Provider_1$7.Provider {
  constructor(configuration, updater, runtimeOptions) {
    super({
      ...runtimeOptions,
      isUseMultipleRangeRequest: false
    });
    this.configuration = configuration;
    this.updater = updater;
    this.defaultHostname = "api.keygen.sh";
    const host = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, util_1$1.newBaseUrl)(`https://${host}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const cancellationToken = new builder_util_runtime_1$a.CancellationToken();
    const channelFile = (0, util_1$1.getChannelFilename)(this.getCustomChannelName(this.channel));
    const channelUrl = (0, util_1$1.newUrlFromBase)(channelFile, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const updateInfo = await this.httpRequest(channelUrl, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, cancellationToken);
      return (0, Provider_1$7.parseUpdateInfo)(updateInfo, channelFile, channelUrl);
    } catch (e) {
      throw (0, builder_util_runtime_1$a.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$7.resolveFiles)(updateInfo, this.baseUrl);
  }
  toString() {
    const { account, product, platform: platform2 } = this.configuration;
    return `Keygen (account: ${account}, product: ${product}, platform: ${platform2}, channel: ${this.channel})`;
  }
}
KeygenProvider$1.KeygenProvider = KeygenProvider;
var PrivateGitHubProvider$1 = {};
Object.defineProperty(PrivateGitHubProvider$1, "__esModule", { value: true });
PrivateGitHubProvider$1.PrivateGitHubProvider = void 0;
const builder_util_runtime_1$9 = out;
const js_yaml_1$1 = jsYaml;
const path$5 = require$$1;
const url_1$2 = require$$2;
const util_1 = util;
const GitHubProvider_1$1 = GitHubProvider$1;
const Provider_1$6 = Provider$1;
class PrivateGitHubProvider extends GitHubProvider_1$1.BaseGitHubProvider {
  constructor(options2, updater, token, runtimeOptions) {
    super(options2, "api.github.com", runtimeOptions);
    this.updater = updater;
    this.token = token;
  }
  createRequestOptions(url, headers) {
    const result = super.createRequestOptions(url, headers);
    result.redirect = "manual";
    return result;
  }
  async getLatestVersion() {
    const cancellationToken = new builder_util_runtime_1$9.CancellationToken();
    const channelFile = (0, util_1.getChannelFilename)(this.getDefaultChannelName());
    const releaseInfo = await this.getLatestVersionInfo(cancellationToken);
    const asset = releaseInfo.assets.find((it) => it.name === channelFile);
    if (asset == null) {
      throw (0, builder_util_runtime_1$9.newError)(`Cannot find ${channelFile} in the release ${releaseInfo.html_url || releaseInfo.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    }
    const url = new url_1$2.URL(asset.url);
    let result;
    try {
      result = (0, js_yaml_1$1.load)(await this.httpRequest(url, this.configureHeaders("application/octet-stream"), cancellationToken));
    } catch (e) {
      if (e instanceof builder_util_runtime_1$9.HttpError && e.statusCode === 404) {
        throw (0, builder_util_runtime_1$9.newError)(`Cannot find ${channelFile} in the latest release artifacts (${url}): ${e.stack || e.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      }
      throw e;
    }
    result.assets = releaseInfo.assets;
    return result;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(accept) {
    return {
      accept,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(cancellationToken) {
    const allowPrerelease = this.updater.allowPrerelease;
    let basePath = this.basePath;
    if (!allowPrerelease) {
      basePath = `${basePath}/latest`;
    }
    const url = (0, util_1.newUrlFromBase)(basePath, this.baseUrl);
    try {
      const version2 = JSON.parse(await this.httpRequest(url, this.configureHeaders("application/vnd.github.v3+json"), cancellationToken));
      if (allowPrerelease) {
        return version2.find((it) => it.prerelease) || version2[0];
      } else {
        return version2;
      }
    } catch (e) {
      throw (0, builder_util_runtime_1$9.newError)(`Unable to find latest version on GitHub (${url}), please ensure a production release exists: ${e.stack || e.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(updateInfo) {
    return (0, Provider_1$6.getFileList)(updateInfo).map((it) => {
      const name = path$5.posix.basename(it.url).replace(/ /g, "-");
      const asset = updateInfo.assets.find((it2) => it2 != null && it2.name === name);
      if (asset == null) {
        throw (0, builder_util_runtime_1$9.newError)(`Cannot find asset "${name}" in: ${JSON.stringify(updateInfo.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      }
      return {
        url: new url_1$2.URL(asset.url),
        info: it
      };
    });
  }
}
PrivateGitHubProvider$1.PrivateGitHubProvider = PrivateGitHubProvider;
Object.defineProperty(providerFactory, "__esModule", { value: true });
providerFactory.isUrlProbablySupportMultiRangeRequests = isUrlProbablySupportMultiRangeRequests;
providerFactory.createClient = createClient;
const builder_util_runtime_1$8 = out;
const BitbucketProvider_1 = BitbucketProvider$1;
const GenericProvider_1$1 = GenericProvider$1;
const GitHubProvider_1 = GitHubProvider$1;
const GitLabProvider_1 = GitLabProvider$1;
const KeygenProvider_1 = KeygenProvider$1;
const PrivateGitHubProvider_1 = PrivateGitHubProvider$1;
function isUrlProbablySupportMultiRangeRequests(url) {
  return !url.includes("s3.amazonaws.com");
}
function createClient(data, updater, runtimeOptions) {
  if (typeof data === "string") {
    throw (0, builder_util_runtime_1$8.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  }
  const provider = data.provider;
  switch (provider) {
    case "github": {
      const githubOptions = data;
      const token = (githubOptions.private ? process.env["GH_TOKEN"] || process.env["GITHUB_TOKEN"] : null) || githubOptions.token;
      if (token == null) {
        return new GitHubProvider_1.GitHubProvider(githubOptions, updater, runtimeOptions);
      } else {
        return new PrivateGitHubProvider_1.PrivateGitHubProvider(githubOptions, updater, token, runtimeOptions);
      }
    }
    case "bitbucket":
      return new BitbucketProvider_1.BitbucketProvider(data, updater, runtimeOptions);
    case "gitlab":
      return new GitLabProvider_1.GitLabProvider(data, updater, runtimeOptions);
    case "keygen":
      return new KeygenProvider_1.KeygenProvider(data, updater, runtimeOptions);
    case "s3":
    case "spaces":
      return new GenericProvider_1$1.GenericProvider({
        provider: "generic",
        url: (0, builder_util_runtime_1$8.getS3LikeProviderBaseUrl)(data),
        channel: data.channel || null
      }, updater, {
        ...runtimeOptions,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: false
      });
    case "generic": {
      const options2 = data;
      return new GenericProvider_1$1.GenericProvider(options2, updater, {
        ...runtimeOptions,
        isUseMultipleRangeRequest: options2.useMultipleRangeRequest !== false && isUrlProbablySupportMultiRangeRequests(options2.url)
      });
    }
    case "custom": {
      const options2 = data;
      const constructor = options2.updateProvider;
      if (!constructor) {
        throw (0, builder_util_runtime_1$8.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      }
      return new constructor(options2, updater, runtimeOptions);
    }
    default:
      throw (0, builder_util_runtime_1$8.newError)(`Unsupported provider: ${provider}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var GenericDifferentialDownloader$1 = {};
var DifferentialDownloader$1 = {};
var DataSplitter$1 = {};
var downloadPlanBuilder = {};
Object.defineProperty(downloadPlanBuilder, "__esModule", { value: true });
downloadPlanBuilder.OperationKind = void 0;
downloadPlanBuilder.computeOperations = computeOperations;
var OperationKind$1;
(function(OperationKind2) {
  OperationKind2[OperationKind2["COPY"] = 0] = "COPY";
  OperationKind2[OperationKind2["DOWNLOAD"] = 1] = "DOWNLOAD";
})(OperationKind$1 || (downloadPlanBuilder.OperationKind = OperationKind$1 = {}));
function computeOperations(oldBlockMap, newBlockMap, logger) {
  const nameToOldBlocks = buildBlockFileMap(oldBlockMap.files);
  const nameToNewBlocks = buildBlockFileMap(newBlockMap.files);
  let lastOperation = null;
  const blockMapFile = newBlockMap.files[0];
  const operations = [];
  const name = blockMapFile.name;
  const oldEntry = nameToOldBlocks.get(name);
  if (oldEntry == null) {
    throw new Error(`no file ${name} in old blockmap`);
  }
  const newFile = nameToNewBlocks.get(name);
  let changedBlockCount = 0;
  const { checksumToOffset: checksumToOldOffset, checksumToOldSize } = buildChecksumMap(nameToOldBlocks.get(name), oldEntry.offset, logger);
  let newOffset = blockMapFile.offset;
  for (let i2 = 0; i2 < newFile.checksums.length; newOffset += newFile.sizes[i2], i2++) {
    const blockSize = newFile.sizes[i2];
    const checksum = newFile.checksums[i2];
    let oldOffset = checksumToOldOffset.get(checksum);
    if (oldOffset != null && checksumToOldSize.get(checksum) !== blockSize) {
      logger.warn(`Checksum ("${checksum}") matches, but size differs (old: ${checksumToOldSize.get(checksum)}, new: ${blockSize})`);
      oldOffset = void 0;
    }
    if (oldOffset === void 0) {
      changedBlockCount++;
      if (lastOperation != null && lastOperation.kind === OperationKind$1.DOWNLOAD && lastOperation.end === newOffset) {
        lastOperation.end += blockSize;
      } else {
        lastOperation = {
          kind: OperationKind$1.DOWNLOAD,
          start: newOffset,
          end: newOffset + blockSize
          // oldBlocks: null,
        };
        validateAndAdd(lastOperation, operations, checksum, i2);
      }
    } else {
      if (lastOperation != null && lastOperation.kind === OperationKind$1.COPY && lastOperation.end === oldOffset) {
        lastOperation.end += blockSize;
      } else {
        lastOperation = {
          kind: OperationKind$1.COPY,
          start: oldOffset,
          end: oldOffset + blockSize
          // oldBlocks: [checksum]
        };
        validateAndAdd(lastOperation, operations, checksum, i2);
      }
    }
  }
  if (changedBlockCount > 0) {
    logger.info(`File${blockMapFile.name === "file" ? "" : " " + blockMapFile.name} has ${changedBlockCount} changed blocks`);
  }
  return operations;
}
const isValidateOperationRange = process.env["DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES"] === "true";
function validateAndAdd(operation, operations, checksum, index) {
  if (isValidateOperationRange && operations.length !== 0) {
    const lastOperation = operations[operations.length - 1];
    if (lastOperation.kind === operation.kind && operation.start < lastOperation.end && operation.start > lastOperation.start) {
      const min = [lastOperation.start, lastOperation.end, operation.start, operation.end].reduce((p, v) => p < v ? p : v);
      throw new Error(`operation (block index: ${index}, checksum: ${checksum}, kind: ${OperationKind$1[operation.kind]}) overlaps previous operation (checksum: ${checksum}):
abs: ${lastOperation.start} until ${lastOperation.end} and ${operation.start} until ${operation.end}
rel: ${lastOperation.start - min} until ${lastOperation.end - min} and ${operation.start - min} until ${operation.end - min}`);
    }
  }
  operations.push(operation);
}
function buildChecksumMap(file2, fileOffset, logger) {
  const checksumToOffset = /* @__PURE__ */ new Map();
  const checksumToSize = /* @__PURE__ */ new Map();
  let offset = fileOffset;
  for (let i2 = 0; i2 < file2.checksums.length; i2++) {
    const checksum = file2.checksums[i2];
    const size = file2.sizes[i2];
    const existing = checksumToSize.get(checksum);
    if (existing === void 0) {
      checksumToOffset.set(checksum, offset);
      checksumToSize.set(checksum, size);
    } else if (logger.debug != null) {
      const sizeExplanation = existing === size ? "(same size)" : `(size: ${existing}, this size: ${size})`;
      logger.debug(`${checksum} duplicated in blockmap ${sizeExplanation}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    offset += size;
  }
  return { checksumToOffset, checksumToOldSize: checksumToSize };
}
function buildBlockFileMap(list) {
  const result = /* @__PURE__ */ new Map();
  for (const item of list) {
    result.set(item.name, item);
  }
  return result;
}
Object.defineProperty(DataSplitter$1, "__esModule", { value: true });
DataSplitter$1.DataSplitter = void 0;
DataSplitter$1.copyData = copyData;
const builder_util_runtime_1$7 = out;
const fs_1$3 = require$$1$1;
const stream_1$1 = require$$0$2;
const downloadPlanBuilder_1$2 = downloadPlanBuilder;
const DOUBLE_CRLF = Buffer.from("\r\n\r\n");
var ReadState;
(function(ReadState2) {
  ReadState2[ReadState2["INIT"] = 0] = "INIT";
  ReadState2[ReadState2["HEADER"] = 1] = "HEADER";
  ReadState2[ReadState2["BODY"] = 2] = "BODY";
})(ReadState || (ReadState = {}));
function copyData(task, out2, oldFileFd, reject, resolve) {
  const readStream = (0, fs_1$3.createReadStream)("", {
    fd: oldFileFd,
    autoClose: false,
    start: task.start,
    // end is inclusive
    end: task.end - 1
  });
  readStream.on("error", reject);
  readStream.once("end", resolve);
  readStream.pipe(out2, {
    end: false
  });
}
class DataSplitter extends stream_1$1.Writable {
  constructor(out2, options2, partIndexToTaskIndex, boundary, partIndexToLength, finishHandler, grandTotalBytes, onProgress) {
    super();
    this.out = out2;
    this.options = options2;
    this.partIndexToTaskIndex = partIndexToTaskIndex;
    this.partIndexToLength = partIndexToLength;
    this.finishHandler = finishHandler;
    this.grandTotalBytes = grandTotalBytes;
    this.onProgress = onProgress;
    this.start = Date.now();
    this.nextUpdate = this.start + 1e3;
    this.transferred = 0;
    this.delta = 0;
    this.partIndex = -1;
    this.headerListBuffer = null;
    this.readState = ReadState.INIT;
    this.ignoreByteCount = 0;
    this.remainingPartDataCount = 0;
    this.actualPartLength = 0;
    this.boundaryLength = boundary.length + 4;
    this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(data, encoding, callback) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${data.length} bytes`);
      return;
    }
    this.handleData(data).then(() => {
      if (this.onProgress) {
        const now = Date.now();
        if ((now >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (now - this.start) / 1e3) {
          this.nextUpdate = now + 1e3;
          this.onProgress({
            total: this.grandTotalBytes,
            delta: this.delta,
            transferred: this.transferred,
            percent: this.transferred / this.grandTotalBytes * 100,
            bytesPerSecond: Math.round(this.transferred / ((now - this.start) / 1e3))
          });
          this.delta = 0;
        }
      }
      callback();
    }).catch(callback);
  }
  async handleData(chunk) {
    let start = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0) {
      throw (0, builder_util_runtime_1$7.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    }
    if (this.ignoreByteCount > 0) {
      const toIgnore = Math.min(this.ignoreByteCount, chunk.length);
      this.ignoreByteCount -= toIgnore;
      start = toIgnore;
    } else if (this.remainingPartDataCount > 0) {
      const toRead = Math.min(this.remainingPartDataCount, chunk.length);
      this.remainingPartDataCount -= toRead;
      await this.processPartData(chunk, 0, toRead);
      start = toRead;
    }
    if (start === chunk.length) {
      return;
    }
    if (this.readState === ReadState.HEADER) {
      const headerListEnd = this.searchHeaderListEnd(chunk, start);
      if (headerListEnd === -1) {
        return;
      }
      start = headerListEnd;
      this.readState = ReadState.BODY;
      this.headerListBuffer = null;
    }
    while (true) {
      if (this.readState === ReadState.BODY) {
        this.readState = ReadState.INIT;
      } else {
        this.partIndex++;
        let taskIndex = this.partIndexToTaskIndex.get(this.partIndex);
        if (taskIndex == null) {
          if (this.isFinished) {
            taskIndex = this.options.end;
          } else {
            throw (0, builder_util_runtime_1$7.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          }
        }
        const prevTaskIndex = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
        if (prevTaskIndex < taskIndex) {
          await this.copyExistingData(prevTaskIndex, taskIndex);
        } else if (prevTaskIndex > taskIndex) {
          throw (0, builder_util_runtime_1$7.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
        }
        if (this.isFinished) {
          this.onPartEnd();
          this.finishHandler();
          return;
        }
        start = this.searchHeaderListEnd(chunk, start);
        if (start === -1) {
          this.readState = ReadState.HEADER;
          return;
        }
      }
      const partLength = this.partIndexToLength[this.partIndex];
      const end = start + partLength;
      const effectiveEnd = Math.min(end, chunk.length);
      await this.processPartStarted(chunk, start, effectiveEnd);
      this.remainingPartDataCount = partLength - (effectiveEnd - start);
      if (this.remainingPartDataCount > 0) {
        return;
      }
      start = end + this.boundaryLength;
      if (start >= chunk.length) {
        this.ignoreByteCount = this.boundaryLength - (chunk.length - end);
        return;
      }
    }
  }
  copyExistingData(index, end) {
    return new Promise((resolve, reject) => {
      const w = () => {
        if (index === end) {
          resolve();
          return;
        }
        const task = this.options.tasks[index];
        if (task.kind !== downloadPlanBuilder_1$2.OperationKind.COPY) {
          reject(new Error("Task kind must be COPY"));
          return;
        }
        copyData(task, this.out, this.options.oldFileFd, reject, () => {
          index++;
          w();
        });
      };
      w();
    });
  }
  searchHeaderListEnd(chunk, readOffset) {
    const headerListEnd = chunk.indexOf(DOUBLE_CRLF, readOffset);
    if (headerListEnd !== -1) {
      return headerListEnd + DOUBLE_CRLF.length;
    }
    const partialChunk = readOffset === 0 ? chunk : chunk.slice(readOffset);
    if (this.headerListBuffer == null) {
      this.headerListBuffer = partialChunk;
    } else {
      this.headerListBuffer = Buffer.concat([this.headerListBuffer, partialChunk]);
    }
    return -1;
  }
  onPartEnd() {
    const expectedLength = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== expectedLength) {
      throw (0, builder_util_runtime_1$7.newError)(`Expected length: ${expectedLength} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    }
    this.actualPartLength = 0;
  }
  processPartStarted(data, start, end) {
    if (this.partIndex !== 0) {
      this.onPartEnd();
    }
    return this.processPartData(data, start, end);
  }
  processPartData(data, start, end) {
    this.actualPartLength += end - start;
    this.transferred += end - start;
    this.delta += end - start;
    const out2 = this.out;
    if (out2.write(start === 0 && data.length === end ? data : data.slice(start, end))) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        out2.on("error", reject);
        out2.once("drain", () => {
          out2.removeListener("error", reject);
          resolve();
        });
      });
    }
  }
}
DataSplitter$1.DataSplitter = DataSplitter;
var multipleRangeDownloader = {};
Object.defineProperty(multipleRangeDownloader, "__esModule", { value: true });
multipleRangeDownloader.executeTasksUsingMultipleRangeRequests = executeTasksUsingMultipleRangeRequests;
multipleRangeDownloader.checkIsRangesSupported = checkIsRangesSupported;
const builder_util_runtime_1$6 = out;
const DataSplitter_1$1 = DataSplitter$1;
const downloadPlanBuilder_1$1 = downloadPlanBuilder;
function executeTasksUsingMultipleRangeRequests(differentialDownloader, tasks, out2, oldFileFd, reject) {
  const w = (taskOffset) => {
    if (taskOffset >= tasks.length) {
      if (differentialDownloader.fileMetadataBuffer != null) {
        out2.write(differentialDownloader.fileMetadataBuffer);
      }
      out2.end();
      return;
    }
    const nextOffset = taskOffset + 1e3;
    doExecuteTasks(differentialDownloader, {
      tasks,
      start: taskOffset,
      end: Math.min(tasks.length, nextOffset),
      oldFileFd
    }, out2, () => w(nextOffset), reject);
  };
  return w;
}
function doExecuteTasks(differentialDownloader, options2, out2, resolve, reject) {
  let ranges = "bytes=";
  let partCount = 0;
  let grandTotalBytes = 0;
  const partIndexToTaskIndex = /* @__PURE__ */ new Map();
  const partIndexToLength = [];
  for (let i2 = options2.start; i2 < options2.end; i2++) {
    const task = options2.tasks[i2];
    if (task.kind === downloadPlanBuilder_1$1.OperationKind.DOWNLOAD) {
      ranges += `${task.start}-${task.end - 1}, `;
      partIndexToTaskIndex.set(partCount, i2);
      partCount++;
      partIndexToLength.push(task.end - task.start);
      grandTotalBytes += task.end - task.start;
    }
  }
  if (partCount <= 1) {
    const w = (index) => {
      if (index >= options2.end) {
        resolve();
        return;
      }
      const task = options2.tasks[index++];
      if (task.kind === downloadPlanBuilder_1$1.OperationKind.COPY) {
        (0, DataSplitter_1$1.copyData)(task, out2, options2.oldFileFd, reject, () => w(index));
      } else {
        const requestOptions2 = differentialDownloader.createRequestOptions();
        requestOptions2.headers.Range = `bytes=${task.start}-${task.end - 1}`;
        const request2 = differentialDownloader.httpExecutor.createRequest(requestOptions2, (response) => {
          response.on("error", reject);
          if (!checkIsRangesSupported(response, reject)) {
            return;
          }
          response.pipe(out2, {
            end: false
          });
          response.once("end", () => w(index));
        });
        differentialDownloader.httpExecutor.addErrorAndTimeoutHandlers(request2, reject);
        request2.end();
      }
    };
    w(options2.start);
    return;
  }
  const requestOptions = differentialDownloader.createRequestOptions();
  requestOptions.headers.Range = ranges.substring(0, ranges.length - 2);
  const request = differentialDownloader.httpExecutor.createRequest(requestOptions, (response) => {
    if (!checkIsRangesSupported(response, reject)) {
      return;
    }
    const contentType = (0, builder_util_runtime_1$6.safeGetHeader)(response, "content-type");
    const m = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(contentType);
    if (m == null) {
      reject(new Error(`Content-Type "multipart/byteranges" is expected, but got "${contentType}"`));
      return;
    }
    const dicer = new DataSplitter_1$1.DataSplitter(out2, options2, partIndexToTaskIndex, m[1] || m[2], partIndexToLength, resolve, grandTotalBytes, differentialDownloader.options.onProgress);
    dicer.on("error", reject);
    response.pipe(dicer);
    response.on("end", () => {
      setTimeout(() => {
        request.abort();
        reject(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  differentialDownloader.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
  request.end();
}
function checkIsRangesSupported(response, reject) {
  if (response.statusCode >= 400) {
    reject((0, builder_util_runtime_1$6.createHttpError)(response));
    return false;
  }
  if (response.statusCode !== 206) {
    const acceptRanges = (0, builder_util_runtime_1$6.safeGetHeader)(response, "accept-ranges");
    if (acceptRanges == null || acceptRanges === "none") {
      reject(new Error(`Server doesn't support Accept-Ranges (response code ${response.statusCode})`));
      return false;
    }
  }
  return true;
}
var ProgressDifferentialDownloadCallbackTransform$1 = {};
Object.defineProperty(ProgressDifferentialDownloadCallbackTransform$1, "__esModule", { value: true });
ProgressDifferentialDownloadCallbackTransform$1.ProgressDifferentialDownloadCallbackTransform = void 0;
const stream_1 = require$$0$2;
var OperationKind;
(function(OperationKind2) {
  OperationKind2[OperationKind2["COPY"] = 0] = "COPY";
  OperationKind2[OperationKind2["DOWNLOAD"] = 1] = "DOWNLOAD";
})(OperationKind || (OperationKind = {}));
class ProgressDifferentialDownloadCallbackTransform extends stream_1.Transform {
  constructor(progressDifferentialDownloadInfo, cancellationToken, onProgress) {
    super();
    this.progressDifferentialDownloadInfo = progressDifferentialDownloadInfo;
    this.cancellationToken = cancellationToken;
    this.onProgress = onProgress;
    this.start = Date.now();
    this.transferred = 0;
    this.delta = 0;
    this.expectedBytes = 0;
    this.index = 0;
    this.operationType = OperationKind.COPY;
    this.nextUpdate = this.start + 1e3;
  }
  _transform(chunk, encoding, callback) {
    if (this.cancellationToken.cancelled) {
      callback(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == OperationKind.COPY) {
      callback(null, chunk);
      return;
    }
    this.transferred += chunk.length;
    this.delta += chunk.length;
    const now = Date.now();
    if (now >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal) {
      this.nextUpdate = now + 1e3;
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((now - this.start) / 1e3))
      });
      this.delta = 0;
    }
    callback(null, chunk);
  }
  beginFileCopy() {
    this.operationType = OperationKind.COPY;
  }
  beginRangeDownload() {
    this.operationType = OperationKind.DOWNLOAD;
    this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    if (this.transferred !== this.progressDifferentialDownloadInfo.grandTotal) {
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
  }
  // Called when we are 100% done with the connection/download
  _flush(callback) {
    if (this.cancellationToken.cancelled) {
      callback(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
    this.delta = 0;
    this.transferred = 0;
    callback(null);
  }
}
ProgressDifferentialDownloadCallbackTransform$1.ProgressDifferentialDownloadCallbackTransform = ProgressDifferentialDownloadCallbackTransform;
Object.defineProperty(DifferentialDownloader$1, "__esModule", { value: true });
DifferentialDownloader$1.DifferentialDownloader = void 0;
const builder_util_runtime_1$5 = out;
const fs_extra_1$5 = lib;
const fs_1$2 = require$$1$1;
const DataSplitter_1 = DataSplitter$1;
const url_1$1 = require$$2;
const downloadPlanBuilder_1 = downloadPlanBuilder;
const multipleRangeDownloader_1 = multipleRangeDownloader;
const ProgressDifferentialDownloadCallbackTransform_1 = ProgressDifferentialDownloadCallbackTransform$1;
class DifferentialDownloader {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(blockAwareFileInfo, httpExecutor2, options2) {
    this.blockAwareFileInfo = blockAwareFileInfo;
    this.httpExecutor = httpExecutor2;
    this.options = options2;
    this.fileMetadataBuffer = null;
    this.logger = options2.logger;
  }
  createRequestOptions() {
    const result = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    (0, builder_util_runtime_1$5.configureRequestUrl)(this.options.newUrl, result);
    (0, builder_util_runtime_1$5.configureRequestOptions)(result);
    return result;
  }
  doDownload(oldBlockMap, newBlockMap) {
    if (oldBlockMap.version !== newBlockMap.version) {
      throw new Error(`version is different (${oldBlockMap.version} - ${newBlockMap.version}), full download is required`);
    }
    const logger = this.logger;
    const operations = (0, downloadPlanBuilder_1.computeOperations)(oldBlockMap, newBlockMap, logger);
    if (logger.debug != null) {
      logger.debug(JSON.stringify(operations, null, 2));
    }
    let downloadSize = 0;
    let copySize = 0;
    for (const operation of operations) {
      const length = operation.end - operation.start;
      if (operation.kind === downloadPlanBuilder_1.OperationKind.DOWNLOAD) {
        downloadSize += length;
      } else {
        copySize += length;
      }
    }
    const newSize = this.blockAwareFileInfo.size;
    if (downloadSize + copySize + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== newSize) {
      throw new Error(`Internal error, size mismatch: downloadSize: ${downloadSize}, copySize: ${copySize}, newSize: ${newSize}`);
    }
    logger.info(`Full: ${formatBytes(newSize)}, To download: ${formatBytes(downloadSize)} (${Math.round(downloadSize / (newSize / 100))}%)`);
    return this.downloadFile(operations);
  }
  downloadFile(tasks) {
    const fdList = [];
    const closeFiles = () => {
      return Promise.all(fdList.map((openedFile) => {
        return (0, fs_extra_1$5.close)(openedFile.descriptor).catch((e) => {
          this.logger.error(`cannot close file "${openedFile.path}": ${e}`);
        });
      }));
    };
    return this.doDownloadFile(tasks, fdList).then(closeFiles).catch((e) => {
      return closeFiles().catch((closeFilesError) => {
        try {
          this.logger.error(`cannot close files: ${closeFilesError}`);
        } catch (errorOnLog) {
          try {
            console.error(errorOnLog);
          } catch (_ignored) {
          }
        }
        throw e;
      }).then(() => {
        throw e;
      });
    });
  }
  async doDownloadFile(tasks, fdList) {
    const oldFileFd = await (0, fs_extra_1$5.open)(this.options.oldFile, "r");
    fdList.push({ descriptor: oldFileFd, path: this.options.oldFile });
    const newFileFd = await (0, fs_extra_1$5.open)(this.options.newFile, "w");
    fdList.push({ descriptor: newFileFd, path: this.options.newFile });
    const fileOut = (0, fs_1$2.createWriteStream)(this.options.newFile, { fd: newFileFd });
    await new Promise((resolve, reject) => {
      const streams = [];
      let downloadInfoTransform = void 0;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const expectedByteCounts = [];
        let grandTotalBytes = 0;
        for (const task of tasks) {
          if (task.kind === downloadPlanBuilder_1.OperationKind.DOWNLOAD) {
            expectedByteCounts.push(task.end - task.start);
            grandTotalBytes += task.end - task.start;
          }
        }
        const progressDifferentialDownloadInfo = {
          expectedByteCounts,
          grandTotal: grandTotalBytes
        };
        downloadInfoTransform = new ProgressDifferentialDownloadCallbackTransform_1.ProgressDifferentialDownloadCallbackTransform(progressDifferentialDownloadInfo, this.options.cancellationToken, this.options.onProgress);
        streams.push(downloadInfoTransform);
      }
      const digestTransform = new builder_util_runtime_1$5.DigestTransform(this.blockAwareFileInfo.sha512);
      digestTransform.isValidateOnEnd = false;
      streams.push(digestTransform);
      fileOut.on("finish", () => {
        fileOut.close(() => {
          fdList.splice(1, 1);
          try {
            digestTransform.validate();
          } catch (e) {
            reject(e);
            return;
          }
          resolve(void 0);
        });
      });
      streams.push(fileOut);
      let lastStream = null;
      for (const stream2 of streams) {
        stream2.on("error", reject);
        if (lastStream == null) {
          lastStream = stream2;
        } else {
          lastStream = lastStream.pipe(stream2);
        }
      }
      const firstStream = streams[0];
      let w;
      if (this.options.isUseMultipleRangeRequest) {
        w = (0, multipleRangeDownloader_1.executeTasksUsingMultipleRangeRequests)(this, tasks, firstStream, oldFileFd, reject);
        w(0);
        return;
      }
      let downloadOperationCount = 0;
      let actualUrl = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const requestOptions = this.createRequestOptions();
      requestOptions.redirect = "manual";
      w = (index) => {
        var _a, _b;
        if (index >= tasks.length) {
          if (this.fileMetadataBuffer != null) {
            firstStream.write(this.fileMetadataBuffer);
          }
          firstStream.end();
          return;
        }
        const operation = tasks[index++];
        if (operation.kind === downloadPlanBuilder_1.OperationKind.COPY) {
          if (downloadInfoTransform) {
            downloadInfoTransform.beginFileCopy();
          }
          (0, DataSplitter_1.copyData)(operation, firstStream, oldFileFd, reject, () => w(index));
          return;
        }
        const range2 = `bytes=${operation.start}-${operation.end - 1}`;
        requestOptions.headers.range = range2;
        (_b = (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug) === null || _b === void 0 ? void 0 : _b.call(_a, `download range: ${range2}`);
        if (downloadInfoTransform) {
          downloadInfoTransform.beginRangeDownload();
        }
        const request = this.httpExecutor.createRequest(requestOptions, (response) => {
          response.on("error", reject);
          response.on("aborted", () => {
            reject(new Error("response has been aborted by the server"));
          });
          if (response.statusCode >= 400) {
            reject((0, builder_util_runtime_1$5.createHttpError)(response));
          }
          response.pipe(firstStream, {
            end: false
          });
          response.once("end", () => {
            if (downloadInfoTransform) {
              downloadInfoTransform.endRangeDownload();
            }
            if (++downloadOperationCount === 100) {
              downloadOperationCount = 0;
              setTimeout(() => w(index), 1e3);
            } else {
              w(index);
            }
          });
        });
        request.on("redirect", (statusCode, method, redirectUrl) => {
          this.logger.info(`Redirect to ${removeQuery(redirectUrl)}`);
          actualUrl = redirectUrl;
          (0, builder_util_runtime_1$5.configureRequestUrl)(new url_1$1.URL(actualUrl), requestOptions);
          request.followRedirect();
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
        request.end();
      };
      w(0);
    });
  }
  async readRemoteBytes(start, endInclusive) {
    const buffer = Buffer.allocUnsafe(endInclusive + 1 - start);
    const requestOptions = this.createRequestOptions();
    requestOptions.headers.range = `bytes=${start}-${endInclusive}`;
    let position = 0;
    await this.request(requestOptions, (chunk) => {
      chunk.copy(buffer, position);
      position += chunk.length;
    });
    if (position !== buffer.length) {
      throw new Error(`Received data length ${position} is not equal to expected ${buffer.length}`);
    }
    return buffer;
  }
  request(requestOptions, dataHandler) {
    return new Promise((resolve, reject) => {
      const request = this.httpExecutor.createRequest(requestOptions, (response) => {
        if (!(0, multipleRangeDownloader_1.checkIsRangesSupported)(response, reject)) {
          return;
        }
        response.on("error", reject);
        response.on("aborted", () => {
          reject(new Error("response has been aborted by the server"));
        });
        response.on("data", dataHandler);
        response.on("end", () => resolve());
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(request, reject);
      request.end();
    });
  }
}
DifferentialDownloader$1.DifferentialDownloader = DifferentialDownloader;
function formatBytes(value, symbol = " KB") {
  return new Intl.NumberFormat("en").format((value / 1024).toFixed(2)) + symbol;
}
function removeQuery(url) {
  const index = url.indexOf("?");
  return index < 0 ? url : url.substring(0, index);
}
Object.defineProperty(GenericDifferentialDownloader$1, "__esModule", { value: true });
GenericDifferentialDownloader$1.GenericDifferentialDownloader = void 0;
const DifferentialDownloader_1$1 = DifferentialDownloader$1;
class GenericDifferentialDownloader extends DifferentialDownloader_1$1.DifferentialDownloader {
  download(oldBlockMap, newBlockMap) {
    return this.doDownload(oldBlockMap, newBlockMap);
  }
}
GenericDifferentialDownloader$1.GenericDifferentialDownloader = GenericDifferentialDownloader;
var types = {};
(function(exports$1) {
  Object.defineProperty(exports$1, "__esModule", { value: true });
  exports$1.UpdaterSignal = exports$1.UPDATE_DOWNLOADED = exports$1.DOWNLOAD_PROGRESS = exports$1.CancellationToken = void 0;
  exports$1.addHandler = addHandler;
  const builder_util_runtime_12 = out;
  Object.defineProperty(exports$1, "CancellationToken", { enumerable: true, get: function() {
    return builder_util_runtime_12.CancellationToken;
  } });
  exports$1.DOWNLOAD_PROGRESS = "download-progress";
  exports$1.UPDATE_DOWNLOADED = "update-downloaded";
  class UpdaterSignal {
    constructor(emitter) {
      this.emitter = emitter;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(handler) {
      addHandler(this.emitter, "login", handler);
    }
    progress(handler) {
      addHandler(this.emitter, exports$1.DOWNLOAD_PROGRESS, handler);
    }
    updateDownloaded(handler) {
      addHandler(this.emitter, exports$1.UPDATE_DOWNLOADED, handler);
    }
    updateCancelled(handler) {
      addHandler(this.emitter, "update-cancelled", handler);
    }
  }
  exports$1.UpdaterSignal = UpdaterSignal;
  function addHandler(emitter, event, handler) {
    {
      emitter.on(event, handler);
    }
  }
})(types);
Object.defineProperty(AppUpdater$1, "__esModule", { value: true });
AppUpdater$1.NoOpLogger = AppUpdater$1.AppUpdater = void 0;
const builder_util_runtime_1$4 = out;
const crypto_1$1 = require$$0$1;
const os_1 = require$$1$2;
const events_1 = require$$0$4;
const fs_extra_1$4 = lib;
const js_yaml_1 = jsYaml;
const lazy_val_1 = main;
const path$4 = require$$1;
const semver_1 = semver$1;
const DownloadedUpdateHelper_1 = DownloadedUpdateHelper$1;
const ElectronAppAdapter_1 = ElectronAppAdapter$1;
const electronHttpExecutor_1 = electronHttpExecutor;
const GenericProvider_1 = GenericProvider$1;
const providerFactory_1 = providerFactory;
const zlib_1$1 = require$$3;
const GenericDifferentialDownloader_1 = GenericDifferentialDownloader$1;
const types_1$5 = types;
class AppUpdater extends events_1.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(value) {
    if (this._channel != null) {
      if (typeof value !== "string") {
        throw (0, builder_util_runtime_1$4.newError)(`Channel must be a string, but got: ${value}`, "ERR_UPDATER_INVALID_CHANNEL");
      } else if (value.length === 0) {
        throw (0, builder_util_runtime_1$4.newError)(`Channel must be not an empty string`, "ERR_UPDATER_INVALID_CHANNEL");
      }
    }
    this._channel = value;
    this.allowDowngrade = true;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(token) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: token
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, electronHttpExecutor_1.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(value) {
    this._logger = value == null ? new NoOpLogger() : value;
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(value) {
    this.clientPromise = null;
    this._appUpdateConfigPath = value;
    this.configOnDisk = new lazy_val_1.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(value) {
    if (value) {
      this._isUpdateSupported = value;
    }
  }
  /**
   * Allows developer to override default logic for determining if the user is below the rollout threshold.
   * The default logic compares the staging percentage with numerical representation of user ID.
   * An override can define custom logic, or bypass it if needed.
   */
  get isUserWithinRollout() {
    return this._isUserWithinRollout;
  }
  set isUserWithinRollout(value) {
    if (value) {
      this._isUserWithinRollout = value;
    }
  }
  constructor(options2, app) {
    super();
    this.autoDownload = true;
    this.autoInstallOnAppQuit = true;
    this.autoRunAppAfterInstall = true;
    this.allowPrerelease = false;
    this.fullChangelog = false;
    this.allowDowngrade = false;
    this.disableWebInstaller = false;
    this.disableDifferentialDownload = false;
    this.forceDevUpdateConfig = false;
    this.previousBlockmapBaseUrlOverride = null;
    this._channel = null;
    this.downloadedUpdateHelper = null;
    this.requestHeaders = null;
    this._logger = console;
    this.signals = new types_1$5.UpdaterSignal(this);
    this._appUpdateConfigPath = null;
    this._isUpdateSupported = (updateInfo) => this.checkIfUpdateSupported(updateInfo);
    this._isUserWithinRollout = (updateInfo) => this.isStagingMatch(updateInfo);
    this.clientPromise = null;
    this.stagingUserIdPromise = new lazy_val_1.Lazy(() => this.getOrCreateStagingUserId());
    this.configOnDisk = new lazy_val_1.Lazy(() => this.loadUpdateConfig());
    this.checkForUpdatesPromise = null;
    this.downloadPromise = null;
    this.updateInfoAndProvider = null;
    this._testOnlyOptions = null;
    this.on("error", (error2) => {
      this._logger.error(`Error: ${error2.stack || error2.message}`);
    });
    if (app == null) {
      this.app = new ElectronAppAdapter_1.ElectronAppAdapter();
      this.httpExecutor = new electronHttpExecutor_1.ElectronHttpExecutor((authInfo, callback) => this.emit("login", authInfo, callback));
    } else {
      this.app = app;
      this.httpExecutor = null;
    }
    const currentVersionString = this.app.version;
    const currentVersion = (0, semver_1.parse)(currentVersionString);
    if (currentVersion == null) {
      throw (0, builder_util_runtime_1$4.newError)(`App version is not a valid semver version: "${currentVersionString}"`, "ERR_UPDATER_INVALID_VERSION");
    }
    this.currentVersion = currentVersion;
    this.allowPrerelease = hasPrereleaseComponents(currentVersion);
    if (options2 != null) {
      this.setFeedURL(options2);
      if (typeof options2 !== "string" && options2.requestHeaders) {
        this.requestHeaders = options2.requestHeaders;
      }
    }
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(options2) {
    const runtimeOptions = this.createProviderRuntimeOptions();
    let provider;
    if (typeof options2 === "string") {
      provider = new GenericProvider_1.GenericProvider({ provider: "generic", url: options2 }, this, {
        ...runtimeOptions,
        isUseMultipleRangeRequest: (0, providerFactory_1.isUrlProbablySupportMultiRangeRequests)(options2)
      });
    } else {
      provider = (0, providerFactory_1.createClient)(options2, this, runtimeOptions);
    }
    this.clientPromise = Promise.resolve(provider);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive()) {
      return Promise.resolve(null);
    }
    let checkForUpdatesPromise = this.checkForUpdatesPromise;
    if (checkForUpdatesPromise != null) {
      this._logger.info("Checking for update (already in progress)");
      return checkForUpdatesPromise;
    }
    const nullizePromise = () => this.checkForUpdatesPromise = null;
    this._logger.info("Checking for update");
    checkForUpdatesPromise = this.doCheckForUpdates().then((it) => {
      nullizePromise();
      return it;
    }).catch((e) => {
      nullizePromise();
      this.emit("error", e, `Cannot check for updates: ${(e.stack || e).toString()}`);
      throw e;
    });
    this.checkForUpdatesPromise = checkForUpdatesPromise;
    return checkForUpdatesPromise;
  }
  isUpdaterActive() {
    const isEnabled = this.app.isPackaged || this.forceDevUpdateConfig;
    if (!isEnabled) {
      this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced");
      return false;
    }
    return true;
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(downloadNotification) {
    return this.checkForUpdates().then((it) => {
      if (!(it === null || it === void 0 ? void 0 : it.downloadPromise)) {
        if (this._logger.debug != null) {
          this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null");
        }
        return it;
      }
      void it.downloadPromise.then(() => {
        const notificationContent = AppUpdater.formatDownloadNotification(it.updateInfo.version, this.app.name, downloadNotification);
        new require$$1$3.Notification(notificationContent).show();
      });
      return it;
    });
  }
  static formatDownloadNotification(version2, appName, downloadNotification) {
    if (downloadNotification == null) {
      downloadNotification = {
        title: "A new update is ready to install",
        body: `{appName} version {version} has been downloaded and will be automatically installed on exit`
      };
    }
    downloadNotification = {
      title: downloadNotification.title.replace("{appName}", appName).replace("{version}", version2),
      body: downloadNotification.body.replace("{appName}", appName).replace("{version}", version2)
    };
    return downloadNotification;
  }
  async isStagingMatch(updateInfo) {
    const rawStagingPercentage = updateInfo.stagingPercentage;
    let stagingPercentage = rawStagingPercentage;
    if (stagingPercentage == null) {
      return true;
    }
    stagingPercentage = parseInt(stagingPercentage, 10);
    if (isNaN(stagingPercentage)) {
      this._logger.warn(`Staging percentage is NaN: ${rawStagingPercentage}`);
      return true;
    }
    stagingPercentage = stagingPercentage / 100;
    const stagingUserId = await this.stagingUserIdPromise.value;
    const val = builder_util_runtime_1$4.UUID.parse(stagingUserId).readUInt32BE(12);
    const percentage = val / 4294967295;
    this._logger.info(`Staging percentage: ${stagingPercentage}, percentage: ${percentage}, user id: ${stagingUserId}`);
    return percentage < stagingPercentage;
  }
  computeFinalHeaders(headers) {
    if (this.requestHeaders != null) {
      Object.assign(headers, this.requestHeaders);
    }
    return headers;
  }
  async isUpdateAvailable(updateInfo) {
    const latestVersion = (0, semver_1.parse)(updateInfo.version);
    if (latestVersion == null) {
      throw (0, builder_util_runtime_1$4.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${updateInfo.version}"`, "ERR_UPDATER_INVALID_VERSION");
    }
    const currentVersion = this.currentVersion;
    if ((0, semver_1.eq)(latestVersion, currentVersion)) {
      return false;
    }
    if (!await Promise.resolve(this.isUpdateSupported(updateInfo))) {
      return false;
    }
    const isUserWithinRollout = await Promise.resolve(this.isUserWithinRollout(updateInfo));
    if (!isUserWithinRollout) {
      return false;
    }
    const isLatestVersionNewer = (0, semver_1.gt)(latestVersion, currentVersion);
    const isLatestVersionOlder = (0, semver_1.lt)(latestVersion, currentVersion);
    if (isLatestVersionNewer) {
      return true;
    }
    return this.allowDowngrade && isLatestVersionOlder;
  }
  checkIfUpdateSupported(updateInfo) {
    const minimumSystemVersion = updateInfo === null || updateInfo === void 0 ? void 0 : updateInfo.minimumSystemVersion;
    const currentOSVersion = (0, os_1.release)();
    if (minimumSystemVersion) {
      try {
        if ((0, semver_1.lt)(currentOSVersion, minimumSystemVersion)) {
          this._logger.info(`Current OS version ${currentOSVersion} is less than the minimum OS version required ${minimumSystemVersion} for version ${currentOSVersion}`);
          return false;
        }
      } catch (e) {
        this._logger.warn(`Failed to compare current OS version(${currentOSVersion}) with minimum OS version(${minimumSystemVersion}): ${(e.message || e).toString()}`);
      }
    }
    return true;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady();
    if (this.clientPromise == null) {
      this.clientPromise = this.configOnDisk.value.then((it) => (0, providerFactory_1.createClient)(it, this, this.createProviderRuntimeOptions()));
    }
    const client = await this.clientPromise;
    const stagingUserId = await this.stagingUserIdPromise.value;
    client.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": stagingUserId }));
    return {
      info: await client.getLatestVersion(),
      provider: client
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: true,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const result = await this.getUpdateInfoAndProvider();
    const updateInfo = result.info;
    if (!await this.isUpdateAvailable(updateInfo)) {
      this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${updateInfo.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`);
      this.emit("update-not-available", updateInfo);
      return {
        isUpdateAvailable: false,
        versionInfo: updateInfo,
        updateInfo
      };
    }
    this.updateInfoAndProvider = result;
    this.onUpdateAvailable(updateInfo);
    const cancellationToken = new builder_util_runtime_1$4.CancellationToken();
    return {
      isUpdateAvailable: true,
      versionInfo: updateInfo,
      updateInfo,
      cancellationToken,
      downloadPromise: this.autoDownload ? this.downloadUpdate(cancellationToken) : null
    };
  }
  onUpdateAvailable(updateInfo) {
    this._logger.info(`Found version ${updateInfo.version} (url: ${(0, builder_util_runtime_1$4.asArray)(updateInfo.files).map((it) => it.url).join(", ")})`);
    this.emit("update-available", updateInfo);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(cancellationToken = new builder_util_runtime_1$4.CancellationToken()) {
    const updateInfoAndProvider = this.updateInfoAndProvider;
    if (updateInfoAndProvider == null) {
      const error2 = new Error("Please check update first");
      this.dispatchError(error2);
      return Promise.reject(error2);
    }
    if (this.downloadPromise != null) {
      this._logger.info("Downloading update (already in progress)");
      return this.downloadPromise;
    }
    this._logger.info(`Downloading update from ${(0, builder_util_runtime_1$4.asArray)(updateInfoAndProvider.info.files).map((it) => it.url).join(", ")}`);
    const errorHandler = (e) => {
      if (!(e instanceof builder_util_runtime_1$4.CancellationError)) {
        try {
          this.dispatchError(e);
        } catch (nestedError) {
          this._logger.warn(`Cannot dispatch error event: ${nestedError.stack || nestedError}`);
        }
      }
      return e;
    };
    this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider,
      requestHeaders: this.computeRequestHeaders(updateInfoAndProvider.provider),
      cancellationToken,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((e) => {
      throw errorHandler(e);
    }).finally(() => {
      this.downloadPromise = null;
    });
    return this.downloadPromise;
  }
  dispatchError(e) {
    this.emit("error", e, (e.stack || e).toString());
  }
  dispatchUpdateDownloaded(event) {
    this.emit(types_1$5.UPDATE_DOWNLOADED, event);
  }
  async loadUpdateConfig() {
    if (this._appUpdateConfigPath == null) {
      this._appUpdateConfigPath = this.app.appUpdateConfigPath;
    }
    return (0, js_yaml_1.load)(await (0, fs_extra_1$4.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(provider) {
    const fileExtraDownloadHeaders = provider.fileExtraDownloadHeaders;
    if (fileExtraDownloadHeaders != null) {
      const requestHeaders = this.requestHeaders;
      return requestHeaders == null ? fileExtraDownloadHeaders : {
        ...fileExtraDownloadHeaders,
        ...requestHeaders
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const file2 = path$4.join(this.app.userDataPath, ".updaterId");
    try {
      const id2 = await (0, fs_extra_1$4.readFile)(file2, "utf-8");
      if (builder_util_runtime_1$4.UUID.check(id2)) {
        return id2;
      } else {
        this._logger.warn(`Staging user id file exists, but content was invalid: ${id2}`);
      }
    } catch (e) {
      if (e.code !== "ENOENT") {
        this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${e}`);
      }
    }
    const id = builder_util_runtime_1$4.UUID.v5((0, crypto_1$1.randomBytes)(4096), builder_util_runtime_1$4.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${id}`);
    try {
      await (0, fs_extra_1$4.outputFile)(file2, id);
    } catch (e) {
      this._logger.warn(`Couldn't write out staging user ID: ${e}`);
    }
    return id;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const headers = this.requestHeaders;
    if (headers == null) {
      return true;
    }
    for (const headerName of Object.keys(headers)) {
      const s = headerName.toLowerCase();
      if (s === "authorization" || s === "private-token") {
        return false;
      }
    }
    return true;
  }
  async getOrCreateDownloadHelper() {
    let result = this.downloadedUpdateHelper;
    if (result == null) {
      const dirName = (await this.configOnDisk.value).updaterCacheDirName;
      const logger = this._logger;
      if (dirName == null) {
        logger.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      }
      const cacheDir = path$4.join(this.app.baseCachePath, dirName || this.app.name);
      if (logger.debug != null) {
        logger.debug(`updater cache dir: ${cacheDir}`);
      }
      result = new DownloadedUpdateHelper_1.DownloadedUpdateHelper(cacheDir);
      this.downloadedUpdateHelper = result;
    }
    return result;
  }
  async executeDownload(taskOptions) {
    const fileInfo = taskOptions.fileInfo;
    const downloadOptions = {
      headers: taskOptions.downloadUpdateOptions.requestHeaders,
      cancellationToken: taskOptions.downloadUpdateOptions.cancellationToken,
      sha2: fileInfo.info.sha2,
      sha512: fileInfo.info.sha512
    };
    if (this.listenerCount(types_1$5.DOWNLOAD_PROGRESS) > 0) {
      downloadOptions.onProgress = (it) => this.emit(types_1$5.DOWNLOAD_PROGRESS, it);
    }
    const updateInfo = taskOptions.downloadUpdateOptions.updateInfoAndProvider.info;
    const version2 = updateInfo.version;
    const packageInfo = fileInfo.packageInfo;
    function getCacheUpdateFileName() {
      const urlPath = decodeURIComponent(taskOptions.fileInfo.url.pathname);
      if (urlPath.toLowerCase().endsWith(`.${taskOptions.fileExtension.toLowerCase()}`)) {
        return path$4.basename(urlPath);
      } else {
        return taskOptions.fileInfo.info.url;
      }
    }
    const downloadedUpdateHelper = await this.getOrCreateDownloadHelper();
    const cacheDir = downloadedUpdateHelper.cacheDirForPendingUpdate;
    await (0, fs_extra_1$4.mkdir)(cacheDir, { recursive: true });
    const updateFileName = getCacheUpdateFileName();
    let updateFile = path$4.join(cacheDir, updateFileName);
    const packageFile = packageInfo == null ? null : path$4.join(cacheDir, `package-${version2}${path$4.extname(packageInfo.path) || ".7z"}`);
    const done = async (isSaveCache) => {
      await downloadedUpdateHelper.setDownloadedFile(updateFile, packageFile, updateInfo, fileInfo, updateFileName, isSaveCache);
      await taskOptions.done({
        ...updateInfo,
        downloadedFile: updateFile
      });
      const currentBlockMapFile = path$4.join(cacheDir, "current.blockmap");
      if (await (0, fs_extra_1$4.pathExists)(currentBlockMapFile)) {
        await (0, fs_extra_1$4.copyFile)(currentBlockMapFile, path$4.join(downloadedUpdateHelper.cacheDir, "current.blockmap"));
      }
      return packageFile == null ? [updateFile] : [updateFile, packageFile];
    };
    const log2 = this._logger;
    const cachedUpdateFile = await downloadedUpdateHelper.validateDownloadedPath(updateFile, updateInfo, fileInfo, log2);
    if (cachedUpdateFile != null) {
      updateFile = cachedUpdateFile;
      return await done(false);
    }
    const removeFileIfAny = async () => {
      await downloadedUpdateHelper.clear().catch(() => {
      });
      return await (0, fs_extra_1$4.unlink)(updateFile).catch(() => {
      });
    };
    const tempUpdateFile = await (0, DownloadedUpdateHelper_1.createTempUpdateFile)(`temp-${updateFileName}`, cacheDir, log2);
    try {
      await taskOptions.task(tempUpdateFile, downloadOptions, packageFile, removeFileIfAny);
      await (0, builder_util_runtime_1$4.retry)(() => (0, fs_extra_1$4.rename)(tempUpdateFile, updateFile), {
        retries: 60,
        interval: 500,
        shouldRetry: (error2) => {
          if (error2 instanceof Error && /^EBUSY:/.test(error2.message)) {
            return true;
          }
          log2.warn(`Cannot rename temp file to final file: ${error2.message || error2.stack}`);
          return false;
        }
      });
    } catch (e) {
      await removeFileIfAny();
      if (e instanceof builder_util_runtime_1$4.CancellationError) {
        log2.info("cancelled");
        this.emit("update-cancelled", updateInfo);
      }
      throw e;
    }
    log2.info(`New version ${version2} has been downloaded to ${updateFile}`);
    return await done(true);
  }
  async differentialDownloadInstaller(fileInfo, downloadUpdateOptions, installerPath, provider, oldInstallerFileName) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload) {
        return true;
      }
      const provider2 = downloadUpdateOptions.updateInfoAndProvider.provider;
      const blockmapFileUrls = await provider2.getBlockMapFiles(fileInfo.url, this.app.version, downloadUpdateOptions.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${blockmapFileUrls[0]}", new: ${blockmapFileUrls[1]})`);
      const downloadBlockMap = async (url) => {
        const data = await this.httpExecutor.downloadToBuffer(url, {
          headers: downloadUpdateOptions.requestHeaders,
          cancellationToken: downloadUpdateOptions.cancellationToken
        });
        if (data == null || data.length === 0) {
          throw new Error(`Blockmap "${url.href}" is empty`);
        }
        try {
          return JSON.parse((0, zlib_1$1.gunzipSync)(data).toString());
        } catch (e) {
          throw new Error(`Cannot parse blockmap "${url.href}", error: ${e}`);
        }
      };
      const downloadOptions = {
        newUrl: fileInfo.url,
        oldFile: path$4.join(this.downloadedUpdateHelper.cacheDir, oldInstallerFileName),
        logger: this._logger,
        newFile: installerPath,
        isUseMultipleRangeRequest: provider2.isUseMultipleRangeRequest,
        requestHeaders: downloadUpdateOptions.requestHeaders,
        cancellationToken: downloadUpdateOptions.cancellationToken
      };
      if (this.listenerCount(types_1$5.DOWNLOAD_PROGRESS) > 0) {
        downloadOptions.onProgress = (it) => this.emit(types_1$5.DOWNLOAD_PROGRESS, it);
      }
      const saveBlockMapToCacheDir = async (blockMapData, cacheDir) => {
        const blockMapFile = path$4.join(cacheDir, "current.blockmap");
        await (0, fs_extra_1$4.outputFile)(blockMapFile, (0, zlib_1$1.gzipSync)(JSON.stringify(blockMapData)));
      };
      const getBlockMapFromCacheDir = async (cacheDir) => {
        const blockMapFile = path$4.join(cacheDir, "current.blockmap");
        try {
          if (await (0, fs_extra_1$4.pathExists)(blockMapFile)) {
            return JSON.parse((0, zlib_1$1.gunzipSync)(await (0, fs_extra_1$4.readFile)(blockMapFile)).toString());
          }
        } catch (e) {
          this._logger.warn(`Cannot parse blockmap "${blockMapFile}", error: ${e}`);
        }
        return null;
      };
      const newBlockMapData = await downloadBlockMap(blockmapFileUrls[1]);
      await saveBlockMapToCacheDir(newBlockMapData, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let oldBlockMapData = await getBlockMapFromCacheDir(this.downloadedUpdateHelper.cacheDir);
      if (oldBlockMapData == null) {
        oldBlockMapData = await downloadBlockMap(blockmapFileUrls[0]);
      }
      await new GenericDifferentialDownloader_1.GenericDifferentialDownloader(fileInfo.info, this.httpExecutor, downloadOptions).download(oldBlockMapData, newBlockMapData);
      return false;
    } catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
      if (this._testOnlyOptions != null) {
        throw e;
      }
      return true;
    }
  }
}
AppUpdater$1.AppUpdater = AppUpdater;
function hasPrereleaseComponents(version2) {
  const versionPrereleaseComponent = (0, semver_1.prerelease)(version2);
  return versionPrereleaseComponent != null && versionPrereleaseComponent.length > 0;
}
class NoOpLogger {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(message) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(message) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(message) {
  }
}
AppUpdater$1.NoOpLogger = NoOpLogger;
Object.defineProperty(BaseUpdater$1, "__esModule", { value: true });
BaseUpdater$1.BaseUpdater = void 0;
const child_process_1$3 = require$$0$5;
const AppUpdater_1$1 = AppUpdater$1;
class BaseUpdater extends AppUpdater_1$1.AppUpdater {
  constructor(options2, app) {
    super(options2, app);
    this.quitAndInstallCalled = false;
    this.quitHandlerAdded = false;
  }
  quitAndInstall(isSilent = false, isForceRunAfter = false) {
    this._logger.info(`Install on explicit quitAndInstall`);
    const isInstalled = this.install(isSilent, isSilent ? isForceRunAfter : this.autoRunAppAfterInstall);
    if (isInstalled) {
      setImmediate(() => {
        require$$1$3.autoUpdater.emit("before-quit-for-update");
        this.app.quit();
      });
    } else {
      this.quitAndInstallCalled = false;
    }
  }
  executeDownload(taskOptions) {
    return super.executeDownload({
      ...taskOptions,
      done: (event) => {
        this.dispatchUpdateDownloaded(event);
        this.addQuitHandler();
        return Promise.resolve();
      }
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(isSilent = false, isForceRunAfter = false) {
    if (this.quitAndInstallCalled) {
      this._logger.warn("install call ignored: quitAndInstallCalled is set to true");
      return false;
    }
    const downloadedUpdateHelper = this.downloadedUpdateHelper;
    const installerPath = this.installerPath;
    const downloadedFileInfo = downloadedUpdateHelper == null ? null : downloadedUpdateHelper.downloadedFileInfo;
    if (installerPath == null || downloadedFileInfo == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    this.quitAndInstallCalled = true;
    try {
      this._logger.info(`Install: isSilent: ${isSilent}, isForceRunAfter: ${isForceRunAfter}`);
      return this.doInstall({
        isSilent,
        isForceRunAfter,
        isAdminRightsRequired: downloadedFileInfo.isAdminRightsRequired
      });
    } catch (e) {
      this.dispatchError(e);
      return false;
    }
  }
  addQuitHandler() {
    if (this.quitHandlerAdded || !this.autoInstallOnAppQuit) {
      return;
    }
    this.quitHandlerAdded = true;
    this.app.onQuit((exitCode) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (exitCode !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${exitCode}`);
        return;
      }
      this._logger.info("Auto install update on quit");
      this.install(true, false);
    });
  }
  spawnSyncLog(cmd, args = [], env = {}) {
    this._logger.info(`Executing: ${cmd} with args: ${args}`);
    const response = (0, child_process_1$3.spawnSync)(cmd, args, {
      env: { ...process.env, ...env },
      encoding: "utf-8",
      shell: true
    });
    const { error: error2, status, stdout, stderr } = response;
    if (error2 != null) {
      this._logger.error(stderr);
      throw error2;
    } else if (status != null && status !== 0) {
      this._logger.error(stderr);
      throw new Error(`Command ${cmd} exited with code ${status}`);
    }
    return stdout.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(cmd, args = [], env = void 0, stdio = "ignore") {
    this._logger.info(`Executing: ${cmd} with args: ${args}`);
    return new Promise((resolve, reject) => {
      try {
        const params = { stdio, env, detached: true };
        const p = (0, child_process_1$3.spawn)(cmd, args, params);
        p.on("error", (error2) => {
          reject(error2);
        });
        p.unref();
        if (p.pid !== void 0) {
          resolve(true);
        }
      } catch (error2) {
        reject(error2);
      }
    });
  }
}
BaseUpdater$1.BaseUpdater = BaseUpdater;
var AppImageUpdater$1 = {};
var FileWithEmbeddedBlockMapDifferentialDownloader$1 = {};
Object.defineProperty(FileWithEmbeddedBlockMapDifferentialDownloader$1, "__esModule", { value: true });
FileWithEmbeddedBlockMapDifferentialDownloader$1.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const fs_extra_1$3 = lib;
const DifferentialDownloader_1 = DifferentialDownloader$1;
const zlib_1 = require$$3;
class FileWithEmbeddedBlockMapDifferentialDownloader extends DifferentialDownloader_1.DifferentialDownloader {
  async download() {
    const packageInfo = this.blockAwareFileInfo;
    const fileSize = packageInfo.size;
    const offset = fileSize - (packageInfo.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(offset, fileSize - 1);
    const newBlockMap = readBlockMap(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await readEmbeddedBlockMapData(this.options.oldFile), newBlockMap);
  }
}
FileWithEmbeddedBlockMapDifferentialDownloader$1.FileWithEmbeddedBlockMapDifferentialDownloader = FileWithEmbeddedBlockMapDifferentialDownloader;
function readBlockMap(data) {
  return JSON.parse((0, zlib_1.inflateRawSync)(data).toString());
}
async function readEmbeddedBlockMapData(file2) {
  const fd = await (0, fs_extra_1$3.open)(file2, "r");
  try {
    const fileSize = (await (0, fs_extra_1$3.fstat)(fd)).size;
    const sizeBuffer = Buffer.allocUnsafe(4);
    await (0, fs_extra_1$3.read)(fd, sizeBuffer, 0, sizeBuffer.length, fileSize - sizeBuffer.length);
    const dataBuffer = Buffer.allocUnsafe(sizeBuffer.readUInt32BE(0));
    await (0, fs_extra_1$3.read)(fd, dataBuffer, 0, dataBuffer.length, fileSize - sizeBuffer.length - dataBuffer.length);
    await (0, fs_extra_1$3.close)(fd);
    return readBlockMap(dataBuffer);
  } catch (e) {
    await (0, fs_extra_1$3.close)(fd);
    throw e;
  }
}
Object.defineProperty(AppImageUpdater$1, "__esModule", { value: true });
AppImageUpdater$1.AppImageUpdater = void 0;
const builder_util_runtime_1$3 = out;
const child_process_1$2 = require$$0$5;
const fs_extra_1$2 = lib;
const fs_1$1 = require$$1$1;
const path$3 = require$$1;
const BaseUpdater_1$2 = BaseUpdater$1;
const FileWithEmbeddedBlockMapDifferentialDownloader_1$1 = FileWithEmbeddedBlockMapDifferentialDownloader$1;
const Provider_1$5 = Provider$1;
const types_1$4 = types;
class AppImageUpdater extends BaseUpdater_1$2.BaseUpdater {
  constructor(options2, app) {
    super(options2, app);
  }
  isUpdaterActive() {
    if (process.env["APPIMAGE"] == null && !this.forceDevUpdateConfig) {
      if (process.env["SNAP"] == null) {
        this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage");
      } else {
        this._logger.info("SNAP env is defined, updater is disabled");
      }
      return false;
    }
    return super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = (0, Provider_1$5.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo,
      downloadUpdateOptions,
      task: async (updateFile, downloadOptions) => {
        const oldFile = process.env["APPIMAGE"];
        if (oldFile == null) {
          throw (0, builder_util_runtime_1$3.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        }
        if (downloadUpdateOptions.disableDifferentialDownload || await this.downloadDifferential(fileInfo, oldFile, updateFile, provider, downloadUpdateOptions)) {
          await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
        }
        await (0, fs_extra_1$2.chmod)(updateFile, 493);
      }
    });
  }
  async downloadDifferential(fileInfo, oldFile, updateFile, provider, downloadUpdateOptions) {
    try {
      const downloadOptions = {
        newUrl: fileInfo.url,
        oldFile,
        logger: this._logger,
        newFile: updateFile,
        isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
        requestHeaders: downloadUpdateOptions.requestHeaders,
        cancellationToken: downloadUpdateOptions.cancellationToken
      };
      if (this.listenerCount(types_1$4.DOWNLOAD_PROGRESS) > 0) {
        downloadOptions.onProgress = (it) => this.emit(types_1$4.DOWNLOAD_PROGRESS, it);
      }
      await new FileWithEmbeddedBlockMapDifferentialDownloader_1$1.FileWithEmbeddedBlockMapDifferentialDownloader(fileInfo.info, this.httpExecutor, downloadOptions).download();
      return false;
    } catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
      return process.platform === "linux";
    }
  }
  doInstall(options2) {
    const appImageFile = process.env["APPIMAGE"];
    if (appImageFile == null) {
      throw (0, builder_util_runtime_1$3.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    }
    (0, fs_1$1.unlinkSync)(appImageFile);
    let destination;
    const existingBaseName = path$3.basename(appImageFile);
    const installerPath = this.installerPath;
    if (installerPath == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    if (path$3.basename(installerPath) === existingBaseName || !/\d+\.\d+\.\d+/.test(existingBaseName)) {
      destination = appImageFile;
    } else {
      destination = path$3.join(path$3.dirname(appImageFile), path$3.basename(installerPath));
    }
    (0, child_process_1$2.execFileSync)("mv", ["-f", installerPath, destination]);
    if (destination !== appImageFile) {
      this.emit("appimage-filename-updated", destination);
    }
    const env = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    if (options2.isForceRunAfter) {
      this.spawnLog(destination, [], env);
    } else {
      env.APPIMAGE_EXIT_AFTER_INSTALL = "true";
      (0, child_process_1$2.execFileSync)(destination, [], { env });
    }
    return true;
  }
}
AppImageUpdater$1.AppImageUpdater = AppImageUpdater;
var DebUpdater$1 = {};
var LinuxUpdater$1 = {};
Object.defineProperty(LinuxUpdater$1, "__esModule", { value: true });
LinuxUpdater$1.LinuxUpdater = void 0;
const BaseUpdater_1$1 = BaseUpdater$1;
class LinuxUpdater extends BaseUpdater_1$1.BaseUpdater {
  constructor(options2, app) {
    super(options2, app);
  }
  /**
   * Returns true if the current process is running as root.
   */
  isRunningAsRoot() {
    var _a;
    return ((_a = process.getuid) === null || _a === void 0 ? void 0 : _a.call(process)) === 0;
  }
  /**
   * Sanitizies the installer path for using with command line tools.
   */
  get installerPath() {
    var _a, _b;
    return (_b = (_a = super.installerPath) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && _b !== void 0 ? _b : null;
  }
  runCommandWithSudoIfNeeded(commandWithArgs) {
    if (this.isRunningAsRoot()) {
      this._logger.info("Running as root, no need to use sudo");
      return this.spawnSyncLog(commandWithArgs[0], commandWithArgs.slice(1));
    }
    const { name } = this.app;
    const installComment = `"${name} would like to update"`;
    const sudo = this.sudoWithArgs(installComment);
    this._logger.info(`Running as non-root user, using sudo to install: ${sudo}`);
    let wrapper = `"`;
    if (/pkexec/i.test(sudo[0]) || sudo[0] === "sudo") {
      wrapper = "";
    }
    return this.spawnSyncLog(sudo[0], [...sudo.length > 1 ? sudo.slice(1) : [], `${wrapper}/bin/bash`, "-c", `'${commandWithArgs.join(" ")}'${wrapper}`]);
  }
  sudoWithArgs(installComment) {
    const sudo = this.determineSudoCommand();
    const command = [sudo];
    if (/kdesudo/i.test(sudo)) {
      command.push("--comment", installComment);
      command.push("-c");
    } else if (/gksudo/i.test(sudo)) {
      command.push("--message", installComment);
    } else if (/pkexec/i.test(sudo)) {
      command.push("--disable-internal-agent");
    }
    return command;
  }
  hasCommand(cmd) {
    try {
      this.spawnSyncLog(`command`, ["-v", cmd]);
      return true;
    } catch {
      return false;
    }
  }
  determineSudoCommand() {
    const sudos = ["gksudo", "kdesudo", "pkexec", "beesu"];
    for (const sudo of sudos) {
      if (this.hasCommand(sudo)) {
        return sudo;
      }
    }
    return "sudo";
  }
  /**
   * Detects the package manager to use based on the available commands.
   * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
   * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
   * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
   * @param pms - An array of package manager commands to check for, in priority order.
   * @returns The detected package manager command or "unknown" if none are found.
   */
  detectPackageManager(pms) {
    var _a;
    const pmOverride = (_a = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || _a === void 0 ? void 0 : _a.trim();
    if (pmOverride) {
      return pmOverride;
    }
    for (const pm of pms) {
      if (this.hasCommand(pm)) {
        return pm;
      }
    }
    this._logger.warn(`No package manager found in the list: ${pms.join(", ")}. Defaulting to the first one: ${pms[0]}`);
    return pms[0];
  }
}
LinuxUpdater$1.LinuxUpdater = LinuxUpdater;
Object.defineProperty(DebUpdater$1, "__esModule", { value: true });
DebUpdater$1.DebUpdater = void 0;
const Provider_1$4 = Provider$1;
const types_1$3 = types;
const LinuxUpdater_1$2 = LinuxUpdater$1;
class DebUpdater extends LinuxUpdater_1$2.LinuxUpdater {
  constructor(options2, app) {
    super(options2, app);
  }
  /*** @private */
  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = (0, Provider_1$4.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo,
      downloadUpdateOptions,
      task: async (updateFile, downloadOptions) => {
        if (this.listenerCount(types_1$3.DOWNLOAD_PROGRESS) > 0) {
          downloadOptions.onProgress = (it) => this.emit(types_1$3.DOWNLOAD_PROGRESS, it);
        }
        await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
      }
    });
  }
  doInstall(options2) {
    const installerPath = this.installerPath;
    if (installerPath == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt")) {
      this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package."));
      return false;
    }
    const priorityList = ["dpkg", "apt"];
    const packageManager = this.detectPackageManager(priorityList);
    try {
      DebUpdater.installWithCommandRunner(packageManager, installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (error2) {
      this.dispatchError(error2);
      return false;
    }
    if (options2.isForceRunAfter) {
      this.app.relaunch();
    }
    return true;
  }
  static installWithCommandRunner(packageManager, installerPath, commandRunner, logger) {
    var _a;
    if (packageManager === "dpkg") {
      try {
        commandRunner(["dpkg", "-i", installerPath]);
      } catch (error2) {
        logger.warn((_a = error2.message) !== null && _a !== void 0 ? _a : error2);
        logger.warn("dpkg installation failed, trying to fix broken dependencies with apt-get");
        commandRunner(["apt-get", "install", "-f", "-y"]);
      }
    } else if (packageManager === "apt") {
      logger.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured.");
      commandRunner([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        installerPath
      ]);
    } else {
      throw new Error(`Package manager ${packageManager} not supported`);
    }
  }
}
DebUpdater$1.DebUpdater = DebUpdater;
var PacmanUpdater$1 = {};
Object.defineProperty(PacmanUpdater$1, "__esModule", { value: true });
PacmanUpdater$1.PacmanUpdater = void 0;
const types_1$2 = types;
const Provider_1$3 = Provider$1;
const LinuxUpdater_1$1 = LinuxUpdater$1;
class PacmanUpdater extends LinuxUpdater_1$1.LinuxUpdater {
  constructor(options2, app) {
    super(options2, app);
  }
  /*** @private */
  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = (0, Provider_1$3.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo,
      downloadUpdateOptions,
      task: async (updateFile, downloadOptions) => {
        if (this.listenerCount(types_1$2.DOWNLOAD_PROGRESS) > 0) {
          downloadOptions.onProgress = (it) => this.emit(types_1$2.DOWNLOAD_PROGRESS, it);
        }
        await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
      }
    });
  }
  doInstall(options2) {
    const installerPath = this.installerPath;
    if (installerPath == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    try {
      PacmanUpdater.installWithCommandRunner(installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (error2) {
      this.dispatchError(error2);
      return false;
    }
    if (options2.isForceRunAfter) {
      this.app.relaunch();
    }
    return true;
  }
  static installWithCommandRunner(installerPath, commandRunner, logger) {
    var _a;
    try {
      commandRunner(["pacman", "-U", "--noconfirm", installerPath]);
    } catch (error2) {
      logger.warn((_a = error2.message) !== null && _a !== void 0 ? _a : error2);
      logger.warn("pacman installation failed, attempting to update package database and retry");
      try {
        commandRunner(["pacman", "-Sy", "--noconfirm"]);
        commandRunner(["pacman", "-U", "--noconfirm", installerPath]);
      } catch (retryError) {
        logger.error("Retry after pacman -Sy failed");
        throw retryError;
      }
    }
  }
}
PacmanUpdater$1.PacmanUpdater = PacmanUpdater;
var RpmUpdater$1 = {};
Object.defineProperty(RpmUpdater$1, "__esModule", { value: true });
RpmUpdater$1.RpmUpdater = void 0;
const types_1$1 = types;
const Provider_1$2 = Provider$1;
const LinuxUpdater_1 = LinuxUpdater$1;
class RpmUpdater extends LinuxUpdater_1.LinuxUpdater {
  constructor(options2, app) {
    super(options2, app);
  }
  /*** @private */
  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = (0, Provider_1$2.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo,
      downloadUpdateOptions,
      task: async (updateFile, downloadOptions) => {
        if (this.listenerCount(types_1$1.DOWNLOAD_PROGRESS) > 0) {
          downloadOptions.onProgress = (it) => this.emit(types_1$1.DOWNLOAD_PROGRESS, it);
        }
        await this.httpExecutor.download(fileInfo.url, updateFile, downloadOptions);
      }
    });
  }
  doInstall(options2) {
    const installerPath = this.installerPath;
    if (installerPath == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    const priorityList = ["zypper", "dnf", "yum", "rpm"];
    const packageManager = this.detectPackageManager(priorityList);
    try {
      RpmUpdater.installWithCommandRunner(packageManager, installerPath, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (error2) {
      this.dispatchError(error2);
      return false;
    }
    if (options2.isForceRunAfter) {
      this.app.relaunch();
    }
    return true;
  }
  static installWithCommandRunner(packageManager, installerPath, commandRunner, logger) {
    if (packageManager === "zypper") {
      return commandRunner(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", installerPath]);
    }
    if (packageManager === "dnf") {
      return commandRunner(["dnf", "install", "--nogpgcheck", "-y", installerPath]);
    }
    if (packageManager === "yum") {
      return commandRunner(["yum", "install", "--nogpgcheck", "-y", installerPath]);
    }
    if (packageManager === "rpm") {
      logger.warn("Installing with rpm only (no dependency resolution).");
      return commandRunner(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", installerPath]);
    }
    throw new Error(`Package manager ${packageManager} not supported`);
  }
}
RpmUpdater$1.RpmUpdater = RpmUpdater;
var MacUpdater$1 = {};
Object.defineProperty(MacUpdater$1, "__esModule", { value: true });
MacUpdater$1.MacUpdater = void 0;
const builder_util_runtime_1$2 = out;
const fs_extra_1$1 = lib;
const fs_1 = require$$1$1;
const path$2 = require$$1;
const http_1 = require$$0$3;
const AppUpdater_1 = AppUpdater$1;
const Provider_1$1 = Provider$1;
const child_process_1$1 = require$$0$5;
const crypto_1 = require$$0$1;
class MacUpdater extends AppUpdater_1.AppUpdater {
  constructor(options2, app) {
    super(options2, app);
    this.nativeUpdater = require$$1$3.autoUpdater;
    this.squirrelDownloadedUpdate = false;
    this.nativeUpdater.on("error", (it) => {
      this._logger.warn(it);
      this.emit("error", it);
    });
    this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = true;
      this.debug("nativeUpdater.update-downloaded");
    });
  }
  debug(message) {
    if (this._logger.debug != null) {
      this._logger.debug(message);
    }
  }
  closeServerIfExists() {
    if (this.server) {
      this.debug("Closing proxy server");
      this.server.close((err) => {
        if (err) {
          this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
        }
      });
    }
  }
  async doDownloadUpdate(downloadUpdateOptions) {
    let files = downloadUpdateOptions.updateInfoAndProvider.provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info);
    const log2 = this._logger;
    const sysctlRosettaInfoKey = "sysctl.proc_translated";
    let isRosetta = false;
    try {
      this.debug("Checking for macOS Rosetta environment");
      const result = (0, child_process_1$1.execFileSync)("sysctl", [sysctlRosettaInfoKey], { encoding: "utf8" });
      isRosetta = result.includes(`${sysctlRosettaInfoKey}: 1`);
      log2.info(`Checked for macOS Rosetta environment (isRosetta=${isRosetta})`);
    } catch (e) {
      log2.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${e}`);
    }
    let isArm64Mac = false;
    try {
      this.debug("Checking for arm64 in uname");
      const result = (0, child_process_1$1.execFileSync)("uname", ["-a"], { encoding: "utf8" });
      const isArm = result.includes("ARM");
      log2.info(`Checked 'uname -a': arm64=${isArm}`);
      isArm64Mac = isArm64Mac || isArm;
    } catch (e) {
      log2.warn(`uname shell command to check for arm64 failed: ${e}`);
    }
    isArm64Mac = isArm64Mac || process.arch === "arm64" || isRosetta;
    const isArm64 = (file2) => {
      var _a;
      return file2.url.pathname.includes("arm64") || ((_a = file2.info.url) === null || _a === void 0 ? void 0 : _a.includes("arm64"));
    };
    if (isArm64Mac && files.some(isArm64)) {
      files = files.filter((file2) => isArm64Mac === isArm64(file2));
    } else {
      files = files.filter((file2) => !isArm64(file2));
    }
    const zipFileInfo = (0, Provider_1$1.findFile)(files, "zip", ["pkg", "dmg"]);
    if (zipFileInfo == null) {
      throw (0, builder_util_runtime_1$2.newError)(`ZIP file not provided: ${(0, builder_util_runtime_1$2.safeStringifyJson)(files)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    }
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const CURRENT_MAC_APP_ZIP_FILE_NAME = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: zipFileInfo,
      downloadUpdateOptions,
      task: async (destinationFile, downloadOptions) => {
        const cachedUpdateFilePath = path$2.join(this.downloadedUpdateHelper.cacheDir, CURRENT_MAC_APP_ZIP_FILE_NAME);
        const canDifferentialDownload = () => {
          if (!(0, fs_extra_1$1.pathExistsSync)(cachedUpdateFilePath)) {
            log2.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download");
            return false;
          }
          return !downloadUpdateOptions.disableDifferentialDownload;
        };
        let differentialDownloadFailed = true;
        if (canDifferentialDownload()) {
          differentialDownloadFailed = await this.differentialDownloadInstaller(zipFileInfo, downloadUpdateOptions, destinationFile, provider, CURRENT_MAC_APP_ZIP_FILE_NAME);
        }
        if (differentialDownloadFailed) {
          await this.httpExecutor.download(zipFileInfo.url, destinationFile, downloadOptions);
        }
      },
      done: async (event) => {
        if (!downloadUpdateOptions.disableDifferentialDownload) {
          try {
            const cachedUpdateFilePath = path$2.join(this.downloadedUpdateHelper.cacheDir, CURRENT_MAC_APP_ZIP_FILE_NAME);
            await (0, fs_extra_1$1.copyFile)(event.downloadedFile, cachedUpdateFilePath);
          } catch (error2) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${error2.message}`);
          }
        }
        return this.updateDownloaded(zipFileInfo, event);
      }
    });
  }
  async updateDownloaded(zipFileInfo, event) {
    var _a;
    const downloadedFile = event.downloadedFile;
    const updateFileSize = (_a = zipFileInfo.info.size) !== null && _a !== void 0 ? _a : (await (0, fs_extra_1$1.stat)(downloadedFile)).size;
    const log2 = this._logger;
    const logContext = `fileToProxy=${zipFileInfo.url.href}`;
    this.closeServerIfExists();
    this.debug(`Creating proxy server for native Squirrel.Mac (${logContext})`);
    this.server = (0, http_1.createServer)();
    this.debug(`Proxy server for native Squirrel.Mac is created (${logContext})`);
    this.server.on("close", () => {
      log2.info(`Proxy server for native Squirrel.Mac is closed (${logContext})`);
    });
    const getServerUrl = (s) => {
      const address = s.address();
      if (typeof address === "string") {
        return address;
      }
      return `http://127.0.0.1:${address === null || address === void 0 ? void 0 : address.port}`;
    };
    return await new Promise((resolve, reject) => {
      const pass = (0, crypto_1.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
      const authInfo = Buffer.from(`autoupdater:${pass}`, "ascii");
      const fileUrl = `/${(0, crypto_1.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (request, response) => {
        const requestUrl = request.url;
        log2.info(`${requestUrl} requested`);
        if (requestUrl === "/") {
          if (!request.headers.authorization || request.headers.authorization.indexOf("Basic ") === -1) {
            response.statusCode = 401;
            response.statusMessage = "Invalid Authentication Credentials";
            response.end();
            log2.warn("No authenthication info");
            return;
          }
          const base64Credentials = request.headers.authorization.split(" ")[1];
          const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
          const [username, password] = credentials.split(":");
          if (username !== "autoupdater" || password !== pass) {
            response.statusCode = 401;
            response.statusMessage = "Invalid Authentication Credentials";
            response.end();
            log2.warn("Invalid authenthication credentials");
            return;
          }
          const data = Buffer.from(`{ "url": "${getServerUrl(this.server)}${fileUrl}" }`);
          response.writeHead(200, { "Content-Type": "application/json", "Content-Length": data.length });
          response.end(data);
          return;
        }
        if (!requestUrl.startsWith(fileUrl)) {
          log2.warn(`${requestUrl} requested, but not supported`);
          response.writeHead(404);
          response.end();
          return;
        }
        log2.info(`${fileUrl} requested by Squirrel.Mac, pipe ${downloadedFile}`);
        let errorOccurred = false;
        response.on("finish", () => {
          if (!errorOccurred) {
            this.nativeUpdater.removeListener("error", reject);
            resolve([]);
          }
        });
        const readStream = (0, fs_1.createReadStream)(downloadedFile);
        readStream.on("error", (error2) => {
          try {
            response.end();
          } catch (e) {
            log2.warn(`cannot end response: ${e}`);
          }
          errorOccurred = true;
          this.nativeUpdater.removeListener("error", reject);
          reject(new Error(`Cannot pipe "${downloadedFile}": ${error2}`));
        });
        response.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": updateFileSize
        });
        readStream.pipe(response);
      });
      this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${logContext})`);
      this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${getServerUrl(this.server)}, ${logContext})`);
        this.nativeUpdater.setFeedURL({
          url: getServerUrl(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${authInfo.toString("base64")}`
          }
        });
        this.dispatchUpdateDownloaded(event);
        if (this.autoInstallOnAppQuit) {
          this.nativeUpdater.once("error", reject);
          this.nativeUpdater.checkForUpdates();
        } else {
          resolve([]);
        }
      });
    });
  }
  handleUpdateDownloaded() {
    if (this.autoRunAppAfterInstall) {
      this.nativeUpdater.quitAndInstall();
    } else {
      this.app.quit();
    }
    this.closeServerIfExists();
  }
  quitAndInstall() {
    if (this.squirrelDownloadedUpdate) {
      this.handleUpdateDownloaded();
    } else {
      this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded());
      if (!this.autoInstallOnAppQuit) {
        this.nativeUpdater.checkForUpdates();
      }
    }
  }
}
MacUpdater$1.MacUpdater = MacUpdater;
var NsisUpdater$1 = {};
var windowsExecutableCodeSignatureVerifier = {};
Object.defineProperty(windowsExecutableCodeSignatureVerifier, "__esModule", { value: true });
windowsExecutableCodeSignatureVerifier.verifySignature = verifySignature;
const builder_util_runtime_1$1 = out;
const child_process_1 = require$$0$5;
const os = require$$1$2;
const path$1 = require$$1;
function preparePowerShellExec(command, timeout) {
  const executable = `set "PSModulePath=" & chcp 65001 >NUL & powershell.exe`;
  const args = ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", command];
  const options2 = {
    shell: true,
    timeout
  };
  return [executable, args, options2];
}
function verifySignature(publisherNames, unescapedTempUpdateFile, logger) {
  return new Promise((resolve, reject) => {
    const tempUpdateFile = unescapedTempUpdateFile.replace(/'/g, "''");
    logger.info(`Verifying signature ${tempUpdateFile}`);
    (0, child_process_1.execFile)(...preparePowerShellExec(`"Get-AuthenticodeSignature -LiteralPath '${tempUpdateFile}' | ConvertTo-Json -Compress"`, 20 * 1e3), (error2, stdout, stderr) => {
      var _a;
      try {
        if (error2 != null || stderr) {
          handleError(logger, error2, stderr, reject);
          resolve(null);
          return;
        }
        const data = parseOut(stdout);
        if (data.Status === 0) {
          try {
            const normlaizedUpdateFilePath = path$1.normalize(data.Path);
            const normalizedTempUpdateFile = path$1.normalize(unescapedTempUpdateFile);
            logger.info(`LiteralPath: ${normlaizedUpdateFilePath}. Update Path: ${normalizedTempUpdateFile}`);
            if (normlaizedUpdateFilePath !== normalizedTempUpdateFile) {
              handleError(logger, new Error(`LiteralPath of ${normlaizedUpdateFilePath} is different than ${normalizedTempUpdateFile}`), stderr, reject);
              resolve(null);
              return;
            }
          } catch (error3) {
            logger.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(_a = error3.message) !== null && _a !== void 0 ? _a : error3.stack}`);
          }
          const subject = (0, builder_util_runtime_1$1.parseDn)(data.SignerCertificate.Subject);
          let match = false;
          for (const name of publisherNames) {
            const dn = (0, builder_util_runtime_1$1.parseDn)(name);
            if (dn.size) {
              const allKeys = Array.from(dn.keys());
              match = allKeys.every((key) => {
                return dn.get(key) === subject.get(key);
              });
            } else if (name === subject.get("CN")) {
              logger.warn(`Signature validated using only CN ${name}. Please add your full Distinguished Name (DN) to publisherNames configuration`);
              match = true;
            }
            if (match) {
              resolve(null);
              return;
            }
          }
        }
        const result = `publisherNames: ${publisherNames.join(" | ")}, raw info: ` + JSON.stringify(data, (name, value) => name === "RawData" ? void 0 : value, 2);
        logger.warn(`Sign verification failed, installer signed with incorrect certificate: ${result}`);
        resolve(result);
      } catch (e) {
        handleError(logger, e, null, reject);
        resolve(null);
        return;
      }
    });
  });
}
function parseOut(out2) {
  const data = JSON.parse(out2);
  delete data.PrivateKey;
  delete data.IsOSBinary;
  delete data.SignatureType;
  const signerCertificate = data.SignerCertificate;
  if (signerCertificate != null) {
    delete signerCertificate.Archived;
    delete signerCertificate.Extensions;
    delete signerCertificate.Handle;
    delete signerCertificate.HasPrivateKey;
    delete signerCertificate.SubjectName;
  }
  return data;
}
function handleError(logger, error2, stderr, reject) {
  if (isOldWin6()) {
    logger.warn(`Cannot execute Get-AuthenticodeSignature: ${error2 || stderr}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, child_process_1.execFileSync)(...preparePowerShellExec("ConvertTo-Json test", 10 * 1e3));
  } catch (testError) {
    logger.warn(`Cannot execute ConvertTo-Json: ${testError.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  if (error2 != null) {
    reject(error2);
  }
  if (stderr) {
    reject(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${stderr}. Failing signature validation due to unknown stderr.`));
  }
}
function isOldWin6() {
  const winVersion = os.release();
  return winVersion.startsWith("6.") && !winVersion.startsWith("6.3");
}
Object.defineProperty(NsisUpdater$1, "__esModule", { value: true });
NsisUpdater$1.NsisUpdater = void 0;
const builder_util_runtime_1 = out;
const path = require$$1;
const BaseUpdater_1 = BaseUpdater$1;
const FileWithEmbeddedBlockMapDifferentialDownloader_1 = FileWithEmbeddedBlockMapDifferentialDownloader$1;
const types_1 = types;
const Provider_1 = Provider$1;
const fs_extra_1 = lib;
const windowsExecutableCodeSignatureVerifier_1 = windowsExecutableCodeSignatureVerifier;
const url_1 = require$$2;
class NsisUpdater extends BaseUpdater_1.BaseUpdater {
  constructor(options2, app) {
    super(options2, app);
    this._verifyUpdateCodeSignature = (publisherNames, unescapedTempUpdateFile) => (0, windowsExecutableCodeSignatureVerifier_1.verifySignature)(publisherNames, unescapedTempUpdateFile, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(value) {
    if (value) {
      this._verifyUpdateCodeSignature = value;
    }
  }
  /*** @private */
  doDownloadUpdate(downloadUpdateOptions) {
    const provider = downloadUpdateOptions.updateInfoAndProvider.provider;
    const fileInfo = (0, Provider_1.findFile)(provider.resolveFiles(downloadUpdateOptions.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions,
      fileInfo,
      task: async (destinationFile, downloadOptions, packageFile, removeTempDirIfAny) => {
        const packageInfo = fileInfo.packageInfo;
        const isWebInstaller = packageInfo != null && packageFile != null;
        if (isWebInstaller && downloadUpdateOptions.disableWebInstaller) {
          throw (0, builder_util_runtime_1.newError)(`Unable to download new version ${downloadUpdateOptions.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        }
        if (!isWebInstaller && !downloadUpdateOptions.disableWebInstaller) {
          this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version.");
        }
        if (isWebInstaller || downloadUpdateOptions.disableDifferentialDownload || await this.differentialDownloadInstaller(fileInfo, downloadUpdateOptions, destinationFile, provider, builder_util_runtime_1.CURRENT_APP_INSTALLER_FILE_NAME)) {
          await this.httpExecutor.download(fileInfo.url, destinationFile, downloadOptions);
        }
        const signatureVerificationStatus = await this.verifySignature(destinationFile);
        if (signatureVerificationStatus != null) {
          await removeTempDirIfAny();
          throw (0, builder_util_runtime_1.newError)(`New version ${downloadUpdateOptions.updateInfoAndProvider.info.version} is not signed by the application owner: ${signatureVerificationStatus}`, "ERR_UPDATER_INVALID_SIGNATURE");
        }
        if (isWebInstaller) {
          if (await this.differentialDownloadWebPackage(downloadUpdateOptions, packageInfo, packageFile, provider)) {
            try {
              await this.httpExecutor.download(new url_1.URL(packageInfo.path), packageFile, {
                headers: downloadUpdateOptions.requestHeaders,
                cancellationToken: downloadUpdateOptions.cancellationToken,
                sha512: packageInfo.sha512
              });
            } catch (e) {
              try {
                await (0, fs_extra_1.unlink)(packageFile);
              } catch (_ignored) {
              }
              throw e;
            }
          }
        }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(tempUpdateFile) {
    let publisherName;
    try {
      publisherName = (await this.configOnDisk.value).publisherName;
      if (publisherName == null) {
        return null;
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        return null;
      }
      throw e;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(publisherName) ? publisherName : [publisherName], tempUpdateFile);
  }
  doInstall(options2) {
    const installerPath = this.installerPath;
    if (installerPath == null) {
      this.dispatchError(new Error("No update filepath provided, can't quit and install"));
      return false;
    }
    const args = ["--updated"];
    if (options2.isSilent) {
      args.push("/S");
    }
    if (options2.isForceRunAfter) {
      args.push("--force-run");
    }
    if (this.installDirectory) {
      args.push(`/D=${this.installDirectory}`);
    }
    const packagePath = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    if (packagePath != null) {
      args.push(`--package-file=${packagePath}`);
    }
    const callUsingElevation = () => {
      this.spawnLog(path.join(process.resourcesPath, "elevate.exe"), [installerPath].concat(args)).catch((e) => this.dispatchError(e));
    };
    if (options2.isAdminRightsRequired) {
      this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe");
      callUsingElevation();
      return true;
    }
    this.spawnLog(installerPath, args).catch((e) => {
      const errorCode = e.code;
      this._logger.info(`Cannot run installer: error code: ${errorCode}, error message: "${e.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`);
      if (errorCode === "UNKNOWN" || errorCode === "EACCES") {
        callUsingElevation();
      } else if (errorCode === "ENOENT") {
        require$$1$3.shell.openPath(installerPath).catch((err) => this.dispatchError(err));
      } else {
        this.dispatchError(e);
      }
    });
    return true;
  }
  async differentialDownloadWebPackage(downloadUpdateOptions, packageInfo, packagePath, provider) {
    if (packageInfo.blockMapSize == null) {
      return true;
    }
    try {
      const downloadOptions = {
        newUrl: new url_1.URL(packageInfo.path),
        oldFile: path.join(this.downloadedUpdateHelper.cacheDir, builder_util_runtime_1.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: packagePath,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: provider.isUseMultipleRangeRequest,
        cancellationToken: downloadUpdateOptions.cancellationToken
      };
      if (this.listenerCount(types_1.DOWNLOAD_PROGRESS) > 0) {
        downloadOptions.onProgress = (it) => this.emit(types_1.DOWNLOAD_PROGRESS, it);
      }
      await new FileWithEmbeddedBlockMapDifferentialDownloader_1.FileWithEmbeddedBlockMapDifferentialDownloader(packageInfo, this.httpExecutor, downloadOptions).download();
    } catch (e) {
      this._logger.error(`Cannot download differentially, fallback to full download: ${e.stack || e}`);
      return process.platform === "win32";
    }
    return false;
  }
}
NsisUpdater$1.NsisUpdater = NsisUpdater;
(function(exports$1) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports$12) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$12, p)) __createBinding(exports$12, m, p);
  };
  Object.defineProperty(exports$1, "__esModule", { value: true });
  exports$1.NsisUpdater = exports$1.MacUpdater = exports$1.RpmUpdater = exports$1.PacmanUpdater = exports$1.DebUpdater = exports$1.AppImageUpdater = exports$1.Provider = exports$1.NoOpLogger = exports$1.AppUpdater = exports$1.BaseUpdater = void 0;
  const fs_extra_12 = lib;
  const path2 = require$$1;
  var BaseUpdater_12 = BaseUpdater$1;
  Object.defineProperty(exports$1, "BaseUpdater", { enumerable: true, get: function() {
    return BaseUpdater_12.BaseUpdater;
  } });
  var AppUpdater_12 = AppUpdater$1;
  Object.defineProperty(exports$1, "AppUpdater", { enumerable: true, get: function() {
    return AppUpdater_12.AppUpdater;
  } });
  Object.defineProperty(exports$1, "NoOpLogger", { enumerable: true, get: function() {
    return AppUpdater_12.NoOpLogger;
  } });
  var Provider_12 = Provider$1;
  Object.defineProperty(exports$1, "Provider", { enumerable: true, get: function() {
    return Provider_12.Provider;
  } });
  var AppImageUpdater_1 = AppImageUpdater$1;
  Object.defineProperty(exports$1, "AppImageUpdater", { enumerable: true, get: function() {
    return AppImageUpdater_1.AppImageUpdater;
  } });
  var DebUpdater_1 = DebUpdater$1;
  Object.defineProperty(exports$1, "DebUpdater", { enumerable: true, get: function() {
    return DebUpdater_1.DebUpdater;
  } });
  var PacmanUpdater_1 = PacmanUpdater$1;
  Object.defineProperty(exports$1, "PacmanUpdater", { enumerable: true, get: function() {
    return PacmanUpdater_1.PacmanUpdater;
  } });
  var RpmUpdater_1 = RpmUpdater$1;
  Object.defineProperty(exports$1, "RpmUpdater", { enumerable: true, get: function() {
    return RpmUpdater_1.RpmUpdater;
  } });
  var MacUpdater_1 = MacUpdater$1;
  Object.defineProperty(exports$1, "MacUpdater", { enumerable: true, get: function() {
    return MacUpdater_1.MacUpdater;
  } });
  var NsisUpdater_1 = NsisUpdater$1;
  Object.defineProperty(exports$1, "NsisUpdater", { enumerable: true, get: function() {
    return NsisUpdater_1.NsisUpdater;
  } });
  __exportStar(types, exports$1);
  let _autoUpdater;
  function doLoadAutoUpdater() {
    if (process.platform === "win32") {
      _autoUpdater = new NsisUpdater$1.NsisUpdater();
    } else if (process.platform === "darwin") {
      _autoUpdater = new MacUpdater$1.MacUpdater();
    } else {
      _autoUpdater = new AppImageUpdater$1.AppImageUpdater();
      try {
        const identity = path2.join(process.resourcesPath, "package-type");
        if (!(0, fs_extra_12.existsSync)(identity)) {
          return _autoUpdater;
        }
        const fileType = (0, fs_extra_12.readFileSync)(identity).toString().trim();
        switch (fileType) {
          case "deb":
            _autoUpdater = new DebUpdater$1.DebUpdater();
            break;
          case "rpm":
            _autoUpdater = new RpmUpdater$1.RpmUpdater();
            break;
          case "pacman":
            _autoUpdater = new PacmanUpdater$1.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (error2) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", error2.message);
      }
    }
    return _autoUpdater;
  }
  Object.defineProperty(exports$1, "autoUpdater", {
    enumerable: true,
    get: () => {
      return _autoUpdater || doLoadAutoUpdater();
    }
  });
})(main$1);
const icon = require$$1.join(__dirname, "../../resources/icon.png");
const _require = eval("require");
const mongoose = _require("mongoose");
const nodemailer = _require("nodemailer");
const bcrypt = _require("bcryptjs");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: "Dev" },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  progressData: { type: Object, default: {} }
  // Store the user's xp, level, streak, etc.
});
const User = mongoose.model("User", userSchema);
const setupAuth = (ipcMain) => {
  const mongoUri = process.env.VITE_MONGO_URI || process.env.MONGO_URI;
  if (mongoUri) {
    mongoose.connect(mongoUri).then(() => console.log("[AUTH] Connected to MongoDB securely.")).catch((err) => console.error("[AUTH] MongoDB connection error:", err));
  } else {
    console.warn("[AUTH] Missing VITE_MONGO_URI in .env - Authentication will fail.");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    // Or replace with your SMTP host
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
  console.log("[AUTH] SMTP Environment Check:", smtpConfigured ? "LOADED" : "MISSING");
  const sendOTP = async (email, otp) => {
    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { background-color: #0d1117; color: #e6edf3; font-family: sans-serif; margin: 0; padding: 0; }
                    .container { max-width: 500px; margin: 40px auto; background: #161b22; border: 2px solid #a855f7; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 0 30px rgba(168, 85, 247, 0.2); }
                    .header { font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; margin-bottom: 5px; }
                    .subtitle { color: #a855f7; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 30px; }
                    .otp-container { background: #000000; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid rgba(168, 85, 247, 0.3); }
                    .otp-code { font-size: 42px; font-weight: 800; color: #a855f7; letter-spacing: 8px; font-family: monospace; }
                    .footer { font-size: 11px; color: #8b949e; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Security Clearance</div>
                    <div class="subtitle">ALGO_V1S Network Node</div>
                    <p style="font-size: 14px; color: #8b949e;">Your decryption vector for system access is:</p>
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                    </div>
                    <div class="footer">
                        This code expires in <b>10 minutes</b>.<br>
                        If you did not authorize this, secure your terminal.
                    </div>
                </div>
            </body>
            </html>
        `;
    const mailOptions = {
      from: `"ALGO_V1S Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "ALGO_V1S // SECURITY CLEARANCE CODE",
      html: htmlContent
    };
    await transporter.sendMail(mailOptions);
  };
  const getNameFromEmail = (email) => {
    const prefix = email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
  };
  ipcMain.handle("auth:signup", async (event, { email, password, name }) => {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.isVerified) {
        return { success: false, error: "Email already registered." };
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const otp = require$$0$1.randomInt(1e5, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 6e4);
      if (existingUser) {
        if (name) existingUser.name = name;
        existingUser.passwordHash = passwordHash;
        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();
      } else {
        const newUser = new User({ email, name: name || "Dev", passwordHash, otp, otpExpiry });
        await newUser.save();
      }
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendOTP(email, otp);
      } else {
        console.warn(`[AUTH] Simulated OTP for ${email}: ${otp} (SMTP credentials missing)`);
      }
      return { success: true, message: "OTP sent to email." };
    } catch (error2) {
      console.error("[AUTH] Signup Error:", error2);
      return { success: false, error: error2.message };
    }
  });
  ipcMain.handle("auth:verify-otp", async (event, { email, otp }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return { success: false, error: "User not found." };
      if (user.otp !== otp || user.otpExpiry < /* @__PURE__ */ new Date()) {
        return { success: false, error: "Invalid or expired OTP." };
      }
      user.isVerified = true;
      user.otp = void 0;
      user.otpExpiry = void 0;
      if (!user.progressData || Object.keys(user.progressData).length === 0) {
        user.progressData = {
          xp: 0,
          level: 1,
          dailyStreak: 0,
          visitedVisualizers: [],
          unlockedAchievements: []
        };
      }
      await user.save();
      return {
        success: true,
        userId: user._id.toString(),
        name: user.name || getNameFromEmail(email),
        progressData: user.progressData
      };
    } catch (error2) {
      console.error("[AUTH] Verify OTP Error:", error2);
      return { success: false, error: error2.message };
    }
  });
  ipcMain.handle("auth:login", async (event, { email, password }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return { success: false, error: "Invalid credentials." };
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return { success: false, error: "Invalid credentials." };
      const otp = require$$0$1.randomInt(1e5, 999999).toString();
      const otpExpiry = new Date(Date.now() + 10 * 6e4);
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
      if (smtpConfigured) {
        await sendOTP(email, otp);
      } else {
        console.warn(`[AUTH] 2FA OTP for ${email}: ${otp} (SMTP missing)`);
      }
      return {
        success: true,
        requiresOTP: true,
        message: "2FA verification required."
      };
    } catch (error2) {
      console.error("[AUTH] Login Error:", error2);
      return { success: false, error: error2.message };
    }
  });
  ipcMain.handle("auth:sync-progress", async (event, { userId, progressData }) => {
    try {
      await User.findByIdAndUpdate(userId, { progressData });
      return { success: true };
    } catch (error2) {
      console.error("[AUTH] Sync Progress Error:", error2);
      return { success: false, error: error2.message };
    }
  });
};
log.transports.file.level = "info";
main$1.autoUpdater.logger = log;
console.log("[INIT] SMTP Environment Check:", process.env.SMTP_USER && process.env.SMTP_PASS ? "LOADED" : "MISSING");
const execAsync = require$$1$5.promisify(require$$0$5.exec);
require$$1$3.app.commandLine.appendSwitch("enable-gpu-rasterization");
require$$1$3.app.commandLine.appendSwitch("enable-zero-copy");
require$$1$3.app.commandLine.appendSwitch("ignore-gpu-blocklist");
require$$1$3.app.commandLine.appendSwitch("force-gpu-mem-available-mb", "4096");
function createWindow() {
  const mainWindow = new require$$1$3.BrowserWindow({
    width: 1400,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: require$$1.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    require$$1$3.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(require$$1.join(__dirname, "../renderer/index.html"));
  }
}
setupAuth(require$$1$3.ipcMain);
require$$1$3.app.whenReady().then(async () => {
  electronApp.setAppUserModelId("com.electron.algo-visualizer");
  let logoBase64 = "";
  try {
    const logoPath = require$$1.join(require$$1$3.app.getAppPath(), "src/renderer/src/assets/logo-b64.txt");
    logoBase64 = await fs$k.readFile(logoPath, "utf-8");
  } catch (e) {
    console.warn("[AUTH] Failed to pre-load base64 logo:", e.message);
  }
  require$$1$3.app.on("browser-window-created", (_, window2) => {
    optimizer.watchWindowShortcuts(window2);
  });
  createWindow();
  if (require$$1$3.app.isPackaged) {
    log.info("App is packaged, checking for updates...");
    main$1.autoUpdater.checkForUpdatesAndNotify();
  } else {
    log.info("App is running in development mode. Auto-updater disabled.");
  }
  main$1.autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info.version);
  });
  main$1.autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available.", info);
  });
  main$1.autoUpdater.on("error", (err) => {
    log.error("Error in auto-updater.", err);
  });
  main$1.autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded, prompting user...");
    const dialogOpts = {
      type: "info",
      buttons: ["Restart and Install", "Later"],
      title: "Algorithm Visualizer Suite Update",
      message: process.platform === "win32" ? info.releaseNotes || "A new update is ready." : info.releaseName || "A new version is ready.",
      detail: "A new version of the Algorithm Visualizer Suite has been downloaded. Restart the application to apply the critical network updates."
    };
    require$$1$3.dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) main$1.autoUpdater.quitAndInstall();
    });
  });
  require$$1$3.app.on("activate", function() {
    if (require$$1$3.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  require$$1$3.ipcMain.handle("run-code", async (event, { language, code, inputArr }) => {
    try {
      const tempDir = require$$1$3.app.getPath("temp");
      const arrayStr = inputArr.join(",");
      if (language === "python") {
        const filePath = require$$1.join(tempDir, "algo.py");
        await fs$k.writeFile(filePath, code);
        const { stdout, stderr } = await execAsync(`python3 "${filePath}" "${arrayStr}"`, { timeout: 3e3 });
        if (stderr) throw new Error(stderr);
        return stdout;
      } else if (language === "cpp") {
        const codePath = require$$1.join(tempDir, "algo.cpp");
        const outPath = require$$1.join(tempDir, "algo.out");
        await fs$k.writeFile(codePath, code);
        await execAsync(`g++ "${codePath}" -o "${outPath}"`, { timeout: 3e3 });
        const { stdout, stderr } = await execAsync(`"${outPath}" "${arrayStr}"`, { timeout: 3e3 });
        if (stderr) throw new Error(stderr);
        return stdout;
      }
      throw new Error(`Unsupported language: ${language}`);
    } catch (err) {
      throw new Error(err.message || "Execution failed");
    }
  });
  require$$1$3.ipcMain.handle("execute-test-cases", async (_, { code, testCases, functionName, inPlace = false }) => {
    const vm = require("vm");
    const results = [];
    for (let i2 = 0; i2 < testCases.length; i2++) {
      const { input, expected } = testCases[i2];
      const context = vm.createContext({});
      try {
        const script = new vm.Script(`
                    ${code}
                    const input = ${JSON.stringify(input)};
                    const result = ${functionName}(...input);
                    const finalInput = input; // capture for inPlace checks
                    ({ result, finalInput })
                `);
        const { result, finalInput } = script.runInContext(context, { timeout: 2e3 });
        const actual = inPlace ? finalInput[0] : result;
        const isCorrect = JSON.stringify(actual) === JSON.stringify(expected);
        results.push({
          id: i2,
          status: isCorrect ? "pass" : "fail",
          input: JSON.stringify(input),
          expected: JSON.stringify(expected),
          actual: JSON.stringify(actual)
        });
      } catch (err) {
        results.push({
          id: i2,
          status: "error",
          input: JSON.stringify(input),
          expected: JSON.stringify(expected),
          actual: err.message
        });
      }
    }
    return { success: true, tests: results };
  });
});
require$$1$3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$1$3.app.quit();
  }
});
