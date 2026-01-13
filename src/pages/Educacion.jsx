import { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Accordion } from 'react-bootstrap';
import { getSyntheticCase } from '../services/api';
import { getLabel } from '../utils/translations';

const Educacion = () => {
    const [syntheticData, setSyntheticData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateDemo = async () => {
        setLoading(true);
        try {
            // Usamos diabetes como ejemplo por defecto para la educación
            const { data } = await getSyntheticCase('diabetes');
            setSyntheticData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold text-primary">Módulo Educativo: IA y Datos Sintéticos</h2>
            
            <Row className="mb-5">
                <Col lg={8}>
                    <p className="lead text-muted">
                        ¿Cómo aprenden las máquinas sin comprometer la privacidad de los pacientes reales?
                    </p>
                    <p>
                        En el ámbito de la salud, compartir datos reales es difícil debido a las regulaciones de privacidad. 
                        Aquí es donde entra la <strong>Generación de Datos Sintéticos</strong>.
                    </p>
                    
                    <Accordion defaultActiveKey="0" className="mb-4">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>¿Qué son los Datos Sintéticos?</Accordion.Header>
                            <Accordion.Body>
                                Son datos generados artificialmente que imitan las propiedades estadísticas de los datos reales, 
                                pero no corresponden a ninguna persona real. Esto permite entrenar modelos de IA y realizar 
                                investigaciones sin riesgo de exponer historiales médicos confidenciales.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>¿Qué es una GAN (Red Generativa Antagónica)?</Accordion.Header>
                            <Accordion.Body>
                                Es una arquitectura de IA compuesta por dos redes neuronales que "compiten" entre sí:
                                <ul>
                                    <li><strong>El Generador:</strong> Intenta crear datos falsos que parezcan reales.</li>
                                    <li><strong>El Discriminador:</strong> Intenta distinguir entre datos reales y falsos.</li>
                                </ul>
                                Con el tiempo, el generador se vuelve tan bueno que el discriminador (y los humanos) 
                                no pueden notar la diferencia.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
                
                <Col lg={4}>
                    <Card className="bg-light border-0 shadow-sm">
                        <Card.Body>
                            <h5>💡 Sabías que...</h5>
                            <p className="small">
                                Este proyecto utiliza técnicas como <strong>CTGAN</strong> y modelos probabilísticos 
                                para generar los escenarios de prueba que verás a continuación.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <hr className="my-5" />

            {/* DEMO INTERACTIVA */}
            <div className="bg-white p-4 rounded shadow-sm border">
                <div className="text-center mb-4">
                    <h3>🧪 Laboratorio de Generación de Casos</h3>
                    <p className="text-muted">
                        Pulsa el botón para pedirle a la IA que genere un perfil de paciente sintético basado en patrones de Diabetes.
                    </p>
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={generateDemo} 
                        disabled={loading}
                    >
                        {loading ? 'Generando...' : '✨ Generar Paciente Sintético'}
                    </Button>
                </div>

                {syntheticData && (
                    <div className="animate__animated animate__fadeIn">
                        <h5 className="text-center mb-3">Perfil Generado Artificialmente</h5>
                        <Row className="justify-content-center">
                            <Col md={8}>
                                <Card>
                                    <Table striped bordered hover responsive className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Variable Clínica</th>
                                                <th>Valor Generado</th>
                                                <th>Interpretación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Edad</td>
                                                <td>{syntheticData.age} años</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td>Género</td>
                                                <td>
                                                    {syntheticData.gender_Male === 1 ? 'Masculino' : 
                                                     syntheticData.gender_Female === 1 ? 'Femenino' : 'Otro'}
                                                </td>
                                                <td>Variable categórica</td>
                                            </tr>
                                            <tr>
                                                <td>Glucosa</td>
                                                <td className={syntheticData.glucose > 140 ? 'text-danger fw-bold' : ''}>
                                                    {syntheticData.glucose} mg/dL
                                                </td>
                                                <td>
                                                    {syntheticData.glucose > 200 ? <Badge bg="danger">Muy Alta</Badge> : 
                                                     syntheticData.glucose > 140 ? <Badge bg="warning">Elevada</Badge> : 
                                                     <Badge bg="success">Normal</Badge>}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>IMC (BMI)</td>
                                                <td>{syntheticData.bmi}</td>
                                                <td>
                                                    {syntheticData.bmi > 30 ? 'Obesidad' : 'Peso variable'}
                                                </td>
                                            </tr>
                                            {/* Puedes agregar más filas según desees mostrar */}
                                        </tbody>
                                    </Table>
                                    <Card.Footer className="text-center text-muted small">
                                        Este perfil no existe en la realidad. Ha sido generado matemáticamente.
                                    </Card.Footer>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default Educacion;