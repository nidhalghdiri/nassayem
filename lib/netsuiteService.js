import axios from "axios";

const NETSUITE_URL =
  "https://5319757.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1383&deploy=1&compid=5319757&ns-at=AAEJ7tMQoUSE8dkJldkfmiHMe5TOpqflYIRtKzoy4RgExTcbiHI";

export default {
  async request(action, params = {}) {
    try {
      const response = await axios.get(NETSUITE_URL, {
        params: {
          action,
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      console.error("NetSuite request failed:", error);
      return { error: "Failed to connect to NetSuite" };
    }
  },
};
