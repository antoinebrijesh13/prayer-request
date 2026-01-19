// Storage service using Supabase
import { supabase } from './supabase';

export const saveRequest = async (request) => {
  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([{
        name: request.name,
        request: request.request,
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving request:', error);
    throw error;
  }
};

export const loadRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading requests:', error);
    return [];
  }
};

export const deleteRequest = async (id) => {
  try {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

export const clearRequests = async () => {
  try {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .neq('id', 0); // Delete all
    
    if (error) throw error;
  } catch (error) {
    console.error('Error clearing requests:', error);
    throw error;
  }
};
