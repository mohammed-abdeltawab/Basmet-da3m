async function loadRules() {
    const rulesList = document.querySelector('.rules-box ol');
    const updateDiv = document.querySelector('.last-update');
    const pdfBtn = document.querySelector('.btn-primary');
    
    if (!window.supabaseClient) return;

    try {
        // جلب الحقول المطلوبة فقط من جدول site_settings
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('key, value')
            .in('key', ['rules_text', 'rules_pdf_url', 'rules_last_updated']);

        if (error) throw error;

        // تحويل البيانات لمصفوفة سهلة التعامل
        const settings = {};
        data.forEach(item => settings[item.key] = item.value);

        // 1. التعامل مع رابط الـ PDF (rules_pdf_url)
        if (pdfBtn) {
            if (settings.rules_pdf_url && settings.rules_pdf_url !== 'EMPTY') {
                pdfBtn.href = settings.rules_pdf_url;
                pdfBtn.style.display = 'inline-flex'; // إظهار الزر
            } else {
                pdfBtn.style.display = 'none'; // إخفاء الزر إذا كان فارغاً
            }
        }

        // 2. التعامل مع نص اللائحة (rules_text)
        // إذا كان النص يحتوي على HTML (مثل <li>)، سنعرضه كما هو.
        if (rulesList && settings.rules_text && settings.rules_text !== 'EMPTY') {
            rulesList.innerHTML = settings.rules_text;
        }

        // 3. التعامل مع تاريخ التحديث (rules_last_updated)
        if (updateDiv && settings.rules_last_updated) {
            updateDiv.innerHTML = `<i class="fas fa-calendar-alt"></i> آخر تحديث: ${settings.rules_last_updated}`;
        }

    } catch (e) {
        console.error('خطأ في تحميل اللائحة:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadRules);

