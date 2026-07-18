
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    console.log("=== REVISIÓN DE VARIABLES DE ENTORNO ===");
    console.log("SUPABASE_URL:", supabaseUrl ? "Cargada correctamente" : " VACÍA O NO EXISTE");
    console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? " Cargada correctamente" : " VACÍA O NO EXISTE");
    console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceRoleKey ? "Cargada correctamente" : " VACÍA O NO EXISTE");
    console.log("========================================");
    
    throw new Error('El servidor se detuvo porque faltan variables en tu archivo .env');
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = {
  supabaseAnon,
  supabaseService,
};
