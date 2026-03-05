/**
 * Mock database logger for action tracking.
 */
export async function logAction(data: {
  intent_id: string;
  agent_name: string;
  intent_summary: string;
  action_status: string;
  confidence: number;
}) {
  const logEntry = {
    ...data,
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substring(7),
  };

  // In a real app, this would be a database call like:
  // await db.actionLogs.create({ data: logEntry });
  
  console.log("[DB Log] Action logged successfully:", JSON.stringify(logEntry, null, 2));
  return logEntry;
}
