// models/UserModel.js
import { createClient } from '@supabase/supabase-js';

// Set your Supabase project credentials here or use environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,   // Example: 'https://xyzcompany.supabase.co'
  process.env.SUPABASE_KEY    // Example: 'public-anon-key'
);

export default class UserModel {
  // Fetch all users from the Supabase users table
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('inserted_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Fetch a user by their UUID id
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)    // Don't use parseInt; UUIDs are strings
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // Create a new user in Supabase
  static async create(data) {
    const { data: inserted, error } = await supabase
      .from('users')
      .insert([data])
      .select()
      .maybeSingle();
    if (error) throw error;
    return inserted;
  }

  // Update an existing user in Supabase
  static async update(id, data) {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return updated;
  }

  // Delete a user by UUID
  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}
