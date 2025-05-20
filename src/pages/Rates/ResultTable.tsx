import { Container, Table, Button, Card, Row, Col, Modal, Accordion, Badge, Form } from "react-bootstrap";
import ratesData from "../../rates.json";
import React, { useState } from "react";
import { FaShip, FaArrowRight } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

interface ResultTableProps {
  pol: string;
  pod: string;
  type: string;
  cargo_type: string;
}

const ShippingTimeline = ({
  pol,
  pod,
  transhipments,
}: {
  pol: string;
  pod: string;
  transhipments: string[];
}) => {
  const fullRoute = [pol, ...transhipments, pod];

  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap gap-3 mb-4">
      {fullRoute.map((port, index) => {
        const isPol = index === 0;
        const isPod = index === fullRoute.length - 1;

        const colorClass = isPol
          ? "bg-primary"
          : isPod
          ? "bg-danger"
          : "bg-warning";

        const fadeDelay = index * 0.2;

        return (
          <React.Fragment key={index}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: fadeDelay }}
            >
              <div className="text-center">
                <div
                  className={`text-white rounded-pill px-3 py-2 shadow-sm d-inline-flex align-items-center ${colorClass}`}
                  style={{ minWidth: 140 }}
                >
                  <FaShip className="me-2" />
                  <span className="fw-semibold">{port}</span>
                </div>
              </div>
            </motion.div>

            {/* Ship icon between ports */}
            {index < fullRoute.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: fadeDelay + 0.1 }}
              >
                <FaArrowRight size={24} className="text-muted" />
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function ResultTable({ pol, pod, type, cargo_type }: ResultTableProps) {
  const filteredRates = ratesData.filter(
    (item: any) =>
      item.type === type &&
      item.pol === pol &&
      item.pod === pod &&
      item.cargo_type === cargo_type
  );

  const [success, setSuccess] = useState(false);
  const [selectedLiner, setSelectedLiner] = useState<any>(filteredRates[0]);
  const [compareMode, setCompareMode] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const handlePopupOpen = (entry: any) => {
    setSelectedLiner(entry);
    setShowPopup(true);
  };
  const handlePopupClose = () => setShowPopup(false);

  const handleConfirmRates = () => {
    setSuccess(true);
   
    setTimeout(() => {
       setShowPopup(false);  
       setSuccess(false); 
       setSelectedLiner(null);
    }, 1500); // 1.5 seconds delay
  };

  if (!filteredRates.length) {
    return (
      <Container className="my-4">
        <h5 className="text-danger">No rates found for this route.</h5>
      </Container>
    );
  }

  const parseRate = (rate: string | number): number =>
  Number(String(rate).replace(/,/g, ''));

  // Find the cheapest entry
  const cheapestEntry = filteredRates.reduce((min, curr) =>
    parseRate(curr.final_booking_rate) < parseRate(min.final_booking_rate) ? curr : min
  );

  return (
    <Container className="my-4">
      <ShippingTimeline
        pol={filteredRates[0].pol}
        pod={filteredRates[0].pod}
        transhipments={filteredRates[0].transhipment}
      />

      <div className="text-end mb-3">
        <Button variant="outline-primary" onClick={() => setCompareMode(!compareMode)}>
          {compareMode ? "Hide Comparison" : "Compare Rates"}
        </Button>
      </div>

      {!compareMode && (
        <Accordion>
          {filteredRates.map((entry: any, index: number) => {
            const isCheapest = entry.final_booking_rate === cheapestEntry.final_booking_rate;

            return (
              <Accordion.Item eventKey={index.toString()} key={index}>
                
                <Accordion.Header>
                  <div className="d-flex justify-content-between w-100 my-2 align-items-center">
                    {/* Left section: liner name + checkbox */}
                    <div className="d-flex align-items-center gap-2">
                      <Form.Check
                        type="checkbox"
                        checked={selectedLiner === entry}
                        onClick={(e) => e.stopPropagation()} // prevent accordion toggle
                        onChange={() => setSelectedLiner(entry)}
                      />
                      <span className="fw-semibold text-primary">{entry.liner}</span>
                    </div>

                    {/* Right section: price + cheapest badge */}
                    <div className="d-flex align-items-center gap-2">
                      {isCheapest && (
                        <Badge className="glitter-badge ms-2" pill>
                          Cheapest
                        </Badge>
                      )}
                      <span className="text-success fw-bold mx-3">USD {entry.final_booking_rate}</span>
                    </div>
                  </div>
                </Accordion.Header>

                <Accordion.Body>
                    <div className="text-danger text-end my-2 fw-semibold">
                      Valid from {entry.valid_from} to {entry.valid_to}
                    </div>

                  <Table bordered hover responsive>
                    {entry.charges.map((chargeGroup: any, i: number) => {
                      const { name,total_price, ...nestedCharges } = chargeGroup;
                      const allCharges = Object.values(nestedCharges).flatMap((item) =>
                        typeof item === "object" && !Array.isArray(item)
                          ? Object.values(item)
                          : [item]
                      );

                      return (
                        <React.Fragment key={i}>
                          <thead className="table-secondary">
                            <tr>
                              <th>{name}</th>
                              <th>Basis</th>
                              <th>Quantity</th>
                              <th>Currency</th>
                              <th>Unit price</th>
                              <th>Total price</th>
                              <th>USD price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allCharges.map((item: any, j: number) => (
                              <tr key={j}>
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
                        </React.Fragment>
                      );
                    })}
                    <tfoot>
                      <tr>
                        <td colSpan={6} className="text-end fw-bold">
                          Total price
                        </td>
                        <td className="fw-bold">USD {entry.final_booking_rate}</td>
                      </tr>
                    </tfoot>
                  </Table>
                  <p className="text-end text-danger fw-semibold">*{entry.exchange_rate}</p>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      {compareMode && (
        <Table bordered hover responsive className="mt-4">
          <thead className="table-light">
            <tr>
              {/* <th rowSpan={2}>Charge</th> */}
              {filteredRates.map((entry: any, idx: number) => (
                <th key={idx} colSpan={entry.charges.length} className="text-center">
                  {entry.liner}
                </th>
              ))}
            </tr>
            <tr>
              {filteredRates.map((entry, idx: number) => (
                <React.Fragment key={idx}>
                  <th colSpan={entry.charges.length}>Total Price : {entry.final_booking_rate} USD</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {filteredRates.map((entry: any, idx: number) => (
                <React.Fragment key={idx}>
                  {entry?.charges.map((charge: any, i: number) => (
                    <td key={i}>{charge.name}</td>
                  ))}
                </React.Fragment>
              ))}
            </tr>
            <tr>
              {filteredRates.map((entry: any, idx: number) => (
                <React.Fragment key={idx}>
                  {entry?.charges.map((charge: any, i: number) => (
                    <td key={i}>{charge.total_price}</td>
                  ))}
                </React.Fragment>
              ))}
            </tr>
          </tbody>

          <tfoot>
            <tr>
              {filteredRates.map((entry: any, idx: number) => (
                <td colSpan={entry.charges.length} key={idx} className="fw-bold">
                  <Button
                    // variant="link"
                    size="sm"
                    className=""
                    onClick={() => handlePopupOpen(entry)}
                    title="View detailed charges"
                  >
                    View Detailed Charges
                  </Button>
                </td>
              ))}
            </tr>
          </tfoot>

        </Table>
      )}

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
            Confirm this rate
          </Button> }
          <Button variant="secondary" onClick={handlePopupClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      

      {selectedLiner && <div className="text-end">
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => {
            setShowPopup(true);
          }}
        >
          Select Rates
        </Button>
      </div> }

    </Container>
  );
}
