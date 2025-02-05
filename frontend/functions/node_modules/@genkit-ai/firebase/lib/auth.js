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
var auth_exports = {};
__export(auth_exports, {
  firebaseAuth: () => firebaseAuth
});
module.exports = __toCommonJS(auth_exports);
var import_auth = require("firebase-admin/auth");
var import_helpers = require("./helpers.js");
function firebaseAuth(policy, config) {
  var _a;
  (0, import_helpers.initializeAppIfNecessary)();
  const required = (_a = config == null ? void 0 : config.required) != null ? _a : true;
  return {
    policy(auth, input) {
      return __async(this, null, function* () {
        if (required && !auth) {
          throw new Error("Auth is required");
        }
        return policy(auth, input);
      });
    },
    provider(req, res, next) {
      return __async(this, null, function* () {
        var _a2;
        const token = (_a2 = req.headers["authorization"]) == null ? void 0 : _a2.split(/[Bb]earer /)[1];
        let decoded;
        if (!token) {
          if (required) {
            unauthorized(res);
          } else {
            next();
          }
          return;
        }
        try {
          decoded = yield (0, import_auth.getAuth)().verifyIdToken(token);
        } catch (e) {
          unauthorized(res);
          return;
        }
        req.auth = decoded;
        next();
      });
    }
  };
}
function unauthorized(res) {
  res.status(403);
  res.send("Unauthorized");
  res.end();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  firebaseAuth
});
//# sourceMappingURL=auth.js.map