import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="bg-light min-vh-100 d-flex flex-column justify-content-center">
            <Container>
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-primary">Predicción de Riesgo de Enfermedades Crónicas</h1>
                    <p className="lead text-secondary">
                        Una plataforma educativa basada en Inteligencia Artificial y Datos Sintéticos.
                    </p>
                    <hr className="my-4" />
                    <p>
                        Explora cómo el Machine Learning ayuda a identificar factores de riesgo para Diabetes, Hipertensión, Obesidad y Enfermedades Cardiovasculares.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button as={Link} to="/simulacion" variant="primary" size="lg">
                            Probar Simulador
                        </Button>
                        <Button as={Link} to="/educacion" variant="outline-dark" size="lg">
                            Módulo Educativo
                        </Button>
                    </div>
                </div>

                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <div className="h1 mb-3">🤖</div>
                                <Card.Title>Modelos de IA</Card.Title>
                                <Card.Text>
                                    Utilizamos Regresión Logística entrenada con miles de datos clínicos para estimar probabilidades.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <div className="h1 mb-3">📊</div>
                                <Card.Title>Datos Sintéticos (GAN)</Card.Title>
                                <Card.Text>
                                    Aprendizaje seguro mediante datos generados artificialmente que protegen la privacidad real.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="text-center">
                                <div className="h1 mb-3">🎓</div>
                                <Card.Title>Enfoque Educativo</Card.Title>
                                <Card.Text>
                                    Diseñado para estudiantes y público general. Aprende interactuando con las variables.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;