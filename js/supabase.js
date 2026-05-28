/* Shared Supabase client — included after the CDN script tag */
const SUPABASE_URL = 'https://fpexmafogncynubpfzxg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZXhtYWZvZ25jeW51YnBmenhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODg1ODMsImV4cCI6MjA5Mzc2NDU4M30.F02oxpeLsfRqIvVyiKPW0FT1zkL8S9LqCX8RGEK7Ems';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
