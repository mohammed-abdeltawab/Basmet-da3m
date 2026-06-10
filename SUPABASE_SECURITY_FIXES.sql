-- 1. تفعيل الـ RLS على جميع الجداول (هذا الأمر آمن للتكرار ولا يسبب أخطاء)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. سياسات القراءة العامة للجمهور (Public Read Access)
-- ==========================================
DROP POLICY IF EXISTS "Public read access" ON news;
CREATE POLICY "Public read access" ON news FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON courses;
CREATE POLICY "Public read access" ON courses FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON partners;
CREATE POLICY "Public read access" ON partners FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON ambassadors;
CREATE POLICY "Public read access" ON ambassadors FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON achievements;
CREATE POLICY "Public read access" ON achievements FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON org_structure;
CREATE POLICY "Public read access" ON org_structure FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON org_members;
CREATE POLICY "Public read access" ON org_members FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public read access" ON site_settings;
CREATE POLICY "Public read access" ON site_settings FOR SELECT TO public USING (true);

-- ==========================================
-- 3. سياسات تحكم الإدمن الكاملة (Admin Write/Manage Access)
-- ==========================================
DROP POLICY IF EXISTS "Admin write access" ON news;
CREATE POLICY "Admin write access" ON news FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON courses;
CREATE POLICY "Admin write access" ON courses FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON partners;
CREATE POLICY "Admin write access" ON partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON ambassadors;
CREATE POLICY "Admin write access" ON ambassadors FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON achievements;
CREATE POLICY "Admin write access" ON achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON org_structure;
CREATE POLICY "Admin write access" ON org_structure FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON org_members;
CREATE POLICY "Admin write access" ON org_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON site_settings;
CREATE POLICY "Admin write access" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON tasks;
CREATE POLICY "Admin write access" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON chat_messages;
CREATE POLICY "Admin write access" ON chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin write access" ON members;
CREATE POLICY "Admin write access" ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- 4. سياسات نماذج التسجيل وطلبات الانضمام (Forms)
-- ==========================================
DROP POLICY IF EXISTS "Public insert join" ON join_requests;
CREATE POLICY "Public insert join" ON join_requests FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage join" ON join_requests;
CREATE POLICY "Admin manage join" ON join_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert registrations" ON registrations;
CREATE POLICY "Public can insert registrations" ON registrations FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage registrations" ON registrations;
CREATE POLICY "Admin manage registrations" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);