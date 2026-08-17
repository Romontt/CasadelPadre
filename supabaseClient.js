// Cargar la librería oficial de Supabase CDN (si la usas desde HTML) o import si usas Bundler
// Asegúrate de incluir el script CDN de Supabase en tu HTML principal:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://lmcgunnmljkwpcaveimc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY2d1bm5tbGprd3BjYXZlaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTc1MTIsImV4cCI6MjEwMjQ5MzUxMn0.prGEA8gnarc1vkSiVR0FKVXf8HSpUpe4ZLhtGCcoCdI';

// Inicializar el cliente único
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para usar en cualquier parte de la SPA
export { supabase };
