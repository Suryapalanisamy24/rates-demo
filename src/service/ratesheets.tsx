// Example: src/services/rateSheetService.ts
import axios from "axios";
import apiEndpoints from "../apiEndpoints";

export const fetchRateSheet = async () => {
  const originPortId = 750;
  const destinationPortId = 913;
  // const fileId = "ac819ce3-7877-4806-ba1c-410e050fadbc";
  const containerType = "20GP";

  const url = apiEndpoints.getRateSheet(originPortId, destinationPortId, containerType);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBpbnRlbW8udGVjaCIsImVtYWlsIjoiYWRtaW5AaW50ZW1vLnRlY2giLCJleHAiOjE3NTQ4NDk2Njl9.3N_Cna445O6DP6kMCrxTo-KzUzrTDEqDLby1kabquKM`,
        Accept: "application/json, text/plain, */*",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Origin: "https://demo.app.idp.intemo.tech",
        Referer: "https://demo.app.idp.intemo.tech/",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching rate sheet:", error);
    throw error;
  }
};


