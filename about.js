// ====================== about.js ======================

document.addEventListener('DOMContentLoaded', async () => {
    // التأكد من وجود الاتصال بـ Supabase
    if (!window.supabaseClient) {
        console.warn('Supabase Client غير متصل');
        return;
    }

    try {
        // جلب البيانات من جدول site_settings
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('key, value');

        if (error) throw error;

        // تحويل البيانات لـ Object لسهولة الاستخدام
        const settings = {};
        data.forEach(item => settings[item.key] = item.value);

        // -- تحديث نصوص من نحن، الرؤية، والرسالة --
        // استخدمنا textContent هنا عشان لو حبيت تنسق النص من القاعدة (مثلاً تستخدم <strong> أو <br>)
        if (settings.about_text && settings.about_text !== 'EMPTY') {
            const aboutEl = document.getElementById('aboutText');
            if (aboutEl) aboutEl.textContent = settings.about_text;
        }

        if (settings.vision_text && settings.vision_text !== 'EMPTY') {
            const visionEl = document.getElementById('visionText');
            if (visionEl) visionEl.textContent = settings.vision_text;
        }

        if (settings.mission_text && settings.mission_text !== 'EMPTY') {
            const missionEl = document.getElementById('missionText');
            if (missionEl) missionEl.textContent = settings.mission_text;
        }

        // -- تحديث الفوتر وبيانات التواصل --
        if (settings.footer_tagline && settings.footer_tagline !== 'EMPTY') {
            const taglineEl = document.getElementById('footerTagline');
            if (taglineEl) taglineEl.textContent = settings.footer_tagline;
        }

        if (settings.contact_email && settings.contact_email !== 'EMPTY') {
            const emailEl = document.getElementById('footerEmail');
            if (emailEl) emailEl.textContent = settings.contact_email;
        }

        if (settings.contact_whatsapp && settings.contact_whatsapp !== 'EMPTY') {
            const whatsappEl = document.getElementById('footerWhatsapp');
            if (whatsappEl) whatsappEl.textContent = settings.contact_whatsapp;
        }

        if (settings.contact_instagram && settings.contact_instagram !== 'EMPTY') {
            const instaEl = document.getElementById('footerInstagram');
            if (instaEl) instaEl.textContent = settings.contact_instagram;
        }

    } catch (e) {
        console.error('خطأ في تحميل إعدادات صفحة من نحن:', e);
    }
});