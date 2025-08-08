import { Navbar, Container, Nav } from "react-bootstrap";
import MainLogoSvg from "../assets/images/download.png";

export default function MainNavbar(){
    return(
        <Navbar expand="lg" className="" style={{ backgroundColor: "#fff" }}>
            <Container>
                <Navbar.Brand href="" className="">
                <img
                    src={MainLogoSvg}
                    width="200"
                    height="74"
                    className="d-inline-block align-top"
                    alt="Main Logo"
                />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/excel-upload">Excel Upload</Nav.Link>
                        <Nav.Link href="/quotes">Quotation</Nav.Link>
                        <Nav.Link href="/my-quotes">My Quotes</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}