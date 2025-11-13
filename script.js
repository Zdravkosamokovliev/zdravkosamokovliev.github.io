document.addEventListener('DOMContentLoaded', () => {

    // 1. ДАННИ И КОНФИГУРАЦИЯ
    // ===================================
    const MASTER_BAR_WIDTH_PX = 3000;
    const checkpoints = [
        { name: "Старт: Нос Шабла", altitude: 0, totalFloors: 0 },
        { name: "Град Свищов", altitude: 90, totalFloors: 30 },
        { name: "Град Пловдив", altitude: 164, totalFloors: 55 },
        { name: "Град Велико Търново", altitude: 220, totalFloors: 73 },
        { name: "Белоградчишките скали", altitude: 300, totalFloors: 100 },
        { name: "Град София", altitude: 550, totalFloors: 183 },
        { name: "Град Трявна", altitude: 730, totalFloors: 243 },
        { name: "Град Банско", altitude: 925, totalFloors: 308 },
        { name: "Град Копривщица", altitude: 1030, totalFloors: 343 },
        { name: "Рилският манастир", altitude: 1147, totalFloors: 382 },
        { name: "Местност Копитото", altitude: 1345, totalFloors: 448 },
        { name: "Връх Снежанка", altitude: 1550, totalFloors: 517 },
        { name: "Хижа Алеко", altitude: 1810, totalFloors: 603 },
        { name: "Хижа Вихрен", altitude: 1950, totalFloors: 650 },
        { name: "Връх Голям Перелик", altitude: 2191, totalFloors: 730 },
        { name: "Черни връх", altitude: 2290, totalFloors: 763 },
        { name: "Връх Ботев", altitude: 2376, totalFloors: 792 },
        { name: "Връх Мальовица", altitude: 2729, totalFloors: 910 },
        { name: "Връх Вихрен", altitude: 2914, totalFloors: 971 },
        { name: "ВРЪХ МУСАЛА", altitude: 2925, totalFloors: 975 }
    ];

    // 2. ВРЪЗКА С HTML ЕЛЕМЕНТИТЕ (без промяна)
    // ===================================
    const masterProgressContainer = document.querySelector('.master-progress-container');
    const masterProgressBarBG = document.getElementById('master-progress-bar');
    const masterProgressFill = document.getElementById('master-progress-fill');
    const masterCheckpointsContainer = document.getElementById('master-checkpoints');
    const totalProgressEl = document.getElementById('total-progress');
    const nextCheckpointNameEl = document.getElementById('next-checkpoint-name');
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const addBlockBtn = document.getElementById('add-block-btn');
    const addFloorBtn = document.getElementById('add-floor-btn');
    const checkpointListEl = document.getElementById('checkpoint-list');
    const congratsPopup = document.getElementById('congrats-popup');
    const popupCheckpointName = document.getElementById('popup-checkpoint-name');
    const closePopupBtn = document.getElementById('close-popup-btn');

    // 3. СЪСТОЯНИЕ НА ПРИЛОЖЕНИЕТО
    // ===================================
    let totalFloorsClimbed = 0;

    // 4. КОМУНИКАЦИЯ С ОБЛАЧНАТА БАЗА ДАННИ (npoint.io)
    // =======================================================
    const DATABASE_URL = https://api.npoint.io/79b9f384a0250c33f1bb; // <-- ПОСТАВЕТЕ ЛИНКА ОТ NPOINT.IO ТУК!

    async function saveProgress() {
        try {
            // npoint.io използва POST за обновяване
            await fetch(DATABASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalFloorsClimbed: totalFloorsClimbed })
            });
        } catch (error) {
            console.error("Грешка при запис на напредъка:", error);
        }
    }

    async function loadProgress() {
        try {
            const response = await fetch(DATABASE_URL);
            const data = await response.json();
            totalFloorsClimbed = data.totalFloorsClimbed || 0;
        } catch (error) {
            console.error("Грешка при зареждане на напредъка:", error);
            totalFloorsClimbed = 0;
        }
    }

    // Всички останали функции (5, 6, 7, 8) остават абсолютно същите
    // ====================================================================
    function formatFloors(floors) { if (floors === 0) return "0 блока и 0 етажа"; const blocks = Math.floor(floors / 8); const remainingFloors = floors % 8; return `${blocks} блока и ${remainingFloors} етажа`; }
    function scrollToCurrentPosition() { const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; if (maxFloors === 0) return; const currentPositionPx = (totalFloorsClimbed / maxFloors) * MASTER_BAR_WIDTH_PX; const containerWidth = masterProgressContainer.offsetWidth; const scrollTarget = currentPositionPx - (containerWidth / 2); masterProgressContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' }); }
    function initializeMasterRoadmap() { masterProgressBarBG.style.width = `${MASTER_BAR_WIDTH_PX}px`; const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; masterCheckpointsContainer.innerHTML = ''; checkpoints.forEach(cp => { const marker = document.createElement('div'); marker.className = 'checkpoint-marker'; const leftPositionPx = (cp.totalFloors / maxFloors) * MASTER_BAR_WIDTH_PX; marker.style.left = `${leftPositionPx}px`; marker.dataset.name = `${cp.name} (${cp.altitude} м)`; masterCheckpointsContainer.appendChild(marker); }); }
    function updateUI() { const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; if (maxFloors > 0) { const totalProgressPx = (totalFloorsClimbed / maxFloors) * MASTER_BAR_WIDTH_PX; masterProgressFill.style.width = `${totalProgressPx}px`; } const markers = document.querySelectorAll('.checkpoint-marker'); markers.forEach((marker, index) => { if (checkpoints[index].totalFloors <= totalFloorsClimbed) { marker.classList.add('completed'); } else { marker.classList.remove('completed'); } }); let lastCompletedIndex = -1; checkpoints.forEach((cp, index) => { if (totalFloorsClimbed >= cp.totalFloors) { lastCompletedIndex = index; } }); const nextCheckpointIndex = lastCompletedIndex + 1; totalProgressEl.textContent = formatFloors(totalFloorsClimbed); if (nextCheckpointIndex < checkpoints.length) { const lastCheckpointFloors = (lastCompletedIndex === -1) ? 0 : checkpoints[lastCompletedIndex].totalFloors; const nextCheckpoint = checkpoints[nextCheckpointIndex]; nextCheckpointNameEl.textContent = nextCheckpoint.name; const floorsInThisLeg = nextCheckpoint.totalFloors - lastCheckpointFloors; const floorsClimbedInThisLeg = totalFloorsClimbed - lastCheckpointFloors; const percentage = floorsInThisLeg > 0 ? Math.round((floorsClimbedInThisLeg / floorsInThisLeg) * 100) : 0; progressBarEl.style.width = `${percentage}%`; progressTextEl.textContent = `${percentage}%`; } else { nextCheckpointNameEl.textContent = "ПОЗДРАВЛЕНИЯ! ФИНАЛИРАХТЕ!"; progressBarEl.style.width = '100%'; progressTextEl.textContent = '100%'; } checkpointListEl.innerHTML = ''; checkpoints.forEach((cp, index) => { const li = document.createElement('li'); li.innerHTML = `<span>${cp.name} (${cp.altitude} м)</span><div class="checkpoint-details">Цел: ${formatFloors(cp.totalFloors)}</div>`; if (index <= lastCompletedIndex) { li.classList.add('completed'); } else if (index === nextCheckpointIndex) { li.classList.add('current'); } checkpointListEl.appendChild(li); }); }
    async function handleAddProgress(floorsToAdd) { const previousTotal = totalFloorsClimbed; totalFloorsClimbed += floorsToAdd; const newReachedCheckpoints = checkpoints.filter(cp => cp.totalFloors > previousTotal && cp.totalFloors <= totalFloorsClimbed); if (newReachedCheckpoints.length > 0) { const latestCheckpoint = newReachedCheckpoints[newReachedCheckpoints.length - 1]; popupCheckpointName.textContent = latestCheckpoint.name; congratsPopup.className = 'popup-visible'; } await saveProgress(); updateUI(); scrollToCurrentPosition(); }
    addBlockBtn.addEventListener('click', () => handleAddProgress(8));
    addFloorBtn.addEventListener('click', () => handleAddProgress(1));
    closePopupBtn.addEventListener('click', () => { congratsPopup.className = 'popup-hidden'; });
    async function initializeApp() { initializeMasterRoadmap(); await loadProgress(); updateUI(); setTimeout(scrollToCurrentPosition, 500); }
    initializeApp();
});