//URL 
const supabaseUrl = "https://evzmdvjiajdikrsznhiw.supabase.co/rest/v1/"
//Public key
const supabasekey = "sb_publishable_aiDGCpbVr_9atNc2WIzUCw_z_T6Cuwg"

const supabaseClient = supabase.createClient(supabaseUrl,supabasekey);

console.log("base de datos conectada (Supabase)")
