import { useState } from "react";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Select from "react-select";
import MainNavbar from "../Navbar";
import ResultTable from "./ResultTable";

export default function PortPair() {
  const [id, setId] = useState<number | null>(null);
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
    { value: "2", label: "Jebel Ali" },
    { value: "3", label: "Singapore" },
    { value: "4", label: "Rotterdam" },
    { value: "5", label: "Bremerhaven" },
  ];

  const cargoOption = [
    { value: "1", label: "Consolidated" },
    { value: "2", label: "General" },
  ];

  const TypeOption = [
    { value: "1", label: "20 DRY" },
    { value: "2", label: "40 DRY" },
  ];

  const handleDataChange = (selectedOption: any, key: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: selectedOption,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setShowResult(false);

    const generatedId =
      parseInt(formData.originCountry?.value) +
      parseInt(formData.destinationCountry?.value);

    // Simulate 2-second loading
    setTimeout(() => {
      setId(generatedId);
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
                    options={originOption}
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
                  <Button variant="success" type="submit">
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
        <Container>
          {showResult && <ResultTable id={id} />}
        </Container>
      </div>
    </>
  );
}
