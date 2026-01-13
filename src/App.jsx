// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import { Container } from 'react-bootstrap';

// Importar Páginas Reales
import Home from './pages/Home';
import Simulacion from './pages/Simulacion';
import Metricas from './pages/Metricas';
import Aviso from './pages/Aviso';
import Educacion from './pages/Educacion';
import Evaluacion from './pages/Evaluacion';

const NotFound = () => <div className="p-5 text-center"><h1>404 - Página no encontrada</h1></div>;

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <MyNavbar />
        <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/educacion" element={<Educacion />} />
              <Route path="/simulacion" element={<Simulacion />} />
              <Route path="/modelos/metricas" element={<Metricas />} />
              <Route path="/evaluacion" element={<Evaluacion />} />
              <Route path="/aviso" element={<Aviso />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </main>
        {/* Footer igual que antes */}
        <footer className="bg-light text-center py-3 mt-auto">
          <Container>
            <small className="text-muted">
              &copy; {new Date().getFullYear()} Proyecto de Tesis - Ingeniería de Software. 
              Este sistema es puramente educativo y NO sustituye un diagnóstico médico.
            </small>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;