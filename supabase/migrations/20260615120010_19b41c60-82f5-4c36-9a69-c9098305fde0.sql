
CREATE POLICY "giveaway-media public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'giveaway-media');
CREATE POLICY "giveaway-media auth upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'giveaway-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "giveaway-media owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'giveaway-media' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "giveaway-media owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'giveaway-media' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "giveaway-media admin upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'giveaway-media' AND public.has_role(auth.uid(),'admin'));
