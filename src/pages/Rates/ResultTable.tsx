import { Container, Table } from "react-bootstrap";
import ratesData from "../../rates.json";
import React from "react";
import { FaShip, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

interface ResultTableProps {
  pol: string;
  pod: string;
  type: string;
  cargo_type: string;
}


export default function ResultTable({ pol, pod, type, cargo_type }: ResultTableProps) {

  
  const rateEntry = ratesData.find((item: any) => item.type === type && item.pol === pol && item.pod === pod && item.cargo_type === cargo_type);
  const charges = rateEntry?.charges;

  
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
  
              {index < fullRoute.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: fadeDelay + 0.1 }}
                >
                  <FaArrowRight className="text-secondary fs-4 mx-2" />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };


  if (!charges || charges.length === 0) {
    return (
      <Container className="my-4">
        <h5 className="text-danger">No rates found for this route.</h5>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ShippingTimeline
        pol={rateEntry.pol}
        pod={rateEntry.pod}
        transhipments={rateEntry.transhipment}
      />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button className="btn btn-success rounded-pill">{rateEntry.liner}</button>
        </motion.div>
        <p className="text-danger mt-2 fw-semibold">
          Valid from {rateEntry.valid_from} to {rateEntry.valid_to}
        </p>
      </div>
      <Table bordered hover responsive>
        {charges?.map((chargeGroup: any, index: number) => {
          const { name, ...nestedCharges } = chargeGroup;

          // Flatten charge items from either direct or nested objects
          const allCharges = Object.values(nestedCharges).flatMap((item) =>
            typeof item === "object" && !Array.isArray(item)
              ? Object.values(item)
              : [item]
          );

          return (
            <React.Fragment key={index}>
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
            </React.Fragment>
          );
        })}

        <tfoot>
          <tr>
            <td colSpan={6} className="text-end fw-bold">
              Total price
            </td>
            <td className="fw-bold">USD {rateEntry.final_booking_rate}</td>
          </tr>
        </tfoot>
      </Table>
      <p className=" text-end text-danger fw-semibold">
          *{rateEntry.exchange_rate}
        </p>
    </Container>
  );
}
