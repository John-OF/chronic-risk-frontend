import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';

const Evaluacion = () => {
    // Reemplaza esto con el link real de tu Google Forms
    const GOOGLE_FORMS_URL = "https://docs.google.com/forms/d/e/TU_ID_AQUI/viewform";

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <h2 className="mb-4 fw-bold text-primary">Validación del Sistema</h2>
                    <p className="lead">
                        Tu participación es fundamental para medir la utilidad didáctica de esta plataforma.
                    </p>
                    
                    <Card className="shadow-sm mb-4 border-0 bg-light">
                        <Card.Body>
                            <h5>¿Qué estás evaluando?</h5>
                            <p className="text-muted">
                                El objetivo de esta prueba es recolectar datos sobre dos aspectos clave para nuestra investigación:
                            </p>
                            <ListGroup variant="flush" className="bg-transparent">
                                <ListGroup.Item className="bg-transparent">
                                    <strong>1. Usabilidad (SUS):</strong> Qué tan fácil e intuitiva te resultó la navegación y el uso del simulador.
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent">
                                    <strong>2. Experiencia de Usuario (UEQ-S):</strong> Tu percepción emocional y técnica al interactuar con la Inteligencia Artificial.
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent">
                                    <strong>3. Claridad Educativa:</strong> Si la información proporcionada ayudó a comprender mejor los factores de riesgo.
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    <div className="text-center p-5 border rounded bg-white shadow-sm">
                        <h4 className="mb-3">Formulario de Evaluación</h4>
                        <p className="mb-4 text-secondary">
                            El proceso toma aproximadamente 3 a 5 minutos. No recolectamos datos personales identificables.
                        </p>
                        <Button 
                            variant="success" 
                            size="lg" 
                            href={GOOGLE_FORMS_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-5 py-3 fw-bold"
                        >
                            📋 Abrir Formulario en Google Forms
                        </Button>
                        <div className="mt-3 small text-muted">
                            (Se abrirá en una nueva pestaña)
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Evaluacion;