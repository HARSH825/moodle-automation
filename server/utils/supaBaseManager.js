import supabase from '../config/supabaseClient.js';

export async function getJsonFromSupabase(fileName) {
    try {
        const { data, error } = await supabase.storage
            .from('assignmentsjson')
            .download(fileName);
        
        if (error) {
            console.error(`Error downloading ${fileName}:`, error.message);
            return { data: null, error: error.message };
        }
        
        const text = await data.text();
        const jsonData = JSON.parse(text);
        
        console.log(` Successfully retrieved ${fileName}`);
        return { data: jsonData, error: null };
        
    } catch (error) {
        console.error(`Error parsing ${fileName}:`, error.message);
        return { data: null, error: error.message };
    }
}

export async function saveJsonToSupabase(fileName, jsonData) {
    try {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        const { data, error } = await supabase.storage
            .from('assignmentsjson')
            .upload(fileName, blob, { 
                upsert: true,
                contentType: 'application/json'
            });
        
        if (error) {
            console.error(`Error uploading ${fileName}:`, error.message);
            return { success: false, error: error.message };
        }
        
        console.log(` Successfully saved ${fileName}`);
        return { success: true, data };
        
    } catch (error) {
        console.error(`Error saving ${fileName}:`, error.message);
        return { success: false, error: error.message };
    }
}

export async function doesFileExist(fileName, bucket = 'assignmentsjson') {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .list('', { search: fileName });
        
        if (error) {
            console.error(`Error checking file ${fileName}:`, error.message);
            return false;
        }
        
        return data && data.length > 0;
        
    } catch (error) {
        console.error(`Error checking file existence ${fileName}:`, error.message);
        return false;
    }
}

export async function deleteFileFromSupabase(fileName, bucket = 'assignmentsjson') {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);
        
        if (error) {
            console.error(`Error deleting ${fileName}:`, error.message);
            return false;
        }
        
        console.log(` Successfully deleted ${fileName}`);
        return true;
        
    } catch (error) {
        console.error(`Error deleting ${fileName}:`, error.message);
        return false;
    }
}
