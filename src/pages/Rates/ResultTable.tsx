import { Container, Table } from "react-bootstrap";
import ratesData from "../../rates.json";
import React from "react";

interface ResultTableProps {
  id: number;
}


export default function ResultTable({ id }: ResultTableProps) {

  console.log(id);

  const rateEntry = ratesData.find((item: any) => item.id === id);
  const charges = rateEntry?.charges;

  if (!charges || charges.length === 0) {
    return (
      <Container className="my-4">
        <h5 className="text-danger">No rates found for this route.</h5>
      </Container>
    );
  }

  return (
    <Container className="my-4">
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
            <td className="fw-bold">USD 3,752.00</td>
          </tr>
        </tfoot>
      </Table>

      <p className="text-start text-danger mt-2 fw-semibold">
        Valid from {ratesData[0].valid_from} to {ratesData[0].valid_to}
      </p>
    </Container>
  );
}
