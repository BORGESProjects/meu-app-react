-- O acervo extraído é privado. A interface cria URLs temporárias somente
-- para usuários que já entraram na própria conta do app.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'acervo_extraido_authenticated_read'
    ) THEN
        CREATE POLICY acervo_extraido_authenticated_read
            ON storage.objects
            FOR SELECT
            TO authenticated
            USING (bucket_id = 'acervo-extraido');
    END IF;
END $$;
