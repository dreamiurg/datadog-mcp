import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDatadogConfiguration, getCredentials, getServiceBaseUrl } from "./config.js";

describe("config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getCredentials", () => {
    it("returns credentials when both API and App keys are set", () => {
      process.env.DD_API_KEY = "test-api-key";
      process.env.DD_APP_KEY = "test-app-key";

      const creds = getCredentials();

      expect(creds).toEqual({
        apiKey: "test-api-key",
        appKey: "test-app-key",
      });
    });

    it("throws error when API key is missing", () => {
      process.env.DD_APP_KEY = "test-app-key";
      delete process.env.DD_API_KEY;

      expect(() => getCredentials()).toThrow("Datadog API Key and App Key are required");
    });

    it("throws error when App key is missing", () => {
      process.env.DD_API_KEY = "test-api-key";
      delete process.env.DD_APP_KEY;

      expect(() => getCredentials()).toThrow("Datadog API Key and App Key are required");
    });

    it("throws error when both keys are missing", () => {
      delete process.env.DD_API_KEY;
      delete process.env.DD_APP_KEY;

      expect(() => getCredentials()).toThrow("Datadog API Key and App Key are required");
    });
  });

  describe("getServiceBaseUrl", () => {
    it("returns api-prefixed default site URL when no env var is set", () => {
      delete process.env.DD_SITE;
      delete process.env.DD_LOGS_SITE;
      delete process.env.DD_METRICS_SITE;

      expect(getServiceBaseUrl("default")).toBe("https://api.datadoghq.com");
    });

    it("prepends api. to DD_SITE for default service", () => {
      process.env.DD_SITE = "datadoghq.eu";

      expect(getServiceBaseUrl("default")).toBe("https://api.datadoghq.eu");
    });

    it("uses DD_LOGS_SITE as-is when explicitly set to custom value", () => {
      process.env.DD_SITE = "datadoghq.com";
      process.env.DD_LOGS_SITE = "logs.datadoghq.eu";

      expect(getServiceBaseUrl("logs")).toBe("https://logs.datadoghq.eu");
    });

    it("uses DD_METRICS_SITE as-is when explicitly set to custom value", () => {
      process.env.DD_SITE = "datadoghq.com";
      process.env.DD_METRICS_SITE = "metrics.datadoghq.eu";

      expect(getServiceBaseUrl("metrics")).toBe("https://metrics.datadoghq.eu");
    });

    it("prepends api. when service-specific env matches base site", () => {
      process.env.DD_SITE = "datadoghq.com";
      process.env.DD_LOGS_SITE = "datadoghq.com";

      expect(getServiceBaseUrl("logs")).toBe("https://api.datadoghq.com");
    });

    it("falls back to api-prefixed default site when service-specific env is not set", () => {
      delete process.env.DD_SITE;
      delete process.env.DD_LOGS_SITE;
      delete process.env.DD_METRICS_SITE;

      expect(getServiceBaseUrl("logs")).toBe("https://api.datadoghq.com");
      expect(getServiceBaseUrl("metrics")).toBe("https://api.datadoghq.com");
    });
  });

  describe("createDatadogConfiguration", () => {
    beforeEach(() => {
      process.env.DD_API_KEY = "test-api-key";
      process.env.DD_APP_KEY = "test-app-key";
    });

    it("creates configuration with default options", () => {
      const config = createDatadogConfiguration();

      expect(config).toBeDefined();
      expect(config.authMethods).toBeDefined();
    });

    it("creates configuration with custom site", () => {
      process.env.DD_SITE = "datadoghq.eu";

      const config = createDatadogConfiguration();

      expect(config).toBeDefined();
    });

    it("creates configuration for logs service", () => {
      process.env.DD_LOGS_SITE = "logs.datadoghq.eu";

      const config = createDatadogConfiguration({ service: "logs" });

      expect(config).toBeDefined();
    });

    it("enables unstable operations", () => {
      const config = createDatadogConfiguration({
        unstableOperations: ["v2.listIncidents"],
      });

      expect(config.unstableOperations["v2.listIncidents"]).toBe(true);
    });

    it("enables multiple unstable operations", () => {
      const config = createDatadogConfiguration({
        unstableOperations: ["v2.listIncidents", "v2.createIncident"],
      });

      expect(config.unstableOperations["v2.listIncidents"]).toBe(true);
      expect(config.unstableOperations["v2.createIncident"]).toBe(true);
    });
  });
});
