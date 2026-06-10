function escapeHtml(str) {
    if (!str) return '-';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadUserProfile() {
    // 1. جلب الرقم القومي المخزن في المتصفح أولاً
    const loggedInNationalId = localStorage.getItem('member_national_id');

    // 2. حماية: لو الـ localStorage فاضي تماماً.. يبقى الشخص ده مش مسجل دخول اصلاً، نبعته لصفحة الدخول
    if (!loggedInNationalId) {
        window.location.href = 'member-login.html'; // يفضل توجيهه لصفحة الدخول مباشرة
        return;
    }

    if (!window.supabaseClient) {
        setTimeout(loadUserProfile, 100);
        return;
    }

    // 3. قراءة الرابط فوق لمعرفة الـ ID المطلوب
    const urlParams = new URLSearchParams(window.location.search);
    let nationalId = urlParams.get('nid');

    // 💡 التعديل السحري: لو الرابط مفيش فيه ?nid= خذ القيمة تلقائياً من الـ localStorage
    if (!nationalId) {
        nationalId = loggedInNationalId;
    }

    try {
        // جلب البيانات من جدول registrations
        const { data: item, error } = await window.supabaseClient
            .from('registrations') 
            .select('*')
            .eq('national_id', nationalId)
            .maybeSingle();

        if (error || !item) {
            console.error('خطأ في جلب البيانات:', error);
            document.getElementById('loadingMessage').innerHTML = `
                <i class="fas fa-user-slash" style="color:#666; font-size:2rem;"></i>
                <p style="margin-top:10px;">لم يتم العثور على بيانات بهذا الرقم القومي.</p>
            `;
            return;
        }

        // عرض البيانات في الـ HTML
        document.getElementById('userNameAr').textContent = escapeHtml(item.name_ar);
        document.getElementById('userNameEn').textContent = escapeHtml(item.name_en || '-');
        document.getElementById('userNationalId').textContent = escapeHtml(item.national_id);
        document.getElementById('userGovernorate').textContent = escapeHtml(item.governorate || '-');
        document.getElementById('userNationality').textContent = escapeHtml(item.nationality || '-');
        document.getElementById('userAddress').textContent = escapeHtml(item.address || '-');
        document.getElementById('userStatusWork').textContent = escapeHtml(item.status_work || '-');
        document.getElementById('userExperience').textContent = escapeHtml(item.experience || '-');
        document.getElementById('userCourses').textContent = escapeHtml(item.courses || '-');
        document.getElementById('userCreatedAt').textContent = formatDate(item.created_at);

        if (item.whatsapp) {
            const cleanWhatsapp = escapeHtml(item.whatsapp);
            document.getElementById('userWhatsapp').innerHTML = `
                <a href="https://wa.me/${cleanWhatsapp}" target="_blank">
                    <i class="fab fa-whatsapp"></i> ${cleanWhatsapp}
                </a>
            `;
        }

        // المهارات
        const skillsContainer = document.getElementById('userSkills');
        skillsContainer.innerHTML = '';
        let skillsArray = Array.isArray(item.skills) ? item.skills : (item.skills ? item.skills.split(/،|,/) : []);

        if (skillsArray.length > 0 && skillsArray[0] !== '') {
            skillsArray.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = escapeHtml(skill.trim());
                skillsContainer.appendChild(span);
            });
        } else {
            skillsContainer.innerHTML = '<span style="color:#666;">لا يوجد مهارات محددة</span>';
        }

        // إخفاء شاشة التحميل وإظهار البيانات
        document.getElementById('loadingMessage').classList.add('hidden');
        document.getElementById('profileContent').classList.remove('hidden');

    } catch (err) {
        console.error('Error:', err);
        document.getElementById('loadingMessage').textContent = 'حدث خطأ تقني أثناء معالجة البيانات.';
    }
}

document.addEventListener('DOMContentLoaded', loadUserProfile);