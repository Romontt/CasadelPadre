import { supabase } from '../supabaseClient.js';

// Elementos del DOM
const audio = document.getElementById('radioAudio');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volumeSlider = document.getElementById('volumeSlider');

const liveBadge = document.getElementById('liveBadge');
const statusText = document.getElementById('statusText');
const programCover = document.getElementById('programCover');
const programTitle = document.getElementById('programTitle');
const programSpeaker = document.getElementById('programSpeaker');
const programTime = document.getElementById('programTime');

const parrillaGrid = document.getElementById('parrillaGrid');

// URL del Stream mediante HTTPS para evitar el bloqueo del navegador
// URL pública para evitar el cuadro de contraseña de Caster.fm
const STREAM_URL = "https://stream.caster.fm/sapircast/stream";

let isPlaying = false;

// 1. Control del Reproductor Audio
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playIcon.className = 'fa-solid fa-play';
    } else {
        // Asignar dinámicamente la fuente HTTPS si está vacía
        if (!audio.src || audio.src === '') {
            audio.src = STREAM_URL;
        }

        audio.play().then(() => {
            playIcon.className = 'fa-solid fa-pause';
        }).catch(err => {
            console.error("Error al conectar el audio:", err);
            alert("No se pudo iniciar la señal. Verifica que la radio esté encendida en Caster.fm.");
        });
    }
    isPlaying = !isPlaying;
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// 2. Cargar Programación desde Supabase
async function cargarRadioData() {
    try {
        const { data: programas, error } = await supabase
            .from('radio_programacion')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (programas && programas.length > 0) {
            // Verificar si hay algún programa "EN VIVO" activado
            const programaEnVivo = programas.find(p => p.es_en_vivo === true);

            if (programaEnVivo) {
                mostrarProgramaHero(programaEnVivo, true);
            } else {
                // Mostrar el primer programa como predeterminado
                mostrarProgramaHero(programas[0], false);
            }

            renderParrilla(programas);
        } else {
            programTitle.textContent = "Sin programación agendada";
            programSpeaker.innerHTML = '<i class="fa-solid fa-microphone"></i> Consulta más tarde';
            parrillaGrid.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No hay eventos guardados.</p>';
        }

    } catch (err) {
        console.error("Error al conectar con Supabase:", err.message);
        programTitle.textContent = "Transmisión Especial";
        parrillaGrid.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Error cargando horarios.</p>';
    }
}

// Renderizar el programa principal en el Hero
function mostrarProgramaHero(programa, enVivo) {
    programTitle.textContent = programa.titulo;
    programSpeaker.innerHTML = `<i class="fa-solid fa-microphone"></i> ${programa.locutor || 'Invitado Especial'}`;
    programTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${programa.dias} | ${programa.hora_inicio} - ${programa.hora_fin}`;
    
    if (programa.caratula_url) {
        programCover.src = programa.caratula_url;
    }

    if (enVivo) {
        liveBadge.classList.add('live');
        statusText.textContent = 'EN VIVO AHORA';
    } else {
        liveBadge.classList.remove('live');
        statusText.textContent = 'EN DIFERIDO';
    }
}

// Renderizar la lista completa en la Parrilla
function renderParrilla(programas) {
    parrillaGrid.innerHTML = '';
    
    programas.forEach(prog => {
        const defaultImg = 'https://via.placeholder.com/100x100?text=Radio';
        const card = document.createElement('div');
        card.className = 'program-card';
        card.innerHTML = `
            <img src="${prog.caratula_url || defaultImg}" alt="${prog.titulo}">
            <div class="program-card-info">
                <h3>${prog.titulo}</h3>
                <p><i class="fa-solid fa-user"></i> ${prog.locutor || 'General'}</p>
                <p><i class="fa-regular fa-clock"></i> ${prog.dias} (${prog.hora_inicio} - ${prog.hora_fin})</p>
            </div>
        `;
        parrillaGrid.appendChild(card);
    });
}

// Inicializar
cargarRadioData();
