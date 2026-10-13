import { Markdown } from "./markdown";

const markdown = `
# Connection Lost
## Please make sure dweOS is accesible by this device.

### Potential Issues:
- **Network Setup:** Your network setup may have lost connection.
- **dweOS Status:** Ensure that dweOS is running and accessible.

For more information, please refer to the [dweOS documentation](https://docs.dwe.ai/software/dwe-os/dwe-os-2).
`;

const NotConnected = () => {
  return (
    <div className="p-6 w-full">
      <Markdown>{markdown}</Markdown>
    </div>
  );
};

export default NotConnected;
