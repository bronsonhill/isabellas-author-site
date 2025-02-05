"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var helpers_exports = {};
__export(helpers_exports, {
  callHttpsFunction: () => callHttpsFunction,
  getErrorMessage: () => getErrorMessage,
  getErrorStack: () => getErrorStack,
  getFunctionUrl: () => getFunctionUrl,
  getLocation: () => getLocation,
  initializeAppIfNecessary: () => initializeAppIfNecessary
});
module.exports = __toCommonJS(helpers_exports);
var import_app = require("firebase-admin/app");
var import_google_auth_library = require("google-auth-library");
let auth;
function getAuthClient() {
  if (!auth) {
    auth = new import_google_auth_library.GoogleAuth();
  }
  return auth;
}
const streamDelimiter = "\n";
function callHttpsFunction(functionName, location, data, streamingCallback) {
  return __async(this, null, function* () {
    const auth2 = getAuthClient();
    let funcUrl = yield getFunctionUrl(functionName, location);
    if (!funcUrl) {
      throw new Error(`Unable to retrieve uri for function at ${functionName}`);
    }
    const tokenClient = yield auth2.getIdTokenClient(funcUrl);
    const token = yield tokenClient.idTokenProvider.fetchIdToken(funcUrl);
    if (streamingCallback) {
      funcUrl += "?stream=true";
    }
    const res = yield fetch(funcUrl, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    if (streamingCallback) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const result = yield reader.read();
        const decodedValue = decoder.decode(result.value);
        if (decodedValue) {
          buffer += decodedValue;
        }
        while (buffer.includes(streamDelimiter)) {
          streamingCallback(
            JSON.parse(buffer.substring(0, buffer.indexOf(streamDelimiter)))
          );
          buffer = buffer.substring(
            buffer.indexOf(streamDelimiter) + streamDelimiter.length
          );
        }
        if (result.done) {
          return buffer;
        }
      }
    }
    const responseText = yield res.text();
    return responseText;
  });
}
const functionUrlCache = {};
function getFunctionUrl(name, location) {
  return __async(this, null, function* () {
    var _a, _b;
    if (functionUrlCache[name]) {
      return functionUrlCache[name];
    }
    const auth2 = getAuthClient();
    const projectId = yield auth2.getProjectId();
    const url = `https://cloudfunctions.googleapis.com/v2beta/projects/${projectId}/locations/${location}/functions/${name}`;
    const client = yield auth2.getClient();
    const res = yield client.request({ url });
    const uri = (_b = (_a = res.data) == null ? void 0 : _a.serviceConfig) == null ? void 0 : _b.uri;
    if (!uri) {
      throw new Error(`Unable to retrieve uri for function at ${url}`);
    }
    functionUrlCache[name] = uri;
    return uri;
  });
}
function getErrorMessage(e) {
  if (e instanceof Error) {
    return e.message;
  }
  return `${e}`;
}
function getErrorStack(e) {
  if (e instanceof Error) {
    return e.stack;
  }
  return void 0;
}
function getLocation() {
  return process.env["GCLOUD_LOCATION"] || "us-central1";
}
function initializeAppIfNecessary() {
  if (!(0, import_app.getApps)().length) {
    (0, import_app.initializeApp)();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  callHttpsFunction,
  getErrorMessage,
  getErrorStack,
  getFunctionUrl,
  getLocation,
  initializeAppIfNecessary
});
//# sourceMappingURL=helpers.js.map