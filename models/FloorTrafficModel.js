// models/FloorTrafficModel.js
let logs = [];

/**
 * A very basic in-memory model.
 * In production you’d swap this out for a real DB/ORM.
 */
export default class FloorTrafficModel {
  /**
   * Returns all logs for “today.”
   * Here we ignore the date and just return everything.
   */
  static async findToday() {
    // You could filter by entry.date if you store one:
    return logs;
  }

  /**
   * Creates a new log entry.
   * Assigns it a simple incremental `id`.
   */
  static async create(entry) {
    const newLog = {
      id: logs.length + 1,
      ...entry,
      createdAt: new Date().toISOString()
    };
    logs.push(newLog);
    return newLog;
  }

  /**
   * Update an existing log entry by id.
   * Returns the updated log or null if not found.
   */
  static async update(id, fields) {
    const index = logs.findIndex(l => l.id === Number(id));
    if (index === -1) return null;
    logs[index] = { ...logs[index], ...fields };
    return logs[index];
  }
}
