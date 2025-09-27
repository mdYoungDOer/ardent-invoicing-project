-- Supabase Storage and Real-time Configuration
-- Run this script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Storage files metadata table
CREATE TABLE IF NOT EXISTS public.storage_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    bucket TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaboration sessions
CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_files_tenant_id ON public.storage_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_user_id ON public.storage_files(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_bucket ON public.storage_files(bucket);
CREATE INDEX IF NOT EXISTS idx_storage_files_created_at ON public.storage_files(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_id ON public.activity_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON public.activity_log(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_document ON public.collaboration_sessions(document_id, document_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user_id ON public.collaboration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_tenant_id ON public.collaboration_sessions(tenant_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Storage files policies
CREATE POLICY "Users can view their own files" ON public.storage_files
    FOR SELECT USING (
        user_id = auth.uid() OR 
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own files" ON public.storage_files
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own files" ON public.storage_files
    FOR UPDATE USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own files" ON public.storage_files
    FOR DELETE USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Super admin policies for storage files
CREATE POLICY "Super admins can view all files" ON public.storage_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super'
        )
    );

CREATE POLICY "Super admins can delete all files" ON public.storage_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Super admin policies for notifications
CREATE POLICY "Super admins can view all notifications" ON public.notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super'
        )
    );

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON public.activity_log
    FOR SELECT USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert activity logs" ON public.activity_log
    FOR INSERT WITH CHECK (true);

-- Super admin policies for activity log
CREATE POLICY "Super admins can view all activity" ON public.activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'super'
        )
    );

-- Collaboration sessions policies
CREATE POLICY "Users can view their own collaboration sessions" ON public.collaboration_sessions
    FOR SELECT USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own collaboration sessions" ON public.collaboration_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        tenant_id IN (
            SELECT tenant_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_storage_files_updated_at 
    BEFORE UPDATE ON public.storage_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activity_log (
        user_id,
        tenant_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        auth.uid(),
        (SELECT tenant_id FROM public.users WHERE id = auth.uid()),
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_user_id UUID,
    p_tenant_id UUID DEFAULT NULL,
    p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        title,
        message,
        type,
        user_id,
        tenant_id,
        data
    ) VALUES (
        p_title,
        p_message,
        p_type,
        p_user_id,
        p_tenant_id,
        p_data
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage buckets (this needs to be done via Supabase Dashboard or API)
-- The following is a reference for what buckets should be created:

/*
Storage Buckets to Create:
1. receipts - For expense receipts
2. invoices - For invoice PDFs
3. business-logos - For business logos
4. user-avatars - For user profile pictures
5. documents - For general documents
6. exports - For exported files

Bucket Policies (set via Supabase Dashboard):
- receipts: Authenticated users can upload/read files in their tenant folder
- invoices: Authenticated users can upload/read files in their tenant folder
- business-logos: Authenticated users can upload/read files in their tenant folder
- user-avatars: Authenticated users can upload/read their own avatar
- documents: Authenticated users can upload/read files in their tenant folder
- exports: Authenticated users can upload/read files in their tenant folder
*/

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.storage_files TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.activity_log TO authenticated;
GRANT ALL ON public.collaboration_sessions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_activity(TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(TEXT, TEXT, TEXT, UUID, UUID, JSONB) TO authenticated;
