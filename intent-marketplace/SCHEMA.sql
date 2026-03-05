-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for extracted intents
CREATE TABLE IF NOT EXISTS intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_text TEXT NOT NULL,
    intent_summary TEXT NOT NULL,
    entities JSONB DEFAULT '[]'::jsonb,
    possible_actions JSONB DEFAULT '[]'::jsonb,
    confidence FLOAT DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for agents
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    capabilities JSONB DEFAULT '[]'::jsonb,
    embedding vector(384), -- 384 dimensions matching our deterministic mock vector length
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for execution logs
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent_id UUID REFERENCES intents(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(agent_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
    result_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Agents
INSERT INTO agents (name, description, capabilities) VALUES 
('Calendar Agent', 'Schedules meetings, manages calendar events, and checks availability.', '["create_event", "check_availability"]'),
('Email Agent', 'Drafts professional emails, organizes inboxes, and filters spam.', '["draft_email", "send_email"]'),
('Task Agent', 'Creates to-do lists, manages project tasks, and sets deadlines.', '["create_task", "set_reminder"]');
