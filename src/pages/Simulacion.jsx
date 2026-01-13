import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Nav, Spinner } from 'react-bootstrap';
// Importación consolidada incluyendo getSyntheticCase
import { getConfig, predictRisk, getSyntheticCase } from '../services/api';
import { getLabel } from '../utils/translations';
import Swal from 'sweetalert2';

const DISEASES = ['diabetes', 'hipertension', 'obesidad', 'cardiovascular'];

const Simulacion = () => {
    const [selectedDisease, setSelectedDisease] = useState('diabetes');
    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // 1. Cargar configuración cuando cambia la enfermedad
    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setError(null);
            setResult(null);
            setFormData({}); // Limpiar formulario anterior
            try {
                const { data } = await getConfig(selectedDisease);
                setConfig(data);
                
                // Inicializar valores por defecto para evitar undefined
                const initialData = {};
                // Pre-llenar categóricos con el primer valor
                if (data.categoricals) {
                    Object.keys(data.categoricals).forEach(cat => {
                        initialData[cat] = data.categoricals[cat][0];
                    });
                }
                setFormData(initialData);
                
            } catch (err) {
                console.error(err);
                setError("Error cargando la configuración del modelo.");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [selectedDisease]);

    // 2. NUEVA FUNCIÓN: Generar Caso Sintético
    const handleGenerateSynthetic = async () => {
        setLoading(true);
        try {
            const { data } = await getSyntheticCase(selectedDisease);
            
            // Ajustar los datos al formato del formulario
            // El backend devuelve ej: { gender_Male: 1, gender_Female: 0, age: 50 }
            
            const formattedData = { ...data };
            
            // Reconstruir valores categóricos (One-Hot -> Valor único)
            if (config.categoricals) {
                Object.keys(config.categoricals).forEach(cat => {
                    const options = config.categoricals[cat]; // ['Female', 'Male']
                    
                    options.forEach(opt => {
                        const key = `${cat}_${opt}`; // gender_Male
                        if (data[key] === 1) {
                            formattedData[cat] = opt; // Asignamos "Male" al select
                        }
                    });
                });
            }
            
            setFormData(formattedData);
            setResult(null); // Limpiamos resultado anterior
            
            // Feedback visual
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'info', title: 'Caso virtual generado' });

        } catch (err) {
            console.error(err);
            setError("No se pudo generar el caso sintético.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    // 4. Lógica inteligente para preparar el payload (One-Hot Encoding)
    const preparePayload = () => {
        const payload = { ...formData };
        
        if (config.categoricals) {
            Object.keys(config.categoricals).forEach(catName => {
                const selectedValue = payload[catName]; // Ej: "Male"
                
                // Borramos la clave original (ej. "gender")
                delete payload[catName];

                // Agregamos las claves específicas (ej. "gender_Male")
                config.features.forEach(feat => {
                    if (feat.startsWith(`${catName}_`)) {
                        const option = feat.replace(`${catName}_`, '');
                        payload[feat] = (option === selectedValue) ? 1 : 0;
                    }
                });
            });
        }
        
        return payload;
    };

    // 5. Enviar predicción
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = preparePayload();
            const { data } = await predictRisk(selectedDisease, payload);
            setResult(data);
            
            // Feedback visual bonito
            if (data.prediction === 1) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Atención',
                    text: `El modelo ha detectado un riesgo elevado (${(data.probability * 100).toFixed(1)}%)`,
                    confirmButtonColor: '#d33'
                });
            }
        } catch (err) {
            setError("Error al procesar la predicción.");
        } finally {
            setLoading(false);
        }
    };

    // Renderizado de campos numéricos
    const renderNumberInput = (feat) => {
        const isCategoricalPart = config.categoricals && Object.keys(config.categoricals).some(cat => feat.startsWith(cat + "_"));
        if (isCategoricalPart) return null;

        const range = config.ranges[feat];
        const min = range ? range[0] : 0;
        const max = range ? range[1] : 500;

        return (
            <Form.Group className="mb-3" key={feat}>
                <Form.Label>{getLabel(feat)}</Form.Label>
                <Form.Control 
                    type="number" 
                    name={feat}
                    value={formData[feat] || ''}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    placeholder={`Valor entre ${min} y ${max}`}
                    required
                />
                <Form.Text className="text-muted">
                    Rango recomendado: {min} - {max}
                </Form.Text>
            </Form.Group>
        );
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4 text-primary">Simulador de Riesgo Clínico con IA</h2>
            
            {/* Selector de Enfermedad */}
            <Card className="mb-4 shadow-sm">
                <Card.Header>
                    <Nav variant="tabs" defaultActiveKey="diabetes">
                        {DISEASES.map(d => (
                            <Nav.Item key={d}>
                                <Nav.Link 
                                    active={selectedDisease === d}
                                    onClick={() => setSelectedDisease(d)}
                                    className="text-capitalize"
                                >
                                    {getLabel(d)}
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                </Card.Header>
            </Card>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading && !config ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                config && (
                    <Row>
                        {/* Columna Izquierda: FORMULARIO */}
                        <Col md={7}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    
                                    {/* CABECERA DEL FORMULARIO CON BOTÓN SINTÉTICO */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Card.Title className="mb-0">Parámetros Clínicos</Card.Title>
                                        <Button 
                                            variant="outline-info" 
                                            size="sm" 
                                            onClick={handleGenerateSynthetic}
                                            disabled={loading}
                                        >
                                            🎲 Generar Caso Virtual
                                        </Button>
                                    </div>

                                    <Form onSubmit={handleSubmit}>
                                        
                                        {/* 1. Renderizar Selectores Categóricos */}
                                        {config.categoricals && Object.keys(config.categoricals).map(cat => (
                                            <Form.Group className="mb-3" key={cat}>
                                                <Form.Label>{getLabel(cat)}</Form.Label>
                                                <Form.Select 
                                                    name={cat} 
                                                    value={formData[cat] || ''} 
                                                    onChange={handleChange}
                                                >
                                                    {config.categoricals[cat].map(opt => (
                                                        <option key={opt} value={opt}>
                                                            {getLabel(opt)}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        ))}

                                        {/* 2. Renderizar Inputs Numéricos */}
                                        {config.features.map(feat => renderNumberInput(feat))}

                                        <div className="d-grid gap-2 mt-4">
                                            <Button variant="primary" size="lg" type="submit" disabled={loading}>
                                                {loading ? 'Analizando...' : 'Calcular Riesgo'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Columna Derecha: RESULTADOS */}
                        <Col md={5}>
                            <Card className={`text-center shadow h-100 ${result ? 'border-primary' : ''}`}>
                                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                    {!result ? (
                                        <div className="text-muted opacity-50">
                                            <h1 style={{ fontSize: '4rem' }}>🩺</h1>
                                            <p>Ingresa los datos del paciente para obtener una predicción en tiempo real.</p>
                                        </div>
                                    ) : (
                                        <div className="w-100 animate__animated animate__fadeIn">
                                            <h4 className="text-muted mb-3">Probabilidad Estimada</h4>
                                            
                                            {/* Visualización de Riesgo */}
                                            <div className="mb-4">
                                                <h1 className={`display-3 fw-bold ${result.prediction === 1 ? 'text-danger' : 'text-success'}`}>
                                                    {(result.probability * 100).toFixed(1)}%
                                                </h1>
                                                <ProgressBar 
                                                    now={result.probability * 100} 
                                                    variant={result.prediction === 1 ? 'danger' : 'success'} 
                                                    style={{ height: '20px' }}
                                                    striped
                                                    animated
                                                />
                                            </div>

                                            <Card 
                                                bg={result.prediction === 1 ? 'danger' : 'success'} 
                                                text="white" 
                                                className="mb-3"
                                            >
                                                <Card.Body>
                                                    <Card.Title>
                                                        {result.prediction === 1 ? 'ALTO RIESGO DETECTADO' : 'BAJO RIESGO DETECTADO'}
                                                    </Card.Title>
                                                    <Card.Text>
                                                        {result.prediction === 1 
                                                            ? "El modelo sugiere una alta probabilidad de padecer la condición basada en los patrones aprendidos."
                                                            : "Los parámetros ingresados se mantienen dentro de los rangos considerados seguros por el modelo."
                                                        }
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>

                                            <div className="text-start mt-4">
                                                <small className="text-muted">
                                                    <strong>Nota educativa:</strong> Este resultado se basa en un modelo de Regresión Logística entrenado con datos históricos. 
                                                    La probabilidad se ajusta dinámicamente si ingresas valores críticos (ej. Glucosa {'>'} 200).
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )
            )}
        </Container>
    );
};

export default Simulacion;