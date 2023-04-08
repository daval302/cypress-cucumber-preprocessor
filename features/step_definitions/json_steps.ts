import { Then } from "@cucumber/cucumber";
import path from "path";
import { promises as fs } from "fs";
import assert from "assert";
import { PNG } from "pngjs";

function isObject(object: any): object is object {
  return typeof object === "object" && object != null;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function* traverseTree(object: any): Generator<object, void, any> {
  if (!isObject(object)) {
    throw new Error(`Expected object, got ${typeof object}`);
  }

  yield object;

  for (const property of Object.values(object)) {
    if (isObject(property)) {
      yield* traverseTree(property);
    }
  }
}

function prepareJsonReport(tree: any) {
  for (const node of traverseTree(tree)) {
    if (hasOwnProperty(node, "duration")) {
      node.duration = 0;
    } else if (hasOwnProperty(node, "uri") && typeof node.uri === "string") {
      node.uri = node.uri.replace(/\\/g, "/");
    }
  }

  return tree;
}

Then("there should be no JSON output", async function () {
  await assert.rejects(
    () => fs.readFile(path.join(this.tmpDir, "cucumber-report.json")),
    {
      code: "ENOENT",
    },
    "Expected there to be no JSON file"
  );
});

Then(
  "there should be a JSON output similar to {string}",
  async function (fixturePath) {
    const absolutejsonPath = path.join(this.tmpDir, "cucumber-report.json");

    const json = await fs.readFile(absolutejsonPath);

    const absoluteExpectedJsonpath = path.join(
      process.cwd(),
      "features",
      fixturePath
    );

    const actualJsonOutput = prepareJsonReport(JSON.parse(json.toString()));

    if (process.env.WRITE_FIXTURES) {
      await fs.writeFile(
        absoluteExpectedJsonpath,
        JSON.stringify(actualJsonOutput, null, 2) + "\n"
      );
    } else {
      const expectedJsonOutput = JSON.parse(
        (await fs.readFile(absoluteExpectedJsonpath)).toString()
      );
      assert.deepStrictEqual(actualJsonOutput, expectedJsonOutput);
    }
  }
);

Then(
  "the JSON report should contain an image attachment for what appears to be a screenshot",
  async function () {
    const absolutejsonPath = path.join(this.tmpDir, "cucumber-report.json");

    const jsonFile = await fs.readFile(absolutejsonPath);

    const actualJsonOutput = JSON.parse(jsonFile.toString());

    const embeddings: { data: string; mime_type: string }[] = actualJsonOutput
      .flatMap((feature: any) => feature.elements)
      .flatMap((element: any) => element.steps)
      .flatMap((step: any) => step.embeddings ?? []);

    if (embeddings.length === 0) {
      throw new Error("Expected to find an embedding in JSON, but found none");
    } else if (embeddings.length > 1) {
      throw new Error(
        "Expected to find a single embedding in JSON, but found " +
          embeddings.length
      );
    }

    const [embedding] = embeddings;

    assert.strictEqual(embedding.mime_type, "image/png");

    const png = await new Promise<PNG>((resolve, reject) => {
      new PNG().parse(
        Buffer.from(embedding.data, "base64"),
        function (error, data) {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        }
      );
    });

    const expectedDimensions = {
      width: 1280,
      height: 720,
    };

    const { width: actualWidth, height: actualHeight } = png;

    assert.strictEqual(actualWidth, expectedDimensions.width);
    assert.strictEqual(actualHeight, expectedDimensions.height);
  }
);

Then("the JSON report should contain a spec", async function () {
  const absolutejsonPath = path.join(this.tmpDir, "cucumber-report.json");

  const jsonFile = await fs.readFile(absolutejsonPath);

  const actualJsonOutput = JSON.parse(jsonFile.toString());

  if (actualJsonOutput.length !== 1) {
    throw new Error(
      `Expected to find a single spec, but found ${actualJsonOutput.length}`
    );
  }
});

Then("the JSON report shouldn't contain any specs", async function () {
  const absolutejsonPath = path.join(this.tmpDir, "cucumber-report.json");

  const jsonFile = await fs.readFile(absolutejsonPath);

  const actualJsonOutput = JSON.parse(jsonFile.toString());

  if (actualJsonOutput.length > 0) {
    throw new Error(
      `Expected to find zero specs, but found ${actualJsonOutput.length}`
    );
  }
});
