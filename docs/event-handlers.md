[← Back to documentation](readme.md)

# :warning: On event handlers

This plugin will register multiple types of life-cycle event handlers. However, only a single event handler can exist for each type of event (due to a limitation in Cypress). Thus, if you attempt to define any of the same handlers, your handler will either be overriden by this plugin or you will override this plugin's handler. Either way, the behavior will be surprising.

There's an (multiple actually) open [issue](https://github.com/cypress-io/cypress/issues/22428) at Cypress tracking this limitation.

These are the event this plugin will subscribe to:

* before:run
* after:run
* before:spec
* after:spec
* after:screenshot

For example, if you specify a handler for `after:screenshot` and override this plugin's handler, then screenshots will no longer be automatically added to JSON reports. This is just one type of issue that can arise by overriding event handlers.

## Workaround

You can through options, obtain more fine-grained control over event behavior and invoke your own code alongside this plugin, as shown below.

```js
import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import {
  addCucumberPreprocessorPlugin,
  beforeRunHandler,
  afterRunHandler,
  beforeSpecHandler,
  afterSpecHandler,
  afterScreenshotHandler,
} from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    async setupNodeEvents(on, config) {
      // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
      await addCucumberPreprocessorPlugin(on, config, {
        omitBeforeRunHandler: true,
        omitAfterRunHandler: true,
        omitBeforeSpecHandler: true,
        omitAfterSpecHandler: true,
        omitAfterScreenshotHandler: true,
      });

      on("before:run", async (details) => {
        await beforeRunHandler(config);

        // Your own `before:run` code goes here.
      });

      on("after:run", async (results) => {
        await afterRunHandler(config);

        // Your own `after:run` code goes here.
      });

      on("before:spec", async (spec) => {
        await beforeSpecHandler(config);

        // Your own `before:spec` code goes here.
      });

      on("after:spec", async (spec, results) => {
        await afterSpecHandler(config, spec, results);

        // Your own `after:spec` code goes here.
      });

      on("after:screenshot", async (details) => {
        await afterScreenshotHandler(config, details);

        // Your own `after:screenshot` code goes here.
      });

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // Make sure to return the config object as it might have been modified by the plugin.
      return config;
    },
  },
});
```
