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
}
