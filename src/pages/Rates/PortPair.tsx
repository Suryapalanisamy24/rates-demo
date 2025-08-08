import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Select from "react-select";
import MainNavbar from "../Navbar";
import ResultTable from "./ResultTable";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import apiEndpoints from "../../apiEndpoints";
import axios from "axios";
import { fetchRateSheet } from "../../service/ratesheets";

export default function PortPair() {
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    originCountry: null,
    destinationCountry: null,
    cargoType: null,
    containerType: null,
  });

  const originOption = [
    { value: "1", label: "NHAVA SHEVA" },
  ];

  const destinationOption = [
    { value: "2", label: "JEBEL ALI" },
    // { value: "4", label: "LOS ANGELES" }
  ];

  const cargoOption = [
    { value: "1", label: "Consol Cargo" },
    { value: "2", label: "DG" },
  ];

  const TypeOption = [
    { value: "1", label: "20 FT" },
    { value: "2", label: "40 FT" },
  ];


    const fetchTradeLines = async (pol, pod) => {
      try {
        const url = apiEndpoints.getDirectTradeLines(
          pol,
          pod,
          "01 Aug 2025",
          "30 Aug 2025"
        );

        const response = await axios.get(url);
        const ratesData = await fetchRateSheet();
        const groupedRates = groupFreightsWithChargesAndMatchSchedules(ratesData, response.data.result);
        console.log("Grouped rates:", groupedRates);
        console.log("Fetched rates data:", ratesData);
        console.log("Fetched trade lines:", response.data);
        // setRates(groupedRates);
        setSchedules(groupedRates);
        setLoading(false);
        setShowResult(true);
      } catch (error) {
        console.error("Error fetching trade lines:", error);
        alert("Failed to fetch trade lines. Please try again later.");
        setLoading(false);
        setShowResult(false);
      } finally {
        // setLoading(false);
        setShowResult(true);
        setLoading(false);
      }
    };



  function groupFreightsWithChargesAndMatchSchedules(
    ratesData: {
      freight: any[];
      originCharges: any[];
      destinationCharges: any[];
      commonCharges: any[];
    },
    scheduleData: any[]
  ) {
    // Step 1: Filter freights by latest expiry per carrier
    const groupedByCarrier: Record<string, any[]> = {};
    for (const freight of ratesData.freight) {
      if (!freight.carrier) continue;
      if (!groupedByCarrier[freight.carrier]) groupedByCarrier[freight.carrier] = [];
      groupedByCarrier[freight.carrier].push(freight);
    }

    const filteredFreights = Object.values(groupedByCarrier).map((items) =>
      items.reduce((latest, current) =>
        new Date(current.expiryDate) > new Date(latest.expiryDate) ? current : latest
      )
    );

    // Step 2: Group charges by fileId
    const chargesByFileId: Record<string, any> = {};

    const allCharges = [
      ...ratesData.originCharges.map((c) => ({ ...c, chargeType: "origin" })),
      ...ratesData.destinationCharges.map((c) => ({ ...c, chargeType: "destination" })),
      ...ratesData.commonCharges.map((c) => ({ ...c, chargeType: "common" })),
    ];

    for (const charge of allCharges) {
      if (!charge.fileId) continue;
      if (!chargesByFileId[charge.fileId]) {
        chargesByFileId[charge.fileId] = {
          origin: [],
          destination: [],
          common: [],
        };
      }
      chargesByFileId[charge.fileId][charge.chargeType].push(charge);
    }

    // Step 3: Combine freight + matching charges
    const filteredRates = filteredFreights.map((freight) => {
      const fileId = freight.fileId;
      const matchedCharges = chargesByFileId[fileId] || {
        origin: [],
        destination: [],
        common: [],
      };

      const sumCharges = (charges: any[]) =>
        charges.reduce((acc, c) => acc + (Number(c.amount || c.rateAmount || 0)), 0);

      const originTotal = sumCharges(matchedCharges.origin);
      const destinationTotal = sumCharges(matchedCharges.destination);
      const commonTotal = sumCharges(matchedCharges.common);
      const freightTotal = sumCharges(freight.rates);

      const freightAmount = Number(freight.totalAmount || 0);

      const totalAmount = freightAmount + originTotal + destinationTotal + commonTotal + freightTotal;

      return {
        fileId,
        carrier: freight.carrier,
        expiryDate: freight.expiryDate,
        startDate: freight.start_date,
        freight,
        totalAmount,
        originCharges: matchedCharges.origin,
        destinationCharges: matchedCharges.destination,
        commonCharges: matchedCharges.common,
      };
    });

    // Step 4: Match with scheduleData based on carrier & etd < expiryDate
    const matchedSchedules = scheduleData.map((schedule) => {
      const scheduleCarrier = schedule.carrierName?.toLowerCase();

      let etdDate: Date | null = null;
      // if (Array.isArray(schedule.originpolEtd) && schedule.originpolEtd.length === 3) {
      //   const [year, month, day] = schedule.originpolEtd;
      //   etdDate = new Date(year, month - 1, day); // Month is 0-indexed
      // } else if (schedule.polEtd) {
      etdDate = new Date(schedule.polEtd);
      // }

      const matchedRates = filteredRates.filter((rate) => {
        return (
          rate.carrier?.toLowerCase() === scheduleCarrier && etdDate &&
          etdDate < new Date(rate.expiryDate) && etdDate >= new Date("01 Aug 2025")
        );
      });

      return {
        ...schedule,
        matchedRates, // This is the rates that matched the carrier + expiry rule
      };
    });

    return matchedSchedules;
  }

  const handleDataChange = (selectedOption: any, key: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: selectedOption,
    }));
    setShowResult(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setShowResult(false);
    fetchTradeLines(
      formData.originCountry?.label,
      formData.destinationCountry?.label
    );
  };

  return (
    <>
      <MainNavbar />
      <div className="d-flex justify-content-center mt-4">
        <Container>
          <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Origin Port</Form.Label>
                  <Select
                    value={formData.originCountry}
                    onChange={(selectedOption) =>
                      handleDataChange(selectedOption, "originCountry")
                    }
                    options={originOption}
                    isClearable
                    placeholder="Select origin"
                    required
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Destination Port</Form.Label>
                  <Select
                    value={formData.destinationCountry}
                    onChange={(selectedOption) =>
                      handleDataChange(selectedOption, "destinationCountry")
                    }
                    options={destinationOption}
                    isClearable
                    placeholder="Select Destination"
                    required
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Cargo Type</Form.Label>
                  <Select
                    value={formData.cargoType}
                    onChange={(selectedOption) =>
                      handleDataChange(selectedOption, "cargoType")
                    }
                    options={cargoOption}
                    isClearable
                    placeholder="Select Cargo Type"
                    required
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group>
                  <Form.Label>Container Type</Form.Label>
                  <Select
                    value={formData.containerType}
                    onChange={(selectedOption) =>
                      handleDataChange(selectedOption, "containerType")
                    }
                    options={TypeOption}
                    isClearable
                    placeholder="Select Container Type"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col className="d-flex justify-content-center align-items-end">
                <Form.Group>
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{" "}
                        Loading...
                      </>
                    ) : (
                      "Search Quotes"
                    )}
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <Container className="text-center mt-4">
          {loading && (
            <div className="d-flex justify-content-center mt-3">
              <DotLottieReact
                src="https://lottie.host/57e1dc0a-7999-426f-a21c-94c1cddfe5eb/o2uwXb8YvI.lottie"
                loop
                autoplay
                style={{ width: "150px", height: "150px" }}
              />
            </div>
          )}
          {!loading && showResult ? (
            <ResultTable schedules={schedules} />
          ) : null}
        </Container>
      </div>
    </>
  );
}
