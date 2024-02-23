import { AppConfig } from "../config.js";

export const dlog = {
  log: function (message, ...optionalParams) {
    if (AppConfig.debugMode) {
      console.log(message, ...optionalParams);
    }
  },
  error: function (message, ...optionalParams) {
    if (AppConfig.debugMode) {
      console.error(message, ...optionalParams);
    }
  },
  warn: function (message, ...optionalParams) {
    if (AppConfig.debugMode) {
      console.warn(message, ...optionalParams);
    }
  },
  info: function (message, ...optionalParams) {
    if (AppConfig.debugMode) {
      console.info(message, ...optionalParams);
    }
  },
  debug: function (message, ...optionalParams) {
    if (AppConfig.debugMode) {
      console.debug(message, ...optionalParams);
    }
  },
  dir: function (obj, options) {
    if (AppConfig.debugMode) {
      console.dir(obj, options);
    }
  },
};
