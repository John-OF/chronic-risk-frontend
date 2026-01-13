import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MyNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">ChronicRisk AI</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/educacion">Educación</Nav.Link>
            <Nav.Link as={Link} to="/simulacion">Simulador IA</Nav.Link>
            <Nav.Link as={Link} to="/modelos/metricas">Métricas</Nav.Link>
            <Nav.Link as={Link} to="/evaluacion">Evaluación</Nav.Link>
            <Nav.Link as={Link} to="/aviso">Aviso Legal</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;