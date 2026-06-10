// دالة تسجيل الدخول
async function handleMemberLogin(e) {
    e.preventDefault();

    const nationalId = document.getElementById('loginNationalId').value.trim();
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';

    if (nationalId.length !== 14 || isNaN(nationalId)) {
        errorDiv.textContent = "يرجى التأكد من إدخال الرقم القومي المكون من 14 رقماً بشكل صحيح.";
        errorDiv.style.display = 'block';
        return;
    }

    if (!window.supabaseClient) {
        errorDiv.textContent = "جاري تهيئة الاتصال بالسيرفر، برجاء المحاولة بعد ثوانٍ.";
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const { data: member, error } = await window.supabaseClient
            .from('registrations') 
            .select('national_id')
            .eq('national_id', nationalId)
            .maybeSingle(); // استخدام maybeSingle أفضل لمنع الأخطاء الحادة

        if (error || !member) {
            errorDiv.textContent = "هذا الرقم القومي غير مسجل بلوحة البيانات لدينا.";
            errorDiv.style.display = 'block';
            return;
        }

        // حفظ الجلسة بنجاح
        localStorage.setItem('member_national_id', member.national_id);

        // التوجيه لصفحة البروفايل
        window.location.href = `user-profile.html?nid=${member.national_id}`;

    } catch (err) {
        console.error('Login Error:', err);
        errorDiv.textContent = "حدث خطأ غير متوقع أثناء عملية التحقق.";
        errorDiv.style.display = 'block';
    }
}

// 💡 الذكاء الاصطناعي التلقائي: الفحص فور فتح صفحة تسجيل الدخول
document.addEventListener('DOMContentLoaded', () => {
    const loggedInId = localStorage.getItem('member_national_id');
    
    // لو العضو مسجل دخول أصلاً وجاي يفتح الصفحة دي بالغط.. ابعته لبروفايله فوراً!
    if (loggedInId) {
        window.location.href = `user-profile.html?nid=${loggedInId}`;
        return;
    }

    const loginForm = document.getElementById('memberLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleMemberLogin);
    }
});