import { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Accordion } from 'react-bootstrap';
import { getSyntheticCase } from '../services/api';

const Educacion = () => {
    const [syntheticData, setSyntheticData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateDemo = async () => {
        setLoading(true);
        try {
            // Solicitamos un caso de Diabetes al backend
            const { data } = await getSyntheticCase('diabetes');
            setSyntheticData(data);
        } catch (error) {
            console.error("Error generando caso:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- FUNCIONES AUXILIARES PARA MOSTRAR DATOS ---

    const getGenderLabel = (data) => {
        // Intenta detectar género desde varias columnas posibles
        if (data.gender_Male === undefined && data.gender_Female === undefined) {
             // Fallback por si la columna no existe en el CSV
             return 'No especificado';
        }
        
        const isMale = Number(data.gender_Male) === 1;
        const isFemale = Number(data.gender_Female) === 1;

        if (isMale) return 'Masculino';
        if (isFemale) return 'Femenino';
        return 'Otro';
    };

    const getSmokingStatus = (data) => {
        if (Number(data.smoking_history_current) === 1) return <Badge bg="danger">Fumador Actual</Badge>;
        if (Number(data.smoking_history_former) === 1) return <Badge bg="warning">Ex-Fumador</Badge>;
        if (Number(data.smoking_history_never) === 1) return <Badge bg="success">Nunca fumó</Badge>;
        return <span className="text-muted">No registrado</span>;
    };

    const getBloodPressure = (data) => {
        // A veces la columna viene como 'blood_pressure', otras como 'ap_hi' (Cardio)
        const bp = data.blood_pressure || data.ap_hi;
        
        if (bp && bp > 0 && bp !== 120) { 
            // Mostramos el dato si existe y no es el default exacto (a menos que sea real)
            return Math.round(bp);
        }
        if (bp === 120) return 120; // Si es 120 real, lo mostramos
        
        return null; // Si no hay dato confiable
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold text-primary">Módulo Educativo: IA y Datos Sintéticos</h2>
            
            {/* SECCIÓN EDUCATIVA RESTAURADA */}
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
                        Pulsa el botón para pedirle a la IA que genere un perfil de paciente sintético con datos variados.
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
                        <Row className="justify-content-center">
                            <Col md={8}>
                                <Card>
                                    <Card.Header className="bg-primary text-white text-center">
                                        Perfil Clínico Generado (IA)
                                    </Card.Header>
                                    <Table striped bordered hover responsive className="mb-0">
                                        <thead>
                                            <tr>
                                                <th style={{width: '40%'}}>Variable Clínica</th>
                                                <th>Valor Generado</th>
                                                <th>Interpretación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* --- DEMOGRÁFICOS --- */}
                                            <tr>
                                                <td>Edad</td>
                                                <td>{Math.floor(syntheticData.age)} años</td>
                                                <td>-</td>
                                            </tr>
                                            <tr>
                                                <td>Género</td>
                                                <td>{getGenderLabel(syntheticData)}</td>
                                                <td>Variable demográfica</td>
                                            </tr>

                                            {/* --- SIGNOS VITALES --- */}
                                            <tr>
                                                <td>IMC (Índice Masa Corporal)</td>
                                                <td>{Number(syntheticData.bmi).toFixed(1)}</td>
                                                <td>
                                                    {syntheticData.bmi >= 30 ? <Badge bg="danger">Obesidad</Badge> : 
                                                     syntheticData.bmi >= 25 ? <Badge bg="warning">Sobrepeso</Badge> : 
                                                     <Badge bg="success">Normal</Badge>}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Presión Arterial</td>
                                                <td>
                                                    {getBloodPressure(syntheticData) ? `${getBloodPressure(syntheticData)} mmHg` : 'N/A'}
                                                </td>
                                                <td>
                                                    {getBloodPressure(syntheticData) >= 140 ? <Badge bg="danger">Hipertensión</Badge> :
                                                     getBloodPressure(syntheticData) >= 130 ? <Badge bg="warning">Elevada</Badge> :
                                                     getBloodPressure(syntheticData) ? <Badge bg="success">Normal</Badge> : '-'}
                                                </td>
                                            </tr>
                                            
                                            {/* --- METABÓLICO --- */}
                                            <tr>
                                                <td>Glucosa en Sangre</td>
                                                <td className={syntheticData.glucose > 140 ? 'fw-bold text-danger' : ''}>
                                                    {Math.round(syntheticData.glucose)} mg/dL
                                                </td>
                                                <td>
                                                    {syntheticData.glucose > 200 ? <Badge bg="danger">Diabetes</Badge> : 
                                                     syntheticData.glucose > 100 ? <Badge bg="warning">Pre-diabetes</Badge> : 
                                                     <Badge bg="success">Normal</Badge>}
                                                </td>
                                            </tr>

                                            {/* --- HISTORIAL / RIESGOS --- */}
                                            <tr>
                                                <td>Hábito Tabáquico</td>
                                                <td colSpan="2">{getSmokingStatus(syntheticData)}</td>
                                            </tr>
                                            <tr>
                                                <td>Enfermedad Cardíaca</td>
                                                <td>
                                                    {Number(syntheticData.heart_disease) === 1 ? 'Presente' : 'Ausente'}
                                                </td>
                                                <td>
                                                    {Number(syntheticData.heart_disease) === 1 && <Badge bg="danger">Riesgo Alto</Badge>}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <Card.Footer className="text-center text-muted small">
                                        ℹ️ Este perfil no existe en la realidad. Ha sido generado matemáticamente por una red CTGAN.
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