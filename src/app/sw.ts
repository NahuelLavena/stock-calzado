import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: [
    { url: "/offline", revision: "1" },
  ],
});

serwist.addEventListeners();
