import { useEffect, useState } from "react";
import MainNavbar from "./Navbar";
import { Container, Row, Col, Form, Spinner, Alert } from "react-bootstrap";

export default function ExcelUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setUploadProgress(0);
      setSuccess(false);
      setIsUploading(true);
    }
  };

  useEffect(() => {
    let interval: any;

    if (isUploading) {
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setSuccess(true);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
    }

    return () => clearInterval(interval);
  }, [isUploading]);

  return (
    <div style={{ minHeight: "100vh" }}>
      <MainNavbar />
      <Container className="pt-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center bg-white p-4 rounded shadow">
            <h3 className="mb-4">Upload Rate Sheet</h3>
            <Form.Group controlId="formFile" className="mb-4">
              <Form.Control type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
            </Form.Group>

            {isUploading && (
              <div className="d-flex flex-column align-items-center">
                <div className="position-relative mb-3">
                  <Spinner animation="border" role="status" style={{ width: "5rem", height: "5rem" }} />
                  <div className="position-absolute top-50 start-50 translate-middle fs-5 fw-bold">
                    {uploadProgress}%
                  </div>
                </div>
                <p>Uploading file...</p>
              </div>
            )}

            {success && (
              <Alert variant="success" className="mt-3">
                ✅ File has been uploaded successfully!
              </Alert>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
