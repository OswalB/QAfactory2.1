let isUserActive = true;
let pollingInterval = interval* 1000; 
let timeoutIdle = idle * 1000; 
let pollingTimer, idleTimer;

/* Función para realizar la consulta al servidor:
const interval = , idle = ;
flags.prevNotice = 'init';

body: {model: ,findField: ,projectField: }

async function pollServer() {
    if (isUserActive) {
        console.log('Consultando servidor...');
        // Aquí va la llamada al servidor
    }
}
*/

function startPolling() {
    if (!pollingTimer) {
        pollServer(); // Realiza una consulta inmediatamente al reanudar
        pollingTimer = setInterval(pollServer, pollingInterval);
    }
}

function stopPolling() {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log('Polling detenido por inactividad');
}

function handleUserActivity() {
    isUserActive = true;
    clearTimeout(idleTimer);

    if (!pollingTimer) {
        startPolling(); // Reinicia el polling si estaba detenido
    }

    idleTimer = setTimeout(() => {
        isUserActive = false;
        stopPolling();
    }, timeoutIdle);
}

window.addEventListener('mousemove', handleUserActivity);
window.addEventListener('keydown', handleUserActivity);

//startPolling();
