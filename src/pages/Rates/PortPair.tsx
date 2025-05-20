import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Select from "react-select";
import MainNavbar from "../Navbar";
import ResultTable from "./ResultTable";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function PortPair() {
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    originCountry: null,
    destinationCountry: null,
    cargoType: null,
    containerType: null,
  });

  const originOption = [
    { value: "1", label: "Nhava Sheva" },
  ];

  const destinationOption = [
    { value: "2", label: "Jebel Ali" },
    { value: "4", label: "Los Angeles" }
  ];

  const cargoOption = [
    { value: "1", label: "Consol Cargo" },
    { value: "2", label: "DG" },
  ];

  const TypeOption = [
    { value: "1", label: "20 FT" },
    { value: "2", label: "40 FT" },
  ];

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

    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 2000);
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
                      "Search Rates"
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
            <ResultTable pol={formData.originCountry?.label} pod={formData.destinationCountry?.label} type={formData.containerType?.label} cargo_type = {formData.cargoType?.label} />
          )  : null}
        </Container>
      </div>
    </>
  );
}
