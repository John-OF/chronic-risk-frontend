import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ProgressBar, Nav, Spinner, Badge } from 'react-bootstrap';
import { getConfig, predictRisk, getSyntheticCase } from '../services/api';
import { getLabel } from '../utils/translations';
import Swal from 'sweetalert2';
// Importamos componentes de gráficos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const DISEASES = ['diabetes', 'hipertension', 'obesidad', 'cardiovascular'];

// --- CONFIGURACIÓN DE LÍMITES CLÍNICOS REALISTAS ---
const CLINICAL_LIMITS = {
    age: { min: 1, max: 120, label: "1 - 100 años" },
    pregnancies: { min: 0, max: 20, label: "0 - 10 (aprox)" },
    glucose: { min: 40, max: 500, label: "70 - 200 mg/dL" },
    blood_pressure: { min: 50, max: 300, label: "90 - 180 mmHg" },
    skin_thickness: { min: 0, max: 99, label: "10 - 50 mm" },
    insulin: { min: 0, max: 900, label: "15 - 276 mu U/ml" },
    bmi: { min: 10, max: 90, label: "18.5 - 40" },
    diabetes_pedigree: { min: 0, max: 3, label: "0.08 - 2.42" },
    hba1c_level: { min: 3, max: 15, label: "4 - 9 %" },
    heart_disease: { min: 0, max: 1, label: "0 (No) - 1 (Sí)" }, 
    hypertension: { min: 0, max: 1, label: "0 (No) - 1 (Sí)" },
    default: { min: 0, max: 1000, label: "Valor positivo" }
};

