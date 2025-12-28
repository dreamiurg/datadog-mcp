"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRequest = datadogRequest;
const config_js_1 = require("./config.js");
const logger_js_1 = require("./logger.js");
const log = (0, logger_js_1.createHttpLogger)("datadog");
/**
 * Makes an authenticated HTTP request to the Datadog API.
 * This is useful for endpoints not fully supported by the official SDK.
 *
 * @param options - Request configuration
 * @returns Parsed JSON response
 * @throws HttpError if the request fails
 */
async function datadogRequest(options) {
    const { service, path, method = "POST", body } = options;
    const { apiKey, appKey } = (0, config_js_1.getCredentials)();
    const baseUrl = (0, config_js_1.getServiceBaseUrl)(service);
    const url = `${baseUrl}${path}`;
    log.debug({ method, url, service }, "HTTP request start");
    const headers = {
        "Content-Type": "application/json",
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
    };
    const startTime = Date.now();
    const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const durationMs = Date.now() - startTime;
    if (!response.ok) {
        const error = {
            status: response.status,
            message: await response.text(),
        };
        log.warn({ method, url, status: response.status, error: error.message }, "HTTP error");
        throw error;
    }
    log.debug({ method, url, status: response.status, durationMs }, "HTTP response received");
    return response.json();
}
