import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocjwmpxigmvzovxrmxke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jandtcHhpZ212em92eHJteGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3OTY0MDIsImV4cCI6MjA4NDM3MjQwMn0.WFktWbiGknJcpNRdtO3kLIF0J1e9aTpdvHPhQcKGBho';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