const Simulacion = () => {
    const [selectedDisease, setSelectedDisease] = useState('diabetes');
    const [config, setConfig] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Estado para resultados
    const [currentResult, setCurrentResult] = useState(null); // Resultado actual
    const [baseResult, setBaseResult] = useState(null);       // Resultado base para comparar
    const [error, setError] = useState(null);

    // 1. Cargar configuración
    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setError(null);
            setCurrentResult(null);
            setBaseResult(null); // Resetear comparación al cambiar enfermedad
            setFormData({}); 
            try {
                const { data } = await getConfig(selectedDisease);
                setConfig(data);
                
                const initialData = {};
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

    // 2. Generar Caso Sintético
    const handleGenerateSynthetic = async () => {
        setLoading(true);
        try {
            const { data } = await getSyntheticCase(selectedDisease);
            const formattedData = { ...data };
            
            if (config.categoricals) {
                Object.keys(config.categoricals).forEach(cat => {
                    const options = config.categoricals[cat];
                    options.forEach(opt => {
                        const key = `${cat}_${opt}`;
                        if (data[key] === 1) {
                            formattedData[cat] = opt;
                        }
                    });
                });
            }
            
            setFormData(formattedData);
            setCurrentResult(null); // Limpiar resultado al cambiar datos
            
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'info', title: 'Caso virtual generado' });

        } catch (err) {
            console.error(err);
            setError("No se pudo generar el caso sintético.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        // Si el usuario edita algo, "invalidamos" el resultado actual visualmente
        // pero mantenemos el baseResult si existe para comparar luego
        if (currentResult && !baseResult) {
            setCurrentResult(null); 
        }

        if (type === 'number') {
            const numValue = parseFloat(value);
            const limits = CLINICAL_LIMITS[name] || CLINICAL_LIMITS.default;

            if (numValue < 0) return; 
            
            if (value === '' || numValue <= limits.max) {
                setFormData(prev => ({ ...prev, [name]: value === '' ? '' : numValue }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const preparePayload = () => {
        const payload = { ...formData };
        if (config.categoricals) {
            Object.keys(config.categoricals).forEach(catName => {
                const selectedValue = payload[catName];
                delete payload[catName];
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

    // 4. Enviar predicción
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = preparePayload();
            const { data } = await predictRisk(selectedDisease, payload);
            setCurrentResult(data);
            
            // Si no estamos comparando, mostramos alerta. Si estamos comparando, solo actualizamos gráfica.
            if (!baseResult && data.prediction === 1) {
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

    // 5. Lógica de Comparación
    const handleSetBaseCase = () => {
        setBaseResult(currentResult);
        setCurrentResult(null); // Limpiamos el actual para invitar al usuario a cambiar datos
        Swal.fire({
            icon: 'success',
            title: 'Caso Base Fijado',
            text: 'Ahora modifica las variables (ej. baja el peso, deja de fumar) y vuelve a calcular para ver la diferencia.'
        });
    };

    const handleResetComparison = () => {
        setBaseResult(null);
        setCurrentResult(null);
        setFormData({}); // Opcional: limpiar form
    };

    // Renderizado de campos numéricos
    const renderNumberInput = (feat) => {
        const isCategoricalPart = config.categoricals && Object.keys(config.categoricals).some(cat => feat.startsWith(cat + "_"));
        if (isCategoricalPart) return null;

        if (feat === 'pregnancies' && formData['gender'] === 'Male') return null;

        const limits = CLINICAL_LIMITS[feat] || CLINICAL_LIMITS.default;

        return (
            <Form.Group className="mb-3" key={feat}>
                <Form.Label>{getLabel(feat)}</Form.Label>
                <Form.Control 
                    type="number" 
                    name={feat}
                    value={formData[feat] || ''}
                    onChange={handleChange}
                    min={limits.min}
                    max={limits.max}
                    placeholder={`Ej: ${limits.min} - ${limits.max}`}
                    required
                />
                <Form.Text className="text-muted">
                    Rango recomendado: {limits.label}
                </Form.Text>
            </Form.Group>
        );
    };

    // --- COMPONENTE DE GRÁFICO COMPARATIVO ---
    const renderComparisonChart = () => {
        if (!baseResult || !currentResult) return null;

        const data = [
            {
                name: 'Probabilidad de Riesgo',
                Base: (baseResult.probability * 100).toFixed(1),
                Nuevo: (currentResult.probability * 100).toFixed(1),
            }
        ];

        const diff = (currentResult.probability * 100) - (baseResult.probability * 100);
        const isImprovement = diff < 0; // Si bajó el riesgo, es bueno

        return (
            <div className="mt-4 animate__animated animate__fadeIn">
                <hr />
                <h5 className="mb-3">⚖️ Comparativa de Escenarios</h5>
                
                <Alert variant={isImprovement ? 'success' : 'warning'}>
                    <strong>Conclusión: </strong> 
                    {isImprovement 
                        ? `¡Excelente! Con estos cambios, tu riesgo estimado se reduciría un ${Math.abs(diff).toFixed(1)}%.`
                        : `Cuidado. Estos cambios aumentarían tu riesgo estimado en un ${Math.abs(diff).toFixed(1)}%.`
                    }
                </Alert>

                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} unit="%" />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Base" fill="#8884d8" name="Escenario Inicial" barSize={30} />
                            <Bar dataKey="Nuevo" fill={isImprovement ? "#82ca9d" : "#ff7300"} name="Escenario Simulado" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4 text-primary">Simulador de Riesgo Clínico con IA</h2>
            
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
                        <Col md={7}>
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Card.Title className="mb-0">Parámetros Clínicos</Card.Title>
                                        <div className="d-flex gap-2">
                                            {/* Botón Reset */}
                                            {baseResult && (
                                                <Button variant="outline-secondary" size="sm" onClick={handleResetComparison}>
                                                    🔄 Reiniciar
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outline-info" 
                                                size="sm" 
                                                onClick={handleGenerateSynthetic}
                                                disabled={loading || baseResult} // Desactivar si estamos comparando para no romper lógica
                                            >
                                                🎲 Caso Virtual
                                            </Button>
                                        </div>
                                    </div>

                                    {baseResult && (
                                        <Alert variant="info" className="py-2">
                                            <small>Modo Comparación: Cambia los valores (ej. baja el peso) y recalcula.</small>
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        {config.categoricals && Object.keys(config.categoricals).map(cat => (
                                            <Form.Group className="mb-3" key={cat}>
                                                <Form.Label>{getLabel(cat)}</Form.Label>
                                                <Form.Select 
                                                    name={cat} 
                                                    value={formData[cat] || ''} 
                                                    onChange={handleChange}
                                                >
                                                    {config.categoricals[cat].map(opt => (
                                                        <option key={opt} value={opt}>{getLabel(opt)}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        ))}

                                        {config.features.map(feat => renderNumberInput(feat))}

                                        <div className="d-grid gap-2 mt-4">
                                            <Button variant="primary" size="lg" type="submit" disabled={loading}>
                                                {loading ? 'Analizando...' : (baseResult ? 'Comparar Nuevo Escenario' : 'Calcular Riesgo')}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={5}>
                            <Card className={`text-center shadow h-100 ${currentResult ? 'border-primary' : ''}`}>
                                <Card.Body className="d-flex flex-column justify-content-center">
                                    {/* MODO 1: Sin resultado aún */}
                                    {!currentResult && !baseResult && (
                                        <div className="text-muted opacity-50">
                                            <h1 style={{ fontSize: '4rem' }}>🩺</h1>
                                            <p>Ingresa los datos del paciente para obtener una predicción.</p>
                                        </div>
                                    )}

                                    {/* MODO 2: Resultado Único (Base o Nuevo) */}
                                    {currentResult && (
                                        <div className="w-100 animate__animated animate__fadeIn">
                                            <h4 className="text-muted mb-3">
                                                {baseResult ? "Nuevo Escenario" : "Probabilidad Estimada"}
                                            </h4>
                                            
                                            <div className="mb-4">
                                                <h1 className={`display-3 fw-bold ${currentResult.prediction === 1 ? 'text-danger' : 'text-success'}`}>
                                                    {(currentResult.probability * 100).toFixed(1)}%
                                                </h1>
                                                <ProgressBar 
                                                    now={currentResult.probability * 100} 
                                                    variant={currentResult.prediction === 1 ? 'danger' : 'success'} 
                                                    style={{ height: '20px' }}
                                                    striped animated
                                                />
                                            </div>

                                            <Card bg={currentResult.prediction === 1 ? 'danger' : 'success'} text="white" className="mb-3">
                                                <Card.Body>
                                                    <Card.Title>
                                                        {currentResult.prediction === 1 ? 'RIESGO ALTO' : 'RIESGO BAJO'}
                                                    </Card.Title>
                                                </Card.Body>
                                            </Card>

                                            {/* Botón para iniciar comparación */}
                                            {!baseResult && (
                                                <Button 
                                                    variant="outline-primary" 
                                                    className="w-100 mt-3"
                                                    onClick={handleSetBaseCase}
                                                >
                                                    ⚖️ ¿Qué pasa si cambio algo? (Comparar)
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* MODO 3: Gráfica de Comparación */}
                                    {renderComparisonChart()}

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