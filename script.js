document.addEventListener('DOMContentLoaded', () => {

    const MASTER_BAR_WIDTH_PX = 3000;
    const checkpoints = [
        { name: "Старт: Нос Шабла", altitude: 0, totalFloors: 0 }, { name: "Град Свищов", altitude: 90, totalFloors: 30 }, { name: "Град Пловдив", altitude: 164, totalFloors: 55 }, { name: "Град Велико Търново", altitude: 220, totalFloors: 73 }, { name: "Белоградчишките скали", altitude: 300, totalFloors: 100 }, { name: "Град София", altitude: 550, totalFloors: 183 }, { name: "Град Трявна", altitude: 730, totalFloors: 243 }, { name: "Град Банско", altitude: 925, totalFloors: 308 }, { name: "Град Копривщица", altitude: 1030, totalFloors: 343 }, { name: "Рилският манастир", altitude: 1147, totalFloors: 382 }, { name: "Местност Копитото", altitude: 1345, totalFloors: 448 }, { name: "Връх Снежанка", altitude: 1550, totalFloors: 517 }, { name: "Хижа Алеко", altitude: 1810, totalFloors: 603 }, { name: "Хижа Вихрен", altitude: 1950, totalFloors: 650 }, { name: "Връх Голям Перелик", altitude: 2191, totalFloors: 730 }, { name: "Черни връх", altitude: 2290, totalFloors: 763 }, { name: "Връх Ботев", altitude: 2376, totalFloors: 792 }, { name: "Връх Мальовица", altitude: 2729, totalFloors: 910 }, { name: "Връх Вихрен", altitude: 2914, totalFloors: 971 }, { name: "ВРЪХ МУСАЛА", altitude: 2925, totalFloors: 975 }
    ];

    const DATABASE_URL = 'ВАШИЯТ_NPOINT_ЛИНК'; // <-- УВЕРЕТЕ СЕ, ЧЕ ВАШИЯТ NPOINT ЛИНК Е ТУК!

    const elements = {
        masterProgressContainer: document.querySelector('.master-progress-container'), masterProgressBarBG: document.getElementById('master-progress-bar'), masterProgressFill: document.getElementById('master-progress-fill'), masterCheckpointsContainer: document.getElementById('master-checkpoints'), totalProgressEl: document.getElementById('total-progress'), nextCheckpointNameEl: document.getElementById('next-checkpoint-name'), progressBarEl: document.getElementById('progress-bar'), progressTextEl: document.getElementById('progress-text'), addBlockBtn: document.getElementById('add-block-btn'), addFloorBtn: document.getElementById('add-floor-btn'), checkpointListEl: document.getElementById('checkpoint-list'), congratsPopup: document.getElementById('congrats-popup'), popupCheckpointName: document.getElementById('popup-checkpoint-name'), closePopupBtn: document.getElementById('close-popup-btn')
    };
    
    for (const key in elements) {
        if (!elements[key]) {
            console.error(`Критична грешка: HTML елемент '${key}' не е намерен!`);
            document.body.innerHTML = `<h1>Грешка при зареждане на приложението. Моля, проверете конзолата.</h1>`;
            return;
        }
    }
    
    let totalFloorsClimbed = 0;

    async function saveProgress() { try { await fetch(DATABASE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ totalFloorsClimbed: totalFloorsClimbed }) }); } catch (error) { console.error("Грешка при запис:", error); } }
    async function loadProgress() { try { const response = await fetch(DATABASE_URL); const data = await response.json(); totalFloorsClimbed = data.totalFloorsClimbed || 0; } catch (error) { console.error("Грешка при зареждане:", error); totalFloorsClimbed = 0; } }
    function formatFloors(floors) { if (floors === 0) return "0 блока и 0 етажа"; const blocks = Math.floor(floors / 8); const remainingFloors = floors % 8; return `${blocks} блока и ${remainingFloors} етажа`; }
    function scrollToCurrentPosition() { const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; if (maxFloors === 0) return; const currentPositionPx = (totalFloorsClimbed / maxFloors) * MASTER_BAR_WIDTH_PX; const containerWidth = elements.masterProgressContainer.offsetWidth; const scrollTarget = currentPositionPx - (containerWidth / 2); elements.masterProgressContainer.scrollTo({ left: scrollTarget, behavior: 'smooth' }); }
    function initializeMasterRoadmap() { elements.masterProgressBarBG.style.width = `${MASTER_BAR_WIDTH_PX}px`; const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; elements.masterCheckpointsContainer.innerHTML = ''; checkpoints.forEach(cp => { const marker = document.createElement('div'); marker.className = 'checkpoint-marker'; const leftPositionPx = (cp.totalFloors / maxFloors) * MASTER_BAR_WIDTH_PX; marker.style.left = `${leftPositionPx}px`; marker.dataset.name = `${cp.name} (${cp.altitude} м)`; elements.masterCheckpointsContainer.appendChild(marker); }); }
    function updateUI() { const maxFloors = checkpoints[checkpoints.length - 1].totalFloors; if (maxFloors > 0) { const totalProgressPx = (totalFloorsClimbed / maxFloors) * MASTER_BAR_WIDTH_PX; elements.masterProgressFill.style.width = `${totalProgressPx}px`; } const markers = document.querySelectorAll('.checkpoint-marker'); markers.forEach((marker, index) => { if (checkpoints[index].totalFloors <= totalFloorsClimbed) { marker.classList.add('completed'); } else { marker.classList.remove('completed'); } }); let lastCompletedIndex = -1; checkpoints.forEach((cp, index) => { if (totalFloorsClimbed >= cp.totalFloors) { lastCompletedIndex = index; } }); const nextCheckpointIndex = lastCompletedIndex + 1; elements.totalProgressEl.textContent = formatFloors(totalFloorsClimbed); if (nextCheckpointIndex < checkpoints.length) { const lastCheckpointFloors = (lastCompletedIndex === -1) ? 0 : checkpoints[lastCompletedIndex].totalFloors; const nextCheckpoint = checkpoints[nextCheckpointIndex]; elements.nextCheckpointNameEl.textContent = nextCheckpoint.name; const floorsInThisLeg = nextCheckpoint.totalFloors - lastCheckpointFloors; const floorsClimbedInThisLeg = totalFloorsClimbed - lastCheckpointFloors; const percentage = floorsInThisLeg > 0 ? Math.round((floorsClimbedInThisLeg / floorsInThisLeg) * 100) : 0; elements.progressBarEl.style.width = `${percentage}%`; elements.progressTextEl.textContent = `${percentage}%`; } else { elements.nextCheckpointNameEl.textContent = "ПОЗДРАВЛЕНИЯ! ФИНАЛИРАХТЕ!"; elements.progressBarEl.style.width = '100%'; elements.progressTextEl.textContent = '100%'; } elements.checkpointListEl.innerHTML = ''; checkpoints.forEach((cp, index) => { const li = document.createElement('li'); li.innerHTML = `<span>${cp.name} (${cp.altitude} м)</span><div class="checkpoint-details">Цел: ${formatFloors(cp.totalFloors)}</div>`; if (index <= lastCompletedIndex) { li.classList.add('completed'); } else if (index === nextCheckpointIndex) { li.classList.add('current'); } elements.checkpointListEl.appendChild(li); }); }
    async function handleAddProgress(floorsToAdd) { const previousTotal = totalFloorsClimbed; totalFloorsClimbed += floorsToAdd; const newReachedCheckpoints = checkpoints.filter(cp => cp.totalFloors > previousTotal && cp.totalFloors <= totalFloorsClimbed); if (newReachedCheckpoints.length > 0) { const latestCheckpoint = newReachedCheckpoints[newReachedCheckpoints.length - 1]; elements.popupCheckpointName.textContent = latestCheckpoint.name; elements.congratsPopup.className = 'popup-visible'; } await saveProgress(); updateUI(); scrollToCurrentPosition(); }
    
    elements.addBlockBtn.addEventListener('click', () => handleAddProgress(8));
    elements.addFloorBtn.addEventListener('click', () => handleAddProgress(1));
    elements.closePopupBtn.addEventListener('click', () => { elements.congratsPopup.className = 'popup-hidden'; });
    
    async function initializeApp() {
        initializeMasterRoadmap();
        await loadProgress();
        updateUI();
        setTimeout(scrollToCurrentPosition, 500);
    }

    initializeApp();
});
