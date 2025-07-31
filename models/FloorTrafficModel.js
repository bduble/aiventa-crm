// models/FloorTrafficModel.js
import supabase from '../lib/supabaseClient.js';

export default class FloorTrafficModel {
  /**
   * Fetch today's floor-traffic entries, joined with customer info.
   */
  static async findToday() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    // JOIN customer table, get normalized fields
    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .select(`
        *,
        customer:customer_id (
          customer_name, first_name, last_name, email, phone
        )
      `)
      .gte('visit_time', start.toISOString())
      .lt('visit_time', end.toISOString())
      .order('visit_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Insert a new floor-traffic entry.
   * Expects a valid customer_id.
   */
  static async create(entry) {
    // Only include fields that belong in floor_traffic_customers!
    const allowedFields = [
      'customer_id', 'visit_time', 'time_out', 'salesperson', 'vehicle', 'trade', 'demo', 'notes',
      'customer_offer', 'worksheet', 'sold', 'status'
    ];
    const payload = {};
    for (const key of allowedFields) {
      if (entry[key] !== undefined && entry[key] !== null && entry[key] !== '') {
        payload[key] = entry[key];
      }
    }

    // If visit_time is missing, set to now
    if (!payload.visit_time) {
      payload.visit_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .insert([payload])
      .select(`
        *,
        customer:customer_id (
          customer_name, first_name, last_name, email, phone
        )
      `)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing entry and return the updated record.
   */
  static async update(id, fields) {
    const allowedFields = [
      'visit_time', 'time_out', 'salesperson', 'vehicle', 'trade', 'demo', 'notes',
      'customer_offer', 'worksheet', 'sold', 'status'
    ];
    const payload = {};
    for (const key of allowedFields) {
      if (fields[key] !== undefined && fields[key] !== null && fields[key] !== '') {
        payload[key] = fields[key];
      }
    }

    const { data, error } = await supabase
      .from('floor_traffic_customers')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        customer:customer_id (
          customer_name, first_name, last_name, email, phone
        )
      `)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
