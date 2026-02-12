
const { createClient } = require('@supabase/supabase-js');
// specific dotenv removed
// Or manually load

const supabaseUrl = 'https://bskziecpvseftxryidzp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza3ppZWNwdnNlZnR4cnlpZHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODY5MjAsImV4cCI6MjA4NTk2MjkyMH0.yZJcKkxihCfft5C22lqj7JK2bU7jPo-kvbITCVQhkCQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    console.log('Testing Supabase connection...');

    try {
        // 1. Check Auth service availability
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.error('Auth Check Failed:', authError.message);
        } else {
            console.log('Auth Check Passed: Service is reachable.');
        }

        // 2. Check Database availability (even if table doesn't exist, we get a response)
        const { data, error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });

        if (error) {
            // If table doesn't exist, it's code 404 or a specific PG error, but it means we connected!
            // If connection failed, it's a FetchError or similar.
            if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.code === '42P01') {
                console.log('Database Connection Passed: Connected to PostgREST (Table "bookings" not found, but service reachable).');
            } else {
                console.log(`Database Check: Received response (likely connected): ${error.message} (Code: ${error.code})`);
            }
        } else {
            console.log('Database Connection Passed: "bookings" table accessed successfully.');
        }

    } catch (err) {
        console.error('Unexpected Error during connection test:', err);
    }
}

checkConnection();
