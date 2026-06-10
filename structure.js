// =====================================================================
// structure.js - مبادرة بصمة دعم (إعادة التصميم الستاتيك الأصلي)
// =====================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // التأكد من تحميل مكتبة Supabase أولاً
    if (window.supabaseClient) {
        await fetchAndRenderStructure();
    } else {
        console.error("Supabase Client غير متاح! تأكد من تحميل ملف supabase-config.js أولاً.");
    }
});

async function fetchAndRenderStructure() {
    // استهداف الحاوية الرئيسية (تأكد أن هذا الـ ID مطابق لما في الـ HTML)
    const container = document.getElementById('orgButtons');
    if (!container) {
        console.error("لم يتم العثور على عنصر الحاوية #orgButtons في الصفحة!");
        return;
    }
    
    // رسالة تحميل متناسبة مع التصميم العام
    container.innerHTML = '<p style="text-align:center; color:#1A2A44; font-weight:bold; width:100%; grid-column: 1 / -1;">جاري تحميل الهيكل التنظيمي...</p>';
    
    try {
        // جلب البيانات من جدول org_structure مرتبة حسب الترتيب المحدد
        const { data, error } = await window.supabaseClient
            .from('org_structure')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1;">لا توجد بيانات حالياً بالهيكل التنظيمي.</p>';
            return;
        }

        // تجميع الأعضاء تحت أقسامهم بناءً على حقل title (اسم القسم)
        const groupedData = data.reduce((acc, item) => {
            const deptTitle = item.title;
            if (!acc[deptTitle]) {
                acc[deptTitle] = [];
            }
            acc[deptTitle].push(item);
            return acc;
        }, {});

        // مسح رسالة التحميل لبدء بناء الكروت
        container.innerHTML = '';

        // الدوران على الأقسام المجمعة لبناء HTML مطابق للستاتيك القديم
        Object.keys(groupedData).forEach(deptName => {
            const members = groupedData[deptName];
            
            // 1. إنشاء الزر الرئيسي للقسم بنفس الكلاس القديم (org-btn)
            const deptButton = document.createElement('button');
            deptButton.className = 'org-btn'; // الكلاس الأصلي الخاص بك في الـ CSS

            // 2. بناء الـ HTML الداخلي للأعضاء (مطابق تماماً للكود الستاتيك القديم)
            let membersHtml = members.map(m => {
                let name = 'عضو المبادرة', role = 'عضو', image = 'assets/img/team/default.jpg'; // مسارات احتياطية
                
                try {
                    // فك الـ JSON المحفوظ في حقل content
                    const parsed = typeof m.content === 'string' ? JSON.parse(m.content) : m.content;
                    if(parsed) {
                        name = escapeHtml(parsed.name) || name;
                        role = escapeHtml(parsed.role) || role;
                        image = parsed.image && parsed.image.trim() !== '' ? parsed.image : image;
                    }
                } catch (jsonErr) {
                    console.error("خطأ في قراءة بيانات JSON للعضو:", jsonErr);
                }

                // الكود الستاتيك القديم للعضو الواحد (div.person)
                return `
                    <div class="person">
                        <img src="${image}" alt="${name}" onerror="this.onerror=null; this.src='assets/img/team/default.jpg';">
                        <div>
                            <h3>${name}</h3>
                            <p>${role}</p>
                        </div>
                    </div>
                `;
            }).join('');

            // 3. وضع الهيكل الداخلي للكارت (الهيدر + محتوى التفاصيل) داخل الزر
            // هذا الهيكل مطابق تماماً للكود الستاتيك القديم لديك
            deptButton.innerHTML = `
                <div class="btn-header">
                    <span>${escapeHtml(deptName)}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="detail-content">
                    ${membersHtml}
                </div>
            `;

            // 4. إضافة حدث الضغط لتفعيل/إلغاء كلاس 'active' (للأكورديون)
            // ملف CSS الأصلي لديك سيتكفل بالحركة وإظهار المحتوى
            deptButton.addEventListener('click', function(e) {
                // منع غلق الأكورديون إذا تم الضغط على محتوى العضو بالداخل
                if (e.target.closest('.detail-content')) return;
                
                this.classList.toggle('active');
            });

            // إضافة الكارت المبني للحاوية الرئيسية
            container.appendChild(deptButton);
        });

    } catch (err) {
        console.error('حدث خطأ أثناء جلب الهيكل التنظيمي:', err);
        container.innerHTML = `<p style="text-align:center; color:red; width:100%; grid-column: 1 / -1;">فشل تحميل البيانات. يرجى المحاولة لاحقاً.</p>`;
    }
}

// دالة حماية بسيطة لتجنب هجمات حقن النصوص (XSS)
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}