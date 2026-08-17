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

// URL directa al punto de montaje de Caster.fm
const STREAM_URL = "http://sapircast.caster.fm:18134/listen.mp3";

let isPlaying = false;

// 1. Control del Reproductor Audio
if (playBtn && audio) {
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            audio.src = ""; // Limpia el buffer
            playIcon.className = 'fa-solid fa-play';
            isPlaying = false;
        } else {
            // Forzar recarga del flujo en vivo
            audio.src = STREAM_URL;
            audio.load();

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    playIcon.className = 'fa-solid fa-pause';
                    isPlaying = true;
                }).catch(err => {
                    console.error("Error al conectar el audio:", err);
                    
                    // Si el navegador bloquea HTTP no seguro sobre HTTPS (Mixed Content)
                    if (window.location.protocol === 'https:') {
                        alert("Tu navegador bloqueó la conexión por seguridad (HTTP sobre HTTPS). Haz clic en el candado de la barra de direcciones y permite 'Contenido no seguro' (Insecure Content) para escuchar el audio.");
                    } else {
                        alert("No se pudo conectar con la transmisión. Confirma que la app Caster.fm Broadcaster esté transmitiendo en vivo.");
                    }
                    isPlaying = false;
                });
            }
        }
    });
}

if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// 2. Cargar Programación desde Supabase
async function cargarRadioData() {
    try {
        const { data: programas, error } = await supabase
            .from('radio_programacion')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (programas && programas.length > 0) {
            const programaEnVivo = programas.find(p => p.es_en_vivo === true);

            if (programaEnVivo) {
                mostrarProgramaHero(programaEnVivo, true);
            } else {
                mostrarProgramaHero(programas[0], false);
            }

            renderParrilla(programas);
        } else {
            if (programTitle) programTitle.textContent = "Sin programación agendada";
            if (programSpeaker) programSpeaker.innerHTML = '<i class="fa-solid fa-microphone"></i> Consulta más tarde';
            if (parrillaGrid) parrillaGrid.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No hay eventos guardados.</p>';
        }

    } catch (err) {
        console.error("Error al conectar con Supabase:", err.message);
        if (programTitle) programTitle.textContent = "Transmisión Especial";
        if (parrillaGrid) parrillaGrid.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Error cargando horarios.</p>';
    }
}

function mostrarProgramaHero(programa, enVivo) {
    if (programTitle) programTitle.textContent = programa.titulo;
    if (programSpeaker) programSpeaker.innerHTML = `<i class="fa-solid fa-microphone"></i> ${programa.locutor || 'Invitado Especial'}`;
    if (programTime) programTime.innerHTML = `<i class="fa-regular fa-clock"></i> ${programa.dias} | ${programa.hora_inicio} - ${programa.hora_fin}`;
    
    if (programCover && programa.caratula_url) {
        programCover.src = programa.caratula_url;
    }

    if (liveBadge && statusText) {
        if (enVivo) {
            liveBadge.classList.add('live');
            statusText.textContent = 'EN VIVO AHORA';
        } else {
            liveBadge.classList.remove('live');
            statusText.textContent = 'EN DIFERIDO';
        }
    }
}

function renderParrilla(programas) {
    if (!parrillaGrid) return;
    parrillaGrid.innerHTML = '';
    
    programas.forEach(prog => {
        const defaultImg = 'https://placehold.co/100x100?text=Radio';
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

cargarRadioData();
