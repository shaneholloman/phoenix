import { createClient } from "../client";
import { ClientFn } from "../types/core";
import { Example, DatasetSelector } from "../types/datasets";
import invariant from "tiny-invariant";

export type AppendDatasetExamplesParams = ClientFn & {
  /**
   * The dataset to append examples to
   */
  dataset: DatasetSelector;
  /**
   * The examples to append to the dataset
   */
  examples: Example[];
};

export type AppendDatasetExamplesResponse = {
  datasetId: string;
  // TODO: respond with the versionId
  // versionId: string;
};

/**
 * Append examples to an existing dataset
 * @experimental this interface may change in the future
 */
export async function appendDatasetExamples({
  client: _client,
  dataset,
  examples,
}: AppendDatasetExamplesParams): Promise<AppendDatasetExamplesResponse> {
  const client = _client || createClient();
  const inputs = examples.map((example) => example.input);
  const outputs = examples.map((example) => example.output ?? {}); // Treat null as an empty object
  const metadata = examples.map((example) => example.metadata);
  const appendResponse = await client.POST("/v1/datasets/upload", {
    params: {
      query: {
        sync: true,
      },
    },
    body: {
      name: dataset.datasetId,
      action: "append",
      inputs,
      outputs,
      metadata,
    },
  });
  invariant(appendResponse.data?.data, "Failed to append dataset examples");
  const datasetId = appendResponse.data.data.dataset_id;
  return {
    datasetId,
  };
}
