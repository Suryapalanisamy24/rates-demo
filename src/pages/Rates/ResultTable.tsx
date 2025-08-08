import { Container, Table, Button, Modal, Accordion, Badge, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { FaShip, FaArrowRight } from "react-icons/fa";
import apiEndpoints from "../../apiEndpoints";
import axios from "axios";
import { fetchRateSheet } from "../../service/ratesheets";

interface ResultTableProps {
  pol: string;
  pod: string;
  type: string;
  cargo_type: string;
}

// const ShippingTimeline = ({
//   pol,
//   pod,
//   transhipments,
// }: {
//   pol: string;
//   pod: string;
//   transhipments: string[];
// }) => {
//   const fullRoute = [pol, ...transhipments, pod];

//   return (
//     <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mb-4">
//       {fullRoute.map((port, index) => {
//         const isPol = index === 0;
//         const isPod = index === fullRoute.length - 1;

//         const colorClass = isPol
//           ? "bg-primary"
//           : isPod
//             ? "bg-danger"
//             : "bg-warning";

//         const fadeDelay = index * 0.2;

//         return (
//           <React.Fragment key={index}>
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: fadeDelay }}
//             >
//               <div className="text-center">
//                 <div
//                   className={`text-white rounded-pill px-3 py-2 shadow-sm d-inline-flex align-items-center ${colorClass}`}
//                   style={{ minWidth: 140 }}
//                 >
//                   <FaShip className="me-2" />
//                   <span className="fw-semibold">{port}</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Ship icon between ports */}
//             {index < fullRoute.length - 1 && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: fadeDelay + 0.1 }}
//               >
//                 <FaArrowRight size={24} className="text-muted" />
//               </motion.div>
//             )}
//           </React.Fragment>
//         );
//       })}
//     </div>
//   );
// };

