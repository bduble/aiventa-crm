// models/FloorTrafficModel.js
import supabase from '../lib/supabaseClient.js';

/**
 * Persistence layer for floor-traffic entries.
 * Uses Supabase if credentials are configured, otherwise
 * the underlying supabase client provides stubbed methods
 * that return an error. The router handles any thrown errors.
 */
export default class FloorTrafficModel {
  /**
   * Fetch today's floor-traffic entries ordered by visit time.
   */
  static async findToday() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .select('*')
      .gte('visit_time', start.toISOString())
      .lt('visit_time', end.toISOString())
      .order('visit_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Insert a new floor-traffic entry.
   * Accepts camelCase or snake_case field names and maps them
   * to the Supabase table structure.
   */
  static async create(entry) {
    const payload = { ...entry };

    if (payload.timeIn && !payload.visit_time) {
      payload.visit_time = payload.timeIn;
    }
    if (payload.timeOut && !payload.time_out) {
      payload.time_out = payload.timeOut;
    }
    if (payload.customerName && !payload.customer_name) {
      payload.customer_name = payload.customerName;
    }

    delete payload.timeIn;
    delete payload.timeOut;
    delete payload.customerName;

    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .insert(payload)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing entry and return the updated record.
   */
  static async update(id, fields) {
    const payload = { ...fields };

    if (payload.timeIn) {
      payload.visit_time = payload.timeIn;
      delete payload.timeIn;
    }
    if (payload.timeOut) {
      payload.time_out = payload.timeOut;
      delete payload.timeOut;
    }
    if (payload.customerName) {
      payload.customer_name = payload.customerName;
      delete payload.customerName;
    }

    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .update(payload)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}
