
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nkyutlawmvsvxuffvjnw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXV0bGF3bXZzdnh1ZmZ2am53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwODE4MzUsImV4cCI6MjA2MDY1NzgzNX0.HXS2Dk0qohvq8EzVII6nXWzpeB0YgIq5VorhVkUuA90'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
