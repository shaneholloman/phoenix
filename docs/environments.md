---
description: >-
  The Phoenix app can be run in various notebook environments such as colab and
  SageMaker as well as be served via the terminal or a docker container
---

# Environments

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="files"></th></tr></thead><tbody><tr><td><strong>As a Container</strong></td><td>Start a long-running collector</td><td><a href="environments.md#container">#container</a></td><td><a href=".gitbook/assets/docker.png">docker.png</a></td></tr><tr><td><strong>In the notebook</strong></td><td>Run phoenix in the notebook as you run experiments</td><td><a href="environments.md#notebooks">#notebooks</a></td><td><a href=".gitbook/assets/notebook.png">notebook.png</a></td></tr><tr><td><strong>From the Terminal</strong></td><td>Run phoenix via the CLI on your local machine</td><td><a href="environments.md#terminal">#terminal</a></td><td><a href=".gitbook/assets/terminal.png">terminal.png</a></td></tr></tbody></table>

### Notebooks

To start phoenix in the notebook environment, run:

```python
import phoenix as px

session = px.launch_app()
```

This will start a local Phoenix server. You can initialize the phoenix server with various kinds of data (traces, inferences). Check out the [API for details](inferences/how-to-inferences/manage-the-app.md)

{% hint style="info" %}
By default, Phoenix does not persist your data when run in a notebook.
{% endhint %}

### Container

Phoenix server images are available via [Docker Hub](https://hub.docker.com/r/arizephoenix/phoenix). The hosted phoenix server runs as a trace collector and can be used if you want observability for LLM traces via docker compose or simply want a long-running phoenix instance. Below are examples of how to run phoenix va Docker for a specific version.

First pull the image you want to run (note you can use the tag `latest` if you would just like the latest version)

```bash
docker pull arizephoenix/phoenix:latest
```

Now you can run the image you pulled (note you must expose the port `6006` so you can view the UI).

```bash
docker run -p 6006:6006 arizephoenix/phoenix:latest
```

The Phoenix UI will be available at `localhost:6006`.

If you deploy the Phoenix server (collector) to a remote machine, you will have to make sure to configure the remote endpoint as the collector endpoint.

{% tabs %}
{% tab title="Set Endpoint Environment Variable" %}
```python
import os

os.environ["PHOENIX_COLLECTOR_ENDPOINT"] = "http://123.456.789:6006"
```
{% endtab %}
{% endtabs %}

Note that the above is only necessary if your application is running in a Jupyter notebook. If you are trying to deploy your application and have phoenix collect traces via a container, please consult the [deployment guide.](deployment/deploying-phoenix.md)

### Terminal

If you want to start a phoenix server to collect traces, you can also run phoenix directly from the command line

```sh
phoenix serve
```

Or you can explicitly call the server entrypoint if you want to be explicit.

```
python -m phoenix.server.main serve
```

This will start the phoenix server on port 6006. If you are running your instrumented notebook or application on the same machine, traces should automatically be exported to `http://127.0.0.1:6006` so no additional configuration is needed. However if the server is running remotely, you will have to modify the environment variable `PHOENIX_COLLECTOR_ENDPOINT` to point to that machine (e.g. `http://<my-remote-machine>:<port>`)
