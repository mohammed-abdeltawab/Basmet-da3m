// ====================== index.js ======================

(async function() {
    // دوال مساعدة احتياطية لضمان عدم توقف السكربت إذا لم تكن متوفرة في shared.js
    const _escapeHtml = window.escapeHtml || function(str) { return str ? str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : ''; };
    const _formatDateShort = window.formatDateShort || function(d) { return d ? new Date(d).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : ''; };

    // 1. جلب إعدادات الموقع من Supabase
    async function loadIndexSettings() {
        if (!window.supabaseClient) {
            console.warn('Supabase Client غير متصل بعد');
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('site_settings')
                .select('key, value');

            if (error) throw error;

            // تحويل البيانات لـ Object لسهولة الاستخدام
            const settings = {};
            if (data) {
                data.forEach(item => settings[item.key] = item.value);
            }

            // -- تحديث قسم الـ Hero مع وضع قيم افتراضية لعدم ترك الفراغات --
            if (settings.hero_badge) {
                const badgeEl = document.querySelector('.hero-text .badge');
                if (badgeEl) badgeEl.textContent = settings.hero_badge;
            }
            if (settings.hero_title) {
                const h1 = document.querySelector('.hero-text h1');
                if (h1) h1.innerHTML = settings.hero_title.replace('بصمة دعم', '<span class="accent">بصمة دعم</span>');
            }
            if (settings.hero_subtitle) {
                const pEl = document.querySelector('.hero-text p');
                if (pEl) pEl.textContent = settings.hero_subtitle;
            }
            if (settings.hero_image_url && settings.hero_image_url !== 'EMPTY') {
                const heroBg = document.querySelector('.hero-bg');
                if (heroBg) heroBg.src = settings.hero_image_url;
            }

            // -- تحديث الإحصائيات الرقمية --
            if (settings.stat_volunteers && document.getElementById('statVolunteers')) document.getElementById('statVolunteers').textContent = settings.stat_volunteers;
            if (settings.stat_projects && document.getElementById('statProjects')) document.getElementById('statProjects').textContent = settings.stat_projects;
            if (settings.stat_governorates && document.getElementById('statGovernorates')) document.getElementById('statGovernorates').textContent = settings.stat_governorates;

            // -- تحديث كروت (من نحن، رؤيتنا، رسالتنا) --
            if (settings.about_text && document.getElementById('cardAboutText')) document.getElementById('cardAboutText').textContent = settings.about_text;
            if (settings.vision_text && document.getElementById('cardVisionText')) document.getElementById('cardVisionText').textContent = settings.vision_text;
            if (settings.mission_text && document.getElementById('cardMissionText')) document.getElementById('cardMissionText').textContent = settings.mission_text;

            // -- تحديث الفوتر وبيانات التواصل --
            if (settings.footer_tagline && document.getElementById('footerTagline')) document.getElementById('footerTagline').textContent = settings.footer_tagline;
            if (settings.contact_email && document.getElementById('footerEmail')) document.getElementById('footerEmail').textContent = settings.contact_email;
            if (settings.contact_whatsapp && document.getElementById('footerWhatsapp')) document.getElementById('footerWhatsapp').textContent = settings.contact_whatsapp;
            if (settings.contact_instagram && document.getElementById('footerInstagram')) document.getElementById('footerInstagram').textContent = settings.contact_instagram;
            if (settings.contact_facebook && document.getElementById('footerFacebook')) document.getElementById('footerFacebook').textContent = settings.contact_facebook;

        } catch (e) {
            console.error('خطأ في تحميل إعدادات الصفحة:', e);
        }
    }

    // تشغيل دالة جلب الإعدادات فوراً
    await loadIndexSettings();

    // ====================================================================
    // 2. تحميل الأخبار من Supabase 
    // ====================================================================
    const track = document.querySelector('.scroll-track');
    if (!track || !window.supabaseClient) {
        console.warn('News track أو شاشات الدعم غير متوفرة');
        return;
    }
    
    try {
        const { data, error } = await window.supabaseClient
            .from('news')
            .select('id, title, created_at')
            .eq('is_visible', true)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        let newsItems = data || [];
        
        // بيانات تجريبية افتراضية في حال كان جدول الأخبار فارغاً بالسيرفر
        if (newsItems.length === 0) {
            newsItems = [
                { id: 1, title: 'انطلاق برنامج القيادة الشبابية الجديد - 2026', created_at: new Date().toISOString() },
                { id: 2, title: 'معرض الإبداع الشبابي حقق نجاحاً كبيراً', created_at: new Date().toISOString() },
                { id: 3, title: 'دورات تدريبية جديدة تبدأ الشهر القادم', created_at: new Date().toISOString() },
                { id: 4, title: 'سفراء بصمة دعم يصلون لـ 50 محافظة', created_at: new Date().toISOString() },
            ];
        }
        
        renderNewsScroll(newsItems);
    } catch (err) {
        console.error('Error loading news:', err);
    }
    
    function renderNewsScroll(newsItems) {
        track.innerHTML = '';
        
        newsItems.forEach(news => {
            const item = document.createElement('div');
            item.className = 'news-item';
            item.innerHTML = `
            
                <img src="https://picsum.photos/id/1015/300/200" alt="News Image">
                <div class="news-card-content">
                    <span class="news-date">
                        <i class="far fa-calendar-alt"></i> ${_formatDateShort(news.created_at)}
                    </span>
                    <h3 style="font-size: 16px; direction: rtl; margin-bottom: 6px; color: #1A2A44;">${_escapeHtml(news.title)}</h3>
                </div>
            
            `;
            track.appendChild(item);
        });
        
        // مضاعفة العناصر لعمل حركة لا نهائية سلسة (Infinite Carousel Loop)
        const items = track.querySelectorAll('.news-item');
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
        
        startScrollAnimation(track);
    }
    
    function startScrollAnimation(track) {
        let scrollPos = 0;
        const speed = 1.2; // سرعة مريحة ومناسبة للعين بقراءة الأخبار
        let animationId = null;

        function animate() {
            scrollPos += speed;
            track.style.transform = `translateX(-${scrollPos}px)`;
            
            // إعادة ضبط العداد عند الوصول لمنتصف التراك المضاعف
            if (scrollPos >= track.scrollWidth / 2) {
                scrollPos = 0;
            }
            
            animationId = requestAnimationFrame(animate);
        }

        // بدء الحركة
        animate();

        // حماية متقدمة للـ Tab Switching لمنع تسارع الـ Loop وتداخل الإطارات
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                cancelAnimationFrame(animationId); // إلغاء أي حلقة معلقة أولاً قبل البداية
                animate();
            }
        });
    }
})();

// دالة تتبع الزيارات الفريدة والمؤمنة بالكامل
async function trackVisit() {
    // تصحيح الخطأ: التحقق من وجود الكلاينت المخصص والمربوط بالـ Config
    if (!window.supabaseClient) return; 
    
    // استخدام sessionStorage لمنع احتساب زيارة جديدة عند عمل Refresh لنفس الجلسة
    if (!sessionStorage.getItem('has_visited')) {
        const uniqueSession = Math.random().toString(36).substring(2, 15);
        try {
            await window.supabaseClient.from('site_visits').insert([{ session_id: uniqueSession }]);
            sessionStorage.setItem('has_visited', 'true');
        } catch (e) {
            console.error('Tracking visit failed:', e);
        }
    }
}

// الاستماع للـ DOMContentLoaded لتشغيل التتبع فور جاهزية الشجرة
document.addEventListener('DOMContentLoaded', trackVisit);

window.addEventListener('load', () => {
    console.log('%c✅ موقع مبادرة بصمة دعم جاهز ومربوط بقاعدة البيانات سحابياً!', 'color:#F4A261; font-size:16px; font-weight:bold');
});