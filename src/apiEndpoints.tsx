const BASE_URL = "https://demo.api.ocean.schedules.intemo.tech";
// const BASE_URL = "http://localhost:8080";


const DOCX_BASE_URL = "https://demo.api.docx.idp.intemo.tech";

const apiEndpoints = {
  getDirectTradeLines: (origin: string, destination: string, startDate: string, endDate: string) =>
    `${BASE_URL}/tradeLine/all/direct?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,

  getRateSheet: (originPortId: number, destinationPortId: number, containerType: string) =>
    `${DOCX_BASE_URL}/rate-sheet?originPortId=${originPortId}&destinationPortId=${destinationPortId}&containerType=${containerType}`,
};

export default apiEndpoints;