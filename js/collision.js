// A cut-up of real archive text, never a generated translation or summary.
export function pickShard(markdown, random = Math.random) {
    const paragraphs = markdown.replace(/\r\n?/g, '\n').split(/\n\s*\n/)
        .map(part => part.trim())
        .filter(part => part.length >= 40 && part.length <= 900
            && !/^(?:#|\*\*|>|```|---|—|\s*[-*] )/.test(part));
    if (!paragraphs.length) throw new Error('No loose paragraph in this bone');
    return paragraphs[Math.floor(random() * paragraphs.length)];
}

// Reversible erasure, not an author quote: source text is never rewritten on disk.
export function mountBlackout(scrap, quote, source) {
    const original = quote.textContent;
    const cut = document.createElement('button');
    cut.type = 'button';
    cut.className = 'btn blackout-scissors';
    cut.textContent = '✂ cut this voice / cắt giọng này';
    cut.setAttribute('aria-pressed', 'false');
    const copy = document.createElement('textarea');
    copy.className = 'blackout-copy';
    copy.readOnly = true;
    copy.hidden = true;
    copy.rows = 6;
    copy.setAttribute('aria-label', 'Reader cut-up and source — select to copy / Bản cắt của người đọc và nguồn — chọn để chép');
    let pieces = [];
    const updateCopy = () => {
        const words = pieces.filter(piece => !piece.cut).map(piece => piece.text).join('')
            .replace(/\s+/g, ' ').trim();
        copy.value = `READER CUT-UP / BẢN CẮT CỦA NGƯỜI ĐỌC\nNot an intact author quote / Không phải trích dẫn nguyên văn\n\n${words || '[all words cut / đã cắt hết chữ]'}\n\nSOURCE / NGUỒN: ${source.title}\n${new URL(source.href, window.location.href).href}`;
    };
    cut.addEventListener('click', () => {
        const active = cut.getAttribute('aria-pressed') !== 'true';
        cut.setAttribute('aria-pressed', String(active));
        copy.hidden = !active;
        cut.textContent = active ? '↶ restore the whole voice / trả lại nguyên giọng' : '✂ cut this voice / cắt giọng này';
        if (!active) {
            quote.textContent = original;
            return;
        }
        pieces = original.split(/(\s+)/).map(text => ({ text, cut: false }));
        quote.replaceChildren(...pieces.map(piece => {
            if (/^\s*$/.test(piece.text)) return document.createTextNode(piece.text);
            const word = document.createElement('button');
            word.type = 'button';
            word.className = 'blackout-word';
            word.textContent = piece.text;
            word.setAttribute('aria-pressed', 'false');
            word.setAttribute('aria-label', `Cut / restore word — Cắt / trả lại chữ: ${piece.text}`);
            word.addEventListener('click', () => {
                piece.cut = !piece.cut;
                word.setAttribute('aria-pressed', String(piece.cut));
                updateCopy();
            });
            return word;
        }));
        updateCopy();
    });
    scrap.append(cut, copy);
}

export function initBoneCollision() {
    const panel = document.getElementById('bone-collision');
    const button = document.getElementById('collision-strike');
    const wash = document.getElementById('collision-wash');
    const output = document.getElementById('collision-output');
    const status = document.getElementById('collision-status');
    const doors = Array.from(document.querySelectorAll('#bone-doors > a')).slice(0, 2);
    if (!panel || !button || !wash || !output || !status || doors.length !== 2) return;
    let generation = 0;
    button.addEventListener('click', async () => {
        const turn = ++generation;
        button.disabled = true;
        status.textContent = 'Cracking the files… / Đang đập tệp…';
        try {
            // Pin both sources before awaiting: the draw button can change the doors.
            const sources = doors.map(door => ({
                href: door.getAttribute('href'),
                title: door.querySelector('strong').textContent
            }));
            const shards = await Promise.all(sources.map(async source => {
                const path = new URL(source.href, window.location.href).searchParams.get('entry');
                if (!/^entries\/[a-z0-9-]+\.md$/.test(path || '')) throw new Error('Not an archive bone');
                const response = await fetch(path, { signal: AbortSignal.timeout(10000) });
                if (!response.ok) throw new Error(`Bone returned ${response.status}`);
                return pickShard(await response.text());
            }));
            if (turn !== generation) return;
            const scraps = sources.map((source, i) => {
                const scrap = document.createElement('figure');
                scrap.lang = i === 0 ? 'en' : 'vi';
                const quote = document.createElement('blockquote');
                quote.textContent = shards[i];
                const caption = document.createElement('figcaption');
                const link = document.createElement('a');
                link.href = source.href;
                link.textContent = `${i === 0 ? 'EN' : 'VI'} ↝ ${source.title}`;
                caption.appendChild(link);
                scrap.append(quote, caption);
                mountBlackout(scrap, quote, source);
                return scrap;
            });
            output.replaceChildren(...scraps);
            output.hidden = false;
            wash.hidden = false;
            status.textContent = 'TWO VOICES. NO MERGER. / HAI GIỌNG. KHÔNG HỢP NHẤT.';
        } catch (_) {
            if (turn === generation) status.textContent = 'A bone would not crack. No invented words. Try again or use the source doors. / Xương chưa vỡ. Không bịa chữ. Thử lại hoặc mở cửa nguồn.';
        } finally {
            if (turn === generation) button.disabled = false;
        }
    });
    wash.addEventListener('click', () => {
        generation++;
        output.replaceChildren();
        output.hidden = true;
        wash.hidden = true;
        button.disabled = false;
        status.textContent = 'Seam washed. The source files stay. / Đã rửa đường nối. Tệp nguồn vẫn còn.';
    });
    panel.hidden = false;
}
