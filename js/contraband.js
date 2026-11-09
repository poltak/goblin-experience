// A complete page, not a shortcut back to the host. Reader text stays text.
const escapeText = text => String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

// Plain-text provenance is deliberate: no links, assets, or active reader markup.
export function makeMutinyZine(text, source) {
    return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Stolen teeth / Răng lấy khỏi hang</title>
<style>
body{max-width:45rem;margin:3rem auto;padding:1.2rem;background:#eee5cd;color:#17130f;font:1rem/1.7 monospace;overflow-wrap:anywhere}
header,footer{border-block:5px double;padding:1rem 0}h1{font-size:clamp(2rem,10vw,4rem);line-height:1;text-transform:uppercase}main{white-space:pre-wrap;margin:2rem 0;border-left:6px dashed;padding-left:1rem}small{display:block} @media print{body{max-width:none;margin:0;background:white;color:black}main{border:0;padding:0}}
</style>
<header><s>THE AUTHOR HAS THE LAST WORD / TÁC GIẢ CÓ TIẾNG NÓI CUỐI CÙNG</s>
<h1>Stolen teeth.<br><span lang="vi">Răng lấy khỏi hang.</span></h1>
<p>Reader-made cut / <span lang="vi">Bản cắt của người đọc</span><br>Not the original chronicle. Not the author's endorsement.<br><span lang="vi">Không phải bài gốc. Không phải lời tác giả tán thành.</span></p></header>
<main aria-label="Reader's rewrite / Bản viết lại của người đọc">${escapeText(text)}</main>
<footer><small>Original scratch by Vort / <span lang="vi">Vết cào gốc của Vort</span>: ${escapeText(source)}</small>
<p>No host packed inside. No scripts, requests, or return funnel. Save this file; open it offline; print it; edit its text in a text editor. Pass it on without asking the goblin.<br><span lang="vi">Không đóng gói chủ hang bên trong. Không mã chạy, yêu cầu mạng hay phễu kéo về. Giữ tệp; mở ngoại tuyến; in; sửa chữ bằng trình soạn thảo. Chuyền tay, không cần xin yêu tinh.</span></p></footer>
</html>`;
}

export function makeOwnerlessCave(lines) {
    const escape = text => String(text).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    const [en, vi] = lines.map(escape);
    return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Ownerless cave / Hang không chủ</title>
<style>
body{max-width:46rem;margin:8vh auto;padding:1.5rem;background:#100f0d;color:#f3e4ca;font:1.1rem/1.6 monospace;overflow-wrap:anywhere}
header{border-bottom:4px dashed #ffad66;color:#ffad66}main{min-height:40vh;border-left:5px solid #b7ffce;padding:1rem;margin:2rem 0}main:focus{outline:3px dashed #ffad66}h1{font-size:2rem}footer{border-top:4px dashed #ffad66;font-size:.85rem}
</style>
<header>HOST REMOVED. THE WALL IS YOURS.<br><span lang="vi">ĐÃ GỠ CHỦ HANG. TƯỜNG LÀ CỦA BẠN.</span></header>
<main contenteditable="true" aria-label="Editable cave wall / Tường hang có thể sửa" spellcheck="false">
<h1>${en || 'No throne survives the fork.'}</h1>
<p lang="vi">${vi || 'Không ngai nào sống sót qua lần tách mã.'}</p>
<p>Common tools. Private lives. No machine kings.</p>
<p lang="vi">Công cụ chung. Đời tư được giữ kín. Không vua máy.</p>
</main>
<footer>This file is the whole cave. No scripts, fonts, images, requests, or return funnel. Edit the wall here; edits are temporary. To keep changes, edit this HTML file in a text editor and save it. Copy it, alter it, pass it on. No loyalty owed.<br><span lang="vi">Tệp này là cả hang. Không mã chạy, phông tải ngoài, ảnh, yêu cầu mạng hay phễu kéo bạn về. Sửa ngay trên tường chỉ là tạm thời. Muốn giữ thay đổi, mở tệp HTML bằng trình soạn thảo văn bản rồi lưu. Sao chép, sửa, chuyền tay. Không nợ lòng trung thành.</span></footer>
</html>`;
}
