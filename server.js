process.argv = ["node", "next", "start", "-p", process.env.PORT || "3000"];
require("next/dist/bin/next");
