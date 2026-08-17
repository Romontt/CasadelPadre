// Cargar la librería oficial de Supabase CDN (si la usas desde HTML) o import si usas Bundler
// Asegúrate de incluir el script CDN de Supabase en tu HTML principal:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-LLAVE-ANON-PUBLICA';

// Inicializar el cliente único
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para usar en cualquier parte de la SPA
export { supabase };
