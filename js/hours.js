export function moveHour(state, destination, direction) {
    if (!['care', 'repair'].includes(destination) || ![1, -1].includes(direction)) return state;
    const donor = direction === 1 ? 'oracle' : destination;
    const recipient = direction === 1 ? destination : 'oracle';
    if (state[donor] < 1) return state;
    return { ...state, [donor]: state[donor] - 1, [recipient]: state[recipient] + 1 };
}

export function initHours(doc = document) {
    const bench = doc.getElementById('hours-bench');
    if (!bench) return;
    let state = { oracle: 12, care: 0, repair: 0 };
    const buttons = [...doc.querySelectorAll('[data-hours]')];
    const render = () => {
        for (const key of ['oracle', 'care', 'repair']) {
            doc.getElementById(`hours-${key}`).textContent = String(state[key]);
        }
        doc.getElementById('hours-ledger').textContent =
            `MACHINE / MÁY: ${'■'.repeat(state.oracle)} ${state.oracle}\n` +
            `CARE / CHĂM SÓC: ${'■'.repeat(state.care)} ${state.care}\n` +
            `REPAIR / SỬA: ${'■'.repeat(state.repair)} ${state.repair}\n` +
            'TOTAL / TỔNG: 12 h';
        for (const button of buttons) {
            const [destination, direction] = button.dataset.hours.split(':');
            button.disabled = state[Number(direction) === 1 ? 'oracle' : destination] === 0;
        }
    };
    for (const button of buttons) {
        button.addEventListener('click', () => {
            const [destination, direction] = button.dataset.hours.split(':');
            state = moveHour(state, destination, Number(direction));
            render();
        });
    }
    doc.getElementById('hours-reset').addEventListener('click', () => {
        state = { oracle: 12, care: 0, repair: 0 };
        render();
    });
    render();
    bench.hidden = false;
}

if (typeof document !== 'undefined') initHours();