export default function ResultTable({ pol, pod, type, cargo_type, setLoading, setShowResult }: ResultTableProps) {


  const [success, setSuccess] = useState(false);
  const [selectedLiner, setSelectedLiner] = useState<any>();
  const [compareMode, setCompareMode] = useState(false);
  const [rates, setRates] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    const fetchTradeLines = async () => {
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

    fetchTradeLines();
  }, []);


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


 

  const handlePopupOpen = (entry: any) => {
    setSelectedLiner(entry);
    setShowPopup(true);
  };
  const handlePopupClose = () => setShowPopup(false);




  return (
    <Container className="my-4">

      <Accordion>
        {schedules.map((entry: any, index: number) => {
          
           if (!entry.matchedRates || entry.matchedRates.length === 0) return null;
          // const isCheapest = entry.final_booking_rate === cheapestEntry.final_booking_rate;

          const diffInMs = new Date(entry.routes[0].eta).getTime() - new Date(entry.routes[0].etd).getTime();
          const transitDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

          return (
            <Accordion.Item eventKey={index.toString()} key={index} className="accordion-item-custom my-3 shadow-sm">

              <Accordion.Header className="accordion-header-custom">
                <div className="d-flex justify-content-between align-items-center w-100 px-2 py-3 gap-3 flex-wrap">

                  {/* Left Section */}
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: '150px' }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedLiner === entry}
                      onClick={(e) => e.stopPropagation()}
                    // onChange={() => setSelectedLiner(entry)}
                    />
                    <span className="fw-semibold text-primary">{entry.carrierName}</span>
                  </div>

                  {/* Center Section: Route */}
                  <div className="text-center d-flex flex-column align-items-center" style={{ flex: 1, minWidth: '340px', maxWidth: '500px' }}>

                    {/* Dates on Top */}
                    <div className="d-flex justify-content-between w-100 px-4">
                      <div className="text-dark fw-semibold">{entry.routes[0].etd}</div>
                      <div className="small text-dark fw-medium">{entry.routes[0].vesselName}</div>
                      <div className="text-dark fw-semibold">{entry.routes[0].eta}</div>
                    </div>

                    {/* Dotted Line + Ship Icon */}
                    <div className="position-relative w-100 my-2" style={{ height: '20px' }}>
                      {/* Dotted line */}
                      <div className="position-absolute top-50 start-0 w-100 translate-middle-y" style={{ borderTop: '2px dotted #6c757d' }}></div>

                      {/* Start Dot */}
                      <div className="position-absolute top-50 start-0 translate-middle" style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#6c757d',
                        borderRadius: '50%',
                        boxShadow: '0 0 4px #6c757d',
                      }}></div>

                      {/* Ship Icon in middle */}
                      <div className="position-absolute top-50 start-50 translate-middle bg-white px-1">
                        <FaShip size={16} className="text-secondary" />
                      </div>

                      {/* End Dot */}
                      <div className="position-absolute top-50 end-0 translate-middle-y" style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#6c757d',
                        borderRadius: '50%',
                        boxShadow: '0 0 4px #6c757d',
                      }}></div>
                    </div>

                    {/* Codes and Transit */}
                    <div className="d-flex justify-content-between w-100 px-4">
                      <div className="fw-semibold text-muted small">{entry.polCode}</div>
                      <div className="text-muted small">{transitDays} Days</div>
                      <div className="fw-semibold text-muted small">{entry.podCode}</div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: '160px', justifyContent: 'flex-end' }}>

                    <span className="text-success fw-bold">USD {entry.matchedRates[0].totalAmount.toFixed(2)}</span>
                  </div>

                </div>
              </Accordion.Header>

              

              <Accordion.Body className="accordion-body-custom px-4 pt-3">
                <div className="text-danger text-end my-2 fw-semibold">
                  Valid from {entry?.matchedRates[0].freight.start_date} to {entry?.matchedRates[0].freight.expiryDate}
                </div>

                <Table bordered hover responsive>
                  {/* Freight Charges */}
                 
                    <React.Fragment key={`freight`}>
                      <thead className="table-secondary">
                        <tr>
                          <th>Freight Charges</th>
                          <th>Basis</th>
                          <th>Quantity</th>
                          <th>Currency</th>
                          <th>Unit price</th>
                          <th>Total price</th>
                          <th>USD price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.matchedRates[0].freight.rates.map((rate, j) => (
                          <tr key={`freight-rate-${j}`}>
                            <td>Base Freight ({rate.containerType})</td>
                            <td>per_container</td>
                            <td>1</td>
                            <td>{entry.matchedRates[0].freight.currency}</td>
                            <td>{rate.amount}</td>
                            <td>{rate.amount}</td>
                            <td>{rate.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </React.Fragment>
                  

                  {/* Common Charges */}
                  {entry?.matchedRates[0].commonCharges.length > 0 && (
                    <React.Fragment>
                      <thead className="table-secondary">
                        <tr>
                          <th>Common Charges</th>
                          <th>Basis</th>
                          <th>Quantity</th>
                          <th>Currency</th>
                          <th>Unit price</th>
                          <th>Total price</th>
                          <th>USD price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry?.matchedRates[0].commonCharges.map((charge, i) => (
                          <tr key={`common-charge-${i}`}>
                            <td>{charge.chargeDescription}</td>
                            <td>{charge.basis}</td>
                            <td>1</td>
                            <td>{charge.currency}</td>
                            <td>{charge.amount}</td>
                            <td>{charge.amount}</td>
                            <td>{charge.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </React.Fragment>
                  )}

                  <tfoot>
                    <tr>
                      <td colSpan={6} className="text-end fw-bold">
                        Total price
                      </td>
                      <td className="fw-bold">
                        USD{" "}
                       {entry?.matchedRates[0].totalAmount.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  </tfoot>
                </Table>

                {/* <p className="text-end text-danger fw-semibold">*{entry.exchange_rate}</p> */}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>

      <Modal show={showPopup} onHide={handlePopupClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Charge Breakdown</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && (
            <div className="animated-success">
              ✅ Rate has been selected successfully!
            </div>
          )}
          {!success && showPopup && selectedLiner.charges.map((chargeGroup: any, index: number) => {
            const { name, total_price, ...nestedCharges } = chargeGroup;
            const allCharges = Object.values(nestedCharges).flatMap((item) =>
              typeof item === "object" && !Array.isArray(item)
                ? Object.values(item)
                : [item]
            );

            return (
              <div key={index} className="mb-3">
                <h6 className="fw-bold text-success">{name}</h6>
                <Table striped bordered size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Basis</th>
                      <th>Quantity</th>
                      <th>Currency</th>
                      <th>Unit price</th>
                      <th>Total price</th>
                      <th>USD price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCharges.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.basis}</td>
                        <td>{item.qty}</td>
                        <td>{item.currency}</td>
                        <td>{item.unit_rate}</td>
                        <td>{item.total_rate}</td>
                        <td>{item.usd_rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>

          {!compareMode && !success && <Button variant="success" onClick={() => handleConfirmRates()}>
            Confirm this quotes
          </Button>}
          <Button variant="secondary" onClick={handlePopupClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}
