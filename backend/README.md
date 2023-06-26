# Backend

## Dependencies

- glib-2.0
- gstreamer-check-1.0
- libudev

## API

#### Getting the list of connected devices

<details>
<summary><code>GET</code> <code><b>/devices</b></code> <code>Retrieves a list of devices connected to the system</code></summary>

##### Parameters

> N/A

##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | 200 | application/json | Device List |

</details>

#### Getting information on a specific device

<details>
<summary><code>GET</code> <code><b>/device</b></code> <code>Retrieves information on a specific device connected to the system</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `index` | required | integer | The index of the connected camera |

##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | 200 | application/json | Device |
> | 400 | N/A | Error, invalid index |

</details>

#### Configuring a camera stream

<details>
<summary><code>POST</code> <code><b>/device</b></code> <code>Configure a camera stream</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `index` | required | integer | The index of the connected camera |
> | `format` | required | object | The format of the stream |
> | `format.format` | required | string | The pixel format of the stream ("MJPG", "H264") |
> | `format.width` | required | integer | The stream width |
> | `format.height` | required | integer | The stream height |
> | `format.interval` | required | object | The stream interval |
> | `format.interval.numerator` | required | integer | The stream interval numerator |
> | `format.interval.denominator` | required | integer | The stream interval denominator |

##### Responses

> | http code | content-type | response |
> |-----------|--------------|----------|
> | 200 | N/A | N/A |
> | 403 | N/A | Error, invalid index |
