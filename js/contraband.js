// A complete page, not a shortcut back to the host. Reader text stays text.
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
