// ─────────────────────────────────────────────────────────────
// 1. دالة حماية لمنع اختراق الـ HTML (Escape HTML)
// ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// ─────────────────────────────────────────────────────────────
// 2. دالة تشغيل الأرقام المتحركة (Counter Animation)
// ─────────────────────────────────────────────────────────────
function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count')) || 0;
        if (target === 0) return;
        
        let count = 0;
        const increment = target / 60; // سرعة الحركة
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) { 
                count = target; 
                clearInterval(timer); 
            }
            counter.textContent = Math.floor(count).toLocaleString('ar-EG');
        }, 30);
    });
}

// ─────────────────────────────────────────────────────────────
// 3. دالة جلب الأرقام والإحصائيات من Supabase
// ─────────────────────────────────────────────────────────────
async function loadSiteAchievements() {
    try {
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('key, value');

        if (error) throw error;

        // تحويل المصفوفة القادمة إلى Object ليسهل قراءته
        const settings = {};
        if (data) {
            data.forEach(item => {
                settings[item.key] = item.value;
            });
        }

        // تحديث الـ data-count لتأخذ القيمة الحقيقية من السيرفر قبل بدء التحريك
        if (settings.stat_volunteers) {
            document.getElementById('statVolunteers').setAttribute('data-count', settings.stat_volunteers);
        }
        if (settings.stat_projects) {
            document.getElementById('statProjects').setAttribute('data-count', settings.stat_projects);
        }
        if (settings.stat_governorates) {
            document.getElementById('statGovernorates').setAttribute('data-count', settings.stat_governorates);
        }
        if (settings.stat_beneficiaries) {
            document.getElementById('statBeneficiaries').setAttribute('data-count', settings.stat_beneficiaries);
        }

    } catch (err) {
        console.error('حدث خطأ أثناء جلب الإحصائيات:', err);
    }
}

// ─────────────────────────────────────────────────────────────
// 4. دالة جلب كروت الإنجازات من Supabase وعرضها
// ─────────────────────────────────────────────────────────────
async function loadAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('achievements')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        // بناء وعرض الكروت داخل الـ Grid
        grid.innerHTML = data.map(a => `
            <div class="ach-card">
                <div class="ach-header">
                    <h3>${escapeHtml(a.title)}</h3>
                </div>
                <div class="ach-body">
                    <img src="${a.image_url || 'https://placehold.co/150x150?text=No+Image'}" alt="${a.title}">
                    <p class="location-text"><i class="fas fa-calendar-alt"></i> ${a.date_text || ''}</p>
                    <p class="bio-text">${escapeHtml(a.description)}</p>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error('خطأ في تحميل كروت الإنجازات:', e);
    }
}

// ─────────────────────────────────────────────────────────────
// 5. إدارة تشغيل الصفحة بالترتيب الصحيح التلقائي
// ─────────────────────────────────────────────────────────────
function checkAndInitialize() {
    // الانتظار حتى يتوفر كائن السيرفر Supabase تماماً
    if (!window.supabaseClient) {
        setTimeout(checkAndInitialize, 100);
        return;
    }

    // تشغيل العمليات بالتتابع الصحيح
    async function startAll() {
        await loadSiteAchievements(); // أولاً: نجلب الأرقام من السيرفر ونضعها بالـ HTML
        animateCounters();            // ثانياً: نشغل حركة العداد المتصاعد للأرقام التي جلبناها
        await loadAchievements();     // ثالثاً: نحمل كروت الإنجازات بالأسفل
    }

    startAll();
}

// بدء التشغيل فور جاهزية الـ DOM للمتصفح
document.addEventListener('DOMContentLoaded', checkAndInitialize);